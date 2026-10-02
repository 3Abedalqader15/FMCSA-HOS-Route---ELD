import React from 'react';
import clsx from 'clsx';

const VARIANTS = {
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  slate: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

const SIZES = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export default function StatusBadge({
  children,
  variant = 'blue',
  size = 'sm',
  dot = false,
  pulse = false,
  className,
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold font-mono',
        VARIANTS[variant] || VARIANTS.blue,
        SIZES[size] || SIZES.sm,
        className
      )}
    >
      {dot && (
        <span className={clsx(
          'w-1.5 h-1.5 rounded-full',
          variant === 'emerald' && 'bg-emerald-400',
          variant === 'blue' && 'bg-blue-400',
          variant === 'amber' && 'bg-amber-400',
          variant === 'rose' && 'bg-rose-400',
          variant === 'indigo' && 'bg-indigo-400',
          variant === 'purple' && 'bg-purple-400',
          variant === 'cyan' && 'bg-cyan-400',
          variant === 'slate' && 'bg-slate-400',
          pulse && 'animate-pulse'
        )} />
      )}
      {children}
    </span>
  );
}
