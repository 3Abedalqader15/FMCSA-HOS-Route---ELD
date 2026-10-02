import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, FileText, MapPin, Printer } from 'lucide-react';
import TripForm from '../components/TripForm';
import TripStats from '../components/TripStats';
import RouteMap from '../components/RouteMap';
import EldLogSheet from '../components/EldLogSheet';
import RemarksTable from '../components/RemarksTable';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import { planTrip } from '../services/api';
import { saveTripToHistory } from '../services/storage';
import toast from 'react-hot-toast';

export default function TripPlannerPage({ tripResult, setTripResult }) {
  const [formData, setFormData] = useState({
    current_location: 'Chicago, IL',
    pickup_location: 'Indianapolis, IN',
    dropoff_location: 'Dallas, TX',
    current_cycle_used: '15.5',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDayTab, setSelectedDayTab] = useState('ALL');

  const handleCalculateTrip = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await planTrip(formData);
      setTripResult(result);
      setSelectedDayTab('ALL');
      saveTripToHistory(result, formData);
      toast.success('Trip calculated & ELD logs generated!', {
        icon: '🚛',
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--glass-border)',
        },
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to calculate trip.');
      toast.error('Calculation failed — check backend connection.', {
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--glass-border)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (presetData) => {
    setFormData(presetData);
    setErrorMessage('');
  };

  const handlePrint = () => window.print();

  const displayedLogs =
    tripResult?.daily_logs && selectedDayTab !== 'ALL'
      ? [tripResult.daily_logs.find((l) => l.day_number === Number(selectedDayTab))].filter(Boolean)
      : tripResult?.daily_logs || [];

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-bold text-sm text-rose-400">Calculation Error</p>
              <p className="text-xs text-rose-300/80 mt-0.5">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2-Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Form & Stats */}
        <div className="lg:col-span-5 space-y-6">
          <TripForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCalculateTrip}
            isLoading={isLoading}
            onSelectPreset={handleSelectPreset}
          />

          <AnimatePresence>
            {tripResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <TripStats
                  tripSummary={tripResult.trip_summary}
                  logsCount={tripResult.daily_logs?.length || 0}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Map & Waypoints */}
        <div className="lg:col-span-7 space-y-6">
          <RouteMap
            routeCoordinates={tripResult?.route_coordinates || []}
            stops={tripResult?.stops || []}
          />

          {/* Waypoints Timeline */}
          <AnimatePresence>
            {tripResult?.stops && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="!p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-2">
                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      Trip Itinerary ({tripResult.stops.length} Milestones)
                    </h4>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      Total: {tripResult.trip_summary?.total_miles} mi
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {tripResult.stops.map((stop, idx) => (
                      <motion.div
                        key={idx}
                        className="shrink-0 w-48 p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--glass-border)] text-xs space-y-1 hover:border-[var(--border-active)] transition-colors"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-primary)] truncate">{stop.name}</span>
                          <StatusBadge variant="blue" size="xs">{stop.duty_status}</StatusBadge>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">{stop.location}</p>
                        <div className="flex justify-between text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--glass-border)] font-mono">
                          <span>{stop.duration_hours}h</span>
                          <span>{stop.accumulated_miles} mi</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ELD Log Sheets */}
      <AnimatePresence>
        {tripResult?.daily_logs?.length > 0 && (
          <motion.div
            className="space-y-6 pt-6 border-t border-[var(--glass-border)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Section Header & Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-400" />
                  Official Driver Duty Logs (ELD Sheets)
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  24-Hour midnight-to-midnight records — FMCSA Part 395 compliant
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Day Tabs */}
                <div className="flex items-center gap-1 p-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-glass)]">
                  <button
                    onClick={() => setSelectedDayTab('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedDayTab === 'ALL'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    All ({tripResult.daily_logs.length})
                  </button>
                  {tripResult.daily_logs.map((log) => (
                    <button
                      key={log.day_number}
                      onClick={() => setSelectedDayTab(log.day_number)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedDayTab === log.day_number
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Day {log.day_number}
                    </button>
                  ))}
                </div>

                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            {/* ELD Sheets */}
            <div className="space-y-8">
              {displayedLogs.map((log) => (
                <motion.div
                  key={log.day_number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <EldLogSheet log={log} tripInfo={tripResult.trip_summary} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
