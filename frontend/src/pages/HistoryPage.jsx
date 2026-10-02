import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Trash2, MapPin, Clock, Route, ArrowRight, AlertTriangle, X,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { getTripHistory, deleteTripFromHistory, clearTripHistory } from '../services/storage';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => getTripHistory());
  const [showClearModal, setShowClearModal] = useState(false);

  const handleDelete = (id) => {
    const updated = deleteTripFromHistory(id);
    setHistory(updated);
    toast.success('Trip removed from history', {
      style: {
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--glass-border)',
      },
    });
  };

  const handleClearAll = () => {
    clearTripHistory();
    setHistory([]);
    setShowClearModal(false);
    toast.success('All history cleared', {
      style: {
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--glass-border)',
      },
    });
  };

  if (history.length === 0) {
    return (
      <GlassCard>
        <EmptyState
          icon={History}
          title="No Trip History"
          description="Calculated trips will be saved here automatically. Go plan your first route!"
          action={() => navigate('/planner')}
          actionLabel="Plan a Trip"
        />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <History className="h-6 w-6 text-blue-400" />
            Trip History
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {history.length} saved trip(s) — stored locally in your browser
          </p>
        </div>
        <button
          onClick={() => setShowClearModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </button>
      </div>

      {/* Trip Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {history.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover className="!p-5 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                      <Route className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{trip.routeLabel}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">
                        {new Date(trip.timestamp).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete trip"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-[var(--bg-tertiary)]">
                    <p className="text-lg font-bold font-mono text-[var(--text-primary)]">{trip.totalMiles}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">miles</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[var(--bg-tertiary)]">
                    <p className="text-lg font-bold font-mono text-blue-400">{trip.totalDrivingHours}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">drive hrs</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[var(--bg-tertiary)]">
                    <p className="text-lg font-bold font-mono text-emerald-400">{trip.dailyLogsCount}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">log days</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge variant="blue" size="xs">{trip.stopsCount} stops</StatusBadge>
                  <StatusBadge variant="emerald" size="xs">
                    {trip.formData?.current_cycle_used || '0'}h cycle used
                  </StatusBadge>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClearModal(false)}
          >
            <motion.div
              className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Clear All History?</h3>
                  <p className="text-xs text-[var(--text-muted)]">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--glass-border)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold cursor-pointer transition-colors"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
