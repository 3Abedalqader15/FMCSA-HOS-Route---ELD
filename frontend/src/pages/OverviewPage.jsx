import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, FileText, ShieldCheck, Clock, Zap, ArrowRight,
  Route, CheckCircle2, BarChart3, Globe, Timer, Shield,
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import StatusBadge from '../components/ui/StatusBadge';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const STATS = [
  { value: 50000, suffix: '+', label: 'Miles Calculated', icon: Route, color: 'text-blue-400' },
  { value: 99.9, suffix: '%', label: 'Compliance Rate', icon: ShieldCheck, color: 'text-emerald-400', decimals: 1 },
  { value: 24, suffix: '/7', label: 'Availability', icon: Clock, color: 'text-indigo-400' },
  { value: 395, suffix: '', label: 'CFR Part', icon: Shield, color: 'text-amber-400' },
];

const FEATURES = [
  {
    icon: MapPin,
    title: 'Smart Route Planning',
    desc: 'Intelligent route optimization using OpenStreetMap & OSRM with automatic stop scheduling based on HOS rules.',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-400',
    borderColor: 'hover:border-blue-500/30',
  },
  {
    icon: FileText,
    title: 'ELD Log Generation',
    desc: 'Pixel-perfect 24-hour Driver Daily Log sheets (Form MCS-59) with SVG graph, remarks table, and print support.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    icon: Zap,
    title: 'Real-Time §395 Audit',
    desc: '11h driving, 14h window, 30-min break, 10h reset, 70h/8-day cycle, and 34h restart — all enforced automatically.',
    gradient: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'hover:border-amber-500/30',
  },
];

const COMPLIANCE = [
  '11-Hour Driving Limit',
  '14-Hour Duty Window',
  '30-Minute Break Rule',
  '10-Hour Daily Reset',
  '70h/8-Day Cycle',
  '34-Hour Restart',
];

const STEPS = [
  { num: '01', title: 'Enter Route', desc: 'Set your current location, pickup, and dropoff points', icon: MapPin },
  { num: '02', title: 'HOS Engine', desc: 'The system simulates full FMCSA-compliant duty schedule', icon: Zap },
  { num: '03', title: 'View Results', desc: 'Interactive map, trip stats, and ELD log sheets — ready to print', icon: FileText },
];

export default function OverviewPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16">
      {/* ═══════ Hero Section ═══════ */}
      <motion.section
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16"
        style={{ background: 'var(--gradient-hero)' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
        
        {/* Floating glow orbs */}
        <div className="absolute top-10 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-3xl">
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 ring-1 ring-white/15">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <StatusBadge variant="blue" size="sm" dot pulse>v1.0 Production</StatusBadge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[var(--text-primary)]">FMCSA HOS Route</span>
            <br />
            <span className="gradient-text">&amp; ELD Log Planner</span>
          </motion.h1>

          <motion.p
            className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Smart compliance route planning with automatic Hours of Service scheduling 
            and Electronic Logging Device sheet generation — fully compliant with 49 CFR Part 395.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => navigate('/planner')}
              className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all duration-200 cursor-pointer"
            >
              <MapPin className="h-4.5 w-4.5" />
              Plan Your Route
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/logs')}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-glass)] hover:border-[var(--border-active)] text-[var(--text-primary)] font-semibold text-sm transition-all duration-200 cursor-pointer"
            >
              <BarChart3 className="h-4.5 w-4.5 text-[var(--text-secondary)]" />
              View Dashboard
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════ Stats Counters ═══════ */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {STATS.map((stat, i) => (
          <motion.div key={i} variants={fadeUp}>
            <GlassCard className="text-center" delay={i * 0.1}>
              <stat.icon className={`h-7 w-7 mx-auto mb-3 ${stat.color}`} />
              <div className="text-3xl font-black font-mono text-[var(--text-primary)]">
                <AnimatedNumber
                  value={stat.value}
                  decimals={stat.decimals || 0}
                  suffix={stat.suffix}
                  duration={1500}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-1">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.section>

      {/* ═══════ Feature Cards ═══════ */}
      <section>
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-3">
            Enterprise-Grade Compliance
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            Built for professional CMV operators and fleet managers — every rule in 49 CFR Part 395 enforced automatically.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {FEATURES.map((feat, i) => (
            <motion.div key={i} variants={fadeUp}>
              <GlassCard hover className={`h-full ${feat.borderColor}`} delay={i * 0.15}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-5 ring-1 ring-[var(--glass-border)]`}>
                  <feat.icon className={`h-6 w-6 ${feat.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{feat.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════ How It Works ═══════ */}
      <section>
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-3">
            How It Works
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Three simple steps to generate FMCSA-compliant route plans and ELD logs.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {STEPS.map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="relative">
              <GlassCard className="text-center h-full" delay={i * 0.15}>
                <div className="text-5xl font-black font-mono gradient-text mb-4 opacity-30">
                  {step.num}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{step.desc}</p>
              </GlassCard>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                  <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════ Compliance Grid ═══════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard className="!p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Full FMCSA Compliance</h2>
            <StatusBadge variant="emerald" size="sm" dot>All Rules Enforced</StatusBadge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {COMPLIANCE.map((rule, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--glass-border)]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-[var(--text-secondary)]">{rule}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.section>
    </div>
  );
}
