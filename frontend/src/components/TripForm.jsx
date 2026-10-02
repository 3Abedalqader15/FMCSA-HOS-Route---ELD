import React from 'react';
import { TRIP_PRESETS } from '../domain/presets';
import { MapPin, Navigation, ArrowRight, Clock, Zap, AlertCircle } from 'lucide-react';

export default function TripForm({ formData, setFormData, onSubmit, isLoading, onSelectPreset }) {
  const cycleVal = parseFloat(formData.current_cycle_used) || 0;
  const cyclePercent = Math.min(100, Math.max(0, (cycleVal / 70.0) * 100));

  const getCycleBarColor = (val) => {
    if (val >= 60) return 'bg-rose-500';
    if (val >= 45) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-400" />
            Trip Route Parameters
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure logistics waypoints & driver duty cycle
          </p>
        </div>
      </div>

      {/* Quick Demo Presets (Evaluation Speedrunners) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          Quick Test Scenarios (1-Click Presets)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {TRIP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.data)}
              className="text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 transition-all duration-150 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {preset.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${preset.badgeColor} font-mono`}>
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
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
          <label className="block text-xs font-semibold text-slate-300 mb-1">
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
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-300">
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
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Dropoff Location */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-300">
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
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Current Cycle Used Hours */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              Current Cycle Hours Used (70h / 8-Day Rule)
            </label>
            <span className="text-xs font-mono font-bold text-white">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <input
              type="number"
              min="0"
              max="70"
              step="0.1"
              value={formData.current_cycle_used}
              onChange={(e) => setFormData({ ...formData, current_cycle_used: e.target.value })}
              className="w-20 px-2 py-1.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getCycleBarColor(cycleVal)}`}
              style={{ width: `${cyclePercent}%` }}
            />
          </div>
          {cycleVal >= 60 && (
            <p className="text-[11px] text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              High fatigue: A 34-Hour Restart will be scheduled if trip duty reaches 70.0h.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Simulating FMCSA Compliance & Route...</span>
            </>
          ) : (
            <>
              <span>Calculate Route & Generate ELD Logs</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
