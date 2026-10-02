from django.urls import path
from apps.hos_planner.presentation.views import PlanTripView, HealthCheckView

urlpatterns = [
    path('api/plan-trip/', PlanTripView.as_view(), name='plan-trip'),
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
]
