"""
Routing Service using Open Source Routing Machine (OSRM) with in-memory caching
and robust great-circle interpolated polyline fallbacks.
"""

import math
import requests
from typing import Tuple, List, Dict

# In-memory routing cache: "lat1,lon1;lat2,lon2" -> (miles, hours, polyline_coords)
_ROUTE_CACHE: Dict[str, Tuple[float, float, List[List[float]]]] = {}


def _haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance in miles."""
    R = 3958.8  # Earth radius in miles
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _interpolate_polyline(lat1: float, lon1: float, lat2: float, lon2: float, points: int = 25) -> List[List[float]]:
    """Generates smooth interpolated lat/lng waypoints between two coordinates."""
    coords = []
    for i in range(points + 1):
        ratio = i / float(points)
        # Add slight realistic curvature to straight-line interpolation
        curve = math.sin(ratio * math.pi) * 0.3 * (0.5 if (lat2 - lat1) > 0 else -0.5)
        lat = lat1 + (lat2 - lat1) * ratio + curve * 0.2
        lon = lon1 + (lon2 - lon1) * ratio - curve * 0.2
        coords.append([round(lat, 5), round(lon, 5)])
    return coords


def calculate_osrm_route(
    start_coords: Tuple[float, float],
    end_coords: Tuple[float, float],
) -> Tuple[float, float, List[List[float]]]:
    """
    Computes highway route between two coordinates via OSRM.
    Returns:
        (total_miles, duration_hours, [[lat, lon], ...])
    """
    lat1, lon1 = start_coords
    lat2, lon2 = end_coords

    cache_key = f"{lat1:.4f},{lon1:.4f};{lat2:.4f},{lon2:.4f}"
    if cache_key in _ROUTE_CACHE:
        return _ROUTE_CACHE[cache_key]

    # OSRM expects coordinates in {lon},{lat} format
    url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"

    try:
        response = requests.get(url, timeout=6)
        if response.status_code == 200:
            data = response.json()
            if data.get("code") == "Ok" and data.get("routes"):
                primary_route = data["routes"][0]
                distance_meters = primary_route["distance"]
                duration_seconds = primary_route["duration"]
                raw_geometry = primary_route["geometry"]["coordinates"]  # [[lon, lat], ...]

                miles = distance_meters * 0.000621371
                duration_hours = duration_seconds / 3600.0

                # Convert to Leaflet [[lat, lon], ...]
                leaflet_coords = [[pt[1], pt[0]] for pt in raw_geometry]

                # Decimate coordinates if too dense to keep JSON payload lightweight
                step = max(1, len(leaflet_coords) // 250)
                sampled_coords = leaflet_coords[::step]
                if leaflet_coords[-1] not in sampled_coords:
                    sampled_coords.append(leaflet_coords[-1])

                result = (round(miles, 1), round(duration_hours, 2), sampled_coords)
                _ROUTE_CACHE[cache_key] = result
                return result
    except Exception:
        pass

    # Reliable fallback: Great circle distance * 1.25 (interstate circuity factor)
    haversine_dist = _haversine_miles(lat1, lon1, lat2, lon2)
    estimated_miles = max(35.0, haversine_dist * 1.25)
    # Commercial truck driving speed: 60 mph average
    estimated_hours = estimated_miles / 60.0
    fallback_polyline = _interpolate_polyline(lat1, lon1, lat2, lon2, points=30)

    result = (round(estimated_miles, 1), round(estimated_hours, 2), fallback_polyline)
    _ROUTE_CACHE[cache_key] = result
    return result
