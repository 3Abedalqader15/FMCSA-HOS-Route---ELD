"""
Application Use Case: Plan Trip Orchestrator.
Orchestrates Geocoding, Routing, and Domain HOS Simulation.
"""

from typing import Dict, Any, List
from datetime import datetime
from apps.hos_planner.domain.rules import simulate_hos_timeline
from apps.hos_planner.infrastructure.geocoding import geocode_location
from apps.hos_planner.infrastructure.routing import calculate_osrm_route


class PlanTripUseCase:
    """
    Coordinates trip planning end-to-end.
    """

    @classmethod
    def execute(cls, input_data: Dict[str, Any]) -> Dict[str, Any]:
        current_loc_str = input_data["current_location"].strip()
        pickup_loc_str = input_data["pickup_location"].strip()
        dropoff_loc_str = input_data["dropoff_location"].strip()
        current_cycle_used = float(input_data["current_cycle_used"])

        # 1. Geocode all locations
        c_lat, c_lon, c_name = geocode_location(current_loc_str)
        p_lat, p_lon, p_name = geocode_location(pickup_loc_str)
        d_lat, d_lon, d_name = geocode_location(dropoff_loc_str)

        # 2. Compute Routing for Leg 1 (Current -> Pickup) and Leg 2 (Pickup -> Dropoff)
        miles_leg1, hours_leg1, geom_leg1 = calculate_osrm_route(
            (c_lat, c_lon), (p_lat, p_lon)
        )
        miles_leg2, hours_leg2, geom_leg2 = calculate_osrm_route(
            (p_lat, p_lon), (d_lat, d_lon)
        )

        total_miles = miles_leg1 + miles_leg2
        combined_geom: List[List[float]] = geom_leg1 + geom_leg2

        # 3. Execute Pure Domain HOS Simulation
        plan_result = simulate_hos_timeline(
            current_loc=c_name,
            pickup_loc=p_name,
            dropoff_loc=d_name,
            miles_leg1=miles_leg1,
            hours_leg1=hours_leg1,
            miles_leg2=miles_leg2,
            hours_leg2=hours_leg2,
            current_cycle_used=current_cycle_used,
            route_coords=combined_geom,
            start_date=datetime.now(),
        )

        # 4. Enrich Stops with Lat/Lng coordinates for Interactive Leaflet Map Markers
        total_route_pts = len(combined_geom)
        for stop in plan_result.stops:
            if stop.stop_type == "START":
                stop.lat = c_lat
                stop.lng = c_lon
            elif stop.stop_type == "PICKUP":
                stop.lat = p_lat
                stop.lng = p_lon
            elif stop.stop_type in ["DROPOFF", "FINAL_SIGNOFF"]:
                stop.lat = d_lat
                stop.lng = d_lon
            else:
                # Interpolate coordinate along the route based on accumulated miles ratio
                ratio = stop.accumulated_miles / max(1.0, total_miles)
                ratio = min(max(0.0, ratio), 1.0)
                idx = int(ratio * (total_route_pts - 1)) if total_route_pts > 0 else 0
                if 0 <= idx < total_route_pts:
                    stop.lat = combined_geom[idx][0]
                    stop.lng = combined_geom[idx][1]
                else:
                    stop.lat = c_lat
                    stop.lng = c_lon

        # 5. Return complete DTO dictionary matching API contract
        return plan_result.to_dict()
