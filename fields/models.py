from django.db import models


class Field(models.Model):
    """Represents an agricultural field in the system."""

    CROP_CHOICES = [
        ('cotton', 'Cotton'),
        ('wheat', 'Wheat'),
        ('corn', 'Corn'),
        ('vegetables', 'Vegetables'),
        ('rice', 'Rice'),
        ('other', 'Other'),
    ]

    GROWTH_STAGE_CHOICES = [
        ('seedling', 'Seedling'),
        ('vegetative', 'Vegetative'),
        ('flowering', 'Flowering'),
        ('ripening', 'Ripening'),
        ('harvest', 'Harvest'),
    ]

    SOIL_TYPE_CHOICES = [
        ('sandy', 'Sandy'),
        ('loamy', 'Loamy'),
        ('clay', 'Clay'),
        ('silty', 'Silty'),
    ]

    IRRIGATION_SYSTEM_CHOICES = [
        ('drip', 'Drip'),
        ('furrow', 'Furrow'),
        ('sprinkler', 'Sprinkler'),
        ('flood', 'Flood'),
    ]

    REGION_CHOICES = [
        ('Nukus', 'Nukus Tumani'),
        ('Karakalpakstan', 'Qoraqalpog\'iston'),
        ('Fergana', 'Fergana'),
        ('Tashkent', 'Tashkent'),
        ('Samarkand', 'Samarkand'),
        ('Bukhara', 'Bukhara'),
        ('Khorezm', 'Xorazm'),
        ('Navoi', 'Navoiy'),
        ('Andijan', 'Andijon'),
        ('Namangan', 'Namangan'),
        ('Kashkadarya', 'Qashqadaryo'),
        ('Surkhandarya', 'Surxondaryo'),
        ('Jizzakh', 'Jizzax'),
        ('Syrdarya', 'Sirdaryo'),
    ]

    WATER_PRESSURE_CHOICES = [
        ('normal', 'Normal'),
        ('low', 'Low'),
        ('critical', 'Critical'),
    ]

    field_id = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    area_hectares = models.FloatField()
    region = models.CharField(max_length=50, choices=REGION_CHOICES)
    crop_type = models.CharField(max_length=20, choices=CROP_CHOICES)
    crop_growth_stage = models.CharField(max_length=20, choices=GROWTH_STAGE_CHOICES)
    soil_type = models.CharField(max_length=20, choices=SOIL_TYPE_CHOICES)
    irrigation_system = models.CharField(max_length=20, choices=IRRIGATION_SYSTEM_CHOICES)
    water_source_pressure = models.CharField(
        max_length=20, choices=WATER_PRESSURE_CHOICES, default='normal'
    )
    latitude = models.FloatField(default=42.4531)
    longitude = models.FloatField(default=59.6104)
    polygon_coords = models.JSONField(null=True, blank=True, help_text="List of [lat, lng] coordinates")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Satellite data (GEE orqali yangilanadi)
    satellite_ndvi = models.FloatField(default=0.5, help_text='NDVI 0.0–1.0')
    satellite_ndwi = models.FloatField(default=-0.1, help_text='NDWI -1.0–1.0 (suv ko\'rsatkichi)')
    satellite_evi = models.FloatField(default=0.4, help_text='EVI 0.0–1.0')
    satellite_data_date = models.DateField(null=True, blank=True)
    gee_source = models.CharField(
        max_length=20, default='fallback',
        help_text='GEE | fallback'
    )
    gee_last_updated = models.DateTimeField(null=True, blank=True)

    # Historical baseline
    historical_avg_water_mm = models.FloatField(default=35.0)

    class Meta:
        ordering = ['field_id']

    def __str__(self):
        return f"{self.field_id} — {self.name}"


class SoilSensor(models.Model):
    """IoT soil sensor reading for a field."""

    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='soil_sensors')
    moisture_percent = models.FloatField()
    temperature = models.FloatField(null=True, blank=True)
    reading_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-reading_time']
        get_latest_by = 'reading_time'

    def __str__(self):
        return f"{self.field.field_id} sensor @ {self.reading_time:%Y-%m-%d %H:%M}"
