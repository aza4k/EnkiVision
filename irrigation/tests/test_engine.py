"""
Unit tests for the IrrigationEngine.
"""

from django.test import TestCase
from irrigation.engine import IrrigationEngine


class TestKcLookup(TestCase):
    """Test crop coefficient lookups."""

    def setUp(self):
        self.engine = IrrigationEngine()

    def test_cotton_flowering(self):
        self.assertEqual(self.engine.get_kc('cotton', 'flowering'), 1.15)

    def test_wheat_seedling(self):
        self.assertEqual(self.engine.get_kc('wheat', 'seedling'), 0.30)

    def test_rice_vegetative(self):
        self.assertEqual(self.engine.get_kc('rice', 'vegetative'), 1.15)

    def test_unknown_crop_defaults(self):
        kc = self.engine.get_kc('pineapple', 'vegetative')
        self.assertEqual(kc, 0.75)

    def test_unknown_stage_defaults(self):
        kc = self.engine.get_kc('cotton', 'nonexistent_stage')
        self.assertEqual(kc, 0.75)


class TestET0Estimation(TestCase):
    """Test reference evapotranspiration estimation."""

    def setUp(self):
        self.engine = IrrigationEngine()

    def test_hot_dry(self):
        et0 = self.engine.estimate_et0(42, 28, 25)
        self.assertGreaterEqual(et0, 8.0)
        self.assertLessEqual(et0, 10.0)

    def test_warm_moderate(self):
        et0 = self.engine.estimate_et0(32, 20, 45)
        self.assertGreaterEqual(et0, 5.0)
        self.assertLessEqual(et0, 7.0)

    def test_mild(self):
        et0 = self.engine.estimate_et0(22, 12, 50)
        self.assertGreaterEqual(et0, 3.0)
        self.assertLessEqual(et0, 5.0)

    def test_cool(self):
        et0 = self.engine.estimate_et0(10, 2, 60)
        self.assertGreaterEqual(et0, 1.0)
        self.assertLessEqual(et0, 3.0)


class TestAdjustments(TestCase):
    """Test adjustment factors."""

    def setUp(self):
        self.engine = IrrigationEngine()

    def test_rain_deduction(self):
        result = self.engine.apply_adjustments(10.0, {
            'weather_today': {'rainfall_mm': 8},
            'soil_moisture_percent': 50,
            'satellite_ndvi': 0.5,
        })
        self.assertLess(result['adjusted_mm'], 10.0)

    def test_high_soil_moisture_reduces(self):
        result = self.engine.apply_adjustments(10.0, {
            'weather_today': {},
            'soil_moisture_percent': 80,
            'satellite_ndvi': 0.5,
        })
        self.assertLess(result['adjusted_mm'], 10.0)

    def test_low_soil_moisture_increases(self):
        result = self.engine.apply_adjustments(10.0, {
            'weather_today': {},
            'soil_moisture_percent': 20,
            'satellite_ndvi': 0.5,
        })
        self.assertGreater(result['adjusted_mm'], 10.0)

    def test_low_ndvi_generates_alert(self):
        result = self.engine.apply_adjustments(10.0, {
            'weather_today': {},
            'soil_moisture_percent': 50,
            'satellite_ndvi': 0.2,
        })
        alert_types = [a['type'] for a in result['alerts']]
        self.assertIn('drought_risk', alert_types)

    def test_sandy_soil_increases(self):
        result = self.engine.apply_adjustments(10.0, {
            'weather_today': {},
            'soil_moisture_percent': 50,
            'satellite_ndvi': 0.5,
            'soil_type': 'sandy',
        })
        self.assertGreater(result['adjusted_mm'], 10.0)

    def test_critical_water_pressure_halves(self):
        result = self.engine.apply_adjustments(10.0, {
            'weather_today': {},
            'soil_moisture_percent': 50,
            'satellite_ndvi': 0.5,
            'water_source_pressure': 'critical',
        })
        self.assertAlmostEqual(result['adjusted_mm'], 5.0, places=0)
        alert_types = [a['type'] for a in result['alerts']]
        self.assertIn('data_gap', alert_types)


class TestEfficiency(TestCase):
    """Test irrigation system efficiency calculations."""

    def setUp(self):
        self.engine = IrrigationEngine()

    def test_drip_efficiency(self):
        result = self.engine.apply_efficiency(9.0, 'drip')
        self.assertAlmostEqual(result, 10.0, places=1)

    def test_flood_efficiency(self):
        result = self.engine.apply_efficiency(5.5, 'flood')
        self.assertAlmostEqual(result, 10.0, places=1)

    def test_sprinkler_efficiency(self):
        result = self.engine.apply_efficiency(7.5, 'sprinkler')
        self.assertAlmostEqual(result, 10.0, places=1)


class TestFullPipeline(TestCase):
    """Test the full recommendation pipeline."""

    def setUp(self):
        self.engine = IrrigationEngine()
        self.payload = {
            'field_id': 'UZ-TEST-001',
            'field_name': 'Test Field',
            'area_hectares': 10.0,
            'crop_type': 'cotton',
            'crop_growth_stage': 'flowering',
            'satellite_ndvi': 0.65,
            'satellite_evi': 0.45,
            'soil_moisture_percent': 45,
            'soil_type': 'loamy',
            'weather_today': {
                'temperature_max_c': 38,
                'temperature_min_c': 22,
                'humidity_percent': 30,
                'wind_speed_kmh': 15,
                'rainfall_mm': 0,
                'forecast_rain_3days_mm': 4,
            },
            'historical_avg_water_mm': 35,
            'region': 'Fergana',
            'season': 'summer',
            'irrigation_system': 'drip',
            'water_source_pressure': 'normal',
        }

    def test_returns_all_required_keys(self):
        result = self.engine.generate_recommendation(self.payload)
        required_keys = [
            'field_id', 'analysis_date', 'recommendation_level',
            'water_recommendation', 'field_health', 'alerts',
            'farmer_sms_message', 'admin_insight', 'heatmap_value',
            'next_irrigation_forecast', 'reasoning_trace',
        ]
        for key in required_keys:
            self.assertIn(key, result, f'Missing key: {key}')

    def test_water_recommendation_keys(self):
        result = self.engine.generate_recommendation(self.payload)
        wr = result['water_recommendation']
        for key in ['irrigate_today', 'amount_mm', 'amount_liters_per_hectare',
                     'total_liters_field', 'best_irrigation_time']:
            self.assertIn(key, wr, f'Missing water_recommendation key: {key}')

    def test_amount_rounded_to_5(self):
        result = self.engine.generate_recommendation(self.payload)
        self.assertEqual(result['water_recommendation']['amount_mm'] % 5, 0)

    def test_no_irrigation_midday(self):
        result = self.engine.generate_recommendation(self.payload)
        time_str = result['water_recommendation']['best_irrigation_time']
        # Should not contain hours between 11 and 16
        self.assertNotIn('11:', time_str)
        self.assertNotIn('12:', time_str)
        self.assertNotIn('13:', time_str)

    def test_reasoning_trace_present(self):
        result = self.engine.generate_recommendation(self.payload)
        self.assertTrue(len(result['reasoning_trace']) > 20)
        self.assertIn('ET0=', result['reasoning_trace'])
        self.assertIn('Kc=', result['reasoning_trace'])

    def test_sms_messages(self):
        result = self.engine.generate_recommendation(self.payload)
        self.assertIn('uz', result['farmer_sms_message'])
        self.assertIn('ru', result['farmer_sms_message'])

    def test_forecast_has_3_days(self):
        result = self.engine.generate_recommendation(self.payload)
        self.assertEqual(len(result['next_irrigation_forecast']), 3)

    def test_heatmap_value_range(self):
        result = self.engine.generate_recommendation(self.payload)
        self.assertGreaterEqual(result['heatmap_value'], 0.0)
        self.assertLessEqual(result['heatmap_value'], 1.0)

    def test_rice_minimum_enforced(self):
        """Rice should never get less than Kc × ET0 × 0.9 regardless of adjustments."""
        payload = self.payload.copy()
        payload['crop_type'] = 'rice'
        payload['soil_moisture_percent'] = 80  # High moisture would normally reduce
        payload['satellite_ndvi'] = 0.8
        payload['weather_today'] = {
            'temperature_max_c': 38, 'temperature_min_c': 22,
            'humidity_percent': 30, 'rainfall_mm': 10,
            'forecast_rain_3days_mm': 15,
        }
        result = self.engine.generate_recommendation(payload)
        self.assertTrue(result['water_recommendation']['irrigate_today'])


class TestBatchProcessing(TestCase):
    """Test batch mode."""

    def setUp(self):
        self.engine = IrrigationEngine()

    def test_batch_returns_summary(self):
        payloads = [
            {
                'field_id': f'UZ-TEST-{i:03d}',
                'field_name': f'Test {i}',
                'area_hectares': 10,
                'crop_type': 'cotton',
                'crop_growth_stage': 'flowering',
                'soil_moisture_percent': 40,
                'satellite_ndvi': 0.5,
                'weather_today': {'temperature_max_c': 36, 'temperature_min_c': 20, 'humidity_percent': 30},
                'irrigation_system': 'drip',
                'region': 'Fergana',
                'season': 'summer',
            }
            for i in range(3)
        ]
        result = self.engine.process_batch(payloads)
        self.assertIn('batch_summary', result)
        self.assertEqual(result['batch_summary']['total_fields'], 3)
        self.assertEqual(len(result['results']), 3)
