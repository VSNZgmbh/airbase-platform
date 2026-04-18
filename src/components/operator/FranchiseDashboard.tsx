"use client";

import { MissionControlLayout, KeyMetrics } from "@/components/mission-control";
import {
  DEMO_DRONES,
  DEMO_PILOTS,
  DEMO_REVENUE_DATA,
  DEMO_SERVICE_DISTRIBUTION,
  DEMO_WEEKLY_DATA,
  DEMO_AREA_DATA,
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
} from "recharts";

// ─── Shared Tooltip Style ────────────────────────────────────────────────────

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#111827",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
};

// ─── FleetGrid ───────────────────────────────────────────────────────────────

function FleetGrid() {
  const dronesQ = trpc.tenant.listDrones.useQuery(undefined, { retry: false });
  const drones =
    dronesQ.data && dronesQ.data.length > 0 ? dronesQ.data : DEMO_DRONES;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Drohnenflotte
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {drones.map((drone) => {
          const utilization =
            "utilization" in drone
              ? (drone as (typeof DEMO_DRONES)[0]).utilization
              : Math.floor(Math.random() * 40 + 50);
          return (
            <div
              key={drone.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {drone.model}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {drone.serialNumber}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    drone.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      drone.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {drone.isActive ? "AKTIV" : "OFFLINE"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-3">
                <span>
                  Nutzlast:{" "}
                  <span className="text-gray-700 font-semibold">
                    {drone.maxPayloadKg} kg
                  </span>
                </span>
                <span>
                  Reichweite:{" "}
                  <span className="text-gray-700 font-semibold">
                    {drone.maxRangeKm} km
                  </span>
                </span>
              </div>

              {/* Utilization bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-gray-400">Auslastung</span>
                  <span className="text-brand-600 font-bold">
                    {utilization}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-1000"
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RevenueChart ────────────────────────────────────────────────────────────

function RevenueChart() {
  const revenueData = DEMO_REVENUE_DATA;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Umsatzentwicklung
        </h3>
        <span className="text-[10px] text-gray-300">Letzte 7 Monate</span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="franchiseRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D32F2F" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#D32F2F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `CHF ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                `CHF ${Number(value).toLocaleString("de-CH")}`,
                "Umsatz",
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D32F2F"
              strokeWidth={2}
              fill="url(#franchiseRevGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── AreaRanking ─────────────────────────────────────────────────────────────

function AreaRanking() {
  const areaData = DEMO_AREA_DATA;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Top Einsatzgebiete
        </h3>
      </div>
      <div className="space-y-3">
        {areaData.map((area, i) => (
          <div
            key={area.name}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {area.name}
              </p>
              <p className="text-[10px] text-gray-400">
                {area.flights} Fluege
              </p>
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

// ─── ServiceDistributionPanel ────────────────────────────────────────────────

function ServiceDistributionPanel() {
  const serviceDistribution = DEMO_SERVICE_DISTRIBUTION;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Service-Verteilung
        </h3>
      </div>
      <div className="h-[160px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={serviceDistribution}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {serviceDistribution.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {serviceDistribution.map((s) => (
          <div key={s.name} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-gray-500">{s.name}</span>
            </div>
            <span className="text-gray-700 font-semibold">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PilotsPanel ─────────────────────────────────────────────────────────────

function PilotsPanel() {
  const pilotsQ = trpc.tenant.listPilots.useQuery(undefined, { retry: false });
  const pilots =
    pilotsQ.data && pilotsQ.data.length > 0 ? pilotsQ.data : DEMO_PILOTS;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Piloten
        </h3>
      </div>
      <div className="space-y-3">
        {pilots.map((pilot) => (
          <div
            key={pilot.id}
            className="flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {pilot.firstName} {pilot.lastName}
              </p>
              <p className="text-[10px] text-gray-400 font-mono truncate">
                {pilot.licenseNumber ?? "\u2014"}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {pilot.soraA1A3Certified && (
                <span className="text-[9px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold border border-brand-200">
                  A1/A3
                </span>
              )}
              {pilot.soraA2Certified && (
                <span className="text-[9px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-bold border border-brand-200">
                  A2
                </span>
              )}
              {pilot.sts01Certified && (
                <span className="text-[9px] bg-brand-50 text-brand-800 px-1.5 py-0.5 rounded font-bold border border-brand-200">
                  STS-01
                </span>
              )}
            </div>
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                pilot.isActive ? "bg-green-500" : "bg-red-400"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function FranchiseDashboard() {
  return (
    <MissionControlLayout>
      <div className="p-5">
        <div className="grid grid-cols-[1fr_320px] gap-5">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Fleet Overview - grid of drone cards */}
            <FleetGrid />
            {/* Revenue chart */}
            <RevenueChart />
            {/* Key Metrics bar */}
            <KeyMetrics
              items={[
                { label: "Total Drones", value: 5, animate: true },
                { label: "Active Pilots", value: 4, animate: true },
                { label: "Monthly Revenue", value: "CHF 48,600", highlight: true },
                { label: "Fleet Utilization", value: "72%" },
              ]}
            />
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Top Einsatzgebiete */}
            <AreaRanking />
            {/* Service Distribution pie */}
            <ServiceDistributionPanel />
            {/* Pilots table (compact) */}
            <PilotsPanel />
          </div>
        </div>
      </div>
    </MissionControlLayout>
  );
}
