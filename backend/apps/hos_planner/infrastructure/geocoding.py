"""
Geocoding Service using OpenStreetMap Nominatim with robust in-memory caching
and comprehensive fallback coordinates for major US logistics hubs.
"""

import requests
from typing import Tuple, Dict, Optional

# In-memory geocoding cache: query_string -> (lat, lon, display_name)
_GEOCODE_CACHE: Dict[str, Tuple[float, float, str]] = {}

# Built-in US major freight & logistics hub fallback coordinates
US_FALLBACK_CITIES: Dict[str, Tuple[float, float, str]] = {
    # Official Scenario Hubs
    "chicago": (41.8781, -87.6298, "Chicago, Illinois, USA"),
    "indianapolis": (39.7684, -86.1581, "Indianapolis, Indiana, USA"),
    "dallas": (32.7767, -96.7970, "Dallas, Texas, USA"),
    "st. louis": (38.6270, -90.1994, "St. Louis, Missouri, USA"),
    "st louis": (38.6270, -90.1994, "St. Louis, Missouri, USA"),
    # West Coast & Mountain Hubs
    "los angeles": (34.0522, -118.2437, "Los Angeles, California, USA"),
    "phoenix": (33.4484, -112.0740, "Phoenix, Arizona, USA"),
    "seattle": (47.6062, -122.3321, "Seattle, Washington, USA"),
    "boise": (43.6150, -116.2023, "Boise, Idaho, USA"),
    "salt lake city": (40.7608, -111.8910, "Salt Lake City, Utah, USA"),
    "denver": (39.7392, -104.9903, "Denver, Colorado, USA"),
    "san francisco": (37.7749, -122.4194, "San Francisco, California, USA"),
    "las vegas": (36.1699, -115.1398, "Las Vegas, Nevada, USA"),
    "portland": (45.5152, -122.6784, "Portland, Oregon, USA"),
    # Southern & Gulf Hubs
    "atlanta": (33.7490, -84.3880, "Atlanta, Georgia, USA"),
    "houston": (29.7604, -95.3698, "Houston, Texas, USA"),
    "san antonio": (29.4241, -98.4936, "San Antonio, Texas, USA"),
    "austin": (30.2672, -97.7431, "Austin, Texas, USA"),
    "new orleans": (29.9511, -90.0715, "New Orleans, Louisiana, USA"),
    "memphis": (35.1495, -90.0490, "Memphis, Tennessee, USA"),
    "nashville": (36.1627, -86.7816, "Nashville, Tennessee, USA"),
    "miami": (25.7617, -80.1918, "Miami, Florida, USA"),
    "orlando": (28.5383, -81.3792, "Orlando, Florida, USA"),
    # Midwest & East Coast Hubs
    "kansas city": (39.0997, -94.5786, "Kansas City, Missouri, USA"),
    "detroit": (42.3314, -83.0458, "Detroit, Michigan, USA"),
    "columbus": (39.9612, -82.9988, "Columbus, Ohio, USA"),
    "cleveland": (41.4993, -81.6944, "Cleveland, Ohio, USA"),
    "cincinnati": (39.1031, -84.5120, "Cincinnati, Ohio, USA"),
    "minneapolis": (44.9778, -93.2650, "Minneapolis, Minnesota, USA"),
    "milwaukee": (43.0389, -87.9065, "Milwaukee, Wisconsin, USA"),
    "new york": (40.7128, -74.0060, "New York, New York, USA"),
    "philadelphia": (39.9526, -75.1652, "Philadelphia, Pennsylvania, USA"),
    "boston": (42.3601, -71.0589, "Boston, Massachusetts, USA"),
    "washington": (38.9072, -77.0369, "Washington, District of Columbia, USA"),
    "charlotte": (35.2271, -80.8431, "Charlotte, North Carolina, USA"),
}


def geocode_location(location_name: str) -> Tuple[float, float, str]:
    """
    Geocode a city/location name to (latitude, longitude, display_name).
    Uses caching, Nominatim API with proper headers, and robust US dictionary fallback.
    """
    clean_query = location_name.strip()
    cache_key = clean_query.lower()

    if cache_key in _GEOCODE_CACHE:
        return _GEOCODE_CACHE[cache_key]

    # Check fallback dictionary first for instant response on standard cities
    for city_key, coords in US_FALLBACK_CITIES.items():
        if city_key in cache_key:
            _GEOCODE_CACHE[cache_key] = coords
            return coords

    # Try OpenStreetMap Nominatim API
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": clean_query,
        "format": "json",
        "limit": 1,
        "addressdetails": 0,
    }
    headers = {
        "User-Agent": "FMCSA-HOS-Route-Planner/1.0 (Commercial CMV Safety Simulation; contact@hosplanner.io)"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=4)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                disp = data[0].get("display_name", clean_query)
                result = (lat, lon, disp)
                _GEOCODE_CACHE[cache_key] = result
                return result
    except Exception:
        pass

    # Secondary heuristic fallback
    for city_key, coords in US_FALLBACK_CITIES.items():
        city_parts = city_key.split()
        if any(part in cache_key for part in city_parts if len(part) > 3):
            _GEOCODE_CACHE[cache_key] = coords
            return coords

    # Ultimate default: Geographic center of Continental US
    fallback = (39.8283, -98.5795, f"{clean_query}, USA")
    _GEOCODE_CACHE[cache_key] = fallback
    return fallback
