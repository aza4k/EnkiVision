from datetime import date
import time
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from fields.models import Field
from irrigation.engine import IrrigationEngine
from irrigation.models import IrrigationRecord, IrrigationRecommendation
from irrigation.serializers import (
    FieldAnalysisInputSerializer,
    FieldSerializer,
    IrrigationRecommendationSerializer,
    AlertSerializer,
)
from notifications.models import Alert
from gee.service import get_satellite_indices, get_gee_status, get_field_thumbnail_url, get_field_spectral_profile, get_full_spectral_analysis
from gee.ai_recognition import detect_crop_type, generate_field_report


# ── Irrigation Analysis Endpoints ──────────────────────────────────

class IrrigationAgentView(APIView):
    """
    POST /api/analyze/

    Accepts a single-field JSON payload, runs the IrrigationEngine,
    stores the recommendation, and returns it.
    """

    def post(self, request):
        serializer = FieldAnalysisInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        payload = serializer.validated_data
        # Convert weather_today from OrderedDict to plain dict
        if 'weather_today' not in payload or payload['weather_today'] is None:
            payload['weather_today'] = {}

        engine = IrrigationEngine()
        recommendation = engine.generate_recommendation(payload)

        # Persist recommendation if the field exists in DB
        try:
            field_obj = Field.objects.get(field_id=payload['field_id'])
            IrrigationRecommendation.objects.create(
                field=field_obj,
                date=date.today(),
                recommendation_level=recommendation['recommendation_level'],
                amount_mm=recommendation['water_recommendation']['amount_mm'],
                irrigate_today=recommendation['water_recommendation']['irrigate_today'],
                heatmap_value=recommendation['heatmap_value'],
                recommendation_json=recommendation,
            )
            # Persist alerts
            for alert_data in recommendation.get('alerts', []):
                Alert.objects.create(
                    field=field_obj,
                    alert_type=alert_data.get('type', 'data_gap'),
                    severity=alert_data.get('severity', 'info'),
                    message=alert_data.get('message', ''),
                    action_required=alert_data.get('action_required', False),
                )
        except Field.DoesNotExist:
            pass  # Field not in DB — just return calculation

        return Response(recommendation, status=status.HTTP_200_OK)


class BatchAnalysisView(APIView):
    """
    POST /api/analyze/batch/

    Accepts an array of field payloads, processes each, returns results
    with batch_summary.
    """

    def post(self, request):
        if not isinstance(request.data, list):
            return Response(
                {'error': 'Expected an array of field payloads'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate each payload
        validated = []
        errors = []
        for i, item in enumerate(request.data):
            s = FieldAnalysisInputSerializer(data=item)
            if s.is_valid():
                payload = s.validated_data
                if 'weather_today' not in payload or payload['weather_today'] is None:
                    payload['weather_today'] = {}
                validated.append(payload)
            else:
                errors.append({f'field_{i}': s.errors})

        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        engine = IrrigationEngine()
        result = engine.process_batch(validated)

        # Persist each recommendation
        for rec in result.get('results', []):
            try:
                field_obj = Field.objects.get(field_id=rec['field_id'])
                IrrigationRecommendation.objects.create(
                    field=field_obj,
                    date=date.today(),
                    recommendation_level=rec['recommendation_level'],
                    amount_mm=rec['water_recommendation']['amount_mm'],
                    irrigate_today=rec['water_recommendation']['irrigate_today'],
                    heatmap_value=rec['heatmap_value'],
                    recommendation_json=rec,
                )
            except Field.DoesNotExist:
                pass

        return Response(result, status=status.HTTP_200_OK)


# ── Field CRUD ──────────────────────────────────────────────────────

class FieldListCreateView(ListCreateAPIView):
    queryset = Field.objects.filter(is_active=True)
    serializer_class = FieldSerializer


class FieldDetailView(RetrieveUpdateAPIView):
    queryset = Field.objects.all()
    serializer_class = FieldSerializer
    lookup_field = 'field_id'


# ── Field History ───────────────────────────────────────────────────

class FieldHistoryView(ListAPIView):
    serializer_class = IrrigationRecommendationSerializer

    def get_queryset(self):
        field_id = self.kwargs.get('field_id')
        return IrrigationRecommendation.objects.filter(
            field__field_id=field_id
        ).order_by('-date')[:30]


# ── Alerts ──────────────────────────────────────────────────────────

class AlertListView(ListAPIView):
    serializer_class = AlertSerializer

    def get_queryset(self):
        return Alert.objects.select_related('field').order_by('-created_at')[:50]


# ── Dashboard API (aggregated data for frontend) ───────────────────

class DashboardDataView(APIView):
    """
    GET /api/dashboard/

    Returns aggregated data for the frontend dashboard:
    all fields with their latest recommendation and heatmap values.
    """

    def get(self, request):
        # Prefetch the latest recommendation for each field to avoid N+1 queries
        fields = Field.objects.filter(is_active=True).prefetch_related('recommendations', 'soil_sensors', 'alerts')
        data = []

        for field in fields:
            # Manually get the first (latest) items from prefetched sets
            recs = list(field.recommendations.all()[:1])
            latest_rec = recs[0] if recs else None
            
            sensors = list(field.soil_sensors.all()[:1])
            latest_sensor = sensors[0] if sensors else None
            
            recent_alerts = list(
                field.alerts.filter(acknowledged=False)
                .values('alert_type', 'severity', 'message', 'created_at')[:5]
            )

            field_data = {
                'field_id': field.field_id,
                'name': field.name,
                'area_hectares': field.area_hectares,
                'region': field.region,
                'crop_type': field.crop_type,
                'crop_growth_stage': field.crop_growth_stage,
                'irrigation_system': field.irrigation_system,
                'latitude': field.latitude,
                'longitude': field.longitude,
                'polygon_coords': field.polygon_coords,
                'satellite_ndvi': field.satellite_ndvi,
                'soil_moisture': (
                    latest_sensor.moisture_percent if latest_sensor else None
                ),
                'heatmap_value': (
                    latest_rec.heatmap_value if latest_rec else 0.0
                ),
                'recommendation': (
                    latest_rec.recommendation_json if latest_rec else None
                ),
                'alerts': recent_alerts,
            }
            data.append(field_data)

        # Summary stats
        total_fields = len(data)
        fields_needing = sum(
            1 for d in data
            if d['recommendation'] and
            d['recommendation'].get('water_recommendation', {}).get('irrigate_today')
        )
        critical_alerts = Alert.objects.filter(
            severity='critical', acknowledged=False
        ).count()
        avg_ndvi = (
            sum((d['satellite_ndvi'] or 0) for d in data) / total_fields
            if total_fields else 0
        )
        total_water = sum(
            d['recommendation']['water_recommendation'].get('total_liters_field', 0)
            for d in data if d['recommendation']
        )
        total_savings = sum(
            d['recommendation']['water_recommendation'].get('savings', {}).get('liters_total', 0)
            for d in data if d['recommendation']
        )

        return Response({
            'fields': data,
            'summary': {
                'total_fields': total_fields,
                'fields_needing_irrigation': fields_needing,
                'critical_alerts': critical_alerts,
                'avg_ndvi': round(avg_ndvi, 2),
                'total_water_liters': total_water,
                'total_savings_liters': total_savings,
            }
        })


# ── Real Data Integration Views ──────────────────────────────────────

import math
from weather.services import fetch_real_weather
from weather.models import WeatherData
from fields.models import SoilSensor

def polygon_area_ha(coords):
    """Calculate area of polygon in hectares using Shoelace formula."""
    if not coords or len(coords) < 3:
        return 0.0
    area = 0.0
    for i in range(len(coords)):
        j = (i + 1) % len(coords)
        # coords are [lat, lng]
        # approximation for small areas:
        # dx in meters = (lng2 - lng1) * 40000000 * cos((lat1+lat2)/2) / 360
        # dy in meters = (lat2 - lat1) * 40000000 / 360
        # Simplified Shoelace in degrees squared, then converted to sq meters
        area += coords[i][1] * coords[j][0] - coords[j][1] * coords[i][0]
    
    area = abs(area) / 2.0
    # convert deg^2 to m^2 (roughly at lat 41)
    # 1 deg lat = 111,320m. 1 deg lng at 41 lat = 111,320 * cos(41) ~ 84,000m
    # 1 deg^2 ~ 9,350,880,000 m^2
    area_m2 = area * 9350880000
    # convert m^2 to hectares
    return max(0.1, round(area_m2 / 10000.0, 2))


def polygon_centroid(coords):
    """Find latitude and longitude centroid of polygon."""
    if not coords:
        return 42.4531, 59.6104  # Nukus tumani markazi
    lats = [c[0] for c in coords]
    lngs = [c[1] for c in coords]
    return sum(lats) / len(lats), sum(lngs) / len(lngs)


def _get_season(month: int) -> str:
    """Oy bo'yicha faslni aniqlash."""
    if month in (12, 1, 2):
        return 'winter'
    elif month in (3, 4, 5):
        return 'spring'
    elif month in (6, 7, 8):
        return 'summer'
    return 'autumn'


class CreateFieldWithAnalysisView(APIView):
    """
    POST /api/fields/create-with-analysis/
    Accepts polygon + metadata, calculates area, fetches weather, runs engine.
    """
    def post(self, request):
        data = request.data
        coords = data.get('polygon_coords', [])

        area_ha = polygon_area_ha(coords) if coords else data.get('area_hectares', 1.0)
        lat, lng = (
            polygon_centroid(coords) if coords
            else (data.get('latitude', 42.4531), data.get('longitude', 59.6104))
        )

        from datetime import datetime
        field_id = f"NK-{int(datetime.now().timestamp() * 1000) % 1000000}"
        season = _get_season(date.today().month)

        # 1. Ob-havo (real)
        weather_dict = fetch_real_weather(lat, lng)

        # 2. GEE orqali barcha ma'lumotlarni bitta so'rovda olamiz (OPTIMIZATSIYA)
        gee_data = get_full_spectral_analysis(
            polygon_coords=coords,
            lat=lat,
            lng=lng,
            days_back=30,
        )
        
        ndvi_val = gee_data['indices']['ndvi']
        ndwi_val = gee_data['indices']['ndwi']
        gee_source = gee_data['source']

        # 2.5 AI Crop Detection (Algoritmik + Fallback)
        # Endi gee_data['bands'] tayyor, qayta GEE ga murojaat shart emas!
        detected_crop = detect_crop_type(gee_data, region_context=f"{data.get('region', 'Nukus')}, Uzbekistan")
        
        # Qat'iy fallback: Agar AI topa olmasa yoki xato bo'lsa, 'cotton' qo'yiladi (Прочее emas)
        final_crop_type = detected_crop if (detected_crop and detected_crop != 'other') else 'cotton'

        # 3. Field saqlash (defaults used for hidden fields)
        from django.utils import timezone
        field = Field.objects.create(
            field_id=field_id,
            name=data.get('name', 'Yangi Dala'),
            area_hectares=area_ha,
            region=data.get('region', 'Nukus'),
            crop_type=final_crop_type,
            crop_growth_stage='vegetative',
            soil_type='loamy',
            irrigation_system=data.get('irrigation_system', 'furrow'),
            latitude=lat,
            longitude=lng,
            polygon_coords=coords,
            satellite_ndvi=ndvi_val,
            satellite_ndwi=ndwi_val,
            satellite_data_date=date.today(),
            gee_source=gee_source,
            gee_last_updated=timezone.now(),
        )

        # 4. Sensor va ob-havo saqlash (Tuproq namligi GEE NDWI orqali hisoblanadi)
        # NDWI (-0.3 dan 0.2 gacha) ni 0-100% gacha o'tkazamiz
        moisture = max(5.0, min(100.0, (ndwi_val + 0.3) * 200))
        SoilSensor.objects.create(
            field=field,
            moisture_percent=moisture,
            temperature=weather_dict['temperature_max_c'],
        )
        WeatherData.objects.create(field=field, date=date.today(), **weather_dict)

        # 5. Engine payload
        payload = {
            'field_id': field.field_id,
            'field_name': field.name,
            'area_hectares': field.area_hectares,
            'crop_type': field.crop_type,
            'crop_growth_stage': field.crop_growth_stage,
            'satellite_ndvi': ndvi_val,
            'satellite_ndwi': ndwi_val,
            'satellite_evi': 0.4,
            'soil_moisture_percent': moisture,
            'soil_type': field.soil_type,
            'weather_today': weather_dict,
            'historical_avg_water_mm': 30,
            'region': field.region,
            'season': season,
            'irrigation_system': field.irrigation_system,
            'water_source_pressure': field.water_source_pressure,
        }

        # 6. Tavsiya hisoblash
        engine = IrrigationEngine()
        recommendation = engine.generate_recommendation(payload)
        recommendation['gee_source'] = gee_source
        recommendation['satellite_image_date'] = gee_data.get('image_date', date.today().isoformat())

        # 7. Saqlash
        IrrigationRecommendation.objects.create(
            field=field,
            date=date.today(),
            recommendation_level=recommendation['recommendation_level'],
            amount_mm=recommendation['water_recommendation']['amount_mm'],
            irrigate_today=recommendation['water_recommendation']['irrigate_today'],
            heatmap_value=recommendation['heatmap_value'],
            recommendation_json=recommendation,
        )

        for alert_data in recommendation.get('alerts', []):
            Alert.objects.create(
                field=field,
                alert_type=alert_data.get('type', 'data_gap'),
                severity=alert_data.get('severity', 'info'),
                message=alert_data.get('message', ''),
                action_required=alert_data.get('action_required', False),
            )

        return Response({
            'field_id': field.field_id,
            'ndvi': ndvi_val,
            'ndwi': ndwi_val,
            'gee_source': gee_source,
            'recommendation': recommendation,
        }, status=status.HTTP_201_CREATED)


class RefreshFieldAnalysisView(APIView):
    """
    POST /api/fields/<field_id>/refresh/
    Ob-havo + GEE NDVI/NDWI ni yangilab, tavsiya qayta hisoblanadi.
    """
    def post(self, request, field_id):
        try:
            field = Field.objects.get(field_id=field_id)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        season = _get_season(date.today().month)

        # 1. Ob-havo yangilash
        weather_dict = fetch_real_weather(field.latitude, field.longitude)
        WeatherData.objects.update_or_create(
            field=field, 
            date=date.today(),
            defaults=weather_dict
        )

        # 2. GEE: Barcha ma'lumotlarni bitta so'rovda yangilash (OPTIMIZATSIYA)
        gee_data = get_full_spectral_analysis(
            polygon_coords=field.polygon_coords or [],
            lat=field.latitude,
            lng=field.longitude,
            days_back=30,
        )
        ndvi_val = gee_data['indices']['ndvi']
        ndwi_val = gee_data['indices']['ndwi']
        gee_source = gee_data['source']

        from django.db import transaction
        with transaction.atomic():
            from django.utils import timezone
            field.satellite_ndvi = ndvi_val
            field.satellite_ndwi = ndwi_val
            field.satellite_data_date = date.today()
            field.gee_source = gee_source
            field.gee_last_updated = timezone.now()
            field.save(update_fields=[
                'satellite_ndvi', 'satellite_ndwi',
                'satellite_data_date', 'gee_source', 'gee_last_updated',
            ])

            latest_sensor = field.soil_sensors.first()
            # NDWI (-0.3 dan 0.2 gacha) ni 0-100% gacha o'tkazamiz
            moisture = max(5.0, min(100.0, (ndwi_val + 0.3) * 200))
            if latest_sensor:
                latest_sensor.moisture_percent = moisture
                latest_sensor.save()
            else:
                SoilSensor.objects.create(
                    field=field,
                    moisture_percent=moisture,
                    temperature=weather_dict['temperature_max_c'],
                )

            # 3. Engine payload
            payload = {
                'field_id': field.field_id,
                'field_name': field.name,
                'area_hectares': field.area_hectares,
                'crop_type': field.crop_type,
                'crop_growth_stage': field.crop_growth_stage,
                'satellite_ndvi': ndvi_val,
                'satellite_ndwi': ndwi_val,
                'satellite_evi': 0.4,
                'soil_moisture_percent': moisture,
                'soil_type': field.soil_type,
                'weather_today': weather_dict,
                'historical_avg_water_mm': field.historical_avg_water_mm,
                'region': field.region,
                'season': season,
                'irrigation_system': field.irrigation_system,
                'water_source_pressure': field.water_source_pressure,
            }

            engine = IrrigationEngine()
            recommendation = engine.generate_recommendation(payload)
            recommendation['gee_source'] = gee_source
            recommendation['satellite_image_date'] = gee_data.get('image_date', date.today().isoformat())

            IrrigationRecommendation.objects.update_or_create(
                field=field,
                date=date.today(),
                defaults={
                    'recommendation_level': recommendation['recommendation_level'],
                    'amount_mm': recommendation['water_recommendation']['amount_mm'],
                    'irrigate_today': recommendation['water_recommendation']['irrigate_today'],
                    'heatmap_value': recommendation['heatmap_value'],
                    'recommendation_json': recommendation,
                }
            )

        return Response(recommendation, status=status.HTTP_200_OK)


class GEEStatusView(APIView):
    """
    GET /api/gee/status/
    GEE ulanish holatini qaytaradi.
    """
    def get(self, request):
        return Response(get_gee_status())


class GEELayersView(APIView):
    """
    GET /api/gee/layers/
    Xarita uchun GEE tile qatlamlarini (NDVI, NDWI) qaytaradi.
    """
    def get(self, request):
        from gee.service import get_layer_tile_urls
        try:
            urls = get_layer_tile_urls()
            return Response(urls, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteFieldView(APIView):
    """
    DELETE /api/fields/<field_id>/delete/
    """
    def delete(self, request, field_id):
        try:
            field = Field.objects.get(field_id=field_id)
            field.delete()
            return Response({'status': 'deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)


class DetectCropTypeView(APIView):
    """
    POST /api/fields/<field_id>/detect-crop/
    Gemini AI orqali ekin turini aniqlash.
    """
    def post(self, request, field_id):
        try:
            field = Field.objects.get(field_id=field_id)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        gee_data = get_full_spectral_analysis(field.polygon_coords, field.latitude, field.longitude)
        if not gee_data or not gee_data.get('bands'):
            return Response({'error': 'Spectral data not available from GEE'}, status=status.HTTP_400_BAD_REQUEST)

        detected_crop = detect_crop_type(gee_data, region_context=f"{field.region}, Uzbekistan")
        
        if detected_crop:
            old_crop = field.crop_type
            field.crop_type = detected_crop
            field.save(update_fields=['crop_type'])
            
            # Thumbnail URL ni vizualizatsiya uchun baribir qaytaramiz (agar kerak bo'lsa)
            thumb_url = get_field_thumbnail_url(field.polygon_coords, field.latitude, field.longitude)
            
            return Response({
                'detected_crop': detected_crop,
                'old_crop': old_crop,
                'status': 'updated',
                'thumbnail_url': thumb_url,
                'spectral_summary': spectral_profile.get('indices', {})
            })
        
        return Response({'error': 'AI could not detect crop type from spectral data'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class FieldAIAnalysisView(APIView):
    """
    POST /api/fields/<field_id>/analyze-ai/
    Dala ma'lumotlari asosida Gemini tomonidan batafsil tahlil.
    """
    def post(self, request, field_id):
        try:
            field = Field.objects.get(field_id=field_id)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        latest_sensor = field.soil_sensors.first()
        latest_weather = field.weather_records.first()

        data_for_ai = {
            'crop_type': field.crop_type,
            'ndvi': field.satellite_ndvi,
            'ndwi': field.satellite_ndwi,
            'soil_moisture': latest_sensor.moisture_percent if latest_sensor else 25.0,
            'weather_temp': latest_weather.temperature_max_c if latest_weather else 35.0,
            'weather_humidity': latest_weather.humidity_percent if latest_weather else 40.0,
        }

        report = generate_field_report(data_for_ai, region=field.region)
        
        return Response({
            'report_markdown': report,
            'timestamp': time.time()
        })
