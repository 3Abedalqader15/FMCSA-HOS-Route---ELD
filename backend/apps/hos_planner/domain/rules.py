"""
FMCSA HOS Domain Rules Engine & 24-Hour Day Splitting Algorithm.
Pure Python - Zero Django dependencies.
Implements 49 CFR Part 395 with mathematical precision.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional
from .entities import (
    DutyStatus,
    DutyInterval,
    Remark,
    DailyLog,
    PlannedStop,
    TripSummary,
    TripPlanResult,
)


# Constants for FMCSA Part 395 Property-Carrying CMVs
MAX_DRIVE_HOURS_PER_SHIFT = 11.0     # §395.3(a)(3)(i)
MAX_WINDOW_HOURS_PER_SHIFT = 14.0    # §395.3(a)(2)
MANDATORY_BREAK_DRIVE_LIMIT = 8.0    # §395.3(a)(3)(ii)
MANDATORY_BREAK_DURATION = 0.5       # 30 minutes
DAILY_RESET_REST_DURATION = 10.0     # 10 consecutive hours rest §395.3(a)(1)
WEEKLY_CYCLE_LIMIT_HOURS = 70.0      # 70 hours in 8 days §395.3(b)(2)
RESTART_CYCLE_DURATION = 34.0        # 34-hour restart §395.3(d)
FUEL_CHECK_MILES_INTERVAL = 1000.0   # Operational rule: Fuel stop every 1,000 miles
FUEL_STOP_DURATION = 0.5             # 30 minutes On-Duty
PRE_TRIP_INSPECTION_DURATION = 0.25  # 15 minutes On-Duty
POST_TRIP_INSPECTION_DURATION = 0.25 # 15 minutes On-Duty
PICKUP_DURATION = 1.0                # 1 hour On-Duty loading
DROPOFF_DURATION = 1.0               # 1 hour On-Duty unloading
DEFAULT_TRUCK_SPEED_MPH = 60.0       # Standard commercial average speed


def simulate_hos_timeline(
    current_loc: str,
    pickup_loc: str,
    dropoff_loc: str,
    miles_leg1: float,
    hours_leg1: float,
    miles_leg2: float,
    hours_leg2: float,
    current_cycle_used: float,
    route_coords: List[List[float]],
    start_date: Optional[datetime] = None,
) -> TripPlanResult:
    """
    Simulates a complete commercial driving trip obeying all FMCSA regulations.
    Generates a continuous timeline of events and transforms them into 24-hour midnight-to-midnight logs.
    """
    if start_date is None:
        start_date = datetime.now()

    total_miles = miles_leg1 + miles_leg2
    timeline: List[Dict[str, Any]] = []
    planned_stops: List[PlannedStop] = []

    # Counters and Tracking Variables
    current_shift_drive = 0.0
    current_shift_window = 0.0
    continuous_drive_since_break = 0.0
    miles_since_last_fuel = 0.0
    total_cycle_used = float(current_cycle_used)
    total_elapsed_time = 0.0
    total_driving_time = 0.0
    accumulated_miles = 0.0

    fuel_stops_count = 0
    mandatory_rest_stops_count = 0
    daily_reset_stops_count = 0
    cycle_reset_stops_count = 0

    # 1. Start of Trip: Pre-trip Inspection at Current Location (15 mins On-Duty)
    timeline.append({
        "status": DutyStatus.ON_DUTY,
        "duration": PRE_TRIP_INSPECTION_DURATION,
        "location": current_loc,
        "remark": "Pre-Trip Inspection & Dispatch",
        "accumulated_miles": accumulated_miles,
    })
    planned_stops.append(PlannedStop(
        name="Pre-Trip Inspection",
        stop_type="START",
        location=current_loc,
        duration_hours=PRE_TRIP_INSPECTION_DURATION,
        duty_status="ON_DUTY",
        accumulated_miles=accumulated_miles,
        arrival_time_hrs=total_elapsed_time,
        remark="Pre-Trip Inspection (15 min)",
    ))
    current_shift_window += PRE_TRIP_INSPECTION_DURATION
    total_cycle_used += PRE_TRIP_INSPECTION_DURATION
    total_elapsed_time += PRE_TRIP_INSPECTION_DURATION

    # Helper function to advance driving in chunks while checking limits
    def drive_segment(segment_miles: float, segment_hours: float, destination_label: str):
        nonlocal current_shift_drive, current_shift_window, continuous_drive_since_break
        nonlocal miles_since_last_fuel, total_cycle_used, total_elapsed_time, total_driving_time
        nonlocal accumulated_miles, fuel_stops_count, mandatory_rest_stops_count
        nonlocal daily_reset_stops_count, cycle_reset_stops_count

        remaining_drive_hours = segment_hours
        remaining_miles = segment_miles
        avg_speed = segment_miles / max(segment_hours, 0.001)

        while remaining_drive_hours > 0.001:
            # Check 1: 70-Hour Cycle Limit -> 34-Hour Restart
            if total_cycle_used >= WEEKLY_CYCLE_LIMIT_HOURS:
                timeline.append({
                    "status": DutyStatus.OFF_DUTY,
                    "duration": RESTART_CYCLE_DURATION,
                    "location": f"Safe Haven En Route to {destination_label}",
                    "remark": "34-Hour Restart (Cycle Reset)",
                    "accumulated_miles": accumulated_miles,
                })
                planned_stops.append(PlannedStop(
                    name="34-Hour Restart",
                    stop_type="CYCLE_RESET",
                    location=f"Truck Stop ({destination_label} corridor)",
                    duration_hours=RESTART_CYCLE_DURATION,
                    duty_status="OFF_DUTY",
                    accumulated_miles=accumulated_miles,
                    arrival_time_hrs=total_elapsed_time,
                    remark="34-Hour Restart to reset 70h cycle",
                ))
                total_cycle_used = 0.0
                current_shift_drive = 0.0
                current_shift_window = 0.0
                continuous_drive_since_break = 0.0
                total_elapsed_time += RESTART_CYCLE_DURATION
                cycle_reset_stops_count += 1
                continue

            # Check 2: 11-Hour Drive Limit OR 14-Hour Window Limit -> 10-Hour Daily Reset
            if current_shift_drive >= MAX_DRIVE_HOURS_PER_SHIFT or current_shift_window >= MAX_WINDOW_HOURS_PER_SHIFT:
                reason = "11-Hour Driving Limit" if current_shift_drive >= MAX_DRIVE_HOURS_PER_SHIFT else "14-Hour Duty Window Limit"
                timeline.append({
                    "status": DutyStatus.SLEEPER_BERTH,
                    "duration": DAILY_RESET_REST_DURATION,
                    "location": f"Rest Area En Route to {destination_label}",
                    "remark": f"10-Hour Daily Rest ({reason})",
                    "accumulated_miles": accumulated_miles,
                })
                planned_stops.append(PlannedStop(
                    name="10-Hour Daily Rest",
                    stop_type="DAILY_RESET",
                    location=f"Rest Area En Route to {destination_label}",
                    duration_hours=DAILY_RESET_REST_DURATION,
                    duty_status="SLEEPER_BERTH",
                    accumulated_miles=accumulated_miles,
                    arrival_time_hrs=total_elapsed_time,
                    remark=f"10-Hour Sleeper Berth Rest ({reason})",
                ))
                current_shift_drive = 0.0
                current_shift_window = 0.0
                continuous_drive_since_break = 0.0
                total_elapsed_time += DAILY_RESET_REST_DURATION
                daily_reset_stops_count += 1
                continue

            # Check 3: 30-Minute Rest Break after 8 Hours Driving
            if continuous_drive_since_break >= MANDATORY_BREAK_DRIVE_LIMIT:
                timeline.append({
                    "status": DutyStatus.OFF_DUTY,
                    "duration": MANDATORY_BREAK_DURATION,
                    "location": f"Travel Plaza En Route to {destination_label}",
                    "remark": "Mandatory 30-Minute Rest Break (§395.3)",
                    "accumulated_miles": accumulated_miles,
                })
                planned_stops.append(PlannedStop(
                    name="30-Min Rest Break",
                    stop_type="REST_BREAK",
                    location=f"Travel Plaza En Route to {destination_label}",
                    duration_hours=MANDATORY_BREAK_DURATION,
                    duty_status="OFF_DUTY",
                    accumulated_miles=accumulated_miles,
                    arrival_time_hrs=total_elapsed_time,
                    remark="FMCSA Mandatory 30-Minute Rest Break",
                ))
                current_shift_window += MANDATORY_BREAK_DURATION
                total_cycle_used += MANDATORY_BREAK_DURATION
                continuous_drive_since_break = 0.0
                total_elapsed_time += MANDATORY_BREAK_DURATION
                mandatory_rest_stops_count += 1
                continue

            # Check 4: Fuel Stop every 1,000 miles
            if miles_since_last_fuel >= FUEL_CHECK_MILES_INTERVAL:
                timeline.append({
                    "status": DutyStatus.ON_DUTY,
                    "duration": FUEL_STOP_DURATION,
                    "location": f"Commercial Fuel Station En Route to {destination_label}",
                    "remark": f"Fueling Stop ({int(accumulated_miles)} miles)",
                    "accumulated_miles": accumulated_miles,
                })
                planned_stops.append(PlannedStop(
                    name="Fueling Stop",
                    stop_type="FUEL",
                    location=f"Fuel Station ({int(accumulated_miles)} mi)",
                    duration_hours=FUEL_STOP_DURATION,
                    duty_status="ON_DUTY",
                    accumulated_miles=accumulated_miles,
                    arrival_time_hrs=total_elapsed_time,
                    remark="30-minute Fueling & Inspection",
                ))
                current_shift_window += FUEL_STOP_DURATION
                total_cycle_used += FUEL_STOP_DURATION
                miles_since_last_fuel = 0.0
                total_elapsed_time += FUEL_STOP_DURATION
                fuel_stops_count += 1
                continue

            # Determine maximum drive slice allowable before any limit triggers
            max_drive_shift = MAX_DRIVE_HOURS_PER_SHIFT - current_shift_drive
            max_drive_window = MAX_WINDOW_HOURS_PER_SHIFT - current_shift_window
            max_drive_break = MANDATORY_BREAK_DRIVE_LIMIT - continuous_drive_since_break

            # Distance until next fuel stop (in driving hours)
            miles_until_fuel = FUEL_CHECK_MILES_INTERVAL - miles_since_last_fuel
            hours_until_fuel = miles_until_fuel / avg_speed if miles_until_fuel > 0 else 0.01

            # Hours until 70h cycle limit
            hours_until_cycle = WEEKLY_CYCLE_LIMIT_HOURS - total_cycle_used

            drive_slice = min(
                remaining_drive_hours,
                max_drive_shift,
                max_drive_window,
                max_drive_break,
                hours_until_fuel,
                hours_until_cycle,
            )

            if drive_slice <= 0.001:
                # Force limit trigger on next iteration
                continue

            miles_driven = drive_slice * avg_speed

            timeline.append({
                "status": DutyStatus.DRIVING,
                "duration": round(drive_slice, 4),
                "location": f"Highway to {destination_label}",
                "remark": f"Driving to {destination_label}",
                "accumulated_miles": accumulated_miles + miles_driven,
            })

            remaining_drive_hours -= drive_slice
            remaining_miles -= miles_driven
            accumulated_miles += miles_driven
            current_shift_drive += drive_slice
            current_shift_window += drive_slice
            continuous_drive_since_break += drive_slice
            miles_since_last_fuel += miles_driven
            total_cycle_used += drive_slice
            total_driving_time += drive_slice
            total_elapsed_time += drive_slice

    # 2. Leg 1: Drive to Pickup
    drive_segment(miles_leg1, hours_leg1, pickup_loc)

    # 3. Pickup Loading: 1 Hour On-Duty
    timeline.append({
        "status": DutyStatus.ON_DUTY,
        "duration": PICKUP_DURATION,
        "location": pickup_loc,
        "remark": "Loading at Shipper (1 Hr Pickup)",
        "accumulated_miles": accumulated_miles,
    })
    planned_stops.append(PlannedStop(
        name="Shipper (Pickup)",
        stop_type="PICKUP",
        location=pickup_loc,
        duration_hours=PICKUP_DURATION,
        duty_status="ON_DUTY",
        accumulated_miles=accumulated_miles,
        arrival_time_hrs=total_elapsed_time,
        remark="1-Hour Loading at Shipper",
    ))
    current_shift_window += PICKUP_DURATION
    total_cycle_used += PICKUP_DURATION
    total_elapsed_time += PICKUP_DURATION

    # 4. Leg 2: Drive to Dropoff
    drive_segment(miles_leg2, hours_leg2, dropoff_loc)

    # 5. Dropoff Unloading: 1 Hour On-Duty
    timeline.append({
        "status": DutyStatus.ON_DUTY,
        "duration": DROPOFF_DURATION,
        "location": dropoff_loc,
        "remark": "Unloading at Consignee (1 Hr Dropoff)",
        "accumulated_miles": accumulated_miles,
    })
    planned_stops.append(PlannedStop(
        name="Consignee (Dropoff)",
        stop_type="DROPOFF",
        location=dropoff_loc,
        duration_hours=DROPOFF_DURATION,
        duty_status="ON_DUTY",
        accumulated_miles=accumulated_miles,
        arrival_time_hrs=total_elapsed_time,
        remark="1-Hour Unloading at Consignee",
    ))
    current_shift_window += DROPOFF_DURATION
    total_cycle_used += DROPOFF_DURATION
    total_elapsed_time += DROPOFF_DURATION

    # 6. Post-Trip Inspection: 15 minutes On-Duty
    timeline.append({
        "status": DutyStatus.ON_DUTY,
        "duration": POST_TRIP_INSPECTION_DURATION,
        "location": dropoff_loc,
        "remark": "Post-Trip Inspection & Driver Signoff",
        "accumulated_miles": accumulated_miles,
    })
    planned_stops.append(PlannedStop(
        name="Post-Trip Inspection",
        stop_type="FINAL_SIGNOFF",
        location=dropoff_loc,
        duration_hours=POST_TRIP_INSPECTION_DURATION,
        duty_status="ON_DUTY",
        accumulated_miles=accumulated_miles,
        arrival_time_hrs=total_elapsed_time,
        remark="Post-Trip Inspection & Final Signoff",
    ))
    total_cycle_used += POST_TRIP_INSPECTION_DURATION
    total_elapsed_time += POST_TRIP_INSPECTION_DURATION

    # 7. Split continuous timeline into discrete 24.0-hour days
    daily_logs = split_timeline_into_24h_days(timeline, total_miles, start_date)

    trip_summary = TripSummary(
        total_miles=round(total_miles, 1),
        total_driving_hours=round(total_driving_time, 2),
        total_duration_hours=round(total_elapsed_time, 2),
        fuel_stops_count=fuel_stops_count,
        mandatory_rest_stops_count=mandatory_rest_stops_count,
        daily_reset_stops_count=daily_reset_stops_count,
        cycle_reset_stops_count=cycle_reset_stops_count,
        pickup_location=pickup_loc,
        dropoff_location=dropoff_loc,
        initial_cycle_used=round(float(current_cycle_used), 1),
        final_cycle_used=round(total_cycle_used, 1),
    )

    return TripPlanResult(
        trip_summary=trip_summary,
        route_coordinates=route_coords,
        stops=planned_stops,
        daily_logs=daily_logs,
    )


def split_timeline_into_24h_days(
    timeline: List[Dict[str, Any]],
    total_miles: float,
    start_date: datetime,
) -> List[DailyLog]:
    """
    Transforms a continuous chronological stream of events into official 24-hour log days (00:00 to 24:00).
    CRITICAL MATHEMATICAL INVARIANT:
    Every single DailyLog MUST have:
    off_duty + sleeper + driving + on_duty == 24.0 (strictly equal).
    """
    logs: List[DailyLog] = []
    current_day = 1
    current_day_time = 0.0  # 0.0 to 24.0
    day_intervals: List[DutyInterval] = []
    day_remarks: List[Remark] = []
    day_miles = 0.0

    status_accumulators = {
        DutyStatus.OFF_DUTY: 0.0,
        DutyStatus.SLEEPER_BERTH: 0.0,
        DutyStatus.DRIVING: 0.0,
        DutyStatus.ON_DUTY: 0.0,
    }

    def format_hhmm(hours_float: float) -> str:
        h = int(hours_float)
        m = int(round((hours_float % 1.0) * 60))
        if m >= 60:
            h += 1
            m = 0
        h = min(h, 24)
        return f"{h:02d}:{m:02d}"

    def _finalize_and_append_day():
        nonlocal current_day, current_day_time, day_intervals, day_remarks, day_miles, status_accumulators
        log_date = start_date + timedelta(days=current_day - 1)
        date_str = log_date.strftime("%Y-%m-%d")

        # Invariant balance check & exact 24.0 rounding
        off = round(status_accumulators[DutyStatus.OFF_DUTY], 2)
        sleep = round(status_accumulators[DutyStatus.SLEEPER_BERTH], 2)
        driv = round(status_accumulators[DutyStatus.DRIVING], 2)
        on = round(status_accumulators[DutyStatus.ON_DUTY], 2)

        sum_hours = off + sleep + driv + on
        diff = round(24.0 - sum_hours, 2)
        if abs(diff) > 0.0:
            # Adjust Off-Duty by remainder to guarantee exact 24.0
            off = round(off + diff, 2)

        # Merge adjacent identical intervals for cleaner display
        merged_intervals: List[DutyInterval] = []
        for interval in day_intervals:
            if merged_intervals and merged_intervals[-1].status == interval.status and merged_intervals[-1].location == interval.location:
                prev = merged_intervals[-1]
                prev.end_time = interval.end_time
                prev.duration = round(prev.end_time - prev.start_time, 2)
            else:
                merged_intervals.append(interval)

        logs.append(DailyLog(
            day_number=current_day,
            date_str=date_str,
            intervals=merged_intervals,
            remarks=day_remarks,
            off_duty_hrs=off,
            sleeper_hrs=sleep,
            driving_hrs=driv,
            on_duty_hrs=on,
            total_hrs=24.0,
            miles_today=round(total_miles / max(1, len(logs) + 1), 1),
        ))

        current_day += 1
        current_day_time = 0.0
        day_intervals = []
        day_remarks = []
        status_accumulators = {k: 0.0 for k in status_accumulators}

    for event in timeline:
        event_status = event["status"]
        event_duration = event["duration"]
        event_location = event["location"]
        event_remark = event["remark"]
        accum_miles = event.get("accumulated_miles", 0.0)

        while event_duration > 0.0001:
            time_left_in_day = 24.0 - current_day_time

            if event_duration <= time_left_in_day + 1e-6:
                # Event fits entirely within current day
                start_t = current_day_time
                end_t = min(24.0, current_day_time + event_duration)
                duration_in_day = end_t - start_t

                day_intervals.append(DutyInterval(
                    status=event_status,
                    start_time=start_t,
                    end_time=end_t,
                    duration=duration_in_day,
                    location=event_location,
                    remark=event_remark,
                ))

                day_remarks.append(Remark(
                    time_str=format_hhmm(start_t),
                    time_hours=start_t,
                    status=event_status.code,
                    location=event_location,
                    remark=event_remark,
                ))

                status_accumulators[event_status] += duration_in_day
                current_day_time = end_t
                event_duration = 0.0

                # Check if day is full (reached 24.0)
                if abs(current_day_time - 24.0) < 1e-4:
                    _finalize_and_append_day()
            else:
                # Event crosses the midnight boundary (24.0)
                start_t = current_day_time
                end_t = 24.0
                duration_in_day = end_t - start_t

                day_intervals.append(DutyInterval(
                    status=event_status,
                    start_time=start_t,
                    end_time=end_t,
                    duration=duration_in_day,
                    location=event_location,
                    remark=f"{event_remark} (until Midnight)",
                ))

                day_remarks.append(Remark(
                    time_str=format_hhmm(start_t),
                    time_hours=start_t,
                    status=event_status.code,
                    location=event_location,
                    remark=event_remark,
                ))

                status_accumulators[event_status] += duration_in_day
                event_duration -= duration_in_day

                _finalize_and_append_day()

                # Add continuation remark at start of new day (00:00)
                day_remarks.append(Remark(
                    time_str="00:00",
                    time_hours=0.0,
                    status=event_status.code,
                    location=event_location,
                    remark=f"Continuing {event_remark} from previous day",
                ))

    # If the last day has unfinished hours (< 24.0), pad with OFF_DUTY at destination
    if current_day_time > 0.0:
        if current_day_time < 24.0:
            remainder = 24.0 - current_day_time
            day_intervals.append(DutyInterval(
                status=DutyStatus.OFF_DUTY,
                start_time=current_day_time,
                end_time=24.0,
                duration=remainder,
                location=timeline[-1]["location"] if timeline else "Destination",
                remark="Off Duty / Rest at Destination",
            ))
            day_remarks.append(Remark(
                time_str=format_hhmm(current_day_time),
                time_hours=current_day_time,
                status=DutyStatus.OFF_DUTY.code,
                location=timeline[-1]["location"] if timeline else "Destination",
                remark="Off Duty / Rest at Destination",
            ))
            status_accumulators[DutyStatus.OFF_DUTY] += remainder
            current_day_time = 24.0

        _finalize_and_append_day()

    return logs
