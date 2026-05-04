from django.contrib import admin
from fields.models import Field, SoilSensor


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ['field_id', 'name', 'region', 'crop_type', 'crop_growth_stage',
                    'area_hectares', 'irrigation_system', 'is_active']
    list_filter = ['region', 'crop_type', 'irrigation_system', 'is_active']
    search_fields = ['field_id', 'name']


@admin.register(SoilSensor)
class SoilSensorAdmin(admin.ModelAdmin):
    list_display = ['field', 'moisture_percent', 'temperature', 'reading_time']
    list_filter = ['field__region']
