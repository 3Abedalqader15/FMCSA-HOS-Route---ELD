import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({
  value = 0,
  max = 70,
  size = 120,
  strokeWidth = 10,
  label = '',
  sublabel = '',
  colorClass = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percent / 100) * circumference;

  const getColor = () => {
    if (colorClass) return colorClass;
    if (percent >= 85) return '#f43f5e';
    if (percent >= 65) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ filter: `drop-shadow(0 0 6px ${getColor()}40)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold font-mono text-[var(--text-primary)]">
            {value.toFixed(1)}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">/ {max}</span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-semibold text-[var(--text-secondary)]">{label}</p>
          {sublabel && <p className="text-[10px] text-[var(--text-muted)]">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
