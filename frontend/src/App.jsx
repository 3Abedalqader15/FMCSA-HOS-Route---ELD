import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TripForm from './components/TripForm';
import TripStats from './components/TripStats';
import RouteMap from './components/RouteMap';
import EldLogSheet from './components/EldLogSheet';
import { planTrip, checkApiHealth } from './services/api';
import { TRIP_PRESETS } from './domain/presets';
import { AlertCircle, FileText, CheckCircle2, MapPin, Printer } from 'lucide-react';

export default function App() {
  // Trip Input Form State - Defaults to Official FMCSA Guide Scenario
  const [formData, setFormData] = useState({
    current_location: 'Chicago, IL',
    pickup_location: 'Indianapolis, IN',
    dropoff_location: 'Dallas, TX',
    current_cycle_used: '15.5',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tripResult, setTripResult] = useState(null);
  const [selectedDayTab, setSelectedDayTab] = useState('ALL'); // 'ALL' or day index
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Check backend health on mount
  useEffect(() => {
    async function verifyHealth() {
      const health = await checkApiHealth();
      setIsBackendOnline(!!health);
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Form submission handler
  const handleCalculateTrip = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await planTrip(formData);
      setTripResult(result);
      setSelectedDayTab('ALL');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to calculate trip. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Preset button handler
  const handleSelectPreset = (presetData) => {
    setFormData(presetData);
    setErrorMessage('');
  };

  // Print ELD sheets handler
  const handlePrint = () => {
    window.print();
  };

  const displayedLogs =
    tripResult?.daily_logs && selectedDayTab !== 'ALL'
      ? [tripResult.daily_logs.find((l) => l.day_number === Number(selectedDayTab))].filter(Boolean)
      : tripResult?.daily_logs || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Sticky Navbar */}
      <Navbar isBackendOnline={isBackendOnline} onPrint={tripResult ? handlePrint : null} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 shadow-lg">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-bold text-sm">Calculation Error</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Statistics */}
          <div className="lg:col-span-5 space-y-6">
            <TripForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCalculateTrip}
              isLoading={isLoading}
              onSelectPreset={handleSelectPreset}
            />

            {/* Trip Statistics & 70h Gauge */}
            {tripResult && (
              <TripStats
                tripSummary={tripResult.trip_summary}
                logsCount={tripResult.daily_logs?.length || 0}
              />
            )}
          </div>

          {/* Right Column: Route Map & Visual Route Waypoints */}
          <div className="lg:col-span-7 space-y-6">
            <RouteMap
              routeCoordinates={tripResult?.route_coordinates || []}
              stops={tripResult?.stops || []}
            />

            {/* Quick Waypoints Timeline Preview */}
            {tripResult && tripResult.stops && (
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    Trip Itinerary & Duty Waypoints ({tripResult.stops.length} Milestones)
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total Miles: {tripResult.trip_summary?.total_miles} mi
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {tripResult.stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 w-48 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 truncate">{stop.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          {stop.duty_status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{stop.location}</p>
                      <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 font-mono">
                        <span>{stop.duration_hours}h duration</span>
                        <span>{stop.accumulated_miles} mi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Official ELD Driver Logs Section */}
        {tripResult && tripResult.daily_logs && tripResult.daily_logs.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-slate-800">
            {/* Section Header & Tab Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-400" />
                  Official Driver Duty Logs (ELD Sheets)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Full 24-Hour midnight-to-midnight records strictly compliant with FMCSA Part 395
                </p>
              </div>

              {/* Day Tab Switcher */}
              <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedDayTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedDayTab === 'ALL'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Days ({tripResult.daily_logs.length})
                </button>
                {tripResult.daily_logs.map((log) => (
                  <button
                    key={log.day_number}
                    type="button"
                    onClick={() => setSelectedDayTab(log.day_number)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      selectedDayTab === log.day_number
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Day #{log.day_number}
                  </button>
                ))}
              </div>
            </div>

            {/* Rendered ELD Log Sheets */}
            <div className="space-y-8">
              {displayedLogs.map((log) => (
                <EldLogSheet
                  key={log.day_number}
                  log={log}
                  tripInfo={tripResult.trip_summary}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 text-slate-500 py-6 text-center text-xs space-y-1">
        <p className="font-semibold text-slate-400">
          FMCSA HOS Route & Electronic Logging Device (ELD) System
        </p>
        <p>
          Compliant with 49 CFR Part 395 Commercial Motor Vehicle Driver Regulations (Property-Carrying 70hr/8-Day Rule).
        </p>
      </footer>
    </div>
  );
}
