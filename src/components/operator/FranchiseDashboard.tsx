"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  DEMO_BOOKINGS,
  DEMO_PILOTS,
  DEMO_DRONES,
  DEMO_REVENUE_DATA,
  DEMO_SERVICE_DISTRIBUTION,
  DEMO_WEEKLY_DATA,
  DEMO_AREA_DATA,
} from "@/lib/demo-data";
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
  color = "#D32F2F",
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
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={stroke} />
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

// ─── Shared Tooltip Style ────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#111827",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const configQ = trpc.tenant.getConfig.useQuery(undefined, { retry: false });
  const statsQ = trpc.tenant.getStats.useQuery(undefined, { retry: false });

  if (configQ.isLoading || statsQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Demo fallback data
  const useDemoData = !!configQ.error || !!statsQ.error;

  const tenant = configQ.data ?? {
    name: "VOLTAIR Berner Oberland",
    slug: "voltair-beo",
    country: "CH",
    isActive: true,
  };

  const stats = statsQ.data ?? {
    activePilots: DEMO_PILOTS.filter((p) => p.isActive).length,
    activeDrones: DEMO_DRONES.filter((d) => d.isActive).length,
    totalBookings: DEMO_BOOKINGS.length,
    completedBookings: DEMO_BOOKINGS.filter((b) => b.status === "completed").length,
  };

  const revenueData = DEMO_REVENUE_DATA;
  const serviceDistribution = DEMO_SERVICE_DISTRIBUTION;

  return (
    <div className="space-y-6">
      {/* Tenant Hero */}
      {tenant && (
        <div className="relative bg-white border border-gray-100 rounded-2xl p-6 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-red-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="font-mono text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">{tenant.slug}</span>
                <span className="text-gray-300">&middot;</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {tenant.country}
                </span>
                <span className="text-gray-300">&middot;</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    tenant.isActive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tenant.isActive ? (
                    <>
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" /></span>
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
          {useDemoData && (
            <div className="absolute top-3 right-3 text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
              DEMO
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Aktive Piloten", value: stats.activePilots, icon: Users, ringColor: "#D32F2F" },
            { title: "Aktive Drohnen", value: stats.activeDrones, icon: Plane, ringColor: "#E57373" },
            { title: "Buchungen gesamt", value: stats.totalBookings, icon: Building2, ringColor: "#D32F2F" },
            { title: "Abgeschlossen", value: stats.completedBookings, icon: CheckCircle, ringColor: "#B71C1C" },
          ].map((item) => (
            <div
              key={item.title}
              className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden group hover:shadow-md transition-all shadow-sm"
            >
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-gray-500 font-medium">{item.title}</p>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                    <item.icon className="w-4.5 h-4.5 text-red-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  <AnimatedNumber value={item.value} />
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Revenue Chart + Service Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Umsatzentwicklung
            </h3>
            <span className="text-xs text-gray-400">Letzte 7 Monate</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D32F2F" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#D32F2F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`CHF ${Number(value).toLocaleString("de-CH")}`, "Umsatz"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D32F2F" strokeWidth={2} fill="url(#revGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
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
                  <span className="text-gray-500">{s.name}</span>
                </div>
                <span className="text-gray-700 font-semibold">{s.value}%</span>
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
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Use demo data as fallback
  const pilots = (pilotsQ.data && pilotsQ.data.length > 0) ? pilotsQ.data : DEMO_PILOTS;
  const drones = (dronesQ.data && dronesQ.data.length > 0) ? dronesQ.data : DEMO_DRONES;
  const useDemoData = (!pilotsQ.data || pilotsQ.data.length === 0) || (!dronesQ.data || dronesQ.data.length === 0);

  return (
    <div className="space-y-6">
      {useDemoData && (
        <div className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full w-fit">
          DEMO-DATEN
        </div>
      )}

      {/* Drones Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-red-600" />
          Drohnenflotte
          <span className="text-xs text-gray-400 font-normal ml-2">{drones.length} Einheiten</span>
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drones.map((drone) => {
            const utilization = "utilization" in drone ? (drone as typeof DEMO_DRONES[0]).utilization : Math.floor(Math.random() * 40 + 50);
            return (
              <div
                key={drone.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-sm">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      drone.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${drone.isActive ? "bg-green-500" : "bg-red-500"}`} />
                    {drone.isActive ? "AKTIV" : "OFFLINE"}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{drone.model}</h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{drone.serialNumber}</p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">
                      <Gauge className="w-3 h-3" />
                      Max. Nutzlast
                    </div>
                    <p className="text-sm font-bold text-gray-900">{drone.maxPayloadKg} kg</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">
                      <MapPin className="w-3 h-3" />
                      Reichweite
                    </div>
                    <p className="text-sm font-bold text-gray-900">{drone.maxRangeKm} km</p>
                  </div>
                </div>

                {/* Utilization bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-gray-400">Auslastung</span>
                    <span className="text-red-600 font-bold">{utilization}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000"
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pilots */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" />
          Piloten
          <span className="text-xs text-gray-400 font-normal ml-2">{pilots.length} registriert</span>
        </h3>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Name", "E-Mail", "Lizenz", "Zertifikate", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pilots.map((pilot) => (
                <tr key={pilot.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {pilot.firstName} {pilot.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{pilot.email}</td>
                  <td className="px-6 py-4 font-mono text-gray-500 text-xs">{pilot.licenseNumber ?? "\u2014"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {pilot.soraA1A3Certified && (
                        <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold border border-red-200">A1/A3</span>
                      )}
                      {pilot.soraA2Certified && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-200">A2</span>
                      )}
                      {pilot.sts01Certified && (
                        <span className="text-[10px] bg-red-50 text-red-800 px-2 py-0.5 rounded-full font-bold border border-red-200">STS-01</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        pilot.isActive
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pilot.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      {pilot.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Revenue Tab ─────────────────────────────────────────────────────────────

function RevenueTab() {
  const weeklyData = DEMO_WEEKLY_DATA;
  const revenueData = DEMO_REVENUE_DATA;
  const areaData = DEMO_AREA_DATA;

  return (
    <div className="space-y-6">
      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Monatsumsatz", value: 48600, prefix: "CHF ", icon: DollarSign, trend: "+18%" },
          { title: "Durchschn. pro Flug", value: 759, prefix: "CHF ", icon: Zap, trend: "+5%" },
          { title: "Fl\u00fcge diesen Monat", value: 64, prefix: "", icon: Plane, trend: "+22%" },
          { title: "Auslastung", value: 78, prefix: "", suffix: "%", icon: Battery, trend: "+8%" },
        ].map((item) => (
          <div key={item.title} className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium">{item.title}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
                  <item.icon className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedNumber value={item.value} prefix={item.prefix} suffix={item.suffix ?? ""} />
              </p>
              <p className="text-xs text-red-600 font-semibold mt-1">{item.trend} vs. Vormonat</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            Wochenperformance (Fl\u00fcge)
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barSize={28}>
                <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="flights" fill="url(#weekGrad)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D32F2F" />
                    <stop offset="100%" stopColor="#E57373" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            7-Monats-Trend
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D32F2F" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#D32F2F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`CHF ${Number(value).toLocaleString("de-CH")}`, "Umsatz"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D32F2F" strokeWidth={2} fill="url(#revGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Service Areas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Top Einsatzgebiete</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {areaData.map((area, i) => (
            <div key={area.name} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-[10px] font-bold text-white">
                  {i + 1}
                </div>
                <span className="text-sm font-semibold text-gray-900">{area.name}</span>
              </div>
              <p className="text-xs text-gray-400">{area.flights} Fl\u00fcge</p>
              <p className="text-sm font-bold text-red-600 mt-1">CHF {area.revenue.toLocaleString("de-CH")}</p>
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
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (configQ.error || !pricing) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-700 text-sm">
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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Preis\u00fcberschreibungen
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Franchise-spezifische Tarif-Anpassungen</p>
        </div>
        {saved && (
          <span className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Gespeichert
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {fields.map(({ key, label, unit, current }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {label} <span className="text-gray-300">({unit})</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all placeholder:text-gray-300"
              value={fieldVal(key, current)}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {updateMutation.error && (
        <p className="text-sm text-red-600 mb-4 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {updateMutation.error.message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-red-500/15"
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
      <div className="flex gap-1 mb-8 bg-gray-50 rounded-xl p-1 w-fit border border-gray-100">
        {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => {
          const config = TAB_CONFIG[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-white text-red-700 border border-gray-200 shadow-sm"
                  : "text-gray-400 hover:text-gray-600 border border-transparent"
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
