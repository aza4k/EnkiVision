from django.db import models


class Alert(models.Model):
    """System alert for a field condition."""

    TYPE_CHOICES = [
        ('drought_risk', 'Drought Risk'),
        ('overwatering', 'Overwatering'),
        ('disease_risk', 'Disease Risk'),
        ('heat_stress', 'Heat Stress'),
        ('data_gap', 'Data Gap'),
    ]

    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]

    field = models.ForeignKey(
        'fields.Field', on_delete=models.CASCADE, related_name='alerts'
    )
    alert_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    message = models.TextField()
    action_required = models.BooleanField(default=False)
    acknowledged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.field.field_id}: {self.alert_type}"


class SMSLog(models.Model):
    """Log of SMS notifications sent to farmers."""

    field = models.ForeignKey(
        'fields.Field', on_delete=models.CASCADE, related_name='sms_logs'
    )
    phone_number = models.CharField(max_length=20)
    message = models.TextField()
    language = models.CharField(max_length=5, default='uz')
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"SMS to {self.phone_number} @ {self.sent_at:%Y-%m-%d %H:%M}"
