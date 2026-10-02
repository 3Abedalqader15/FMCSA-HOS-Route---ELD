import React from 'react';
import { motion } from 'framer-motion';
import { TRIP_PRESETS } from '../domain/presets';
import { MapPin, Navigation, ArrowRight, Clock, Zap, AlertCircle } from 'lucide-react';
import GlassCard from './ui/GlassCard';

export default function TripForm({ formData, setFormData, onSubmit, isLoading, onSelectPreset }) {
  const cycleVal = parseFloat(formData.current_cycle_used) || 0;
  const cyclePercent = Math.min(100, Math.max(0, (cycleVal / 70.0) * 100));

  const getCycleBarColor = (val) => {
    if (val >= 60) return 'bg-rose-500';
    if (val >= 45) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <GlassCard className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-400" />
            Trip Route Parameters
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure logistics waypoints & driver duty cycle
          </p>
        </div>
      </div>

      {/* Quick Demo Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          Quick Test Scenarios
        </label>
        <div className="grid grid-cols-1 gap-2">
          {TRIP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.data)}
              className="text-left p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] border border-[var(--glass-border)] hover:border-blue-500/40 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">
                  {preset.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${preset.badgeColor} font-mono`}>
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-1">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Current Location */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Current Driver Location (Start Point)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-blue-400" />
            </div>
            <input
              type="text"
              required
              value={formData.current_location}
              onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
              placeholder="e.g. Chicago, IL"
              className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-input)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Pickup Location (Shipper)
            </label>
            <span className="text-[10px] text-indigo-400 font-mono">+1 Hr On-Duty Loading</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-purple-400" />
            </div>
            <input
              type="text"
              required
              value={formData.pickup_location}
              onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
              placeholder="e.g. Indianapolis, IN"
              className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-input)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Dropoff Location */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Dropoff Location (Consignee)
            </label>
            <span className="text-[10px] text-emerald-400 font-mono">+1 Hr On-Duty Unload</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-emerald-400" />
            </div>
            <input
              type="text"
              required
              value={formData.dropoff_location}
              onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
              placeholder="e.g. Dallas, TX"
              className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-input)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Cycle Hours */}
        <div className="space-y-2 pt-3 border-t border-[var(--glass-border)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              Current Cycle Hours (70h / 8-Day)
            </label>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
              {cycleVal.toFixed(1)} / 70.0 hrs
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="70"
              step="0.5"
              value={formData.current_cycle_used}
              onChange={(e) => setFormData({ ...formData, current_cycle_used: e.target.value })}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="70"
              step="0.1"
              value={formData.current_cycle_used}
              onChange={(e) => setFormData({ ...formData, current_cycle_used: e.target.value })}
              className="w-20 px-2 py-1.5 bg-[var(--bg-input)] border border-[var(--glass-border)] rounded-lg text-xs font-mono text-center text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            />
          </div>

          <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getCycleBarColor(cycleVal)}`}
              initial={{ width: 0 }}
              animate={{ width: `${cyclePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {cycleVal >= 60 && (
            <p className="text-[11px] text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              High fatigue: A 34-Hour Restart may be scheduled.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Simulating FMCSA Compliance...</span>
            </>
          ) : (
            <>
              <span>Calculate Route & Generate ELD</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </GlassCard>
  );
}
