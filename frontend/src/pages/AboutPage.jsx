import React from 'react';
import { motion } from 'framer-motion';
import {
  Info, ShieldCheck, Code2, Globe, ExternalLink, Heart, FileCode2,
  CheckCircle2, Truck,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';

const TECH_STACK = [
  { name: 'React 19', desc: 'Frontend UI framework', color: 'text-cyan-400' },
  { name: 'Vite 8', desc: 'Next-gen build tool', color: 'text-purple-400' },
  { name: 'Tailwind CSS 4', desc: 'Utility-first styling', color: 'text-blue-400' },
  { name: 'Framer Motion', desc: 'Animation library', color: 'text-pink-400' },
  { name: 'Recharts', desc: 'Data visualization', color: 'text-emerald-400' },
  { name: 'Leaflet', desc: 'Interactive maps', color: 'text-green-400' },
  { name: 'Django REST', desc: 'Backend API', color: 'text-amber-400' },
  { name: 'OpenStreetMap', desc: 'Map tiles & geocoding', color: 'text-indigo-400' },
];

const REGULATIONS = [
  { rule: '§395.3(a)(3)(ii)', desc: '11-Hour Driving Limit — max consecutive driving after 10h off' },
  { rule: '§395.3(a)(2)', desc: '14-Hour Duty Window — cannot drive after 14h on-duty window' },
  { rule: '§395.3(a)(3)(ii)', desc: '30-Minute Break — required after 8h consecutive driving' },
  { rule: '§395.3(a)(1)', desc: '10-Hour Daily Reset — minimum off-duty before new duty period' },
  { rule: '§395.3(b)', desc: '70-Hour/8-Day Cycle — maximum on-duty hours in rolling 8-day window' },
  { rule: '§395.3(d)', desc: '34-Hour Restart — optional cycle reset via consecutive 34h off-duty' },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 shrink-0">
          <Truck className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
            FMCSA HOS Route & ELD Log Planner
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Production-grade compliance route planning & electronic logging device system
          </p>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge variant="blue" size="sm">v1.0.0</StatusBadge>
            <StatusBadge variant="emerald" size="sm" dot>Production</StatusBadge>
          </div>
        </div>
      </motion.div>

      {/* Project Description */}
      <GlassCard delay={0.1}>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400" />
          About This Project
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          This application automates the process of planning commercial motor vehicle (CMV) routes 
          while ensuring full compliance with the Federal Motor Carrier Safety Administration (FMCSA) 
          Hours of Service (HOS) regulations under 49 CFR Part 395. It calculates optimal stop 
          schedules, generates inspection-ready Electronic Logging Device (ELD) daily log sheets 
          (Form MCS-59), and visualizes routes on interactive maps.
        </p>
      </GlassCard>

      {/* FMCSA Regulations */}
      <GlassCard delay={0.2}>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          FMCSA Regulations Enforced
        </h3>
        <div className="space-y-2">
          {REGULATIONS.map((reg, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--glass-border)]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold font-mono text-blue-400">{reg.rule}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{reg.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Tech Stack */}
      <GlassCard delay={0.3}>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Code2 className="h-4 w-4 text-purple-400" />
          Technology Stack
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TECH_STACK.map((tech, i) => (
            <motion.div
              key={i}
              className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--glass-border)] text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            >
              <p className={`text-xs font-bold ${tech.color}`}>{tech.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Attribution */}
      <GlassCard delay={0.4}>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-indigo-400" />
          Open Source Attribution
        </h3>
        <div className="space-y-2 text-xs text-[var(--text-secondary)]">
          <p>• Map Data © OpenStreetMap contributors — openstreetmap.org</p>
          <p>• Routing Engine: OSRM (Open Source Routing Machine) — project-osrm.org</p>
          <p>• Geocoding: OpenStreetMap Nominatim — nominatim.org</p>
          <p>• Dark Map Tiles: CartoDB — carto.com</p>
        </div>
      </GlassCard>

      {/* Footer */}
      <motion.div
        className="text-center py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
          Built with <Heart className="h-3 w-3 text-rose-400" /> for FMCSA compliance
        </p>
      </motion.div>
    </div>
  );
}
