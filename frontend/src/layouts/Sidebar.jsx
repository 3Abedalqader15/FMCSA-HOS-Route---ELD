import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Truck,
  FileText,
  History,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', shortcut: '1' },
  { to: '/planner', icon: Truck, label: 'Trip Planner', shortcut: '2' },
  { to: '/logs', icon: FileText, label: 'ELD Logs', shortcut: '3' },
  { to: '/history', icon: History, label: 'Trip History', shortcut: '4' },
  { to: '/settings', icon: Settings, label: 'Settings', shortcut: '5' },
  { to: '/about', icon: Info, label: 'About', shortcut: '6' },
];

export default function Sidebar({ isBackendOnline, collapsed, onToggleCollapse }) {
  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out no-print
        ${collapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]'}
        bg-[var(--sidebar-bg)] backdrop-blur-2xl border-r border-[var(--glass-border)]
      `}
    >
      {/* Logo Area */}
      <div className={`flex items-center h-[var(--topbar-height)] border-b border-[var(--glass-border)] px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/10 shrink-0">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-extrabold text-sm text-[var(--text-primary)] tracking-tight whitespace-nowrap">
                FMCSA HOS
              </p>
              <p className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                Route & ELD Planner
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
              ${isActive
                ? 'bg-blue-500/12 text-blue-400 shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }
              ${collapsed ? 'justify-center px-0' : ''}
              `
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-blue-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-blue-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                      ⌘{item.shortcut}
                    </span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={`p-3 border-t border-[var(--glass-border)] space-y-2 ${collapsed ? 'px-2' : ''}`}>
        {/* API Status */}
        <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[var(--bg-tertiary)]/50 ${collapsed ? 'justify-center px-0' : ''}`}>
          <span className={`h-2 w-2 rounded-full shrink-0 ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          {!collapsed && (
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {isBackendOnline ? 'API Online' : 'API Offline'}
            </span>
          )}
        </div>

        {/* FMCSA badge */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>49 CFR §395</span>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
