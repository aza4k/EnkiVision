"""
Seed demo data for the AgroWater dashboard.

Usage: python manage.py seed_demo
"""

import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand

from fields.models import Field, SoilSensor
from weather.models import WeatherData
from irrigation.models import IrrigationRecord
from irrigation.engine import IrrigationEngine


DEMO_FIELDS = [
    {
        'field_id': 'UZ-FRG-001',
        'name': "Farg'ona-1 dalasi",
        'area_hectares': 12.5,
        'region': 'Fergana',
        'crop_type': 'cotton',
        'crop_growth_stage': 'flowering',
        'soil_type': 'loamy',
        'irrigation_system': 'drip',
        'latitude': 40.3842,
        'longitude': 71.7893,
        'satellite_ndvi': 0.72,
        'satellite_evi': 0.55,
    },
    {
        'field_id': 'UZ-FRG-002',
        'name': "Farg'ona-2 bug'doy",
        'area_hectares': 8.0,
        'region': 'Fergana',
        'crop_type': 'wheat',
        'crop_growth_stage': 'ripening',
        'soil_type': 'clay',
        'irrigation_system': 'furrow',
        'latitude': 40.3910,
        'longitude': 71.8012,
        'satellite_ndvi': 0.58,
        'satellite_evi': 0.42,
    },
    {
        'field_id': 'UZ-TSH-003',
        'name': 'Toshkent-3 sabzavot',
        'area_hectares': 5.5,
        'region': 'Tashkent',
        'crop_type': 'vegetables',
        'crop_growth_stage': 'vegetative',
        'soil_type': 'loamy',
        'irrigation_system': 'drip',
        'latitude': 41.2995,
        'longitude': 69.2401,
        'satellite_ndvi': 0.65,
        'satellite_evi': 0.48,
    },
    {
        'field_id': 'UZ-BHR-004',
        'name': 'Buxoro-4 paxta',
        'area_hectares': 20.0,
        'region': 'Bukhara',
        'crop_type': 'cotton',
        'crop_growth_stage': 'vegetative',
        'soil_type': 'sandy',
        'irrigation_system': 'flood',
        'latitude': 39.7680,
        'longitude': 64.4210,
        'satellite_ndvi': 0.38,
        'satellite_evi': 0.28,
    },
    {
        'field_id': 'UZ-SMR-005',
        'name': "Samarqand-5 jo'xori",
        'area_hectares': 15.0,
        'region': 'Samarkand',
        'crop_type': 'corn',
        'crop_growth_stage': 'flowering',
        'soil_type': 'loamy',
        'irrigation_system': 'sprinkler',
        'latitude': 39.6542,
        'longitude': 66.9597,
        'satellite_ndvi': 0.70,
        'satellite_evi': 0.52,
    },
    {
        'field_id': 'UZ-KHZ-006',
        'name': 'Xorazm-6 sholi',
        'area_hectares': 10.0,
        'region': 'Khorezm',
        'crop_type': 'rice',
        'crop_growth_stage': 'vegetative',
        'soil_type': 'clay',
        'irrigation_system': 'flood',
        'latitude': 41.5530,
        'longitude': 60.6317,
        'satellite_ndvi': 0.55,
        'satellite_evi': 0.40,
    },
    {
        'field_id': 'UZ-BHR-007',
        'name': 'Buxoro-7 paxta (quruq)',
        'area_hectares': 18.0,
        'region': 'Bukhara',
        'crop_type': 'cotton',
        'crop_growth_stage': 'seedling',
        'soil_type': 'sandy',
        'irrigation_system': 'furrow',
        'latitude': 39.8012,
        'longitude': 64.3850,
        'satellite_ndvi': 0.22,
        'satellite_evi': 0.15,
        'water_source_pressure': 'critical',
    },
    {
        'field_id': 'UZ-AND-008',
        'name': "Andijon-8 bug'doy",
        'area_hectares': 7.0,
        'region': 'Andijan',
        'crop_type': 'wheat',
        'crop_growth_stage': 'flowering',
        'soil_type': 'silty',
        'irrigation_system': 'sprinkler',
        'latitude': 40.7821,
        'longitude': 72.3442,
        'satellite_ndvi': 0.68,
        'satellite_evi': 0.50,
    },
    {
        'field_id': 'UZ-NMN-009',
        'name': 'Namangan-9 sabzavot',
        'area_hectares': 4.0,
        'region': 'Namangan',
        'crop_type': 'vegetables',
        'crop_growth_stage': 'flowering',
        'soil_type': 'loamy',
        'irrigation_system': 'drip',
        'latitude': 41.0010,
        'longitude': 71.6726,
        'satellite_ndvi': 0.75,
        'satellite_evi': 0.58,
    },
    {
        'field_id': 'UZ-KSH-010',
        'name': "Qashqadaryo-10 jo'xori",
        'area_hectares': 22.0,
        'region': 'Kashkadarya',
        'crop_type': 'corn',
        'crop_growth_stage': 'vegetative',
        'soil_type': 'loamy',
        'irrigation_system': 'furrow',
        'latitude': 38.8600,
        'longitude': 65.8000,
        'satellite_ndvi': 0.45,
        'satellite_evi': 0.33,
    },
]


class Command(BaseCommand):
    help = 'Seed demo fields, weather, sensors, and run irrigation engine'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('[SEED] Seeding AgroWater demo data...'))

        engine = IrrigationEngine()
        today = date.today()

        for fd in DEMO_FIELDS:
            field, created = Field.objects.update_or_create(
                field_id=fd['field_id'],
                defaults={
                    'name': fd['name'],
                    'area_hectares': fd['area_hectares'],
                    'region': fd['region'],
                    'crop_type': fd['crop_type'],
                    'crop_growth_stage': fd['crop_growth_stage'],
                    'soil_type': fd['soil_type'],
                    'irrigation_system': fd['irrigation_system'],
                    'latitude': fd['latitude'],
                    'longitude': fd['longitude'],
                    'satellite_ndvi': fd['satellite_ndvi'],
                    'satellite_evi': fd.get('satellite_evi', 0.4),
                    'satellite_data_date': today,
                    'water_source_pressure': fd.get('water_source_pressure', 'normal'),
                    'is_active': True,
                },
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'  {action}: {field}')

            # Create weather data
            temp_max = random.uniform(28, 42)
            temp_min = temp_max - random.uniform(8, 15)
            humidity = random.uniform(20, 60)
            rainfall = random.choice([0, 0, 0, 0, 2, 5, 8, 12])

            weather, _ = WeatherData.objects.update_or_create(
                field=field,
                date=today,
                defaults={
                    'temperature_max_c': round(temp_max, 1),
                    'temperature_min_c': round(temp_min, 1),
                    'humidity_percent': round(humidity, 1),
                    'wind_speed_kmh': round(random.uniform(5, 25), 1),
                    'rainfall_mm': rainfall,
                    'forecast_rain_3days_mm': random.choice([0, 0, 3, 6, 12]),
                },
            )

            # Create soil sensor reading
            moisture = random.uniform(15, 75)
            SoilSensor.objects.create(
                field=field,
                moisture_percent=round(moisture, 1),
                temperature=round(temp_max - random.uniform(3, 8), 1),
            )

            # Create an irrigation record from yesterday
            IrrigationRecord.objects.get_or_create(
                field=field,
                date=today - timedelta(days=1),
                defaults={
                    'amount_mm': random.randint(15, 45),
                    'method': fd['irrigation_system'],
                },
            )

            # Run the engine to generate a recommendation
            payload = {
                'field_id': fd['field_id'],
                'field_name': fd['name'],
                'area_hectares': fd['area_hectares'],
                'crop_type': fd['crop_type'],
                'crop_growth_stage': fd['crop_growth_stage'],
                'satellite_ndvi': fd['satellite_ndvi'],
                'satellite_evi': fd.get('satellite_evi', 0.4),
                'soil_moisture_percent': moisture,
                'soil_type': fd['soil_type'],
                'weather_today': {
                    'temperature_max_c': weather.temperature_max_c,
                    'temperature_min_c': weather.temperature_min_c,
                    'humidity_percent': weather.humidity_percent,
                    'wind_speed_kmh': weather.wind_speed_kmh,
                    'rainfall_mm': weather.rainfall_mm,
                    'forecast_rain_3days_mm': weather.forecast_rain_3days_mm,
                },
                'historical_avg_water_mm': 35,
                'region': fd['region'],
                'season': 'summer',
                'irrigation_system': fd['irrigation_system'],
                'water_source_pressure': fd.get('water_source_pressure', 'normal'),
            }

            rec = engine.generate_recommendation(payload)

            from irrigation.models import IrrigationRecommendation
            IrrigationRecommendation.objects.update_or_create(
                field=field,
                date=today,
                defaults={
                    'recommendation_level': rec['recommendation_level'],
                    'amount_mm': rec['water_recommendation']['amount_mm'],
                    'irrigate_today': rec['water_recommendation']['irrigate_today'],
                    'heatmap_value': rec['heatmap_value'],
                    'recommendation_json': rec,
                },
            )

            # Persist alerts
            from notifications.models import Alert
            for alert_data in rec.get('alerts', []):
                Alert.objects.create(
                    field=field,
                    alert_type=alert_data.get('type', 'data_gap'),
                    severity=alert_data.get('severity', 'info'),
                    message=alert_data.get('message', ''),
                    action_required=alert_data.get('action_required', False),
                )

        self.stdout.write(self.style.SUCCESS(
            f'[OK] Seeded {len(DEMO_FIELDS)} fields with weather, sensors, and recommendations!'
        ))
