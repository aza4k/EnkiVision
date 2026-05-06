from django.urls import path
from irrigation.views import (
    IrrigationAgentView,
    BatchAnalysisView,
    FieldListCreateView,
    FieldDetailView,
    FieldHistoryView,
    AlertListView,
    DashboardDataView,
    CreateFieldWithAnalysisView,
    RefreshFieldAnalysisView,
    DeleteFieldView,
    GEEStatusView,
    GEELayersView,
)

urlpatterns = [
    # Analysis endpoints
    path('analyze/', IrrigationAgentView.as_view(), name='analyze-single'),
    path('analyze/batch/', BatchAnalysisView.as_view(), name='analyze-batch'),

    # Field CRUD
    path('fields/', FieldListCreateView.as_view(), name='field-list'),
    path('fields/create-with-analysis/', CreateFieldWithAnalysisView.as_view(), name='field-create-analysis'),
    path('fields/<str:field_id>/', FieldDetailView.as_view(), name='field-detail'),
    path('fields/<str:field_id>/refresh/', RefreshFieldAnalysisView.as_view(), name='field-refresh'),
    path('fields/<str:field_id>/delete/', DeleteFieldView.as_view(), name='field-delete'),
    path('fields/<str:field_id>/history/', FieldHistoryView.as_view(), name='field-history'),

    # Alerts
    path('alerts/', AlertListView.as_view(), name='alert-list'),

    # Dashboard aggregated data
    path('dashboard/', DashboardDataView.as_view(), name='dashboard-data'),

    # GEE Status and Layers
    path('gee/status/', GEEStatusView.as_view(), name='gee-status'),
    path('gee/layers/', GEELayersView.as_view(), name='gee-layers'),
]
