import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Printer } from 'lucide-react';
import EldLogSheet from '../components/EldLogSheet';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';

export default function EldLogsPage({ tripResult }) {
  const navigate = useNavigate();
  const [selectedDayTab, setSelectedDayTab] = useState('ALL');

  if (!tripResult?.daily_logs?.length) {
    return (
      <GlassCard>
        <EmptyState
          icon={FileText}
          title="No ELD Logs Generated"
          description="Calculate a trip route first to generate FMCSA-compliant ELD daily log sheets."
          action={() => navigate('/planner')}
          actionLabel="Go to Trip Planner"
        />
      </GlassCard>
    );
  }

  const displayedLogs =
    selectedDayTab !== 'ALL'
      ? [tripResult.daily_logs.find((l) => l.day_number === Number(selectedDayTab))].filter(Boolean)
      : tripResult.daily_logs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            Electronic Logging Device Sheets
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {tripResult.daily_logs.length} day(s) — 24-Hour FMCSA Part 395 compliant logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-glass)]">
            <button
              onClick={() => setSelectedDayTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDayTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Days
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

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print All
          </button>
        </div>
      </div>

      {/* Log Sheets */}
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
    </div>
  );
}
