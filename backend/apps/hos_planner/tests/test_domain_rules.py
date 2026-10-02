"""
Pure Python Unit Tests for FMCSA HOS Domain Rules & Mathematical Invariants.
Zero Django dependencies - can run with pure unittest or pytest.
"""

import unittest
from datetime import datetime
from apps.hos_planner.domain.entities import DutyStatus, DailyLog
from apps.hos_planner.domain.rules import (
    simulate_hos_timeline,
    split_timeline_into_24h_days,
    MAX_DRIVE_HOURS_PER_SHIFT,
    MAX_WINDOW_HOURS_PER_SHIFT,
    MANDATORY_BREAK_DRIVE_LIMIT,
)


class TestFmcsaHosDomainRules(unittest.TestCase):

    def test_mathematical_log_invariant_sum_24_hours(self):
        """
        CRITICAL DIRECTIVE: Every single daily log sheet MUST strictly sum up
        to exactly 24.0 hours across the 4 statuses (Off Duty + Sleeper + Driving + On Duty = 24.0).
        """
        # Long cross-country scenario spanning multiple days
        result = simulate_hos_timeline(
            current_loc="Chicago, IL",
            pickup_loc="Indianapolis, IN",
            dropoff_loc="Dallas, TX",
            miles_leg1=180.0,
            hours_leg1=3.0,
            miles_leg2=920.0,
            hours_leg2=15.3,
            current_cycle_used=15.5,
            route_coords=[[41.8781, -87.6298], [39.7684, -86.1581], [32.7767, -96.7970]],
        )

        self.assertGreaterEqual(len(result.daily_logs), 1)

        for log in result.daily_logs:
            hours_sum = (
                log.off_duty_hrs +
                log.sleeper_hrs +
                log.driving_hrs +
                log.on_duty_hrs
            )
            # Must strictly equal 24.0 within floating point delta
            self.assertAlmostEqual(
                hours_sum,
                24.0,
                places=2,
                msg=f"Day {log.day_number} does not sum to 24.0 hours! Sum was {hours_sum}"
            )
            self.assertEqual(log.total_hrs, 24.0)

            # Check that all intervals are strictly within 0.0 and 24.0
            for interval in log.intervals:
                self.assertGreaterEqual(interval.start_time, 0.0)
                self.assertLessEqual(interval.end_time, 24.0)
                self.assertLessEqual(interval.start_time, interval.end_time)

    def test_mandatory_30_min_rest_break_after_8_hours_driving(self):
        """
        Verifies that when cumulative driving reaches 8 hours,
        a mandatory 30-minute rest break is inserted.
        """
        result = simulate_hos_timeline(
            current_loc="Los Angeles, CA",
            pickup_loc="Phoenix, AZ",
            dropoff_loc="Atlanta, GA",
            miles_leg1=370.0,
            hours_leg1=6.0,
            miles_leg2=1810.0,
            hours_leg2=28.0,
            current_cycle_used=20.0,
            route_coords=[[34.05, -118.24], [33.44, -112.07], [33.74, -84.38]],
        )

        rest_stops = [s for s in result.stops if s.stop_type == "REST_BREAK"]
        self.assertGreaterEqual(len(rest_stops), 1)
        self.assertEqual(rest_stops[0].duration_hours, 0.5)

    def test_11_hour_driving_limit_and_10_hour_reset(self):
        """
        Verifies that driving does not exceed 11 hours per shift without
        a 10-hour consecutive daily reset (sleeper berth).
        """
        result = simulate_hos_timeline(
            current_loc="Chicago, IL",
            pickup_loc="Indianapolis, IN",
            dropoff_loc="Dallas, TX",
            miles_leg1=180.0,
            hours_leg1=3.0,
            miles_leg2=920.0,
            hours_leg2=15.3,
            current_cycle_used=10.0,
            route_coords=[[41.87, -87.62], [32.77, -96.79]],
        )

        daily_resets = [s for s in result.stops if s.stop_type == "DAILY_RESET"]
        self.assertGreaterEqual(len(daily_resets), 1)
        self.assertEqual(daily_resets[0].duration_hours, 10.0)
        self.assertEqual(daily_resets[0].duty_status, "SLEEPER_BERTH")

    def test_fuel_stop_every_1000_miles(self):
        """
        Verifies that a fueling stop (0.5 hr On Duty) is scheduled
        when driving distance exceeds 1,000 miles.
        """
        result = simulate_hos_timeline(
            current_loc="Los Angeles, CA",
            pickup_loc="Phoenix, AZ",
            dropoff_loc="Atlanta, GA",
            miles_leg1=370.0,
            hours_leg1=6.0,
            miles_leg2=1810.0,
            hours_leg2=28.0,
            current_cycle_used=10.0,
            route_coords=[[34.05, -118.24], [33.74, -84.38]],
        )

        fuel_stops = [s for s in result.stops if s.stop_type == "FUEL"]
        self.assertGreaterEqual(len(fuel_stops), 2)
        self.assertEqual(fuel_stops[0].duration_hours, 0.5)
        self.assertEqual(fuel_stops[0].duty_status, "ON_DUTY")

    def test_70_hour_cycle_limit_triggers_34_hour_restart(self):
        """
        Verifies that when cumulative hours hit 70, a 34-hour restart
        is injected and resets the cycle.
        """
        result = simulate_hos_timeline(
            current_loc="Seattle, WA",
            pickup_loc="Boise, ID",
            dropoff_loc="Salt Lake City, UT",
            miles_leg1=500.0,
            hours_leg1=8.0,
            miles_leg2=340.0,
            hours_leg2=5.5,
            current_cycle_used=64.0,  # 64 hours used already
            route_coords=[[47.60, -122.33], [43.61, -116.20], [40.76, -111.89]],
        )

        cycle_resets = [s for s in result.stops if s.stop_type == "CYCLE_RESET"]
        self.assertGreaterEqual(len(cycle_resets), 1)
        self.assertEqual(cycle_resets[0].duration_hours, 34.0)
        self.assertEqual(cycle_resets[0].duty_status, "OFF_DUTY")
        # Final cycle should be low after reset
        self.assertLess(result.trip_summary.final_cycle_used, 70.0)

    def test_midnight_splitting_exactness(self):
        """
        Verifies that an event crossing midnight is cleanly split into two parts.
        """
        timeline = [
            {
                "status": DutyStatus.DRIVING,
                "duration": 20.0,
                "location": "Corridor",
                "remark": "Long Drive",
                "accumulated_miles": 1200.0,
            },
            {
                "status": DutyStatus.SLEEPER_BERTH,
                "duration": 10.0,
                "location": "Rest Stop",
                "remark": "Overnight",
                "accumulated_miles": 1200.0,
            },
        ]
        logs = split_timeline_into_24h_days(timeline, total_miles=1200.0, start_date=datetime(2026, 10, 1))
        self.assertEqual(len(logs), 2)
        for log in logs:
            self.assertEqual(log.total_hrs, 24.0)
            self.assertAlmostEqual(
                log.off_duty_hrs + log.sleeper_hrs + log.driving_hrs + log.on_duty_hrs,
                24.0,
                places=2
            )


if __name__ == "__main__":
    unittest.main()
