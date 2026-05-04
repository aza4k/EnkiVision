from django.db import models


class IrrigationRecord(models.Model):
    """Historical record of an actual irrigation event."""

    field = models.ForeignKey(
        'fields.Field', on_delete=models.CASCADE, related_name='irrigation_records'
    )
    date = models.DateField()
    amount_mm = models.FloatField()
    method = models.CharField(max_length=20, default='drip')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        get_latest_by = 'date'

    def __str__(self):
        return f"{self.field.field_id} irrigated {self.amount_mm}mm on {self.date}"


class IrrigationRecommendation(models.Model):
    """Engine-generated irrigation recommendation stored for dashboard/history."""

    LEVEL_CHOICES = [
        ('none', 'None'),
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    field = models.ForeignKey(
        'fields.Field', on_delete=models.CASCADE, related_name='recommendations'
    )
    date = models.DateField()
    recommendation_level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    amount_mm = models.FloatField(default=0)
    irrigate_today = models.BooleanField(default=False)
    heatmap_value = models.FloatField(default=0.0)
    recommendation_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        get_latest_by = 'created_at'

    def __str__(self):
        return f"{self.field.field_id} rec {self.date}: {self.recommendation_level}"
