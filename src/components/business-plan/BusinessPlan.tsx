"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from "framer-motion";
import { useRef, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Lock,
  CheckCircle2,
  ArrowRight,
  Target,
  Rocket,
  Cpu,
  DollarSign,
  BarChart3,
  Layers,
  Banknote,
  Truck,
  Wheat,
  Mountain,
  HeartPulse,
  HardHat,
  Leaf,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Globe,
  FileText,
  CircleDollarSign,
  Wrench,
  Box,
  MapPin,
  Clock,
  Eye,
  Sun,
  Battery,
  ChevronDown,
  Building,
  Scale,
  Award,
  Plane,
  Database,
  Workflow,
  Network,
  Gem,
  Briefcase,
} from "lucide-react";

/* ─── Design Tokens — matching InvestorPitchDeck ─── */
const C = {
  bg: "#FFFFFF",
  bgAlt: "#F8F9FA",
  bgCard: "#FFFFFF",
  accent: "#E30613",
  accentGlow: "rgba(227,6,19,0.08)",
  accentLight: "rgba(227,6,19,0.05)",
  gold: "#B8860B",
  goldLight: "rgba(184,134,11,0.08)",
  text: "#1A1A2E",
  textSecondary: "#4A4A5A",
  textMuted: "#8A8A9A",
  border: "#E8E8EE",
  borderAccent: "rgba(227,6,19,0.15)",
  red: "#E30613",
  green: "#16A34A",
  greenLight: "rgba(22,163,74,0.08)",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
  shadowLg: "0 4px 24px rgba(0,0,0,0.08)",
};

const ease = [0.25, 0.46, 0.45, 0.94] as const;

/* ─── Shared Variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0 },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};
const slideRight: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

/* ─── Utility: Animated Counter ─── */
function CountUp({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const val = useMotionValue(0);
  const display = useTransform(val, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (inView) {
      animate(val, end, { duration, ease: "easeOut" });
    }
  }, [inView, end, duration, val]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

/* ─── Utility: Staggered Children Container ─── */
function Stagger({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section Label ─── */
function SectionLabel({ number, text }: { number: string; text: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3 mb-4 sm:mb-6"
    >
      <span
        className="text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border"
        style={{ color: C.accent, borderColor: C.borderAccent }}
      >
        {number}
      </span>
      <span className="text-xs font-mono tracking-widest uppercase" style={{ color: C.textMuted }}>
        {text}
      </span>
    </motion.div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.6, delay, ease }}
      className="rounded-2xl p-4 sm:p-6 border"
      style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
          <Icon className="w-4 h-4" style={{ color: C.accent }} />
        </div>
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider" style={{ color: C.textMuted }}>
          {label}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono" style={{ color: C.text }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs sm:text-sm mt-1 sm:mt-2" style={{ color: C.textMuted }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Bullet with animated check ─── */
function Bullet({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.li
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.5, delay, ease }}
      className="flex items-start gap-3 text-sm sm:text-base md:text-lg leading-relaxed"
      style={{ color: C.textSecondary }}
    >
      <CheckCircle2
        className="w-5 h-5 mt-1 shrink-0"
        style={{ color: C.accent }}
      />
      <span>{children}</span>
    </motion.li>
  );
}

/* ─── Comparison Bar ─── */
function ComparisonBar({
  label,
  value,
  maxValue,
  unit,
  color,
  icon: Icon,
  delay = 0,
  displayValue,
  highlight = false,
}: {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  color: string;
  icon: React.ElementType;
  delay?: number;
  displayValue?: string;
  highlight?: boolean;
}) {
  const pct = Math.max(Math.min((value / maxValue) * 100, 100), 2);
  const valueText = displayValue ?? `${value.toLocaleString()} ${unit}`;
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center gap-2 w-24 sm:w-32 md:w-44 shrink-0 justify-end">
        <Icon className="w-3.5 h-3.5 shrink-0 hidden sm:block" style={{ color }} />
        <span className={`text-[10px] sm:text-xs md:text-sm text-right ${highlight ? "font-semibold" : ""}`} style={{ color: highlight ? color : C.textSecondary }}>
          {label}
        </span>
      </div>
      <div className="flex-1 h-5 sm:h-6 md:h-7 rounded-full overflow-hidden" style={{ background: C.border }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.2, delay: delay + 0.1, ease: "easeOut" }}
        />
      </div>
      <span className={`text-[10px] sm:text-xs md:text-sm w-20 sm:w-24 md:w-32 ${highlight ? "font-bold" : "font-medium"}`} style={{ color: highlight ? color : C.text }}>
        {valueText}
      </span>
    </motion.div>
  );
}

/* ─── Table Card ─── */
function TableCard({
  title,
  headers,
  rows,
  delay = 0,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.6, delay, ease }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b" style={{ borderColor: C.border, background: C.accentLight }}>
        <h4 className="text-sm sm:text-base font-bold" style={{ color: C.text }}>{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: C.bgAlt }}>
              {headers.map((h, i) => (
                <th key={i} className="px-4 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-mono uppercase tracking-wider" style={{ color: C.textMuted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t" style={{ borderColor: C.border }}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm ${ci === 0 ? "font-medium" : ""}`} style={{ color: ci === 0 ? C.text : C.textSecondary }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ─── TOC Item ─── */
function TocItem({ number, title, delay = 0 }: { number: string; title: string; delay?: number }) {
  return (
    <motion.a
      href={`#section-${number}`}
      variants={fadeUp}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors hover:bg-gray-50 group"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease }}
    >
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0"
        style={{ background: C.accentGlow, color: C.accent }}
      >
        {number}
      </span>
      <span className="text-sm sm:text-base font-medium group-hover:translate-x-1 transition-transform" style={{ color: C.text }}>
        {title}
      </span>
      <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.accent }} />
    </motion.a>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PASSWORD GATE
   ═══════════════════════════════════════════════════════════════ */
const BP_PASSWORD = "Airdrone";
const BP_AUTH_KEY = "airbase-bp-auth";

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogin = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (pw === BP_PASSWORD) {
      sessionStorage.setItem(BP_AUTH_KEY, "1");
      onAuth();
    } else {
      setError(true);
      inputRef.current?.focus();
    }
  }, [pw, onAuth]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(227,6,19,0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease }}
        className="relative w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl p-6 sm:p-10 border text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center justify-center mb-8">
            <img src="/airbase-logo-transparent.png" alt="airBASE" className="h-20 w-auto brightness-0 invert" />
          </div>

          <div className="text-sm font-mono uppercase tracking-[0.2em] mb-1 text-white/40">
            Confidential
          </div>
          <div className="text-lg font-semibold text-white/80 mb-8">
            Business Plan
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={inputRef}
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                placeholder="Enter password"
                autoFocus
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none text-sm font-mono"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${error ? C.accent : "rgba(255,255,255,0.1)"}`,
                }}
              />
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-mono"
                style={{ color: C.accent }}
              >
                Incorrect password. Please try again.
              </motion.div>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: C.accent }}
            >
              Access Business Plan
            </button>
          </form>

          <div className="mt-8 text-xs font-mono text-white/20">
            airbase.swiss &mdash; Confidential &amp; Proprietary
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Chart Data ─── */
const revenueData = [
  { year: "Y1", revenue: 0.68, label: "CHF 680K" },
  { year: "Y3", revenue: 5, label: "CHF 5M+" },
  { year: "Y5", revenue: 15, label: "CHF 15M+" },
];

const fundAllocation = [
  { name: "Fleet & Hardware", value: 35, color: C.accent },
  { name: "Software & AI", value: 20, color: "#3B82F6" },
  { name: "LUC Certification", value: 15, color: C.gold },
  { name: "Operations & Marketing", value: 15, color: C.green },
  { name: "Working Capital", value: 15, color: "#8B5CF6" },
];

const marketData = [
  { segment: "Helicopter Mountain Cargo", value: 130, target2030: "60%", target2035: "80%" },
  { segment: "Construction Logistics", value: 95, target2030: "40%", target2035: "65%" },
  { segment: "Agriculture", value: 45, target2030: "50%", target2035: "75%" },
  { segment: "Emergency & Rescue", value: 30, target2030: "30%", target2035: "60%" },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function BusinessPlan() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(BP_AUTH_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  const sections = [
    "Executive Summary",
    "Company Overview",
    "The Problem",
    "The Solution",
    "Market Opportunity",
    "Business Model",
    "Licensing & Regulatory Strategy",
    "Technology & AI Platform",
    "Use of Funds",
    "Financial Projections",
    "Team",
    "Competitive Advantage",
    "Operations & Infrastructure",
    "Investment Terms",
    "Vision",
  ];

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      {/* ─── Hero / Cover ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(227,6,19,0.12) 0%, transparent 70%)",
          }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: C.accent,
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              opacity: 0.3,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <img src="/airbase-logo-transparent.png" alt="airBASE Aviation" className="h-20 sm:h-28 md:h-36 w-auto mx-auto mb-6 brightness-0 invert" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-sm font-mono uppercase tracking-[0.3em] mb-4"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Business Plan
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
          >
            Europe&apos;s First AI-Powered<br />Heavy-Lift Drone Airline
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="text-sm sm:text-lg md:text-xl font-light mb-8"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Confidential &mdash; June 2026
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-6 flex-wrap"
          >
            {[
              { label: "Payload", value: "85–200 kg" },
              { label: "Cost Reduction", value: "90%" },
              { label: "CO2 Emissions", value: "Zero" },
            ].map((kpi, i) => (
              <div key={i} className="text-center">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold font-mono" style={{ color: C.accent }}>{kpi.value}</div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/40">{kpi.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* ─── Main Content ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">

        {/* ─── Table of Contents ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="rounded-2xl border p-6 sm:p-8 mb-16 sm:mb-24"
          style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-6" style={{ color: C.text }}>Table of Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {sections.map((s, i) => (
              <TocItem key={i} number={String(i + 1).padStart(2, "0")} title={s} delay={i * 0.04} />
            ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            SECTION 1: Executive Summary
            ═══════════════════════════════════════════ */}
        <section id="section-01" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="01" text="Executive Summary" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              Replacing helicopters, cranes, and trucks with AI-powered drones
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: C.textSecondary }}>
              airBASE Aviation is building Europe&apos;s first commercial heavy-lift drone logistics company. Our AI-powered drones carry 85&ndash;200 kg payloads at 90% lower cost than helicopters, with zero CO2 emissions.
            </motion.p>
            <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: C.textSecondary }}>
              We operate as Drone-as-a-Service (DaaS) across four verticals &mdash; construction logistics, mountain cargo, agriculture, and emergency supply &mdash; and scale through a franchise model.
            </motion.p>
          </Stagger>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
            <KpiCard label="Swiss Market" value={<CountUp end={300} prefix="CHF " suffix="M+" />} sub="Annual TAM" icon={BarChart3} delay={0} />
            <KpiCard label="European TAM" value={<CountUp end={4.8} prefix="EUR " suffix="B" decimals={1} />} sub="By 2030" icon={Globe} delay={0.1} />
            <KpiCard label="Raise Target" value={<CountUp end={1.5} prefix="CHF " suffix="M" decimals={1} />} sub="Convertible Note" icon={Banknote} delay={0.2} />
            <KpiCard label="Pre-Money" value={<CountUp end={8.5} prefix="CHF " suffix="M" decimals={1} />} sub="Valuation" icon={TrendingUp} delay={0.3} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 2: Company Overview
            ═══════════════════════════════════════════ */}
        <section id="section-02" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="02" text="Company Overview" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              Swiss-based, ready to launch
            </motion.h2>
          </Stagger>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8">
            {[
              { icon: Building, label: "Legal Name", value: "airBASE Aviation (VSNZ GmbH group)" },
              { icon: MapPin, label: "Headquarters", value: "Switzerland — existing facility with office, warehouse, workshop, solar charging" },
              { icon: Users, label: "Founded by", value: "Benjamin Rubi (CEO) & Chris Jon Graf (CTO)" },
              { icon: Rocket, label: "Stage", value: "Pre-revenue, operational launch summer 2026" },
              { icon: Briefcase, label: "Team", value: "15+ members including 9 certified drone pilots" },
              { icon: Sun, label: "Infrastructure", value: "In-house film studio, solar roof, full workshop" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="rounded-2xl p-4 sm:p-6 border flex items-start gap-4"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: C.accentGlow }}>
                  <item.icon className="w-4 h-4" style={{ color: C.accent }} />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>{item.label}</div>
                  <div className="text-sm sm:text-base font-medium" style={{ color: C.text }}>{item.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 3: The Problem
            ═══════════════════════════════════════════ */}
        <section id="section-03" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="03" text="The Problem" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              Switzerland relies on 1960s aerial logistics
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: C.textSecondary }}>
              Legacy methods are expensive, emission-intensive, and operationally inflexible &mdash; yet they remain the only option for transporting heavy materials to construction sites, mountain locations, agricultural operations, and emergency zones.
            </motion.p>
          </Stagger>

          <div className="space-y-3 sm:space-y-4 mt-8 sm:mt-12">
            <ComparisonBar label="Helicopter" value={59500} maxValue={60000} unit="CHF/day" color="#DC2626" icon={Plane} delay={0} displayValue="CHF 59,500/day" />
            <ComparisonBar label="Crane" value={4000} maxValue={60000} unit="CHF/day" color="#F59E0B" icon={Wrench} delay={0.15} displayValue="CHF 4,000/day" />
            <ComparisonBar label="Heavy Truck" value={2500} maxValue={60000} unit="CHF/day" color="#6B7280" icon={Truck} delay={0.3} displayValue="CHF 2,500/day" />
            <ComparisonBar label="airBASE Drone" value={650} maxValue={60000} unit="CHF/day" color={C.green} icon={Zap} delay={0.45} displayValue="CHF 650/day" highlight />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12">
            {[
              { icon: DollarSign, title: "CHF 7,000/hour", desc: "Helicopter cargo transport cost — CHF 59,500 for a typical 8.5-hour operational day" },
              { icon: Leaf, title: "~4,250 kg CO2/day", desc: "Carbon emissions from a single helicopter operational day" },
              { icon: Clock, title: "Limited Access", desc: "Cranes can't reach remote sites; trucks limited by road infrastructure and terrain" },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease }}
                className="rounded-2xl p-4 sm:p-6 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="p-2 rounded-lg inline-flex mb-3" style={{ background: "rgba(220,38,38,0.08)" }}>
                  <card.icon className="w-5 h-5" style={{ color: "#DC2626" }} />
                </div>
                <h4 className="text-sm sm:text-base font-bold mb-1" style={{ color: C.text }}>{card.title}</h4>
                <p className="text-xs sm:text-sm" style={{ color: C.textSecondary }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 4: The Solution
            ═══════════════════════════════════════════ */}
        <section id="section-04" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="04" text="The Solution" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              AI-powered heavy-lift cargo drones
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: C.textSecondary }}>
              airBASE Aviation deploys AI-powered heavy-lift cargo drones capable of carrying 85&ndash;200 kg payloads. Our solution costs CHF 650/day &mdash; a 90%+ reduction compared to helicopters &mdash; with zero direct emissions.
            </motion.p>
            <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-lg leading-relaxed font-medium" style={{ color: C.text }}>
              Key differentiator: Our proprietary AI system handles autonomous route optimisation, real-time airspace awareness, weather adaptation, fleet coordination, and safety compliance. This is not just a drone company &mdash; it is an AI-powered aviation operating system.
            </motion.p>
          </Stagger>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {[
              {
                name: "FlyCart 100",
                specs: [
                  { label: "Payload (single-battery)", value: "Up to 100 kg" },
                  { label: "Payload (dual-battery)", value: "85 kg" },
                  { label: "Range", value: "12 km" },
                ],
                color: C.accent,
              },
              {
                name: "FlyCart 200",
                specs: [
                  { label: "Payload", value: "200 kg" },
                  { label: "Range (full load)", value: "10 km" },
                  { label: "Fleet capacity", value: "4 × T200 = 600 kg" },
                  { label: "Charge Time", value: "7 minutes" },
                ],
                color: C.gold,
              },
            ].map((drone, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease }}
                className="rounded-2xl border p-5 sm:p-8"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg" style={{ background: drone.color + "14" }}>
                    <Box className="w-5 h-5" style={{ color: drone.color }} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: C.text }}>{drone.name}</h3>
                </div>
                <div className="space-y-3">
                  {drone.specs.map((spec, si) => (
                    <div key={si} className="flex justify-between items-center py-2 border-b" style={{ borderColor: C.border }}>
                      <span className="text-xs sm:text-sm" style={{ color: C.textSecondary }}>{spec.label}</span>
                      <span className="text-sm sm:text-base font-bold font-mono" style={{ color: C.text }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 5: Market Opportunity
            ═══════════════════════════════════════════ */}
        <section id="section-05" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="05" text="Market Opportunity" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              CHF 300M+ Swiss market, EUR 4.8B European
            </motion.h2>
          </Stagger>

          <TableCard
            title="Swiss Market Breakdown (CHF/year)"
            headers={["Segment", "Market Size", "Target 2030", "Target 2035"]}
            rows={marketData.map(m => [m.segment, `CHF ${m.value}M`, m.target2030, m.target2035])}
            delay={0.2}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
            {[
              { icon: HardHat, label: "Construction", value: "CHF 2,800", sub: "Daily revenue per drone" },
              { icon: Wheat, label: "Agriculture", value: "CHF 3,500", sub: "Daily revenue per drone" },
              { icon: Mountain, label: "Mountain Delivery", value: "CHF 5,000", sub: "Daily revenue per drone" },
            ].map((item, i) => (
              <KpiCard key={i} label={item.label} value={item.value} sub={item.sub} icon={item.icon} delay={i * 0.1} />
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 6: Business Model
            ═══════════════════════════════════════════ */}
        <section id="section-06" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="06" text="Business Model" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              Drone-as-a-Service + Franchise
            </motion.h2>
          </Stagger>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease }}
              className="rounded-2xl border p-5 sm:p-8"
              style={{ background: C.bgCard, borderColor: C.borderAccent, boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
                  <Zap className="w-5 h-5" style={{ color: C.accent }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: C.text }}>DaaS — Primary Revenue</h3>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono mb-3" style={{ color: C.accent }}>~65% Gross Margin</div>
              <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: C.textSecondary }}>
                We operate the drones. B2B contracts across all four verticals with per-flight fees and SLA retainers.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="rounded-2xl border p-5 sm:p-8"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ background: C.goldLight }}>
                  <Network className="w-5 h-5" style={{ color: C.gold }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: C.text }}>Franchise — Scalable Growth</h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: C.textSecondary }}>
                Regional franchise partners operate under our brand, AI system, safety framework, and LUC certification.
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-4 sm:mt-6"
            style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
          >
            <h4 className="text-sm sm:text-base font-bold mb-4" style={{ color: C.text }}>Revenue Streams</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Per-flight fees (DaaS operations)",
                "SLA retainers (enterprise contracts)",
                "Franchise licensing fees",
                "Technology platform licensing",
                "Training and certification services",
              ].map((stream, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.green }} />
                  <span>{stream}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 7: Licensing & Regulatory Strategy
            ═══════════════════════════════════════════ */}
        <section id="section-07" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="07" text="Licensing & Regulatory Strategy" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              SORA to LUC — becoming a drone airline
            </motion.h2>
          </Stagger>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <motion.div
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease }}
              className="rounded-2xl border p-5 sm:p-8 relative overflow-hidden"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: C.accent }} />
              <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: C.accent }}>Phase 1 — 2026</div>
              <h3 className="text-lg sm:text-xl font-bold mb-3" style={{ color: C.text }}>SORA Authorisation</h3>
              <p className="text-sm sm:text-base leading-relaxed mb-3" style={{ color: C.textSecondary }}>
                Standard approval route for specific drone operations in Europe. Operations manual, internal procedures, and licensing documentation are largely complete.
              </p>
              <div className="flex items-center gap-2 text-sm font-mono font-bold" style={{ color: C.accent }}>
                <DollarSign className="w-4 h-4" /> ~CHF 15,000
              </div>
            </motion.div>

            <motion.div
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="rounded-2xl border p-5 sm:p-8 relative overflow-hidden"
              style={{ background: C.bgCard, borderColor: C.borderAccent, boxShadow: C.shadowLg }}
            >
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: C.gold }} />
              <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: C.gold }}>Phase 2 — Target 2027</div>
              <h3 className="text-lg sm:text-xl font-bold mb-3" style={{ color: C.text }}>LUC — Light UAS Operator Certificate</h3>
              <p className="text-sm sm:text-base leading-relaxed mb-3" style={{ color: C.textSecondary }}>
                The licence that turns us into an airline-like drone operator. With LUC, we approve many operations internally. Customer books, we operate within hours rather than weeks.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: C.gold }}>
                <Shield className="w-4 h-4" /> No Swiss operator holds LUC for heavy-lift logistics
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 8: Technology & AI Platform
            ═══════════════════════════════════════════ */}
        <section id="section-08" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="08" text="Technology & AI Platform" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              The operational control layer
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: C.textSecondary }}>
              Our software is the operational control layer for the entire business &mdash; powering every flight, every decision, every safety check.
            </motion.p>
          </Stagger>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12">
            {[
              { icon: Cpu, title: "AI Route Optimisation", desc: "Autonomous path planning with terrain and weather awareness" },
              { icon: BarChart3, title: "Fleet Management", desc: "Real-time tracking with predictive analytics" },
              { icon: Eye, title: "Airspace Awareness", desc: "Consolidated data from drones, aircraft, helicopters, paragliders" },
              { icon: Shield, title: "Safety Monitoring", desc: "Computer-vision safety and anomaly detection" },
              { icon: FileText, title: "Compliance Automation", desc: "Automated LUC documentation and flight records" },
              { icon: Users, title: "Customer Interface", desc: "Booking, tracking, and reporting portal" },
              { icon: Network, title: "Franchise OS", desc: "Complete franchise operations management system" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="rounded-2xl border p-4 sm:p-5"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="p-2 rounded-lg inline-flex mb-3" style={{ background: C.accentGlow }}>
                  <item.icon className="w-4 h-4" style={{ color: C.accent }} />
                </div>
                <h4 className="text-sm sm:text-base font-bold mb-1" style={{ color: C.text }}>{item.title}</h4>
                <p className="text-xs sm:text-sm" style={{ color: C.textSecondary }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-6"
            style={{ background: C.accentLight, borderColor: C.borderAccent }}
          >
            <div className="flex items-start gap-3">
              <Rocket className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.accent }} />
              <div>
                <h4 className="text-sm sm:text-base font-bold mb-1" style={{ color: C.text }}>AI Flywheel Effect</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: C.textSecondary }}>
                  Every flight generates training data &mdash; improving route efficiency, safety prediction, and autonomous capabilities. More flights = smarter AI = deeper moat.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 9: Use of Funds
            ═══════════════════════════════════════════ */}
        <section id="section-09" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="09" text="Use of Funds" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              CHF 1.5M to market dominance
            </motion.h2>
          </Stagger>

          {/* Catalyst Round */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-8 sm:mt-12"
            style={{ background: C.bgCard, borderColor: C.borderAccent, boxShadow: C.shadow }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
                <Zap className="w-5 h-5" style={{ color: C.accent }} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: C.text }}>CHF 200K Catalyst</h3>
                <span className="text-xs font-mono uppercase" style={{ color: C.textMuted }}>Operational Launch</span>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                "2 operational drones",
                "1 dedicated custom-built operations vehicle",
                "SORA regulatory submission (~CHF 15K)",
                "LUC pathway preparation",
                "Software integrations (telemetry APIs, airspace detection)",
              ].map((item, i) => (
                <Bullet key={i} delay={i * 0.06}>{item}</Bullet>
              ))}
            </ul>
          </motion.div>

          {/* Full Raise Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
              className="rounded-2xl border p-5 sm:p-8"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-6" style={{ color: C.text }}>CHF 1.5M Full Raise</h3>
              <div className="space-y-3">
                {fundAllocation.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-sm flex-1" style={{ color: C.textSecondary }}>{item.name}</span>
                    <span className="text-sm font-bold font-mono" style={{ color: C.text }}>{item.value}%</span>
                    <span className="text-xs font-mono" style={{ color: C.textMuted }}>CHF {((item.value / 100) * 1500).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="rounded-2xl border p-5 sm:p-8 flex items-center justify-center"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={fundAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {fundAllocation.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: C.bgCard,
                      border: `1px solid ${C.border}`,
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: C.shadow,
                    }}
                    formatter={(value) => [`${value}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Milestone Unlocks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-4 sm:mt-6"
            style={{ background: C.greenLight, borderColor: "rgba(22,163,74,0.15)" }}
          >
            <h4 className="text-sm sm:text-base font-bold mb-3" style={{ color: C.text }}>Milestone Unlocks</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "LUC Certification", icon: Shield },
                { label: "3 Enterprise DaaS Contracts", icon: FileText },
                { label: "Franchise Program (2 Partners)", icon: Network },
                { label: "CHF 680K ARR", icon: TrendingUp },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                  <m.icon className="w-4 h-4 shrink-0" style={{ color: C.green }} />
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 10: Financial Projections
            ═══════════════════════════════════════════ */}
        <section id="section-10" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="10" text="Financial Projections" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              Path to CHF 15M+ ARR
            </motion.h2>
          </Stagger>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12">
            <KpiCard label="Year 1" value={<CountUp end={680} prefix="CHF " suffix="K" />} sub="ARR" icon={TrendingUp} delay={0} />
            <KpiCard label="Year 3" value={<CountUp end={5} prefix="CHF " suffix="M+" decimals={0} />} sub="ARR" icon={TrendingUp} delay={0.1} />
            <KpiCard label="Year 5" value={<CountUp end={15} prefix="CHF " suffix="M+" decimals={0} />} sub="ARR" icon={TrendingUp} delay={0.2} />
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-6"
            style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
          >
            <h4 className="text-sm sm:text-base font-bold mb-4" style={{ color: C.text }}>Revenue Projection</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barCategoryGap="30%">
                <XAxis dataKey="year" tick={{ fill: C.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} unit="M" />
                <Tooltip
                  contentStyle={{
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: C.shadow,
                  }}
                  formatter={(value) => [`CHF ${value}M`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill={C.accent} radius={[8, 8, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-4 sm:mt-6"
            style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
          >
            <h4 className="text-sm sm:text-base font-bold mb-4" style={{ color: C.text }}>Unit Economics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Gross Margin</div>
                <div className="text-xl sm:text-2xl font-bold font-mono" style={{ color: C.green }}>~65%</div>
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Daily Revenue / Drone</div>
                <div className="text-xl sm:text-2xl font-bold font-mono" style={{ color: C.text }}>CHF 2,800&ndash;5,000</div>
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>Operating Cost</div>
                <div className="text-xl sm:text-2xl font-bold font-mono" style={{ color: C.text }}>CHF 650/day</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 11: Team
            ═══════════════════════════════════════════ */}
        <section id="section-11" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="11" text="Team" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              15+ members, zero payroll burn
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: C.textSecondary }}>
              Team funded through founders&apos; existing companies &mdash; zero payroll burn.
            </motion.p>
          </Stagger>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {[
              { name: "Benjamin Rubi", role: "CEO", desc: "Marketing agency founder, VSNZ event network, Swiss media access", color: C.accent },
              { name: "Chris Jon Graf", role: "CTO", desc: "AI and systems architecture", color: "#3B82F6" },
              { name: "Vertical Masters", role: "Training & LUC Partner", desc: "Industry-leading drone training and certification", color: C.gold },
            ].map((person, i) => (
              <motion.div
                key={i}
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease }}
                className="rounded-2xl border p-5 sm:p-8 text-center"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: person.color + "14" }}>
                  <Users className="w-6 h-6" style={{ color: person.color }} />
                </div>
                <h4 className="text-base sm:text-lg font-bold" style={{ color: C.text }}>{person.name}</h4>
                <div className="text-xs font-mono uppercase tracking-wider mt-1 mb-3" style={{ color: person.color }}>{person.role}</div>
                <p className="text-xs sm:text-sm" style={{ color: C.textSecondary }}>{person.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="rounded-2xl border p-5 sm:p-6"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <h4 className="text-sm sm:text-base font-bold mb-3" style={{ color: C.text }}>Key Team</h4>
              <div className="flex flex-wrap gap-2">
                {["Nikita Eberhart", "Claude Gfeller", "Nicolas Jud", "Ralph Menth", "Jamie Wyss"].map((name, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ color: C.textSecondary, borderColor: C.border }}>
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease }}
              className="rounded-2xl border p-5 sm:p-6"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <h4 className="text-sm sm:text-base font-bold mb-3" style={{ color: C.text }}>Certified Pilots (9)</h4>
              <div className="flex flex-wrap gap-2">
                {["Tobias Pohl", "Lars Wanner", "Sidario Belzarini", "Janis Perron", "+ 5 in pipeline"].map((name, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ color: C.textSecondary, borderColor: C.border }}>
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 12: Competitive Advantage
            ═══════════════════════════════════════════ */}
        <section id="section-12" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="12" text="Competitive Advantage" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              Seven layers of defensibility
            </motion.h2>
          </Stagger>

          <div className="space-y-3 mt-8 sm:mt-12">
            {[
              { icon: Cpu, title: "Proprietary AI System", desc: "CHF 1M+ R&D investment in autonomous flight intelligence", color: C.accent },
              { icon: Shield, title: "LUC Certification", desc: "12–18 month regulatory barrier to entry", color: C.gold },
              { icon: Network, title: "First-Mover Franchise Network", desc: "Regional partners locked into our ecosystem", color: "#3B82F6" },
              { icon: Building, title: "Existing Infrastructure", desc: "Solar, warehouse, studio — no capex needed", color: C.green },
              { icon: DollarSign, title: "Zero-Burn Team Structure", desc: "Funded through founders' existing companies", color: "#8B5CF6" },
              { icon: Globe, title: "Swiss Media Access", desc: "Direct reach to national coverage channels", color: "#EC4899" },
              { icon: Database, title: "AI Data Flywheel", desc: "Every flight makes the AI smarter — compounding advantage", color: "#F59E0B" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="rounded-2xl border p-4 sm:p-5 flex items-center gap-4"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.color + "14" }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-bold" style={{ color: C.text }}>{item.title}</h4>
                  <p className="text-xs sm:text-sm" style={{ color: C.textSecondary }}>{item.desc}</p>
                </div>
                <span className="text-lg sm:text-xl font-bold font-mono shrink-0" style={{ color: item.color }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 13: Operations & Infrastructure
            ═══════════════════════════════════════════ */}
        <section id="section-13" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="13" text="Operations & Infrastructure" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              Ready-to-fly infrastructure
            </motion.h2>
          </Stagger>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {[
              {
                icon: Building,
                title: "Headquarters",
                items: ["Office space", "Warehouse", "Workshop", "In-house film studio"],
              },
              {
                icon: Sun,
                title: "Energy & Charging",
                items: ["Solar roof installation", "Capacity: ~20 drones", "~6 vehicle charging", "Zero energy cost"],
              },
              {
                icon: Truck,
                title: "Operations Vehicle",
                items: ["Custom-built deployment unit", "Standardised for franchise", "Mobile command center", "All-terrain capable"],
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={scaleUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease }}
                className="rounded-2xl border p-5 sm:p-8"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="p-2 rounded-lg inline-flex mb-4" style={{ background: C.accentGlow }}>
                  <card.icon className="w-5 h-5" style={{ color: C.accent }} />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-3" style={{ color: C.text }}>{card.title}</h4>
                <ul className="space-y-2">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: C.textSecondary }}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: C.green }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-4 sm:mt-6"
            style={{ background: C.greenLight, borderColor: "rgba(22,163,74,0.15)" }}
          >
            <div className="flex items-start gap-3">
              <Battery className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.green }} />
              <div>
                <h4 className="text-sm sm:text-base font-bold mb-1" style={{ color: C.text }}>Runway Advantage</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: C.textSecondary }}>
                  Variable cost structure with existing group infrastructure covering overhead. Not dependent on a specific flight count to survive.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 14: Investment Terms
            ═══════════════════════════════════════════ */}
        <section id="section-14" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="14" text="Investment Terms" />
          <Stagger className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.text }}>
              Convertible Note — Seed Round
            </motion.h2>
          </Stagger>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-8 sm:mt-12"
            style={{ background: C.bgCard, borderColor: C.borderAccent, boxShadow: C.shadowLg }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { label: "Instrument", value: "Convertible Note", sub: "Wandeldarlehen" },
                { label: "Round", value: "Seed", sub: "" },
                { label: "Raise Target", value: "CHF 1.5M", sub: "" },
                { label: "Pre-Money Valuation", value: "CHF 8.5M", sub: "" },
                { label: "Interest Rate", value: "6% p.a.", sub: "" },
                { label: "Conversion Discount", value: "20%", sub: "" },
              ].map((term, i) => (
                <div key={i}>
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>{term.label}</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold font-mono" style={{ color: C.text }}>{term.value}</div>
                  {term.sub && <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{term.sub}</div>}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="rounded-2xl border p-5 sm:p-8 mt-4 sm:mt-6"
            style={{ background: C.goldLight, borderColor: "rgba(184,134,11,0.15)" }}
          >
            <div className="flex items-start gap-3">
              <Gem className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.gold }} />
              <div>
                <h4 className="text-sm sm:text-base font-bold mb-1" style={{ color: C.text }}>Early Bird — Lead Investor</h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: C.textSecondary }}>
                  <strong>30% conversion discount</strong> for the CHF 200K catalyst ticket (vs. standard 20%).
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 15: Vision
            ═══════════════════════════════════════════ */}
        <section id="section-15" className="mb-16 sm:mb-24 scroll-mt-8">
          <SectionLabel number="15" text="Vision" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="rounded-2xl border p-8 sm:p-12 md:p-16 text-center relative overflow-hidden"
            style={{ background: C.bgCard, borderColor: C.borderAccent, boxShadow: C.shadowLg }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(227,6,19,0.04) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <div className="text-xs font-mono uppercase tracking-[0.3em] mb-6" style={{ color: C.accent }}>
                Our Vision
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-6" style={{ color: C.text }}>
                Europe&apos;s leading AI-powered<br />heavy-lift drone airline
              </h2>
              <p className="text-sm sm:text-lg md:text-xl font-light max-w-2xl mx-auto" style={{ color: C.textSecondary }}>
                With a global franchise network, transforming how the world moves heavy cargo.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="text-center py-12 border-t" style={{ borderColor: C.border }}>
          <img src="/airbase-logo-transparent.png" alt="airBASE" className="h-10 w-auto mx-auto mb-4 opacity-30" />
          <div className="text-xs font-mono" style={{ color: C.textMuted }}>
            airBASE Aviation &mdash; Confidential &amp; Proprietary &mdash; June 2026
          </div>
        </footer>
      </div>
    </div>
  );
}
