"use client";

import { trpc } from "@/lib/trpc/client";
import { DEMO_BOOKINGS, DEMO_DRONES, DEMO_FRANCHISE_PARTNERS } from "@/lib/demo-data";
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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Package,
  TrendingUp,
  Plane,
  FileText,
  AlertCircle,
  Users,
  Wallet,
  BarChart3,
  Settings,
  MapPin,
  ShieldCheck,
  Compass,
  ChevronRight,
  DollarSign,
  Activity,
  Truck,
  Target,
} from "lucide-react";

// ─── Admin Sidebar ──────────────────────────────────────────────────────────

function AdminSidebar() {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg tracking-tight leading-none">AIRBASE</div>
            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Management</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-2">Übersicht</p>
        {[
          { href: "/admin", icon: BarChart3, label: "Analytics", active: true },
          { href: "/admin/fleet", icon: Plane, label: "Flottenmanagement" },
          { href: "/operator", icon: Settings, label: "Buchungsverwaltung" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
              item.active
                ? "bg-violet-50 text-violet-700 font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <item.icon className={`w-4 h-4 ${item.active ? "text-violet-500" : "text-gray-400"}`} />
            {item.label}
          </a>
        ))}

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mt-6 mb-2">Portale</p>
        {[
          { href: "/dashboard", icon: Users, label: "Kunden" },
          { href: "/pilot", icon: Compass, label: "Pilot Cockpit" },
          { href: "/safety", icon: ShieldCheck, label: "Compliance" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all mb-0.5"
          >
            <item.icon className="w-4 h-4 text-gray-400" />
            {item.label}
          </a>
        ))}
      </nav>

      {/* Company info */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1">VSNZ GmbH</p>
          <p className="text-[10px] text-gray-500">Drohnen-Logistik Schweiz</p>
          <p className="text-[10px] text-gray-400 mt-1">HQ: Wilderswil, BE</p>
        </div>
      </div>
    </aside>
  );
}

// ─── Admin Top Bar ──────────────────────────────────────────────────────────

function AdminTopBar() {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Management Dashboard</h1>
        <p className="text-[10px] text-gray-400">Betriebskennzahlen & Firmenübersicht</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, accent = "violet", trend,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "violet" | "green" | "blue" | "amber" | "red" | "purple";
  trend?: { value: string; positive: boolean };
}) {
  const colors: Record<string, { icon: string; bg: string }> = {
    violet: { icon: "bg-violet-100 text-violet-600", bg: "border-l-violet-500" },
    green: { icon: "bg-green-100 text-green-600", bg: "border-l-green-500" },
    blue: { icon: "bg-blue-100 text-blue-600", bg: "border-l-blue-500" },
    amber: { icon: "bg-amber-100 text-amber-600", bg: "border-l-amber-500" },
    red: { icon: "bg-red-100 text-red-600", bg: "border-l-red-500" },
    purple: { icon: "bg-purple-100 text-purple-600", bg: "border-l-purple-500" },
  };
  const c = colors[accent];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${c.bg} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`text-xs font-semibold mb-0.5 ${trend.positive ? "text-green-600" : "text-red-600"}`}>
            {trend.positive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Fleet Overview ─────────────────────────────────────────────────────────

function FleetOverview() {
  const activeDrones = DEMO_DRONES.filter((d) => d.isActive);
  const totalFlights = DEMO_DRONES.reduce((sum, d) => sum + d.totalFlights, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Flottenstatus</h3>
        <a href="/admin/fleet" className="text-[10px] font-semibold text-violet-500 hover:text-violet-600 flex items-center gap-0.5">
          Details <ChevronRight className="w-3 h-3" />
        </a>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-100 text-center">
            <p className="text-2xl font-bold text-violet-700">{DEMO_DRONES.length}</p>
            <p className="text-[10px] text-gray-500">Drohnen total</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-center">
            <p className="text-2xl font-bold text-green-700">{activeDrones.length}</p>
            <p className="text-[10px] text-gray-500">Aktiv</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-2xl font-bold text-blue-700">{totalFlights}</p>
            <p className="text-[10px] text-gray-500">Flüge total</p>
          </div>
        </div>
        <div className="space-y-2">
          {DEMO_DRONES.map((drone) => (
            <div key={drone.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
              <div className="flex items-center gap-3">
                <Plane className={`w-4 h-4 ${drone.isActive ? "text-green-500" : "text-gray-400"}`} />
                <div>
                  <p className="text-xs font-bold text-gray-900">{drone.model}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{drone.serialNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500">{drone.totalFlights} Flüge</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  drone.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
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

// ─── Franchise Network ──────────────────────────────────────────────────────

function FranchiseNetwork() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Franchise-Netzwerk</h3>
        <a href="/franchise" className="text-[10px] font-semibold text-violet-500 hover:text-violet-600 flex items-center gap-0.5">
          Übersicht <ChevronRight className="w-3 h-3" />
        </a>
      </div>
      <div className="p-5">
        <div className="space-y-2">
          {DEMO_FRANCHISE_PARTNERS.map((partner) => (
            <div key={partner.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{partner.name}</p>
                  <p className="text-[10px] text-gray-400">{partner.region} · {partner.droneCount} Drohnen · {partner.pilotCount} Piloten</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900">CHF {partner.monthlyRevenue.toLocaleString("de-CH")}</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  partner.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {partner.status === "active" ? "Aktiv" : "Onboarding"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Team Overview ──────────────────────────────────────────────────────────

function TeamOverview() {
  const pilots = ["Hans Müller", "Sarah Weber", "Marco Brunner", "Lisa Keller"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Team</h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-100 text-center">
            <p className="text-xl font-bold text-violet-700">{pilots.length}</p>
            <p className="text-[10px] text-gray-500">Piloten</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xl font-bold text-blue-700">2</p>
            <p className="text-[10px] text-gray-500">Safety Mgr</p>
          </div>
        </div>
        <div className="space-y-2">
          {pilots.map((name) => (
            <div key={name} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{name}</p>
                <p className="text-[10px] text-gray-400">Pilot · DJI FlyCart 100</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

const CHART_COLORS = ["#7c3aed", "#2563eb", "#0891b2", "#16a34a", "#d97706", "#dc2626"];

const STATUS_LABELS: Record<string, string> = {
  draft: "Entwurf", pending: "Ausstehend", quoted: "Angeboten",
  confirmed: "Bestätigt", in_progress: "In Bearbeitung",
  completed: "Abgeschlossen", cancelled: "Storniert",
};

const SERVICE_LABELS: Record<string, string> = {
  LASTENFLUG: "Lastenflug", PERSONENFLUG: "Personenflug", INSPEKTION: "Inspektion",
};

export function AdminDashboard() {
  const overviewQ = trpc.analytics.overview.useQuery();
  const timelineQ = trpc.analytics.bookingsOverTime.useQuery({ days: 90 });
  const routesQ = trpc.analytics.popularRoutes.useQuery();
  const serviceQ = trpc.analytics.serviceTypeBreakdown.useQuery();
  const payloadQ = trpc.analytics.avgPayloadWeight.useQuery();

  const isLoading = overviewQ.isLoading || timelineQ.isLoading || serviceQ.isLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminTopBar />
          <div className="p-6 space-y-6 animate-pulse">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (<div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-28" />))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 h-72" />
          </div>
        </div>
      </div>
    );
  }

  const ov = overviewQ.data;
  const timeline = timelineQ.data ?? [];
  const routes = routesQ.data ?? [];
  const services = serviceQ.data ?? [];
  const payload = payloadQ.data;

  const statusPieData = Object.entries(ov?.bookingsByStatus ?? {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v }));

  const serviceBarData = services.map((s) => ({
    name: SERVICE_LABELS[s.serviceType] ?? s.serviceType,
    Buchungen: s.count,
    "Umsatz (CHF)": Math.round(s.revenue),
  }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard title="Buchungen gesamt" value={ov?.totalBookings ?? 0} icon={Package} accent="violet"
              trend={{ value: "12%", positive: true }} />
            <StatCard
              title="Umsatz abgeschlossen"
              value={`CHF ${(ov?.totalRevenueCHF ?? 0).toLocaleString("de-CH", { minimumFractionDigits: 0 })}`}
              icon={TrendingUp} accent="green"
              trend={{ value: "8%", positive: true }} />
            <StatCard title="Flüge abgeschlossen"
              value={`${ov?.completedFlights ?? 0} / ${ov?.totalFlights ?? 0}`}
              sub="abgeschlossen / gesamt" icon={Plane} accent="blue" />
            <StatCard title="Ø Nutzlast"
              value={payload ? `${payload.avg} kg` : "—"}
              sub={payload ? `Min ${payload.min} kg · Max ${payload.max} kg` : undefined}
              icon={Truck} accent="amber" />
            <StatCard title="Offene Rechnungen"
              value={ov?.unpaidInvoicesCount ?? 0}
              sub={ov?.unpaidInvoicesTotalCHF ? `CHF ${ov.unpaidInvoicesTotalCHF.toLocaleString("de-CH")}` : undefined}
              icon={FileText} accent={ov && ov.unpaidInvoicesCount > 0 ? "red" : "green"} />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Buchungen & Umsatz (letzte 90 Tage)</h2>
              <span className="text-[10px] text-gray-400">{timeline.length} Datenpunkte</span>
            </div>
            {timeline.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
                <AlertCircle className="w-4 h-4" />
                Noch keine Daten vorhanden
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth() + 1}.`; }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(v) => `${v} CHF`} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e5e7eb" }}
                    labelFormatter={(l) => new Date(l).toLocaleDateString("de-CH")} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area yAxisId="left" type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2}
                    fill="url(#colorBookings)" name="Buchungen" />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2}
                    fill="url(#colorRevenue)" name="Umsatz (CHF)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Booking Status Pie */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Buchungen nach Status</h2>
              {statusPieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Keine Buchungen
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {statusPieData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e5e7eb" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Service Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Leistungsarten</h2>
              {serviceBarData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Keine Buchungen
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={serviceBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="Buchungen" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Popular Routes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Häufigste Lieferadressen</h2>
              {routes.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-gray-400 text-sm gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Keine Daten
                </div>
              ) : (
                <div className="space-y-3">
                  {routes.map((route, i) => {
                    const maxCount = routes[0]?.count ?? 1;
                    const pct = Math.round((route.count / maxCount) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 truncate flex-1">{route.address}</span>
                          <span className="text-xs font-semibold text-gray-500 ml-2">{route.count}×</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Fleet + Franchise + Team */}
          <div className="grid lg:grid-cols-3 gap-6">
            <FleetOverview />
            <FranchiseNetwork />
            <TeamOverview />
          </div>
        </main>
      </div>
    </div>
  );
}
