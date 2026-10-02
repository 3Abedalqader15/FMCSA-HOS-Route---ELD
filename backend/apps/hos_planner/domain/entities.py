"""
FMCSA HOS Domain Entities & Value Objects (Pure Python, Zero Framework Dependencies)
Adheres strictly to 49 CFR Part 395 regulations.
"""

from enum import IntEnum
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


class DutyStatus(IntEnum):
    """
    Standard FMCSA 4-Row Record of Duty Status (RODS)
    Row 1: Off Duty
    Row 2: Sleeper Berth
    Row 3: Driving
    Row 4: On Duty (Not Driving)
    """
    OFF_DUTY = 1
    SLEEPER_BERTH = 2
    DRIVING = 3
    ON_DUTY = 4

    @property
    def code(self) -> str:
        mapping = {
            DutyStatus.OFF_DUTY: "OFF_DUTY",
            DutyStatus.SLEEPER_BERTH: "SLEEPER_BERTH",
            DutyStatus.DRIVING: "DRIVING",
            DutyStatus.ON_DUTY: "ON_DUTY",
        }
        return mapping[self]

    @property
    def display_name(self) -> str:
        mapping = {
            DutyStatus.OFF_DUTY: "Off Duty",
            DutyStatus.SLEEPER_BERTH: "Sleeper Berth",
            DutyStatus.DRIVING: "Driving",
            DutyStatus.ON_DUTY: "On Duty (Not Driving)",
        }
        return mapping[self]

    @classmethod
    def from_string(cls, val: str) -> "DutyStatus":
        normalized = val.strip().upper()
        if "SLEEP" in normalized:
            return cls.SLEEPER_BERTH
        elif "DRIV" in normalized:
            return cls.DRIVING
        elif "NOT_DRIVING" in normalized or "ON_DUTY" in normalized or normalized == "ON":
            return cls.ON_DUTY
        else:
            return cls.OFF_DUTY


@dataclass
class DutyInterval:
    """
    Continuous block of duty status within a single 24-hour log day (0.0 to 24.0 hours).
    """
    status: DutyStatus
    start_time: float  # Hours from 0.0 to 24.0
    end_time: float    # Hours from 0.0 to 24.0
    duration: float    # Hours
    location: str
    remark: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status.code,
            "status_name": self.status.display_name,
            "status_row": int(self.status),
            "start": round(self.start_time, 2),
            "end": round(self.end_time, 2),
            "duration": round(self.duration, 2),
            "location": self.location,
            "remark": self.remark,
        }


@dataclass
class Remark:
    """
    Driver RODS official remark entry.
    """
    time_str: str      # "HH:MM"
    time_hours: float  # 0.0 - 24.0
    status: str        # "OFF_DUTY", etc.
    location: str
    remark: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "time": self.time_str,
            "time_hours": round(self.time_hours, 2),
            "status": self.status,
            "location": self.location,
            "remark": self.remark,
        }


@dataclass
class DailyLog:
    """
    Official 24-Hour Driver Daily Log Sheet (Midnight-to-Midnight).
    CRITICAL INVARIANT: total_hrs == 24.0
    """
    day_number: int
    date_str: str
    intervals: List[DutyInterval] = field(default_factory=list)
    remarks: List[Remark] = field(default_factory=list)
    off_duty_hrs: float = 0.0
    sleeper_hrs: float = 0.0
    driving_hrs: float = 0.0
    on_duty_hrs: float = 0.0
    total_hrs: float = 24.0
    miles_today: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "day_number": self.day_number,
            "date": self.date_str,
            "miles_today": round(self.miles_today, 1),
            "hours_summary": {
                "OFF_DUTY": round(self.off_duty_hrs, 2),
                "SLEEPER_BERTH": round(self.sleeper_hrs, 2),
                "DRIVING": round(self.driving_hrs, 2),
                "ON_DUTY": round(self.on_duty_hrs, 2),
                "TOTAL": round(self.total_hrs, 2),
            },
            "duty_intervals": [i.to_dict() for i in self.intervals],
            "remarks": [r.to_dict() for r in self.remarks],
        }


@dataclass
class PlannedStop:
    """
    A scheduled waypoint or operational stop along the route.
    """
    name: str
    stop_type: str  # "START", "PICKUP", "REST_BREAK", "DAILY_RESET", "FUEL", "DROPOFF"
    location: str
    duration_hours: float
    duty_status: str
    accumulated_miles: float
    arrival_time_hrs: float
    remark: str
    lat: Optional[float] = None
    lng: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "type": self.stop_type,
            "location": self.location,
            "duration_hours": round(self.duration_hours, 2),
            "duty_status": self.duty_status,
            "accumulated_miles": round(self.accumulated_miles, 1),
            "arrival_time_hrs": round(self.arrival_time_hrs, 2),
            "remark": self.remark,
            "lat": self.lat,
            "lng": self.lng,
        }


@dataclass
class TripSummary:
    """
    Executive statistics and metrics for the trip.
    """
    total_miles: float
    total_driving_hours: float
    total_duration_hours: float
    fuel_stops_count: int
    mandatory_rest_stops_count: int
    daily_reset_stops_count: int
    cycle_reset_stops_count: int
    pickup_location: str
    dropoff_location: str
    initial_cycle_used: float
    final_cycle_used: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_miles": round(self.total_miles, 1),
            "total_driving_hours": round(self.total_driving_hours, 2),
            "total_duration_hours": round(self.total_duration_hours, 2),
            "fuel_stops_count": self.fuel_stops_count,
            "mandatory_rest_stops_count": self.mandatory_rest_stops_count,
            "daily_reset_stops_count": self.daily_reset_stops_count,
            "cycle_reset_stops_count": self.cycle_reset_stops_count,
            "pickup_location": self.pickup_location,
            "dropoff_location": self.dropoff_location,
            "initial_cycle_used": round(self.initial_cycle_used, 1),
            "final_cycle_used": round(self.final_cycle_used, 1),
        }


@dataclass
class TripPlanResult:
    """
    Complete output DTO matching API contract.
    """
    trip_summary: TripSummary
    route_coordinates: List[List[float]]
    stops: List[PlannedStop]
    daily_logs: List[DailyLog]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trip_summary": self.trip_summary.to_dict(),
            "route_coordinates": self.route_coordinates,
            "stops": [s.to_dict() for s in self.stops],
            "daily_logs": [d.to_dict() for d in self.daily_logs],
        }
