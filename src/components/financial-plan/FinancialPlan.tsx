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
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Lock,
  TrendingUp,
  DollarSign,
  BarChart3,
  Layers,
  Banknote,
  Target,
  Zap,
  Shield,
  Users,
  ChevronDown,
  Calculator,
  PieChart,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Cpu,
  Wrench,
  AlertTriangle,
  Download,
} from "lucide-react";

/* ─── Touch-friendly range slider styles ─── */
const rangeSliderStyles = `
  .fp-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #E30613;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .fp-range::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #E30613;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  @media (max-width: 640px) {
    .fp-range::-webkit-slider-thumb {
      width: 32px;
      height: 32px;
    }
    .fp-range::-moz-range-thumb {
      width: 32px;
      height: 32px;
    }
  }

  @media print {
    .no-print { display: none !important; }
    * { animation: none !important; transition: none !important; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    section { break-inside: avoid; page-break-inside: avoid; }
    table { break-inside: avoid; page-break-inside: avoid; }
    .rounded-2xl { break-inside: avoid; page-break-inside: avoid; }
    @page { size: A4; margin: 1.5cm; }
  }
`;

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

/* ─── Section Header ─── */
function SectionHeader({
  number,
  title,
  subtitle,
  id,
}: {
  number: string;
  title: string;
  subtitle?: string;
  id: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease }}
      className="mb-8 sm:mb-12"
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border"
          style={{ color: C.accent, borderColor: C.borderAccent }}
        >
          {number}
        </span>
      </div>
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
        style={{ color: C.text }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base" style={{ color: C.textMuted }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* ─── Data Card ─── */
function DataCard({
  children,
  className = "",
  delay = 0,
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  highlight?: boolean;
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
      className={`rounded-2xl p-5 sm:p-6 border ${className}`}
      style={{
        background: highlight ? C.accentLight : C.bgCard,
        borderColor: highlight ? C.borderAccent : C.border,
        boxShadow: C.shadow,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color = C.accent,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: React.ElementType;
  color?: string;
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
        <div className="p-2 rounded-lg" style={{ background: color + "14" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span
          className="text-[10px] sm:text-xs font-mono uppercase tracking-wider"
          style={{ color: C.textMuted }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono"
        style={{ color: C.text }}
      >
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

/* ─── Styled Table ─── */
function StyledTable({
  headers,
  rows,
  highlightLast = false,
  delay = 0,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
  highlightLast?: boolean;
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
      className="overflow-x-auto rounded-2xl border"
      style={{ borderColor: C.border, boxShadow: C.shadow }}
    >
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr style={{ background: C.bgAlt }}>
            {headers.map((h, i) => (
              <th
                key={i}
                className={`px-3 sm:px-4 py-3 font-mono uppercase tracking-wider text-[10px] sm:text-xs ${i === 0 ? "text-left" : "text-right"}`}
                style={{ color: C.textMuted, borderBottom: `1px solid ${C.border}` }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isLast = ri === rows.length - 1;
            const isHighlight = highlightLast && isLast;
            return (
              <tr
                key={ri}
                style={{
                  background: isHighlight ? C.accentLight : ri % 2 === 0 ? C.bgCard : C.bgAlt,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 sm:px-4 py-2.5 sm:py-3 ${ci === 0 ? "text-left" : "text-right"} ${isHighlight ? "font-bold" : ""}`}
                    style={{ color: isHighlight ? C.accent : C.text }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}

/* ─── Expandable Section ─── */
function Expandable({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, boxShadow: C.shadow }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors"
        style={{ background: open ? C.accentLight : C.bgCard }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
            <Icon className="w-4 h-4" style={{ color: C.accent }} />
          </div>
          <span className="text-sm sm:text-base font-semibold" style={{ color: C.text }}>
            {title}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5" style={{ color: C.textMuted }} />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease }}
        className="overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-t" style={{ borderColor: C.border }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── ROI Calculator ─── */
function ROICalculator() {
  const [amount, setAmount] = useState(250);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const PRE_MONEY = 8500;
  const INTEREST_RATE = 6;
  const DISCOUNT_RATE = 20;
  const equityPercent = (amount / (PRE_MONEY + amount)) * 100;
  const annualInterest = (amount * INTEREST_RATE) / 100;
  const fiveYearInterest = annualInterest * 6;

  const scenarios = [
    { label: "Conservative", multiple: 5, color: C.textSecondary },
    { label: "Base", multiple: 7, color: C.accent },
    { label: "Optimistic", multiple: 10, color: C.green },
  ];

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
          <Calculator className="w-5 h-5" style={{ color: C.accent }} />
        </div>
        <span
          className="text-sm font-mono uppercase tracking-wider font-semibold"
          style={{ color: C.accent }}
        >
          Investment ROI Calculator
        </span>
      </div>

      <div className="text-center mb-8">
        <div className="text-sm mb-2" style={{ color: C.textMuted }}>
          Your Investment
        </div>
        <div
          className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono"
          style={{ color: C.text }}
        >
          CHF {amount}K
        </div>
      </div>

      <div className="px-2 mb-8">
        <input
          type="range"
          min={50}
          max={1500}
          step={50}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="fp-range w-full h-3 sm:h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${C.accent} 0%, ${C.accent} ${((amount - 50) / 1450) * 100}%, ${C.border} ${((amount - 50) / 1450) * 100}%, ${C.border} 100%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs font-mono" style={{ color: C.textMuted }}>
            CHF 50K
          </span>
          <span className="text-xs font-mono" style={{ color: C.textMuted }}>
            CHF 1,500K
          </span>
        </div>
      </div>

      {/* Equity + Interest summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: C.accentLight,
            border: `1px solid ${C.borderAccent}`,
          }}
        >
          <Layers className="w-5 h-5 mx-auto mb-2" style={{ color: C.accent }} />
          <div
            className="text-lg sm:text-2xl font-bold font-mono"
            style={{ color: C.accent }}
          >
            {equityPercent.toFixed(1)}%
          </div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>
            Indicative Equity
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
            post-money (CHF 8.5M pre-money)
          </div>
        </div>
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: C.greenLight,
            border: `1px solid rgba(22,163,74,0.15)`,
          }}
        >
          <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: C.green }} />
          <div
            className="text-lg sm:text-2xl font-bold font-mono"
            style={{ color: C.green }}
          >
            {INTEREST_RATE}% p.a.
          </div>
          <div className="text-xs mt-1" style={{ color: C.textMuted }}>
            Note Interest
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
            CHF {annualInterest}K / year
          </div>
        </div>
      </div>

      {/* Scenario returns table */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: C.bgAlt, border: `1px solid ${C.border}` }}
      >
        <div
          className="text-xs font-mono uppercase tracking-wider mb-3"
          style={{ color: C.textMuted }}
        >
          Exit Scenarios (Year 6-8)
        </div>
        <div className="space-y-3">
          {scenarios.map((s) => {
            const totalNote = amount + fiveYearInterest;
            const effectivePrice = 1 - DISCOUNT_RATE / 100;
            const effectiveEquity = totalNote / effectivePrice / (PRE_MONEY + amount);
            const exitValue = s.multiple * 22000;
            const investorReturn = effectiveEquity * exitValue;
            const roi = investorReturn / amount;

            return (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-xs sm:text-sm" style={{ color: C.textSecondary }}>
                    {s.label} ({s.multiple}x ARR)
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className="text-sm sm:text-base font-bold font-mono"
                    style={{ color: s.color }}
                  >
                    CHF {Math.round(investorReturn)}K
                  </span>
                  <span
                    className="text-xs ml-2 font-mono"
                    style={{ color: C.textMuted }}
                  >
                    ({roi.toFixed(1)}x)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div
        className="rounded-xl p-4"
        style={{
          background: C.accentLight,
          border: `1px solid ${C.borderAccent}`,
        }}
      >
        <div
          className="text-xs font-mono uppercase tracking-wider mb-2"
          style={{ color: C.accent }}
        >
          Convertible Note Terms
        </div>
        <ul className="text-xs space-y-1.5" style={{ color: C.textSecondary }}>
          <li>
            1. <strong>Structure:</strong> Convertible loan with {INTEREST_RATE}%
            p.a. accruing interest
          </li>
          <li>
            2. <strong>Conversion discount:</strong> {DISCOUNT_RATE}% at next
            qualified round (30% Early Bird for CHF 200K+ lead)
          </li>
          <li>
            3. <strong>Pre-money valuation:</strong> CHF 8.5M
          </li>
          <li>
            4. <strong>Exit target:</strong> Trade sale in 6-8 years (5-10x
            ARR tech multiple)
          </li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-center" style={{ color: C.textMuted }}>
        * Terms indicative. Final terms subject to formal agreement.
      </div>
    </motion.div>
  );
}

/* ─── Sensitivity Grid ─── */
function SensitivityGrid() {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const rates = [3000, 3500, 4000, 4500];
  const days = [150, 180, 200, 220];
  const values: Record<string, string> = {
    "150-3000": "13.5M",
    "150-3500": "15.8M",
    "150-4000": "18.0M",
    "150-4500": "20.3M",
    "180-3000": "16.2M",
    "180-3500": "18.9M",
    "180-4000": "21.6M",
    "180-4500": "24.3M",
    "200-3000": "18.0M",
    "200-3500": "21.0M",
    "200-4000": "22.2M",
    "200-4500": "27.0M",
    "220-3000": "19.8M",
    "220-3500": "23.1M",
    "220-4000": "26.4M",
    "220-4500": "29.7M",
  };

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.6, ease }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: C.border, boxShadow: C.shadow }}
    >
      <div className="p-4 sm:p-5" style={{ background: C.bgAlt }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
            <BarChart3 className="w-4 h-4" style={{ color: C.accent }} />
          </div>
          <span
            className="text-sm font-mono uppercase tracking-wider font-semibold"
            style={{ color: C.accent }}
          >
            Revenue Sensitivity (Year 6)
          </span>
        </div>
        <p className="text-xs ml-11" style={{ color: C.textMuted }}>
          Utilisation days x daily rate &rarr; total platform revenue (125 drones, 35 partners)
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr style={{ background: C.bgAlt }}>
              <th
                className="px-3 sm:px-4 py-3 text-left font-mono uppercase tracking-wider text-[10px]"
                style={{ color: C.textMuted, borderBottom: `1px solid ${C.border}` }}
              >
                Days \ Rate
              </th>
              {rates.map((r) => (
                <th
                  key={r}
                  className="px-3 sm:px-4 py-3 text-right font-mono uppercase tracking-wider text-[10px]"
                  style={{ color: C.textMuted, borderBottom: `1px solid ${C.border}` }}
                >
                  CHF {r.toLocaleString()}/day
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td
                  className="px-3 sm:px-4 py-3 font-mono font-semibold"
                  style={{
                    color: d === 200 ? C.accent : C.text,
                    background: d === 200 ? C.accentLight : "transparent",
                  }}
                >
                  {d} days {d === 200 && <span className="text-[10px] font-normal ml-1">(base)</span>}
                </td>
                {rates.map((r) => {
                  const key = `${d}-${r}`;
                  const isBase = d === 200 && r === 4000;
                  const isHovered = hoveredCell === key;
                  return (
                    <td
                      key={r}
                      className="px-3 sm:px-4 py-3 text-right font-mono cursor-pointer transition-all"
                      style={{
                        color: isBase ? C.accent : isHovered ? C.accent : C.text,
                        background: isBase
                          ? C.accentLight
                          : isHovered
                            ? C.accentLight
                            : d === 200
                              ? C.accentLight
                              : "transparent",
                        fontWeight: isBase || isHovered ? 700 : 400,
                      }}
                      onMouseEnter={() => setHoveredCell(key)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      CHF {values[key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ─── Chart Data ─── */
const cashFlowData = [
  { year: "Year 1", net: -203, cumulative: -203 },
  { year: "Year 2", net: 600, cumulative: 397 },
  { year: "Year 3", net: 2600, cumulative: 2997 },
  { year: "Year 4", net: 6100, cumulative: 9097 },
  { year: "Year 5", net: 10100, cumulative: 19197 },
  { year: "Year 6", net: 16100, cumulative: 35200 },
];

const fleetGrowthData = [
  { year: "Year 1", own: 2, franchise: 0, total: 2 },
  { year: "Year 2", own: 5, franchise: 0, total: 5 },
  { year: "Year 3", own: 8, franchise: 12, total: 20 },
  { year: "Year 4", own: 10, franchise: 35, total: 45 },
  { year: "Year 5", own: 12, franchise: 68, total: 80 },
  { year: "Year 6", own: 15, franchise: 110, total: 125 },
];

/* ─── Fleet Growth Chart ─── */
function FleetGrowthChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.6, ease }}
      className="rounded-2xl p-5 sm:p-6 border"
      style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
          <TrendingUp className="w-4 h-4" style={{ color: C.accent }} />
        </div>
        <span
          className="text-sm font-mono uppercase tracking-wider font-semibold"
          style={{ color: C.accent }}
        >
          Fleet Growth — 2 to 125 Drones
        </span>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: C.accent }} />
          <span className="text-xs" style={{ color: C.textMuted }}>Own Fleet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: C.gold }} />
          <span className="text-xs" style={{ color: C.textMuted }}>Franchise</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={fleetGrowthData} barCategoryGap="20%">
          <XAxis
            dataKey="year"
            tick={{ fill: C.textMuted, fontSize: 11 }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: C.textMuted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar dataKey="own" name="Own Drones" stackId="fleet" fill={C.accent} radius={[0, 0, 0, 0]} />
          <Bar dataKey="franchise" name="Franchise" stackId="fleet" fill={C.gold} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/* ─── Cash Flow Chart ─── */
function CashFlowChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.6, ease }}
      className="rounded-2xl p-5 sm:p-6 border"
      style={{ background: C.bgCard, borderColor: C.border, boxShadow: C.shadow }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ background: C.greenLight }}>
          <DollarSign className="w-4 h-4" style={{ color: C.green }} />
        </div>
        <span
          className="text-sm font-mono uppercase tracking-wider font-semibold"
          style={{ color: C.green }}
        >
          Cumulative Cash Flow
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={cashFlowData}>
          <defs>
            <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.green} stopOpacity={0.2} />
              <stop offset="95%" stopColor={C.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            tick={{ fill: C.textMuted, fontSize: 11 }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: C.textMuted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v >= 0 ? "+" : ""}${(v / 1000).toFixed(1)}M`}
          />
          <Tooltip
            contentStyle={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value) => [`CHF ${value}K`, "Cumulative"]}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={C.green}
            strokeWidth={2.5}
            fill="url(#cashGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-xs" style={{ color: C.textMuted }}>
        From -CHF 203K (Year 1) to +CHF 35.2M cumulative (Year 6) &mdash; with CHF 1.5M raised
      </div>
    </motion.div>
  );
}

/* ─── Table of Contents ─── */
const TOC_ITEMS = [
  { id: "unit-economics", label: "Unit Economics", number: "01" },
  { id: "six-year-pl", label: "6-Year P&L", number: "02" },
  { id: "break-even", label: "Break-Even Analysis", number: "03" },
  { id: "cash-flow", label: "Cash Flow", number: "04" },
  { id: "investor-roi", label: "Investor ROI", number: "05" },
  { id: "franchise", label: "Franchise Economics", number: "06" },
  { id: "fleet-growth", label: "Fleet Growth", number: "07" },
  { id: "platform-gmv", label: "Platform GMV", number: "08" },
  { id: "sensitivity", label: "Sensitivity Analysis", number: "09" },
];

/* ═══════════════════════════════════════════════════════════════
   PASSWORD GATE
   ═══════════════════════════════════════════════════════════════ */
const DECK_PASSWORD = "Airdrone";
const AUTH_KEY = "airbase-investor-auth";

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogin = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (pw === DECK_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, "1");
        onAuth();
      } else {
        setError(true);
        inputRef.current?.focus();
      }
    },
    [pw, onAuth]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(227,6,19,0.08) 0%, transparent 70%)",
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
            <img
              src="/airbase-logo-transparent.png"
              alt="airBASE"
              className="h-20 w-auto brightness-0 invert"
            />
          </div>

          <div className="text-sm font-mono uppercase tracking-[0.2em] mb-1 text-white/40">
            Confidential
          </div>
          <div className="text-lg font-semibold text-white/80 mb-8">
            Financial Plan
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={inputRef}
                type="password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError(false);
                }}
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
              Access Financial Plan
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

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function FinancialPlan() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  if (!authed) {
    return <PasswordGate onAuth={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <style dangerouslySetInnerHTML={{ __html: rangeSliderStyles }} />

      {/* ─── Download PDF Button ─── */}
      <button
        onClick={() => window.print()}
        className="no-print fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110 shadow-lg"
        style={{ background: C.accent }}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Download PDF</span>
      </button>

      {/* ─── Hero Header ─── */}
      <header
        className="relative py-16 sm:py-24 px-4"
        style={{
          background: `linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(227,6,19,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <img
              src="/airbase-logo-transparent.png"
              alt="airBASE"
              className="h-16 sm:h-20 mx-auto mb-6 brightness-0 invert"
            />
            <div className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-white/40 mb-3">
              Investor-Grade Financial Projections
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Financial Plan
            </h1>
            <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto">
              Confidential &mdash; June 2026
            </p>
          </motion.div>

          {/* Highlight KPIs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-14 max-w-4xl mx-auto"
          >
            {[
              { label: "Year 6 Revenue", value: "CHF 22.2M", sub: "73% EBITDA margin" },
              { label: "Contribution Margin", value: "80.8%", sub: "Per drone unit" },
              { label: "Break-Even", value: "Month 5", sub: "Operational" },
              { label: "6-Yr Cumulative", value: "+CHF 35.2M", sub: "Cash flow" },
            ].map((kpi, i) => (
              <div
                key={i}
                className="rounded-xl p-3 sm:p-4 text-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-white">
                  {kpi.value}
                </div>
                <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/40 mt-1">
                  {kpi.label}
                </div>
                <div className="text-[10px] text-white/25 mt-0.5">{kpi.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ─── Table of Contents ─── */}
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {TOC_ITEMS.map((item) => (
            <motion.a
              key={item.id}
              href={`#${item.id}`}
              variants={fadeUp}
              className="rounded-xl p-3 sm:p-4 border text-center transition-all hover:shadow-md group"
              style={{ borderColor: C.border, background: C.bgCard }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span
                className="text-[10px] font-mono tracking-widest block mb-1"
                style={{ color: C.accent }}
              >
                {item.number}
              </span>
              <span
                className="text-xs sm:text-sm font-semibold group-hover:text-[#E30613] transition-colors"
                style={{ color: C.text }}
              >
                {item.label}
              </span>
            </motion.a>
          ))}
        </Stagger>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-16 sm:space-y-24">
        {/* ═══ SECTION 1: Unit Economics ═══ */}
        <section>
          <SectionHeader
            number="01"
            title="Unit Economics"
            subtitle="Per drone profit & loss — CHF 630K revenue, 81% contribution margin"
            id="unit-economics"
          />

          <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <KpiCard
              label="Revenue / Drone"
              value={<CountUp end={630} prefix="CHF " suffix="K" />}
              sub="180 days x CHF 3,500/day"
              icon={DollarSign}
              color={C.green}
            />
            <KpiCard
              label="Contribution Margin"
              value={<CountUp end={509} prefix="CHF " suffix="K" />}
              sub="80.8% margin"
              icon={TrendingUp}
              color={C.accent}
              delay={0.1}
            />
            <KpiCard
              label="CAPEX / Drone"
              value="CHF 49K"
              sub="FC200 full set (base)"
              icon={Wrench}
              delay={0.2}
            />
            <KpiCard
              label="Annual OPEX"
              value="CHF 12.9K"
              sub="Maint + insurance + battery"
              icon={Cpu}
              delay={0.3}
            />
          </Stagger>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <Expandable title="Capital Expenditure (CAPEX)" icon={Wrench} defaultOpen>
              <StyledTable
                headers={["Item", "Conservative", "Base", "Optimistic"]}
                rows={[
                  ["Drone (FC200, full set)", "CHF 45,000", "CHF 40,000", "CHF 35,000"],
                  ["Extra battery sets (3-4x)", "CHF 10,000", "CHF 9,000", "CHF 8,000"],
                  ["Total per drone", "CHF 55,000", "CHF 49,000", "CHF 43,000"],
                ]}
                highlightLast
              />
            </Expandable>

            <Expandable title="Annual Operating Cost per Drone" icon={Cpu}>
              <StyledTable
                headers={["Item", "Cost/Year"]}
                rows={[
                  ["Maintenance (12% of purchase)", "CHF 5,400"],
                  ["Insurance (liability + full)", "CHF 3,000"],
                  ["Battery replacement reserve", "CHF 4,500"],
                  ["Total annual OPEX", "CHF 12,900"],
                ]}
                highlightLast
              />
            </Expandable>
          </div>

          <div className="mt-6">
            <Expandable title="Revenue per Drone (Base Case)" icon={DollarSign} defaultOpen>
              <StyledTable
                headers={["Metric", "Value"]}
                rows={[
                  ["Operational days/year", "180"],
                  ["Average daily rate (blended)", "CHF 3,500"],
                  ["Gross revenue per drone/year", "CHF 630,000"],
                  ["Direct costs (crew, maintenance)", "CHF 12,900"],
                  ["Crew cost allocation (2-person team)", "CHF 108,000"],
                  ["Contribution margin per drone", "CHF 509,100"],
                  ["Contribution margin %", "80.8%"],
                ]}
                highlightLast
              />
            </Expandable>
          </div>
        </section>

        {/* ═══ SECTION 2: Six-Year P&L ═══ */}
        <section>
          <SectionHeader
            number="02"
            title="6-Year Profit & Loss"
            subtitle="From CHF 315K revenue (Year 1) to CHF 22.2M (Year 6) with 73% EBITDA margin"
            id="six-year-pl"
          />

          {/* Revenue + EBITDA KPI row */}
          <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <KpiCard
              label="Year 6 Revenue"
              value={<CountUp end={22.2} prefix="CHF " suffix="M" decimals={1} />}
              sub="DaaS + Franchise"
              icon={DollarSign}
              color={C.green}
            />
            <KpiCard
              label="Year 6 EBITDA"
              value={<CountUp end={16.1} prefix="CHF " suffix="M" decimals={1} />}
              sub="73% margin"
              icon={TrendingUp}
              color={C.accent}
              delay={0.1}
            />
            <KpiCard
              label="Fleet (Year 6)"
              value={<CountUp end={125} suffix=" drones" />}
              sub="15 own + 110 franchise"
              icon={Layers}
              delay={0.2}
            />
            <KpiCard
              label="Franchise Partners"
              value={<CountUp end={35} suffix=" partners" />}
              sub="35 partners by Year 6"
              icon={Users}
              delay={0.3}
            />
          </Stagger>

          {/* P&L Table */}
          <DataCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
                <BarChart3 className="w-4 h-4" style={{ color: C.accent }} />
              </div>
              <span
                className="text-sm font-mono uppercase tracking-wider font-semibold"
                style={{ color: C.accent }}
              >
                Consolidated P&L
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr style={{ background: C.bgAlt }}>
                    {["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((h, i) => (
                      <th
                        key={i}
                        className={`px-2 sm:px-3 py-2.5 font-mono uppercase tracking-wider text-[10px] ${i === 0 ? "text-left" : "text-right"}`}
                        style={{ color: C.textMuted, borderBottom: `1px solid ${C.border}` }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Fleet */}
                  <tr style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2 font-semibold" style={{ color: C.textMuted }}>Own Drones</td>
                    {[2, 5, 8, 10, 12, 15].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2 font-semibold" style={{ color: C.textMuted }}>Franchise Drones</td>
                    {["\u2014", "\u2014", 12, 35, 68, 110].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2 font-semibold" style={{ color: C.textMuted }}>Franchise Partners</td>
                    {["\u2014", "\u2014", 5, 12, 22, 35].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2 font-bold" style={{ color: C.text }}>Total Fleet</td>
                    {[2, 5, 20, 45, 80, 125].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono font-bold" style={{ color: C.text }}>{v}</td>)}
                  </tr>

                  {/* Revenue section header */}
                  <tr><td colSpan={7} className="px-2 sm:px-3 pt-4 pb-1"><span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: C.accent }}>Revenue</span></td></tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2" style={{ color: C.textSecondary }}>Own ops (days x rate)</td>
                    {["315K", "3,150K", "5,040K", "7,600K", "9,600K", "12,000K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2" style={{ color: C.textSecondary }}>Gov/Military retainers</td>
                    {["\u2014", "200K", "400K", "600K", "800K", "1,200K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.accentLight }}>
                    <td className="px-2 sm:px-3 py-2 font-semibold" style={{ color: C.accent }}>Subtotal DaaS</td>
                    {["315K", "3,350K", "5,440K", "8,200K", "10,400K", "13,200K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono font-semibold" style={{ color: C.accent }}>{v}</td>)}
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2" style={{ color: C.textSecondary }}>Franchise entry fees</td>
                    {["\u2014", "\u2014", "70K", "100K", "140K", "180K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2" style={{ color: C.textSecondary }}>Hardware margin</td>
                    {["\u2014", "\u2014", "140K", "280K", "400K", "500K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2" style={{ color: C.textSecondary }}>Royalties (9%)</td>
                    {["\u2014", "\u2014", "680K", "2,400K", "4,900K", "7,690K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-2" style={{ color: C.textSecondary }}>SaaS + LUC fee</td>
                    {["\u2014", "\u2014", "90K", "220K", "400K", "630K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.goldLight }}>
                    <td className="px-2 sm:px-3 py-2 font-semibold" style={{ color: C.gold }}>Subtotal Franchise</td>
                    {["\u2014", "\u2014", "980K", "3,000K", "5,840K", "9,000K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono font-semibold" style={{ color: C.gold }}>{v}</td>)}
                  </tr>

                  {/* Total Revenue */}
                  <tr style={{ borderBottom: `2px solid ${C.accent}`, background: C.accentLight }}>
                    <td className="px-2 sm:px-3 py-3 font-bold text-sm" style={{ color: C.accent }}>TOTAL REVENUE</td>
                    {["315K", "3,350K", "6,420K", "11,200K", "16,240K", "22,200K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-3 text-right font-mono font-bold text-sm" style={{ color: C.accent }}>{v}</td>)}
                  </tr>

                  {/* Costs section header */}
                  <tr><td colSpan={7} className="px-2 sm:px-3 pt-4 pb-1"><span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: C.textMuted }}>Costs</span></td></tr>
                  {[
                    { label: "Drone CAPEX", vals: ["98K", "147K", "147K", "98K", "98K", "147K"] },
                    { label: "Fleet OPEX", vals: ["26K", "65K", "103K", "129K", "155K", "194K"] },
                    { label: "Crew costs", vals: ["124K", "800K", "1,100K", "1,500K", "1,800K", "1,650K"] },
                    { label: "Operations vehicles", vals: ["50K", "50K", "75K", "100K", "125K", "150K"] },
                    { label: "Fixed & platform", vals: ["190K", "500K", "700K", "900K", "1,050K", "980K"] },
                    { label: "Core team salaries", vals: ["0", "650K", "900K", "1,200K", "1,500K", "1,450K"] },
                    { label: "Marketing", vals: ["30K", "300K", "500K", "700K", "900K", "850K"] },
                    { label: "Franchise ops", vals: ["\u2014", "\u2014", "200K", "400K", "650K", "680K"] },
                  ].map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-2 sm:px-3 py-2" style={{ color: C.textSecondary }}>{row.label}</td>
                      {row.vals.map((v, i) => <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{v}</td>)}
                    </tr>
                  ))}
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    <td className="px-2 sm:px-3 py-3 font-bold" style={{ color: C.text }}>TOTAL COSTS</td>
                    {["518K", "2,750K", "3,820K", "5,100K", "6,140K", "6,100K"].map((v, i) => <td key={i} className="px-2 sm:px-3 py-3 text-right font-mono font-bold" style={{ color: C.text }}>{v}</td>)}
                  </tr>

                  {/* EBITDA */}
                  <tr style={{ background: C.greenLight }}>
                    <td className="px-2 sm:px-3 py-3 font-bold text-sm" style={{ color: C.green }}>EBITDA</td>
                    {[
                      { v: "-203K", neg: true },
                      { v: "600K", neg: false },
                      { v: "2,600K", neg: false },
                      { v: "6,100K", neg: false },
                      { v: "10,100K", neg: false },
                      { v: "16,100K", neg: false },
                    ].map((item, i) => (
                      <td key={i} className="px-2 sm:px-3 py-3 text-right font-mono font-bold text-sm" style={{ color: item.neg ? C.red : C.green }}>
                        {item.v}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-2 sm:px-3 py-2 font-semibold text-xs" style={{ color: C.textMuted }}>EBITDA Margin</td>
                    {["-64%", "18%", "40%", "54%", "62%", "73%"].map((v, i) => (
                      <td key={i} className="px-2 sm:px-3 py-2 text-right font-mono text-xs" style={{ color: v.startsWith("-") ? C.red : C.green }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </DataCard>
        </section>

        {/* ═══ SECTION 3: Break-Even ═══ */}
        <section>
          <SectionHeader
            number="03"
            title="Break-Even Analysis"
            subtitle="Operational break-even at Month 5-6, full P&L break-even at Month 14"
            id="break-even"
          />

          <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <KpiCard
              label="Monthly Fixed Costs"
              value="CHF 15.8K"
              sub="Year 1 lean launch"
              icon={DollarSign}
            />
            <KpiCard
              label="Daily Contribution"
              value="CHF 1,750"
              sub="Per drone average"
              icon={TrendingUp}
              color={C.green}
              delay={0.1}
            />
            <KpiCard
              label="Operational B/E"
              value="Month 5-6"
              sub="~9 ops days/month"
              icon={Target}
              color={C.gold}
              delay={0.2}
            />
            <KpiCard
              label="Full P&L B/E"
              value="Month 14"
              sub="Early Year 2"
              icon={CheckCircle2}
              color={C.green}
              delay={0.3}
            />
          </Stagger>

          {/* Visual break-even timeline */}
          <DataCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ background: C.goldLight }}>
                <Clock className="w-4 h-4" style={{ color: C.gold }} />
              </div>
              <span
                className="text-sm font-mono uppercase tracking-wider font-semibold"
                style={{ color: C.gold }}
              >
                Break-Even Timeline
              </span>
            </div>
            <div className="relative">
              {/* Timeline bar */}
              <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: C.border }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${C.red}, ${C.gold} 40%, ${C.green} 100%)` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </div>
              {/* Markers */}
              <div className="flex justify-between text-center">
                {[
                  { month: "M1", label: "Launch", color: C.red },
                  { month: "M5-6", label: "Ops B/E", color: C.gold },
                  { month: "M14", label: "Full B/E", color: C.green },
                  { month: "M24+", label: "Scale", color: C.green },
                ].map((m, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full mb-1" style={{ background: m.color }} />
                    <span className="text-xs font-mono font-bold" style={{ color: m.color }}>
                      {m.month}
                    </span>
                    <span className="text-[10px]" style={{ color: C.textMuted }}>
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DataCard>

          <div className="mt-6">
            <Expandable title="Detailed Break-Even Metrics" icon={Target}>
              <StyledTable
                headers={["Metric", "Value"]}
                rows={[
                  ["Monthly fixed costs (Year 1)", "CHF 15,800"],
                  ["Average daily contribution (1 drone)", "CHF 1,750"],
                  ["Break-even point", "~9 operational days/month"],
                  ["Operational break-even (projected)", "Month 5-6 (after ramp-up)"],
                  ["Annual break-even (full P&L)", "Month 14 (early Year 2)"],
                ]}
              />
            </Expandable>
          </div>
        </section>

        {/* ═══ SECTION 4: Cash Flow ═══ */}
        <section>
          <SectionHeader
            number="04"
            title="Cash Flow & Runway"
            subtitle="Cumulative cash flow from -CHF 203K to +CHF 35.2M over 6 years"
            id="cash-flow"
          />

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <CashFlowChart />
            <DataCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ background: C.greenLight }}>
                  <Banknote className="w-4 h-4" style={{ color: C.green }} />
                </div>
                <span
                  className="text-sm font-mono uppercase tracking-wider font-semibold"
                  style={{ color: C.green }}
                >
                  Cash Flow Summary
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr style={{ background: C.bgAlt }}>
                      {["", "Cash In", "Cash Out", "Net", "Cumulative"].map((h, i) => (
                        <th
                          key={i}
                          className={`px-2 py-2 font-mono uppercase tracking-wider text-[10px] ${i === 0 ? "text-left" : "text-right"}`}
                          style={{ color: C.textMuted, borderBottom: `1px solid ${C.border}` }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { yr: "Year 1", ci: "315K", co: "518K", net: "-203K", cum: "-203K", neg: true },
                      { yr: "Year 2", ci: "3,350K", co: "2,750K", net: "+600K", cum: "+397K", neg: false },
                      { yr: "Year 3", ci: "6,420K", co: "3,820K", net: "+2,600K", cum: "+2,997K", neg: false },
                      { yr: "Year 4", ci: "11,200K", co: "5,100K", net: "+6,100K", cum: "+9,097K", neg: false },
                      { yr: "Year 5", ci: "16,240K", co: "6,140K", net: "+10,100K", cum: "+19,197K", neg: false },
                      { yr: "Year 6", ci: "22,200K", co: "6,100K", net: "+16,100K", cum: "+35,200K", neg: false },
                    ].map((row, ri) => (
                      <tr key={ri} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td className="px-2 py-2 font-semibold" style={{ color: C.text }}>{row.yr}</td>
                        <td className="px-2 py-2 text-right font-mono" style={{ color: C.green }}>{row.ci}</td>
                        <td className="px-2 py-2 text-right font-mono" style={{ color: C.textSecondary }}>{row.co}</td>
                        <td className="px-2 py-2 text-right font-mono font-semibold" style={{ color: row.neg ? C.red : C.green }}>{row.net}</td>
                        <td className="px-2 py-2 text-right font-mono font-bold" style={{ color: row.neg ? C.red : C.green }}>{row.cum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: C.greenLight, color: C.textSecondary }}>
                With CHF 1.5M raised: runway covers Year 1 negative cash flow with CHF 1.3M+ reserve. Franchise model drives margin expansion to 73% by Year 6.
              </div>
            </DataCard>
          </div>
        </section>

        {/* ═══ SECTION 5: Investor ROI ═══ */}
        <section>
          <SectionHeader
            number="05"
            title="Investor ROI"
            subtitle="Interactive calculator — pick your investment amount, see projected returns"
            id="investor-roi"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <ROICalculator />
            <div className="space-y-6">
              <DataCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: C.goldLight }}>
                    <Target className="w-4 h-4" style={{ color: C.gold }} />
                  </div>
                  <span
                    className="text-sm font-mono uppercase tracking-wider font-semibold"
                    style={{ color: C.gold }}
                  >
                    Exit Targets
                  </span>
                </div>
                <ul className="space-y-3">
                  {[
                    { label: "Timeline", value: "Trade sale in 6-8 years" },
                    { label: "Valuation basis", value: "5-10x ARR tech multiple (AI + LUC moat)" },
                    { label: "Potential acquirers", value: "Die Post, Planzer, Kuehne+Nagel, Implenia, intl. drone infra companies" },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: C.textSecondary }}>
                      <span className="font-mono text-xs font-semibold shrink-0 mt-0.5" style={{ color: C.accent }}>
                        {item.label}:
                      </span>
                      <span>{item.value}</span>
                    </li>
                  ))}
                </ul>
              </DataCard>

              <DataCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
                    <Banknote className="w-4 h-4" style={{ color: C.accent }} />
                  </div>
                  <span
                    className="text-sm font-mono uppercase tracking-wider font-semibold"
                    style={{ color: C.accent }}
                  >
                    Example: CHF 250K Investment
                  </span>
                </div>
                <StyledTable
                  headers={["Scenario", "ARR Multiple", "Valuation", "Return", "ROI"]}
                  rows={[
                    ["Conservative", "5x", "CHF 110M", "CHF 5,343K", "21.4x"],
                    ["Base", "7x", "CHF 154M", "CHF 7,480K", "29.9x"],
                    ["Optimistic", "10x", "CHF 220M", "CHF 10,686K", "42.7x"],
                  ]}
                />
                <p className="mt-3 text-[10px]" style={{ color: C.textMuted }}>
                  Returns include 6% p.a. accrued interest over 6 years and 20% conversion discount. Early Bird (30% discount) increases returns by ~15%.
                </p>
              </DataCard>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 6: Franchise Economics ═══ */}
        <section>
          <SectionHeader
            number="06"
            title="Franchise Unit Economics"
            subtitle="Partner P&L + HQ recurring revenue per franchise partner"
            id="franchise"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <DataCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
                  <Users className="w-4 h-4" style={{ color: C.accent }} />
                </div>
                <span
                  className="text-sm font-mono uppercase tracking-wider font-semibold"
                  style={{ color: C.accent }}
                >
                  Franchise Partner P&L (per unit/year)
                </span>
              </div>
              <StyledTable
                headers={["Item", "Amount"]}
                rows={[
                  ["Revenue (180 days x CHF 3,500)", "CHF 630,000"],
                  ["Royalty to HQ (9%)", "-CHF 56,700"],
                  ["Marketing pool (2%)", "-CHF 12,600"],
                  ["SaaS + LUC fee", "-CHF 18,000"],
                  ["Crew costs (2 persons)", "-CHF 175,000"],
                  ["Drone OPEX", "-CHF 12,900"],
                  ["Vehicle OPEX", "-CHF 8,000"],
                  ["Partner Net Income", "CHF 346,800"],
                ]}
                highlightLast
              />
              <div
                className="mt-4 p-3 rounded-lg text-center"
                style={{ background: C.greenLight }}
              >
                <span className="text-lg font-bold font-mono" style={{ color: C.green }}>
                  ~4x ROI
                </span>
                <span className="text-xs block mt-0.5" style={{ color: C.textMuted }}>
                  Partner return on entry investment in Year 1
                </span>
              </div>
            </DataCard>

            <DataCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ background: C.goldLight }}>
                  <DollarSign className="w-4 h-4" style={{ color: C.gold }} />
                </div>
                <span
                  className="text-sm font-mono uppercase tracking-wider font-semibold"
                  style={{ color: C.gold }}
                >
                  HQ Revenue per Franchise Partner
                </span>
              </div>
              <StyledTable
                headers={["Stream", "Annual"]}
                rows={[
                  ["Entry fee (one-time, amortised)", "CHF 7,000"],
                  ["Hardware margin (one-time, amortised)", "CHF 6,000"],
                  ["Royalties (9%)", "CHF 56,700"],
                  ["Marketing pool (2%)", "CHF 12,600"],
                  ["SaaS + LUC fee", "CHF 18,000"],
                  ["HQ recurring revenue per partner", "CHF 87,300"],
                ]}
                highlightLast
              />
              <div
                className="mt-4 p-3 rounded-lg text-center"
                style={{ background: C.goldLight }}
              >
                <span className="text-lg font-bold font-mono" style={{ color: C.gold }}>
                  CHF 87.3K
                </span>
                <span className="text-xs block mt-0.5" style={{ color: C.textMuted }}>
                  Recurring annual revenue per franchise partner
                </span>
              </div>
            </DataCard>
          </div>
        </section>

        {/* ═══ SECTION 7: Fleet Growth ═══ */}
        <section>
          <SectionHeader
            number="07"
            title="Fleet Growth"
            subtitle="From 2 drones (Year 1) to 125 drones (Year 6) — own fleet + 35 franchise partners"
            id="fleet-growth"
          />
          <FleetGrowthChart />
        </section>

        {/* ═══ SECTION 8: Platform GMV ═══ */}
        <section>
          <SectionHeader
            number="08"
            title="Platform GMV"
            subtitle="Total ecosystem value — own operations + franchise partner gross revenue"
            id="platform-gmv"
          />

          <Stagger className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            <KpiCard
              label="Year 6 Platform GMV"
              value={<CountUp end={95.5} prefix="CHF " suffix="M" decimals={1} />}
              sub="Total ecosystem value"
              icon={PieChart}
              color={C.accent}
            />
            <KpiCard
              label="HQ Take Rate"
              value={<CountUp end={23} suffix="%" />}
              sub="CHF 22.2M of CHF 95.5M GMV"
              icon={DollarSign}
              color={C.green}
              delay={0.1}
            />
            <KpiCard
              label="Ecosystem Drones"
              value={<CountUp end={125} suffix=" units" />}
              sub="15 own + 110 franchise"
              icon={Layers}
              color={C.gold}
              delay={0.2}
            />
          </Stagger>

          <DataCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
                <PieChart className="w-4 h-4" style={{ color: C.accent }} />
              </div>
              <span
                className="text-sm font-mono uppercase tracking-wider font-semibold"
                style={{ color: C.accent }}
              >
                Platform GMV Growth
              </span>
            </div>
            <StyledTable
              headers={["", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]}
              rows={[
                ["Own Operations", "315K", "3,350K", "5,440K", "8,200K", "10,400K", "13,200K"],
                ["Franchise Gross Rev.", "\u2014", "\u2014", "7,560K", "26,600K", "54,400K", "82,300K"],
                ["Total Platform GMV", "315K", "3,350K", "13,000K", "34,800K", "64,800K", "95,500K"],
              ]}
              highlightLast
            />
            <div
              className="mt-4 p-3 rounded-lg text-xs"
              style={{ background: C.accentLight, color: C.textSecondary }}
            >
              Platform GMV represents the total gross transaction value flowing through the airBASE ecosystem. HQ captures ~23% as direct revenue through own operations, royalties, SaaS fees, and franchise margins.
            </div>
          </DataCard>
        </section>

        {/* ═══ SECTION 9: Sensitivity Analysis ═══ */}
        <section>
          <SectionHeader
            number="09"
            title="Sensitivity Analysis"
            subtitle="Revenue sensitivity to utilisation rates, daily pricing, and franchise scale"
            id="sensitivity"
          />

          <SensitivityGrid />

          <div className="mt-8">
            <Expandable title="Key Risk Factors & Mitigations" icon={Shield} defaultOpen>
              <div className="space-y-4">
                {[
                  {
                    risk: "Regulatory delay (LUC)",
                    mitigation: "SORA enables commercial ops while LUC pending",
                    icon: AlertTriangle,
                    color: C.gold,
                  },
                  {
                    risk: "Weather / utilisation",
                    mitigation: "Gov retainers provide baseline revenue regardless of weather",
                    icon: Shield,
                    color: C.green,
                  },
                  {
                    risk: "Competition",
                    mitigation: "LUC + AI moat = 18+ month head start; no Swiss competitor close",
                    icon: Zap,
                    color: C.accent,
                  },
                  {
                    risk: "Drone reliability",
                    mitigation: "Backup drone strategy (Year 1: 2 drones, 1 operational + 1 redundancy)",
                    icon: Wrench,
                    color: C.textSecondary,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start p-3 rounded-xl"
                    style={{ background: C.bgAlt }}
                  >
                    <div className="p-2 rounded-lg shrink-0" style={{ background: item.color + "14" }}>
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: C.text }}>
                        {item.risk}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                        {item.mitigation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Expandable>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer
        className="py-8 px-4 text-center border-t"
        style={{ borderColor: C.border, background: C.bgAlt }}
      >
        <img
          src="/airbase-logo-transparent.png"
          alt="airBASE"
          className="h-8 mx-auto mb-3 opacity-30"
        />
        <p className="text-xs font-mono" style={{ color: C.textMuted }}>
          airBASE Aviation &mdash; Confidential Financial Plan &mdash; June 2026
        </p>
        <p className="text-[10px] mt-1" style={{ color: C.textMuted }}>
          Based on management estimates. Subject to market conditions and regulatory timelines.
        </p>
      </footer>
    </div>
  );
}
