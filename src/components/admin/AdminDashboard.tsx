"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { DEMO_BOOKINGS, DEMO_DRONES, DEMO_FRANCHISE_PARTNERS, DEMO_AUTHORIZATIONS, DEMO_AREA_DATA, DEMO_INCIDENTS, DEMO_FLIGHTS } from "@/lib/demo-data";
import { ConnectionStatus } from "@/components/mission-control/ConnectionStatus";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  Package,
  TrendingUp,
  Plane,
  FileText,
  AlertCircle,
  Users,
  BarChart3,
  Settings,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Compass,
  ChevronRight,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Eye,
  Activity,
  Radio,
  Radar,
  Gauge,
  Battery,
  Navigation,
  CircleDot,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Building2,
  DollarSign,
  Receipt,
  PiggyBank,
  Wallet,
  CreditCard,
  Calculator,
  Target,
  Wrench,
  ThermometerSun,
  RotateCcw,
  Cog,
  Bell,
  Search,
  User,
  Hash,
  Globe,
  Award,
  Shield,
  HeartPulse,
  Scale,
  Hammer,
  Timer,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  FileCheck,
  BookOpen,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type AdminSection =
  | "overview"
  | "analytics"
  | "buchhaltung"
  | "safety"
  | "fleet"
  | "team"
  | "mitarbeiter";

// ─── Demo Data ──────────────────────────────────────────────────────────────

const DEMO_EMPLOYEES = [
  {
    name: "Hans Müller", role: "Pilot / PIC", contract: "Unbefristet", pensum: "100%",
    status: "aktiv" as const, hoursThisMonth: 156.5, hoursSoll: 168,
    vacationTotal: 25, vacationUsed: 7, vacationPending: 12, sickDays: 2,
    absentToday: false, salary: 8200, certExpiry: "2027-03-15", since: "2024-06-01",
  },
  {
    name: "Sarah Weber", role: "Pilotin / PIC", contract: "Unbefristet", pensum: "100%",
    status: "aktiv" as const, hoursThisMonth: 162.0, hoursSoll: 168,
    vacationTotal: 25, vacationUsed: 5, vacationPending: 5, sickDays: 0,
    absentToday: false, salary: 8200, certExpiry: "2027-06-30", since: "2024-08-15",
  },
  {
    name: "Marco Brunner", role: "Pilot / PIC", contract: "Unbefristet", pensum: "80%",
    status: "aktiv" as const, hoursThisMonth: 120.0, hoursSoll: 134.4,
    vacationTotal: 25, vacationUsed: 10, vacationPending: 0, sickDays: 3,
    absentToday: false, salary: 6560, certExpiry: "2026-12-01", since: "2024-03-01",
  },
  {
    name: "Lisa Keller", role: "Pilotin / PIC", contract: "Befristet", pensum: "100%",
    status: "aktiv" as const, hoursThisMonth: 148.0, hoursSoll: 168,
    vacationTotal: 20, vacationUsed: 3, vacationPending: 10, sickDays: 1,
    absentToday: true, salary: 7800, certExpiry: "2027-01-20", since: "2025-01-10",
  },
  {
    name: "Thomas Frei", role: "Safety Manager", contract: "Unbefristet", pensum: "100%",
    status: "aktiv" as const, hoursThisMonth: 170.0, hoursSoll: 168,
    vacationTotal: 25, vacationUsed: 8, vacationPending: 5, sickDays: 0,
    absentToday: false, salary: 9500, certExpiry: "2027-09-01", since: "2024-01-15",
  },
  {
    name: "Anna Roth", role: "Safety Managerin", contract: "Unbefristet", pensum: "60%",
    status: "aktiv" as const, hoursThisMonth: 95.5, hoursSoll: 100.8,
    vacationTotal: 25, vacationUsed: 12, vacationPending: 0, sickDays: 4,
    absentToday: false, salary: 5700, certExpiry: "2027-04-15", since: "2024-09-01",
  },
  {
    name: "Petra Zimmermann", role: "Operations Manager", contract: "Unbefristet", pensum: "100%",
    status: "aktiv" as const, hoursThisMonth: 165.0, hoursSoll: 168,
    vacationTotal: 25, vacationUsed: 4, vacationPending: 8, sickDays: 1,
    absentToday: false, salary: 9200, certExpiry: "—", since: "2024-02-01",
  },
  {
    name: "Daniel Huber", role: "Drohnen-Techniker", contract: "Unbefristet", pensum: "100%",
    status: "aktiv" as const, hoursThisMonth: 158.0, hoursSoll: 168,
    vacationTotal: 25, vacationUsed: 6, vacationPending: 3, sickDays: 0,
    absentToday: false, salary: 7200, certExpiry: "—", since: "2024-05-01",
  },
];

const DEMO_MONTHLY_FINANCES = [
  { month: "Nov 25", revenue: 42800, costs: 31200, margin: 11600 },
  { month: "Dez 25", revenue: 38500, costs: 29800, margin: 8700 },
  { month: "Jan 26", revenue: 35200, costs: 28500, margin: 6700 },
  { month: "Feb 26", revenue: 48900, costs: 32100, margin: 16800 },
  { month: "Mär 26", revenue: 56200, costs: 34800, margin: 21400 },
  { month: "Apr 26", revenue: 52400, costs: 33200, margin: 19200 },
];

const DEMO_COST_BREAKDOWN = [
  { category: "Personal", amount: 18200, pct: 54.8, color: "bg-red-500" },
  { category: "Drohnen-Leasing", amount: 4800, pct: 14.5, color: "bg-blue-500" },
  { category: "Wartung & Ersatzteile", amount: 3200, pct: 9.6, color: "bg-amber-500" },
  { category: "Versicherung", amount: 2800, pct: 8.4, color: "bg-purple-500" },
  { category: "Infrastruktur & Hub", amount: 2400, pct: 7.2, color: "bg-cyan-500" },
  { category: "Marketing & Vertrieb", amount: 1800, pct: 5.4, color: "bg-green-500" },
];

const DEMO_INVOICES_ADMIN = [
  { id: "INV-2026-041", customer: "Alpine Logistics AG", amount: 2450, status: "bezahlt", date: "2026-04-15", due: "2026-04-30" },
  { id: "INV-2026-042", customer: "Bergbahnen Grindelwald", amount: 1890, status: "offen", date: "2026-04-16", due: "2026-05-01" },
  { id: "INV-2026-043", customer: "Gemeinde Lauterbrunnen", amount: 3200, status: "offen", date: "2026-04-17", due: "2026-05-02" },
  { id: "INV-2026-044", customer: "Swiss Solar AG", amount: 780, status: "bezahlt", date: "2026-04-17", due: "2026-05-02" },
  { id: "INV-2026-045", customer: "Jungfraubahnen Management", amount: 5600, status: "überfällig", date: "2026-03-28", due: "2026-04-12" },
  { id: "INV-2026-046", customer: "Alpen Bau GmbH", amount: 1450, status: "offen", date: "2026-04-18", due: "2026-05-03" },
  { id: "INV-2026-047", customer: "Hotel Bellevue Wengen", amount: 920, status: "bezahlt", date: "2026-04-10", due: "2026-04-25" },
];

const DEMO_MAINTENANCE_LOG = [
  { drone: "FC100-CH-001", task: "Propeller-Wechsel (alle 8)", date: "2026-04-18", status: "erledigt", nextDue: "2026-07-18", tech: "Daniel Huber" },
  { drone: "FC100-CH-002", task: "Batterie-Kalibrierung DB2160", date: "2026-04-15", status: "erledigt", nextDue: "2026-05-15", tech: "Daniel Huber" },
  { drone: "FC100-CH-003", task: "LiDAR-Sensor Reinigung", date: "2026-04-12", status: "erledigt", nextDue: "2026-05-12", tech: "Daniel Huber" },
  { drone: "FC100-CH-001", task: "100h-Inspektion (Rahmen, Motoren, Avionik)", date: "2026-04-20", status: "geplant", nextDue: "—", tech: "Daniel Huber" },
  { drone: "FC100-CH-004", task: "Fallschirm E2MSF-100A Inspektion", date: "2026-04-22", status: "geplant", nextDue: "—", tech: "Daniel Huber" },
  { drone: "FC100-CH-002", task: "mmWave Radar Firmware-Update", date: "2026-04-25", status: "geplant", nextDue: "—", tech: "Daniel Huber" },
];

// ─── Sidebar ────────────────────────────────────────────────────────────────

const MENU_ITEMS: { id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
  { id: "overview", label: "Firmenübersicht", icon: Building2, group: "Management" },
  { id: "analytics", label: "Analytics & KPIs", icon: BarChart3, group: "Management" },
  { id: "buchhaltung", label: "Buchhaltung", icon: Calculator, group: "Finanzen" },
  { id: "safety", label: "Safety & Compliance", icon: ShieldCheck, group: "Betrieb" },
  { id: "fleet", label: "Flottenmanagement", icon: Plane, group: "Betrieb" },
  { id: "team", label: "Team & Franchise", icon: Users, group: "Personal" },
  { id: "mitarbeiter", label: "Mitarbeiter-Übersicht", icon: Briefcase, group: "Personal" },
];

function AdminSidebar({ activeSection, onNavigate }: { activeSection: AdminSection; onNavigate: (s: AdminSection) => void }) {
  const groups = ["Management", "Finanzen", "Betrieb", "Personal"];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg tracking-tight leading-none">AIRBASE</div>
            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Admin Dashboard</div>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="px-5 pb-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3 border border-red-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">VSNZ GmbH</p>
              <p className="text-[10px] text-gray-500">Admin · BAZL · EASA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {groups.map((group) => {
          const items = MENU_ITEMS.filter((m) => m.group === group);
          return (
            <div key={group}>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-4 first:mt-2">{group}</p>
              {items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                      isActive
                        ? "bg-red-50 text-red-700 font-semibold"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-4">Portale</p>
          {[
            { href: "/dashboard", icon: Users, label: "Kundenportal" },
            { href: "/pilot", icon: Compass, label: "Pilot Cockpit" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all mb-0.5"
            >
              <item.icon className="w-4 h-4 text-gray-400" />
              {item.label}
              <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
            </a>
          ))}
        </div>
      </nav>

      {/* System Status Footer */}
      <div className="px-4 pb-6">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold text-emerald-600">SYSTEM AKTIV</span>
          </div>
          <p className="text-[10px] text-gray-500">BAZL · LFG SR 748.0 · EASA</p>
          <p className="text-[10px] text-gray-400">LUC CH-0042 · gültig bis 2027</p>
        </div>
      </div>
    </aside>
  );
}

// ─── Top Bar ────────────────────────────────────────────────────────────────

function AdminTopBar({ title, subtitle }: { title: string; subtitle: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    function tick() { setTime(new Date().toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })); }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <p className="text-[10px] text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <ConnectionStatus />
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Suchen..."
            className="w-64 bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-red-600">{time}</span>
          <span className="text-[10px] text-gray-400 font-mono">UTC+2</span>
        </div>
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-red-600" />
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(dt: Date | string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCHF(v: number) {
  return `CHF ${v.toLocaleString("de-CH", { minimumFractionDigits: 0 })}`;
}

// ─── KPI Card (Light Theme) ────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, color = "red", trend }: {
  title: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "red" | "green" | "amber" | "blue" | "purple" | "indigo" | "cyan" | "rose";
  trend?: { value: string; positive: boolean };
}) {
  const styles: Record<string, { icon: string; border: string; bg: string }> = {
    red: { icon: "bg-red-50 text-red-600 border-red-100", border: "border-l-red-500", bg: "bg-white" },
    green: { icon: "bg-emerald-50 text-emerald-600 border-emerald-100", border: "border-l-emerald-500", bg: "bg-white" },
    amber: { icon: "bg-amber-50 text-amber-600 border-amber-100", border: "border-l-amber-500", bg: "bg-white" },
    blue: { icon: "bg-blue-50 text-blue-600 border-blue-100", border: "border-l-blue-500", bg: "bg-white" },
    purple: { icon: "bg-purple-50 text-purple-600 border-purple-100", border: "border-l-purple-500", bg: "bg-white" },
    indigo: { icon: "bg-indigo-50 text-indigo-600 border-indigo-100", border: "border-l-indigo-500", bg: "bg-white" },
    cyan: { icon: "bg-cyan-50 text-cyan-600 border-cyan-100", border: "border-l-cyan-500", bg: "bg-white" },
    rose: { icon: "bg-rose-50 text-rose-600 border-rose-100", border: "border-l-rose-500", bg: "bg-white" },
  };
  const c = styles[color];
  return (
    <div className={`${c.bg} rounded-xl border-l-4 ${c.border} border border-gray-200 px-4 py-3 shadow-sm`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${c.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-xl font-bold text-gray-900 font-mono">{value}</p>
        {trend && (
          <span className={`text-[10px] font-semibold mb-0.5 flex items-center gap-0.5 ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
            {trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, icon: Icon, children, action }: {
  title: string; subtitle?: string; icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-red-500" />}
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Section: Firmenübersicht ──────────────────────────────────────────────

function OverviewSection() {
  const activeFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air" || f.status === "pre_flight_check").length;
  const totalBookings = DEMO_BOOKINGS.length;
  const completedBookings = DEMO_BOOKINGS.filter((b) => b.status === "completed").length;
  const activeDrones = DEMO_DRONES.filter((d) => d.isActive).length;
  const openIncidents = DEMO_INCIDENTS.filter((i) => i.status !== "resolved").length;
  const franchisePartners = DEMO_FRANCHISE_PARTNERS.length;
  const totalRevenue = DEMO_MONTHLY_FINANCES.reduce((s, m) => s + m.revenue, 0);
  const totalMargin = DEMO_MONTHLY_FINANCES.reduce((s, m) => s + m.margin, 0);
  const avgMarginPct = Math.round((totalMargin / totalRevenue) * 100);
  const totalEmployees = DEMO_EMPLOYEES.length;
  const absentToday = DEMO_EMPLOYEES.filter((e) => e.absentToday).length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard title="Aktive Flüge" value={activeFlights} icon={Plane} color="red" sub="Live-Überwachung aktiv" />
        <KpiCard title="Buchungen (Monat)" value={totalBookings} icon={Package} color="blue" trend={{ value: "12%", positive: true }} />
        <KpiCard title="Umsatz (6M)" value={formatCHF(totalRevenue)} icon={TrendingUp} color="green" trend={{ value: "23%", positive: true }} />
        <KpiCard title="Ø Marge" value={`${avgMarginPct}%`} icon={Target} color="purple" trend={{ value: "3.2%", positive: true }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard title="Drohnen aktiv" value={`${activeDrones} / ${DEMO_DRONES.length}`} icon={Plane} color="indigo" sub="DJI FlyCart 100 Flotte" />
        <KpiCard title="Franchise-Partner" value={franchisePartners} icon={Globe} color="cyan" sub={`${DEMO_FRANCHISE_PARTNERS.reduce((s, p) => s + p.droneCount, 0)} ext. Drohnen`} />
        <KpiCard title="Mitarbeiter" value={`${totalEmployees - absentToday} / ${totalEmployees}`} icon={Users} color="amber" sub={absentToday > 0 ? `${absentToday} abwesend heute` : "Alle anwesend"} />
        <KpiCard title="Offene Vorfälle" value={openIncidents} icon={AlertCircle} color={openIncidents > 0 ? "rose" : "green"} sub="Safety-Incidents" />
      </div>

      {/* Quick Status Panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend Mini */}
        <SectionCard title="Umsatz-Trend" subtitle="Letzte 6 Monate" icon={TrendingUp}>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={DEMO_MONTHLY_FINANCES} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorRevOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", background: "#fff", border: "1px solid #e5e7eb", color: "#111" }} formatter={(v) => formatCHF(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fill="url(#colorRevOverview)" name="Umsatz" />
                <Area type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2} fill="transparent" name="Marge" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Active Flights Summary */}
        <SectionCard title="Live-Flüge" subtitle="Echtzeit-Status" icon={Radar}>
          <div className="divide-y divide-gray-100">
            {DEMO_FLIGHTS.filter((f) => f.status === "in_air").length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">Keine aktiven Flüge — Luftraum frei</div>
            ) : (
              DEMO_FLIGHTS.filter((f) => f.status === "in_air").map((flight) => (
                <div key={flight.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-900">{flight.booking.identifier}</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">IN DER LUFT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-[9px] text-gray-400">Pilot</p>
                      <p className="text-xs font-semibold text-gray-700">{flight.booking.pilotName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-[9px] text-gray-400">Distanz</p>
                      <p className="text-xs font-bold text-gray-700 font-mono">{flight.booking.routeDistanceKm} km</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-[9px] text-gray-400">Batterie</p>
                      <p className="text-xs font-bold text-emerald-600 font-mono">92%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Team Status */}
        <SectionCard title="Team-Status" subtitle="Verfügbarkeit heute" icon={Users}>
          <div className="divide-y divide-gray-100">
            {DEMO_EMPLOYEES.slice(0, 6).map((emp) => (
              <div key={emp.name} className="px-5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${emp.absentToday ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"}`}>
                    <User className={`w-3.5 h-3.5 ${emp.absentToday ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{emp.name}</p>
                    <p className="text-[10px] text-gray-400">{emp.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  emp.absentToday ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}>
                  {emp.absentToday ? "Abwesend" : "Aktiv"}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent Incidents */}
      <SectionCard title="Letzte Vorfälle" subtitle="Safety-Register" icon={AlertTriangle}
        action={<span className="text-[10px] text-gray-400">{DEMO_INCIDENTS.length} Einträge</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Datum", "Vorfall", "Schweregrad", "Status", "Pilot"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DEMO_INCIDENTS.slice(0, 4).map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-2.5 text-gray-500 text-xs font-mono whitespace-nowrap">{formatDateTime(inc.date)}</td>
                  <td className="px-5 py-2.5"><p className="text-gray-900 font-medium text-xs">{inc.title}</p></td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      inc.severity === "low" ? "bg-gray-100 text-gray-500" : inc.severity === "medium" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    }`}>{inc.severity === "low" ? "Gering" : inc.severity === "medium" ? "Mittel" : "Hoch"}</span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      inc.status === "resolved" ? "bg-emerald-50 text-emerald-600" : inc.status === "under_review" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    }`}>{inc.status === "resolved" ? "Behoben" : inc.status === "under_review" ? "In Prüfung" : "Offen"}</span>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-gray-500">{inc.pilot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Section: Analytics ────────────────────────────────────────────────────

const CHART_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
const STATUS_LABELS: Record<string, string> = { draft: "Entwurf", pending: "Ausstehend", quoted: "Angeboten", confirmed: "Bestätigt", in_progress: "In Bearbeitung", completed: "Abgeschlossen", cancelled: "Storniert" };
const SERVICE_LABELS: Record<string, string> = { LASTENFLUG: "Lastenflug", PERSONENFLUG: "Personenflug", INSPEKTION: "Inspektion" };

function AnalyticsSection() {
  const overviewQ = trpc.analytics.overview.useQuery();
  const timelineQ = trpc.analytics.bookingsOverTime.useQuery({ days: 90 });
  const routesQ = trpc.analytics.popularRoutes.useQuery();
  const serviceQ = trpc.analytics.serviceTypeBreakdown.useQuery();
  const payloadQ = trpc.analytics.avgPayloadWeight.useQuery();
  const isLoading = overviewQ.isLoading || timelineQ.isLoading || serviceQ.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-5 gap-4">{[...Array(5)].map((_, i) => (<div key={i} className="bg-white rounded-xl border border-gray-200 h-24" />))}</div>
        <div className="bg-white rounded-xl border border-gray-200 h-72" />
      </div>
    );
  }

  const ov = overviewQ.data;
  const timeline = timelineQ.data ?? [];
  const routes = routesQ.data ?? [];
  const services = serviceQ.data ?? [];
  const payload = payloadQ.data;

  const statusPieData = Object.entries(ov?.bookingsByStatus ?? {}).filter(([, v]) => v > 0).map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v }));
  const serviceBarData = services.map((s) => ({ name: SERVICE_LABELS[s.serviceType] ?? s.serviceType, Buchungen: s.count, "Umsatz (CHF)": Math.round(s.revenue) }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard title="Buchungen gesamt" value={ov?.totalBookings ?? 0} icon={Package} color="red" trend={{ value: "12%", positive: true }} />
        <KpiCard title="Umsatz" value={formatCHF(ov?.totalRevenueCHF ?? 0)} icon={TrendingUp} color="green" trend={{ value: "8%", positive: true }} />
        <KpiCard title="Flüge" value={`${ov?.completedFlights ?? 0} / ${ov?.totalFlights ?? 0}`} sub="abgeschlossen / gesamt" icon={Plane} color="indigo" />
        <KpiCard title="Ø Nutzlast" value={payload ? `${payload.avg} kg` : "—"} sub={payload ? `Min ${payload.min} kg · Max ${payload.max} kg` : undefined} icon={Truck} color="amber" />
        <KpiCard title="Offene Rechnungen" value={ov?.unpaidInvoicesCount ?? 0} sub={ov?.unpaidInvoicesTotalCHF ? `CHF ${ov.unpaidInvoicesTotalCHF.toLocaleString("de-CH")}` : undefined} icon={FileText} color={ov && ov.unpaidInvoicesCount > 0 ? "rose" : "green"} />
      </div>

      {/* Revenue Chart */}
      <SectionCard title="Buchungen & Umsatz (letzte 90 Tage)" icon={BarChart3}
        action={<span className="text-[10px] text-gray-400">{timeline.length} Datenpunkte</span>}
      >
        <div className="p-6">
          {timeline.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2"><AlertCircle className="w-4 h-4" />Noch keine Daten</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorBookAdmin" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.15} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth() + 1}.`; }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `${v} CHF`} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", background: "#fff", border: "1px solid #e5e7eb", color: "#111" }} labelFormatter={(l) => new Date(l).toLocaleDateString("de-CH")} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
                <Area yAxisId="left" type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} fill="url(#colorBookAdmin)" name="Buchungen" />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fill="url(#colorRevAdmin)" name="Umsatz (CHF)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </SectionCard>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking Status Pie */}
        <SectionCard title="Buchungen nach Status" icon={Activity}>
          <div className="p-5">
            {statusPieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2"><AlertCircle className="w-4 h-4" />Keine Buchungen</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusPieData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", background: "#fff", border: "1px solid #e5e7eb", color: "#111" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        {/* Service Types */}
        <SectionCard title="Leistungsarten" icon={BarChart3}>
          <div className="p-5">
            {serviceBarData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2"><AlertCircle className="w-4 h-4" />Keine Daten</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={serviceBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", background: "#fff", border: "1px solid #e5e7eb", color: "#111" }} />
                  <Bar dataKey="Buchungen" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        {/* Popular Routes */}
        <SectionCard title="Häufigste Lieferadressen" icon={MapPin}>
          <div className="p-5">
            {routes.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-gray-400 text-sm gap-2"><AlertCircle className="w-4 h-4" />Keine Daten</div>
            ) : (
              <div className="space-y-3">
                {routes.map((route, i) => {
                  const maxCount = routes[0]?.count ?? 1;
                  const pct = Math.round((route.count / maxCount) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-700 truncate flex-1">{route.address}</span>
                        <span className="text-xs font-semibold text-gray-500 ml-2">{route.count}x</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Section: Buchhaltung ──────────────────────────────────────────────────

function BuchhaltungSection() {
  const latestMonth = DEMO_MONTHLY_FINANCES[DEMO_MONTHLY_FINANCES.length - 1];
  const prevMonth = DEMO_MONTHLY_FINANCES[DEMO_MONTHLY_FINANCES.length - 2];
  const revChange = Math.round(((latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100);
  const totalPaid = DEMO_INVOICES_ADMIN.filter((i) => i.status === "bezahlt").reduce((s, i) => s + i.amount, 0);
  const totalOpen = DEMO_INVOICES_ADMIN.filter((i) => i.status === "offen").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = DEMO_INVOICES_ADMIN.filter((i) => i.status === "überfällig").reduce((s, i) => s + i.amount, 0);
  const totalCosts = DEMO_COST_BREAKDOWN.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard title="Umsatz (Apr)" value={formatCHF(latestMonth.revenue)} icon={TrendingUp} color="green" trend={{ value: `${revChange}%`, positive: revChange >= 0 }} />
        <KpiCard title="Kosten (Apr)" value={formatCHF(latestMonth.costs)} icon={Wallet} color="amber" />
        <KpiCard title="Marge (Apr)" value={formatCHF(latestMonth.margin)} sub={`${Math.round((latestMonth.margin / latestMonth.revenue) * 100)}% Nettomarge`} icon={Target} color="purple" />
        <KpiCard title="Offene Rechnungen" value={formatCHF(totalOpen)} sub={`${DEMO_INVOICES_ADMIN.filter((i) => i.status === "offen").length} Rechnungen`} icon={FileText} color="blue" />
        <KpiCard title="Überfällig" value={formatCHF(totalOverdue)} sub={`${DEMO_INVOICES_ADMIN.filter((i) => i.status === "überfällig").length} Rechnungen`} icon={AlertCircle} color={totalOverdue > 0 ? "rose" : "green"} />
      </div>

      {/* Revenue / Cost / Margin Chart */}
      <SectionCard title="Umsatz, Kosten & Marge (6 Monate)" icon={BarChart3}>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={DEMO_MONTHLY_FINANCES} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", background: "#fff", border: "1px solid #e5e7eb", color: "#111" }} formatter={(v) => formatCHF(Number(v))} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
              <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} name="Umsatz" />
              <Bar dataKey="costs" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Kosten" />
              <Bar dataKey="margin" fill="#10b981" radius={[4, 4, 0, 0]} name="Marge" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <SectionCard title="Kostenaufschlüsselung (April)" icon={Calculator}
          action={<span className="text-xs font-bold text-gray-700">Total: {formatCHF(totalCosts)}</span>}
        >
          <div className="p-5 space-y-3">
            {DEMO_COST_BREAKDOWN.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{item.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{item.pct}%</span>
                    <span className="text-xs font-bold text-gray-900">{formatCHF(item.amount)}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Invoice List */}
        <SectionCard title="Rechnungen" icon={Receipt}
          action={<span className="text-[10px] text-gray-400">{DEMO_INVOICES_ADMIN.length} Rechnungen</span>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Nr.", "Kunde", "Betrag", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DEMO_INVOICES_ADMIN.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{inv.id}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{inv.customer}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-gray-900">{formatCHF(inv.amount)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        inv.status === "bezahlt" ? "bg-emerald-50 text-emerald-600"
                          : inv.status === "offen" ? "bg-blue-50 text-blue-600"
                          : "bg-red-50 text-red-600"
                      }`}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Monthly Summary Cards */}
      <SectionCard title="Monatsvergleich" icon={TrendingUp}>
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-gray-100">
          {DEMO_MONTHLY_FINANCES.map((m) => {
            const marginPct = Math.round((m.margin / m.revenue) * 100);
            return (
              <div key={m.month} className="p-4 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{m.month}</p>
                <p className="text-sm font-bold text-gray-900">{formatCHF(m.revenue)}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Kosten: {formatCHF(m.costs)}</p>
                <p className={`text-xs font-bold mt-1 ${marginPct >= 30 ? "text-emerald-600" : marginPct >= 20 ? "text-amber-600" : "text-red-500"}`}>
                  {marginPct}% Marge
                </p>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Section: Safety & Compliance ──────────────────────────────────────────

function SafetySection() {
  const total = DEMO_AUTHORIZATIONS.length;
  const approved = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "approved").length;
  const rejected = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "rejected").length;
  const escalated = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "escalated").length;
  const openIncidents = DEMO_INCIDENTS.filter((i) => i.status !== "resolved").length;
  const liveFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air");

  const riskFlights = DEMO_FLIGHTS.map((f) => {
    const auth = DEMO_AUTHORIZATIONS.find((a) => a.pickupLat === f.booking.pickupLat && a.pickupLng === f.booking.pickupLng);
    return { ...f, risk: auth?.overallRisk ?? "LOW", sailLevel: auth?.sailLevel ?? "I" };
  });
  const greenCount = riskFlights.filter((f) => f.risk === "LOW").length;
  const yellowCount = riskFlights.filter((f) => f.risk === "MEDIUM").length;
  const redCount = riskFlights.filter((f) => f.risk === "HIGH" || f.risk === "CRITICAL").length;

  return (
    <div className="space-y-6">
      {/* Status KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Aktive Flüge" value={liveFlights.length + DEMO_FLIGHTS.filter((f) => f.status === "pre_flight_check").length} icon={Plane} color="red" />
        <KpiCard title="Genehmigt" value={approved} icon={CheckCircle2} color="green" />
        <KpiCard title="Abgelehnt" value={rejected} icon={XCircle} color="rose" />
        <KpiCard title="Eskaliert" value={escalated} icon={AlertTriangle} color="amber" />
        <KpiCard title="Offene Vorfälle" value={openIncidents} icon={AlertCircle} color={openIncidents > 0 ? "rose" : "green"} />
        <KpiCard title="Genehmigungsrate" value={`${Math.round((approved / total) * 100)}%`} icon={Activity} color="green" />
      </div>

      {/* Live Flight Monitoring + Risk */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Live-Flugüberwachung" icon={Radar}
            action={
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
                <span className="text-[10px] font-bold text-red-600">LIVE TELEMETRIE</span>
              </div>
            }
          >
            <div className="divide-y divide-gray-100">
              {liveFlights.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">Keine aktiven Flüge — Luftraum frei</div>
              ) : (
                liveFlights.map((flight) => (
                  <div key={flight.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></span>
                        <span className="font-mono text-sm font-bold text-gray-900">{flight.booking.identifier}</span>
                        <span className="text-xs text-gray-500">{flight.booking.pilotName}</span>
                      </div>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">IN DER LUFT</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { label: "Position", value: `${parseFloat(flight.booking.deliveryLat).toFixed(4)}°N`, icon: MapPin },
                        { label: "Höhe AGL", value: "120 m", icon: Navigation },
                        { label: "Geschw.", value: "75 km/h", icon: Gauge },
                        { label: "Batterie", value: "92%", icon: Battery },
                        { label: "C2 Link", value: "STARK", icon: Radio },
                        { label: "Distanz", value: `${flight.booking.routeDistanceKm} km`, icon: Activity },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-lg p-2 border border-gray-100 text-center">
                          <item.icon className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-gray-900 font-mono">{item.value}</p>
                          <p className="text-[9px] text-gray-400">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* AI Risk */}
        <SectionCard title="KI-Risikoanalyse" icon={Zap}
          action={<span className="text-[10px] font-bold text-red-600">AMPELSYSTEM</span>}
        >
          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                <div className={`w-8 h-8 rounded-full ${greenCount > 0 ? "bg-green-400 shadow-lg shadow-green-400/30" : "bg-green-100"}`} />
                <div className={`w-8 h-8 rounded-full ${yellowCount > 0 ? "bg-amber-400 shadow-lg shadow-amber-400/30" : "bg-amber-100"}`} />
                <div className={`w-8 h-8 rounded-full ${redCount > 0 ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-red-100"}`} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100"><span className="text-xs font-semibold text-emerald-700">Niedriges Risiko</span><span className="text-sm font-bold text-emerald-600 font-mono">{greenCount}</span></div>
                <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-100"><span className="text-xs font-semibold text-amber-700">Mittleres Risiko</span><span className="text-sm font-bold text-amber-600 font-mono">{yellowCount}</span></div>
                <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 border border-red-100"><span className="text-xs font-semibold text-red-700">Hohes Risiko</span><span className="text-sm font-bold text-red-600 font-mono">{redCount}</span></div>
              </div>
            </div>
            <div className="space-y-1.5">
              {riskFlights.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <CircleDot className={`w-3.5 h-3.5 flex-shrink-0 ${f.risk === "LOW" ? "text-green-500" : f.risk === "MEDIUM" ? "text-amber-500" : "text-red-500"}`} />
                  <span className="font-mono font-bold text-gray-700">{f.booking.identifier}</span>
                  <span className="text-gray-400 truncate flex-1">{f.booking.deliveryAddress.split(",")[0]}</span>
                  <span className="font-bold text-gray-500 font-mono">SAIL {f.sailLevel}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Approval Workflow */}
      <SectionCard title="Flugfreigabe-Workflow (LUC)" subtitle="Dreistufig: KI → Safety Manager → Accountable Manager" icon={ShieldCheck}>
        <div className="p-5">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
            {[
              { icon: Zap, label: "KI-System", desc: "Automatische Analyse", bg: "bg-red-50 border-red-100", iconColor: "text-red-500" },
              { icon: Eye, label: "Safety Mgr", desc: "Manuelle Prüfung", bg: "bg-amber-50 border-amber-100", iconColor: "text-amber-500" },
              { icon: ShieldCheck, label: "Acc. Mgr", desc: "Finale Freigabe", bg: "bg-purple-50 border-purple-100", iconColor: "text-purple-500" },
              { icon: CheckCircle2, label: "Freigabe", desc: "Flug autorisiert", bg: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-500" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-12 h-12 ${step.bg} rounded-xl flex items-center justify-center border`}><step.icon className={`w-5 h-5 ${step.iconColor}`} /></div>
                  <span className="text-[10px] font-bold text-gray-700">{step.label}</span>
                  <span className="text-[9px] text-gray-400">{step.desc}</span>
                </div>
                {i < arr.length - 1 && <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Incident Register */}
      <SectionCard title="Incident-Register & Near-Miss" icon={AlertCircle}
        action={<span className="text-[10px] text-gray-400">{DEMO_INCIDENTS.length} Einträge</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Datum", "Vorfall", "Schweregrad", "Status", "Pilot", "Drohne"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DEMO_INCIDENTS.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">{formatDateTime(inc.date)}</td>
                  <td className="px-5 py-3"><p className="text-gray-900 font-medium text-xs">{inc.title}</p><p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-xs">{inc.description}</p></td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${inc.severity === "low" ? "bg-gray-100 text-gray-500" : inc.severity === "medium" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>{inc.severity === "low" ? "Gering" : inc.severity === "medium" ? "Mittel" : "Hoch"}</span></td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${inc.status === "resolved" ? "bg-emerald-50 text-emerald-600" : inc.status === "under_review" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>{inc.status === "resolved" ? "Behoben" : inc.status === "under_review" ? "In Prüfung" : "Offen"}</span></td>
                  <td className="px-5 py-3 text-xs text-gray-500">{inc.pilot}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-mono">{inc.drone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Section: Flottenmanagement ────────────────────────────────────────────

function FleetSection() {
  const activeDrones = DEMO_DRONES.filter((d) => d.isActive);
  const totalFlights = DEMO_DRONES.reduce((sum, d) => sum + d.totalFlights, 0);
  const avgBattery = Math.round(DEMO_DRONES.reduce((sum, d) => sum + d.batteryHealthPct, 0) / DEMO_DRONES.length);
  const maintenancePending = DEMO_MAINTENANCE_LOG.filter((m) => m.status === "geplant").length;
  const totalFlightHours = totalFlights * 0.35;

  return (
    <div className="space-y-6">
      {/* Fleet Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard title="Drohnen total" value={DEMO_DRONES.length} icon={Plane} color="red" sub="DJI FlyCart 100" />
        <KpiCard title="Aktiv / Einsatzbereit" value={`${activeDrones.length} / ${DEMO_DRONES.length}`} icon={CheckCircle2} color="green" />
        <KpiCard title="Flüge total" value={totalFlights} icon={Activity} color="indigo" sub={`≈ ${totalFlightHours.toFixed(0)} Flugstunden`} />
        <KpiCard title="Ø Batterie SoH" value={`${avgBattery}%`} icon={Battery} color={avgBattery >= 90 ? "green" : avgBattery >= 80 ? "amber" : "rose"} />
        <KpiCard title="Wartung geplant" value={maintenancePending} icon={Wrench} color="amber" sub="Nächste 14 Tage" />
      </div>

      {/* Drone List */}
      <SectionCard title="Flottenübersicht" subtitle="Alle registrierten Drohnen" icon={Plane}>
        <div className="divide-y divide-gray-100">
          {DEMO_DRONES.map((drone) => (
            <div key={drone.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${drone.isActive ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-200"}`}>
                  <Plane className={`w-5 h-5 ${drone.isActive ? "text-red-500" : "text-gray-400"} -rotate-45`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{drone.model}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{drone.serialNumber}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-400">{drone.totalFlights} Flüge</span>
                    <span className="text-[10px] text-gray-400">Max {drone.maxPayloadKg} kg</span>
                    <span className="text-[10px] text-gray-400">IP55</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 mb-0.5">Batterie SoH</p>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${drone.batteryHealthPct >= 90 ? "bg-emerald-500" : drone.batteryHealthPct >= 80 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${drone.batteryHealthPct}%` }} />
                    </div>
                    <p className={`text-sm font-bold font-mono ${drone.batteryHealthPct >= 90 ? "text-emerald-600" : drone.batteryHealthPct >= 80 ? "text-amber-600" : "text-red-500"}`}>{drone.batteryHealthPct}%</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${drone.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                  {drone.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Maintenance Log */}
      <SectionCard title="Wartungsprotokoll" subtitle="Letzte und geplante Wartungen" icon={Wrench}
        action={<span className="text-[10px] text-gray-400">{DEMO_MAINTENANCE_LOG.length} Einträge</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Drohne", "Wartungsarbeit", "Datum", "Status", "Nächste Fällig", "Techniker"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DEMO_MAINTENANCE_LOG.map((entry, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono font-bold text-gray-700">{entry.drone}</td>
                  <td className="px-5 py-3 text-xs text-gray-900">{entry.task}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-mono">{entry.date}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      entry.status === "erledigt" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>{entry.status === "erledigt" ? "Erledigt" : "Geplant"}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-mono">{entry.nextDue}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{entry.tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Drone Specs */}
      <SectionCard title="DJI FlyCart 100 — Technische Daten" icon={FileCheck}>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "MTOW", value: "170 kg", sub: "150 kg CH/EU" },
              { label: "Max Nutzlast", value: "100 kg", sub: "Einzelbatterie" },
              { label: "Reichweite", value: "12 km", sub: "Dual-Batterie" },
              { label: "Flugzeit", value: "14 min", sub: "bei 149.9 kg" },
              { label: "Propeller", value: "62\"", sub: "Carbon-Composite" },
              { label: "Schutzklasse", value: "IP55", sub: "-20°C bis 40°C" },
            ].map((spec) => (
              <div key={spec.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">{spec.label}</p>
                <p className="text-lg font-bold text-gray-900 font-mono mt-1">{spec.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{spec.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Sensorik", value: "LiDAR, mmWave Radar, 5-Richtungs-Vision" },
              { label: "Fallschirm", value: "E2MSF-100A · ≤7 m/s Sinkrate" },
              { label: "Batterie", value: "DB2160 · 41 Ah · 52 V · 1'500 Zyklen" },
              { label: "Liefermethoden", value: "Winde (30 m) + Elektrohaken" },
            ].map((spec) => (
              <div key={spec.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">{spec.label}</p>
                <p className="text-xs text-gray-700">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Section: Team & Franchise ─────────────────────────────────────────────

function TeamSection() {
  const pilots = DEMO_EMPLOYEES.filter((e) => e.role.includes("Pilot"));
  const safetyManagers = DEMO_EMPLOYEES.filter((e) => e.role.includes("Safety"));
  const operations = DEMO_EMPLOYEES.filter((e) => !e.role.includes("Pilot") && !e.role.includes("Safety"));

  return (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard title="Gesamt Team" value={DEMO_EMPLOYEES.length} icon={Users} color="red" />
        <KpiCard title="Piloten" value={pilots.length} icon={Plane} color="blue" sub="PIC zertifiziert" />
        <KpiCard title="Safety Manager" value={safetyManagers.length} icon={ShieldCheck} color="green" />
        <KpiCard title="Franchise-Partner" value={DEMO_FRANCHISE_PARTNERS.length} icon={Globe} color="purple" />
        <KpiCard title="Externe Drohnen" value={DEMO_FRANCHISE_PARTNERS.reduce((s, p) => s + p.droneCount, 0)} icon={Plane} color="indigo" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Internal Team */}
        <SectionCard title="Internes Team" subtitle={`${DEMO_EMPLOYEES.length} Mitarbeiter`} icon={Users}>
          <div className="divide-y divide-gray-100">
            {DEMO_EMPLOYEES.map((emp) => (
              <div key={emp.name} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    emp.role.includes("Pilot") ? "bg-red-50 border border-red-100" : emp.role.includes("Safety") ? "bg-emerald-50 border border-emerald-100" : "bg-blue-50 border border-blue-100"
                  }`}>
                    {emp.role.includes("Pilot") ? <Plane className="w-4 h-4 text-red-500 -rotate-45" /> : emp.role.includes("Safety") ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <Briefcase className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                    <p className="text-[10px] text-gray-400">{emp.role} · {emp.pensum} · seit {new Date(emp.since).getFullYear()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    emp.contract === "Unbefristet" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>{emp.contract}</span>
                  {emp.absentToday && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100">Abwesend</span>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Franchise Network */}
        <SectionCard title="Franchise-Netzwerk" subtitle={`${DEMO_FRANCHISE_PARTNERS.length} Partner`} icon={Globe}>
          <div className="divide-y divide-gray-100">
            {DEMO_FRANCHISE_PARTNERS.map((partner) => (
              <div key={partner.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-100">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{partner.name}</p>
                    <p className="text-[10px] text-gray-400">{partner.region} · {partner.droneCount} Drohnen · {partner.pilotCount} Piloten</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">CHF {partner.monthlyRevenue.toLocaleString("de-CH")}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    partner.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>{partner.status === "active" ? "Aktiv" : "Onboarding"}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Certification Overview */}
      <SectionCard title="Zertifizierungen & Lizenzen" icon={Award}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Mitarbeiter", "Rolle", "Lizenz/Zertifikat", "Gültig bis", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DEMO_EMPLOYEES.filter((e) => e.certExpiry !== "—").map((emp) => {
                const expiryDate = new Date(emp.certExpiry);
                const now = new Date();
                const monthsLeft = (expiryDate.getFullYear() - now.getFullYear()) * 12 + expiryDate.getMonth() - now.getMonth();
                return (
                  <tr key={emp.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-xs font-semibold text-gray-900">{emp.name}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{emp.role}</td>
                    <td className="px-5 py-3 text-xs text-gray-700">CH-RPL / A2 Open Category</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">{emp.certExpiry}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        monthsLeft > 6 ? "bg-emerald-50 text-emerald-600" : monthsLeft > 3 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                      }`}>{monthsLeft > 6 ? "Gültig" : monthsLeft > 3 ? "Erneuerung nötig" : "Kritisch"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Section: Mitarbeiter-Übersicht ────────────────────────────────────────

function MitarbeiterSection() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const totalEmployees = DEMO_EMPLOYEES.length;
  const absentToday = DEMO_EMPLOYEES.filter((e) => e.absentToday).length;
  const avgVacationUsed = Math.round(DEMO_EMPLOYEES.reduce((s, e) => s + e.vacationUsed, 0) / totalEmployees);
  const totalSickDays = DEMO_EMPLOYEES.reduce((s, e) => s + e.sickDays, 0);
  const totalMonthlySalary = DEMO_EMPLOYEES.reduce((s, e) => s + e.salary, 0);
  const avgHoursPercent = Math.round(DEMO_EMPLOYEES.reduce((s, e) => s + (e.hoursThisMonth / e.hoursSoll) * 100, 0) / totalEmployees);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Mitarbeiter" value={totalEmployees} icon={Users} color="red" />
        <KpiCard title="Abwesend heute" value={absentToday} icon={CalendarDays} color={absentToday > 0 ? "amber" : "green"} />
        <KpiCard title="Ø Ferien bezogen" value={`${avgVacationUsed} Tage`} icon={CalendarDays} color="indigo" />
        <KpiCard title="Krankheitstage" value={`${totalSickDays} Tage`} icon={HeartPulse} color="rose" sub="Laufendes Jahr" />
        <KpiCard title="Ø Auslastung" value={`${avgHoursPercent}%`} icon={Activity} color="blue" />
        <KpiCard title="Lohnsumme/Mt" value={formatCHF(totalMonthlySalary)} icon={Wallet} color="purple" />
      </div>

      {/* Employee Table */}
      <SectionCard title="Alle Mitarbeiter" icon={Users}
        action={<span className="text-[10px] text-gray-400">April 2026</span>}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-semibold text-gray-400 uppercase border-b border-gray-100">
              <th className="text-left px-5 py-2.5">Mitarbeiter</th>
              <th className="text-left px-3 py-2.5">Vertrag</th>
              <th className="text-center px-3 py-2.5">Stunden (Ist/Soll)</th>
              <th className="text-center px-3 py-2.5">Ferien-Saldo</th>
              <th className="text-center px-3 py-2.5">Krankheit</th>
              <th className="text-center px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DEMO_EMPLOYEES.map((emp) => {
              const hoursPercent = Math.round((emp.hoursThisMonth / emp.hoursSoll) * 100);
              const vacationRemaining = emp.vacationTotal - emp.vacationUsed;
              return (
                <tr
                  key={emp.name}
                  onClick={() => setSelectedEmployee(selectedEmployee === emp.name ? null : emp.name)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        emp.role.includes("Pilot") ? "bg-red-50 border border-red-100" : emp.role.includes("Safety") ? "bg-emerald-50 border border-emerald-100" : "bg-blue-50 border border-blue-100"
                      }`}>
                        <User className={`w-3.5 h-3.5 ${
                          emp.role.includes("Pilot") ? "text-red-500" : emp.role.includes("Safety") ? "text-emerald-500" : "text-blue-500"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-[10px] text-gray-400">{emp.role} · {emp.pensum}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      emp.contract === "Unbefristet" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>{emp.contract}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-gray-900">{emp.hoursThisMonth}h / {emp.hoursSoll}h</span>
                      <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            hoursPercent >= 100 ? "bg-emerald-500" : hoursPercent >= 80 ? "bg-blue-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(hoursPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-bold text-gray-900">{vacationRemaining}</span>
                    <span className="text-[10px] text-gray-400"> / {emp.vacationTotal}</span>
                    {emp.vacationPending > 0 && (
                      <span className="ml-1.5 text-[10px] text-amber-600">({emp.vacationPending} beantragt)</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs font-bold ${emp.sickDays > 3 ? "text-red-500" : emp.sickDays > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                      {emp.sickDays} Tage
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {emp.absentToday ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600">Abwesend</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">Anwesend</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* Detail panel for selected employee */}
      {selectedEmployee && (() => {
        const emp = DEMO_EMPLOYEES.find((e) => e.name === selectedEmployee);
        if (!emp) return null;
        return (
          <SectionCard title={emp.name} subtitle={`${emp.role} · ${emp.pensum} · ${emp.contract}`} icon={User}>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Stunden/Monat</p>
                  <p className="text-lg font-bold text-gray-900">{emp.hoursThisMonth}h</p>
                  <p className="text-[10px] text-gray-400">Soll: {emp.hoursSoll}h · {Math.round((emp.hoursThisMonth / emp.hoursSoll) * 100)}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Ferien-Saldo</p>
                  <p className="text-lg font-bold text-gray-900">{emp.vacationTotal - emp.vacationUsed} Tage</p>
                  <p className="text-[10px] text-gray-400">{emp.vacationUsed} bezogen / {emp.vacationTotal}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Beantragt</p>
                  <p className="text-lg font-bold text-amber-600">{emp.vacationPending} Tage</p>
                  <p className="text-[10px] text-gray-400">Ferien + WB</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Krankheitstage</p>
                  <p className={`text-lg font-bold ${emp.sickDays > 3 ? "text-red-500" : "text-gray-900"}`}>{emp.sickDays}</p>
                  <p className="text-[10px] text-gray-400">Laufendes Jahr</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Bruttolohn</p>
                  <p className="text-lg font-bold text-gray-900">{formatCHF(emp.salary)}</p>
                  <p className="text-[10px] text-gray-400">pro Monat</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Dabei seit</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(emp.since).toLocaleDateString("de-CH", { month: "short", year: "numeric" })}</p>
                  <p className="text-[10px] text-gray-400">{emp.certExpiry !== "—" ? `Lizenz bis ${emp.certExpiry}` : "Keine Pilotenlizenz"}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setSelectedEmployee(null)} className="text-xs text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Schliessen</button>
              </div>
            </div>
          </SectionCard>
        );
      })()}

      {/* Vacation Overview */}
      <SectionCard title="Ferien-Übersicht" subtitle="Verbleibende Ferientage pro Mitarbeiter" icon={CalendarDays}>
        <div className="p-5">
          <div className="space-y-3">
            {DEMO_EMPLOYEES.map((emp) => {
              const remaining = emp.vacationTotal - emp.vacationUsed;
              const usedPct = Math.round((emp.vacationUsed / emp.vacationTotal) * 100);
              return (
                <div key={emp.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{emp.name}</span>
                      <span className="text-[10px] text-gray-400">{emp.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400">{emp.vacationUsed} / {emp.vacationTotal} Tage</span>
                      {emp.vacationPending > 0 && <span className="text-[10px] font-semibold text-amber-600">{emp.vacationPending} beantragt</span>}
                      <span className="text-xs font-bold text-gray-900">{remaining} übrig</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-400 rounded-l-full" style={{ width: `${usedPct}%` }} />
                    {emp.vacationPending > 0 && <div className="h-full bg-amber-300" style={{ width: `${Math.round((emp.vacationPending / emp.vacationTotal) * 100)}%` }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Section Titles ────────────────────────────────────────────────────────

const SECTION_TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  overview: { title: "Firmenübersicht", subtitle: "VSNZ GmbH — Gesamtüberblick über alle Geschäftsbereiche" },
  analytics: { title: "Analytics & KPIs", subtitle: "Betriebskennzahlen, Umsatz und Performance" },
  buchhaltung: { title: "Buchhaltung", subtitle: "Umsatz, Kosten, Margen und Rechnungswesen" },
  safety: { title: "Safety & Compliance", subtitle: "Flugfreigaben, Risikobewertung und Vorfälle" },
  fleet: { title: "Flottenmanagement", subtitle: "Drohnen-Status, Verschleiss und Wartungsplanung" },
  team: { title: "Team & Franchise", subtitle: "Piloten, Safety Manager und Franchise-Partner" },
  mitarbeiter: { title: "Mitarbeiter-Übersicht", subtitle: "Arbeitszeiten, Ferien, Abwesenheiten und Verträge" },
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const meta = SECTION_TITLES[activeSection];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminTopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "analytics" && <AnalyticsSection />}
          {activeSection === "buchhaltung" && <BuchhaltungSection />}
          {activeSection === "safety" && <SafetySection />}
          {activeSection === "fleet" && <FleetSection />}
          {activeSection === "team" && <TeamSection />}
          {activeSection === "mitarbeiter" && <MitarbeiterSection />}
        </main>
      </div>
    </div>
  );
}
