import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 cursor-pointer
        ${isDark
          ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500/40 hover:bg-slate-700'
          : 'bg-white border-slate-200 hover:border-amber-400/50 hover:bg-amber-50'
        } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isDark ? (
          <Moon className="h-4.5 w-4.5 text-blue-400" />
        ) : (
          <Sun className="h-4.5 w-4.5 text-amber-500" />
        )}
      </motion.div>
    </button>
  );
}
