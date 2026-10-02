"""
DRF Serializers for FMCSA HOS Trip Planning API.
Provides strict input validation and clean schema definitions.
"""

from rest_framework import serializers


class TripPlanRequestSerializer(serializers.Serializer):
    """
    Validates trip input parameters according to FMCSA guidelines.
    """
    current_location = serializers.CharField(
        required=True,
        min_length=2,
        max_length=200,
        trim_whitespace=True,
        error_messages={
            "required": "Current driver location is required.",
            "blank": "Current driver location cannot be blank.",
            "min_length": "Location name must be at least 2 characters.",
        }
    )
    pickup_location = serializers.CharField(
        required=True,
        min_length=2,
        max_length=200,
        trim_whitespace=True,
        error_messages={
            "required": "Pickup location is required.",
            "blank": "Pickup location cannot be blank.",
            "min_length": "Pickup location name must be at least 2 characters.",
        }
    )
    dropoff_location = serializers.CharField(
        required=True,
        min_length=2,
        max_length=200,
        trim_whitespace=True,
        error_messages={
            "required": "Dropoff location is required.",
            "blank": "Dropoff location cannot be blank.",
            "min_length": "Dropoff location name must be at least 2 characters.",
        }
    )
    current_cycle_used = serializers.FloatField(
        required=True,
        min_value=0.0,
        max_value=70.0,
        error_messages={
            "required": "Current cycle hours used is required.",
            "invalid": "Current cycle hours must be a valid number.",
            "min_value": "Current cycle hours used cannot be negative.",
            "max_value": "Current cycle hours used cannot exceed 70.0 hours (FMCSA 70h/8-day rule).",
        }
    )

    def validate(self, attrs):
        curr = attrs.get("current_location", "").lower()
        pick = attrs.get("pickup_location", "").lower()
        drop = attrs.get("dropoff_location", "").lower()

        if pick == drop:
            raise serializers.ValidationError({
                "dropoff_location": "Pickup location and dropoff location cannot be identical."
            })
        return attrs
