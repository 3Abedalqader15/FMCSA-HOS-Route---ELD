import React from 'react';
import { Route, Clock, Calendar, Fuel, Coffee, Moon, RotateCcw, AlertTriangle } from 'lucide-react';

export default function TripStats({ tripSummary, logsCount }) {
  if (!tripSummary) return null;

  const finalCycle = tripSummary.final_cycle_used || 0;
  const cyclePercent = Math.min(100, (finalCycle / 70.0) * 100);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Route className="h-5 w-5 text-indigo-400" />
          HOS Trip Statistics & KPIs
        </h3>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          FMCSA Validated
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Total Distance
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white font-mono">
              {tripSummary.total_miles}
            </span>
            <span className="text-xs text-slate-400">miles</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Driving Time
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-blue-400 font-mono">
              {tripSummary.total_driving_hours}
            </span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Total Elapsed
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-indigo-400 font-mono">
              {tripSummary.total_duration_hours}
            </span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Generated Logs
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {logsCount}
            </span>
            <span className="text-xs text-slate-400">Day(s)</span>
          </div>
        </div>
      </div>

      {/* FMCSA Operational Stops Summary Badges */}
      <div className="pt-2">
        <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
          FMCSA Mandatory Stops Scheduled:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Coffee className="h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">{tripSummary.mandatory_rest_stops_count} Break(s)</p>
              <span className="text-[10px] text-amber-400/80">30-min mandatory</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Moon className="h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">{tripSummary.daily_reset_stops_count} Reset(s)</p>
              <span className="text-[10px] text-indigo-400/80">10-hr sleeper rest</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <Fuel className="h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">{tripSummary.fuel_stops_count} Fuel Stop(s)</p>
              <span className="text-[10px] text-emerald-400/80">Every 1,000 mi</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <RotateCcw className="h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">{tripSummary.cycle_reset_stops_count || 0} Restart(s)</p>
              <span className="text-[10px] text-rose-400/80">34-hr cycle reset</span>
            </div>
          </div>
        </div>
      </div>

      {/* 70-Hour Duty Cycle Remaining Gauge */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Weekly Cycle Used After Trip:</span>
          <span className="font-mono font-bold text-white">
            {finalCycle.toFixed(1)} / 70.0 hrs ({Math.max(0, 70.0 - finalCycle).toFixed(1)}h remaining)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              finalCycle >= 60 ? 'bg-rose-500' : finalCycle >= 45 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${cyclePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
