import React from 'react';
import clsx from 'clsx';

export default function LoadingSkeleton({ className, lines = 1, circle = false }) {
  if (circle) {
    return (
      <div
        className={clsx(
          'rounded-full bg-[var(--bg-elevated)] animate-pulse',
          className
        )}
      />
    );
  }

  return (
    <div className={clsx('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 rounded-lg bg-[var(--bg-elevated)] animate-pulse"
          style={{ width: `${85 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
