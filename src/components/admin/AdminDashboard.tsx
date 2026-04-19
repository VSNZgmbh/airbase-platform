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
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type AdminTab = "analytics" | "safety" | "fleet" | "team";

// ─── Sidebar ────────────────────────────────────────────────────────────────

function AdminSidebar({ activeTab, onTabChange }: { activeTab: AdminTab; onTabChange: (tab: AdminTab) => void }) {
  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col min-h-screen">
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg tracking-tight leading-none">AIRBASE</div>
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Admin & Safety</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] px-3 mb-2">Management</p>
        {[
          { id: "analytics" as AdminTab, icon: BarChart3, label: "Analytics & Finanzen" },
          { id: "safety" as AdminTab, icon: ShieldCheck, label: "Safety & Compliance" },
          { id: "fleet" as AdminTab, icon: Plane, label: "Flotte & Wartung" },
          { id: "team" as AdminTab, icon: Users, label: "Team & Franchise" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
              activeTab === item.id
                ? "bg-blue-600/20 text-blue-400 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-blue-400" : "text-slate-500"}`} />
            {item.label}
          </button>
        ))}

        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] px-3 mt-6 mb-2">Portale</p>
        {[
          { href: "/dashboard", icon: Users, label: "Kundenportal" },
          { href: "/pilot", icon: Compass, label: "Pilot Cockpit" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all mb-0.5"
          >
            <item.icon className="w-4 h-4 text-slate-500" />
            {item.label}
          </a>
        ))}
      </nav>

      {/* System Status */}
      <div className="px-4 pb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold text-emerald-400">SYSTEM AKTIV</span>
          </div>
          <p className="text-[10px] text-slate-500">VSNZ GmbH</p>
          <p className="text-[10px] text-slate-600">BAZL · LFG SR 748.0 · EASA</p>
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
    <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-base font-bold text-white">{title}</h1>
        <p className="text-[10px] text-slate-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <ConnectionStatus />
        <span className="font-mono text-lg font-bold text-blue-400">{time}</span>
        <span className="text-[10px] text-slate-600 font-mono">UTC+2</span>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(dt: Date | string | null) {
  if (!dt) return "\u2014";
  return new Date(dt).toLocaleString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, color = "blue", trend }: {
  title: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "indigo";
  trend?: { value: string; positive: boolean };
}) {
  const styles: Record<string, { icon: string; border: string }> = {
    blue: { icon: "bg-blue-900/50 text-blue-400 border-blue-800", border: "border-l-blue-500" },
    green: { icon: "bg-emerald-900/50 text-emerald-400 border-emerald-800", border: "border-l-emerald-500" },
    amber: { icon: "bg-amber-900/50 text-amber-400 border-amber-800", border: "border-l-amber-500" },
    red: { icon: "bg-red-900/50 text-red-400 border-red-800", border: "border-l-red-500" },
    purple: { icon: "bg-purple-900/50 text-purple-400 border-purple-800", border: "border-l-purple-500" },
    indigo: { icon: "bg-indigo-900/50 text-indigo-400 border-indigo-800", border: "border-l-indigo-500" },
  };
  const c = styles[color];
  return (
    <div className={`bg-slate-800/50 rounded-lg border-l-4 ${c.border} border border-slate-700 px-4 py-3`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${c.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-xl font-bold text-white font-mono">{value}</p>
        {trend && (
          <span className={`text-[10px] font-semibold mb-0.5 ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
            {trend.positive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Tab: Analytics ─────────────────────────────────────────────────────────

const CHART_COLORS = ["#3b82f6", "#6366f1", "#0891b2", "#16a34a", "#d97706", "#dc2626"];
const STATUS_LABELS: Record<string, string> = { draft: "Entwurf", pending: "Ausstehend", quoted: "Angeboten", confirmed: "Bestätigt", in_progress: "In Bearbeitung", completed: "Abgeschlossen", cancelled: "Storniert" };
const SERVICE_LABELS: Record<string, string> = { LASTENFLUG: "Lastenflug", PERSONENFLUG: "Personenflug", INSPEKTION: "Inspektion" };

function AnalyticsTab() {
  const overviewQ = trpc.analytics.overview.useQuery();
  const timelineQ = trpc.analytics.bookingsOverTime.useQuery({ days: 90 });
  const routesQ = trpc.analytics.popularRoutes.useQuery();
  const serviceQ = trpc.analytics.serviceTypeBreakdown.useQuery();
  const payloadQ = trpc.analytics.avgPayloadWeight.useQuery();
  const isLoading = overviewQ.isLoading || timelineQ.isLoading || serviceQ.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-5 gap-4">{[...Array(5)].map((_, i) => (<div key={i} className="bg-slate-800/50 rounded-lg border border-slate-700 h-24" />))}</div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 h-72" />
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
        <KpiCard title="Buchungen gesamt" value={ov?.totalBookings ?? 0} icon={Package} color="blue" trend={{ value: "12%", positive: true }} />
        <KpiCard title="Umsatz" value={`CHF ${(ov?.totalRevenueCHF ?? 0).toLocaleString("de-CH", { minimumFractionDigits: 0 })}`} icon={TrendingUp} color="green" trend={{ value: "8%", positive: true }} />
        <KpiCard title="Flüge" value={`${ov?.completedFlights ?? 0} / ${ov?.totalFlights ?? 0}`} sub="abgeschlossen / gesamt" icon={Plane} color="indigo" />
        <KpiCard title="Ø Nutzlast" value={payload ? `${payload.avg} kg` : "—"} sub={payload ? `Min ${payload.min} kg · Max ${payload.max} kg` : undefined} icon={Truck} color="amber" />
        <KpiCard title="Offene Rechnungen" value={ov?.unpaidInvoicesCount ?? 0} sub={ov?.unpaidInvoicesTotalCHF ? `CHF ${ov.unpaidInvoicesTotalCHF.toLocaleString("de-CH")}` : undefined} icon={FileText} color={ov && ov.unpaidInvoicesCount > 0 ? "red" : "green"} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Buchungen & Umsatz (letzte 90 Tage)</h2>
          <span className="text-[10px] text-slate-500">{timeline.length} Datenpunkte</span>
        </div>
        {timeline.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm gap-2"><AlertCircle className="w-4 h-4" />Noch keine Daten</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                <linearGradient id="colorBookAdmin" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth() + 1}.`; }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v} CHF`} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", background: "#1e293b", border: "1px solid #334155", color: "#f8fafc" }} labelFormatter={(l) => new Date(l).toLocaleDateString("de-CH")} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              <Area yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorBookAdmin)" name="Buchungen" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevAdmin)" name="Umsatz (CHF)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking Status Pie */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-sm font-bold text-white mb-4">Buchungen nach Status</h2>
          {statusPieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm gap-2"><AlertCircle className="w-4 h-4" />Keine Buchungen</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusPieData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", background: "#1e293b", border: "1px solid #334155", color: "#f8fafc" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Service Types */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-sm font-bold text-white mb-4">Leistungsarten</h2>
          {serviceBarData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm gap-2"><AlertCircle className="w-4 h-4" />Keine Daten</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={serviceBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", background: "#1e293b", border: "1px solid #334155", color: "#f8fafc" }} />
                <Bar dataKey="Buchungen" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Popular Routes */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-sm font-bold text-white mb-4">Häufigste Lieferadressen</h2>
          {routes.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-slate-500 text-sm gap-2"><AlertCircle className="w-4 h-4" />Keine Daten</div>
          ) : (
            <div className="space-y-3">
              {routes.map((route, i) => {
                const maxCount = routes[0]?.count ?? 1;
                const pct = Math.round((route.count / maxCount) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300 truncate flex-1">{route.address}</span>
                      <span className="text-xs font-semibold text-slate-400 ml-2">{route.count}x</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
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

// ─── Tab: Safety & Compliance ───────────────────────────────────────────────

function SafetyTab() {
  const total = DEMO_AUTHORIZATIONS.length;
  const approved = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "approved").length;
  const rejected = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "rejected").length;
  const escalated = DEMO_AUTHORIZATIONS.filter((a) => a.decision === "escalated").length;
  const openIncidents = DEMO_INCIDENTS.filter((i) => i.status !== "resolved").length;
  const activeFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air" || f.status === "pre_flight_check").length;
  const liveFlights = DEMO_FLIGHTS.filter((f) => f.status === "in_air");

  const riskFlights = DEMO_FLIGHTS.map((f) => {
    const auth = DEMO_AUTHORIZATIONS.find((a) => a.pickupLat === f.booking.pickupLat && a.pickupLng === f.booking.pickupLng);
    return { ...f, risk: auth?.overallRisk ?? "LOW", sailLevel: auth?.sailLevel ?? "I" };
  });
  const greenCount = riskFlights.filter((f) => f.risk === "LOW").length;
  const yellowCount = riskFlights.filter((f) => f.risk === "MEDIUM").length;
  const redCount = riskFlights.filter((f) => f.risk === "HIGH" || f.risk === "CRITICAL").length;

  const severityColors: Record<string, string> = { low: "bg-slate-700 text-slate-300", medium: "bg-amber-900/50 text-amber-400", high: "bg-red-900/50 text-red-400" };
  const statusColors: Record<string, string> = { resolved: "bg-emerald-900/50 text-emerald-400", under_review: "bg-amber-900/50 text-amber-400", open: "bg-red-900/50 text-red-400" };
  const statusLabels: Record<string, string> = { resolved: "Behoben", under_review: "In Prüfung", open: "Offen" };

  return (
    <div className="space-y-6">
      {/* Status KPIs */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Aktive Flüge", value: activeFlights, color: "blue" as const, icon: Plane },
          { label: "Genehmigt", value: approved, color: "green" as const, icon: CheckCircle2 },
          { label: "Abgelehnt", value: rejected, color: "red" as const, icon: XCircle },
          { label: "Eskaliert", value: escalated, color: "amber" as const, icon: AlertTriangle },
          { label: "Offene Vorfälle", value: openIncidents, color: (openIncidents > 0 ? "red" : "green") as "red" | "green", icon: AlertCircle },
          { label: "Genehmigungsrate", value: `${Math.round((approved / total) * 100)}%`, color: "green" as const, icon: Activity },
        ].map((item) => (
          <KpiCard key={item.label} title={item.label} value={item.value} icon={item.icon} color={item.color} />
        ))}
      </div>

      {/* Live Flight Monitoring + Risk */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2"><Radar className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-bold text-white">Live-Flugüberwachung</h3></div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" /></span>
              <span className="text-[10px] font-bold text-blue-400">LIVE TELEMETRIE</span>
            </div>
          </div>
          <div className="divide-y divide-slate-700">
            {liveFlights.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">Keine aktiven Flüge — Luftraum frei</div>
            ) : (
              liveFlights.map((flight) => (
                <div key={flight.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" /></span>
                      <span className="font-mono text-sm font-bold text-white">{flight.booking.identifier}</span>
                      <span className="text-xs text-slate-400">{flight.booking.pilotName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-800">IN DER LUFT</span>
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
                      <div key={item.label} className="bg-slate-700/50 rounded-lg p-2 border border-slate-600 text-center">
                        <item.icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-white font-mono">{item.value}</p>
                        <p className="text-[9px] text-slate-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Risk */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-bold text-white">KI-Risikoanalyse</h3></div>
            <span className="text-[10px] font-bold text-blue-400">AMPELSYSTEM</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col items-center gap-1.5 bg-slate-900 rounded-2xl px-4 py-3">
                <div className={`w-8 h-8 rounded-full ${greenCount > 0 ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-green-900"}`} />
                <div className={`w-8 h-8 rounded-full ${yellowCount > 0 ? "bg-amber-400 shadow-lg shadow-amber-400/50" : "bg-amber-900"}`} />
                <div className={`w-8 h-8 rounded-full ${redCount > 0 ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-red-900"}`} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between bg-emerald-900/30 rounded-lg px-3 py-2 border border-emerald-800"><span className="text-xs font-semibold text-emerald-400">Niedriges Risiko</span><span className="text-sm font-bold text-emerald-400 font-mono">{greenCount}</span></div>
                <div className="flex items-center justify-between bg-amber-900/30 rounded-lg px-3 py-2 border border-amber-800"><span className="text-xs font-semibold text-amber-400">Mittleres Risiko</span><span className="text-sm font-bold text-amber-400 font-mono">{yellowCount}</span></div>
                <div className="flex items-center justify-between bg-red-900/30 rounded-lg px-3 py-2 border border-red-800"><span className="text-xs font-semibold text-red-400">Hohes Risiko</span><span className="text-sm font-bold text-red-400 font-mono">{redCount}</span></div>
              </div>
            </div>
            <div className="space-y-1.5">
              {riskFlights.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600">
                  <CircleDot className={`w-3.5 h-3.5 flex-shrink-0 ${f.risk === "LOW" ? "text-green-500" : f.risk === "MEDIUM" ? "text-amber-500" : "text-red-500"}`} />
                  <span className="font-mono font-bold text-slate-300">{f.booking.identifier}</span>
                  <span className="text-slate-500 truncate flex-1">{f.booking.deliveryAddress.split(",")[0]}</span>
                  <span className="font-bold text-slate-400 font-mono">SAIL {f.sailLevel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Workflow */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700">
          <h3 className="text-sm font-bold text-white">Flugfreigabe-Workflow (LUC)</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Dreistufig: KI → Safety Manager → Accountable Manager</p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            {[
              { icon: Zap, label: "KI-System", bg: "bg-blue-900/50 border-blue-700", iconColor: "text-blue-400" },
              { icon: Eye, label: "Safety Mgr", bg: "bg-amber-900/50 border-amber-700", iconColor: "text-amber-400" },
              { icon: ShieldCheck, label: "Acc. Mgr", bg: "bg-purple-900/50 border-purple-700", iconColor: "text-purple-400" },
              { icon: CheckCircle2, label: "Freigabe", bg: "bg-emerald-900/50 border-emerald-700", iconColor: "text-emerald-400" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-10 h-10 ${step.bg} rounded-xl flex items-center justify-center border`}><step.icon className={`w-5 h-5 ${step.iconColor}`} /></div>
                  <span className="text-[9px] font-bold text-slate-400">{step.label}</span>
                </div>
                {i < arr.length - 1 && <div className="w-8 h-px bg-slate-600 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Register */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-slate-400" /><h3 className="text-sm font-bold text-white">Incident-Register & Near-Miss</h3></div>
          <span className="text-[10px] text-slate-500">{DEMO_INCIDENTS.length} Einträge</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {["Datum", "Vorfall", "Schweregrad", "Status", "Pilot", "Drohne"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {DEMO_INCIDENTS.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono whitespace-nowrap">{formatDateTime(inc.date)}</td>
                  <td className="px-5 py-3"><p className="text-white font-medium text-xs">{inc.title}</p><p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{inc.description}</p></td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${severityColors[inc.severity] ?? ""}`}>{inc.severity === "low" ? "Gering" : inc.severity === "medium" ? "Mittel" : "Hoch"}</span></td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[inc.status] ?? ""}`}>{statusLabels[inc.status] ?? inc.status}</span></td>
                  <td className="px-5 py-3 text-xs text-slate-400">{inc.pilot}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 font-mono">{inc.drone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Fleet ─────────────────────────────────────────────────────────────

function FleetTab() {
  const activeDrones = DEMO_DRONES.filter((d) => d.isActive);
  const totalFlights = DEMO_DRONES.reduce((sum, d) => sum + d.totalFlights, 0);

  return (
    <div className="space-y-6">
      {/* Fleet Stats */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard title="Drohnen total" value={DEMO_DRONES.length} icon={Plane} color="blue" />
        <KpiCard title="Aktiv" value={activeDrones.length} icon={CheckCircle2} color="green" />
        <KpiCard title="Flüge total" value={totalFlights} icon={Activity} color="indigo" />
      </div>

      {/* Drone List */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700"><h3 className="text-sm font-bold text-white">Flottenübersicht</h3></div>
        <div className="divide-y divide-slate-700/50">
          {DEMO_DRONES.map((drone) => (
            <div key={drone.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${drone.isActive ? "bg-blue-900/50 border border-blue-700" : "bg-slate-700 border border-slate-600"}`}>
                  <Plane className={`w-5 h-5 ${drone.isActive ? "text-blue-400" : "text-slate-500"} -rotate-45`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{drone.model}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{drone.serialNumber} · {drone.totalFlights} Flüge · Max {drone.maxPayloadKg} kg</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Batterie SoH</p>
                  <p className={`text-sm font-bold font-mono ${drone.batteryHealthPct >= 90 ? "text-emerald-400" : drone.batteryHealthPct >= 80 ? "text-amber-400" : "text-red-400"}`}>{drone.batteryHealthPct}%</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${drone.isActive ? "bg-emerald-900/30 text-emerald-400 border-emerald-700" : "bg-slate-700 text-slate-400 border-slate-600"}`}>
                  {drone.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Team & Franchise ──────────────────────────────────────────────────

function TeamTab() {
  const pilots = ["Hans Müller", "Sarah Weber", "Marco Brunner", "Lisa Keller"];

  return (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Piloten" value={pilots.length} icon={Users} color="blue" />
        <KpiCard title="Safety Manager" value={2} icon={ShieldCheck} color="green" />
        <KpiCard title="Franchise-Partner" value={DEMO_FRANCHISE_PARTNERS.length} icon={MapPin} color="purple" />
        <KpiCard title="Gesamte Drohnen" value={DEMO_FRANCHISE_PARTNERS.reduce((s, p) => s + p.droneCount, 0) + DEMO_DRONES.length} icon={Plane} color="indigo" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pilots */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700"><h3 className="text-sm font-bold text-white">Piloten-Team</h3></div>
          <div className="divide-y divide-slate-700/50">
            {pilots.map((name) => (
              <div key={name} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-700/30 transition-colors">
                <div className="w-8 h-8 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-700">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-[10px] text-slate-400">Pilot · DJI FlyCart 100 · Zertifiziert</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Franchise Network */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700"><h3 className="text-sm font-bold text-white">Franchise-Netzwerk</h3></div>
          <div className="divide-y divide-slate-700/50">
            {DEMO_FRANCHISE_PARTNERS.map((partner) => (
              <div key={partner.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-900/50 border border-indigo-700">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{partner.name}</p>
                    <p className="text-[10px] text-slate-400">{partner.region} · {partner.droneCount} Drohnen · {partner.pilotCount} Piloten</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">CHF {partner.monthlyRevenue.toLocaleString("de-CH")}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${partner.status === "active" ? "bg-emerald-900/30 text-emerald-400" : "bg-amber-900/30 text-amber-400"}`}>
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

// ─── Tab Titles ─────────────────────────────────────────────────────────────

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  analytics: { title: "Analytics & Finanzen", subtitle: "Betriebskennzahlen, Umsatz und Performance" },
  safety: { title: "Safety & Compliance", subtitle: "Flugfreigaben, Risikobewertung, Vorfälle" },
  fleet: { title: "Flotte & Wartung", subtitle: "Drohnen-Status, Verschleiss und Wartungsplanung" },
  team: { title: "Team & Franchise", subtitle: "Piloten, Safety Manager und Franchise-Partner" },
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const meta = TAB_TITLES[activeTab];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminTopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "safety" && <SafetyTab />}
          {activeTab === "fleet" && <FleetTab />}
          {activeTab === "team" && <TeamTab />}
        </main>
      </div>
    </div>
  );
}
