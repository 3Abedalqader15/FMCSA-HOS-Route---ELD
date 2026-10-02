import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ isBackendOnline }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Sidebar */}
      <Sidebar
        isBackendOnline={isBackendOnline}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-[var(--sidebar-width-collapsed)]' : 'ml-[var(--sidebar-width)]'
        }`}
      >
        <TopBar collapsed={false} />

        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-[var(--glass-border)] text-center">
          <p className="text-[11px] text-[var(--text-muted)]">
            FMCSA HOS Route & ELD System — 49 CFR Part 395 Compliant — Property-Carrying 70hr/8-Day Rule
          </p>
        </footer>
      </div>
    </div>
  );
}
