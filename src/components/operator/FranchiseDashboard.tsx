"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Building2,
  Users,
  Plane,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Zap,
  Globe,
  Battery,
  Gauge,
  MapPin,
  BarChart3,
  Settings,
  Activity,
} from "lucide-react";

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return (
    <span>
      {prefix}
      {display.toLocaleString("de-CH")}
      {suffix}
    </span>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({
  value,
  max = 100,
  size = 56,
  stroke = 4,
  color = "#06b6d4",
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

// ─── Tab Types ────────────────────────────────────────────────────────────────

type Tab = "overview" | "fleet" | "revenue" | "pricing";

const TAB_CONFIG: Record<Tab, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  overview: { label: "\u00dcbersicht", icon: BarChart3 },
  fleet: { label: "Flotte & Piloten", icon: Plane },
  revenue: { label: "Umsatz & KPIs", icon: TrendingUp },
  pricing: { label: "Preise", icon: Settings },
};

// ─── Mock Revenue Data ───────────────────────────────────────────────────────

const revenueData = [
  { month: "Jan", revenue: 12400, flights: 18 },
  { month: "Feb", revenue: 15800, flights: 23 },
  { month: "Mär", revenue: 22100, flights: 31 },
  { month: "Apr", revenue: 28500, flights: 42 },
  { month: "Mai", revenue: 35200, flights: 56 },
  { month: "Jun", revenue: 41800, flights: 64 },
];

const serviceDistribution = [
  { name: "Lastenflug", value: 42, color: "#06b6d4" },
  { name: "Berglogistik", value: 18, color: "#8b5cf6" },
  { name: "Notfalltransport", value: 12, color: "#ef4444" },
  { name: "Inspektion", value: 15, color: "#f59e0b" },
  { name: "Baumaterial", value: 8, color: "#10b981" },
  { name: "Sonstiges", value: 5, color: "#6b7280" },
];

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const configQ = trpc.tenant.getConfig.useQuery(undefined, { retry: false });
  const statsQ = trpc.tenant.getStats.useQuery(undefined, { retry: false });

  if (configQ.isLoading || statsQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (configQ.error || statsQ.error) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-amber-400 text-sm">
        <p className="font-semibold mb-1">Keine Tenant-Konfiguration gefunden</p>
        <p className="text-amber-400/70">F\u00fcr diese Ansicht muss ein Franchise-Tenant konfiguriert sein.</p>
      </div>
    );
  }

  const tenant = configQ.data;
  const stats = statsQ.data;

  return (
    <div className="space-y-6">
      {/* Tenant Hero */}
      {tenant && (
        <div className="relative bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{tenant.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                <span className="font-mono text-xs bg-white/[0.06] px-2 py-0.5 rounded">{tenant.slug}</span>
                <span className="text-gray-600">\u00b7</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {tenant.country}
                </span>
                <span className="text-gray-600">\u00b7</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    tenant.isActive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tenant.isActive ? (
                    <>
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
                      Aktiv
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> Inaktiv
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Aktive Piloten", value: stats.activePilots, icon: Users, color: "from-blue-500 to-indigo-600", ringColor: "#3b82f6" },
            { title: "Aktive Drohnen", value: stats.activeDrones, icon: Plane, color: "from-cyan-500 to-blue-600", ringColor: "#06b6d4" },
            { title: "Buchungen gesamt", value: stats.totalBookings, icon: Building2, color: "from-amber-500 to-orange-600", ringColor: "#f59e0b" },
            { title: "Abgeschlossen", value: stats.completedBookings, icon: CheckCircle, color: "from-emerald-500 to-green-600", ringColor: "#10b981" },
          ].map((item) => (
            <div
              key={item.title}
              className="relative bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 overflow-hidden group hover:bg-white/[0.06] transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-gray-400 font-medium">{item.title}</p>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color}`}>
                    <item.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  <AnimatedNumber value={item.value} />
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Revenue Chart + Service Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Umsatzentwicklung
            </h3>
            <span className="text-xs text-gray-500">Letztes Halbjahr</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value) => [`CHF ${Number(value).toLocaleString("de-CH")}`, "Umsatz"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#revGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Service-Verteilung
          </h3>
          <div className="h-[140px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serviceDistribution} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={2} dataKey="value" strokeWidth={0}>
                  {serviceDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {serviceDistribution.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-400">{s.name}</span>
                </div>
                <span className="text-gray-300 font-semibold">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fleet & Pilots Tab ──────────────────────────────────────────────────────

function FleetTab() {
  const pilotsQ = trpc.tenant.listPilots.useQuery(undefined, { retry: false });
  const dronesQ = trpc.tenant.listDrones.useQuery(undefined, { retry: false });

  if (pilotsQ.isLoading || dronesQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pilots = pilotsQ.data ?? [];
  const drones = dronesQ.data ?? [];

  return (
    <div className="space-y-6">
      {/* Drones Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-cyan-400" />
          Drohnenflotte
          <span className="text-xs text-gray-500 font-normal ml-2">{drones.length} Einheiten</span>
        </h3>
        {drones.length === 0 ? (
          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-12 text-center">
            <Plane className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Keine Drohnen zugewiesen</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drones.map((drone) => (
              <div
                key={drone.id}
                className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      drone.isActive
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/15 text-red-400 border-red-500/20"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${drone.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                    {drone.isActive ? "AKTIV" : "OFFLINE"}
                  </span>
                </div>
                <h4 className="font-bold text-white text-lg">{drone.model}</h4>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{drone.serialNumber}</p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/[0.03] rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
                      <Gauge className="w-3 h-3" />
                      Max. Nutzlast
                    </div>
                    <p className="text-sm font-bold text-white">{drone.maxPayloadKg} kg</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      Reichweite
                    </div>
                    <p className="text-sm font-bold text-white">{drone.maxRangeKm} km</p>
                  </div>
                </div>

                {/* Mock utilization bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-gray-500">Auslastung</span>
                    <span className="text-cyan-400 font-bold">{Math.floor(Math.random() * 40 + 50)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.floor(Math.random() * 40 + 50)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pilots */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Piloten
          <span className="text-xs text-gray-500 font-normal ml-2">{pilots.length} registriert</span>
        </h3>
        {pilots.length === 0 ? (
          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-12 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Keine Piloten zugewiesen</p>
          </div>
        ) : (
          <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Name", "E-Mail", "Lizenz", "Zertifikate", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {pilots.map((pilot) => (
                  <tr key={pilot.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {pilot.firstName} {pilot.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{pilot.email}</td>
                    <td className="px-6 py-4 font-mono text-gray-400 text-xs">{pilot.licenseNumber ?? "\u2014"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {pilot.soraA1A3Certified && (
                          <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">A1/A3</span>
                        )}
                        {pilot.soraA2Certified && (
                          <span className="text-[10px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">A2</span>
                        )}
                        {pilot.sts01Certified && (
                          <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/20">STS-01</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          pilot.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/15 text-red-400 border-red-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pilot.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                        {pilot.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Revenue Tab ─────────────────────────────────────────────────────────────

function RevenueTab() {
  const weeklyData = [
    { day: "Mo", flights: 8, revenue: 4200 },
    { day: "Di", flights: 12, revenue: 6800 },
    { day: "Mi", flights: 10, revenue: 5400 },
    { day: "Do", flights: 15, revenue: 8100 },
    { day: "Fr", flights: 14, revenue: 7600 },
    { day: "Sa", flights: 6, revenue: 3200 },
    { day: "So", flights: 3, revenue: 1800 },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Monatsumsatz", value: 41800, prefix: "CHF ", icon: DollarSign, color: "from-emerald-500 to-green-600", trend: "+18%" },
          { title: "Durchschn. pro Flug", value: 653, prefix: "CHF ", icon: Zap, color: "from-cyan-500 to-blue-600", trend: "+5%" },
          { title: "Fl\u00fcge diesen Monat", value: 64, prefix: "", icon: Plane, color: "from-blue-500 to-indigo-600", trend: "+22%" },
          { title: "Auslastung", value: 78, prefix: "", suffix: "%", icon: Battery, color: "from-amber-500 to-orange-600", trend: "+8%" },
        ].map((item) => (
          <div key={item.title} className="relative bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium">{item.title}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color}`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                <AnimatedNumber value={item.value} prefix={item.prefix} suffix={item.suffix ?? ""} />
              </p>
              <p className="text-xs text-emerald-400 font-semibold mt-1">{item.trend} vs. Vormonat</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Wochenperformance (Fl\u00fcge)
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barSize={28}>
                <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="flights" fill="url(#weekGrad)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            6-Monats-Trend
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value) => [`CHF ${Number(value).toLocaleString("de-CH")}`, "Umsatz"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Service Areas */}
      <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
        <h3 className="font-semibold text-white mb-4">Top Einsatzgebiete</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { name: "Interlaken", flights: 42, revenue: 27300 },
            { name: "Grindelwald", flights: 28, revenue: 18200 },
            { name: "Thun", flights: 22, revenue: 14300 },
            { name: "Brienz", flights: 15, revenue: 9800 },
            { name: "Spiez", flights: 12, revenue: 7800 },
          ].map((area, i) => (
            <div key={area.name} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {i + 1}
                </div>
                <span className="text-sm font-semibold text-white">{area.name}</span>
              </div>
              <p className="text-xs text-gray-500">{area.flights} Fl\u00fcge</p>
              <p className="text-sm font-bold text-cyan-400 mt-1">CHF {area.revenue.toLocaleString("de-CH")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pricing Tab ─────────────────────────────────────────────────────────────

function PricingTab() {
  const configQ = trpc.tenant.getConfig.useQuery(undefined, { retry: false });
  const updateMutation = trpc.tenant.updatePricing.useMutation({
    onSuccess: () => {
      configQ.refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  const pricing = configQ.data?.pricingConfig;

  if (configQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (configQ.error || !pricing) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-amber-400 text-sm">
        Preiskonfiguration konnte nicht geladen werden.
      </div>
    );
  }

  function fieldVal(key: string, fallback: string) {
    return dirty && key in form ? form[key] : fallback;
  }

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleSave() {
    const patch: Record<string, number> = {};
    const fields: Array<[string, string]> = [
      ["baseRateCHFPerKm", form.baseRateCHFPerKm ?? pricing!.baseRateCHFPerKm],
      ["weightFreeKg", form.weightFreeKg ?? pricing!.weightFreeKg],
      ["weightSurchargeCHFPerKg", form.weightSurchargeCHFPerKg ?? pricing!.weightSurchargeCHFPerKg],
      ["hubPickupSurchargeCHF", form.hubPickupSurchargeCHF ?? pricing!.hubPickupSurchargeCHF],
      ["customPickupCHFPerKm", form.customPickupCHFPerKm ?? pricing!.customPickupCHFPerKm],
      ["minimumBookingCHF", form.minimumBookingCHF ?? pricing!.minimumBookingCHF],
      ["vatPercent", form.vatPercent ?? pricing!.vatPercent],
    ];
    for (const [key, val] of fields) {
      const num = parseFloat(val);
      if (!isNaN(num)) patch[key] = num;
    }
    updateMutation.mutate(patch);
  }

  const fields: Array<{ key: string; label: string; unit: string; current: string }> = [
    { key: "baseRateCHFPerKm", label: "Grundtarif pro km", unit: "CHF/km", current: pricing.baseRateCHFPerKm },
    { key: "weightFreeKg", label: "Freigewicht", unit: "kg", current: pricing.weightFreeKg },
    { key: "weightSurchargeCHFPerKg", label: "Gewichtszuschlag", unit: "CHF/kg", current: pricing.weightSurchargeCHFPerKg },
    { key: "hubPickupSurchargeCHF", label: "Hub-Zuschlag", unit: "CHF", current: pricing.hubPickupSurchargeCHF },
    { key: "customPickupCHFPerKm", label: "Sonder-Pickup", unit: "CHF/km", current: pricing.customPickupCHFPerKm },
    { key: "minimumBookingCHF", label: "Mindestbetrag", unit: "CHF", current: pricing.minimumBookingCHF },
    { key: "vatPercent", label: "MwSt.", unit: "%", current: pricing.vatPercent },
  ];

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Preis\u00fcberschreibungen
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Franchise-spezifische Tarif-Anpassungen</p>
        </div>
        {saved && (
          <span className="text-sm text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Gespeichert
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {fields.map(({ key, label, unit, current }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              {label} <span className="text-gray-600">({unit})</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all"
              value={fieldVal(key, current)}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {updateMutation.error && (
        <p className="text-sm text-red-400 mb-4 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {updateMutation.error.message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-cyan-500/20"
      >
        <DollarSign className="w-4 h-4" />
        {updateMutation.isPending ? "Wird gespeichert..." : "Preise speichern"}
      </button>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function FranchiseDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 bg-white/[0.04] rounded-xl p-1 w-fit border border-white/[0.06]">
        {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => {
          const config = TAB_CONFIG[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-500/20 shadow-lg shadow-cyan-500/10"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <config.icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "fleet" && <FleetTab />}
      {activeTab === "revenue" && <RevenueTab />}
      {activeTab === "pricing" && <PricingTab />}
    </div>
  );
}
