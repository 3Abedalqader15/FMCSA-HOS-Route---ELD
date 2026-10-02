import React from 'react';
import { motion } from 'framer-motion';
import { FileX } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FileX,
  title = 'No Data',
  description = 'Nothing to display yet.',
  action,
  actionLabel = 'Get Started',
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--glass-border)] flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] transition-colors shadow-md cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
