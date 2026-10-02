/**
 * Official FMCSA HOS Demo Presets for One-Click Evaluation
 */

export const TRIP_PRESETS = [
  {
    id: 'fmcsa-official',
    title: 'Preset 1: Official FMCSA Guide',
    badge: 'FMCSA §395 Standard',
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700',
    description: 'Chicago ➔ Indianapolis ➔ Dallas (1,100 mi, 10h Overnight Reset, Fuel Stop)',
    data: {
      current_location: 'Chicago, IL',
      pickup_location: 'Indianapolis, IN',
      dropoff_location: 'Dallas, TX',
      current_cycle_used: '15.5',
    }
  },
  {
    id: 'cross-country',
    title: 'Preset 2: Cross-Country Long Haul',
    badge: 'Multi-Day Transcontinental',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    description: 'Los Angeles ➔ Phoenix ➔ Atlanta (2,200+ mi, Multi-day 10h Resets & Fueling)',
    data: {
      current_location: 'Los Angeles, CA',
      pickup_location: 'Phoenix, AZ',
      dropoff_location: 'Atlanta, GA',
      current_cycle_used: '25.0',
    }
  },
  {
    id: 'cycle-reset',
    title: 'Preset 3: Near Cycle Limit (34h Restart)',
    badge: '70h Limit & 34h Reset',
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700',
    description: 'Seattle ➔ Boise ➔ Salt Lake City (Starts with 64h used ➔ Triggers 34h Restart)',
    data: {
      current_location: 'Seattle, WA',
      pickup_location: 'Boise, ID',
      dropoff_location: 'Salt Lake City, UT',
      current_cycle_used: '64.0',
    }
  }
];
