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
  Package,
  MapPin,
  Clock,
  DollarSign,
  BarChart3,
  Layers,
  Banknote,
  Truck,
  Sparkles,
  Wheat,
  Eye,
  Mountain,
  HeartPulse,
  HardHat,
  Leaf,
  Sun,
  Battery,
} from "lucide-react";

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
      className="flex items-center gap-3 mb-8"
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
      className="rounded-2xl p-6 border"
      style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
          <Icon className="w-4 h-4" style={{ color: C.accent }} />
        </div>
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: C.textMuted }}>
          {label}
        </span>
      </div>
      <div className="text-3xl md:text-4xl font-bold font-mono" style={{ color: C.text }}>
        {value}
      </div>
      {sub && (
        <div className="text-sm mt-2" style={{ color: C.textMuted }}>
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
      className="flex items-start gap-3 text-base md:text-lg leading-relaxed"
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

/* ─── Investment Slider (Equity + Convertible Note) ─── */
function InvestmentSlider() {
  const [amount, setAmount] = useState(250);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const PRE_MONEY = 8500; // CHF 8.5M pre-money valuation (in K)
  const INTEREST_RATE = 6; // 6% p.a. — standard Swiss convertible note rate
  const equityPercent = (amount / PRE_MONEY) * 100;
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
      className="rounded-2xl p-8 border"
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
        <div className="text-4xl md:text-5xl font-bold font-mono" style={{ color: C.text }}>
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
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
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
          <div className="text-2xl font-bold font-mono" style={{ color: C.accent }}>{equityPercent.toFixed(1)}%</div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>Equity Stake</div>
          <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>of CHF 8.5M valuation</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: C.greenLight, border: `1px solid rgba(22,163,74,0.15)` }}>
          <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: C.green }} />
          <div className="text-2xl font-bold font-mono" style={{ color: C.green }}>{INTEREST_RATE}% p.a.</div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>Convertible Note Interest</div>
          <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>CHF {annualInterest}K / year</div>
        </div>
      </div>

      {/* 5-year total value */}
      <div className="rounded-xl p-4 mb-6 text-center" style={{ background: C.goldLight, border: `1px solid rgba(184,134,11,0.15)` }}>
        <DollarSign className="w-5 h-5 mx-auto mb-2" style={{ color: C.gold }} />
        <div className="text-2xl font-bold font-mono" style={{ color: C.gold }}>
          CHF {amount + fiveYearInterest}K
        </div>
        <div className="text-xs mt-1" style={{ color: C.textMuted }}>
          Total Note Value at Conversion (5 Yr)
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
          CHF {amount}K principal + CHF {fiveYearInterest}K interest &mdash; plus {equityPercent.toFixed(1)}% equity
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
                <span className="text-xs font-mono w-28 text-right shrink-0" style={{ color: C.textSecondary }}>
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
          <li>1. <strong>Equity:</strong> {equityPercent.toFixed(1)}% ownership stake in AIRBASE (based on CHF 8.5M pre-money valuation)</li>
          <li>2. <strong>Convertible Note:</strong> {INTEREST_RATE}% annual interest accrues on your investment</li>
          <li>3. At the next funding round, the note + accrued interest converts into additional equity at a discount</li>
          <li>4. You benefit from both company ownership and guaranteed interest returns</li>
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
  { year: "2024", value: 11.2 },
  { year: "2025", value: 15.8 },
  { year: "2026", value: 22.1 },
  { year: "2027", value: 30.5 },
  { year: "2028", value: 41.2 },
  { year: "2029", value: 50.0 },
  { year: "2030", value: 58.4 },
];

const revenueProjection = [
  { year: "2026", revenue: 0.12, label: "Pilot ops" },
  { year: "2027", revenue: 0.68, label: "First contracts" },
  { year: "2028", revenue: 2.4, label: "Scale" },
  { year: "2029", revenue: 7.2, label: "Expansion" },
  { year: "2030", revenue: 22.0, label: "Market lead" },
];

const fundAllocation = [
  { name: "Fleet Expansion", value: 35, amount: "525K", color: C.accent },
  { name: "Platform Development", value: 25, amount: "375K", color: "#FF6B6B" },
  { name: "LUC + Legal", value: 20, amount: "300K", color: C.gold },
  { name: "Sales & Marketing", value: 10, amount: "150K", color: C.green },
  { name: "Working Capital", value: 10, amount: "150K", color: C.textMuted },
];

const costCompare = [
  { name: "Traditional Courier", cost: 28, unit: "CHF/hr" },
  { name: "AIRBASE Drone", cost: 4, unit: "CHF/hr" },
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
    <nav className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          aria-label={`Go to slide ${i + 1}`}
          className="w-2.5 h-2.5 rounded-full transition-all duration-300"
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
          className="rounded-2xl p-10 border text-center"
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
            airbase.one &mdash; Confidential &amp; Proprietary
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
  const totalSlides = 15;

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  /* Track which slide is visible */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setCurrentSlide(idx);
          }
        });
      },
      { threshold: 0.5 }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      style={{
        background: C.bg,
        scrollSnapType: "y proximity",
        scrollBehavior: "smooth",
      }}
    >
      <SlideNav current={currentSlide} total={totalSlides} onNavigate={navigateTo} />

      {/* ═══ PERSISTENT AIRBASE HEADER ═══ */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-4"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 70%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      >
        <div className="flex items-center gap-3" style={{ pointerEvents: "auto" }}>
          <img src="/airbase-logo.png" alt="airBASE" className="h-8 w-auto" />
          <span className="hidden md:inline text-xs font-mono tracking-wider ml-2" style={{ color: C.textMuted }}>
            airbase.one
          </span>
        </div>
        <div className="text-xs font-mono tracking-wider" style={{ color: C.textMuted, pointerEvents: "auto" }}>
          Investor Pitch &middot; 2026
        </div>
      </div>

      {/* ═══ SLIDE 1: COVER — BIG VISION ═══ */}
      <section
        ref={setRef(0)}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Hero drone image background — stunning FlyCart mountain photo */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/assets/hero-flycart-mountains.jpg"
            alt="DJI FlyCart 100 drones over Swiss mountains"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-sm font-mono tracking-[0.3em] uppercase mb-8"
            style={{ color: C.accent }}
          >
            Confidential &mdash; For Accredited Investors Only
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
            style={{ color: C.text }}
          >
            We Are Turning the Drone World
            <br />
            in Switzerland &amp; DACH{" "}
            <span style={{ color: C.accent }}>Upside Down</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl font-light mb-10"
            style={{ color: C.textSecondary }}
          >
            15 Years of Drone Expertise &middot; Swiss Precision &middot; Market-Ready
          </motion.p>

          {/* Three Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
            className="grid md:grid-cols-3 gap-6 mb-10"
          >
            {[
              {
                icon: Cpu,
                title: "Online System",
                desc: "AI-powered platform for booking, dispatch & fleet management",
                color: C.accent,
              },
              {
                icon: MapPin,
                title: "Logistics Centers",
                desc: "Regional operations hubs across Switzerland & DACH",
                color: C.gold,
              },
              {
                icon: Globe,
                title: "Franchise Model",
                desc: "Scalable expansion through licensed partners",
                color: C.green,
              },
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.15, duration: 0.5 }}
                className="rounded-2xl p-5 border text-center"
                style={{ background: C.bgCard, borderColor: pillar.color + "30", boxShadow: C.shadow }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: pillar.color + "10" }}
                >
                  <pillar.icon className="w-6 h-6" style={{ color: pillar.color }} />
                </div>
                <div className="text-base font-bold mb-1" style={{ color: C.text }}>
                  {pillar.title}
                </div>
                <div className="text-xs" style={{ color: C.textMuted }}>
                  {pillar.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.6 }}
            className="text-sm font-mono tracking-wider"
            style={{ color: C.textMuted }}
          >
            airbase.one &middot; Seed Round CHF 1.5M &middot; 2026
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
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

      {/* ═══ SLIDE 2: THE PROBLEM ═══ */}
      <section
        ref={setRef(1)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="01" text="The Problem" />

          <Stagger className="space-y-6">
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: C.text }}
            >
              Swiss Logistics Is
              <br />
              <span style={{ color: C.red }}>Stuck in the Past.</span>
            </motion.h2>

            <motion.div variants={fadeIn} className="h-px w-24 mt-4 mb-8" style={{ background: C.red + "60" }} />
          </Stagger>

          {/* ── Swiss Pain Points ── */}
          <Stagger className="space-y-4 mt-12" delay={0.3}>
            {[
              { icon: Mountain, label: "Material Cable Cars", text: "Temporary Materialgondelbahnen still built to haul construction materials to mountain sites — tens of thousands of CHF, weeks to erect.", color: C.red },
              { icon: Wheat, label: "Agriculture", text: "Spraying, seeding & crop monitoring still done by hand across steep terrain. Expensive labor, limited reach, 3× chemical overuse.", color: C.red },
              { icon: MapPin, label: "Hiking Trail Maintenance", text: "Maintained by hand crews or helicopter flights at CHF 2,800–4,500/hr. A single supply run can cost more than the repair itself.", color: C.accent },
              { icon: HardHat, label: "Alpine Construction Supply", text: "Remote building sites depend entirely on helicopter logistics. SAC mountain huts are resupplied exclusively by air — at extreme cost.", color: C.gold },
              { icon: HeartPulse, label: "Emergency & Rescue Logistics", text: "Medical and supply transport in difficult terrain relies on slow ground vehicles or helicopters at CHF 100/min.", color: C.red },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={slideRight}
                className="flex items-start gap-4 p-4 rounded-xl border"
                style={{ borderColor: item.color + "20", background: item.color + "06" }}
              >
                <item.icon className="w-5 h-5 mt-1 shrink-0" style={{ color: item.color }} />
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: C.text }}>{item.label}</div>
                  <span className="text-sm md:text-base" style={{ color: C.textSecondary }}>
                    {item.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </Stagger>

          {/* ── Before / After Contrast ── */}
          <div className="grid md:grid-cols-2 gap-6 mt-14">
            <Stagger delay={0.6}>
              <motion.div
                variants={scaleUp}
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: C.red + "25", background: C.red + "04" }}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.red }}>
                  The Old Way
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Mountain, text: "Temporary cable cars" },
                    { icon: Users, text: "Manual hand crews" },
                    { icon: DollarSign, text: "CHF 3,000+/hr helicopters" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 justify-center">
                      <row.icon className="w-4 h-4" style={{ color: C.red }} />
                      <span className="text-sm" style={{ color: C.textSecondary }}>{row.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-full inline-block" style={{ background: C.red + "10", color: C.red }}>
                  Slow · Expensive · Outdated
                </div>
              </motion.div>
            </Stagger>

            <Stagger delay={0.8}>
              <motion.div
                variants={scaleUp}
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: C.accent + "25", background: C.accentGlow }}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.accent }}>
                  The AIRBASE Way
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Zap, text: "Autonomous drone fleet" },
                    { icon: Cpu, text: "AI-optimized routing" },
                    { icon: TrendingUp, text: "Up to 90% cost reduction" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 justify-center">
                      <row.icon className="w-4 h-4" style={{ color: C.accent }} />
                      <span className="text-sm" style={{ color: C.textSecondary }}>{row.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-full inline-block" style={{ background: C.accentGlow, color: C.accent }}>
                  Fast · Affordable · Scalable
                </div>
              </motion.div>
            </Stagger>
          </div>

          <Stagger delay={1.0}>
            <motion.blockquote
              variants={fadeUp}
              className="mt-16 text-xl md:text-2xl font-light italic text-center max-w-2xl mx-auto"
              style={{ color: C.textSecondary }}
            >
              &ldquo;Switzerland still moves materials the way it did 50 years ago. We&apos;re changing that.&rdquo;
            </motion.blockquote>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 3: THE SOLUTION ═══ */}
      <section
        ref={setRef(2)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="02" text="The Solution" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
              style={{ color: C.text }}
            >
              Four Service Lines.
              <br />
              <span style={{ color: C.accent }}>One Platform.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg md:text-xl" style={{ color: C.textMuted }}>
              AI-powered drone services — from cargo transport to precision agriculture — all Swiss-certified, all autonomous.
            </motion.p>
          </Stagger>

          {/* Four service lines with website images */}
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8" delay={0.2}>
            {[
              {
                title: "Transport Flights",
                sub: "Cargo & Logistics",
                desc: "Up to 100 kg payload with DJI FlyCart 100. Hospitals, retailers, construction sites.",
                image: "/images/flycart-scene-2.webp",
                icon: Truck,
                stat: "CHF 4/flight",
              },
              {
                title: "Cleaning",
                sub: "Cleaning & Facades",
                desc: "Industrial building and facade cleaning. Solar panel maintenance at scale.",
                image: "/images/flycart-ingenieurverkehr.webp",
                icon: Sparkles,
                stat: "80% faster",
              },
              {
                title: "Agriculture",
                sub: "Precision Agriculture",
                desc: "Targeted spraying, seeding, and crop monitoring. Reduces chemical use by 60%.",
                image: "/images/flycart-lastendrohne.webp",
                icon: Wheat,
                stat: "60% less chemicals",
              },
              {
                title: "Special Missions",
                sub: "Inspection & Rescue",
                desc: "Thermal imaging, infrastructure inspection, emergency medical transport.",
                image: "/images/flycart-notfalltransport.webp",
                icon: Eye,
                stat: "24/7 ready",
              },
            ].map((service) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                className="rounded-2xl overflow-hidden border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <service.icon className="w-4 h-4" style={{ color: C.accent }} />
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: C.accent }}>
                      {service.sub}
                    </span>
                  </div>
                  <div className="text-base font-bold mb-1" style={{ color: C.text }}>{service.title}</div>
                  <p className="text-xs mb-3" style={{ color: C.textSecondary }}>{service.desc}</p>
                  <div className="text-sm font-bold font-mono" style={{ color: C.accent }}>{service.stat}</div>
                </div>
              </motion.div>
            ))}
          </Stagger>

          {/* Key platform stats */}
          <Stagger className="grid md:grid-cols-4 gap-6 mt-8" delay={0.4}>
            {[
              { value: "4", label: "service lines", sub: "fully integrated" },
              { value: "100 kg", label: "max payload", sub: "DJI FlyCart 100" },
              { value: "-85%", label: "cost vs traditional", sub: "at scale" },
              { value: "<30 min", label: "deployment time", sub: "any service" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-2xl p-5 border text-center"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="text-3xl md:text-4xl font-bold font-mono" style={{ color: C.accent }}>
                  {stat.value}
                </div>
                <div className="text-sm mt-2" style={{ color: C.textSecondary }}>
                  {stat.label}
                </div>
                <div className="text-xs mt-1" style={{ color: C.textMuted }}>
                  {stat.sub}
                </div>
              </motion.div>
            ))}
          </Stagger>

          {/* Flow diagram */}
          <Stagger delay={0.6}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-6" style={{ color: C.textMuted }}>
                How It Works
              </div>
              <div className="grid grid-cols-5 gap-2 md:gap-4">
                {[
                  { step: "Order", desc: "Customer App", icon: Users },
                  { step: "Dispatch", desc: "AI Routes", icon: Cpu },
                  { step: "Fly", desc: "Pilot + Drone", icon: Rocket },
                  { step: "Deliver", desc: "Touchdown", icon: MapPin },
                  { step: "Confirm", desc: "Customer OK", icon: CheckCircle2 },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp} className="text-center relative">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl mx-auto flex items-center justify-center mb-2"
                      style={{ background: C.accentGlow }}
                    >
                      <s.icon className="w-5 h-5" style={{ color: C.accent }} />
                    </div>
                    <div className="text-xs font-bold" style={{ color: C.text }}>{s.step}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{s.desc}</div>
                    {i < 4 && (
                      <ArrowRight className="absolute top-4 -right-2 md:-right-3 w-3 h-3" style={{ color: C.accent + "60" }} />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* YouTube Video + FlyCart Showcase */}
          <Stagger className="mt-8 grid md:grid-cols-2 gap-6" delay={0.8}>
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
                  The DJI FlyCart 100 in action — see the drone that powers our logistics network.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl overflow-hidden border flex flex-col items-center justify-center p-8 relative"
              style={{ background: `linear-gradient(135deg, ${C.bgAlt} 0%, ${C.accentLight} 100%)`, borderColor: C.border, boxShadow: C.shadow }}
            >
              <motion.img
                src="/assets/flycart-100-cutout.png"
                alt="DJI FlyCart 100 drone"
                className="w-48 md:w-64 h-auto object-contain mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: C.accent }}>
                Our Workhorse
              </div>
              <div className="text-xl font-bold" style={{ color: C.text }}>DJI FlyCart 100</div>
              <div className="text-sm mt-1" style={{ color: C.textMuted }}>100 kg payload · 16 km range · IP55</div>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 4: TECHNOLOGY PLATFORM ═══ */}
      <section
        ref={setRef(3)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="03" text="Technology" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              The Operating System for{" "}
              <span style={{ color: C.accent }}>Drone Services</span>
            </motion.h2>
          </Stagger>

          {/* Three pillars */}
          <Stagger className="grid md:grid-cols-3 gap-6 mt-10" delay={0.2}>
            {[
              { title: "Customer Portal", icon: Users, items: ["Order intake & tracking", "Real-time notifications", "Delivery confirmation"] },
              { title: "Admin Dashboard", icon: BarChart3, items: ["Dispatch & fleet mgmt", "Compliance reporting", "Cost analytics"] },
              { title: "Pilot App", icon: Rocket, items: ["Mission briefing", "Live telemetry", "Incident logging"] },
            ].map((pillar) => (
              <motion.div
                key={pillar.title}
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: C.accentGlow }}>
                  <pillar.icon className="w-5 h-5" style={{ color: C.accent }} />
                </div>
                <div className="text-lg font-bold mb-3" style={{ color: C.text }}>{pillar.title}</div>
                <ul className="space-y-2">
                  {pillar.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                      <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: C.accent }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </Stagger>

          {/* Dashboard Screenshot — Hero Size */}
          <Stagger delay={0.4}>
            <motion.div
              variants={scaleUp}
              className="mt-10 rounded-2xl overflow-hidden border-2"
              style={{ borderColor: C.accent + "30", boxShadow: `0 8px 40px rgba(211,47,47,0.12), ${C.shadowLg}` }}
            >
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #B71C1C 100%)` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-white/80">
                  Live Operations Dashboard — Real Product
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-mono text-white/60">LIVE</span>
                </div>
              </div>
              <img
                src="/images/investors/dashboard.png"
                alt="AIRBASE Live Operations Dashboard with Swiss map, active missions, and real-time telemetry"
                className="w-full"
              />
            </motion.div>
          </Stagger>

          {/* AI Layer */}
          <Stagger delay={0.6}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.accentLight, borderColor: C.borderAccent }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-5 h-5" style={{ color: C.accent }} />
                <span className="text-sm font-mono uppercase tracking-wider" style={{ color: C.accent }}>AI Layer</span>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                {["Autonomous quote generation", "Intelligent dispatch routing", "Safety redundancy (auto-abort)", "Post-flight analytics"].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                    <Zap className="w-3 h-3 shrink-0" style={{ color: C.accent }} />
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          <Stagger delay={0.7}>
            <motion.div variants={fadeUp} className="mt-6 text-xs font-mono" style={{ color: C.textMuted }}>
              Tech stack: Next.js / Node.js / Real-time telemetry / EASA-compliant data logging
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 5: MARKET OPPORTUNITY ═══ */}
      <section
        ref={setRef(4)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="04" text="Market Opportunity" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-4"
              style={{ color: C.text }}
            >
              A CHF 4 Billion Market{" "}
              <span style={{ color: C.accent }}>Across Four Verticals</span>
            </motion.h2>
          </Stagger>

          <div className="grid lg:grid-cols-3 gap-6 mt-10">
            <KpiCard
              label="Global Drone Services TAM"
              value={<CountUp end={31.7} prefix="$" suffix="B" decimals={1} />}
              sub="by 2030 (MarketsandMarkets)"
              icon={Globe}
              delay={0.2}
            />
            <KpiCard
              label="European UAM"
              value={<CountUp end={4.5} prefix="EUR " suffix="B" decimals={1} />}
              sub="by 2030 (Roland Berger)"
              icon={Target}
              delay={0.35}
            />
            <KpiCard
              label="Switzerland SAM"
              value={<CountUp end={420} prefix="CHF " suffix="M" decimals={0} />}
              sub="8.7M pop × addressable"
              icon={TrendingUp}
              delay={0.5}
            />
          </div>

          {/* Service-specific market breakdown */}
          <Stagger className="grid md:grid-cols-4 gap-4 mt-8" delay={0.3}>
            {[
              { service: "Transport", tam: "CHF 180M", icon: Truck, desc: "Logistics, medical, construction supply" },
              { service: "Cleaning", tam: "CHF 95M", icon: Sparkles, desc: "Solar, facade, industrial cleaning" },
              { service: "Agriculture", tam: "CHF 85M", icon: Wheat, desc: "Spraying, seeding, monitoring" },
              { service: "Special Missions", tam: "CHF 60M", icon: Eye, desc: "Thermal, rescue, inspection" },
            ].map((s) => (
              <motion.div
                key={s.service}
                variants={fadeUp}
                className="rounded-xl p-4 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4" style={{ color: C.accent }} />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: C.accent }}>
                    {s.service}
                  </span>
                </div>
                <div className="text-xl font-bold font-mono" style={{ color: C.text }}>{s.tam}</div>
                <div className="text-xs mt-1" style={{ color: C.textMuted }}>{s.desc}</div>
              </motion.div>
            ))}
          </Stagger>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* TAM Growth Chart */}
            <Stagger delay={0.4}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>
                  Global Drone Logistics Market ($B)
                </div>
                <ResponsiveContainer width="100%" height={260}>
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
              </motion.div>
            </Stagger>

            {/* Regulatory tailwind */}
            <Stagger delay={0.6}>
              <motion.div variants={fadeUp} className="space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>
                  Regulatory Tailwind
                </div>
                <ul className="space-y-4">
                  <Bullet delay={0}>EASA U-Space framework fully operative in CH by 2025 (BAZL/FOCA)</Bullet>
                  <Bullet delay={0.1}>SORA risk-based approvals replace blanket bans — first-mover window is NOW</Bullet>
                  <Bullet delay={0.2}>Switzerland among 3 EU-adjacent countries with LUC pathway legislated</Bullet>
                  <Bullet delay={0.3}>Highest labor costs in Europe = highest drone ROI</Bullet>
                </ul>
                <motion.div
                  variants={fadeUp}
                  className="mt-8 p-4 rounded-xl border"
                  style={{ borderColor: C.gold + "20", background: C.goldLight }}
                >
                  <div className="text-sm font-semibold" style={{ color: C.gold }}>
                    Year-5 Realistic Capture (SOM)
                  </div>
                  <div className="text-2xl font-bold font-mono mt-1" style={{ color: C.gold }}>
                    CHF 22M ARR
                  </div>
                </motion.div>
              </motion.div>
            </Stagger>
          </div>

          {/* ── New Market Creation Section ── */}
          <Stagger delay={0.8}>
            <motion.div
              variants={fadeUp}
              className="mt-16 rounded-2xl p-8 border"
              style={{
                borderColor: C.gold + "20",
                background: `linear-gradient(135deg, ${C.goldLight} 0%, ${C.accentLight} 100%)`,
                boxShadow: C.shadow,
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: C.gold + "15" }}
                >
                  <Rocket className="w-5 h-5" style={{ color: C.gold }} />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: C.gold }}>
                    Beyond Disruption
                  </div>
                  <div className="text-lg md:text-xl font-bold" style={{ color: C.text }}>
                    We Don&apos;t Just Compete &mdash; We Create New Markets
                  </div>
                </div>
              </div>

              <div className="text-sm md:text-base leading-relaxed mb-8" style={{ color: C.textSecondary }}>
                Logistics, agriculture, and industrial cleaning are existing markets where AIRBASE
                offers a radically better solution. But our 100&nbsp;kg heavy-lift capability
                <span style={{ color: C.gold, fontWeight: 600 }}> unlocks use cases that were previously impossible</span> &mdash;
                creating entirely new revenue pools.
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: HardHat,
                    title: "Remote Construction Supply",
                    desc: "Deliver materials to alpine or off-grid build sites with zero road infrastructure",
                  },
                  {
                    icon: HeartPulse,
                    title: "Emergency Disaster Relief",
                    desc: "Deploy 100 kg medical & survival payloads to flood, avalanche, or earthquake zones in minutes",
                  },
                  {
                    icon: Mountain,
                    title: "Alpine Infrastructure",
                    desc: "Service ski lifts, telecom towers, and mountain huts unreachable by ground transport",
                  },
                  {
                    icon: Truck,
                    title: "Rural Medical Delivery",
                    desc: "Rapid equipment & supply delivery to hospitals and clinics in underserved areas",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    className="rounded-xl p-4 border"
                    style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
                  >
                    <item.icon className="w-5 h-5 mb-3" style={{ color: C.accent }} />
                    <div className="text-sm font-semibold mb-1" style={{ color: C.text }}>
                      {item.title}
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
                      {item.desc}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t" style={{ borderColor: C.border }}>
                <div className="text-sm font-semibold" style={{ color: C.gold }}>
                  Category creators capture disproportionate value.
                </div>
                <div className="text-xs mt-1" style={{ color: C.textMuted }}>
                  AIRBASE is not entering existing markets &mdash; we are defining the heavy-lift drone logistics
                  category.
                </div>
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 6: BUSINESS MODEL ═══ */}
      <section
        ref={setRef(5)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="05" text="Business Model" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Three Revenue Streams.{" "}
              <span style={{ color: C.accent }}>One Platform.</span>
            </motion.h2>
          </Stagger>

          {/* Three revenue streams */}
          <Stagger className="grid md:grid-cols-3 gap-6 mt-12" delay={0.3}>
            {[
              {
                title: "Drone-as-a-Service",
                sub: "DaaS — 4 Service Lines",
                desc: "Transport, Cleaning, Agriculture, Special Missions — B2B contracts across all verticals.",
                metric: "~65% gross margin",
                revenue: "Per-flight fee + SLA retainer",
                icon: Rocket,
                color: C.accent,
              },
              {
                title: "Platform SaaS",
                sub: "Software",
                desc: "Licensing AIRBASE software stack to third-party operators — all 4 service modules included.",
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: stream.color + "10" }}>
                  <stream.icon className="w-5 h-5" style={{ color: stream.color }} />
                </div>
                <div className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: stream.color }}>
                  {stream.sub}
                </div>
                <div className="text-lg font-bold mb-2" style={{ color: C.text }}>
                  {stream.title}
                </div>
                <p className="text-sm mb-4" style={{ color: C.textSecondary }}>
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
              <div className="flex justify-center gap-12">
                {[
                  { label: "DaaS", pct: "55%", color: C.accent },
                  { label: "SaaS", pct: "25%", color: C.gold },
                  { label: "Franchise", pct: "20%", color: C.green },
                ].map((mix) => (
                  <div key={mix.label}>
                    <div className="text-3xl font-bold font-mono" style={{ color: mix.color }}>{mix.pct}</div>
                    <div className="text-xs mt-1" style={{ color: C.textMuted }}>{mix.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* DaaS service line breakdown */}
          <Stagger delay={0.8}>
            <motion.div
              variants={fadeUp}
              className="mt-6 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.accent }}>
                DaaS Revenue by Service Line (Year 3 Target)
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { service: "Transport", pct: "45%", icon: Truck },
                  { service: "Cleaning", pct: "20%", icon: Sparkles },
                  { service: "Agriculture", pct: "20%", icon: Wheat },
                  { service: "Special", pct: "15%", icon: Eye },
                ].map((s) => (
                  <div key={s.service} className="text-center">
                    <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: C.accent }} />
                    <div className="text-xl font-bold font-mono" style={{ color: C.text }}>{s.pct}</div>
                    <div className="text-xs mt-1" style={{ color: C.textMuted }}>{s.service}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 6B: AI-POWERED LEAN OPERATIONS ═══ */}
      <section
        ref={setRef(6)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Subtle tech background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(211,47,47,0.03) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto w-full">
          <SlideLabel number="06" text="AI-Powered Operations" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Almost Everything Is{" "}
              <span style={{ color: C.accent }}>Automated</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg mt-4 mb-6 max-w-3xl"
              style={{ color: C.textSecondary }}
            >
              AIRBASE needs minimal human staff. AI handles calculations, dispatch, safety checks,
              quoting, compliance, and post-flight analytics — giving us an enormous cost and
              scalability advantage over traditional logistics.
            </motion.p>
          </Stagger>

          {/* Headcount comparison */}
          <Stagger className="grid md:grid-cols-2 gap-8 mt-8" delay={0.2}>
            {/* Traditional */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-8 border"
              style={{ background: C.bgAlt, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6" style={{ color: C.textMuted }} />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.textMuted }}>
                  Traditional Courier
                </span>
              </div>
              <div className="text-5xl font-bold font-mono mb-2" style={{ color: C.textMuted }}>
                ~50
              </div>
              <div className="text-sm mb-6" style={{ color: C.textMuted }}>
                Employees needed for 100 daily deliveries
              </div>
              <ul className="space-y-2">
                {["30+ drivers", "5 dispatchers", "4 warehouse staff", "3 customer service", "3 management", "5+ admin & compliance"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: C.textMuted }}>
                    <Users className="w-3 h-3 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* AIRBASE */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-8 border-2 relative"
              style={{ background: C.bgCard, borderColor: C.accent + "30", boxShadow: `0 4px 24px rgba(211,47,47,0.08)` }}
            >
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-mono font-bold text-white"
                style={{ background: C.accent }}>
                95% LESS STAFF
              </div>
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="w-6 h-6" style={{ color: C.accent }} />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.accent }}>
                  AIRBASE (AI-Powered)
                </span>
              </div>
              <div className="text-5xl font-bold font-mono mb-2" style={{ color: C.accent }}>
                ~3
              </div>
              <div className="text-sm mb-6" style={{ color: C.textSecondary }}>
                Core team for 100+ daily deliveries
              </div>
              <ul className="space-y-2">
                {[
                  { text: "Licensed drone pilots (per-shift)", icon: Rocket },
                  { text: "1 Safety Manager / Operations Lead", icon: Shield },
                  { text: "AI: dispatch, routing, quoting, compliance", icon: Cpu },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                    <item.icon className="w-3 h-3 shrink-0" style={{ color: C.accent }} />
                    {item.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </Stagger>

          {/* What AI automates */}
          <Stagger delay={0.5}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.accentLight, borderColor: C.borderAccent }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5" style={{ color: C.accent }} />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.accent }}>
                  What Our AI Automates
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: "Operations", items: ["Intelligent dispatch & routing", "Real-time fleet management", "Automated mission planning"] },
                  { title: "Business", items: ["Instant quote generation", "Invoice & billing automation", "Customer notifications"] },
                  { title: "Compliance", items: ["SORA risk assessment", "Airspace deconfliction", "Post-flight safety analytics"] },
                ].map((col) => (
                  <div key={col.title}>
                    <div className="text-xs font-mono uppercase tracking-wider mb-2 font-semibold" style={{ color: C.accent }}>
                      {col.title}
                    </div>
                    <ul className="space-y-1.5">
                      {col.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                          <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: C.accent }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* Investor punchline */}
          <Stagger delay={0.7}>
            <motion.div
              variants={fadeUp}
              className="mt-8 grid md:grid-cols-3 gap-6"
            >
              {[
                { metric: "~95%", label: "Lower headcount vs. traditional logistics", icon: Users },
                { metric: "10x", label: "Deliveries per employee", icon: TrendingUp },
                { metric: "Linear", label: "Revenue scales, headcount doesn't", icon: Rocket },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl p-5 border text-center"
                  style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
                >
                  <kpi.icon className="w-5 h-5 mx-auto mb-2" style={{ color: C.accent }} />
                  <div className="text-2xl font-bold font-mono" style={{ color: C.accent }}>{kpi.metric}</div>
                  <div className="text-xs mt-1" style={{ color: C.textMuted }}>{kpi.label}</div>
                </div>
              ))}
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 7: COMPETITIVE ADVANTAGE ═══ */}
      <section
        ref={setRef(7)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 overflow-hidden"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Background drone image */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/images/flycart-scene-1.jpg"
            alt=""
            className="w-full h-full object-cover opacity-[0.04]"
          />
        </div>

        <div className="relative max-w-5xl mx-auto w-full">
          <SlideLabel number="07" text="Competitive Advantage" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Our Moat Is{" "}
              <span style={{ color: C.gold }}>Certified, Not Just Claimed</span>
            </motion.h2>
          </Stagger>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {/* LUC */}
            <Stagger delay={0.2}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ borderColor: C.gold + "20", background: C.goldLight, boxShadow: C.shadow }}
              >
                <Lock className="w-8 h-8 mb-4" style={{ color: C.gold }} />
                <div className="text-sm font-mono uppercase tracking-wider mb-2" style={{ color: C.gold }}>
                  LUC Certification — In Progress
                </div>
                <ul className="space-y-2">
                  {[
                    "Actively pursuing LUC — SORA / BAZL applications filed",
                    "Will enable flights in populated areas without per-flight approval",
                    "Fewer than 12 operators pursuing LUC in Switzerland",
                    "18-24 months minimum for competitors starting today",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.textSecondary }}>
                      <Shield className="w-3 h-3 mt-1 shrink-0" style={{ color: C.gold }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>

            {/* FlyCart 100 */}
            <Stagger delay={0.4}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border relative overflow-hidden"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <img
                  src="/assets/flycart-100-cutout.png"
                  alt="DJI FlyCart 100"
                  className="absolute -right-6 -top-2 w-28 h-28 object-contain opacity-15 pointer-events-none"
                />
                <Box className="w-8 h-8 mb-4 relative z-10" style={{ color: C.accent }} />
                <div className="text-sm font-mono uppercase tracking-wider mb-2 relative z-10" style={{ color: C.accent }}>
                  DJI FlyCart 100
                </div>
                <ul className="space-y-2">
                  {[
                    "100 kg payload — largest commercial delivery drone",
                    "IP55 rated: rain, wind up to 12 m/s",
                    "16 km range, locked via DJI enterprise partnership",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.textSecondary }}>
                      <CheckCircle2 className="w-3 h-3 mt-1 shrink-0" style={{ color: C.accent }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>

            {/* AI Safety */}
            <Stagger delay={0.6}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.greenLight, borderColor: C.green + "20", boxShadow: C.shadow }}
              >
                <Cpu className="w-8 h-8 mb-4" style={{ color: C.green }} />
                <div className="text-sm font-mono uppercase tracking-wider mb-2" style={{ color: C.green }}>
                  AI Safety System
                </div>
                <ul className="space-y-2">
                  {[
                    "Proprietary auto-abort on geofence, weather, or battery",
                    "Lower insurance premiums = structural cost advantage",
                    "Data flywheel: every flight improves routing & safety",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.textSecondary }}>
                      <Zap className="w-3 h-3 mt-1 shrink-0" style={{ color: C.green }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>
          </div>

          {/* Strategic Partnership */}
          <Stagger delay={0.8}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="w-5 h-5" style={{ color: C.accent }} />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.accent }}>
                  Strategic Partnership
                </span>
              </div>
              <div className="text-lg font-bold mb-2" style={{ color: C.text }}>
                Loft Dynamics — World-Leading Flight Simulator Company
              </div>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                Partnership with Loft Dynamics gives AIRBASE access to world-class flight simulation training infrastructure — a strong signal for investors and a competitive edge in pilot proficiency and safety certification.
              </p>
            </motion.div>
          </Stagger>

          <Stagger delay={1.0}>
            <motion.blockquote
              variants={fadeUp}
              className="mt-10 text-xl md:text-2xl font-light italic text-center"
              style={{ color: C.textSecondary }}
            >
              &ldquo;We are not selling drones. We are selling{" "}
              <span className="font-semibold not-italic" style={{ color: C.gold }}>
                permission to fly
              </span>
              .&rdquo;
            </motion.blockquote>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 8: SUSTAINABILITY / ZERO EMISSIONS ═══ */}
      <section
        ref={setRef(8)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 overflow-hidden"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        {/* Green gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(22,163,74,0.04) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto w-full">
          <SlideLabel number="08" text="Sustainability" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Near-Zero Carbon Logistics.{" "}
              <span style={{ color: C.green }}>Green by Design.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg mt-4 mb-6 max-w-3xl"
              style={{ color: C.textSecondary }}
            >
              AIRBASE doesn&apos;t just reduce costs &mdash; we eliminate emissions. Our drones are 100% electric,
              and our fleet vehicles run on solar power. The result: a near-zero carbon logistics operation
              that sets a new industry standard.
            </motion.p>
          </Stagger>

          {/* CO2 comparison — visual impact */}
          <Stagger className="grid md:grid-cols-2 gap-8 mt-8" delay={0.2}>
            {/* Traditional */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-8 border"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6" style={{ color: C.textMuted }} />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.textMuted }}>
                  Traditional Diesel Courier
                </span>
              </div>
              <div className="text-5xl font-bold font-mono mb-2" style={{ color: C.red }}>
                ~210g
              </div>
              <div className="text-sm mb-4" style={{ color: C.textMuted }}>
                CO&#8322; per km (diesel van, avg.)
              </div>
              <div className="space-y-3">
                {[
                  { label: "Fuel", detail: "Diesel — direct CO\u2082 emissions", pct: 70 },
                  { label: "Fleet maintenance", detail: "Oil, parts, disposal", pct: 15 },
                  { label: "Infrastructure", detail: "Depots, roads, parking", pct: 15 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: C.textSecondary }}>{item.label}</span>
                      <span style={{ color: C.textMuted }}>{item.detail}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: C.red + "60" }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AIRBASE */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-8 border-2 relative"
              style={{ background: C.greenLight, borderColor: C.green + "30", boxShadow: `0 4px 24px rgba(22,163,74,0.08)` }}
            >
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-mono font-bold text-white"
                style={{ background: C.green }}>
                NEAR-ZERO EMISSIONS
              </div>
              <div className="flex items-center gap-3 mb-6">
                <Leaf className="w-6 h-6" style={{ color: C.green }} />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.green }}>
                  AIRBASE (Electric + Solar)
                </span>
              </div>
              <div className="text-5xl font-bold font-mono mb-2" style={{ color: C.green }}>
                ~0g
              </div>
              <div className="text-sm mb-4" style={{ color: C.textSecondary }}>
                CO&#8322; per delivery (direct emissions)
              </div>
              <div className="space-y-3">
                {[
                  { icon: Battery, text: "Electric drones — zero direct emissions per flight", color: C.green },
                  { icon: Sun, text: "Solar-powered fleet vehicles — renewable ground ops", color: C.gold },
                  { icon: Leaf, text: "No fuel, no exhaust, no noise pollution", color: C.green },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm" style={{ color: C.textSecondary }}>
                    <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                    {item.text}
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* ESG key metrics */}
          <Stagger className="grid md:grid-cols-4 gap-4 mt-8" delay={0.5}>
            {[
              { value: "0g", label: "Direct CO\u2082 per flight", sub: "100% electric drones", icon: Battery, color: C.green },
              { value: "100%", label: "Solar fleet vehicles", sub: "Renewable ground ops", icon: Sun, color: C.gold },
              { value: "~95%", label: "Less CO\u2082 vs diesel courier", sub: "Full lifecycle comparison", icon: Leaf, color: C.green },
              { value: "Zero", label: "Noise pollution", sub: "Quiet urban operations", icon: Sparkles, color: C.accent },
            ].map((kpi) => (
              <motion.div
                key={kpi.label}
                variants={fadeUp}
                className="rounded-xl p-5 border text-center"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <kpi.icon className="w-5 h-5 mx-auto mb-2" style={{ color: kpi.color }} />
                <div className="text-2xl font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-xs mt-1 font-semibold" style={{ color: C.textSecondary }}>{kpi.label}</div>
                <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{kpi.sub}</div>
              </motion.div>
            ))}
          </Stagger>

          {/* The full green story */}
          <Stagger delay={0.7}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.greenLight, borderColor: C.green + "20" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="w-5 h-5" style={{ color: C.green }} />
                <span className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: C.green }}>
                  The Full Green Story
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Electric Drones",
                    desc: "The DJI FlyCart 100 runs on battery power — zero combustion, zero direct CO\u2082 emissions per flight. Charging from renewable grid sources reduces even indirect footprint.",
                    icon: Battery,
                  },
                  {
                    title: "Solar Fleet Vehicles",
                    desc: "Our ground support and logistics vehicles are solar-powered — from transport to the launch pad to equipment hauling. The entire operational chain is renewable.",
                    icon: Sun,
                  },
                  {
                    title: "ESG Investor Appeal",
                    desc: "Near-zero carbon logistics is a powerful ESG differentiator. Institutional investors increasingly require quantifiable sustainability metrics — AIRBASE delivers them.",
                    icon: TrendingUp,
                  },
                ].map((col) => (
                  <div key={col.title}>
                    <col.icon className="w-5 h-5 mb-2" style={{ color: C.green }} />
                    <div className="text-sm font-semibold mb-1" style={{ color: C.text }}>{col.title}</div>
                    <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{col.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>

          {/* Punchline */}
          <Stagger delay={0.9}>
            <motion.blockquote
              variants={fadeUp}
              className="mt-10 text-xl md:text-2xl font-light italic text-center"
              style={{ color: C.textSecondary }}
            >
              &ldquo;Electric drones + solar-powered fleet ={" "}
              <span className="font-semibold not-italic" style={{ color: C.green }}>
                near-zero carbon logistics
              </span>
              . The future of delivery is green.&rdquo;
            </motion.blockquote>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 9: COMPETITIVE LANDSCAPE ═══ */}
      <section
        ref={setRef(9)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="09" text="Competitive Landscape" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              The Heavy-Lift Niche Is{" "}
              <span style={{ color: C.accent }}>Wide Open</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg mt-4 mb-12 max-w-2xl"
              style={{ color: C.textSecondary }}
            >
              Swiss drone operators are certified — but none serve the 100 kg heavy-cargo B2B segment.
              AIRBASE is the first mover in an uncontested niche.
            </motion.p>
          </Stagger>

          {/* ── Comparison Matrix ── */}
          <Stagger delay={0.2}>
            <motion.div
              variants={fadeUp}
              className="overflow-x-auto rounded-2xl border"
              style={{ borderColor: C.border, boxShadow: C.shadowLg }}
            >
              <table className="w-full text-sm" style={{ background: C.bgCard }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["", "Matternet", "SwissDrones", "Others", "AIRBASE"].map((h, i) => (
                      <th
                        key={i}
                        className={`px-4 py-4 text-left font-mono uppercase tracking-wider text-xs ${i === 4 ? "rounded-tr-2xl" : ""} ${i === 0 ? "rounded-tl-2xl" : ""}`}
                        style={{
                          color: i === 4 ? C.bg : C.textMuted,
                          background: i === 4 ? C.accent : "transparent",
                          minWidth: i === 0 ? 140 : 150,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "LUC Status",
                      vals: [
                        "✅ BAZL LUC (Sep 2024)",
                        "✅ EASA LUC via Malta (2022)",
                        "❌ No LUC",
                        "🔄 In Progress (BAZL)",
                      ],
                    },
                    {
                      label: "Payload",
                      vals: [
                        "~2 kg",
                        ">50 kg (SDO50 V2)",
                        "5–25 kg",
                        "100 kg (FlyCart 100)",
                      ],
                    },
                    {
                      label: "Service Model",
                      vals: [
                        "Captive fleet ops",
                        "Custom helicopter sales",
                        "Project-based",
                        "B2B Franchise (DaaS)",
                      ],
                    },
                    {
                      label: "Focus",
                      vals: [
                        "Medical lab samples",
                        "Inspection & SAR",
                        "Survey / Logistics",
                        "Heavy cargo delivery",
                      ],
                    },
                    {
                      label: "Scalability",
                      vals: [
                        "Hospital networks only",
                        "Custom builds — slow",
                        "Per-project",
                        "Franchise replication",
                      ],
                    },
                    {
                      label: "AI Platform",
                      vals: ["No", "No", "Limited", "✅ Full AI dashboard"],
                    },
                  ].map((row, ri) => (
                    <tr
                      key={ri}
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: ri % 2 === 0 ? "transparent" : C.bgAlt,
                      }}
                    >
                      <td
                        className="px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                        style={{ color: C.textMuted }}
                      >
                        {row.label}
                      </td>
                      {row.vals.map((v, vi) => (
                        <td
                          key={vi}
                          className="px-4 py-3"
                          style={{
                            color: vi === 3 ? C.accent : C.textSecondary,
                            fontWeight: vi === 3 ? 600 : 400,
                            background: vi === 3 ? C.accentLight : "transparent",
                          }}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </Stagger>

          {/* ── Positioning Punchline ── */}
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {[
              {
                icon: Package,
                color: C.textMuted,
                label: "Matternet",
                desc: "Light medical cargo — few kg",
              },
              {
                icon: Eye,
                color: C.textMuted,
                label: "SwissDrones",
                desc: "Custom helicopters for inspection",
              },
              {
                icon: Truck,
                color: C.accent,
                label: "AIRBASE",
                desc: "100 kg heavy-lift B2B franchise with AI",
              },
            ].map((item, i) => (
              <Stagger key={i} delay={0.4 + i * 0.15}>
                <motion.div
                  variants={fadeUp}
                  className="rounded-2xl p-5 border text-center"
                  style={{
                    borderColor: i === 2 ? C.accent : C.border,
                    background: i === 2 ? C.accentLight : C.bgCard,
                    boxShadow: i === 2 ? C.shadowLg : C.shadow,
                  }}
                >
                  <item.icon
                    className="w-7 h-7 mx-auto mb-3"
                    style={{ color: item.color }}
                  />
                  <div
                    className="font-bold text-base mb-1"
                    style={{ color: i === 2 ? C.accent : C.text }}
                  >
                    {item.label}
                  </div>
                  <div className="text-sm" style={{ color: C.textSecondary }}>
                    {item.desc}
                  </div>
                </motion.div>
              </Stagger>
            ))}
          </div>

          <Stagger delay={1.0}>
            <motion.div
              variants={fadeUp}
              className="mt-10 rounded-2xl p-5 border text-center"
              style={{ background: C.accentGlow, borderColor: C.borderAccent }}
            >
              <p className="text-lg md:text-xl font-semibold" style={{ color: C.accent }}>
                The 100 kg heavy-lift B2B franchise niche in Switzerland is completely empty.
              </p>
              <p className="text-sm mt-2" style={{ color: C.textSecondary }}>
                AIRBASE would be the absolute pioneer in heavy-cargo drone services under LUC.
              </p>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 10: TRACTION ═══ */}
      <section
        ref={setRef(10)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="10" text="Traction" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Not Pre-Product.{" "}
              <span style={{ color: C.green }}>Pre-Scale.</span>
            </motion.h2>
          </Stagger>

          {/* Timeline */}
          <Stagger className="mt-12 space-y-4" delay={0.2}>
            {[
              { date: "Q3 2025", text: "Company incorporated (Switzerland)", done: true },
              { date: "Q4 2025", text: "DJI FlyCart 100 fleet acquired", done: true },
              { date: "Q1 2026", text: "AIRBASE platform v1.0 launched (portal + admin + pilot app)", done: true },
              { date: "Q1 2026", text: "SORA / BAZL applications filed", done: true },
              { date: "Q1 2026", text: "8 fully licensed commercial drone pilots operational", done: true },
              { date: "Q2 2026", text: "First commercial pilot flights (internal ops)", done: true },
              { date: "Q3 2026*", text: "LUC certification expected", done: false },
              { date: "Q4 2026*", text: "First DaaS enterprise contracts", done: false },
              { date: "Q1 2027*", text: "Franchise pilot program (2 partners)", done: false },
            ].map((milestone, i) => (
              <motion.div
                key={i}
                variants={slideRight}
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{
                  borderColor: milestone.done ? C.green + "20" : C.border,
                  background: milestone.done ? C.greenLight : C.bgCard,
                  boxShadow: milestone.done ? "none" : C.shadow,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: milestone.done ? C.green : C.textMuted + "30", border: milestone.done ? "none" : `2px dashed ${C.textMuted}40` }}
                />
                <span className="text-xs font-mono w-20 shrink-0" style={{ color: milestone.done ? C.green : C.textMuted }}>
                  {milestone.date}
                </span>
                <span className="text-sm" style={{ color: C.textSecondary }}>
                  {milestone.text}
                </span>
              </motion.div>
            ))}
          </Stagger>

          <Stagger delay={0.7}>
            <motion.div variants={fadeUp} className="mt-8 text-xs" style={{ color: C.textMuted }}>
              * Projected milestones — subject to regulatory timelines
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 11: TEAM ═══ */}
      <section
        ref={setRef(11)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="11" text="Team" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              15 Years of Drone Expertise.{" "}
              <span style={{ color: C.accent }}>Built by AI.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg" style={{ color: C.textMuted }}>
              Lean headcount with enterprise-grade output.
            </motion.p>
          </Stagger>

          {/* 8 Licensed Pilots — prominent callout */}
          <Stagger delay={0.2}>
            <motion.div
              variants={fadeUp}
              className="mt-10 rounded-2xl p-6 border flex items-center gap-6"
              style={{ background: C.greenLight, borderColor: C.green + "20", boxShadow: C.shadow }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: C.green + "15" }}
              >
                <Shield className="w-7 h-7" style={{ color: C.green }} />
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold font-mono" style={{ color: C.green }}>
                  8 Licensed Pilots
                </div>
                <div className="text-sm mt-1" style={{ color: C.textSecondary }}>
                  8 fully certified commercial drone pilots ready to operate — trained, licensed, and flight-ready from day one.
                </div>
              </div>
            </motion.div>
          </Stagger>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Founder */}
            <Stagger delay={0.3}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ background: C.accentGlow }}
                >
                  <Users className="w-7 h-7" style={{ color: C.accent }} />
                </div>
                <div className="text-lg font-bold" style={{ color: C.text }}>
                  Founder / CEO
                </div>
                <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: C.accent }}>
                  Vision &middot; Strategy &middot; Regulatory &middot; Operations
                </div>
                <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ background: C.accentGlow, color: C.accent }}>
                  15+ Years in the Drone Business
                </div>
                <p className="text-sm mt-3" style={{ color: C.textSecondary }}>
                  Over 15 years of hands-on experience in the drone industry — from operations and regulatory navigation to building Switzerland&apos;s first AI-powered drone logistics platform. Swiss precision meets Silicon Valley speed.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Drone Operations", "Strategy", "Swiss Market", "BAZL Relations", "15yr Industry Veteran"].map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-md" style={{ background: C.accentGlow, color: C.accent }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Stagger>

            {/* AI Team */}
            <Stagger delay={0.5}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.accentLight, borderColor: C.borderAccent, boxShadow: C.shadow }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ background: C.accentGlow }}
                >
                  <Cpu className="w-7 h-7" style={{ color: C.accent }} />
                </div>
                <div className="text-lg font-bold" style={{ color: C.text }}>
                  AI Operations Team
                </div>
                <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: C.accent }}>
                  Not assistants — operators
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    "CTO / Technology",
                    "CMO / Brand",
                    "Legal / SORA",
                    "Strategy & QA",
                    "Sales & Finance",
                    "Art Direction",
                  ].map((role) => (
                    <div key={role} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                      <Zap className="w-3 h-3 shrink-0" style={{ color: C.accent }} />
                      {role}
                    </div>
                  ))}
                </div>
              </motion.div>
            </Stagger>
          </div>

          <Stagger delay={0.6}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-4 h-4" style={{ color: C.gold }} />
                <span className="text-sm font-mono uppercase tracking-wider" style={{ color: C.gold }}>
                  Advisory / Partners
                </span>
              </div>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                <strong>Loft Dynamics</strong> (world-leading flight simulator company) &middot; DJI Enterprise Channel &middot; Swiss aviation counsel (BAZL regulatory advisor) &middot; EASA compliance network
              </p>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 12: FINANCIAL PROJECTIONS ═══ */}
      <section
        ref={setRef(12)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="12" text="Financial Projections" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Unit Economics{" "}
              <span style={{ color: C.accent }}>That Scale</span>
            </motion.h2>
          </Stagger>

          {/* Unit economics */}
          <Stagger className="grid md:grid-cols-4 gap-4 mt-10" delay={0.2}>
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
                <div className="text-xs font-mono uppercase" style={{ color: C.textMuted }}>{m.label}</div>
                <div className="text-lg font-bold font-mono mt-1" style={{ color: C.text }}>{m.value}</div>
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
                5-Year Revenue Projection (CHF)
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
          <Stagger className="grid md:grid-cols-5 gap-4 mt-6" delay={0.7}>
            {[
              { year: "2026", rev: "120K", note: "Pilot ops" },
              { year: "2027", rev: "680K", note: "First contracts" },
              { year: "2028", rev: "2.4M", note: "DaaS + SaaS" },
              { year: "2029", rev: "7.2M", note: "10 franchise partners" },
              { year: "2030", rev: "22M", note: "Market leadership" },
            ].map((yr) => (
              <motion.div
                key={yr.year}
                variants={fadeUp}
                className="rounded-xl p-3 border text-center"
                style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
              >
                <div className="text-xs font-mono" style={{ color: C.accent }}>{yr.year}</div>
                <div className="text-lg font-bold font-mono" style={{ color: C.text }}>CHF {yr.rev}</div>
                <div className="text-xs" style={{ color: C.textMuted }}>{yr.note}</div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 13: THE ASK + INVESTMENT SLIDER ═══ */}
      <section
        ref={setRef(13)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="13" text="The Ask" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              <span style={{ color: C.accent }}>CHF 1.5M</span>{" "}
              to Own the Swiss Sky
            </motion.h2>
          </Stagger>

          <div className="grid lg:grid-cols-2 gap-12 mt-12">
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
                      <div className="text-3xl font-bold font-mono" style={{ color: C.accent }}>
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

      {/* ═══ SLIDE 14: VISION ═══ */}
      <section
        ref={setRef(14)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 overflow-hidden"
        style={{ scrollSnapAlign: "start", background: C.bgAlt }}
      >
        {/* Background Swiss landscape — FlyCart mountain photo */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/assets/hero-flycart-mountains.jpg"
            alt=""
            className="w-full h-full object-cover opacity-[0.08]"
          />
        </div>

        <div className="relative max-w-5xl mx-auto w-full">
          <SlideLabel number="14" text="Vision" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.text }}
            >
              Switzerland First.{" "}
              <span style={{ color: C.accent }}>Europe Next.</span>
            </motion.h2>
          </Stagger>

          {/* 3-year vision */}
          <Stagger className="space-y-4 mt-12" delay={0.3}>
            {[
              {
                year: "2026",
                text: "Certified and operational. AIRBASE is Switzerland\u2019s most capable drone logistics operator.",
                icon: Shield,
              },
              {
                year: "2027",
                text: "Platform licensed to 10+ operators. AIRBASE becomes infrastructure, not just a service.",
                icon: Layers,
              },
              {
                year: "2028",
                text: "Cross-border expansion. AIRBASE is the EASA-compliant standard for EU drone logistics.",
                icon: Globe,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={slideRight}
                className="flex items-start gap-4 p-5 rounded-xl border"
                style={{ borderColor: C.borderAccent, background: C.accentLight }}
              >
                <item.icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.accent }} />
                <div>
                  <span className="text-sm font-mono font-bold" style={{ color: C.accent }}>{item.year}</span>
                  <span className="text-base md:text-lg leading-relaxed ml-3" style={{ color: C.textSecondary }}>
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
              className="mt-12 rounded-2xl p-8 border text-center"
              style={{
                borderColor: C.gold + "20",
                background: `linear-gradient(135deg, ${C.goldLight} 0%, ${C.accentLight} 100%)`,
                boxShadow: C.shadowLg,
              }}
            >
              <div className="text-xs font-mono uppercase tracking-[0.3em] mb-6" style={{ color: C.gold }}>
                The Sky Is the Limit
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { value: "10+", label: "Operators Licensed" },
                  { value: "5", label: "Countries" },
                  { value: "CHF 22M", label: "ARR Target" },
                  { value: "75%+", label: "Gross Margin" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-2xl md:text-3xl font-bold font-mono" style={{ color: C.text }}>
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
              <p className="text-lg" style={{ color: C.textSecondary }}>
                We are not just competing in existing markets.
                <br />
                We are not just building a drone company.
              </p>
              <p className="text-2xl md:text-4xl font-bold" style={{ color: C.text }}>
                We are <span style={{ color: C.gold }}>creating a new category</span>
                <br />
                and building the operating system
                <br />
                for the <span style={{ color: C.accent }}>drone economy</span>.
              </p>
              <div className="pt-8">
                <div className="text-3xl md:text-5xl font-bold" style={{ color: C.accent }}>
                  The Future Flies with AIRBASE.
                </div>
              </div>
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
