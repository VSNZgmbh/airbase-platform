"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Building2,
  Users,
  Plane,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Tab = "overview" | "pilots" | "drones" | "pricing";

const TAB_LABELS: Record<Tab, string> = {
  overview: "Übersicht",
  pilots: "Piloten",
  drones: "Drohnen",
  pricing: "Preise",
};

function StatCard({
  title,
  value,
  icon: Icon,
  accent = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "blue" | "green" | "indigo" | "amber";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function OverviewTab() {
  const configQ = trpc.tenant.getConfig.useQuery(undefined, {
    retry: false,
  });
  const statsQ = trpc.tenant.getStats.useQuery(undefined, {
    retry: false,
  });

  if (configQ.isLoading || statsQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (configQ.error || statsQ.error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">
        <p className="font-semibold mb-1">Keine Tenant-Konfiguration gefunden</p>
        <p>Für diese Ansicht muss ein Franchise-Tenant konfiguriert sein (DEFAULT_TENANT_SLUG oder Clerk-Metadata).</p>
      </div>
    );
  }

  const tenant = configQ.data;
  const stats = statsQ.data;

  return (
    <div className="space-y-6">
      {/* Tenant Info */}
      {tenant && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tenant.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="font-mono">{tenant.slug}</span>
                <span>·</span>
                <span>{tenant.country}</span>
                <span>·</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    tenant.isActive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tenant.isActive ? (
                    <><CheckCircle className="w-3.5 h-3.5" /> Aktiv</>
                  ) : (
                    <><AlertCircle className="w-3.5 h-3.5" /> Inaktiv</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Aktive Piloten" value={stats.activePilots} icon={Users} accent="blue" />
          <StatCard title="Aktive Drohnen" value={stats.activeDrones} icon={Plane} accent="indigo" />
          <StatCard title="Buchungen gesamt" value={stats.totalBookings} icon={Building2} accent="amber" />
          <StatCard title="Abgeschlossen" value={stats.completedBookings} icon={CheckCircle} accent="green" />
        </div>
      )}
    </div>
  );
}

function PilotsTab() {
  const pilotsQ = trpc.tenant.listPilots.useQuery(undefined, { retry: false });

  if (pilotsQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (pilotsQ.error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">
        Pilotendaten konnten nicht geladen werden. Bitte Tenant-Konfiguration prüfen.
      </div>
    );
  }

  const pilots = pilotsQ.data ?? [];

  if (!pilots.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="font-semibold text-gray-700">Keine Piloten</p>
        <p className="text-gray-500 text-sm mt-1">Diesem Franchise sind noch keine Piloten zugewiesen.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Name</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">E-Mail</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Lizenz</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Zertifikate</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pilots.map((pilot) => (
            <tr key={pilot.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">
                {pilot.firstName} {pilot.lastName}
              </td>
              <td className="px-6 py-4 text-gray-500">{pilot.email}</td>
              <td className="px-6 py-4 font-mono text-gray-500">
                {pilot.licenseNumber ?? "—"}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {pilot.soraA1A3Certified && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">A1/A3</span>
                  )}
                  {pilot.soraA2Certified && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">A2</span>
                  )}
                  {pilot.sts01Certified && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">STS-01</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    pilot.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {pilot.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DronesTab() {
  const dronesQ = trpc.tenant.listDrones.useQuery(undefined, { retry: false });

  if (dronesQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (dronesQ.error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">
        Drohnendaten konnten nicht geladen werden. Bitte Tenant-Konfiguration prüfen.
      </div>
    );
  }

  const drones = dronesQ.data ?? [];

  if (!drones.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="font-semibold text-gray-700">Keine Drohnen</p>
        <p className="text-gray-500 text-sm mt-1">Diesem Franchise sind noch keine Drohnen zugewiesen.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Modell</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Seriennummer</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Max. Nutzlast</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Max. Reichweite</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {drones.map((drone) => (
            <tr key={drone.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{drone.model}</td>
              <td className="px-6 py-4 font-mono text-gray-500">{drone.serialNumber}</td>
              <td className="px-6 py-4 text-gray-700">{drone.maxPayloadKg} kg</td>
              <td className="px-6 py-4 text-gray-700">{drone.maxRangeKm} km</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    drone.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {drone.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (configQ.error || !pricing) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">
        Preiskonfiguration konnte nicht geladen werden. Bitte Tenant-Konfiguration prüfen.
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Preisüberschreibungen</h3>
          <p className="text-sm text-gray-500 mt-0.5">Franchise-spezifische Tarif-Anpassungen</p>
        </div>
        {saved && (
          <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Gespeichert
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {fields.map(({ key, label, unit, current }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} <span className="text-gray-400 font-normal">({unit})</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fieldVal(key, current)}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {updateMutation.error && (
        <p className="text-sm text-red-600 mb-4 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {updateMutation.error.message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <DollarSign className="w-4 h-4" />
        {updateMutation.isPending ? "Wird gespeichert..." : "Preise speichern"}
      </button>
    </div>
  );
}

export function FranchiseDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "pilots" && <PilotsTab />}
      {activeTab === "drones" && <DronesTab />}
      {activeTab === "pricing" && <PricingTab />}
    </div>
  );
}
