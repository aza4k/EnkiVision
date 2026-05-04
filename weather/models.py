from django.db import models


class WeatherData(models.Model):
    """Daily weather data for a field or region."""

    field = models.ForeignKey(
        'fields.Field', on_delete=models.CASCADE, related_name='weather_records'
    )
    date = models.DateField()
    temperature_max_c = models.FloatField()
    temperature_min_c = models.FloatField()
    humidity_percent = models.FloatField()
    wind_speed_kmh = models.FloatField(default=10.0)
    rainfall_mm = models.FloatField(default=0.0)
    forecast_rain_3days_mm = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        get_latest_by = 'date'
        unique_together = ['field', 'date']

    def __str__(self):
        return f"{self.field.field_id} weather {self.date}"
