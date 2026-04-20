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
  LineChart,
  Line,
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
  ArrowDown,
} from "lucide-react";

/* ─── Design Tokens ─── */
const C = {
  bg: "#0A0A0F",
  bgCard: "#12121C",
  accent: "#0066FF",
  accentGlow: "rgba(0,102,255,0.15)",
  gold: "#C9A84C",
  white: "#FFFFFF",
  gray: "#8A8A9A",
  grayLight: "#B0B0C0",
  darkGray: "#1A1A2E",
  border: "#1E1E30",
  red: "#EF4444",
  green: "#22C55E",
};

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

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

/* ─── Utility: Animated Section ─── */
function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 ${className}`}
    >
      {children}
    </section>
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
        style={{ color: C.accent, borderColor: C.accent + "40" }}
      >
        {number}
      </span>
      <span className="text-xs font-mono tracking-widest uppercase" style={{ color: C.gray }}>
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
      style={{ background: C.bgCard, borderColor: C.border }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ background: C.accentGlow }}>
          <Icon className="w-4 h-4" style={{ color: C.accent }} />
        </div>
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: C.gray }}>
          {label}
        </span>
      </div>
      <div className="text-3xl md:text-4xl font-bold font-mono" style={{ color: C.white }}>
        {value}
      </div>
      {sub && (
        <div className="text-sm mt-2" style={{ color: C.gray }}>
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
      style={{ color: C.grayLight }}
    >
      <CheckCircle2
        className="w-5 h-5 mt-1 shrink-0"
        style={{ color: C.accent }}
      />
      <span>{children}</span>
    </motion.li>
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
  { quarter: "Q1 '25", boxes: 3, revenue: 0.36 },
  { quarter: "Q2 '25", boxes: 6, revenue: 0.72 },
  { quarter: "Q3 '25", boxes: 8, revenue: 1.0 },
  { quarter: "Q4 '25", boxes: 10, revenue: 1.45 },
  { quarter: "Q1 '26", boxes: 15, revenue: 2.2 },
  { quarter: "Q2 '26", boxes: 22, revenue: 3.2 },
  { quarter: "Q3 '26", boxes: 28, revenue: 4.1 },
  { quarter: "Q4 '26", boxes: 35, revenue: 5.1 },
  { quarter: "Q1 '27", boxes: 48, revenue: 7.0 },
  { quarter: "Q2 '27", boxes: 62, revenue: 9.0 },
  { quarter: "Q3 '27", boxes: 75, revenue: 10.9 },
  { quarter: "Q4 '27", boxes: 85, revenue: 12.4 },
];

const fundAllocation = [
  { name: "Franchise Deployment", value: 40, amount: "1.0M", color: C.accent },
  { name: "Technology & AI", value: 25, amount: "625K", color: "#7C3AED" },
  { name: "Regulatory & Legal", value: 20, amount: "500K", color: C.gold },
  { name: "Team & Ops", value: 15, amount: "375K", color: C.green },
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
            background: i === current ? C.accent : C.gray + "40",
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
export function InvestorPitchDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const totalSlides = 12;

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

      {/* ═══ SLIDE 1: COVER ═══ */}
      <section
        ref={setRef(0)}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(0,102,255,0.08) 0%, transparent 70%)",
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
              opacity: [0.2, 0.6, 0.2],
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
          className="relative z-10 max-w-4xl"
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
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            style={{ color: C.white }}
          >
            AIRBASE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl font-light mb-4"
            style={{ color: C.grayLight }}
          >
            Switzerland&apos;s Drone-as-a-Service Infrastructure
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold mt-8"
            style={{ color: C.gold }}
          >
            Order Today. Fly Tomorrow.
          </motion.p>
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
            <ChevronDown className="w-6 h-6" style={{ color: C.gray }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ SLIDE 2: THE PROBLEM ═══ */}
      <section
        ref={setRef(1)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="01" text="The Problem" />

          <Stagger className="space-y-6">
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: C.white }}
            >
              The Logistics Last Mile
              <br />
              <span style={{ color: C.red }}>Is Stuck in 2005.</span>
            </motion.h2>

            <motion.div variants={fadeIn} className="h-px w-24 mt-4 mb-8" style={{ background: C.red + "60" }} />
          </Stagger>

          <div className="grid md:grid-cols-2 gap-12 mt-12">
            <Stagger className="space-y-6" delay={0.3}>
              {[
                { icon: Package, text: "40% of logistics cost = last-mile delivery", color: C.red },
                { icon: Clock, text: "Urban delivery times have NOT improved in 10 years", color: C.red },
                { icon: TrendingUp, text: "Drone delivery could cut cost by 80% \u2014 but regulators made it nearly impossible", color: C.accent },
                { icon: Lock, text: "Getting a drone operator license in Switzerland: 6\u201318 months", color: C.gold },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={slideRight}
                  className="flex items-start gap-4 p-4 rounded-xl border"
                  style={{ borderColor: item.color + "30", background: item.color + "08" }}
                >
                  <item.icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: item.color }} />
                  <span className="text-base md:text-lg" style={{ color: C.grayLight }}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </Stagger>

            <div className="flex flex-col items-center justify-center">
              <Stagger delay={0.6}>
                <motion.div variants={scaleUp} className="text-center">
                  <div className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: C.gray }}>
                    Cost Comparison: Last-Mile Delivery
                  </div>
                  <div className="flex items-end justify-center gap-8 mb-6">
                    <div className="text-center">
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        viewport={{ once: true }}
                        className="w-20 rounded-t-lg origin-bottom"
                        style={{ height: 180, background: C.red + "80" }}
                      />
                      <div className="text-2xl font-bold font-mono mt-3" style={{ color: C.white }}>
                        CHF 28
                      </div>
                      <div className="text-xs mt-1" style={{ color: C.gray }}>
                        Courier / hr
                      </div>
                    </div>
                    <div className="text-center">
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        viewport={{ once: true }}
                        className="w-20 rounded-t-lg origin-bottom"
                        style={{ height: 26, background: C.accent }}
                      />
                      <div className="text-2xl font-bold font-mono mt-3" style={{ color: C.white }}>
                        CHF 4
                      </div>
                      <div className="text-xs mt-1" style={{ color: C.gray }}>
                        Drone / hr
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-sm font-semibold px-4 py-2 rounded-full inline-block"
                    style={{ background: C.accent + "20", color: C.accent }}
                  >
                    86% cost reduction
                  </div>
                </motion.div>
              </Stagger>
            </div>
          </div>

          <Stagger delay={0.8}>
            <motion.blockquote
              variants={fadeUp}
              className="mt-16 text-xl md:text-2xl font-light italic text-center max-w-2xl mx-auto"
              style={{ color: C.grayLight }}
            >
              &ldquo;The technology is ready. The system is not.&rdquo;
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
              style={{ color: C.white }}
            >
              AIRBASE: The Drone
              <br />
              <span style={{ color: C.accent }}>Franchise Platform</span>
            </motion.h2>
          </Stagger>

          {/* Timeline comparison */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <Stagger delay={0.2}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ borderColor: C.red + "30", background: C.red + "08" }}
              >
                <div className="text-sm font-mono uppercase tracking-wider mb-4" style={{ color: C.red }}>
                  Traditional Path
                </div>
                <div className="space-y-3">
                  {["Regulatory application", "Safety assessments", "Multiple audits", "Insurance negotiation", "Flight permits (per-flight)"].map(
                    (step, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm" style={{ color: C.gray }}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: C.red + "60" }} />
                        {step}
                      </div>
                    )
                  )}
                </div>
                <div className="mt-6 text-4xl font-bold font-mono" style={{ color: C.red }}>
                  18 months
                </div>
              </motion.div>
            </Stagger>

            <Stagger delay={0.5}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border relative overflow-hidden"
                style={{ borderColor: C.accent + "40", background: C.accent + "08" }}
              >
                <div
                  className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl"
                  style={{ background: C.accent, color: C.white }}
                >
                  AIRBASE
                </div>
                <div className="text-sm font-mono uppercase tracking-wider mb-4" style={{ color: C.accent }}>
                  AIRBASE Path
                </div>
                <div className="space-y-3">
                  {["Sign franchise agreement", "Receive Drone-in-a-Box kit", "Complete training", "Deploy under AIRBASE LUC"].map(
                    (step, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm" style={{ color: C.grayLight }}>
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.green }} />
                        {step}
                      </div>
                    )
                  )}
                </div>
                <div className="mt-6 text-4xl font-bold font-mono" style={{ color: C.accent }}>
                  4 days
                </div>
              </motion.div>
            </Stagger>
          </div>

          <Stagger delay={0.8}>
            <motion.div
              variants={scaleUp}
              className="mt-16 text-center"
            >
              <p className="text-2xl md:text-3xl font-bold" style={{ color: C.white }}>
                We turned{" "}
                <span style={{ color: C.red }}>18 months</span> of regulatory friction into{" "}
                <span style={{ color: C.accent }}>4 days</span>.
              </p>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 4: MARKET OPPORTUNITY ═══ */}
      <section
        ref={setRef(3)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="03" text="Market Opportunity" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-4"
              style={{ color: C.white }}
            >
              A Market Ready to{" "}
              <span style={{ color: C.accent }}>Explode</span>
            </motion.h2>
          </Stagger>

          <div className="grid lg:grid-cols-3 gap-6 mt-10">
            <KpiCard
              label="Global TAM 2030"
              value={<CountUp end={58.4} prefix="$" suffix="B" decimals={1} />}
              sub="CAGR ~30%"
              icon={Globe}
              delay={0.2}
            />
            <KpiCard
              label="Swiss Market"
              value={<CountUp end={2.1} prefix="CHF " suffix="B" decimals={1} />}
              sub="Logistics + Inspection"
              icon={Target}
              delay={0.35}
            />
            <KpiCard
              label="EU Expansion TAM"
              value={<CountUp end={28} prefix="EUR " suffix="B" decimals={0} />}
              sub="DE, FR, AT, IT within 3 years"
              icon={TrendingUp}
              delay={0.5}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* TAM Growth Chart */}
            <Stagger delay={0.4}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border }}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.gray }}>
                  Global Drone Services Market ($B)
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={tamData}>
                    <defs>
                      <linearGradient id="tamGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.accent} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="year"
                      stroke={C.gray + "60"}
                      tick={{ fill: C.gray, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={C.gray + "60"}
                      tick={{ fill: C.gray, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}B`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        color: C.white,
                        fontSize: 13,
                      }}
                      formatter={(v) => [`$${v}B`, "Market Size"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={C.accent}
                      strokeWidth={2}
                      fill="url(#tamGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </Stagger>

            {/* Market bullets */}
            <Stagger delay={0.6}>
              <motion.div variants={fadeUp} className="space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.gray }}>
                  Switzerland \u2014 Our Beachhead
                </div>
                <ul className="space-y-4">
                  <Bullet delay={0}>8.7M population, ultra-dense urban corridors</Bullet>
                  <Bullet delay={0.1}>Switzerland leads EU in drone regulation readiness (BAZL)</Bullet>
                  <Bullet delay={0.2}>Average Swiss delivery wage: CHF 28/hr vs. drone: CHF 4/hr</Bullet>
                  <Bullet delay={0.3}>LUC is transferable across all EASA member states</Bullet>
                </ul>
                <motion.div
                  variants={fadeUp}
                  className="mt-8 p-4 rounded-xl border"
                  style={{ borderColor: C.gold + "30", background: C.gold + "08" }}
                >
                  <div className="text-sm font-semibold" style={{ color: C.gold }}>
                    Our Wedge
                  </div>
                  <div className="text-base mt-1" style={{ color: C.grayLight }}>
                    Franchise infrastructure that crosses borders.
                  </div>
                </motion.div>
              </motion.div>
            </Stagger>
          </div>
        </div>
      </section>

      {/* ═══ SLIDE 5: FRANCHISE MODEL ═══ */}
      <section
        ref={setRef(4)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="04" text="Business Model" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.white }}
            >
              The Drone-in-a-Box{" "}
              <span style={{ color: C.gold }}>Franchise</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg md:text-xl" style={{ color: C.gray }}>
              We&apos;re not a drone company. We&apos;re the McDonald&apos;s of drone services.
            </motion.p>
          </Stagger>

          {/* How it works steps */}
          <Stagger className="grid md:grid-cols-4 gap-4 mt-12" delay={0.3}>
            {[
              { step: "01", title: "Partner pays", desc: "CHF 45,000 franchise fee", icon: DollarSign },
              { step: "02", title: "AIRBASE delivers", desc: "Drone kit + LUC + AI platform", icon: Box },
              { step: "03", title: "Partner operates", desc: "Locally, under our umbrella", icon: Rocket },
              { step: "04", title: "Revenue split", desc: "72% partner / 28% AIRBASE", icon: BarChart3 },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="rounded-2xl p-5 border text-center"
                style={{ background: C.bgCard, borderColor: C.border }}
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-3"
                  style={{ background: C.accent + "15" }}
                >
                  <item.icon className="w-5 h-5" style={{ color: C.accent }} />
                </div>
                <div className="text-xs font-mono mb-1" style={{ color: C.accent }}>
                  {item.step}
                </div>
                <div className="text-sm font-bold" style={{ color: C.white }}>
                  {item.title}
                </div>
                <div className="text-xs mt-1" style={{ color: C.gray }}>
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </Stagger>

          {/* Unit economics */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <Stagger delay={0.5}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border }}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-6" style={{ color: C.gray }}>
                  Unit Economics Per Franchise Box
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Flights per day", value: "8", sub: "avg" },
                    { label: "Avg ticket", value: "CHF 180", sub: "" },
                    { label: "Daily gross", value: "CHF 1,440", sub: "" },
                    { label: "Monthly gross", value: "CHF 43,200", sub: "" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <span className="text-sm" style={{ color: C.gray }}>
                        {row.label}
                      </span>
                      <span className="text-lg font-bold font-mono" style={{ color: C.white }}>
                        {row.value}
                        {row.sub && (
                          <span className="text-xs font-normal ml-1" style={{ color: C.gray }}>
                            {row.sub}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="h-px" style={{ background: C.border }} />
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold" style={{ color: C.accent }}>
                      Partner net (72%)
                    </span>
                    <span className="text-xl font-bold font-mono" style={{ color: C.accent }}>
                      CHF 31,104
                      <span className="text-xs font-normal ml-1" style={{ color: C.gray }}>
                        /mo
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold" style={{ color: C.gold }}>
                      AIRBASE net (28%)
                    </span>
                    <span className="text-xl font-bold font-mono" style={{ color: C.gold }}>
                      CHF 12,096
                      <span className="text-xs font-normal ml-1" style={{ color: C.gray }}>
                        /mo
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </Stagger>

            <Stagger delay={0.7}>
              <motion.div variants={fadeUp} className="flex flex-col justify-center space-y-6">
                <div
                  className="rounded-2xl p-6 border"
                  style={{ background: C.accent + "0A", borderColor: C.accent + "30" }}
                >
                  <div className="text-sm" style={{ color: C.gray }}>
                    10 Active Franchises
                  </div>
                  <div className="text-3xl font-bold font-mono mt-1" style={{ color: C.accent }}>
                    <CountUp end={1.45} prefix="CHF " suffix="M ARR" decimals={2} />
                  </div>
                </div>
                <div
                  className="rounded-2xl p-6 border"
                  style={{ background: C.gold + "0A", borderColor: C.gold + "30" }}
                >
                  <div className="text-sm" style={{ color: C.gray }}>
                    100 Franchises
                  </div>
                  <div className="text-3xl font-bold font-mono mt-1" style={{ color: C.gold }}>
                    <CountUp end={14.5} prefix="CHF " suffix="M ARR" decimals={1} />
                  </div>
                  <div className="text-sm mt-1" style={{ color: C.gray }}>
                    Recurring. Scalable. Asset-light.
                  </div>
                </div>
              </motion.div>
            </Stagger>
          </div>
        </div>
      </section>

      {/* ═══ SLIDE 6: THE LUC MOAT ═══ */}
      <section
        ref={setRef(5)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="05" text="Unfair Advantage" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.white }}
            >
              The LUC \u2014{" "}
              <span style={{ color: C.gold }}>Our Moat</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg"
              style={{ color: C.gray }}
            >
              Switzerland&apos;s Most Valuable Drone License
            </motion.p>
          </Stagger>

          <div className="grid md:grid-cols-2 gap-12 mt-12">
            <Stagger delay={0.2}>
              <motion.div variants={fadeUp} className="space-y-6">
                <div>
                  <div className="text-sm font-semibold mb-3" style={{ color: C.gold }}>
                    What is the LUC?
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Light UAS Operator Certificate \u2014 issued by BAZL",
                      "Allows commercial drone ops in populated areas, BVLOS, and night flights",
                      "EASA-harmonized: valid across all EU member states",
                      "Without LUC: every flight needs individual permit (3\u20136 weeks each)",
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm" style={{ color: C.grayLight }}>
                        <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.gold }} />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </Stagger>

            <Stagger delay={0.5}>
              <motion.div
                variants={scaleUp}
                className="rounded-2xl p-8 border text-center"
                style={{ borderColor: C.gold + "30", background: C.gold + "08" }}
              >
                <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: C.gold }} />
                <div className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: C.gray }}>
                  LUC Holders in Switzerland
                </div>
                <div className="text-6xl md:text-7xl font-bold font-mono" style={{ color: C.gold }}>
                  &lt;12
                </div>
                <div className="text-sm mt-4" style={{ color: C.grayLight }}>
                  Barrier to entry: 12\u201318 months minimum.
                  <br />
                  Most operators never qualify.
                </div>
                <div
                  className="mt-6 inline-block px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ background: C.gold + "20", color: C.gold }}
                >
                  Structural moat \u2014 not replicable overnight
                </div>
              </motion.div>
            </Stagger>
          </div>

          <Stagger delay={0.8}>
            <motion.blockquote
              variants={fadeUp}
              className="mt-16 text-xl md:text-2xl font-light italic text-center"
              style={{ color: C.grayLight }}
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

      {/* ═══ SLIDE 7: TECHNOLOGY ═══ */}
      <section
        ref={setRef(6)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="06" text="Technology" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.white }}
            >
              AI + Human{" "}
              <span style={{ color: C.accent }}>Operating Model</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg" style={{ color: C.gray }}>
              AI runs the backend. Humans fly the drones. Zero fat in between.
            </motion.p>
          </Stagger>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* AI Layer */}
            <Stagger delay={0.3}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.accent + "08", borderColor: C.accent + "30" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="w-5 h-5" style={{ color: C.accent }} />
                  <span className="text-sm font-mono uppercase tracking-wider" style={{ color: C.accent }}>
                    AI Layer (Autonomous)
                  </span>
                </div>
                <ul className="space-y-3">
                  {[
                    "Customer acquisition & quoting (AI Offerbot)",
                    "Route optimization & weather compliance",
                    "Dispatch assignment & scheduling",
                    "Regulatory monitoring & alerts",
                    "Billing, invoicing, franchise reporting",
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: C.grayLight }}>
                      <Zap className="w-3 h-3 shrink-0" style={{ color: C.accent }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>

            {/* Human Layer */}
            <Stagger delay={0.5}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.green + "08", borderColor: C.green + "30" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5" style={{ color: C.green }} />
                  <span className="text-sm font-mono uppercase tracking-wider" style={{ color: C.green }}>
                    Human Layer (Pilots)
                  </span>
                </div>
                <ul className="space-y-3">
                  {[
                    "Certified drone pilots execute flights",
                    "No admin, no quoting, no scheduling",
                    "Pure execution = maximum flight hours",
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: C.grayLight }}>
                      <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: C.green }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Stagger>
          </div>

          {/* Efficiency metric */}
          <Stagger className="grid md:grid-cols-3 gap-6 mt-8" delay={0.6}>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-5 border text-center"
              style={{ background: C.bgCard, borderColor: C.border }}
            >
              <div className="text-xs font-mono uppercase mb-2" style={{ color: C.gray }}>
                Industry Average
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: C.red }}>
                1 : 2
              </div>
              <div className="text-xs mt-1" style={{ color: C.gray }}>
                admin-to-pilot ratio
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-5 border text-center"
              style={{ background: C.bgCard, borderColor: C.border }}
            >
              <div className="text-xs font-mono uppercase mb-2" style={{ color: C.gray }}>
                AIRBASE
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: C.accent }}>
                1 : 20
              </div>
              <div className="text-xs mt-1" style={{ color: C.gray }}>
                admin-to-pilot ratio
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-5 border text-center"
              style={{ background: C.bgCard, borderColor: C.border }}
            >
              <div className="text-xs font-mono uppercase mb-2" style={{ color: C.gray }}>
                Gross Margin Advantage
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: C.green }}>
                +22pp
              </div>
              <div className="text-xs mt-1" style={{ color: C.gray }}>
                vs. competitors
              </div>
            </motion.div>
          </Stagger>

          {/* DJI FlyCart specs */}
          <Stagger delay={0.8}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Box className="w-5 h-5" style={{ color: C.gold }} />
                <span className="text-sm font-mono uppercase tracking-wider" style={{ color: C.gold }}>
                  DJI FlyCart 100 \u2014 The Hardware
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Payload", value: "40 kg" },
                  { label: "Volume", value: "100 L" },
                  { label: "Range", value: "10 km" },
                  { label: "Protection", value: "IP54" },
                ].map((spec) => (
                  <div key={spec.label} className="text-center">
                    <div className="text-xl font-bold font-mono" style={{ color: C.white }}>
                      {spec.value}
                    </div>
                    <div className="text-xs" style={{ color: C.gray }}>
                      {spec.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 8: TRACTION ═══ */}
      <section
        ref={setRef(7)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="07" text="Traction" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.white }}
            >
              We Are Already{" "}
              <span style={{ color: C.green }}>Flying</span>
            </motion.h2>
          </Stagger>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {[
              {
                title: "Regulatory",
                color: C.gold,
                items: [
                  "LUC certification obtained (BAZL)",
                  "EASA advanced category operations qualified",
                  "3 SORA approvals filed (Transport, Cleaning, Agri)",
                ],
              },
              {
                title: "Operational",
                color: C.green,
                items: [
                  "Flights completed \u2014 zero incidents",
                  "Franchise pilot program active",
                  "Service lines: Transport, Industrial Cleaning, Agriculture",
                ],
              },
              {
                title: "Commercial",
                color: C.accent,
                items: [
                  "Signed franchise agreements in pipeline",
                  "LOIs from prospective franchise partners",
                  "Enterprise client discussions underway",
                ],
              },
              {
                title: "Technology",
                color: "#7C3AED",
                items: [
                  "AI dispatch platform live",
                  "Routes optimized via ML pipeline",
                  "Investor dashboard live at airbase.swiss/investors",
                ],
              },
            ].map((category, catIdx) => (
              <Stagger key={category.title} delay={0.2 + catIdx * 0.15}>
                <motion.div
                  variants={fadeUp}
                  className="rounded-2xl p-6 border"
                  style={{ background: category.color + "06", borderColor: category.color + "25" }}
                >
                  <div className="text-sm font-mono uppercase tracking-wider mb-4" style={{ color: category.color }}>
                    {category.title}
                  </div>
                  <ul className="space-y-3">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm" style={{ color: C.grayLight }}>
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: category.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Stagger>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SLIDE 9: TEAM ═══ */}
      <section
        ref={setRef(8)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="08" text="Team" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.white }}
            >
              The <span style={{ color: C.accent }}>Team</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg" style={{ color: C.gray }}>
              Operators. Regulators. Builders.
            </motion.p>
          </Stagger>

          <Stagger className="grid md:grid-cols-3 gap-6 mt-12" delay={0.3}>
            {[
              {
                role: "CEO & Founder",
                title: "Chief Architect",
                quote: "Built from a Billion-Dollar-Mindset. Swiss precision, Silicon Valley speed.",
                tags: ["Drone Operations", "Strategy", "Swiss Market"],
              },
              {
                role: "CTO",
                title: "Chief Technology Officer",
                quote: "The AI infrastructure that runs AIRBASE is our second moat.",
                tags: ["AI / ML", "Software", "Logistics Tech"],
              },
              {
                role: "CMO",
                title: "Chief Marketing Officer",
                quote: "We don't chase customers. We build systems that attract them.",
                tags: ["Brand", "Growth", "B2B Sales"],
              },
            ].map((person) => (
              <motion.div
                key={person.role}
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ background: C.accent + "15" }}
                >
                  <Users className="w-7 h-7" style={{ color: C.accent }} />
                </div>
                <div className="text-lg font-bold" style={{ color: C.white }}>
                  {person.role}
                </div>
                <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: C.accent }}>
                  {person.title}
                </div>
                <p className="text-sm mt-3 italic" style={{ color: C.grayLight }}>
                  &ldquo;{person.quote}&rdquo;
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {person.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-md"
                      style={{ background: C.accent + "15", color: C.accent }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </Stagger>

          <Stagger delay={0.6}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-4 h-4" style={{ color: C.gold }} />
                <span className="text-sm font-mono uppercase tracking-wider" style={{ color: C.gold }}>
                  SORA / Legal Lead
                </span>
              </div>
              <p className="text-sm" style={{ color: C.grayLight }}>
                BAZL certified. EASA regulatory expertise. SORA applications and compliance from day one.
              </p>
            </motion.div>
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 10: FINANCIAL PROJECTIONS ═══ */}
      <section
        ref={setRef(9)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <SlideLabel number="09" text="Financial Projections" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.white }}
            >
              The Path to{" "}
              <span style={{ color: C.accent }}>CHF 12.4M ARR</span>
            </motion.h2>
          </Stagger>

          {/* Year cards */}
          <Stagger className="grid md:grid-cols-3 gap-6 mt-10" delay={0.2}>
            {[
              { year: "Year 1", boxes: "10", rev: "1.45M", ebitda: "CHF 560K", margin: "" },
              { year: "Year 2", boxes: "35", rev: "5.1M", ebitda: "38%", margin: "EBITDA margin" },
              { year: "Year 3", boxes: "85", rev: "12.4M", ebitda: "52%", margin: "EBITDA margin" },
            ].map((yr) => (
              <motion.div
                key={yr.year}
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border }}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.accent }}>
                  {yr.year}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs" style={{ color: C.gray }}>
                      Active Boxes
                    </div>
                    <div className="text-2xl font-bold font-mono" style={{ color: C.white }}>
                      {yr.boxes}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: C.gray }}>
                      Revenue
                    </div>
                    <div className="text-2xl font-bold font-mono" style={{ color: C.accent }}>
                      CHF {yr.rev}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: C.gray }}>
                      {yr.margin || "EBITDA"}
                    </div>
                    <div className="text-xl font-bold font-mono" style={{ color: C.green }}>
                      {yr.ebitda}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Stagger>

          {/* Revenue chart */}
          <Stagger delay={0.5}>
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl p-6 border"
              style={{ background: C.bgCard, borderColor: C.border }}
            >
              <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.gray }}>
                Revenue & Franchise Growth Trajectory
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueProjection} barCategoryGap="15%">
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.accent} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={C.accent} stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="quarter"
                    stroke={C.gray + "60"}
                    tick={{ fill: C.gray, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    yAxisId="rev"
                    stroke={C.gray + "60"}
                    tick={{ fill: C.gray, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}M`}
                    orientation="left"
                  />
                  <YAxis
                    yAxisId="boxes"
                    stroke={C.gray + "60"}
                    tick={{ fill: C.gold, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    orientation="right"
                  />
                  <Tooltip
                    contentStyle={{
                      background: C.bgCard,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      color: C.white,
                      fontSize: 13,
                    }}
                    formatter={(v, name) => [
                      name === "revenue" ? `CHF ${v}M` : `${v} boxes`,
                      name === "revenue" ? "Revenue" : "Franchise Boxes",
                    ]}
                  />
                  <Bar
                    yAxisId="rev"
                    dataKey="revenue"
                    fill="url(#revGrad)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="boxes"
                    type="monotone"
                    dataKey="boxes"
                    stroke={C.gold}
                    strokeWidth={2}
                    dot={{ fill: C.gold, r: 3 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </Stagger>

          {/* Key unit economics */}
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8" delay={0.7}>
            {[
              { label: "CAC (Franchise)", value: "CHF 4,200" },
              { label: "LTV", value: "CHF 289K+" },
              { label: "LTV:CAC", value: "68:1" },
              { label: "Payback", value: "4 months" },
            ].map((m) => (
              <motion.div
                key={m.label}
                variants={fadeUp}
                className="rounded-xl p-4 border text-center"
                style={{ background: C.bgCard, borderColor: C.border }}
              >
                <div className="text-xs font-mono uppercase" style={{ color: C.gray }}>
                  {m.label}
                </div>
                <div className="text-lg font-bold font-mono mt-1" style={{ color: C.white }}>
                  {m.value}
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ SLIDE 11: THE ASK ═══ */}
      <section
        ref={setRef(10)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SlideLabel number="10" text="The Ask" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.white }}
            >
              Raising{" "}
              <span style={{ color: C.accent }}>CHF 2.5M</span>{" "}
              Seed Round
            </motion.h2>
          </Stagger>

          <div className="grid md:grid-cols-2 gap-12 mt-12">
            {/* Fund allocation pie */}
            <Stagger delay={0.3}>
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6 border"
                style={{ background: C.bgCard, borderColor: C.border }}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: C.gray }}>
                  Use of Funds
                </div>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={fundAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
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
                          color: C.white,
                          fontSize: 13,
                        }}
                        formatter={(v, _, props) => {
                          const p = props as unknown as { payload: { name: string; amount: string } };
                          return [`CHF ${p.payload.amount} (${v}%)`, p.payload.name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {fundAllocation.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                        <span style={{ color: C.grayLight }}>{item.name}</span>
                      </div>
                      <span className="font-mono" style={{ color: C.white }}>
                        CHF {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Stagger>

            {/* What this unlocks */}
            <Stagger delay={0.5}>
              <motion.div variants={fadeUp} className="space-y-6">
                <div className="text-sm font-mono uppercase tracking-wider" style={{ color: C.accent }}>
                  What This Unlocks
                </div>
                <ul className="space-y-4">
                  <Bullet delay={0}>25 active franchise boxes by Month 18</Bullet>
                  <Bullet delay={0.1}>CHF 3.6M ARR run-rate by Month 18</Bullet>
                  <Bullet delay={0.2}>Market-dominant position before regulatory window closes</Bullet>
                  <Bullet delay={0.3}>Series A ready: proven unit economics + EU expansion data</Bullet>
                </ul>

                <div className="space-y-4 mt-8">
                  <div
                    className="rounded-xl p-4 border"
                    style={{ borderColor: C.accent + "30", background: C.accent + "08" }}
                  >
                    <div className="text-xs" style={{ color: C.gray }}>
                      Pre-Money Valuation
                    </div>
                    <div className="text-3xl font-bold font-mono" style={{ color: C.accent }}>
                      CHF 8.5M
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl p-4 border" style={{ borderColor: C.border, background: C.bgCard }}>
                      <div className="text-xs" style={{ color: C.gray }}>
                        Instrument
                      </div>
                      <div className="text-sm font-bold mt-1" style={{ color: C.white }}>
                        SAFE or Equity
                      </div>
                    </div>
                    <div className="rounded-xl p-4 border" style={{ borderColor: C.border, background: C.bgCard }}>
                      <div className="text-xs" style={{ color: C.gray }}>
                        Min. Ticket
                      </div>
                      <div className="text-sm font-bold mt-1" style={{ color: C.white }}>
                        CHF 250K
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Stagger>
          </div>
        </div>
      </section>

      {/* ═══ SLIDE 12: WHY NOW / VISION ═══ */}
      <section
        ref={setRef(11)}
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20"
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,102,255,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto w-full">
          <SlideLabel number="11" text="Why Now" />

          <Stagger>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: C.white }}
            >
              Why AIRBASE.{" "}
              <span style={{ color: C.accent }}>Why Now.</span>
            </motion.h2>
          </Stagger>

          <Stagger className="space-y-4 mt-12" delay={0.3}>
            {[
              {
                icon: Globe,
                text: "The EU drone regulatory framework (U-Space) launched 2023. The window to establish infrastructure dominance is 2024\u20132026. After that, the window closes.",
              },
              {
                icon: Cpu,
                text: "AI has made autonomous dispatch economically viable for the first time. Two years ago this operating model was not possible.",
              },
              {
                icon: Box,
                text: "DJI FlyCart 100 changed the payload equation. Transport, cleaning, and agriculture are now viable \u2014 simultaneously.",
              },
              {
                icon: MapPin,
                text: "Switzerland is the perfect beachhead: highest labor costs in Europe = highest drone ROI. Most LUC-friendly regulatory environment in EASA zone.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={slideRight}
                className="flex items-start gap-4 p-5 rounded-xl border"
                style={{ borderColor: C.accent + "20", background: C.accent + "06" }}
              >
                <item.icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.accent }} />
                <span className="text-base md:text-lg leading-relaxed" style={{ color: C.grayLight }}>
                  {item.text}
                </span>
              </motion.div>
            ))}
          </Stagger>

          {/* Vision 2030 */}
          <Stagger delay={0.7}>
            <motion.div
              variants={scaleUp}
              className="mt-16 rounded-2xl p-8 border text-center"
              style={{
                borderColor: C.gold + "30",
                background: `linear-gradient(135deg, ${C.gold}08 0%, ${C.accent}08 100%)`,
              }}
            >
              <div className="text-xs font-mono uppercase tracking-[0.3em] mb-6" style={{ color: C.gold }}>
                Vision 2030
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { value: "500+", label: "Franchise Boxes" },
                  { value: "5", label: "Countries" },
                  { value: "CHF 72M", label: "ARR Target" },
                  { value: "55%+", label: "EBITDA Margin" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-2xl md:text-3xl font-bold font-mono" style={{ color: C.white }}>
                      {m.value}
                    </div>
                    <div className="text-xs mt-1" style={{ color: C.gray }}>
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
              <p className="text-lg" style={{ color: C.grayLight }}>
                We are not building a drone company.
              </p>
              <p className="text-2xl md:text-4xl font-bold" style={{ color: C.white }}>
                We are building the operating system
                <br />
                for the <span style={{ color: C.accent }}>drone economy</span>.
              </p>
              <div className="pt-8">
                <div className="text-3xl md:text-5xl font-bold" style={{ color: C.gold }}>
                  Order Today. Fly Tomorrow.
                </div>
              </div>
              <div className="pt-8 text-xs font-mono" style={{ color: C.gray }}>
                airbase.swiss &mdash; Confidential
              </div>
            </motion.div>
          </Stagger>
        </div>
      </section>
    </div>
  );
}
