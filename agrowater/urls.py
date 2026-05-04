from django.contrib import admin
from django.urls import path, include
from dashboard.views import DashboardView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('irrigation.urls')),
    path('', DashboardView.as_view(), name='dashboard'),
]
