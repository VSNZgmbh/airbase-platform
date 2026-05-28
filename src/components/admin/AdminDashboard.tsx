"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import {
  DEMO_BOOKINGS,
  DEMO_DRONES,
  DEMO_FRANCHISE_PARTNERS,
  DEMO_AUTHORIZATIONS,
  DEMO_AREA_DATA,
  DEMO_INCIDENTS,
  DEMO_FLIGHTS,
  DEMO_REVENUE_DATA,
  DEMO_SERVICE_DISTRIBUTION,
  DEMO_WEEKLY_DATA,
} from "@/lib/demo-data";
import { ConnectionStatus } from "@/components/mission-control/ConnectionStatus";
import dynamic from "next/dynamic";

const LiveOperationsMap = dynamic(
  () => import("@/components/admin/LiveOperationsMap").then((m) => ({ default: m.LiveOperationsMap })),
  { ssr: false, loading: () => <div className="h-[500px] bg-gray-50 rounded-2xl animate-pulse" /> }
);
const AirspaceView3D = dynamic(
  () => import("@/components/admin/AirspaceView3D").then((m) => ({ default: m.AirspaceView3D })),
  { ssr: false, loading: () => <div className="h-[500px] bg-gray-50 rounded-2xl animate-pulse" /> }
);
import { AdminSafetyPanel } from "@/components/admin/AdminSafetyPanel";
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
  Search,
  Bell,
  Receipt,
  Globe,
  Wrench,
  ListChecks,
  FolderOpen,
  Calendar,
  Send,
  Filter,
  Download,
  MessageCircle,
  Target,
  Hash,
  FileCheck,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type AdminSection =
  | "overview"
  | "live-ops"
  | "bookings"
  | "analytics"
  | "safety"
  | "fleet"
  | "team"
  | "mitarbeiter"
  | "invoices"
  | "sora"
  | "settings";

const ADMIN_MENU_ITEMS: {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Dashboard", icon: Compass },
  { id: "live-ops", label: "Live Operations", icon: Radar },
  { id: "bookings", label: "Buchungsverwaltung", icon: Package },
  { id: "analytics", label: "Analytics & Finanzen", icon: BarChart3 },
  { id: "safety", label: "Safety & Compliance", icon: ShieldCheck },
  { id: "fleet", label: "Flotte & Wartung", icon: Wrench },
  { id: "team", label: "Team & Franchise", icon: Users },
  { id: "mitarbeiter", label: "Mitarbeiter-Übersicht", icon: Briefcase },
  { id: "invoices", label: "Rechnungen & Zahlungen", icon: Receipt },
  { id: "sora", label: "SORA & Bewilligungen", icon: FileCheck },
  { id: "settings", label: "Einstellungen", icon: Settings },
];

// ─── Sidebar ────────────────────────────────────────────────────────────────

function AdminSidebar({
  activeSection,
  onNavigate,
  liveFlightCount,
}: {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  liveFlightCount: number;
}) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <img src="/airbase-logo.png" alt="airBASE" className="h-10 w-auto" />
          <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Admin & Safety</div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="px-5 pb-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3 border border-red-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Admin</p>
              <p className="text-[10px] text-gray-500">
                VSNZ GmbH · LUC Operator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-2">
          Betrieb
        </p>
        {ADMIN_MENU_ITEMS.slice(0, 4).map((item) => {
          const isActive = activeSection === item.id;
          const showBadge = item.id === "live-ops" && liveFlightCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {showBadge && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </button>
          );
        })}

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-5">
          Safety & Compliance
        </p>
        {ADMIN_MENU_ITEMS.slice(4, 6).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-5">
          Personal & Finanzen
        </p>
        {ADMIN_MENU_ITEMS.slice(6, 9).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-5">
          System
        </p>
        {ADMIN_MENU_ITEMS.slice(9).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`}
              />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        {/* Portal Links */}
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2 mt-5">
          Portale
        </p>
        {[
          { href: "/dashboard", icon: Users, label: "Kundenportal" },
          { href: "/pilot", icon: Compass, label: "Pilot Cockpit" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            <item.icon className="w-4 h-4 text-gray-400" />
            {item.label}
            <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
          </a>
        ))}
      </nav>

      {/* Connection Status */}
      <div className="px-4 pb-2">
        <ConnectionStatus />
      </div>

      {/* System card footer */}
      <div className="px-4 pb-6">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] font-bold text-gray-600">
              SYSTEM AKTIV
            </span>
          </div>
          <p className="text-[10px] text-gray-400">
            BAZL · LFG SR 748.0 · EASA
          </p>
        </div>
      </div>
    </aside>
  );
}

// ─── Top Bar ────────────────────────────────────────────────────────────────

function AdminTopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const [time, setTime] = useState("");
  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("de-CH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <p className="text-[10px] text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <ConnectionStatus />
        <div className="hidden md:flex items-center gap-1 bg-gray-100/80 rounded-full px-3 py-1.5 w-56">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Suchen..."
            className="bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none w-full ml-1.5"
          />
        </div>
        <span className="font-mono text-sm font-bold text-red-500">{time}</span>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-red-600" />
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(dt: Date | string | null) {
  if (!dt) return "\u2014";
  return new Date(dt).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color = "red",
  trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "red" | "blue" | "green" | "amber" | "purple" | "indigo" | "emerald";
  trend?: { value: string; positive: boolean };
}) {
  const styles: Record<string, { icon: string; bg: string }> = {
    red: { icon: "bg-red-50 text-red-500 border-red-100", bg: "border-l-red-500" },
    blue: { icon: "bg-blue-50 text-blue-500 border-blue-100", bg: "border-l-blue-500" },
    green: { icon: "bg-green-50 text-green-500 border-green-100", bg: "border-l-green-500" },
    amber: { icon: "bg-amber-50 text-amber-500 border-amber-100", bg: "border-l-amber-500" },
    purple: { icon: "bg-purple-50 text-purple-500 border-purple-100", bg: "border-l-purple-500" },
    indigo: { icon: "bg-indigo-50 text-indigo-500 border-indigo-100", bg: "border-l-indigo-500" },
    emerald: { icon: "bg-emerald-50 text-emerald-500 border-emerald-100", bg: "border-l-emerald-500" },
  };
  const c = styles[color];
  return (
    <div className={`bg-white rounded-2xl border-l-4 ${c.bg} border border-gray-200 px-4 py-3`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
          {title}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${c.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-xl font-bold text-gray-900 font-mono">{value}</p>
        {trend && (
          <span
            className={`text-[10px] font-semibold mb-0.5 ${
              trend.positive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {trend.positive ? "+" : ""}
            {trend.value}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Section: Overview Dashboard ────────────────────────────────────────────

function OverviewSection() {
  const activeFlights = DEMO_FLIGHTS.filter(
    (f) => f.status === "in_air" || f.status === "pre_flight_check"
  ).length;
  const completedFlights = DEMO_FLIGHTS.filter(
    (f) => f.status === "completed"
  ).length;
  const scheduledFlights = DEMO_FLIGHTS.filter(
    (f) => f.status === "scheduled"
  ).length;
  const totalBookings = DEMO_BOOKINGS.length;
  const totalDrones = DEMO_DRONES.length;
  const activeDrones = DEMO_DRONES.filter((d) => d.isActive).length;
  const openIncidents = DEMO_INCIDENTS.filter(
    (i) => i.status !== "resolved"
  ).length;
  const approvalRate = Math.round(
    (DEMO_AUTHORIZATIONS.filter((a) => a.decision === "approved").length /
      DEMO_AUTHORIZATIONS.length) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Willkommen im Admin-Center</h2>
            <p className="text-white/80 text-sm mt-1">
              VSNZ GmbH · LUC Operator · Betriebszentrale Schweiz
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{activeFlights}</p>
              <p className="text-[10px] text-white/70">Aktive Flüge</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{approvalRate}%</p>
              <p className="text-[10px] text-white/70">Genehmigungsrate</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Buchungen"
          value={totalBookings}
          icon={Package}
          color="red"
          trend={{ value: "12%", positive: true }}
        />
        <KpiCard
          title="Flüge abgeschlossen"
          value={completedFlights}
          sub={`${scheduledFlights} geplant`}
          icon={Plane}
          color="indigo"
        />
        <KpiCard
          title="Drohnenflotte"
          value={`${activeDrones} / ${totalDrones}`}
          sub="aktiv / gesamt"
          icon={Wrench}
          color="blue"
        />
        <KpiCard
          title="Safety Score"
          value={`${approvalRate}%`}
          icon={ShieldCheck}
          color="green"
          trend={{ value: "2%", positive: true }}
        />
        <KpiCard
          title="Offene Vorfälle"
          value={openIncidents}
          icon={AlertTriangle}
          color={openIncidents > 0 ? "amber" : "green"}
        />
      </div>

      {/* Quick Actions + Revenue + Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Schnellzugriff</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Neuer Flug", icon: Plane, color: "bg-red-50 text-red-500 border-red-100" },
              { label: "Genehmigung", icon: ShieldCheck, color: "bg-green-50 text-green-500 border-green-100" },
              { label: "Wartung", icon: Wrench, color: "bg-amber-50 text-amber-500 border-amber-100" },
              { label: "Bericht", icon: FileText, color: "bg-blue-50 text-blue-500 border-blue-100" },
            ].map((action) => (
              <button
                key={action.label}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:shadow-sm ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Mini Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Umsatz-Trend</h3>
            <span className="text-[10px] text-gray-400">Letzte 7 Monate</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={DEMO_REVENUE_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorRevOverview" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  fontSize: "12px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(v) => [`CHF ${Number(v).toLocaleString("de-CH")}`, "Umsatz"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorRevOverview)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Leistungsverteilung</h3>
          <div className="space-y-2.5">
            {DEMO_SERVICE_DISTRIBUTION.map((svc) => {
              const maxVal = Math.max(...DEMO_SERVICE_DISTRIBUTION.map((s) => s.value));
              const pct = Math.round((svc.value / maxVal) * 100);
              return (
                <div key={svc.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{svc.name}</span>
                    <span className="text-xs font-semibold text-gray-900">{svc.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: svc.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-gray-900">Letzte Buchungen</h3>
          </div>
          <span className="text-[10px] text-gray-400">{DEMO_BOOKINGS.length} Buchungen total</span>
        </div>
        <div className="divide-y divide-gray-100">
          {DEMO_BOOKINGS.slice(0, 5).map((booking) => {
            const statusColors: Record<string, string> = {
              confirmed: "bg-green-100 text-green-700",
              pending: "bg-amber-100 text-amber-700",
              completed: "bg-emerald-100 text-emerald-700",
              in_progress: "bg-blue-100 text-blue-700",
            };
            const statusLabels: Record<string, string> = {
              confirmed: "Bestätigt",
              pending: "Ausstehend",
              completed: "Abgeschlossen",
              in_progress: "In Bearbeitung",
            };
            return (
              <div
                key={booking.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                    <Package className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.identifier}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {booking.pilotName} · {booking.payloadDescription}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-900">
                    CHF {parseFloat(booking.totalCHF).toLocaleString("de-CH")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      statusColors[booking.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {statusLabels[booking.status] ?? booking.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Live Operations ───────────────────────────────────────────────

function LiveOpsSection() {
  const [activeTab, setActiveTab] = useState<"map" | "3d" | "safety">("map");
  const liveFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air");
  const preFlightFlights = DEMO_FLIGHTS.filter(
    (f) => f.status === "pre_flight_check"
  );

  const riskFlights = DEMO_FLIGHTS.map((f) => {
    const auth = DEMO_AUTHORIZATIONS.find(
      (a) =>
        a.pickupLat === f.booking.pickupLat &&
        a.pickupLng === f.booking.pickupLng
    );
    return {
      ...f,
      risk: auth?.overallRisk ?? "LOW",
      sailLevel: auth?.sailLevel ?? "I",
    };
  });
  const greenCount = riskFlights.filter((f) => f.risk === "LOW").length;
  const yellowCount = riskFlights.filter((f) => f.risk === "MEDIUM").length;
  const redCount = riskFlights.filter(
    (f) => f.risk === "HIGH" || f.risk === "CRITICAL"
  ).length;

  const tabs = [
    { id: "map" as const, label: "Live-Karte", icon: Globe },
    { id: "3d" as const, label: "3D Luftraum", icon: Compass },
    { id: "safety" as const, label: "Sicherheit", icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      {/* Live Banner */}
      {liveFlights.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <span className="font-bold text-lg">
              {liveFlights.length} AKTIVE{" "}
              {liveFlights.length === 1 ? "MISSION" : "MISSIONEN"}
            </span>
          </div>
          <p className="text-white/70 text-sm">
            Echtzeit-Telemetrie und Überwachung aller aktiven Flüge
          </p>
        </div>
      )}

      {/* Status KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="In der Luft" value={liveFlights.length} icon={Plane} color="red" />
        <KpiCard title="Vorflugcheck" value={preFlightFlights.length} icon={ListChecks} color="amber" />
        <KpiCard title="Risiko GRÜN" value={greenCount} icon={CheckCircle2} color="green" />
        <KpiCard title="Risiko ROT" value={redCount} icon={AlertTriangle} color={redCount > 0 ? "amber" : "green"} />
      </div>

      {/* View Tabs — Map / 3D / Safety */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      {activeTab === "map" && <LiveOperationsMap />}
      {activeTab === "3d" && <AirspaceView3D />}
      {activeTab === "safety" && <AdminSafetyPanel />}

      {/* Live Flight Monitor */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-gray-900">Live-Flugüberwachung</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[10px] font-bold text-red-500">LIVE TELEMETRIE</span>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {liveFlights.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Radar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Keine aktiven Flüge</p>
              <p className="text-sm text-gray-400 mt-1">Luftraum frei — alle Drohnen am Boden</p>
            </div>
          ) : (
            liveFlights.map((flight) => (
              <div key={flight.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                    <span className="font-mono text-sm font-bold text-gray-900">{flight.booking.identifier}</span>
                    <span className="text-xs text-gray-400">{flight.booking.pilotName}</span>
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
                    <div key={item.label} className="bg-gray-50 rounded-xl p-2 border border-gray-100 text-center">
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
      </div>

      {/* Risk Traffic Light */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-gray-900">KI-Risikoanalyse — Ampelsystem</h3>
        </div>
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-2 bg-gray-900 rounded-2xl px-4 py-3">
            <div className={`w-8 h-8 rounded-full ${greenCount > 0 ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-green-900"}`} />
            <div className={`w-8 h-8 rounded-full ${yellowCount > 0 ? "bg-amber-400 shadow-lg shadow-amber-400/50" : "bg-amber-900"}`} />
            <div className={`w-8 h-8 rounded-full ${redCount > 0 ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-red-900"}`} />
          </div>
          <div className="flex-1 space-y-2">
            {riskFlights.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                <CircleDot className={`w-3.5 h-3.5 flex-shrink-0 ${f.risk === "LOW" ? "text-green-500" : f.risk === "MEDIUM" ? "text-amber-500" : "text-red-500"}`} />
                <span className="font-mono font-bold text-gray-700">{f.booking.identifier}</span>
                <span className="text-gray-400 truncate flex-1">{f.booking.deliveryAddress.split(",")[0]}</span>
                <span className="font-bold text-gray-500 font-mono">SAIL {f.sailLevel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Bookings ──────────────────────────────────────────────────────

function BookingsSection() {
  const [filter, setFilter] = useState<string>("all");

  const statusColors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-500",
    quoted: "bg-indigo-100 text-indigo-700",
  };
  const statusLabels: Record<string, string> = {
    confirmed: "Bestätigt",
    pending: "Ausstehend",
    completed: "Abgeschlossen",
    in_progress: "In Bearbeitung",
    cancelled: "Storniert",
    draft: "Entwurf",
    quoted: "Angeboten",
  };

  const filtered = filter === "all" ? DEMO_BOOKINGS : DEMO_BOOKINGS.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Alle Buchungen" value={DEMO_BOOKINGS.length} icon={Package} color="red" />
        <KpiCard title="Bestätigt" value={DEMO_BOOKINGS.filter((b) => b.status === "confirmed").length} icon={CheckCircle2} color="green" />
        <KpiCard title="Ausstehend" value={DEMO_BOOKINGS.filter((b) => b.status === "pending").length} icon={Clock} color="amber" />
        <KpiCard title="Abgeschlossen" value={DEMO_BOOKINGS.filter((b) => b.status === "completed").length} icon={CheckCircle2} color="emerald" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: "all", label: "Alle" },
          { id: "pending", label: "Ausstehend" },
          { id: "confirmed", label: "Bestätigt" },
          { id: "in_progress", label: "In Bearbeitung" },
          { id: "completed", label: "Abgeschlossen" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f.id
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Buchung", "Kunde", "Route", "Nutzlast", "Preis", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-sm font-bold text-gray-900 font-mono">{booking.identifier}</p>
                  <p className="text-[10px] text-gray-400">{booking.serviceType}</p>
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">{booking.pilotName}</td>
                <td className="px-5 py-3">
                  <p className="text-xs text-gray-600 truncate max-w-[200px]">{booking.pickupAddress?.split(",")[0] ?? "\u2014"}</p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[200px]">→ {booking.deliveryAddress?.split(",")[0] ?? "\u2014"}</p>
                </td>
                <td className="px-5 py-3 text-xs text-gray-600">{booking.payloadWeightKg} kg</td>
                <td className="px-5 py-3 text-sm font-bold text-gray-900 font-mono">CHF {parseFloat(booking.totalCHF).toLocaleString("de-CH")}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[booking.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {statusLabels[booking.status] ?? booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Analytics ─────────────────────────────────────────────────────

const CHART_COLORS = ["#ef4444", "#6366f1", "#0891b2", "#16a34a", "#d97706", "#dc2626"];
const STATUS_LABELS: Record<string, string> = { draft: "Entwurf", pending: "Ausstehend", quoted: "Angeboten", confirmed: "Bestätigt", in_progress: "In Bearbeitung", completed: "Abgeschlossen", cancelled: "Storniert" };
const SERVICE_LABELS: Record<string, string> = { LASTENFLUG: "Lastenflug", PERSONENFLUG: "Personenflug", INSPEKTION: "Inspektion" };

const DEMO_ANALYTICS_OVERVIEW = {
  totalBookings: DEMO_BOOKINGS.length,
  totalRevenueCHF: DEMO_BOOKINGS.reduce((sum, b) => sum + parseFloat(b.totalCHF || "0"), 0),
  completedFlights: DEMO_FLIGHTS.filter((f) => f.status === "completed").length,
  totalFlights: DEMO_FLIGHTS.length,
  bookingsByStatus: DEMO_BOOKINGS.reduce<Record<string, number>>((acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc; }, {}),
  unpaidInvoicesCount: 2,
  unpaidInvoicesTotalCHF: 1840,
};

const DEMO_ANALYTICS_TIMELINE = DEMO_WEEKLY_DATA.map((d) => ({ date: `2026-04-${String(DEMO_WEEKLY_DATA.indexOf(d) + 13).padStart(2, "0")}`, count: d.flights, revenue: d.revenue }));

const DEMO_ANALYTICS_ROUTES = DEMO_AREA_DATA.slice(0, 5).map((a) => ({ address: a.name, count: a.flights }));

const DEMO_ANALYTICS_SERVICES = DEMO_SERVICE_DISTRIBUTION.slice(0, 3).map((s) => ({ serviceType: s.name === "Lastenflug" ? "LASTENFLUG" : s.name === "Inspektion" ? "INSPEKTION" : "PERSONENFLUG", count: s.value, revenue: s.value * 520 }));

function AnalyticsSection() {
  const overviewQ = trpc.analytics.overview.useQuery();
  const timelineQ = trpc.analytics.bookingsOverTime.useQuery({ days: 90 });
  const routesQ = trpc.analytics.popularRoutes.useQuery();
  const serviceQ = trpc.analytics.serviceTypeBreakdown.useQuery();
  const payloadQ = trpc.analytics.avgPayloadWeight.useQuery();
  const isLoading = overviewQ.isLoading || timelineQ.isLoading || serviceQ.isLoading;
  const hasError = overviewQ.error || timelineQ.error || routesQ.error || serviceQ.error || payloadQ.error;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-5 gap-4">{[...Array(5)].map((_, i) => (<div key={i} className="bg-white rounded-2xl border border-gray-200 h-24" />))}</div>
        <div className="bg-white rounded-2xl border border-gray-200 h-72" />
      </div>
    );
  }

  const ov = hasError ? DEMO_ANALYTICS_OVERVIEW : overviewQ.data;
  const timeline = hasError ? DEMO_ANALYTICS_TIMELINE : (timelineQ.data ?? []);
  const routes = hasError ? DEMO_ANALYTICS_ROUTES : (routesQ.data ?? []);
  const services = hasError ? DEMO_ANALYTICS_SERVICES : (serviceQ.data ?? []);
  const payload = hasError ? { avg: 34, min: 8, max: 65 } : payloadQ.data;

  const statusPieData = Object.entries(ov?.bookingsByStatus ?? {}).filter(([, v]) => v > 0).map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v }));
  const serviceBarData = services.map((s) => ({ name: SERVICE_LABELS[s.serviceType] ?? s.serviceType, Buchungen: s.count, "Umsatz (CHF)": Math.round(s.revenue) }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard title="Buchungen gesamt" value={ov?.totalBookings ?? 0} icon={Package} color="red" trend={{ value: "12%", positive: true }} />
        <KpiCard title="Umsatz" value={`CHF ${(ov?.totalRevenueCHF ?? 0).toLocaleString("de-CH", { minimumFractionDigits: 0 })}`} icon={TrendingUp} color="green" trend={{ value: "8%", positive: true }} />
        <KpiCard title="Flüge" value={`${ov?.completedFlights ?? 0} / ${ov?.totalFlights ?? 0}`} sub="abgeschlossen / gesamt" icon={Plane} color="indigo" />
        <KpiCard title="Ø Nutzlast" value={payload ? `${payload.avg} kg` : "\u2014"} sub={payload ? `Min ${payload.min} kg · Max ${payload.max} kg` : undefined} icon={Truck} color="amber" />
        <KpiCard title="Offene Rechnungen" value={ov?.unpaidInvoicesCount ?? 0} sub={ov?.unpaidInvoicesTotalCHF ? `CHF ${ov.unpaidInvoicesTotalCHF.toLocaleString("de-CH")}` : undefined} icon={FileText} color={ov && ov.unpaidInvoicesCount > 0 ? "amber" : "green"} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Buchungen & Umsatz (letzte 90 Tage)</h2>
          <span className="text-[10px] text-gray-400">{timeline.length} Datenpunkte</span>
        </div>
        {timeline.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2"><AlertCircle className="w-4 h-4" />Noch keine Daten</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorRevAdmin2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                <linearGradient id="colorBookAdmin2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth() + 1}.`; }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `${v} CHF`} />
              <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} labelFormatter={(l) => new Date(l).toLocaleDateString("de-CH")} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
              <Area yAxisId="left" type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#colorBookAdmin2)" name="Buchungen" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fill="url(#colorRevAdmin2)" name="Umsatz (CHF)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Buchungen nach Status</h2>
          {statusPieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2"><AlertCircle className="w-4 h-4" />Keine Buchungen</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusPieData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", background: "#fff", border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Leistungsarten</h2>
          {serviceBarData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2"><AlertCircle className="w-4 h-4" />Keine Daten</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={serviceBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px", background: "#fff", border: "1px solid #e5e7eb" }} />
                <Bar dataKey="Buchungen" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Häufigste Lieferadressen</h2>
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
                      <span className="text-xs text-gray-600 truncate flex-1">{route.address}</span>
                      <span className="text-xs font-semibold text-gray-500 ml-2">{route.count}x</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Safety & Compliance ───────────────────────────────────────────

function SafetySection() {
  const total = DEMO_AUTHORIZATIONS.length;
  const approved = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "approved").length;
  const rejected = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "rejected").length;
  const escalated = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "escalated").length;
  const openIncidents = DEMO_INCIDENTS.filter((i) => i.status !== "resolved").length;
  const activeFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air" || f.status === "pre_flight_check").length;

  const severityColors: Record<string, string> = { low: "bg-gray-100 text-gray-600", medium: "bg-amber-100 text-amber-700", high: "bg-red-100 text-red-700" };
  const statusColors: Record<string, string> = { resolved: "bg-emerald-100 text-emerald-700", under_review: "bg-amber-100 text-amber-700", open: "bg-red-100 text-red-700" };
  const statusLabels: Record<string, string> = { resolved: "Behoben", under_review: "In Prüfung", open: "Offen" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Aktive Flüge" value={activeFlights} icon={Plane} color="blue" />
        <KpiCard title="Genehmigt" value={approved} icon={CheckCircle2} color="green" />
        <KpiCard title="Abgelehnt" value={rejected} icon={XCircle} color="amber" />
        <KpiCard title="Eskaliert" value={escalated} icon={AlertTriangle} color="amber" />
        <KpiCard title="Offene Vorfälle" value={openIncidents} icon={AlertCircle} color={openIncidents > 0 ? "amber" : "green"} />
        <KpiCard title="Genehmigungsrate" value={`${Math.round((approved / total) * 100)}%`} icon={Activity} color="green" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Flugfreigabe-Workflow (LUC)</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Dreistufig: KI → Safety Manager → Accountable Manager</p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
            {[
              { icon: Zap, label: "KI-System", color: "bg-red-50 border-red-100 text-red-500" },
              { icon: Eye, label: "Safety Mgr", color: "bg-amber-50 border-amber-100 text-amber-500" },
              { icon: ShieldCheck, label: "Acc. Mgr", color: "bg-purple-50 border-purple-100 text-purple-500" },
              { icon: CheckCircle2, label: "Freigabe", color: "bg-green-50 border-green-100 text-green-500" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${step.color}`}><step.icon className="w-5 h-5" /></div>
                  <span className="text-[9px] font-bold text-gray-500">{step.label}</span>
                </div>
                {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /><h3 className="text-sm font-bold text-gray-900">Incident-Register & Near-Miss</h3></div>
          <span className="text-[10px] text-gray-400">{DEMO_INCIDENTS.length} Einträge</span>
        </div>
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
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${severityColors[inc.severity] ?? ""}`}>{inc.severity === "low" ? "Gering" : inc.severity === "medium" ? "Mittel" : "Hoch"}</span></td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[inc.status] ?? ""}`}>{statusLabels[inc.status] ?? inc.status}</span></td>
                  <td className="px-5 py-3 text-xs text-gray-500">{inc.pilot}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-mono">{inc.drone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Fleet ─────────────────────────────────────────────────────────

function FleetSection() {
  const activeDrones = DEMO_DRONES.filter((d) => d.isActive);
  const totalFlights = DEMO_DRONES.reduce((sum, d) => sum + d.totalFlights, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Drohnen total" value={DEMO_DRONES.length} icon={Plane} color="red" />
        <KpiCard title="Aktiv" value={activeDrones.length} icon={CheckCircle2} color="green" />
        <KpiCard title="In Wartung" value={DEMO_DRONES.length - activeDrones.length} icon={Wrench} color="amber" />
        <KpiCard title="Flüge total" value={totalFlights} icon={Activity} color="indigo" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><Plane className="w-4 h-4 text-red-500 -rotate-45" /><h3 className="text-sm font-bold text-gray-900">Flottenübersicht</h3></div>
          <span className="text-[10px] text-gray-400">{DEMO_DRONES.length} Drohnen registriert</span>
        </div>
        <div className="divide-y divide-gray-50">
          {DEMO_DRONES.map((drone) => (
            <div key={drone.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${drone.isActive ? "bg-red-50 border border-red-100" : "bg-gray-100 border border-gray-200"}`}>
                  <Plane className={`w-5 h-5 ${drone.isActive ? "text-red-500" : "text-gray-400"} -rotate-45`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{drone.model}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{drone.serialNumber} · {drone.totalFlights} Flüge · Max {drone.maxPayloadKg} kg</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Batterie SoH</p>
                  <p className={`text-sm font-bold font-mono ${drone.batteryHealthPct >= 90 ? "text-emerald-500" : drone.batteryHealthPct >= 80 ? "text-amber-500" : "text-red-500"}`}>{drone.batteryHealthPct}%</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${drone.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {drone.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4"><Wrench className="w-4 h-4 text-red-500" /><h3 className="text-sm font-bold text-gray-900">Wartungsplan</h3></div>
        <div className="space-y-3">
          {DEMO_DRONES.map((drone) => {
            const nextMaintenance = drone.totalFlights > 80 ? "Fällig" : drone.totalFlights > 50 ? "Bald fällig" : "OK";
            const urgencyColor = drone.totalFlights > 80 ? "text-red-500 bg-red-50 border-red-100" : drone.totalFlights > 50 ? "text-amber-500 bg-amber-50 border-amber-100" : "text-green-500 bg-green-50 border-green-100";
            return (
              <div key={drone.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Plane className="w-4 h-4 text-gray-400 -rotate-45" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{drone.model}</p>
                    <p className="text-[10px] text-gray-400">{drone.totalFlights} Flüge seit letzter Wartung</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${urgencyColor}`}>{nextMaintenance}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Team ──────────────────────────────────────────────────────────

function TeamSection() {
  const pilots = [
    { name: "Hans Müller", cert: "A1/A3, A2, STS-01", active: true },
    { name: "Sarah Weber", cert: "A1/A3, A2", active: true },
    { name: "Marco Brunner", cert: "A1/A3, A2, STS-01, STS-02", active: true },
    { name: "Lisa Keller", cert: "A1/A3, A2", active: false },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Piloten" value={pilots.length} icon={Users} color="red" />
        <KpiCard title="Safety Manager" value={2} icon={ShieldCheck} color="green" />
        <KpiCard title="Franchise-Partner" value={DEMO_FRANCHISE_PARTNERS.length} icon={MapPin} color="purple" />
        <KpiCard title="Gesamte Drohnen" value={DEMO_FRANCHISE_PARTNERS.reduce((s, p) => s + p.droneCount, 0) + DEMO_DRONES.length} icon={Plane} color="indigo" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Piloten-Team</h3></div>
          <div className="divide-y divide-gray-50">
            {pilots.map((p) => (
              <div key={p.name} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center border border-red-100"><Users className="w-3.5 h-3.5 text-red-500" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-[10px] text-gray-400">Pilot · DJI FlyCart 100 · {p.cert}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${p.active ? "bg-green-500" : "bg-gray-300"}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Franchise-Netzwerk</h3></div>
          <div className="divide-y divide-gray-50">
            {DEMO_FRANCHISE_PARTNERS.map((partner) => (
              <div key={partner.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-100"><MapPin className="w-4 h-4 text-indigo-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{partner.name}</p>
                    <p className="text-[10px] text-gray-400">{partner.region} · {partner.droneCount} Drohnen · {partner.pilotCount} Piloten</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">CHF {partner.monthlyRevenue.toLocaleString("de-CH")}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${partner.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {partner.status === "active" ? "Aktiv" : "Onboarding"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Mitarbeiter ───────────────────────────────────────────────────

const DEMO_EMPLOYEES = [
  { name: "Hans Müller", role: "Pilot / PIC", contract: "Unbefristet", pensum: "100%", status: "aktiv" as const, hoursThisMonth: 156.5, hoursSoll: 168, vacationTotal: 25, vacationUsed: 7, vacationPending: 12, sickDays: 2, absentToday: false },
  { name: "Sarah Weber", role: "Pilotin / PIC", contract: "Unbefristet", pensum: "100%", status: "aktiv" as const, hoursThisMonth: 162.0, hoursSoll: 168, vacationTotal: 25, vacationUsed: 5, vacationPending: 5, sickDays: 0, absentToday: false },
  { name: "Marco Brunner", role: "Pilot / PIC", contract: "Unbefristet", pensum: "80%", status: "aktiv" as const, hoursThisMonth: 120.0, hoursSoll: 134.4, vacationTotal: 25, vacationUsed: 10, vacationPending: 0, sickDays: 3, absentToday: false },
  { name: "Lisa Keller", role: "Pilotin / PIC", contract: "Befristet", pensum: "100%", status: "aktiv" as const, hoursThisMonth: 148.0, hoursSoll: 168, vacationTotal: 20, vacationUsed: 3, vacationPending: 10, sickDays: 1, absentToday: true },
  { name: "Thomas Frei", role: "Safety Manager", contract: "Unbefristet", pensum: "100%", status: "aktiv" as const, hoursThisMonth: 170.0, hoursSoll: 168, vacationTotal: 25, vacationUsed: 8, vacationPending: 5, sickDays: 0, absentToday: false },
  { name: "Anna Roth", role: "Safety Managerin", contract: "Unbefristet", pensum: "60%", status: "aktiv" as const, hoursThisMonth: 95.5, hoursSoll: 100.8, vacationTotal: 25, vacationUsed: 12, vacationPending: 0, sickDays: 4, absentToday: false },
];

function MitarbeiterSection() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const totalEmployees = DEMO_EMPLOYEES.length;
  const absentToday = DEMO_EMPLOYEES.filter((e) => e.absentToday).length;
  const avgVacationUsed = Math.round(DEMO_EMPLOYEES.reduce((s, e) => s + e.vacationUsed, 0) / totalEmployees);
  const totalSickDays = DEMO_EMPLOYEES.reduce((s, e) => s + e.sickDays, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Mitarbeiter" value={totalEmployees} icon={Users} color="red" />
        <KpiCard title="Abwesend heute" value={absentToday} icon={CalendarDays} color={absentToday > 0 ? "amber" : "green"} />
        <KpiCard title="Ø Ferien bezogen" value={`${avgVacationUsed} Tage`} icon={CalendarDays} color="indigo" />
        <KpiCard title="Krankheitstage (Gesamt)" value={totalSickDays} icon={Activity} color="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Alle Mitarbeiter</h3>
          <span className="text-[10px] text-gray-400">April 2026</span>
        </div>
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
                <tr key={emp.name} onClick={() => setSelectedEmployee(selectedEmployee === emp.name ? null : emp.name)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center border border-red-100"><Users className="w-3.5 h-3.5 text-red-500" /></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-[10px] text-gray-400">{emp.role} · {emp.pensum}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${emp.contract === "Unbefristet" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{emp.contract}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-gray-900">{emp.hoursThisMonth}h / {emp.hoursSoll}h</span>
                      <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${hoursPercent >= 100 ? "bg-emerald-500" : hoursPercent >= 80 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${Math.min(hoursPercent, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-xs font-bold text-gray-900">{vacationRemaining}</span>
                    <span className="text-[10px] text-gray-400"> / {emp.vacationTotal}</span>
                    {emp.vacationPending > 0 && <span className="ml-1.5 text-[10px] text-amber-500">({emp.vacationPending} beantragt)</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs font-bold ${emp.sickDays > 3 ? "text-red-500" : emp.sickDays > 0 ? "text-amber-500" : "text-emerald-500"}`}>{emp.sickDays} Tage</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {emp.absentToday ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">Abwesend</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">Anwesend</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEmployee && (() => {
        const emp = DEMO_EMPLOYEES.find((e) => e.name === selectedEmployee);
        if (!emp) return null;
        return (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center border border-red-100"><Users className="w-5 h-5 text-red-500" /></div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{emp.name}</h3>
                  <p className="text-xs text-gray-400">{emp.role} · {emp.pensum} · {emp.contract}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="text-xs text-gray-400 hover:text-gray-700">Schliessen</button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Stunden diesen Monat</p>
                <p className="text-lg font-bold text-gray-900">{emp.hoursThisMonth}h</p>
                <p className="text-[10px] text-gray-400">Soll: {emp.hoursSoll}h · {Math.round((emp.hoursThisMonth / emp.hoursSoll) * 100)}%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Ferien-Saldo</p>
                <p className="text-lg font-bold text-gray-900">{emp.vacationTotal - emp.vacationUsed} Tage</p>
                <p className="text-[10px] text-gray-400">{emp.vacationUsed} bezogen / {emp.vacationTotal} Total</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Beantragt</p>
                <p className="text-lg font-bold text-amber-500">{emp.vacationPending} Tage</p>
                <p className="text-[10px] text-gray-400">Ferien + Weiterbildung</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Krankheitstage</p>
                <p className={`text-lg font-bold ${emp.sickDays > 3 ? "text-red-500" : "text-gray-900"}`}>{emp.sickDays}</p>
                <p className="text-[10px] text-gray-400">Laufendes Jahr</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Section: Invoices ──────────────────────────────────────────────────────

function InvoicesSection() {
  const demoInvoices = DEMO_BOOKINGS.filter((b) => b.status === "completed" || b.status === "confirmed").map((b, i) => ({
    id: `inv-${i}`,
    number: `INV-2026-${String(i + 1).padStart(4, "0")}`,
    customer: b.pilotName,
    booking: b.identifier,
    amount: parseFloat(b.totalCHF),
    status: i % 3 === 0 ? "paid" : i % 3 === 1 ? "sent" : "overdue",
    date: b.requestedDate ?? "2026-04-15",
  }));

  const statusColors: Record<string, string> = { paid: "bg-green-100 text-green-700", sent: "bg-blue-100 text-blue-700", overdue: "bg-red-100 text-red-700", draft: "bg-gray-100 text-gray-500" };
  const statusLabels: Record<string, string> = { paid: "Bezahlt", sent: "Versendet", overdue: "Überfällig", draft: "Entwurf" };
  const totalAmount = demoInvoices.reduce((s, inv) => s + inv.amount, 0);
  const paidAmount = demoInvoices.filter((i) => i.status === "paid").reduce((s, inv) => s + inv.amount, 0);
  const overdueAmount = demoInvoices.filter((i) => i.status === "overdue").reduce((s, inv) => s + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Rechnungen" value={demoInvoices.length} icon={Receipt} color="red" />
        <KpiCard title="Umsatz gesamt" value={`CHF ${totalAmount.toLocaleString("de-CH")}`} icon={TrendingUp} color="green" />
        <KpiCard title="Bezahlt" value={`CHF ${paidAmount.toLocaleString("de-CH")}`} icon={CheckCircle2} color="emerald" />
        <KpiCard title="Überfällig" value={`CHF ${overdueAmount.toLocaleString("de-CH")}`} icon={AlertTriangle} color={overdueAmount > 0 ? "amber" : "green"} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-red-500" /><h3 className="text-sm font-bold text-gray-900">Alle Rechnungen</h3></div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 flex items-center gap-1"><Filter className="w-3 h-3" /> Filter</button>
            <button className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 flex items-center gap-1"><Download className="w-3 h-3" /> Export</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Rechnung", "Kunde", "Buchung", "Betrag", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {demoInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3"><p className="text-sm font-bold text-gray-900 font-mono">{inv.number}</p><p className="text-[10px] text-gray-400">{formatDateTime(inv.date)}</p></td>
                <td className="px-5 py-3 text-sm text-gray-700">{inv.customer}</td>
                <td className="px-5 py-3 text-xs text-gray-500 font-mono">{inv.booking}</td>
                <td className="px-5 py-3 text-sm font-bold text-gray-900 font-mono">CHF {inv.amount.toLocaleString("de-CH")}</td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[inv.status] ?? "bg-gray-100 text-gray-500"}`}>{statusLabels[inv.status] ?? inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: SORA & Bewilligungen ──────────────────────────────────────────

function SoraSection() {
  const decisionColors: Record<string, string> = { approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", escalated: "bg-amber-100 text-amber-700", pending: "bg-blue-100 text-blue-700" };
  const decisionLabels: Record<string, string> = { approved: "Genehmigt", rejected: "Abgelehnt", escalated: "Eskaliert", pending: "Ausstehend" };
  const riskColors: Record<string, string> = { LOW: "text-green-500", MEDIUM: "text-amber-500", HIGH: "text-red-500", CRITICAL: "text-red-700" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Bewilligungen" value={DEMO_AUTHORIZATIONS.length} icon={FileCheck} color="red" />
        <KpiCard title="Genehmigt" value={DEMO_AUTHORIZATIONS.filter((a) => a.decision === "approved").length} icon={CheckCircle2} color="green" />
        <KpiCard title="Abgelehnt" value={DEMO_AUTHORIZATIONS.filter((a) => a.decision === "rejected").length} icon={XCircle} color="amber" />
        <KpiCard title="Eskaliert" value={DEMO_AUTHORIZATIONS.filter((a) => a.decision === "escalated").length} icon={AlertTriangle} color="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4 text-red-500" /><h3 className="text-sm font-bold text-gray-900">SORA Framework</h3></div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "SAIL I", desc: "Niedriges Risiko, keine Bewilligung nötig", color: "bg-green-50 border-green-100 text-green-700" },
            { label: "SAIL II", desc: "Mittleres Risiko, Standard-Bewilligung", color: "bg-amber-50 border-amber-100 text-amber-700" },
            { label: "SAIL III+", desc: "Hohes Risiko, erweiterte Prüfung", color: "bg-red-50 border-red-100 text-red-700" },
          ].map((sail) => (
            <div key={sail.label} className={`rounded-xl p-4 border ${sail.color}`}>
              <p className="text-sm font-bold">{sail.label}</p>
              <p className="text-[10px] mt-1 opacity-70">{sail.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Bewilligungs-Register</h3>
          <span className="text-[10px] text-gray-400">{DEMO_AUTHORIZATIONS.length} Einträge</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Route", "SAIL", "GRC", "Risiko", "Entscheid"].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DEMO_AUTHORIZATIONS.map((auth, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-xs text-gray-600 truncate max-w-[250px]">{auth.pickupLat}, {auth.pickupLng}</p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[250px]">→ {auth.deliveryLat}, {auth.deliveryLng}</p>
                </td>
                <td className="px-5 py-3 text-xs font-bold text-gray-900 font-mono">SAIL {auth.sailLevel}</td>
                <td className="px-5 py-3 text-xs font-mono text-gray-700">{auth.grc ?? "\u2014"}</td>
                <td className="px-5 py-3"><span className={`text-xs font-bold ${riskColors[auth.overallRisk] ?? "text-gray-500"}`}>{auth.overallRisk}</span></td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${decisionColors[auth.decision] ?? "bg-gray-100 text-gray-500"}`}>{decisionLabels[auth.decision] ?? auth.decision}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Settings ──────────────────────────────────────────────────────

function SettingsSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Unternehmen</h3>
        <div className="grid grid-cols-2 gap-6">
          <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Firma</p><p className="text-sm font-bold text-gray-900">VSNZ GmbH</p></div>
          <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Betriebsbewilligung</p><p className="text-sm font-bold text-gray-900">LUC-CH-2026-0047</p></div>
          <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Aufsichtsbehörde</p><p className="text-sm text-gray-700">BAZL / skyguide / EASA</p></div>
          <div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Rechtsgrundlage</p><p className="text-sm text-gray-700">LFG SR 748.0 · EU 2019/947</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Betriebsparameter</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Max. Nutzlast", value: "85 kg (Dual)", icon: Package },
            { label: "Max. Reichweite", value: "12 km", icon: Navigation },
            { label: "Max. Flughöhe", value: "120 m AGL", icon: Gauge },
            { label: "Min. Sichtweite", value: "5 km", icon: Eye },
            { label: "Max. Windgeschw.", value: "40 km/h", icon: Activity },
            { label: "Betriebszeiten", value: "06:00 – 22:00", icon: Clock },
          ].map((param) => (
            <div key={param.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center border border-red-100"><param.icon className="w-4 h-4 text-red-500" /></div>
              <div><p className="text-[10px] font-semibold text-gray-400 uppercase">{param.label}</p><p className="text-sm font-bold text-gray-900">{param.value}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Integrationen</h3>
        <div className="space-y-3">
          {[
            { name: "Clerk Authentication", status: "Aktiv", ok: true },
            { name: "Stripe Billing", status: "Aktiv", ok: true },
            { name: "Cloudflare R2 Storage", status: "Aktiv", ok: true },
            { name: "SafeSky ADS-B", status: "Aktiv", ok: true },
            { name: "INVOLI UTM", status: "Aktiv", ok: true },
            { name: "DJI Cloud API", status: "Ausstehend", ok: false },
            { name: "swisstopo DHM25", status: "In Prüfung", ok: false },
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${integration.ok ? "bg-green-500" : "bg-amber-400"}`} />
                <span className="text-xs font-semibold text-gray-900">{integration.name}</span>
              </div>
              <span className={`text-[10px] font-semibold ${integration.ok ? "text-green-600" : "text-amber-500"}`}>{integration.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section Title Map ──────────────────────────────────────────────────────

const SECTION_TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  overview: { title: "Dashboard", subtitle: "Betriebsübersicht und Schnellzugriff" },
  "live-ops": { title: "Live Operations", subtitle: "Echtzeit-Flugüberwachung und Telemetrie" },
  bookings: { title: "Buchungsverwaltung", subtitle: "Alle Buchungen verwalten und überwachen" },
  analytics: { title: "Analytics & Finanzen", subtitle: "Betriebskennzahlen, Umsatz und Performance" },
  safety: { title: "Safety & Compliance", subtitle: "Flugfreigaben, Risikobewertung, Vorfälle" },
  fleet: { title: "Flotte & Wartung", subtitle: "Drohnen-Status, Verschleiss und Wartungsplanung" },
  team: { title: "Team & Franchise", subtitle: "Piloten, Safety Manager und Franchise-Partner" },
  mitarbeiter: { title: "Mitarbeiter-Übersicht", subtitle: "Arbeitszeiten, Ferien-Saldo, Abwesenheiten und Vertragsstatus" },
  invoices: { title: "Rechnungen & Zahlungen", subtitle: "Rechnungsverwaltung, Zahlungsstatus und Export" },
  sora: { title: "SORA & Bewilligungen", subtitle: "SORA Framework, Bewilligungsregister und Compliance-Status" },
  settings: { title: "Einstellungen", subtitle: "Betriebsparameter, Integrationen und Systemkonfiguration" },
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────

function AdminDashboardInner() {
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get("section") as AdminSection) || "overview";
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);
  const sectionMeta = SECTION_TITLES[activeSection];

  const liveFlightCount = DEMO_FLIGHTS.filter(
    (f) => f.status === "in_air" || f.status === "pre_flight_check"
  ).length;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        liveFlightCount={liveFlightCount}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminTopBar
          title={sectionMeta.title}
          subtitle={sectionMeta.subtitle}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "live-ops" && <LiveOpsSection />}
          {activeSection === "bookings" && <BookingsSection />}
          {activeSection === "analytics" && <AnalyticsSection />}
          {activeSection === "safety" && <SafetySection />}
          {activeSection === "fleet" && <FleetSection />}
          {activeSection === "team" && <TeamSection />}
          {activeSection === "mitarbeiter" && <MitarbeiterSection />}
          {activeSection === "invoices" && <InvoicesSection />}
          {activeSection === "sora" && <SoraSection />}
          {activeSection === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-gray-50/50 items-center justify-center">Loading…</div>}>
      <AdminDashboardInner />
    </Suspense>
  );
}
