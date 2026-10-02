/**
 * Trip History Storage Service
 * Persists calculated trip results in localStorage for the History page.
 */

const STORAGE_KEY = 'fmcsa-trip-history';
const MAX_HISTORY = 50;

export function getTripHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTripToHistory(tripResult, formData) {
  const history = getTripHistory();
  const entry = {
    id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    formData: { ...formData },
    tripSummary: tripResult.trip_summary || null,
    dailyLogsCount: tripResult.daily_logs?.length || 0,
    stopsCount: tripResult.stops?.length || 0,
    totalMiles: tripResult.trip_summary?.total_miles || 0,
    totalDrivingHours: tripResult.trip_summary?.total_driving_hours || 0,
    routeLabel: `${formData.current_location} → ${formData.pickup_location} → ${formData.dropoff_location}`,
  };

  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save trip history:', e);
  }

  return entry;
}

export function deleteTripFromHistory(tripId) {
  const history = getTripHistory().filter((t) => t.id !== tripId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
}

export function clearTripHistory() {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}
