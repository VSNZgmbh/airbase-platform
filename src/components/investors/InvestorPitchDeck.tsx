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
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronDown,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Globe,
  CheckCircle2,
  ArrowRight,
  Box,
  Target,
  Rocket,
  Lock,
  Cpu,
  MapPin,
  Clock,
  DollarSign,
  BarChart3,
  Layers,
  Banknote,
  Truck,
  Wheat,
  Eye,
  Mountain,
  HeartPulse,
  HardHat,
  Leaf,
  Sun,
  Battery,
  Volume2,
  VolumeX,
  FileText,
  CircleDollarSign,
  Wrench,
} from "lucide-react";

/* ─── Touch-friendly range slider styles ─── */
const rangeSliderStyles = `
  @media (max-width: 768px) {
    .pitch-scroll-container {
      scroll-snap-type: none !important;
    }
    .pitch-scroll-container section {
      scroll-snap-align: unset !important;
    }
  }
  .investor-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #D32F2F;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .investor-range::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #D32F2F;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  @media (max-width: 640px) {
    .investor-range::-webkit-slider-thumb {
      width: 32px;
      height: 32px;
    }
    .investor-range::-moz-range-thumb {
      width: 32px;
      height: 32px;
    }
  }
`;

/* ─── Design Tokens — White / Light Theme ─── */
const C = {
  bg: "#FFFFFF",
  bgAlt: "#F8F9FA",
  bgCard: "#FFFFFF",
  accent: "#D32F2F",
  accentGlow: "rgba(211,47,47,0.08)",
  accentLight: "rgba(211,47,47,0.05)",
  gold: "#B8860B",
  goldLight: "rgba(184,134,11,0.08)",
  text: "#1A1A2E",
  textSecondary: "#4A4A5A",
  textMuted: "#8A8A9A",
  border: "#E8E8EE",
  borderAccent: "rgba(211,47,47,0.15)",
  red: "#D32F2F",
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
const slideLeft: Variants = {
  hidden: { opacity: 0, x: 60 },
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

/* ─── Slide Label ─── */
function SlideLabel({ number, text }: { number: string; text: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3 mb-4 sm:mb-8"
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

/* ─── Animated Flow Step ─── */
function FlowStep({
  icon: Icon,
  label,
  sub,
  index,
  total,
  color = C.accent,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  index: number;
  total: number;
  color?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="text-center relative flex flex-col items-center"
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.18, ease }}
    >
      <motion.div
        className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3"
        style={{ background: color + "12" }}
        animate={inView ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.6, delay: index * 0.18 + 0.3 }}
      >
        <Icon className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color }} />
      </motion.div>
      <div className="text-xs sm:text-sm font-bold" style={{ color: C.text }}>{label}</div>
      <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: C.textMuted }}>{sub}</div>
      {index < total - 1 && (
        <motion.div
          className="hidden sm:block absolute top-6 -right-4 md:-right-5"
          initial={{ opacity: 0, x: -10 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: index * 0.18 + 0.4 }}
        >
          <ArrowRight className="w-4 h-4" style={{ color: color + "60" }} />
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Animated Comparison Bar ─── */
function ComparisonBar({
  label,
  value,
  maxValue,
  unit,
  color,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  color: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const pct = Math.max(Math.min((value / maxValue) * 100, 100), 4);
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
        <span className="text-[10px] sm:text-xs md:text-sm text-right" style={{ color: C.textSecondary }}>
          {label}
        </span>
      </div>
      <div className="flex-1 h-5 sm:h-6 md:h-7 rounded-full overflow-hidden relative" style={{ background: C.border }}>
        <motion.div
          className="h-full rounded-full flex items-center justify-end pr-2"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.2, delay: delay + 0.1, ease: "easeOut" }}
        >
          <span className="text-[10px] sm:text-xs font-mono font-bold text-white whitespace-nowrap">
            {value.toLocaleString()} {unit}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Investment Slider (Convertible Note Calculator) ─── */
function InvestmentSlider() {
  const [amount, setAmount] = useState(250);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const PRE_MONEY = 8500; // CHF 8.5M pre-money valuation (in K)
  const INTEREST_RATE = 6; // 6% p.a. — standard Swiss convertible note rate
  const DISCOUNT_RATE = 20; // 20% conversion discount at next round
  const equityPercent = (amount / (PRE_MONEY + amount)) * 100; // post-money basis
  const annualInterest = amount * INTEREST_RATE / 100; // CHF K per year
  const fiveYearInterest = annualInterest * 5;
  const years = [1, 2, 3, 4, 5];

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.6, ease }}
      className="rounded-2xl p-5 sm:p-8 border"
      style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadowLg }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
          <Banknote className="w-5 h-5" style={{ color: C.accent }} />
        </div>
        <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.accent }}>
          Investment Calculator
        </span>
      </div>

      <div className="text-center mb-8">
        <div className="text-sm mb-2" style={{ color: C.textMuted }}>Your Investment</div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono" style={{ color: C.text }}>
          CHF {amount}K
        </div>
      </div>

      <div className="px-2 mb-8">
        <input
          type="range"
          min={50}
          max={750}
          step={50}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="investor-range w-full h-3 sm:h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${C.accent} 0%, ${C.accent} ${((amount - 50) / 700) * 100}%, ${C.border} ${((amount - 50) / 700) * 100}%, ${C.border} 100%)`,
            accentColor: C.accent,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs font-mono" style={{ color: C.textMuted }}>CHF 50K</span>
          <span className="text-xs font-mono" style={{ color: C.textMuted }}>CHF 750K</span>
        </div>
      </div>

      {/* Equity + Interest summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-4 text-center" style={{ background: C.accentLight, border: `1px solid ${C.borderAccent}` }}>
          <Layers className="w-5 h-5 mx-auto mb-2" style={{ color: C.accent }} />
          <div className="text-lg sm:text-2xl font-bold font-mono" style={{ color: C.accent }}>{equityPercent.toFixed(1)}%</div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>Indicative Equity at Conversion</div>
          <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>post-money basis (CHF 8.5M pre-money)</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: C.greenLight, border: `1px solid rgba(22,163,74,0.15)` }}>
          <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: C.green }} />
          <div className="text-lg sm:text-2xl font-bold font-mono" style={{ color: C.green }}>{INTEREST_RATE}% p.a.</div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>Convertible Note Interest</div>
          <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>CHF {annualInterest}K / year</div>
        </div>
      </div>

      {/* 5-year total value */}
      <div className="rounded-xl p-4 mb-6 text-center" style={{ background: C.goldLight, border: `1px solid rgba(184,134,11,0.15)` }}>
        <DollarSign className="w-5 h-5 mx-auto mb-2" style={{ color: C.gold }} />
        <div className="text-lg sm:text-2xl font-bold font-mono" style={{ color: C.gold }}>
          CHF {amount + fiveYearInterest}K
        </div>
        <div className="text-xs mt-1" style={{ color: C.textMuted }}>
          Total Note Value at Conversion (5 Yr)
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
          CHF {amount}K principal + CHF {fiveYearInterest}K accrued interest &mdash; converts at {DISCOUNT_RATE}% discount
        </div>
      </div>

      {/* Accumulated interest breakdown by year */}
      <div className="rounded-xl p-4 mb-4" style={{ background: C.bgAlt, border: `1px solid ${C.border}` }}>
        <div className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: C.textMuted }}>
          Accumulated Interest Over Time
        </div>
        <div className="space-y-2">
          {years.map((yr) => {
            const accumulated = annualInterest * yr;
            const total = amount + accumulated;
            const pct = (accumulated / fiveYearInterest) * 100;
            return (
              <div key={yr} className="flex items-center gap-3">
                <span className="text-xs font-mono w-12 shrink-0" style={{ color: C.textMuted }}>
                  Yr {yr}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: C.accent }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-mono w-24 sm:w-28 text-right shrink-0" style={{ color: C.textSecondary }}>
                  +{accumulated}K = {total}K
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl p-4" style={{ background: C.accentLight, border: `1px solid ${C.borderAccent}` }}>
        <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: C.accent }}>
          What You Get
        </div>
        <ul className="text-xs space-y-1.5" style={{ color: C.textSecondary }}>
          <li>1. <strong>Convertible Loan:</strong> Your investment is structured as a convertible note with {INTEREST_RATE}% p.a. contractually accruing interest</li>
          <li>2. <strong>Interest:</strong> {INTEREST_RATE}% annual interest accrues on your principal over the note term</li>
          <li>3. <strong>Conversion:</strong> At the next qualified funding round, the note + accrued interest converts into equity at a {DISCOUNT_RATE}% discount to the new round price</li>
          <li>4. <strong>Indicative equity:</strong> ~{equityPercent.toFixed(1)}% on a post-money basis (CHF 8.5M pre-money valuation), subject to final conversion terms</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-center" style={{ color: C.textMuted }}>
        * Terms indicative. Final terms subject to formal agreement.
      </div>
    </motion.div>
  );
}

/* ─── Chart Data ─── */
const tamData = [
  { year: "2024", value: 1.4 },
  { year: "2025", value: 2.1 },
  { year: "2026", value: 3.2 },
  { year: "2027", value: 4.8 },
  { year: "2028", value: 7.1 },
  { year: "2029", value: 10.7 },
  { year: "2030", value: 16.1 },
];

const revenueProjection = [
  { year: "2026", revenue: 0.12, label: "Pilot ops" },
  { year: "2027", revenue: 0.68, label: "First contracts" },
  { year: "2028", revenue: 2.4, label: "Scale" },
  { year: "2029", revenue: 7.2, label: "Expansion" },
  { year: "2030", revenue: 14.0, label: "Growth" },
  { year: "2031", revenue: 22.0, label: "Market lead" },
];

const fundAllocation = [
  { name: "Fleet Expansion", value: 35, amount: "525K", color: C.accent },
  { name: "Platform Development", value: 25, amount: "375K", color: "#FF6B6B" },
  { name: "LUC + Legal", value: 20, amount: "300K", color: C.gold },
  { name: "Sales & Marketing", value: 10, amount: "150K", color: C.green },
  { name: "Working Capital", value: 10, amount: "150K", color: C.textMuted },
];

/* ─── Slide Nav Dots ─── */
function SlideNav({
  current,
  total,
  onNavigate,
}: {
  current: number;
  total: number;
  onNavigate: (idx: number) => void;
}) {
  return (
    <nav className="fixed right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1.5 sm:gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          aria-label={`Go to slide ${i + 1}`}
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300"
          style={{
            background: i === current ? C.accent : C.textMuted + "40",
            transform: i === current ? "scale(1.4)" : "scale(1)",
          }}
        />
      ))}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const DECK_PASSWORD = "Airdrone";
const AUTH_KEY = "airbase-investor-auth";

/* ─── Password Gate ─── */
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogin = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (pw === DECK_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onAuth();
    } else {
      setError(true);
      inputRef.current?.focus();
    }
  }, [pw, onAuth]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)` }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(211,47,47,0.08) 0%, transparent 70%)",
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
            <img src="/airbase-logo.png" alt="airBASE" className="h-12 w-auto brightness-0 invert" />
          </div>

          <div className="text-sm font-mono uppercase tracking-[0.2em] mb-1 text-white/40">
            Confidential
          </div>
          <div className="text-lg font-semibold text-white/80 mb-8">
            Investor Pitch Deck
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
              Access Deck
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

export function InvestorPitchDeck() {
  const [authed, setAuthed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const totalSlides = 14;

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  /* Track which slide is visible — picks the section with the highest visibility ratio */
  const ratioMap = useRef(new Map<Element, number>());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !authed) return;

    ratioMap.current.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratioMap.current.set(entry.target, entry.intersectionRatio);
        });
        let maxRatio = 0;
        let maxIdx = -1;
        slideRefs.current.forEach((el, idx) => {
          if (el) {
            const ratio = ratioMap.current.get(el) ?? 0;
            if (ratio > maxRatio) {
              maxRatio = ratio;
              maxIdx = idx;
            }
          }
        });
        if (maxIdx !== -1) setCurrentSlide(maxIdx);
      },
      { root: container, threshold: [0, 0.1, 0.25, 0.5, 0.75] }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [authed]);

  const navigateTo = useCallback((idx: number) => {
    slideRefs.current[idx]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        navigateTo(Math.min(currentSlide + 1, totalSlides - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateTo(Math.max(currentSlide - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSlide, navigateTo]);

  const setRef = (idx: number) => (el: HTMLElement | null) => {
    slideRefs.current[idx] = el;
  };

  if (!authed) {
    return <PasswordGate onAuth={() => setAuthed(true)} />;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden pitch-scroll-container"
      style={{
        background: C.bg,
        scrollSnapType: "y proximity",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: rangeSliderStyles }} />
      <SlideNav current={currentSlide} total={totalSlides} onNavigate={navigateTo} />

      {/* ═══ PERSISTENT AIRBASE HEADER ═══ */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 sm:py-4"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 70%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      >
        <div className="flex items-center gap-3" style={{ pointerEvents: "auto" }}>
          <img src="/airbase-logo.png" alt="airBASE" className="h-10 sm:h-14 w-auto" />
          <span className="hidden md:inline text-xs font-mono tracking-wider ml-2" style={{ color: C.textMuted }}>
            airbase.swiss
          </span>
        </div>
        <div className="text-xs font-mono tracking-wider" style={{ color: C.textMuted, pointerEvents: "auto" }}>
          Investor Pitch &middot; 2026
        </div>
      </div>

      {/* ═══ SLIDE 0: COVER ═══ */}
      <section
        ref={setRef(0)}
        className="relative min-h-screen flex flex-col items-center justify-start pt-20 sm:justify-center sm:pt-0 px-6 text-center overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Hero drone image background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/assets/hero-flycart-mountains.jpg"
            alt="DJI FlyCart drones over Swiss mountains"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.92) 70%, rgba(255,255,255,1) 100%)" }} />
        </div>

        {/* Subtle accent glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(211,47,47,0.04) 0%, transparent 70%)",
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: C.accent,
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease }}
          className="relative z-10 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease }}
            className="flex items-center justify-center mb-6 sm:mb-10"
          >
            <img
              src="/airbase-logo.png"
              alt="airBASE AVIATION"
              className="h-16 sm:h-28 md:h-36 lg:h-44 w-auto"
              loading="eager"
              style={{ filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.12))", minHeight: 64 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xs sm:text-sm font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-6 sm:mb-8 px-2"
            style={{ color: C.accent }}
          >
            Confidential &mdash; For Accredited Investors Only
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease }}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight px-2"
            style={{ color: C.text }}
          >
            We Move Industries
            <br />
            <span style={{ color: C.accent }}>Into the Sky.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-sm sm:text-lg md:text-xl lg:text-2xl font-light mb-6 sm:mb-10 px-2"
            style={{ color: C.textSecondary }}
          >
            Helicopters &middot; Tractors &middot; Cranes &middot; Trucks &mdash; One Platform Replaces Them All &middot; 100% Solar
          </motion.p>

          {/* Four Animated Pillars: Construction, Agriculture, Emergency, Logistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10 px-2"
          >
            {[
              {
                icon: HardHat,
                title: "Construction & Cranes",
                desc: "Materials to mountain sites, equipment lifting — replacing helicopters and cranes",
                color: C.accent,
              },
              {
                icon: Wheat,
                title: "Agriculture",
                desc: "Crop spraying, seeding & monitoring — replacing tractors with zero soil compaction",
                color: C.gold,
              },
              {
                icon: HeartPulse,
                title: "Emergency & Rescue",
                desc: "Medical supply, rescue operations, disaster response — 24/7 rapid deployment",
                color: C.green,
              },
              {
                icon: Truck,
                title: "Logistics & Transport",
                desc: "Industrial transport, supply chain delivery, last-mile cargo — replacing trucks and traditional freight",
                color: "#6366f1",
              },
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.2, duration: 0.6, ease }}
                className="rounded-xl sm:rounded-2xl p-3 sm:p-5 border text-center"
                style={{ background: C.bgCard, borderColor: pillar.color + "30", boxShadow: C.shadow }}
              >
                <motion.div
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center"
                  style={{ background: pillar.color + "10" }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                >
                  <pillar.icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: pillar.color }} />
                </motion.div>
                <div className="text-xs sm:text-base font-bold mb-0.5 sm:mb-1" style={{ color: C.text }}>
                  {pillar.title}
                </div>
                <div className="text-[10px] sm:text-xs" style={{ color: C.textMuted }}>
                  {pillar.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.6 }}
            className="text-sm font-mono tracking-wider"
            style={{ color: C.textMuted }}
          >
            airbase.swiss &middot; Seed Round CHF 1.5M &middot; 2026
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6" style={{ color: C.textMuted }} />
          </motion.div>
        </motion.div>
      </section>


      {/* ═══ SLIDE 1: DRONE HERO ═══ */}
      <section
        ref={setRef(1)}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ scrollSnapAlign: "start", background: "#0A0A0A" }}
      >
        {/* Full-bleed drone image */}
        <div className="absolute inset-0">
          <img
            src="/assets/hero-flycart-mountains.jpg"
            alt="DJI FlyCart drones over Swiss mountains"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.85) 100%)",
            }}
          />
        </div>

        {/* Content pinned to bottom */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 mt-auto pb-16 sm:pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease }}
          >
            <img
              src="/airbase-logo.png"
              alt="airBASE"
              className="h-10 sm:h-14 w-auto mx-auto mb-6"
              style={{ filter: "brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6"
            style={{ color: "#FFFFFF" }}
          >
            One Platform.{" "}
            <span style={{ color: C.accent }}>Every Heavy Industry. Reinvented.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
            className="text-xs sm:text-base md:text-xl lg:text-2xl font-light max-w-3xl mx-auto"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            airBASE replaces helicopters, tractors, cranes, and trucks (LKWs)
            with heavy-lift drone swarms capable of transporting up to
            600&nbsp;kg per load — at 90% lower cost and zero emissions. We
            serve construction, agriculture, logistics, and emergency rescue
            across Switzerland and Austria as a fully solar-powered B2B &amp;
            B2C Drone-as-a-Service platform. We aren&rsquo;t disrupting one
            industry — we&rsquo;re creating an entirely new one.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-6"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6" style={{ color: "rgba(255,255,255,0.5)" }} />
          </motion.div>
        </motion.div>
      </section>


      {/* ═══ SLIDE 2: THE PROBLEM ═══ */}
      <section
        ref={setRef(2)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="01" text="The Problem" />

          <Stagger className="space-y-6">
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: C.text }}
            >
              Helicopters. Tractors. Cranes.
              <br />
              <span style={{ color: C.red }}>Billion-Dollar Machines. Last-Century Thinking.</span>
            </motion.h2>

            <motion.div variants={fadeIn} className="h-px w-24 mt-4 mb-8" style={{ background: C.red + "60" }} />
          </Stagger>

          {/* Three-column: Helicopter + Crane + Tractor Problems */}
          <Stagger className="grid md:grid-cols-3 gap-6 mt-8" delay={0.2}>
            {/* Helicopter Problems */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-4 sm:p-6 border"
              style={{ background: C.bgCard, borderColor: C.red + "20", boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: C.red + "10" }}
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Mountain className="w-6 h-6" style={{ color: C.red }} />
                </motion.div>
                <div>
                  <div className="text-sm sm:text-lg font-bold" style={{ color: C.text }}>Helicopter Transport</div>
                  <div className="text-xs" style={{ color: C.textMuted }}>The status quo for mountain logistics</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: CircleDollarSign, label: "CHF 7,000/h", sub: "Cargo helicopter operating cost per hour" },
                  { icon: Leaf, label: "~500 kg CO\u2082/h", sub: "Jet-A1 fuel emissions" },
                  { icon: Volume2, label: "100+ dB noise", sub: "Severe noise pollution" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: C.red + "06" }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                  >
                    <item.icon className="w-5 h-5 shrink-0" style={{ color: C.red }} />
                    <div>
                      <div className="text-sm font-bold font-mono" style={{ color: C.red }}>{item.label}</div>
                      <div className="text-xs" style={{ color: C.textMuted }}>{item.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Crane Problems */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-4 sm:p-6 border"
              style={{ background: C.bgCard, borderColor: C.red + "20", boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: C.red + "10" }}
                  animate={{ rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <HardHat className="w-6 h-6" style={{ color: C.red }} />
                </motion.div>
                <div>
                  <div className="text-sm sm:text-lg font-bold" style={{ color: C.text }}>Construction Cranes</div>
                  <div className="text-xs" style={{ color: C.textMuted }}>Slow, expensive heavy lifting</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: CircleDollarSign, label: "CHF 2,000-5,000/day", sub: "Crane rental + operator cost" },
                  { icon: Clock, label: "Days of setup", sub: "Permits, transport, assembly" },
                  { icon: Volume2, label: "90+ dB noise", sub: "Disrupts entire neighborhoods" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: C.red + "06" }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                  >
                    <item.icon className="w-5 h-5 shrink-0" style={{ color: C.red }} />
                    <div>
                      <div className="text-sm font-bold font-mono" style={{ color: C.red }}>{item.label}</div>
                      <div className="text-xs" style={{ color: C.textMuted }}>{item.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tractor Problems */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-4 sm:p-6 border"
              style={{ background: C.bgCard, borderColor: C.red + "20", boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: C.red + "10" }}
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Wheat className="w-6 h-6" style={{ color: C.red }} />
                </motion.div>
                <div>
                  <div className="text-sm sm:text-lg font-bold" style={{ color: C.text }}>Diesel Tractors</div>
                  <div className="text-xs" style={{ color: C.textMuted }}>Outdated agriculture machinery</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Leaf, label: "41 kg CO\u2082/ha", sub: "Diesel fuel emissions per hectare" },
                  { icon: Wrench, label: "Soil compaction", sub: "Heavy machinery damages soil structure" },
                  { icon: Volume2, label: "85+ dB noise", sub: "Diesel engine noise pollution" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: C.red + "06" }}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                  >
                    <item.icon className="w-5 h-5 shrink-0" style={{ color: C.red }} />
                    <div>
                      <div className="text-sm font-bold font-mono" style={{ color: C.red }}>{item.label}</div>
                      <div className="text-xs" style={{ color: C.textMuted }}>{item.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* Standardized Daily Cost & CO₂ Comparison Table */}
          <Stagger delay={0.5}>
            <motion.div
              variants={fadeUp}
              className="mt-10 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadowLg }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>
                Standardized Daily Comparison — Swiss Alpine Operations
              </div>
              <div className="text-xs mb-6" style={{ color: C.textMuted }}>
                Cost per day &amp; CO&#x2082; emissions per day — side by side
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 mb-3 pb-2 border-b" style={{ borderColor: C.border }}>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold" style={{ color: C.textMuted }}>Method</div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold text-right" style={{ color: C.textMuted }}>Cost / Day</div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold text-right" style={{ color: C.textMuted }}>CO&#x2082; / Day</div>
              </div>

              {/* Comparison rows */}
              <div className="space-y-2">
                {[
                  { method: "Helicopter", icon: Mountain, cost: "CHF 59,500", co2: "~4,250 kg", costVal: 59500, co2Val: 4250, color: C.red },
                  { method: "Crane", icon: HardHat, cost: "CHF 2,500", co2: "~120 kg", costVal: 2500, co2Val: 120, color: C.red },
                  { method: "Heavy Truck", icon: Truck, cost: "CHF 1,200", co2: "~100 kg", costVal: 1200, co2Val: 100, color: C.red + "CC" },
                  { method: "AIRBASE Drone", icon: Zap, cost: "CHF 650", co2: "0 kg", costVal: 650, co2Val: 0, color: C.accent },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_1fr] gap-3 items-center p-3 rounded-xl"
                    style={{ background: i === 3 ? C.accentLight : C.bgAlt, border: i === 3 ? `2px solid ${C.accent}30` : undefined }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <row.icon className="w-4 h-4 shrink-0" style={{ color: row.color }} />
                      <span className={`text-xs sm:text-sm ${i === 3 ? "font-bold" : ""}`} style={{ color: i === 3 ? C.accent : C.textSecondary }}>
                        {row.method}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs sm:text-sm font-mono ${i === 3 ? "font-bold" : "font-semibold"}`} style={{ color: i === 3 ? C.accent : C.red }}>
                        {row.cost}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs sm:text-sm font-mono ${i === 3 ? "font-bold" : "font-semibold"}`} style={{ color: i === 3 ? C.green : C.red }}>
                        {row.co2}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Cost savings visual */}
              <div className="mt-6 pt-4 border-t" style={{ borderColor: C.border }}>
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>
                  Daily Cost Comparison
                </div>
                <div className="space-y-3">
                  <ComparisonBar label="Helicopter" value={59500} maxValue={59500} unit="CHF/day" color={C.red} icon={Mountain} delay={0} />
                  <ComparisonBar label="Crane" value={2500} maxValue={59500} unit="CHF/day" color={C.red} icon={HardHat} delay={0.1} />
                  <ComparisonBar label="Heavy Truck" value={1200} maxValue={59500} unit="CHF/day" color={C.red + "CC"} icon={Truck} delay={0.2} />
                </div>
                {/* AIRBASE bar — highlighted */}
                <motion.div
                  className="flex items-center gap-3 mt-3"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <div className="flex items-center gap-2 w-24 sm:w-32 md:w-44 shrink-0 justify-end">
                    <Zap className="w-3.5 h-3.5 shrink-0 hidden sm:block" style={{ color: C.accent }} />
                    <span className="text-[10px] sm:text-xs md:text-sm text-right font-semibold" style={{ color: C.accent }}>
                      AIRBASE Drone
                    </span>
                  </div>
                  <div className="flex-1 h-5 sm:h-6 md:h-7 rounded-full overflow-hidden relative" style={{ background: C.border }}>
                    <motion.div
                      className="h-full rounded-full flex items-center px-2"
                      style={{ background: C.accent, minWidth: "120px" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: "120px" }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 1.2, delay: 0.45, ease: "easeOut" }}
                    >
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-white whitespace-nowrap">
                        CHF 650/day
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4 text-center" style={{ background: C.accentLight, border: `1px solid ${C.borderAccent}` }}>
                  <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: C.accent }} />
                  <div className="text-lg sm:text-xl font-bold font-mono" style={{ color: C.accent }}>Up to 99%</div>
                  <div className="text-xs mt-1" style={{ color: C.textMuted }}>Cost reduction vs. helicopter</div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: C.greenLight, border: `1px solid rgba(22,163,74,0.15)` }}>
                  <Leaf className="w-5 h-5 mx-auto mb-2" style={{ color: C.green }} />
                  <div className="text-lg sm:text-xl font-bold font-mono" style={{ color: C.green }}>100%</div>
                  <div className="text-xs mt-1" style={{ color: C.textMuted }}>CO&#x2082; reduction (solar-powered)</div>
                </div>
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>


      {/* ═══ SLIDE 3: THE SOLUTION ═══ */}
      <section
        ref={setRef(3)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="02" text="The Solution" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
              style={{ color: C.text }}
            >
              The Industry Existed.{" "}
              <span style={{ color: C.accent }}>The Right Tools Didn&rsquo;t.</span>
            </motion.h2>
          </Stagger>

          {/* Animated Business Flow — PROMINENT */}
          <Stagger delay={0.2}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 sm:p-8 border"
              style={{ background: C.bgCard, borderColor: C.borderAccent, boxShadow: C.shadowLg }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-6" style={{ color: C.accent }}>
                How It Works — B2B Drone Operations
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 md:gap-6">
                <FlowStep icon={FileText} label="B2B Order" sub="Client request" index={0} total={5} color={C.accent} />
                <FlowStep icon={Shield} label="AI Safety Check" sub="SORA compliance" index={1} total={5} color={C.gold} />
                <FlowStep icon={Users} label="Pilot Dispatched" sub="Licensed crew" index={2} total={5} color={C.accent} />
                <FlowStep icon={Rocket} label="Drone Delivers" sub="85-200 kg cargo" index={3} total={5} color={C.green} />
                <FlowStep icon={Banknote} label="Invoice" sub="Automated billing" index={4} total={5} color={C.accent} />
              </div>
            </motion.div>
          </Stagger>

          {/* YouTube Video + FlyCart Showcase */}
          <Stagger className="mt-8 grid md:grid-cols-2 gap-6" delay={0.4}>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl overflow-hidden border relative"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadowLg }}
            >
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/QCU3fBOJ0H0"
                  title="DJI FlyCart 100 — See It Fly"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div className="p-4">
                <div className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: C.accent }}>
                  Watch It Fly
                </div>
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  The DJI FlyCart in action — the heavy-lift drone powering our operations.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl overflow-hidden border relative"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              {/* FC100 */}
              <div className="flex items-center gap-4 p-4 sm:p-5">
                <motion.img
                  src="/assets/flycart-100-cutout.png"
                  alt="DJI FlyCart 100 drone"
                  className="w-20 sm:w-28 h-auto object-contain shrink-0"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider mb-0.5" style={{ color: C.accent }}>Workhorse</div>
                  <div className="text-base sm:text-lg font-bold" style={{ color: C.text }}>DJI FlyCart 100</div>
                  <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Up to 100 kg payload (single-battery) &middot; 85 kg (dual-battery) &middot; 12 km range</div>
                </div>
              </div>
              <div className="border-t" style={{ borderColor: C.border }} />
              {/* FC200 */}
              <div className="flex items-center gap-4 p-4 sm:p-5" style={{ background: `linear-gradient(135deg, ${C.bgAlt} 0%, ${C.accentLight} 100%)` }}>
                <motion.img
                  src="/assets/flycart-100-cutout.png"
                  alt="DJI FlyCart 200"
                  className="w-20 sm:w-28 h-auto object-contain shrink-0 rounded-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider mb-0.5" style={{ color: C.accent }}>
                    Next-Gen <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full ml-1" style={{ background: C.accentGlow, color: C.accent }}>NEW</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold" style={{ color: C.text }}>DJI FlyCart 200</div>
                  <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>200 kg payload &middot; 10 km range (full load) &middot; Swarm: 4 units = 600 kg &middot; 7-min charge</div>
                </div>
              </div>
            </motion.div>
          </Stagger>

          {/* Key stats */}
          <Stagger className="grid grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-8" delay={0.6}>
            {[
              { value: "85-200 kg", label: "Payload capacity", sub: "FC100 (85 kg) + FC200 (200 kg)" },
              { value: "-85%", label: "Cost vs traditional", sub: "Helicopter / tractor / crane" },
              { value: "<30 min", label: "Deployment time", sub: "Order to takeoff" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-xl sm:rounded-2xl p-3 sm:p-5 border text-center"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="text-base sm:text-2xl md:text-3xl font-bold font-mono" style={{ color: C.accent }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm mt-1 sm:mt-2" style={{ color: C.textSecondary }}>
                  {stat.label}
                </div>
                <div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1" style={{ color: C.textMuted }}>
                  {stat.sub}
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>


      {/* ═══ SLIDE 4: MARKET OPPORTUNITY ═══ */}
      <section
        ref={setRef(4)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="03" text="Market Opportunity" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-4"
              style={{ color: C.text }}
            >
              CHF 300M+ Swiss Market{" "}
              <span style={{ color: C.accent }}>— Per Year. Ours to Take.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-lg max-w-3xl" style={{ color: C.textSecondary }}>
              Real numbers. Real verticals. Switzerland alone represents a massive annual market — and we&rsquo;re targeting 60%+ market share in each vertical.
            </motion.p>
          </Stagger>

          {/* Swiss Market Size Per Year — by vertical */}
          <Stagger className="mt-10" delay={0.2}>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadowLg }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-6" style={{ color: C.accent }}>
                Swiss Market Size Per Year — Drone-Addressable Verticals
              </div>

              <div className="space-y-4">
                {[
                  { vertical: "Helicopter Mountain Cargo", icon: Mountain, market: "CHF 130M", target2030: "60%", target2035: "80%", desc: "Material transport, alpine supply flights — largest segment. Air Zermatt, Air-Glaciers, Swiss Helicopter combined." },
                  { vertical: "Construction Logistics", icon: HardHat, market: "CHF 95M", target2030: "40%", target2035: "65%", desc: "Heavy materials to mountain construction sites, crane replacement for remote locations." },
                  { vertical: "Agriculture", icon: Wheat, market: "CHF 45M", target2030: "50%", target2035: "75%", desc: "Precision spraying, seeding, vineyard management. Swiss vineyards & alpine farming." },
                  { vertical: "Emergency & Rescue", icon: HeartPulse, market: "CHF 30M", target2030: "30%", target2035: "60%", desc: "Medical supply, rescue support, disaster response. Supplements Rega operations." },
                ].map((v, i) => (
                  <motion.div
                    key={v.vertical}
                    className="rounded-xl p-4 sm:p-5 border"
                    style={{ background: C.bgAlt, borderColor: C.border }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <div className="flex items-center gap-3 sm:w-64 shrink-0">
                        <v.icon className="w-5 h-5 shrink-0" style={{ color: C.accent }} />
                        <div>
                          <div className="text-sm font-bold" style={{ color: C.text }}>{v.vertical}</div>
                          <div className="text-xs" style={{ color: C.textMuted }}>{v.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-8 ml-8 sm:ml-0">
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold font-mono" style={{ color: C.accent }}>{v.market}</div>
                          <div className="text-[10px] font-mono uppercase" style={{ color: C.textMuted }}>per year</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold font-mono" style={{ color: C.gold }}>{v.target2030}</div>
                          <div className="text-[10px] font-mono uppercase" style={{ color: C.textMuted }}>2030 target</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold font-mono" style={{ color: C.green }}>{v.target2035}</div>
                          <div className="text-[10px] font-mono uppercase" style={{ color: C.textMuted }}>2035 vision</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: C.border }}>
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: C.textMuted }}>Total Swiss Addressable Market</div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono" style={{ color: C.accent }}>CHF 300M+ / year</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono uppercase" style={{ color: C.textMuted }}>Year-5 Target (SOM)</div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono" style={{ color: C.gold }}>CHF 22M ARR</div>
                </div>
              </div>
            </motion.div>
          </Stagger>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Global context */}
            <Stagger delay={0.4}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>
                  Global Drone Logistics Market ($B) — MarketsandMarkets 2025
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={tamData}>
                    <defs>
                      <linearGradient id="tamGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.accent} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={C.accent} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke={C.textMuted + "40"} tick={{ fill: C.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke={C.textMuted + "40"} tick={{ fill: C.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} />
                    <Tooltip
                      contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, boxShadow: C.shadow }}
                      formatter={(v) => [`$${v}B`, "Market Size"]}
                    />
                    <Area type="monotone" dataKey="value" stroke={C.accent} strokeWidth={2} fill="url(#tamGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 rounded-xl" style={{ background: C.bgAlt }}>
                    <div className="text-lg font-bold font-mono" style={{ color: C.accent }}>$16.1B</div>
                    <div className="text-[10px] font-mono" style={{ color: C.textMuted }}>Global by 2030</div>
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ background: C.bgAlt }}>
                    <div className="text-lg font-bold font-mono" style={{ color: C.accent }}>50.1%</div>
                    <div className="text-[10px] font-mono" style={{ color: C.textMuted }}>CAGR</div>
                  </div>
                </div>
              </motion.div>
            </Stagger>

            {/* Regulatory tailwind — ENHANCED */}
            <Stagger delay={0.6}>
              <motion.div variants={fadeUp} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" style={{ color: C.gold }} />
                  <span className="text-xs font-mono uppercase tracking-wider font-bold" style={{ color: C.gold }}>
                    Regulatory Tailwind — Our Biggest Moat
                  </span>
                </div>
                <motion.div
                  variants={fadeUp}
                  className="p-4 rounded-xl border"
                  style={{ borderColor: C.gold + "25", background: C.goldLight }}
                >
                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    The LUC (Light UAS operator Certificate) is a <strong style={{ color: C.gold }}>multi-year, six-figure regulatory process</strong>. Without intelligent software like AIRBASE, achieving LUC at scale is virtually impossible. This is our deepest competitive moat.
                  </p>
                </motion.div>
                <ul className="space-y-3">
                  <Bullet delay={0}>LUC requires CHF 200K+ investment and 12-18 months of documented operations — barrier to entry is massive</Bullet>
                  <Bullet delay={0.1}>EASA U-Space framework advancing in CH — first zone (Zurich) planned end 2026 (BAZL/FOCA)</Bullet>
                  <Bullet delay={0.2}>SORA risk-based approvals replace blanket bans — first-mover window is NOW</Bullet>
                  <Bullet delay={0.3}>Switzerland among 3 EU-adjacent countries with LUC pathway legislated</Bullet>
                  <Bullet delay={0.4}>Highest labor costs in Europe = highest drone ROI per flight</Bullet>
                </ul>
              </motion.div>
            </Stagger>
          </div>
        </div>
      </section>


      {/* ═══ SLIDE 5: INDUSTRY VERTICALS ═══ */}
      <section
        ref={setRef(5)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="04" text="Industry Verticals" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Not One Vertical.{" "}
              <span style={{ color: C.accent }}>An Entire Ecosystem.</span>
            </motion.h2>
          </Stagger>

          {/* Four vertical cards with animated step sequences */}
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10" delay={0.2}>
            {[
              {
                title: "Construction",
                icon: HardHat,
                image: "/images/flycart-scene-2.webp",
                color: C.accent,
                steps: [
                  { icon: FileText, label: "Order materials" },
                  { icon: Rocket, label: "Drone lifts 85-200 kg" },
                  { icon: MapPin, label: "Mountain delivery" },
                ],
                desc: "Materials to mountain sites, equipment lifting. Replaces expensive helicopter and crane operations.",
              },
              {
                title: "Agriculture",
                icon: Wheat,
                image: "/images/flycart-lastendrohne.webp",
                color: C.gold,
                steps: [
                  { icon: Eye, label: "Field scan" },
                  { icon: Zap, label: "Precision spray" },
                  { icon: CheckCircle2, label: "60% less chemicals" },
                ],
                desc: "Crop spraying, seeding, monitoring. Zero soil compaction, 60% less chemical use.",
              },
              {
                title: "Infrastructure",
                icon: Eye,
                image: "/images/flycart-ingenieurverkehr.webp",
                color: C.green,
                steps: [
                  { icon: Cpu, label: "Thermal imaging" },
                  { icon: Shield, label: "Powerline inspect" },
                  { icon: Wrench, label: "Maintenance plan" },
                ],
                desc: "Thermal imaging, powerline inspection, infrastructure maintenance at scale.",
              },
              {
                title: "Emergency",
                icon: HeartPulse,
                image: "/images/flycart-notfalltransport.webp",
                color: C.red,
                steps: [
                  { icon: Zap, label: "Alert received" },
                  { icon: Rocket, label: "Rapid deploy" },
                  { icon: HeartPulse, label: "Lives saved" },
                ],
                desc: "Medical supply, rescue support. 24/7 ready, rapid deployment anywhere.",
              },
            ].map((vertical, vi) => (
              <motion.div
                key={vertical.title}
                variants={fadeUp}
                className="rounded-2xl overflow-hidden border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <img
                  src={vertical.image}
                  alt={vertical.title}
                  className="w-full h-36 object-cover"
                />
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: vertical.color + "12" }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: vi * 0.3 }}
                    >
                      <vertical.icon className="w-5 h-5" style={{ color: vertical.color }} />
                    </motion.div>
                    <span className="text-base font-bold" style={{ color: C.text }}>
                      {vertical.title}
                    </span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: C.textSecondary }}>
                    {vertical.desc}
                  </p>
                  {/* Animated step sequence */}
                  <div className="space-y-2">
                    {vertical.steps.map((step, si) => (
                      <motion.div
                        key={si}
                        className="flex items-center gap-2 p-2 rounded-lg"
                        style={{ background: vertical.color + "08" }}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + vi * 0.1 + si * 0.15 }}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: si * 0.3 }}
                        >
                          <step.icon className="w-3.5 h-3.5 shrink-0" style={{ color: vertical.color }} />
                        </motion.div>
                        <span className="text-xs font-semibold" style={{ color: C.textSecondary }}>{step.label}</span>
                        {si < vertical.steps.length - 1 && (
                          <ArrowRight className="w-3 h-3 ml-auto shrink-0" style={{ color: vertical.color + "40" }} />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>


      {/* ═══ SLIDE 6: THE PLATFORM ═══ */}
      <section
        ref={setRef(6)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="05" text="The Platform" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              airBASE Platform —{" "}
              <span style={{ color: C.accent }}>The Brain Behind the Fleet</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xs sm:text-base md:text-lg mt-3 max-w-3xl" style={{ color: C.textSecondary }}>
              A fully integrated, AI-powered operations platform managing every aspect of commercial drone operations — from customer booking to autonomous flight dispatch, compliance tracking, and real-time fleet monitoring.
            </motion.p>
          </Stagger>

          {/* Three dashboard views */}
          <Stagger className="grid md:grid-cols-3 gap-6 mt-10" delay={0.3}>
            {[
              {
                title: "Admin Dashboard",
                icon: BarChart3,
                color: C.accent,
                features: ["Fleet management & health monitoring", "Revenue analytics & KPIs", "Regulatory compliance tracking", "Franchise partner oversight"],
              },
              {
                title: "Pilot App",
                icon: MapPin,
                color: C.green,
                features: ["Real-time mission assignments", "Pre-flight checklists & NOTAM integration", "Flight logging & telemetry", "Weather & airspace alerts"],
              },
              {
                title: "Customer Portal",
                icon: Users,
                color: C.gold,
                features: ["Self-service booking & scheduling", "Live delivery tracking", "Automated invoicing", "Service history & reports"],
              },
            ].map((view, i) => (
              <motion.div
                key={view.title}
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadowLg }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: view.color + "12" }}
                  >
                    <view.icon className="w-5 h-5" style={{ color: view.color }} />
                  </div>
                  <div className="text-sm font-mono uppercase tracking-wider font-bold" style={{ color: view.color }}>
                    {view.title}
                  </div>
                </div>
                <ul className="space-y-2">
                  {view.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: view.color }} />
                      <span className="text-sm" style={{ color: C.textSecondary }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </Stagger>

          {/* AI-Powered Capabilities */}
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8" delay={0.6}>
            {[
              { icon: Cpu, label: "AI-Powered Dispatch", desc: "Autonomous mission planning & optimization" },
              { icon: Shield, label: "EASA/BAZL Compliant", desc: "Built-in regulatory framework & audit trails" },
              { icon: Zap, label: "Real-Time Telemetry", desc: "Live fleet status, GPS, battery & payload data" },
              { icon: Layers, label: "Franchise-Ready", desc: "Multi-tenant architecture for scalable licensing" },
            ].map((cap) => (
              <motion.div
                key={cap.label}
                variants={fadeUp}
                className="rounded-xl p-4 border text-center"
                style={{ background: C.accentLight, borderColor: C.borderAccent, boxShadow: C.shadow }}
              >
                <cap.icon className="w-6 h-6 mx-auto mb-2" style={{ color: C.accent }} />
                <div className="text-xs font-mono font-bold uppercase" style={{ color: C.accent }}>{cap.label}</div>
                <div className="text-xs mt-1" style={{ color: C.textSecondary }}>{cap.desc}</div>
              </motion.div>
            ))}
          </Stagger>

          {/* Live Demo CTA */}
          <Stagger delay={0.9}>
            <motion.div
              variants={scaleUp}
              className="mt-8 sm:mt-10 rounded-2xl p-5 sm:p-8 border text-center"
              style={{
                borderColor: C.accent + "30",
                background: `linear-gradient(135deg, ${C.accentLight} 0%, ${C.accentGlow} 100%)`,
                boxShadow: C.shadowLg,
              }}
            >
              <div className="text-xs font-mono uppercase tracking-[0.2em] mb-3" style={{ color: C.textMuted }}>
                See It In Action
              </div>
              <div className="text-base sm:text-xl md:text-2xl font-bold mb-4" style={{ color: C.text }}>
                Our platform is live. Try it yourself.
              </div>
              <div className="flex items-center justify-center">
                <a
                  href="https://airbase-platform.vercel.app/admin?section=live-ops"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-transform hover:scale-105"
                  style={{
                    background: C.accent,
                    color: "#fff",
                    boxShadow: `0 4px 20px ${C.accent}40`,
                  }}
                >
                  <Rocket className="w-5 h-5" />
                  LIVE DEMO
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <div className="text-xs mt-3" style={{ color: C.textMuted }}>
                airbase-platform.vercel.app/admin
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>


      {/* ═══ SLIDE 7: COMPETITIVE EDGE ═══ */}
      <section
        ref={setRef(7)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20 overflow-hidden"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="relative max-w-6xl mx-auto w-full">
          <SlideLabel number="06" text="Competitive Edge" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Our Real Moat:{" "}
              <span style={{ color: C.gold }}>LUC + AI + Franchise + Network</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-sm sm:text-lg mt-2 max-w-2xl"
              style={{ color: C.textSecondary }}
            >
              The drone hardware is commodity — anyone can buy a DJI drone. Our competitive advantage is the LUC (Light UAS operator Certificate) making us a self-authorized drone airline, the intelligent AI system, the scalable franchise model, and our unmatched network.
            </motion.p>
          </Stagger>

          {/* Four moat pillars — LUC, AI, Franchise, Network */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-10">
            <Stagger delay={0.15}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-4 sm:p-5 border relative overflow-hidden"
                style={{ background: C.goldLight, borderColor: C.gold + "20", boxShadow: C.shadowLg }}
              >
                <Shield className="w-5 h-5 sm:w-7 sm:h-7 mb-2 sm:mb-3" style={{ color: C.gold }} />
                <div className="text-xs sm:text-sm font-mono uppercase tracking-wider mb-1" style={{ color: C.gold }}>
                  LUC — Drone Airline
                </div>
                <div className="text-[10px] sm:text-xs font-mono font-bold mb-2 sm:mb-3" style={{ color: C.gold }}>
                  Self-Authorized Flights
                </div>
                <ul className="space-y-1.5">
                  {[
                    "15 years experience + proprietary software = ability to achieve LUC",
                    "Self-authorize flights — no per-mission approvals",
                    "LUC makes the franchise model sellable and scalable",
                    "Massive regulatory moat — near-impossible to replicate",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: C.textSecondary }}>
                      <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.gold }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>

            <Stagger delay={0.3}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-4 sm:p-5 border"
                style={{ borderColor: C.accent + "20", background: C.accentLight, boxShadow: C.shadowLg }}
              >
                <Cpu className="w-5 h-5 sm:w-7 sm:h-7 mb-2 sm:mb-3" style={{ color: C.accent }} />
                <div className="text-xs sm:text-sm font-mono uppercase tracking-wider mb-1" style={{ color: C.accent }}>
                  AI-Powered Operations
                </div>
                <div className="text-[10px] sm:text-xs font-mono font-bold mb-2 sm:mb-3" style={{ color: C.accent }}>
                  Already valued at CHF 1 Million
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Entire company operates autonomously via AI",
                    "Automated dispatch, compliance & invoicing",
                    "Scales without linear headcount growth",
                    "Data flywheel: every flight improves the system",
                    "Proprietary software — not replicable overnight",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: C.textSecondary }}>
                      <Zap className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.accent }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>

            <Stagger delay={0.45}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-4 sm:p-5 border relative overflow-hidden"
                style={{ background: C.goldLight, borderColor: C.gold + "20", boxShadow: C.shadowLg }}
              >
                <Globe className="w-5 h-5 sm:w-7 sm:h-7 mb-2 sm:mb-3 relative z-10" style={{ color: C.gold }} />
                <div className="text-xs sm:text-sm font-mono uppercase tracking-wider mb-2 relative z-10" style={{ color: C.gold }}>
                  Franchise Model
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Rapid geographic scaling without capital drag",
                    "Partners invest locally, we provide the platform",
                    "Recurring SaaS + franchise licensing revenue",
                    "Proven playbook: from 1 to 100 regions fast",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: C.textSecondary }}>
                      <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.gold }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>

            <Stagger delay={0.6}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-4 sm:p-5 border"
                style={{ background: C.greenLight, borderColor: C.green + "20", boxShadow: C.shadowLg }}
              >
                <Users className="w-5 h-5 sm:w-7 sm:h-7 mb-2 sm:mb-3" style={{ color: C.green }} />
                <div className="text-xs sm:text-sm font-mono uppercase tracking-wider mb-2" style={{ color: C.green }}>
                  Massive Existing Network
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Marketing agency + VSNZ event label — worldwide operations",
                    "Know all major companies in Switzerland — immediate B2B access",
                    "Day-one marketing: TV, social media, industry events",
                    "Not a cold start — we ARE the center of the market",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: C.textSecondary }}>
                      <Shield className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.green }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>
          </div>

          {/* Why We Win — Experience + Software + LUC */}
          <Stagger delay={0.4}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.borderAccent, boxShadow: C.shadowLg }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.accent }}>
                Why Only We Can Do This
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.gold }} />
                    <div>
                      <div className="text-sm font-bold mb-1" style={{ color: C.text }}>15 Years Experience + Proprietary Software = LUC</div>
                      <p className="text-xs" style={{ color: C.textSecondary }}>
                        Our team has 15 years of hands-on drone industry experience. Combined with our proprietary AI operations platform, we have everything needed to achieve the LUC (Light UAS operator Certificate). The LUC makes AIRBASE a self-authorized drone airline — and makes the franchise model sellable and scalable.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.gold }} />
                    <div>
                      <div className="text-sm font-bold mb-1" style={{ color: C.text }}>LUC = The Key to Everything</div>
                      <p className="text-xs" style={{ color: C.textSecondary }}>
                        Without the LUC, every flight needs individual regulatory approval. With it, we self-authorize — faster, cheaper, scalable. This is what makes franchisees willing to pay. Without software like ours, achieving LUC at scale is virtually impossible.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Cpu className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.accent }} />
                    <div>
                      <div className="text-sm font-bold mb-1" style={{ color: C.text }}>AI System — Already Valued at CHF 1M</div>
                      <p className="text-xs" style={{ color: C.textSecondary }}>
                        Our proprietary platform automates dispatch, compliance, invoicing, and fleet management. It scales without linear headcount — every flight makes the system smarter. This is not replicable overnight.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.green }} />
                    <div>
                      <div className="text-sm font-bold mb-1" style={{ color: C.text }}>Franchise — From 1 to 100 Regions</div>
                      <p className="text-xs" style={{ color: C.textSecondary }}>
                        Partners invest locally, we provide the platform + LUC sub-licence. Rapid geographic scaling with recurring SaaS and franchise revenue. No capital drag.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Stagger>

          {/* Network — Marketing Power */}
          <Stagger delay={0.6}>
            <motion.div
              variants={fadeUp}
              className="mt-6 rounded-2xl p-6 border"
              style={{ background: C.greenLight, borderColor: C.green + "25", boxShadow: C.shadowLg }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6" style={{ color: C.green }} />
                <div>
                  <div className="text-sm font-mono uppercase tracking-wider font-bold" style={{ color: C.green }}>
                    Our Network — Instant Market Access
                  </div>
                  <div className="text-xs" style={{ color: C.textMuted }}>We don&rsquo;t start from zero. We start from the center of the market.</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Major Marketing Agency", desc: "We already run a marketing agency with drone flights as everyday business. We know every major company in Switzerland and their logistics needs." },
                  { title: "VSNZ — One of Switzerland's Biggest Event Labels", desc: "Our CEO runs VSNZ, one of the largest Swiss event labels. Both companies operating worldwide today — deep brand credibility and B2B relationships." },
                  { title: "From Day One: Proper Marketing", desc: "TV shows, social media, industry events — we have the infrastructure to be the center of the entire drone logistics market from launch. No cold start." },
                  { title: "B2B Pipeline Ready", desc: "We already know the customers, their pain points, and their budgets. Immediate access to construction, agriculture, and infrastructure companies across Switzerland." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.7)" }}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="text-xs font-bold mb-1" style={{ color: C.green }}>{item.title}</div>
                    <p className="text-xs" style={{ color: C.textSecondary }}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* Strategic Partner */}
          <Stagger delay={0.8}>
            <motion.div
              variants={fadeUp}
              className="mt-6 rounded-2xl p-5 border flex items-center gap-4"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <Rocket className="w-6 h-6 shrink-0" style={{ color: C.accent }} />
              <div>
                <div className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.accent }}>
                  Strategic Partnership: Loft Dynamics
                </div>
                <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
                  World-leading VR flight simulator company — pilot training infrastructure &amp; safety certification edge.
                </p>
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>


      {/* ═══ SLIDE 8: BUSINESS MODEL ═══ */}
      <section
        ref={setRef(8)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="07" text="Business Model" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Three Revenue Engines.{" "}
              <span style={{ color: C.accent }}>One Unstoppable Platform.</span>
            </motion.h2>
          </Stagger>

          {/* Three revenue streams */}
          <Stagger className="grid md:grid-cols-3 gap-6 mt-12" delay={0.3}>
            {[
              {
                title: "Drone-as-a-Service",
                sub: "DaaS — Primary Revenue",
                desc: "Construction, agriculture, infrastructure, emergency — B2B contracts across all four verticals.",
                metric: "~65% gross margin",
                revenue: "Per-flight fee + SLA retainer",
                icon: Rocket,
                color: C.accent,
              },
              {
                title: "Platform SaaS",
                sub: "Software Licensing",
                desc: "Licensing AIRBASE software stack to third-party operators — all service modules included.",
                metric: "~80% gross margin",
                revenue: "Monthly licence + API fees",
                icon: Cpu,
                color: C.gold,
              },
              {
                title: "Franchise Licensing",
                sub: "Scale",
                desc: "Partners acquire AIRBASE-branded drone kits + full service portfolio + LUC sub-licence.",
                metric: "CHF 85K setup + 12% royalty",
                revenue: "Lower capex, faster expansion",
                icon: Globe,
                color: C.green,
              },
            ].map((stream) => (
              <motion.div
                key={stream.title}
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: stream.color + "10" }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <stream.icon className="w-5 h-5" style={{ color: stream.color }} />
                </motion.div>
                <div className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: stream.color }}>
                  {stream.sub}
                </div>
                <div className="text-base sm:text-lg font-bold mb-2" style={{ color: C.text }}>
                  {stream.title}
                </div>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: C.textSecondary }}>
                  {stream.desc}
                </p>
                <div className="text-sm font-semibold" style={{ color: stream.color }}>
                  {stream.metric}
                </div>
                <div className="text-xs mt-1" style={{ color: C.textMuted }}>
                  {stream.revenue}
                </div>
              </motion.div>
            ))}
          </Stagger>

          {/* Revenue mix projection */}
          <Stagger delay={0.6}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border text-center"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>
                Projected Year 3 Revenue Mix
              </div>
              <div className="flex justify-center gap-6 sm:gap-12">
                {[
                  { label: "DaaS", pct: "55%", color: C.accent },
                  { label: "SaaS", pct: "25%", color: C.gold },
                  { label: "Franchise", pct: "20%", color: C.green },
                ].map((mix) => (
                  <div key={mix.label}>
                    <div className="text-xl sm:text-3xl font-bold font-mono" style={{ color: mix.color }}>{mix.pct}</div>
                    <div className="text-xs mt-1" style={{ color: C.textMuted }}>{mix.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>


      {/* ═══ SLIDE 9: TRACTION & TEAM ═══ */}
      <section
        ref={setRef(9)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="08" text="Traction & Team" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Fleet Ready. Team Ready.{" "}
              <span style={{ color: C.green }}>Market Ready.</span>
            </motion.h2>
          </Stagger>

          {/* Timeline */}
          <Stagger className="mt-10 space-y-3" delay={0.2}>
            {[
              { date: "Q1 2026", text: "Company incorporated & DJI FlyCart 100 fleet acquired (5 units)", done: true },
              { date: "Q1 2026", text: "AIRBASE platform v1.0 launched (portal + admin + pilot app)", done: true },
              { date: "Q1 2026", text: "SORA / BAZL applications filed", done: true },
              { date: "Q1 2026", text: "4 licensed drone pilots operational, 5 more in recruitment pipeline", done: true },
              { date: "Q2 2026*", text: "First commercial pilot flights (internal ops)", done: false },
              { date: "Q3-Q4 2026*", text: "DJI FlyCart 200 fleet expansion (200 kg payload — pending global launch + EASA certification)", done: false },
              { date: "Q4 2026*", text: "First DaaS enterprise contracts", done: false },
              { date: "Q1 2027*", text: "Franchise pilot program (2 partners)", done: false },
              { date: "Late 2027*", text: "LUC certification expected", done: false },
            ].map((milestone, i) => (
              <motion.div
                key={i}
                variants={slideRight}
                className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-xl border"
                style={{
                  borderColor: milestone.done ? C.green + "20" : C.border,
                  background: milestone.done ? C.greenLight : C.bgCard,
                  boxShadow: milestone.done ? "none" : C.shadow,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0 mt-1 sm:mt-0"
                  style={{ background: milestone.done ? C.green : C.textMuted + "30", border: milestone.done ? "none" : `2px dashed ${C.textMuted}40` }}
                />
                <span className="text-xs font-mono w-20 shrink-0" style={{ color: milestone.done ? C.green : C.textMuted }}>
                  {milestone.date}
                </span>
                <span className="text-xs sm:text-sm" style={{ color: C.textSecondary }}>
                  {milestone.text}
                </span>
              </motion.div>
            ))}
          </Stagger>

          <Stagger delay={0.5}>
            <motion.div variants={fadeUp} className="mt-4 text-xs" style={{ color: C.textMuted }}>
              * Projected milestones — subject to regulatory timelines
            </motion.div>
          </Stagger>

          {/* Leadership — Founders */}
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {/* Benjamin Rubi — FEATURED CEO card */}
            <Stagger delay={0.6}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-5 border md:row-span-1"
                style={{ background: `linear-gradient(135deg, ${C.goldLight} 0%, ${C.bgCard} 100%)`, borderColor: C.gold + "30", boxShadow: C.shadowLg }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center overflow-hidden"
                  style={{ background: C.accentGlow }}
                >
                  <img
                    src="/images/team/benjamin-rubi.jpg"
                    alt="Benjamin Rubi"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size:1.25rem;font-weight:bold;color:#D32F2F">BR</span>`; }}
                  />
                </div>
                <div className="text-sm sm:text-base font-bold" style={{ color: C.text }}>Benjamin Rubi</div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mt-0.5" style={{ color: C.accent }}>Founder &amp; CEO</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: C.accentGlow, color: C.accent }}>15+ Years Drone Industry</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: C.green + "12", color: C.green }}>Marketing Agency CEO</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: C.gold + "15", color: C.gold }}>VSNZ Founder</span>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-xs" style={{ color: C.textSecondary }}>
                    15 years building and operating drone companies. Deep expertise in BAZL/FOCA &amp; EASA regulatory navigation.
                  </p>
                  <p className="text-xs" style={{ color: C.textSecondary }}>
                    Currently runs a <strong>marketing agency</strong> that already does <strong>drone flights for marketing purposes</strong> as everyday business — operating worldwide.
                  </p>
                  <p className="text-xs" style={{ color: C.textSecondary }}>
                    Founder of <strong>VSNZ</strong> — one of Switzerland&rsquo;s biggest event labels. Both companies operating worldwide today with deep B2B networks across all major Swiss industries.
                  </p>
                </div>
              </motion.div>
            </Stagger>

            {/* Chris Jon Graf */}
            <Stagger delay={0.7}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-5 border"
                style={{ background: C.accentLight, borderColor: C.borderAccent, boxShadow: C.shadowLg }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center overflow-hidden"
                  style={{ background: C.accentGlow }}
                >
                  <img
                    src="/images/team/chris-graf.jpg"
                    alt="Chris Jon Graf"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size:1.25rem;font-weight:bold;color:#D32F2F">CG</span>`; }}
                  />
                </div>
                <div className="text-sm sm:text-base font-bold" style={{ color: C.text }}>Chris Jon Graf</div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mt-0.5" style={{ color: C.accent }}>CTO &amp; Head of AI</div>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ background: C.accentGlow, color: C.accent }}>Robotics &amp; AI</span>
                </div>
                <p className="text-xs sm:text-sm mt-2" style={{ color: C.textSecondary }}>Robotics and AI engineering background. Architecting the AI-powered platform that automates fleet operations, dispatch, and compliance.</p>
              </motion.div>
            </Stagger>

            {/* Vertical Masters */}
            <Stagger delay={0.8}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-5 border"
                style={{ background: C.bgCard, borderColor: C.gold + "30", boxShadow: C.shadowLg }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center overflow-hidden"
                  style={{ background: C.accentGlow }}
                >
                  <img
                    src="/images/team/vertical-masters.jpg"
                    alt="Vertical Masters"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size:1.25rem;font-weight:bold;color:#D32F2F">VM</span>`; }}
                  />
                </div>
                <div className="text-sm sm:text-base font-bold" style={{ color: C.text }}>Vertical Masters</div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider mt-0.5" style={{ color: C.accent }}>Training &amp; LUC Partner</div>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ background: C.accentGlow, color: C.accent }}>Training &amp; LUC</span>
                </div>
                <p className="text-xs sm:text-sm mt-2" style={{ color: C.textSecondary }}>Strategic partner for LUC certification. Provides pilot training center and regulatory expertise to achieve airline-grade certification.</p>
              </motion.div>
            </Stagger>
          </div>

          {/* KEY SELLING POINT: Team funded by existing companies */}
          <Stagger delay={0.9}>
            <motion.div
              variants={scaleUp}
              className="mt-6 rounded-2xl p-5 sm:p-6 border"
              style={{ background: `linear-gradient(135deg, ${C.greenLight} 0%, ${C.goldLight} 100%)`, borderColor: C.green + "25", boxShadow: C.shadowLg }}
            >
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5" style={{ color: C.green }} />
                <span className="text-sm font-mono uppercase tracking-wider font-bold" style={{ color: C.green }}>
                  Zero Burn on Salaries — Team is Self-Funded
                </span>
              </div>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                The entire current team is paid by Benjamin&rsquo;s two existing companies (marketing agency + VSNZ). The team can switch to AIRBASE fast once operations scale. This means: <strong style={{ color: C.green }}>no burn on salaries from investor money</strong> — experienced team, already operational, funded by existing revenue streams.
              </p>
            </motion.div>
          </Stagger>

          {/* Key Team */}
          <Stagger delay={0.9}>
            <motion.div variants={fadeUp} className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5" style={{ color: C.accent }} />
                <span className="text-sm font-mono uppercase tracking-wider font-bold" style={{ color: C.accent }}>
                  Key Team
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { name: "Nikita Eberhart", role: "Deputy Managing Director", initials: "NE" },
                  { name: "Claude Gfeller", role: "Operations Manager", initials: "CG" },
                  { name: "Nicolas Jud", role: "Operations & Fleet Manager", initials: "NJ" },
                  { name: "Ralph Menth", role: "Marketing PM", initials: "RM" },
                  { name: "Jamie Wyss", role: "Customer Support", initials: "JW" },
                ].map((p) => (
                  <motion.div
                    key={p.name}
                    variants={fadeUp}
                    className="rounded-xl p-3 border text-center"
                    style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ background: C.accentGlow }}
                    >
                      <span className="text-xs font-bold" style={{ color: C.accent }}>{p.initials}</span>
                    </div>
                    <div className="text-xs font-semibold leading-tight" style={{ color: C.text }}>{p.name}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{p.role}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* Licensed Drone Pilots */}
          <Stagger delay={1.0}>
            <motion.div variants={fadeUp} className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5" style={{ color: C.green }} />
                <span className="text-sm font-mono uppercase tracking-wider font-bold" style={{ color: C.green }}>
                  Licensed Drone Pilots
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Tobias Pohl", initials: "TP" },
                  { name: "Lars Wanner", initials: "LW" },
                  { name: "Sidario Belzarini", initials: "SB" },
                  { name: "Janis Perron", initials: "JP" },
                ].map((p) => (
                  <motion.div
                    key={p.name}
                    variants={fadeUp}
                    className="rounded-xl p-3 border text-center"
                    style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ background: C.green + "15" }}
                    >
                      <span className="text-xs font-bold" style={{ color: C.green }}>{p.initials}</span>
                    </div>
                    <div className="text-xs font-semibold leading-tight" style={{ color: C.text }}>{p.name}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: C.green }}>Pilot</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: C.green + "12", color: C.green, border: `1px solid ${C.green}20` }}>
                  + 5 additional pilots in recruitment pipeline
                </span>
              </div>
            </motion.div>
          </Stagger>

          {/* Advisory & Partners */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Stagger delay={1.1}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-4 sm:p-5 border flex items-center gap-4"
                style={{ background: C.greenLight, borderColor: C.green + "20", boxShadow: C.shadow }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: C.green + "15" }}
                >
                  <Users className="w-6 h-6" style={{ color: C.green }} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono" style={{ color: C.green }}>
                    12 Team Members
                  </div>
                  <div className="text-xs sm:text-sm" style={{ color: C.textSecondary }}>
                    3 leadership + 5 key team + 4 licensed drone pilots — fully certified and flight-ready.
                  </div>
                </div>
              </motion.div>
            </Stagger>

            <Stagger delay={1.2}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-5 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-4 h-4" style={{ color: C.gold }} />
                  <span className="text-sm font-mono uppercase tracking-wider" style={{ color: C.gold }}>
                    Advisory &amp; Partners
                  </span>
                </div>
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  <strong>Loft Dynamics</strong> (flight simulators) &middot; DJI Enterprise Channel &middot; Swiss aviation counsel
                </p>
              </motion.div>
            </Stagger>
          </div>
        </div>
      </section>


      {/* ═══ SLIDE 10: FINANCIAL PROJECTIONS ═══ */}
      <section
        ref={setRef(10)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="09" text="Financial Projections" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Built to Print Money{" "}
              <span style={{ color: C.accent }}>from Day One</span>
            </motion.h2>
          </Stagger>

          {/* Unit economics */}
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10" delay={0.2}>
            {[
              { label: "Revenue per DaaS flight", value: "CHF 22-40" },
              { label: "Variable cost per flight", value: "CHF 4-6" },
              { label: "Gross margin per flight", value: "~75-82%" },
              { label: "Break-even utilization", value: "6 flights/day" },
            ].map((m) => (
              <motion.div
                key={m.label}
                variants={fadeUp}
                className="rounded-xl p-4 border text-center"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="text-[10px] sm:text-xs font-mono uppercase" style={{ color: C.textMuted }}>{m.label}</div>
                <div className="text-sm sm:text-lg font-bold font-mono mt-1" style={{ color: C.text }}>{m.value}</div>
              </motion.div>
            ))}
          </Stagger>

          {/* Revenue projection chart */}
          <Stagger delay={0.5}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>
                6-Year Revenue Projection (CHF)
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueProjection} barCategoryGap="20%">
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.accent} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={C.accent} stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke={C.textMuted + "40"} tick={{ fill: C.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    stroke={C.textMuted + "40"}
                    tick={{ fill: C.textMuted, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}M`}
                  />
                  <Tooltip
                    contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, boxShadow: C.shadow }}
                    formatter={(v) => [`CHF ${v}M`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="url(#revGrad)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs mt-4 italic" style={{ color: C.textMuted }}>
                Projections are forward-looking estimates based on internal models and market benchmarks. Not guarantees.
              </div>
            </motion.div>
          </Stagger>

          {/* Year cards */}
          <Stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 mt-6" delay={0.7}>
            {[
              { year: "2026", rev: "120K", note: "Pilot ops" },
              { year: "2027", rev: "680K", note: "First contracts" },
              { year: "2028", rev: "2.4M", note: "DaaS + SaaS" },
              { year: "2029", rev: "7.2M", note: "10 franchise partners" },
              { year: "2030", rev: "14M", note: "Growth phase" },
              { year: "2031", rev: "22M", note: "Market leadership" },
            ].map((yr) => (
              <motion.div
                key={yr.year}
                variants={fadeUp}
                className="rounded-xl p-3 border text-center"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="text-xs font-mono" style={{ color: C.accent }}>{yr.year}</div>
                <div className="text-sm sm:text-lg font-bold font-mono" style={{ color: C.text }}>CHF {yr.rev}</div>
                <div className="text-xs" style={{ color: C.textMuted }}>{yr.note}</div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>


      {/* ═══ SLIDE 11: SUSTAINABILITY ═══ */}
      <section
        ref={setRef(11)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start", background: `linear-gradient(170deg, #F0FDF4 0%, ${C.bg} 50%, ${C.bgAlt} 100%)` }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="10" text="Sustainability" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.green }}
            >
              Zero Emissions. Zero Compromise.{" "}
              <span style={{ color: C.text }}>100% Solar-Powered.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-lg mt-3 max-w-3xl" style={{ color: C.textSecondary }}>
              Every drone and transport vehicle runs{" "}
              <strong style={{ color: C.green }}>exclusively on solar energy</strong>.
              Sustainability is our competitive edge, not an afterthought.
            </motion.p>
          </Stagger>

          {/* Emissions comparison: Helicopter vs Drone */}
          <Stagger className="grid md:grid-cols-2 gap-6 mt-10" delay={0.2}>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-6 border"
              style={{ background: C.bg, borderColor: C.green + "25", boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: C.green + "12" }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mountain className="w-5 h-5" style={{ color: C.green }} />
                </motion.div>
                <div>
                  <div className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.green }}>
                    Transport &amp; Construction
                  </div>
                  <div className="text-xs" style={{ color: C.textMuted }}>Drone vs Helicopter</div>
                </div>
              </div>

              {/* CO2 Comparison */}
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold" style={{ color: C.textSecondary }}>Helicopter</span>
                  <span className="text-sm font-mono font-bold" style={{ color: C.red }}>~68 kg CO&#x2082;/h</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${C.red}, #EF5350)` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: "95%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold" style={{ color: C.textSecondary }}>AIRBASE Drone</span>
                  <span className="text-sm font-mono font-bold" style={{ color: C.green }}>0 g CO&#x2082;</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${C.green}, #4ADE80)` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: "3%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: C.green + "15" }}>
                <span className="text-xl sm:text-2xl font-bold font-mono" style={{ color: C.green }}>100%</span>
                <span className="text-xs sm:text-sm ml-2" style={{ color: C.textSecondary }}>emission reduction per flight</span>
              </div>
            </motion.div>

            {/* Emissions comparison: Tractor vs Drone */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-6 border"
              style={{ background: C.bg, borderColor: C.green + "25", boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: C.green + "12" }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <Wheat className="w-5 h-5" style={{ color: C.green }} />
                </motion.div>
                <div>
                  <div className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.green }}>
                    Agriculture
                  </div>
                  <div className="text-xs" style={{ color: C.textMuted }}>Drone vs Tractor per hectare</div>
                </div>
              </div>

              {/* Tractor bar */}
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold" style={{ color: C.textSecondary }}>Diesel Tractor</span>
                  <span className="text-sm font-mono font-bold" style={{ color: C.red }}>41.3 kg CO&#x2082;/ha</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${C.red}, #EF5350)` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: "95%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Diesel fuel &middot; soil compaction &middot; 365 MJ/ha</div>
              </div>

              {/* Drone bar */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold" style={{ color: C.textSecondary }}>AIRBASE Drone</span>
                  <span className="text-sm font-mono font-bold" style={{ color: C.green }}>0 kg CO&#x2082;/ha</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${C.green}, #4ADE80)` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: "3%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Solar-charged &middot; zero soil damage &middot; precision spray</div>
              </div>

              <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: C.green + "15" }}>
                <span className="text-xl sm:text-2xl font-bold font-mono" style={{ color: C.green }}>100%</span>
                <span className="text-xs sm:text-sm ml-2" style={{ color: C.textSecondary }}>emission reduction per hectare</span>
              </div>
            </motion.div>
          </Stagger>

          {/* NEW: Noise Comparison */}
          <Stagger delay={0.4}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bg, borderColor: C.green + "25", boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: C.green + "12" }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <VolumeX className="w-5 h-5" style={{ color: C.green }} />
                </motion.div>
                <div>
                  <div className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.green }}>
                    Noise Comparison
                  </div>
                  <div className="text-xs" style={{ color: C.textMuted }}>Drones are dramatically quieter</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Helicopter noise */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4" style={{ color: C.red }} />
                    <span className="text-sm font-semibold" style={{ color: C.textSecondary }}>Helicopter</span>
                    <span className="text-sm font-mono font-bold ml-auto" style={{ color: C.red }}>100+ dB</span>
                  </div>
                  <div className="h-5 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <motion.div
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ background: `linear-gradient(90deg, #EF5350, ${C.red})` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: "95%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.2 }}
                    >
                      <span className="text-[10px] font-mono font-bold text-white">EXTREMELY LOUD</span>
                    </motion.div>
                  </div>
                  <div className="text-xs mt-1" style={{ color: C.textMuted }}>Like a rock concert at close range</div>
                </div>

                {/* Drone noise */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <VolumeX className="w-4 h-4" style={{ color: C.green }} />
                    <span className="text-sm font-semibold" style={{ color: C.textSecondary }}>AIRBASE Drone</span>
                    <span className="text-sm font-mono font-bold ml-auto" style={{ color: C.green }}>~65 dB</span>
                  </div>
                  <div className="h-5 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <motion.div
                      className="h-full rounded-full flex items-center px-2"
                      style={{ background: `linear-gradient(90deg, #4ADE80, ${C.green})` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: "42%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.4 }}
                    >
                      <span className="text-[10px] font-mono font-bold text-white">QUIET</span>
                    </motion.div>
                  </div>
                  <div className="text-xs mt-1" style={{ color: C.textMuted }}>Normal conversation level</div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t flex items-center justify-center gap-3" style={{ borderColor: C.green + "20" }}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <VolumeX className="w-5 h-5" style={{ color: C.green }} />
                </motion.div>
                <span className="text-xs sm:text-sm font-semibold" style={{ color: C.green }}>
                  35+ dB quieter than helicopters — no noise complaints, no restricted hours
                </span>
              </div>
            </motion.div>
          </Stagger>

          {/* Solar powered KPIs */}
          <Stagger delay={0.6}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.greenLight, borderColor: C.green + "20" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Sun className="w-5 h-5" style={{ color: C.green }} />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.green }}>
                  Powered Exclusively by Solar Energy
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: "0g", label: "Direct CO\u2082 per flight", icon: Battery },
                  { value: "100%", label: "Solar-powered fleet", icon: Sun },
                  { value: "100%", label: "Solar transport vehicle", icon: Truck },
                  { value: "~95%", label: "Less energy vs diesel", icon: Leaf },
                ].map((kpi) => (
                  <motion.div key={kpi.label} variants={fadeUp} className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                    >
                      <kpi.icon className="w-5 h-5 mx-auto mb-2" style={{ color: C.green }} />
                    </motion.div>
                    <div className="text-lg sm:text-2xl font-bold font-mono" style={{ color: C.green }}>{kpi.value}</div>
                    <div className="text-xs mt-1" style={{ color: C.textMuted }}>{kpi.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: C.green + "20" }}>
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  From charging stations to the transport van — our entire logistics chain runs on renewable solar energy.
                </p>
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>


      {/* ═══ SLIDE 12: THE ASK ═══ */}
      <section
        ref={setRef(12)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="11" text="The Ask" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              <span style={{ color: C.accent }}>CHF 1.5M</span>{" "}
              to Own the Market Before It Exists
            </motion.h2>
          </Stagger>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mt-8 sm:mt-12">
            {/* Left column: Fund allocation + milestones */}
            <div className="space-y-8">
              {/* Fund allocation pie */}
              <Stagger delay={0.3}>
                <motion.div
                  variants={fadeUp}
                  className="rounded-2xl p-6 border"
                  style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
                >
                  <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>
                    Use of Funds — CHF 1.5M
                  </div>
                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={fundAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {fundAllocation.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: C.bgCard,
                            border: `1px solid ${C.border}`,
                            borderRadius: 12,
                            color: C.text,
                            fontSize: 13,
                            boxShadow: C.shadow,
                          }}
                          formatter={(v, _, props) => {
                            const p = props as unknown as { payload: { name: string; amount: string } };
                            return [`CHF ${p.payload.amount} (${v}%)`, p.payload.name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {fundAllocation.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                          <span style={{ color: C.textSecondary }}>{item.name}</span>
                        </div>
                        <span className="font-mono" style={{ color: C.text }}>
                          CHF {item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </Stagger>

              {/* Milestone unlocks */}
              <Stagger delay={0.5}>
                <motion.div variants={fadeUp} className="space-y-4">
                  <div className="text-sm font-mono uppercase tracking-wider" style={{ color: C.accent }}>
                    Milestone Unlocks This Round
                  </div>
                  <ul className="space-y-3">
                    <Bullet delay={0}>LUC certification achieved</Bullet>
                    <Bullet delay={0.1}>3 enterprise DaaS contracts signed</Bullet>
                    <Bullet delay={0.2}>Franchise program live (2 active partners)</Bullet>
                    <Bullet delay={0.3}>CHF 680K ARR target reached</Bullet>
                  </ul>

                  <div className="space-y-4 mt-6">
                    <div
                      className="rounded-xl p-4 border"
                      style={{ borderColor: C.borderAccent, background: C.accentLight }}
                    >
                      <div className="text-xs" style={{ color: C.textMuted }}>
                        Pre-Money Valuation
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold font-mono" style={{ color: C.accent }}>
                        CHF 8.5M
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl p-4 border" style={{ borderColor: C.border, background: C.bgCard, boxShadow: C.shadow }}>
                        <div className="text-xs" style={{ color: C.textMuted }}>
                          Instrument
                        </div>
                        <div className="text-sm font-bold mt-1" style={{ color: C.text }}>
                          Convertible Note
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                          (Convertible Loan)
                        </div>
                      </div>
                      <div className="rounded-xl p-4 border" style={{ borderColor: C.border, background: C.bgCard, boxShadow: C.shadow }}>
                        <div className="text-xs" style={{ color: C.textMuted }}>
                          Round
                        </div>
                        <div className="text-sm font-bold mt-1" style={{ color: C.text }}>
                          Seed
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Stagger>
            </div>

            {/* Right column: Investment Calculator */}
            <InvestmentSlider />
          </div>
        </div>
      </section>


      {/* ═══ SLIDE 13: VISION ═══ */}
      <section
        ref={setRef(13)}
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16 sm:py-20 overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Background Swiss landscape */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/assets/hero-flycart-mountains.jpg"
            alt=""
            className="w-full h-full object-cover opacity-[0.08]"
          />
        </div>

        <div className="relative max-w-5xl mx-auto w-full">
          <SlideLabel number="12" text="Vision" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              We&rsquo;re Not Entering a Market.{" "}
              <span style={{ color: C.accent }}>We&rsquo;re Building One.</span>
            </motion.h2>
          </Stagger>

          {/* 3-year vision */}
          <Stagger className="space-y-4 mt-12" delay={0.3}>
            {[
              {
                year: "2026",
                text: "Certified and operational. AIRBASE is Switzerland\u2019s most capable heavy-lift drone operator.",
                icon: Shield,
              },
              {
                year: "2027",
                text: "Platform licensed to 10+ operators. AIRBASE becomes infrastructure, not just a service.",
                icon: Layers,
              },
              {
                year: "2028",
                text: "Cross-border expansion. AIRBASE is the EASA-compliant standard for EU heavy-lift drone operations.",
                icon: Globe,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={slideRight}
                className="flex items-start gap-4 p-5 rounded-xl border"
                style={{ borderColor: C.borderAccent, background: C.accentLight }}
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                >
                  <item.icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.accent }} />
                </motion.div>
                <div>
                  <span className="text-sm font-mono font-bold" style={{ color: C.accent }}>{item.year}</span>
                  <span className="text-xs sm:text-base md:text-lg leading-relaxed ml-2 sm:ml-3" style={{ color: C.textSecondary }}>
                    {item.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </Stagger>

          {/* Vision metrics */}
          <Stagger delay={0.7}>
            <motion.div
              variants={scaleUp}
              className="mt-8 sm:mt-12 rounded-2xl p-5 sm:p-8 border text-center"
              style={{
                borderColor: C.gold + "20",
                background: `linear-gradient(135deg, ${C.goldLight} 0%, ${C.accentLight} 100%)`,
                boxShadow: C.shadowLg,
              }}
            >
              <div className="text-xs font-mono uppercase tracking-[0.3em] mb-6" style={{ color: C.gold }}>
                Shaping the Future of Multiple Industries
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { value: "10+", label: "Operators Licensed" },
                  { value: "5", label: "Countries" },
                  { value: "CHF 22M", label: "ARR Target" },
                  { value: "75%+", label: "Gross Margin" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold font-mono" style={{ color: C.text }}>
                      {m.value}
                    </div>
                    <div className="text-xs mt-1" style={{ color: C.textMuted }}>
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* Closing tagline */}
          <Stagger delay={1}>
            <motion.div variants={fadeUp} className="mt-16 text-center space-y-6">
              <p className="text-xl sm:text-3xl md:text-5xl font-bold" style={{ color: C.accent }}>
                The Future Doesn&rsquo;t Wait. Neither Do We.
              </p>
              <div className="pt-8 space-y-2">
                <div className="text-xs font-mono" style={{ color: C.textMuted }}>
                  airbase.swiss &mdash; Confidential
                </div>
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>
    </div>
  );
}
