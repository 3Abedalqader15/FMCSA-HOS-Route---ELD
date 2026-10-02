"""
Presentation layer DRF Views for FMCSA HOS Route & ELD Planner.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripPlanRequestSerializer
from apps.hos_planner.use_cases.plan_trip import PlanTripUseCase


class PlanTripView(APIView):
    """
    POST /api/plan-trip/
    Generates compliant FMCSA HOS route simulation, stops, and 24h ELD log sheets.
    """

    def post(self, request, *args, **kwargs):
        serializer = TripPlanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "error": "Validation failed",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = PlanTripUseCase.execute(serializer.validated_data)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "error": "Failed to calculate HOS trip plan",
                    "message": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class HealthCheckView(APIView):
    """
    GET /api/health/
    Simple liveness and readiness probe for Render and load balancers.
    """

    def get(self, request, *args, **kwargs):
        return Response(
            {
                "status": "healthy",
                "service": "FMCSA HOS Route & ELD Log Planner API",
                "compliance": "49 CFR Part 395",
                "version": "1.0.0",
            },
            status=status.HTTP_200_OK,
        )
