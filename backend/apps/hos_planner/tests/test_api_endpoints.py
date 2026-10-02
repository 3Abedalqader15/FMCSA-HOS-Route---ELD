"""
Integration tests for FMCSA HOS REST API Endpoints.
"""

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse


class TestPlanTripApi(APITestCase):

    def test_health_check_endpoint(self):
        """Verifies GET /api/health/ returns 200 OK and healthy status."""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("status"), "healthy")

    def test_plan_trip_valid_scenario(self):
        """
        Tests the official FMCSA guide scenario:
        Chicago, IL -> Indianapolis, IN -> Dallas, TX with 15.5h cycle used.
        """
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Dallas, TX",
            "current_cycle_used": 15.5,
        }
        response = self.client.post('/api/plan-trip/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertIn("trip_summary", data)
        self.assertIn("route_coordinates", data)
        self.assertIn("stops", data)
        self.assertIn("daily_logs", data)

        summary = data["trip_summary"]
        self.assertGreater(summary["total_miles"], 500)
        self.assertGreater(summary["total_driving_hours"], 8)
        self.assertGreater(summary["final_cycle_used"], 15.5)

        # Invariant check: all returned logs must strictly sum to 24.0
        for log in data["daily_logs"]:
            hours = log["hours_summary"]
            total = (
                hours["OFF_DUTY"] +
                hours["SLEEPER_BERTH"] +
                hours["DRIVING"] +
                hours["ON_DUTY"]
            )
            self.assertAlmostEqual(total, 24.0, places=2)
            self.assertEqual(hours["TOTAL"], 24.0)

        # Check stops
        stop_types = [s["type"] for s in data["stops"]]
        self.assertIn("START", stop_types)
        self.assertIn("PICKUP", stop_types)
        self.assertIn("DROPOFF", stop_types)

    def test_plan_trip_missing_fields(self):
        """Verifies that missing required fields return HTTP 400 Bad Request."""
        payload = {
            "current_location": "Chicago, IL",
            # missing pickup and dropoff
        }
        response = self.client.post('/api/plan-trip/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get("success"))
        self.assertIn("details", response.data)

    def test_plan_trip_invalid_cycle_limits(self):
        """Verifies that negative or >70 cycle hours are rejected with HTTP 400."""
        # Negative cycle
        response_neg = self.client.post('/api/plan-trip/', data={
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Dallas, TX",
            "current_cycle_used": -2.0,
        }, format='json')
        self.assertEqual(response_neg.status_code, status.HTTP_400_BAD_REQUEST)

        # Exceeding 70h max
        response_over = self.client.post('/api/plan-trip/', data={
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Dallas, TX",
            "current_cycle_used": 75.0,
        }, format='json')
        self.assertEqual(response_over.status_code, status.HTTP_400_BAD_REQUEST)

    def test_plan_trip_identical_pickup_dropoff(self):
        """Verifies that identical pickup and dropoff is rejected."""
        response = self.client.post('/api/plan-trip/', data={
            "current_location": "Chicago, IL",
            "pickup_location": "Dallas, TX",
            "dropoff_location": "Dallas, TX",
            "current_cycle_used": 10.0,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
