"use client";

import { MissionControlLayout, SwissMap, KeyMetrics } from "@/components/mission-control";
import { DEMO_BOOKINGS, DEMO_DRONES, DEMO_AREA_DATA } from "@/lib/demo-data";
import { CheckCircle2 } from "lucide-react";

// ─── Franchise Performance Panel ────────────────────────────────────────────

const PARTNERS = [
  { name: "Partner 1 — Interlaken", pct: 87 },
  { name: "Partner 2 — Grindelwald", pct: 74 },
  { name: "Partner 3 — Lauterbrunnen", pct: 62 },
  { name: "Partner 4 — Brienz", pct: 51 },
];

function FranchisePerformancePanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Franchise Performance
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">Top Partners</p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        {PARTNERS.map((p) => (
          <div key={p.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-900">{p.name}</span>
              <span className="text-xs font-bold text-gray-500">{p.pct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-700"
                style={{ width: `${p.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Compliance Check Panel ─────────────────────────────────────────────────

const COMPLIANCE_ITEMS = [
  "Airspace Maps",
  "Weather Data",
  "Pilot Cert.",
  "SORA Assess.",
];

function ComplianceCheckPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Compliance Check
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">LUC-Framework</p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        {COMPLIANCE_ITEMS.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Customer Dashboard (Mission Control) ───────────────────────────────────

export function CustomerDashboard() {
  const activeDrones = DEMO_DRONES.filter((d) => d.isActive).length;
  const pendingMissions = DEMO_BOOKINGS.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  ).length;

  return (
    <MissionControlLayout>
      <div className="p-5 h-full">
        {/* Grid: main map area + right panels */}
        <div className="grid grid-cols-[1fr_320px] gap-5 h-full">
          {/* Left: Map + Key Metrics */}
          <div className="flex flex-col gap-5">
            <SwissMap />
            <KeyMetrics
              items={[
                { label: "Active Drones", value: activeDrones, animate: true },
                { label: "Pending Missions", value: pendingMissions, animate: true },
                { label: "Zero Emission Hrs", value: 18450, animate: true },
                { label: "Alert Level", value: "NORMAL", highlight: false },
              ]}
            />
          </div>

          {/* Right: Performance + Compliance */}
          <div className="flex flex-col gap-5">
            <FranchisePerformancePanel />
            <ComplianceCheckPanel />
          </div>
        </div>
      </div>
    </MissionControlLayout>
  );
}
