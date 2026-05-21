"""
AgroWater Irrigation Calculation Engine
========================================

Pure-Python engine implementing FAO Penman-Monteith simplified logic
for calculating precise irrigation recommendations in Central Asian
farming conditions.

No Django ORM dependencies — fully testable in isolation.
"""

import math
from datetime import date, datetime, timedelta


class IrrigationEngine:
    """Core irrigation recommendation engine."""

    # ── Crop Coefficients (Kc) by crop type and growth stage ────────

    KC_TABLE = {
        'cotton': {
            'seedling': 0.35, 'vegetative': 0.75,
            'flowering': 1.15, 'ripening': 0.90, 'harvest': 0.60,
        },
        'wheat': {
            'seedling': 0.30, 'vegetative': 0.70,
            'flowering': 1.10, 'ripening': 0.65, 'harvest': 0.40,
        },
        'corn': {
            'seedling': 0.40, 'vegetative': 0.80,
            'flowering': 1.20, 'ripening': 0.95, 'harvest': 0.60,
        },
        'vegetables': {
            'seedling': 0.60, 'vegetative': 0.80,
            'flowering': 1.05, 'ripening': 0.90, 'harvest': 0.70,
        },
        'rice': {
            'seedling': 1.05, 'vegetative': 1.15,
            'flowering': 1.25, 'ripening': 1.10, 'harvest': 0.95,
        },
        'other': {
            'seedling': 0.50, 'vegetative': 0.75,
            'flowering': 1.00, 'ripening': 0.80, 'harvest': 0.55,
        },
    }

    # ── Irrigation System Efficiency ────────────────────────────────

    EFFICIENCY = {
        'drip': 0.90,
        'sprinkler': 0.75,
        'furrow': 0.55,
        'flood': 0.55,
    }

    # ── Hot summer regions that get +5% correction ──────────────────
    HOT_REGIONS = {'Fergana', 'Bukhara', 'Navoi', 'Nukus', 'Karakalpakstan'}

    # ── Traditional Irrigation Norms for baseline comparison ────────
    # Represent average liters/mm used by traditional farmers (Baseline)
    TRADITIONAL_NORMS = {
        'cotton': 45,
        'wheat': 40,
        'corn': 55,
        'vegetables': 35,
        'rice': 80,
        'other': 40
    }

    # ── Public API ──────────────────────────────────────────────────

    def get_kc(self, crop_type: str, growth_stage: str) -> float:
        """Return crop coefficient for given crop and growth stage."""
        crop = self.KC_TABLE.get(crop_type, self.KC_TABLE['other'])
        return crop.get(growth_stage, 0.75)

    def estimate_et0(self, temp_max: float, temp_min: float,
                     humidity: float) -> float:
        """
        Estimate reference evapotranspiration (ET0) in mm/day
        from temperature and humidity bands.
        """
        temp_avg = (temp_max + temp_min) / 2.0

        if temp_avg >= 35 and humidity < 35:
            # Hot dry
            et0 = 8.0 + min(2.0, (temp_avg - 35) * 0.3)
        elif temp_avg >= 25:
            # Warm moderate
            if humidity < 35:
                et0 = 7.0
            elif humidity <= 60:
                et0 = 6.0
            else:
                et0 = 5.0
        elif temp_avg >= 15:
            # Mild
            et0 = 3.0 + (temp_avg - 15) * 0.2
        else:
            # Cool
            et0 = max(1.0, 1.0 + (temp_avg - 5) * 0.2)

        return round(et0, 2)

    def calculate_etc(self, kc: float, et0: float) -> float:
        """ETc = Kc × ET0"""
        return round(kc * et0, 2)

    def apply_adjustments(self, etc: float, payload: dict) -> dict:
        """
        Apply adjustment factors to ETc and return adjusted need + alerts.

        Returns dict with 'adjusted_mm', 'alerts', 'reasoning_parts'.
        """
        adjusted = etc
        alerts = []
        reasoning = []
        weather = payload.get('weather_today', {})

        rainfall = weather.get('rainfall_mm', 0)
        forecast_rain = weather.get('forecast_rain_3days_mm', 0)
        soil_moisture = float(payload.get('soil_moisture_percent', 50) or 50)
        soil_type = payload.get('soil_type', 'loamy')
        ndvi = float(payload.get('satellite_ndvi', 0.5) or 0.5)
        ndwi = float(payload.get('satellite_ndwi', -0.1) or -0.1)
        region = payload.get('region', '')
        season = payload.get('season', 'summer')
        water_pressure = payload.get('water_source_pressure', 'normal')

        # ── Rain deduction ──────────────────────────────────────
        if rainfall > 5:
            deduction = min(rainfall * 0.8, adjusted)
            adjusted -= deduction
            reasoning.append(f"rain_deduction=-{deduction:.1f}mm (rainfall={rainfall}mm)")

        # ── Forecast rain reduction ─────────────────────────────
        if forecast_rain > 10:
            reduction = adjusted * 0.25
            adjusted -= reduction
            reasoning.append(f"forecast_rain_reduction=-{reduction:.1f}mm (3-day forecast={forecast_rain}mm)")

        # ── Soil moisture adjustment ────────────────────────────
        if soil_moisture > 70:
            reduction = adjusted * 0.30
            adjusted -= reduction
            reasoning.append(f"high_soil_moisture_reduction=-{reduction:.1f}mm (moisture={soil_moisture:.1f}%)")
        elif soil_moisture < 30:
            increase = adjusted * 0.12
            adjusted += increase
            reasoning.append(f"low_soil_moisture_increase=+{increase:.1f}mm (moisture={soil_moisture:.1f}%)")
            if soil_moisture < 20:
                alerts.append({
                    'type': 'drought_risk',
                    'severity': 'warning',
                    'message': f'Влажность почвы слишком низкая: {soil_moisture:.1f}%. Рекомендуется срочный полив.',
                    'action_required': True,
                })

        # ── Soil type adjustment ────────────────────────────────
        if soil_type == 'sandy':
            increase = adjusted * 0.15
            adjusted += increase
            reasoning.append(f"sandy_soil_increase=+{increase:.1f}mm")
        elif soil_type == 'clay':
            reduction = adjusted * 0.10
            adjusted -= reduction
            reasoning.append(f"clay_soil_reduction=-{reduction:.1f}mm")

        # ── NDVI stress detection ───────────────────────────────
        if ndvi < 0.3:
            alerts.append({
                'type': 'drought_risk',
                'severity': 'critical',
                'message': f'NDVI={ndvi:.2f} — состояние растений неудовлетворительное. Требуется экстренный полив.',
                'action_required': True,
            })
            increase = adjusted * 0.15
            adjusted += increase
            reasoning.append(f"ndvi_stress_increase=+{increase:.1f}mm (NDVI={ndvi})")

        if ndvi > 0.6 and soil_moisture > 65:
            reduction = adjusted * 0.20
            adjusted -= reduction
            reasoning.append(f"healthy_field_reduction=-{reduction:.1f}mm (NDVI={ndvi}, moisture={soil_moisture:.1f}%)")

        # ── NDWI suv holati korreksiyasi ────────────────────────
        if ndwi < -0.2:
            # Dala juda quruq — suv kam
            increase = adjusted * 0.10
            adjusted += increase
            reasoning.append(f"ndwi_dry_field_increase=+{increase:.1f}mm (NDWI={ndwi:.2f})")
            if ndwi < -0.4:
                alerts.append({
                    'type': 'drought_risk',
                    'severity': 'warning',
                    'message': f'NDWI={ndwi:.2f} — серьезный дефицит водоснабжения поля.',
                    'action_required': True,
                })
        elif ndwi > 0.2:
            # Dala nam — suvni kamaytirish
            reduction = adjusted * 0.15
            adjusted -= reduction
            reasoning.append(f"ndwi_wet_field_reduction=-{reduction:.1f}mm (NDWI={ndwi:.2f})")

        # ── Regional heat correction (summer) ───────────────────
        if region in self.HOT_REGIONS and season == 'summer':
            # Nukus/Qoraqalpog'iston uchun kuchli aridlik koeffitsienti
            pct = 0.08 if region in ('Nukus', 'Karakalpakstan') else 0.05
            increase = adjusted * pct
            adjusted += increase
            reasoning.append(f"regional_heat_correction=+{increase:.1f}mm ({region} summer, +{int(pct*100)}%)")

        # ── Water pressure ──────────────────────────────────────
        if water_pressure == 'critical':
            adjusted *= 0.50
            reasoning.append("water_pressure_critical: halved recommendation")
            alerts.append({
                'type': 'data_gap',
                'severity': 'critical',
                'message': 'Критически низкое давление воды! Объем полива сокращен.',
                'action_required': True,
            })
        elif water_pressure == 'low':
            adjusted *= 0.80
            reasoning.append("water_pressure_low: reduced by 20%")
            alerts.append({
                'type': 'data_gap',
                'severity': 'warning',
                'message': 'Низкое давление воды. План полива скорректирован.',
                'action_required': False,
            })

        # ── Heat stress alert ───────────────────────────────────
        temp_max = weather.get('temperature_max_c', 30)
        if temp_max > 40:
            alerts.append({
                'type': 'heat_stress',
                'severity': 'warning',
                'message': f'Экстремальная жара: {temp_max}°C. Следите за состоянием растений.',
                'action_required': False,
            })

        adjusted = max(0, adjusted)

        return {
            'adjusted_mm': round(adjusted, 2),
            'alerts': alerts,
            'reasoning_parts': reasoning,
        }

    def apply_efficiency(self, adjusted_need: float,
                         irrigation_system: str) -> float:
        """Divide water need by system efficiency to get gross amount."""
        eff = self.EFFICIENCY.get(irrigation_system, 0.75)
        return round(adjusted_need / eff, 2)

    def _round_to_5(self, value: float) -> float:
        """Round to nearest 5 for practical scheduling."""
        return round(value / 5) * 5

    def _determine_level(self, gross_mm: float, etc: float) -> str:
        """Determine recommendation level."""
        if gross_mm <= 0:
            return 'none'
        ratio = gross_mm / max(etc, 1)
        if ratio < 0.4:
            return 'low'
        elif ratio < 0.8:
            return 'normal'
        elif ratio < 1.2:
            return 'high'
        else:
            return 'critical'

    def _determine_heatmap(self, gross_mm: float, soil_moisture: float,
                           ndvi: float) -> float:
        """Normalized urgency 0.0–1.0 for map coloring."""
        urgency = 0.0
        # Water need contributes up to 0.5
        urgency += min(0.5, gross_mm / 80.0)
        # Low soil moisture up to 0.3
        if soil_moisture < 40:
            urgency += 0.3 * (1 - soil_moisture / 40.0)
        # Low NDVI up to 0.2
        if ndvi < 0.4:
            urgency += 0.2 * (1 - ndvi / 0.4)
        return round(min(1.0, urgency), 2)

    def _best_irrigation_time(self, temp_max: float) -> str:
        """Never recommend 11:00–16:00."""
        if temp_max > 35:
            return "05:00–07:00"
        elif temp_max > 28:
            return "05:00–08:00"
        else:
            return "06:00–09:00"

    def _generate_forecast(self, etc: float, weather: dict,
                           crop_type: str) -> list:
        """Predict next 3 days of irrigation need."""
        forecast = []
        base = etc
        for i in range(1, 4):
            day = date.today() + timedelta(days=i)
            # Simple decay model
            variation = 1.0 + (i - 2) * 0.05
            predicted = round(base * variation, 1)
            conf = 'high' if i == 1 else ('medium' if i == 2 else 'low')
            forecast.append({
                'date': day.isoformat(),
                'predicted_need_mm': max(0, predicted),
                'confidence': conf,
            })
        return forecast

    def generate_recommendation(self, payload: dict) -> dict:
        """
        Full irrigation analysis pipeline.

        Takes a field data payload (dict) and returns the complete
        recommendation JSON as specified in the system prompt.
        """
        # ── Extract data ────────────────────────────────────────
        field_id = payload.get('field_id', 'UNKNOWN')
        field_name = payload.get('field_name', field_id)
        area_ha = payload.get('area_hectares', 1.0)
        crop_type = payload.get('crop_type', 'other')
        growth_stage = payload.get('crop_growth_stage', 'vegetative')
        irrigation_system = payload.get('irrigation_system', 'furrow')
        soil_moisture = float(payload.get('soil_moisture_percent', 50) or 50)
        ndvi = float(payload.get('satellite_ndvi', 0.5) or 0.5)
        ndwi = float(payload.get('satellite_ndwi', -0.1) or -0.1)
        weather = payload.get('weather_today', {})
        temp_max = weather.get('temperature_max_c', 30)
        temp_min = weather.get('temperature_min_c', 18)
        humidity = weather.get('humidity_percent', 50)
        rainfall = weather.get('rainfall_mm', 0)
        historical = payload.get('historical_avg_water_mm', 35)

        analysis_date = date.today().isoformat()

        # ── Step 1: Base ETc ────────────────────────────────────
        kc = self.get_kc(crop_type, growth_stage)
        et0 = self.estimate_et0(temp_max, temp_min, humidity)
        etc = self.calculate_etc(kc, et0)

        reasoning_parts = [
            f"ET0={et0}mm/day",
            f"Kc={kc} ({crop_type} {growth_stage})",
            f"ETc={etc}mm",
        ]

        # ── Step 2: Adjustments ─────────────────────────────────
        adj = self.apply_adjustments(etc, payload)
        adjusted_mm = adj['adjusted_mm']
        alerts = adj['alerts']
        reasoning_parts.extend(adj['reasoning_parts'])

        # ── Rice minimum enforcement ────────────────────────────
        if crop_type == 'rice':
            min_rice = kc * et0 * 0.9
            if adjusted_mm < min_rice:
                adjusted_mm = round(min_rice, 2)
                reasoning_parts.append(
                    f"rice_minimum_enforced={adjusted_mm}mm"
                )

        # ── Step 3: Efficiency ──────────────────────────────────
        gross_mm = self.apply_efficiency(adjusted_mm, irrigation_system)
        eff = self.EFFICIENCY.get(irrigation_system, 0.75)
        reasoning_parts.append(
            f"efficiency_adjustment({irrigation_system})=÷{eff}"
        )

        # ── Step 4: Final values ────────────────────────────────
        gross_rounded = self._round_to_5(gross_mm)
        irrigate_today = gross_rounded > 0
        amount_liters_per_ha = gross_rounded * 10000  # 1mm × 10000m² = 10000L
        total_liters = amount_liters_per_ha * area_ha

        # Compared to yesterday (use historical as proxy)
        if historical > 0:
            compared = round(((gross_rounded - historical) / historical) * 100)
        else:
            compared = 0

        reasoning_parts.append(
            f"gross={gross_mm}mm, rounded={gross_rounded}mm"
        )

        # ── Determine statuses ──────────────────────────────────
        level = self._determine_level(gross_rounded, etc)
        heatmap = self._determine_heatmap(gross_rounded, soil_moisture, ndvi)

        # NDVI status
        if ndvi >= 0.6:
            ndvi_status = 'healthy'
        elif ndvi >= 0.3:
            ndvi_status = 'moderate_stress'
        else:
            ndvi_status = 'severe_stress'

        # NDWI status
        if ndwi >= 0.1:
            ndwi_status = 'wet'
        elif ndwi >= -0.1:
            ndwi_status = 'moist'
        elif ndwi >= -0.3:
            ndwi_status = 'dry'
        else:
            ndwi_status = 'very_dry'

        # Soil moisture status
        if soil_moisture < 25:
            sm_status = 'dry'
        elif soil_moisture <= 65:
            sm_status = 'optimal'
        elif soil_moisture <= 85:
            sm_status = 'wet'
        else:
            sm_status = 'saturated'

        # Crop condition logic refined for early stage/bare soil
        if ndvi >= 0.35 and soil_moisture >= 25:
            crop_cond = 'good'
        elif ndvi < 0.1 and soil_moisture < 15:
            # Both very low -> really critical
            crop_cond = 'critical'
        elif ndvi < 0.25 or soil_moisture < 20:
            # One index is low -> needs attention
            crop_cond = 'needs_attention'
        else:
            # Middling values
            crop_cond = 'needs_attention'
        
        # Special case: if NDVI is healthy (>0.4), condition shouldn't be critical even if dryish
        if ndvi >= 0.4 and crop_cond == 'critical':
            crop_cond = 'needs_attention'

        # Yield risk
        if crop_cond == 'good':
            yield_risk = 'low'
        elif crop_cond == 'critical':
            yield_risk = 'high'
        else:
            yield_risk = 'medium'

        # ── Irrigation time ─────────────────────────────────────
        best_time = self._best_irrigation_time(temp_max)
        # Rough duration: assume 5mm/hour for drip, 15mm/hour for flood
        flow_rates = {'drip': 5, 'sprinkler': 8, 'furrow': 12, 'flood': 15}
        flow = flow_rates.get(irrigation_system, 8)
        duration = round(gross_rounded / flow, 1) if gross_rounded > 0 else 0

        # ── SMS messages ────────────────────────────────────────
        sms_uz = (
            f"Bugun {field_name} uchun {gross_rounded} mm suv bering. "
            f"Eng yaxshi vaqt: {best_time}."
        ) if irrigate_today else (
            f"Bugun {field_name} uchun sug'orish talab qilinmaydi."
        )
        sms_ru = (
            f"Сегодня для поля {field_name} необходимо {gross_rounded} мм воды. "
            f"Лучшее время: {best_time}."
        ) if irrigate_today else (
            f"Сегодня для поля {field_name} полив не требуется."
        )

        # ── Admin insight ───────────────────────────────────────
        admin_insight = (
            f"Field {field_id} ({crop_type}, {growth_stage} stage): "
            f"ET0={et0}mm, ETc={etc}mm. "
        )
        if soil_moisture < 30:
            admin_insight += f"Soil moisture critically low at {soil_moisture:.1f}%. "
        if ndvi < 0.3:
            admin_insight += f"NDVI severely depressed at {ndvi}. "
        if len(alerts) > 0:
            admin_insight += f"{len(alerts)} alert(s) raised. "
        admin_insight += f"Recommended {gross_rounded}mm via {irrigation_system}. Monitor over next 48h."

        # ── Forecast ────────────────────────────────────────────
        forecast = self._generate_forecast(etc, weather, crop_type)

        # ── Assemble output ─────────────────────────────────────
        return {
            'field_id': field_id,
            'analysis_date': analysis_date,
            'recommendation_level': level,

            'water_recommendation': {
                'irrigate_today': irrigate_today,
                'amount_mm': gross_rounded,
                'amount_liters_per_hectare': amount_liters_per_ha,
                'total_liters_field': total_liters,
                'compared_to_yesterday_percent': compared,
                'best_irrigation_time': best_time,
                'irrigation_duration_hours': duration,
                'savings': {
                    'mm': max(0, self.TRADITIONAL_NORMS.get(crop_type, 40) - gross_rounded),
                    'liters_total': max(0, (self.TRADITIONAL_NORMS.get(crop_type, 40) - gross_rounded) * 10000 * area_ha),
                    'uzs_total': max(0, (self.TRADITIONAL_NORMS.get(crop_type, 40) - gross_rounded) * 10000 * area_ha / 1000 * 55) # ~55 UZS per m3 pump cost
                }
            },

            'field_health': {
                'ndvi': round(ndvi, 4),
                'ndwi': round(ndwi, 4),
                'ndvi_status': ndvi_status,
                'ndwi_status': ndwi_status,
                'soil_moisture_status': sm_status,
                'crop_condition': crop_cond,
                'estimated_yield_risk': yield_risk,
            },

            'alerts': alerts,

            'farmer_sms_message': {
                'uz': sms_uz,
                'ru': sms_ru,
            },

            'admin_insight': admin_insight,
            'heatmap_value': heatmap,
            'next_irrigation_forecast': forecast,
            'reasoning_trace': ', '.join(reasoning_parts),
            'weather': weather,
        }

    def process_batch(self, fields_payload: list) -> dict:
        """
        Process multiple fields and return array of results
        plus a batch_summary.
        """
        results = []
        total_water = 0
        critical_count = 0
        irrigate_count = 0
        baseline_total = 0
        highest_priority = None
        highest_heatmap = -1

        for payload in fields_payload:
            rec = self.generate_recommendation(payload)
            results.append(rec)

            total_water += rec['water_recommendation'].get('total_liters_field', 0)
            baseline_total += (
                payload.get('historical_avg_water_mm', 35) *
                payload.get('area_hectares', 1) * 10000
            )

            if rec['water_recommendation']['irrigate_today']:
                irrigate_count += 1

            for alert in rec.get('alerts', []):
                if alert.get('severity') == 'critical':
                    critical_count += 1

            if rec['heatmap_value'] > highest_heatmap:
                highest_heatmap = rec['heatmap_value']
                highest_priority = rec['field_id']

        # Water savings
        if baseline_total > 0:
            saved_pct = round((1 - total_water / baseline_total) * 100)
        else:
            saved_pct = 0

        return {
            'results': results,
            'batch_summary': {
                'total_fields': len(fields_payload),
                'fields_needing_irrigation': irrigate_count,
                'critical_alerts': critical_count,
                'total_water_recommendation_liters': total_water,
                'water_saved_vs_baseline_percent': saved_pct,
                'highest_priority_field_id': highest_priority,
            },
        }
