import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function GlassCard({
  children,
  className,
  hover = false,
  glow,
  delay = 0,
  onClick,
  as = 'div',
}) {
  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      className={clsx(
        'rounded-2xl backdrop-blur-xl p-6 transition-all duration-300',
        'bg-[var(--bg-glass)] border border-[var(--glass-border)]',
        'shadow-[var(--glass-shadow)]',
        hover && 'cursor-pointer hover:border-[var(--border-active)] hover:shadow-[var(--glow-blue)] hover:-translate-y-1',
        glow === 'blue' && 'ring-1 ring-blue-500/20',
        glow === 'emerald' && 'ring-1 ring-emerald-500/20',
        glow === 'rose' && 'ring-1 ring-rose-500/20',
        glow === 'indigo' && 'ring-1 ring-indigo-500/20',
        onClick && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
    >
      {children}
    </MotionComponent>
  );
}
