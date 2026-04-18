"use client";

import { MissionControlLayout, KeyMetrics } from "@/components/mission-control";
import {
  DEMO_DRONES,
  DEMO_PILOTS,
  DEMO_REVENUE_DATA,
  DEMO_SERVICE_DISTRIBUTION,
  DEMO_WEEKLY_DATA,
  DEMO_AREA_DATA,
  DEMO_FRANCHISE_PARTNERS,
  DEMO_INVOICES,
  DEMO_MAINTENANCE,
  DEMO_SCALING,
  DEMO_BOOKINGS,
} from "@/lib/demo-data";
import { trpc } from "@/lib/trpc/client";
import {
  ResponsiveContainer,
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
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Users,
  MapPin,
  Wrench,
  AlertTriangle,
  DollarSign,
  Activity,
  ChevronRight,
  Calendar,
  Battery,
  RotateCcw,
} from "lucide-react";

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#111827",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
};

// ─── Fleet Overview with Maintenance Status ─────────────────────────────────

function WearBar({ label, icon, value, max, unit, warnAt }: { label: string; icon: React.ReactNode; value: number; max: number; unit: string; warnAt: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const warn = pct >= warnAt;
  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between text-[9px] mb-0.5">
        <span className="flex items-center gap-1 text-gray-400">{icon}{label}</span>
        <span className={`font-bold font-mono ${warn ? "text-amber-600" : "text-gray-500"}`}>{value}/{max} {unit}</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${warn ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FleetOverview() {
  const dronesQ = trpc.tenant.listDrones.useQuery(undefined, { retry: false });
  const drones = dronesQ.data && dronesQ.data.length > 0 ? dronesQ.data : DEMO_DRONES;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Flottenübersicht — DJI FlyCart 100</h3>
          <p className="text-[10px] text-gray-300 mt-0.5">{drones.length} Drohnen registriert</p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3 text-[10px] text-amber-800">
        <strong>Hinweis:</strong> Herstellerangaben — vorbehaltlich EASA/BAZL-Typenzulassung
      </div>
      <div className="grid grid-cols-2 gap-3">
        {drones.map((drone) => {
          const d = drone as (typeof DEMO_DRONES)[0];
          const utilization = "utilization" in drone ? d.utilization : Math.floor(Math.random() * 40 + 50);
          const maintenance = DEMO_MAINTENANCE.find((m) => m.droneId === drone.id);
          const maintenanceUrgent = maintenance && maintenance.status === "in_progress";
          const hasBatteryData = "batteryCyclesUsed" in drone;
          return (
            <div key={drone.id} className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${maintenanceUrgent ? "border-amber-200" : "border-gray-100"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{drone.model}</h4>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{drone.serialNumber}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  drone.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${drone.isActive ? "bg-green-500" : "bg-red-500"}`} />
                  {drone.isActive ? "AKTIV" : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-1">
                <span>Nutzlast: <span className="text-gray-700 font-semibold">{drone.maxPayloadKg} kg</span></span>
                <span>Reichweite: <span className="text-gray-700 font-semibold">{drone.maxRangeKm} km</span></span>
                {"batteryMode" in drone && <span className="text-gray-300">({d.batteryMode === "dual" ? "Dual" : "Einzel"}-Batterie)</span>}
              </div>
              {"totalFlights" in drone && (
              <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2">
                <span>{d.totalFlights} Flüge</span>
                <span>{d.hoursFlown}h geflogen</span>
              </div>
              )}
              {/* Utilization bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-gray-400">Auslastung</span>
                  <span className="text-brand-600 font-bold">{utilization}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full transition-all duration-1000" style={{ width: `${utilization}%` }} />
                </div>
              </div>
              {/* Wear tracking */}
              {hasBatteryData && (
                <div className="border-t border-gray-50 pt-2 mt-2">
                  <WearBar label="DB2000 Batterie" icon={<Battery className="w-2.5 h-2.5" />} value={d.batteryCyclesUsed} max={d.batteryCyclesMax} unit="Zyklen" warnAt={70} />
                  <WearBar label="Propeller 54&quot;" icon={<RotateCcw className="w-2.5 h-2.5" />} value={d.propellerHours} max={d.propellerMaxHours} unit="h" warnAt={75} />
                  <div className="flex items-center justify-between text-[9px] mt-1">
                    <span className="text-gray-400">Batterie-Zustand</span>
                    <span className={`font-bold ${d.batteryHealthPct >= 90 ? "text-emerald-600" : d.batteryHealthPct >= 80 ? "text-amber-600" : "text-red-600"}`}>{d.batteryHealthPct}%</span>
                  </div>
                </div>
              )}
              {/* Maintenance status */}
              {maintenance && (
                <div className={`flex items-center gap-1.5 text-[9px] font-semibold px-2 py-1 rounded-md mt-2 ${
                  maintenance.status === "in_progress" ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-500"
                }`}>
                  <Wrench className="w-3 h-3" />
                  <span className="truncate">{maintenance.task.split(":")[0]}</span>
                  <span className="ml-auto flex-shrink-0">
                    {new Date(maintenance.scheduledAt).toLocaleDateString("de-CH")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Franchise Partner Performance ──────────────────────────────────────────

function FranchisePartnerPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Franchise-Partner</h3>
          <p className="text-[10px] text-gray-300 mt-0.5">{DEMO_FRANCHISE_PARTNERS.length} Partner aktiv</p>
        </div>
      </div>
      <div className="space-y-3">
        {DEMO_FRANCHISE_PARTNERS.map((partner) => (
          <div key={partner.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{partner.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{partner.region}
                  </span>
                  <span className="text-[10px] text-gray-400">Seit {new Date(partner.since).toLocaleDateString("de-CH", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  partner.status === "active" ? "bg-green-50 text-green-600 border border-green-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}>
                  {partner.status === "active" ? "Aktiv" : "Onboarding"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xs font-bold text-gray-900">{partner.monthlyFlights}</p>
                <p className="text-[9px] text-gray-400">Flüge/M</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">CHF {(partner.monthlyRevenue / 1000).toFixed(1)}k</p>
                <p className="text-[9px] text-gray-400">Umsatz/M</p>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-600">{partner.marginPct}%</p>
                <p className="text-[9px] text-gray-400">Marge</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{partner.score}</p>
                <p className="text-[9px] text-gray-400">Score</p>
              </div>
            </div>
            {/* Performance bar */}
            <div className="mt-2">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${partner.score}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Revenue & Billing ──────────────────────────────────────────────────────

function RevenueBillingPanel() {
  const totalRevenue = DEMO_REVENUE_DATA.reduce((sum, m) => sum + m.revenue, 0);
  const totalCosts = DEMO_REVENUE_DATA.reduce((sum, m) => sum + m.costs, 0);
  const totalMargin = totalRevenue - totalCosts;
  const marginPct = Math.round((totalMargin / totalRevenue) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Umsatz & Abrechnung</h3>
          <p className="text-[10px] text-gray-300 mt-0.5">Letzte 7 Monate</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">CHF {(totalRevenue / 1000).toFixed(0)}k</p>
          <p className="text-[10px] text-green-500 font-bold flex items-center gap-0.5 justify-end">
            <TrendingUp className="w-3 h-3" /> Marge {marginPct}%
          </p>
        </div>
      </div>
      <div className="h-[180px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEMO_REVENUE_DATA}>
            <defs>
              <linearGradient id="franchiseRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D32F2F" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#D32F2F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="franchiseCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`CHF ${Number(value).toLocaleString("de-CH")}`, ""]} />
            <Area type="monotone" dataKey="revenue" stroke="#D32F2F" strokeWidth={2} fill="url(#franchiseRevGrad)" />
            <Area type="monotone" dataKey="costs" stroke="#9ca3af" strokeWidth={1.5} fill="url(#franchiseCostGrad)" strokeDasharray="4,3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Invoice summary */}
      <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{DEMO_INVOICES.filter((i) => i.status === "paid").length}</p>
          <p className="text-[9px] text-gray-400">Bezahlt</p>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-600">{DEMO_INVOICES.filter((i) => i.status === "pending").length}</p>
          <p className="text-[9px] text-gray-400">Ausstehend</p>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">{DEMO_INVOICES.filter((i) => i.status === "draft").length}</p>
          <p className="text-[9px] text-gray-400">Entwurf</p>
        </div>
      </div>
    </div>
  );
}

// ─── Scaling Metrics ────────────────────────────────────────────────────────

function ScalingPanel() {
  const s = DEMO_SCALING;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Skalierungs-Metriken</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">Wachstumskennzahlen</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[10px] font-bold text-brand-600 uppercase">Partner</span>
          </div>
          <p className="text-lg font-bold text-brand-700">{s.activePartners}<span className="text-sm text-gray-400">/{s.totalPartners}</span></p>
          <p className="text-[9px] text-brand-500">+{s.newThisQuarter} dieses Quartal</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] font-bold text-green-600 uppercase">Regionen</span>
          </div>
          <p className="text-lg font-bold text-green-700">{s.regionsServed}<span className="text-sm text-gray-400">/{s.targetRegions}</span></p>
          <p className="text-[9px] text-green-500">Ziel: {s.targetRegions} Regionen</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4">
        <TrendingUp className="w-4 h-4 text-brand-500" />
        <span className="text-sm font-bold text-gray-900">+{s.growthMoM}%</span>
        <span className="text-[10px] text-gray-400">Wachstum MoM</span>
      </div>
      {/* Quarterly growth chart */}
      <div className="h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={s.quarterly} barSize={24}>
            <XAxis dataKey="quarter" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`CHF ${Number(value).toLocaleString("de-CH")}`, "Umsatz"]} />
            <Bar dataKey="revenue" fill="url(#scalingGrad)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="scalingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D32F2F" />
                <stop offset="100%" stopColor="#B71C1C" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Service Distribution ───────────────────────────────────────────────────

function ServiceDistributionPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Service-Verteilung</h3>
      </div>
      <div className="h-[140px] mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={DEMO_SERVICE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={2} dataKey="value" strokeWidth={0}>
              {DEMO_SERVICE_DISTRIBUTION.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5">
        {DEMO_SERVICE_DISTRIBUTION.map((s) => (
          <div key={s.name} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-gray-500">{s.name}</span>
            </div>
            <span className="text-gray-700 font-semibold">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Area Ranking ───────────────────────────────────────────────────────────

function AreaRanking() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Top Einsatzgebiete</h3>
      </div>
      <div className="space-y-3">
        {DEMO_AREA_DATA.map((area, i) => (
          <div key={area.name} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{area.name}</p>
              <p className="text-[10px] text-gray-400">{area.flights} Flüge</p>
            </div>
            <p className="text-sm font-bold text-brand-600 flex-shrink-0">
              CHF {area.revenue.toLocaleString("de-CH")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pilots Panel ───────────────────────────────────────────────────────────

function PilotsPanel() {
  const pilotsQ = trpc.tenant.listPilots.useQuery(undefined, { retry: false });
  const pilots = pilotsQ.data && pilotsQ.data.length > 0 ? pilotsQ.data : DEMO_PILOTS;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Piloten</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">{pilots.filter((p) => p.isActive).length} aktiv</p>
      </div>
      <div className="space-y-3">
        {pilots.map((pilot) => (
          <div key={pilot.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{pilot.firstName} {pilot.lastName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-gray-400 font-mono truncate">{pilot.licenseNumber ?? "\u2014"}</p>
                {"hoursFlown" in pilot && <span className="text-[10px] text-gray-400">{(pilot as (typeof DEMO_PILOTS)[0]).hoursFlown}h</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {pilot.soraA1A3Certified && <span className="text-[9px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold border border-brand-200">A1/A3</span>}
              {pilot.soraA2Certified && <span className="text-[9px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-bold border border-brand-200">A2</span>}
              {pilot.sts01Certified && <span className="text-[9px] bg-brand-50 text-brand-800 px-1.5 py-0.5 rounded font-bold border border-brand-200">STS-01</span>}
            </div>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pilot.isActive ? "bg-green-500" : "bg-red-400"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function FranchiseDashboard() {
  const totalFlights = DEMO_FRANCHISE_PARTNERS.reduce((sum, p) => sum + p.monthlyFlights, 0);
  const totalRevenue = DEMO_FRANCHISE_PARTNERS.reduce((sum, p) => sum + p.monthlyRevenue, 0);

  return (
    <MissionControlLayout>
      <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 48px)" }}>
        <div className="grid grid-cols-[1fr_340px] gap-5">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <FleetOverview />
            <FranchisePartnerPanel />
            <RevenueBillingPanel />
            <KeyMetrics
              items={[
                { label: "Drohnen", value: DEMO_DRONES.length, animate: true },
                { label: "Aktive Piloten", value: DEMO_PILOTS.filter((p) => p.isActive).length, animate: true },
                { label: "Monatsumsatz", value: `CHF ${(totalRevenue / 1000).toFixed(0)}k`, highlight: true },
                { label: "Monatsflüge", value: totalFlights, animate: true },
              ]}
            />
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-5">
            <ScalingPanel />
            <AreaRanking />
            <ServiceDistributionPanel />
            <PilotsPanel />
          </div>
        </div>
      </div>
    </MissionControlLayout>
  );
}
