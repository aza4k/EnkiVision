from django.contrib import admin
from notifications.models import Alert, SMSLog


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['field', 'alert_type', 'severity', 'action_required',
                    'acknowledged', 'created_at']
    list_filter = ['severity', 'alert_type', 'acknowledged']


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ['field', 'phone_number', 'language', 'status', 'sent_at']
    list_filter = ['status', 'language']
