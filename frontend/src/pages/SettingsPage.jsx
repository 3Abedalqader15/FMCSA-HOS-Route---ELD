import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Monitor, Globe, Bell, Clock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [defaultCycle, setDefaultCycle] = useLocalStorage('fmcsa-default-cycle', '15.5');
  const [mapStyle, setMapStyle] = useLocalStorage('fmcsa-map-style', 'auto');
  const [toastPosition, setToastPosition] = useLocalStorage('fmcsa-toast-pos', 'top-right');

  const THEME_OPTIONS = [
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Dark mode with deep navy background' },
    { value: 'light', label: 'Light', icon: Sun, desc: 'Light mode for bright environments' },
    { value: 'system', label: 'System', icon: Monitor, desc: 'Follow your OS preference' },
  ];

  const MAP_OPTIONS = [
    { value: 'auto', label: 'Auto (Theme-aware)', desc: 'Dark tiles in dark mode, light in light mode' },
    { value: 'dark', label: 'Dark Tiles', desc: 'Always use dark CartoDB tiles' },
    { value: 'standard', label: 'Standard OSM', desc: 'Classic OpenStreetMap tiles' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2 mb-1">
          <Settings className="h-6 w-6 text-blue-400" />
          Settings
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Customize your FMCSA HOS Route & ELD experience
        </p>
      </motion.div>

      {/* Theme Preference */}
      <GlassCard delay={0.1}>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Moon className="h-4 w-4 text-indigo-400" />
          Appearance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                theme === opt.value || (opt.value === 'system' && theme !== 'dark' && theme !== 'light')
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-sm'
                  : 'border-[var(--glass-border)] bg-[var(--bg-tertiary)] hover:border-[var(--border-active)]'
              }`}
            >
              <opt.icon className={`h-5 w-5 mb-2 ${
                theme === opt.value ? 'text-blue-400' : 'text-[var(--text-muted)]'
              }`} />
              <p className="text-sm font-semibold text-[var(--text-primary)]">{opt.label}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Default Cycle Hours */}
      <GlassCard delay={0.2}>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          Default Cycle Hours Used
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="70"
            step="0.5"
            value={defaultCycle}
            onChange={(e) => setDefaultCycle(e.target.value)}
            className="flex-1"
          />
          <div className="w-20 text-center px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--glass-border)] text-sm font-mono font-bold text-[var(--text-primary)]">
            {parseFloat(defaultCycle).toFixed(1)}h
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-2">
          This will pre-fill the cycle hours field in the Trip Planner form.
        </p>
      </GlassCard>

      {/* Map Style */}
      <GlassCard delay={0.3}>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-400" />
          Map Tile Style
        </h3>
        <div className="space-y-2">
          {MAP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMapStyle(opt.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                mapStyle === opt.value
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-[var(--glass-border)] bg-[var(--bg-tertiary)] hover:border-[var(--border-active)]'
              }`}
            >
              <div className={`w-3 h-3 rounded-full border-2 ${
                mapStyle === opt.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-[var(--text-muted)]'
              }`} />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{opt.label}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Notification Position */}
      <GlassCard delay={0.4}>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-400" />
          Toast Notification Position
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['top-right', 'top-left', 'bottom-right', 'bottom-left'].map((pos) => (
            <button
              key={pos}
              onClick={() => setToastPosition(pos)}
              className={`p-3 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                toastPosition === pos
                  ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                  : 'border-[var(--glass-border)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:border-[var(--border-active)]'
              }`}
            >
              {pos.replace('-', ' ')}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
