import React from 'react';
import { Truck, ShieldCheck, Printer, Radio, ExternalLink } from 'lucide-react';

export default function Navbar({ isBackendOnline, onPrint }) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white">FMCSA HOS</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-semibold border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Route & Electronic Logging Device (ELD) Planner
              </p>
            </div>
          </div>

          {/* Right Status Badges & Print Button */}
          <div className="flex items-center gap-3">
            {/* FMCSA Compliance Badge */}
            <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>49 CFR Part 395 Certified</span>
            </div>

            {/* Backend Health Status */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/80">
              <span className={`h-2 w-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300 text-[11px] font-mono">
                {isBackendOnline ? 'API Connected' : 'Offline'}
              </span>
            </div>

            {/* Print Official ELD Button */}
            {onPrint && (
              <button
                onClick={onPrint}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all duration-150 cursor-pointer"
                title="Print or Export Official Inspection Log Sheets"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print ELD Logs</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
