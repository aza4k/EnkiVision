from rest_framework import serializers
from fields.models import Field, SoilSensor
from irrigation.models import IrrigationRecord, IrrigationRecommendation
from weather.models import WeatherData
from notifications.models import Alert


# ── Weather sub-serializer for the analysis payload ─────────────────

class WeatherInputSerializer(serializers.Serializer):
    temperature_max_c = serializers.FloatField(default=30)
    temperature_min_c = serializers.FloatField(default=18)
    humidity_percent = serializers.FloatField(default=50)
    wind_speed_kmh = serializers.FloatField(default=10)
    rainfall_mm = serializers.FloatField(default=0)
    forecast_rain_3days_mm = serializers.FloatField(default=0)


class FieldAnalysisInputSerializer(serializers.Serializer):
    """Validates the incoming JSON payload for single-field analysis."""

    field_id = serializers.CharField(max_length=20)
    field_name = serializers.CharField(max_length=200, required=False, default='')
    area_hectares = serializers.FloatField(default=1.0)
    crop_type = serializers.ChoiceField(
        choices=['cotton', 'wheat', 'corn', 'vegetables', 'rice', 'other'],
        default='cotton',
    )
    crop_growth_stage = serializers.ChoiceField(
        choices=['seedling', 'vegetative', 'flowering', 'ripening', 'harvest'],
        default='vegetative',
    )
    satellite_ndvi = serializers.FloatField(default=0.5, min_value=0, max_value=1)
    satellite_evi = serializers.FloatField(default=0.4, min_value=0, max_value=1)
    soil_moisture_percent = serializers.FloatField(default=50, min_value=0, max_value=100)
    soil_type = serializers.ChoiceField(
        choices=['sandy', 'loamy', 'clay', 'silty'], default='loamy',
    )
    last_irrigation_date = serializers.DateField(required=False, allow_null=True)
    last_irrigation_amount_mm = serializers.FloatField(default=0)
    weather_today = WeatherInputSerializer(required=False)
    historical_avg_water_mm = serializers.FloatField(default=35)
    region = serializers.CharField(max_length=50, default='Tashkent')
    season = serializers.ChoiceField(
        choices=['spring', 'summer', 'autumn', 'winter'], default='summer',
    )
    irrigation_system = serializers.ChoiceField(
        choices=['drip', 'furrow', 'sprinkler', 'flood'], default='furrow',
    )
    water_source_pressure = serializers.ChoiceField(
        choices=['normal', 'low', 'critical'], default='normal',
    )
    alerts = serializers.ListField(child=serializers.DictField(), default=list)


class BatchAnalysisInputSerializer(serializers.Serializer):
    """Validates batch (array) input."""
    fields = FieldAnalysisInputSerializer(many=True)


# ── Model serializers ───────────────────────────────────────────────

class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = '__all__'


class SoilSensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilSensor
        fields = '__all__'


class IrrigationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrrigationRecord
        fields = '__all__'


class IrrigationRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrrigationRecommendation
        fields = '__all__'


class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = '__all__'


class AlertSerializer(serializers.ModelSerializer):
    field_id_display = serializers.CharField(source='field.field_id', read_only=True)
    field_name = serializers.CharField(source='field.name', read_only=True)

    class Meta:
        model = Alert
        fields = '__all__'
