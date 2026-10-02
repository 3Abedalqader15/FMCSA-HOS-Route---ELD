import React from 'react';
import { useLocation } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import { Bell, Search } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Overview Dashboard',
  '/planner': 'Trip Route Planner',
  '/logs': 'ELD Log Viewer',
  '/history': 'Trip History',
  '/settings': 'Settings',
  '/about': 'About',
};

export default function TopBar({ collapsed }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'FMCSA HOS';

  return (
    <header
      className="sticky top-0 z-30 h-[var(--topbar-height)] flex items-center justify-between px-6 transition-all duration-300 no-print
        bg-[var(--bg-glass-strong)] backdrop-blur-2xl border-b border-[var(--glass-border)]
      "
    >
      {/* Left: Page title */}
      <div>
        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-glass)] hover:border-[var(--border-active)] transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[var(--bg-primary)]" />
        </button>
      </div>
    </header>
  );
}
