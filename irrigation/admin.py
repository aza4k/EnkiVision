from django.contrib import admin
from irrigation.models import IrrigationRecord, IrrigationRecommendation


@admin.register(IrrigationRecord)
class IrrigationRecordAdmin(admin.ModelAdmin):
    list_display = ['field', 'date', 'amount_mm', 'method']
    list_filter = ['method', 'date']


@admin.register(IrrigationRecommendation)
class IrrigationRecommendationAdmin(admin.ModelAdmin):
    list_display = ['field', 'date', 'recommendation_level', 'amount_mm',
                    'irrigate_today', 'heatmap_value']
    list_filter = ['recommendation_level', 'irrigate_today', 'date']
