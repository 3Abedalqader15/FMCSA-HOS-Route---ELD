/**
 * API Service for FMCSA HOS Route & ELD Planner.
 * Supports configurable VITE_API_URL and robust error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function planTrip(tripData) {
  const url = `${API_BASE_URL}/api/plan-trip/`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_location: tripData.current_location.trim(),
        pickup_location: tripData.pickup_location.trim(),
        dropoff_location: tripData.dropoff_location.trim(),
        current_cycle_used: parseFloat(tripData.current_cycle_used) || 0.0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error ||
        (data.details && Object.values(data.details).flat().join(' ')) ||
        data.message ||
        `Server responded with HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        `Unable to reach backend API at ${API_BASE_URL}. Ensure Django server is running on port 8000.`
      );
    }
    throw error;
  }
}

export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health/`, {
      method: 'GET',
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}
