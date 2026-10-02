import React from 'react';
import { motion } from 'framer-motion';
import { Route, Clock, Coffee, Moon, Fuel, RotateCcw } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import AnimatedNumber from './ui/AnimatedNumber';
import ProgressRing from './ui/ProgressRing';
import StatusBadge from './ui/StatusBadge';

export default function TripStats({ tripSummary, logsCount }) {
  if (!tripSummary) return null;

  const finalCycle = tripSummary.final_cycle_used || 0;

  const KPIS = [
    { value: tripSummary.total_miles, label: 'Total Miles', color: 'text-[var(--text-primary)]', suffix: '' },
    { value: tripSummary.total_driving_hours, label: 'Driving', color: 'text-blue-400', suffix: 'h' },
    { value: tripSummary.total_duration_hours, label: 'Elapsed', color: 'text-indigo-400', suffix: 'h' },
    { value: logsCount, label: 'Log Days', color: 'text-emerald-400', suffix: '' },
  ];

  const STOPS = [
    { icon: Coffee, count: tripSummary.mandatory_rest_stops_count, label: 'Break(s)', sub: '30-min', variant: 'amber' },
    { icon: Moon, count: tripSummary.daily_reset_stops_count, label: 'Reset(s)', sub: '10-hr sleeper', variant: 'indigo' },
    { icon: Fuel, count: tripSummary.fuel_stops_count, label: 'Fuel Stop(s)', sub: 'Every 1,000 mi', variant: 'emerald' },
    { icon: RotateCcw, count: tripSummary.cycle_reset_stops_count || 0, label: 'Restart(s)', sub: '34-hr cycle', variant: 'rose' },
  ];

  return (
    <GlassCard className="space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Route className="h-5 w-5 text-indigo-400" />
          Trip Statistics
        </h3>
        <StatusBadge variant="emerald" size="sm" dot>FMCSA Validated</StatusBadge>
      </div>

      {/* KPI Grid + Ring */}
      <div className="flex flex-col sm:flex-row gap-5 items-center">
        <div className="grid grid-cols-2 gap-3 flex-1">
          {KPIS.map((kpi, i) => (
            <motion.div
              key={i}
              className="bg-[var(--bg-tertiary)] p-3.5 rounded-xl border border-[var(--glass-border)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
                {kpi.label}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`text-xl font-extrabold font-mono ${kpi.color}`}>
                  <AnimatedNumber value={kpi.value} decimals={kpi.suffix === 'h' ? 1 : 0} duration={1200} />
                </span>
                {kpi.suffix && <span className="text-xs text-[var(--text-muted)]">{kpi.suffix}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 70h Cycle Ring */}
        <ProgressRing
          value={finalCycle}
          max={70}
          size={110}
          strokeWidth={10}
          label="Cycle Used"
          sublabel={`${Math.max(0, 70.0 - finalCycle).toFixed(1)}h remaining`}
        />
      </div>

      {/* Stop Badges */}
      <div className="pt-2">
        <label className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] block mb-2">
          FMCSA Mandatory Stops:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STOPS.map((stop, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors
                ${stop.variant === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : ''}
                ${stop.variant === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : ''}
                ${stop.variant === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : ''}
                ${stop.variant === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : ''}
              `}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <stop.icon className="h-4 w-4 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">{stop.count} {stop.label}</p>
                <span className="text-[10px] opacity-70">{stop.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
