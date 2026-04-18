"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Plane,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Wind,
  Thermometer,
  Eye,
  Battery,
  Gauge,
  Radio,
  ShieldCheck,
  Navigation,
  Zap,
  FileText,
} from "lucide-react";
import { WeatherBadge } from "./WeatherBadge";

// ─── Constants ────────────────────────────────────────────────────────────────

const FLIGHT_STATUS_LABELS: Record<string, { label: string; color: string; glow: string }> = {
  scheduled: { label: "Geplant", color: "bg-blue-500/15 text-blue-400 border-blue-500/20", glow: "" },
  pre_flight_check: { label: "Vorflugcheck", color: "bg-amber-500/15 text-amber-400 border-amber-500/20", glow: "" },
  in_air: { label: "In der Luft", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20", glow: "shadow-indigo-500/20 shadow-lg" },
  landed: { label: "Gelandet", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", glow: "" },
  completed: { label: "Abgeschlossen", color: "bg-gray-500/15 text-gray-400 border-gray-500/20", glow: "" },
  aborted: { label: "Abgebrochen", color: "bg-red-500/15 text-red-400 border-red-500/20", glow: "" },
};

const SAFETY_CHECKLIST = [
  "Akku vollst\u00e4ndig geladen und gepr\u00fcft",
  "Propeller auf Sch\u00e4den gepr\u00fcft",
  "GPS-Signal stabil (min. 8 Satelliten)",
  "Hinderniserkennungs-Sensoren kalibriert",
  "Wetterkonditionen innerhalb der Betriebsgrenzen",
  "Luftraum-Freigabe best\u00e4tigt (NOTAM gepr\u00fcft)",
  "Kommunikation mit Bodenstelle hergestellt",
  "Nutzlast korrekt gesichert und gewogen",
];

const MISSION_TYPES: Record<string, { label: string; color: string }> = {
  LASTENFLUG: { label: "Lastenflug", color: "text-cyan-400" },
  EINMALIGE_LIEFERUNG: { label: "Einmalige Lieferung", color: "text-blue-400" },
  LANGZEIT_EINSATZ: { label: "Langzeit-Einsatz", color: "text-purple-400" },
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1000;
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
  return <span>{display}{suffix}</span>;
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ value, max = 100, size = 48, stroke = 4, color = "#06b6d4" }: {
  value: number; max?: number; size?: number; stroke?: number; color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

// ─── Telemetry Gauge ──────────────────────────────────────────────────────────

function TelemetryGauge({ label, value, unit, max, color, icon: Icon }: {
  label: string; value: number; unit: string; max: number; color: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-lg font-bold text-white">{value}<span className="text-xs text-gray-500 ml-0.5">{unit}</span></p>
        <div className="relative">
          <ProgressRing value={value} max={max} size={32} stroke={3} color={color} />
        </div>
      </div>
    </div>
  );
}

// ─── SORA Guidelines ──────────────────────────────────────────────────────────

function SORAGuidelines({ soraCategory }: { soraCategory?: string | null }) {
  if (!soraCategory) return null;
  const sailMatch = soraCategory.match(/SAIL\s*(\w+)/i);
  const sail = sailMatch ? sailMatch[1] : soraCategory;

  const guidelines: Record<string, string[]> = {
    I: [
      "Sichtflug (VLOS) einhalten",
      "Max. H\u00f6he 120m AGL",
      "Abstand zu Menschen halten",
    ],
    II: [
      "VLOS oder erweiterter VLOS mit Beobachter",
      "Risikobewertung durchf\u00fchren",
      "Notfallverfahren bereithalten",
    ],
    III: [
      "BVLOS m\u00f6glich mit Genehmigung",
      "Erweiterte Risikobewertung erforderlich",
      "C2 Link-Redundanz sicherstellen",
      "Notlandeverfahren aktivieren",
    ],
    IV: [
      "Safety Manager Freigabe erforderlich",
      "Vollst\u00e4ndige SORA-Dokumentation",
      "Betriebssicherheitsplan aktiv",
      "Echtzeit-Monitoring durch Bodenstelle",
    ],
  };

  const rules = guidelines[sail] ?? guidelines["I"] ?? [];

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">SORA SAIL {sail} \u2014 Richtlinien</span>
      </div>
      <ul className="space-y-1.5">
        {rules.map((rule, i) => (
          <li key={i} className="text-xs text-emerald-300/80 flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Post-Flight Form ─────────────────────────────────────────────────────────

interface PostFlightForm {
  actualWeightKg: string;
  flightDurationMinutes: string;
  notes: string;
  incidentReport: string;
  checklistDone: boolean[];
}

const defaultForm = (): PostFlightForm => ({
  actualWeightKg: "",
  flightDurationMinutes: "",
  notes: "",
  incidentReport: "",
  checklistDone: SAFETY_CHECKLIST.map(() => false),
});

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function PilotDashboard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPostFlight, setShowPostFlight] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, PostFlightForm>>({});

  const { data, isLoading, error, refetch } = trpc.pilot.myFlights.useQuery({ limit: 20, offset: 0 });
  const submitMutation = trpc.pilot.submitPostFlight.useMutation({
    onSuccess: () => {
      setShowPostFlight(null);
      refetch();
    },
  });

  function getForm(flightId: string): PostFlightForm {
    return forms[flightId] ?? defaultForm();
  }

  function updateForm(flightId: string, patch: Partial<PostFlightForm>) {
    setForms((prev) => ({ ...prev, [flightId]: { ...getForm(flightId), ...patch } }));
  }

  function toggleChecklist(flightId: string, idx: number) {
    const form = getForm(flightId);
    const next = [...form.checklistDone];
    next[idx] = !next[idx];
    updateForm(flightId, { checklistDone: next });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-6 animate-pulse">
            <div className="h-4 bg-white/[0.06] rounded w-1/3 mb-3" />
            <div className="h-3 bg-white/[0.04] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-400">
        {error.message}
      </div>
    );
  }

  if (!data?.flights.length) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-16 text-center">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Plane className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="font-bold text-white text-xl mb-2">Keine Fl\u00fcge zugewiesen</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Ihnen sind aktuell keine Fl\u00fcge zugewiesen. Der Operator weist Ihnen Fl\u00fcge zu.
        </p>
      </div>
    );
  }

  // Stats
  const totalFlights = data.flights.length;
  const activeFlights = data.flights.filter((f) => f.status === "in_air" || f.status === "pre_flight_check").length;
  const completedFlights = data.flights.filter((f) => f.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Pilot KPI Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Zugewiesene Fl\u00fcge", value: totalFlights, icon: Plane, color: "#6366f1" },
          { label: "Aktiv", value: activeFlights, icon: Radio, color: "#06b6d4" },
          { label: "Abgeschlossen", value: completedFlights, icon: CheckCircle2, color: "#10b981" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
            <p className="text-2xl font-bold text-white">
              <AnimatedNumber value={kpi.value} />
            </p>
          </div>
        ))}
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {data.flights.map((flight) => {
          const isExpanded = expandedId === flight.id;
          const isPostFlightOpen = showPostFlight === flight.id;
          const statusCfg = FLIGHT_STATUS_LABELS[flight.status] ?? FLIGHT_STATUS_LABELS.scheduled;
          const booking = flight.booking;
          const form = getForm(flight.id);
          const allChecked = form.checklistDone.every(Boolean);
          const missionType = MISSION_TYPES[booking?.serviceSubtype ?? ""] ?? MISSION_TYPES.LASTENFLUG;

          return (
            <div key={flight.id} className={`bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden ${statusCfg.glow}`}>
              {/* Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : flight.id)}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-400">
                        {booking?.identifier ?? flight.id.slice(0, 8)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`text-xs font-semibold ${missionType.color}`}>{missionType.label}</span>
                    </div>
                    <h3 className="font-bold text-white text-base">
                      Mission Briefing
                    </h3>
                    <div className="text-sm text-gray-500 flex gap-3 mt-1 flex-wrap">
                      {flight.scheduledDeparture && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(flight.scheduledDeparture), "d. MMM yyyy HH:mm", { locale: de })} Uhr
                        </span>
                      )}
                      {booking?.payloadWeightKg && (
                        <>
                          <span className="text-gray-700">\u00b7</span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            {booking.payloadWeightKg} kg
                          </span>
                        </>
                      )}
                    </div>
                    {flight.status !== "completed" && flight.status !== "aborted" && booking?.deliveryLat && booking?.deliveryLng && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <WeatherBadge
                          lat={parseFloat(booking.deliveryLat)}
                          lng={parseFloat(booking.deliveryLng)}
                          datetime={flight.scheduledDeparture ? new Date(flight.scheduledDeparture).toISOString() : undefined}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-white/[0.06] p-5 space-y-6">
                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <TelemetryGauge label="Nutzlast" value={parseFloat(booking?.payloadWeightKg ?? "0")} unit="kg" max={100} color="#06b6d4" icon={Package} />
                    <TelemetryGauge label="Batterie" value={92} unit="%" max={100} color="#10b981" icon={Battery} />
                    <TelemetryGauge label="Geschw." value={75} unit="km/h" max={120} color="#8b5cf6" icon={Gauge} />
                    <TelemetryGauge label="H\u00f6he" value={120} unit="m" max={300} color="#f59e0b" icon={Navigation} />
                  </div>

                  {/* Flight details */}
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nutzlast</span>
                      </div>
                      <p className="font-semibold text-white">{booking?.payloadWeightKg} kg</p>
                      {booking?.payloadDescription && <p className="text-gray-500 text-xs mt-1">{booking.payloadDescription}</p>}
                      {booking?.isDangerousGoods && (
                        <p className="text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          GEFAHRGUT
                        </p>
                      )}
                    </div>

                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lieferadresse</span>
                      </div>
                      <p className="font-semibold text-white">{booking?.deliveryAddress ?? "\u2014"}</p>
                      {booking?.deliveryLat && booking?.deliveryLng && (
                        <p className="text-gray-500 text-xs mt-1 font-mono">
                          {parseFloat(booking.deliveryLat).toFixed(5)}\u00b0N, {parseFloat(booking.deliveryLng).toFixed(5)}\u00b0E
                        </p>
                      )}
                    </div>

                    {booking?.pickupAddress && (
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Abflugort</span>
                        </div>
                        <p className="font-semibold text-white">{booking.pickupAddress}</p>
                      </div>
                    )}

                    {flight.drone && (
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-3">
                          <Plane className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Drohne</span>
                        </div>
                        <p className="font-semibold text-white">{flight.drone.model}</p>
                        <p className="text-gray-500 text-xs mt-1 font-mono">{flight.drone.serialNumber}</p>
                      </div>
                    )}
                  </div>

                  {/* SORA Guidelines */}
                  <SORAGuidelines soraCategory={flight.soraCategory} />

                  {/* Permits */}
                  {flight.permits.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Bewilligungen
                      </h4>
                      <div className="space-y-2">
                        {flight.permits.map((permit) => (
                          <div key={permit.id} className="flex items-center justify-between text-sm bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]">
                            <span className="font-medium text-white">{permit.authority}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              permit.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                : permit.status === "rejected"
                                ? "bg-red-500/15 text-red-400 border-red-500/20"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                            }`}>
                              {permit.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Post-flight button */}
                  {flight.status !== "completed" && flight.status !== "aborted" && (
                    <button
                      onClick={() => setShowPostFlight(isPostFlightOpen ? null : flight.id)}
                      className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Post-Flight-Log einreichen
                    </button>
                  )}

                  {/* Post-flight form */}
                  {isPostFlightOpen && (
                    <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-5 space-y-5">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-indigo-400" />
                        Post-Flight-Log
                      </h4>

                      {/* Safety checklist */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Vorflug-Checkliste (Pflicht)
                        </p>
                        <div className="space-y-2">
                          {SAFETY_CHECKLIST.map((item, idx) => (
                            <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={form.checklistDone[idx]}
                                onChange={() => toggleChecklist(flight.id, idx)}
                                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/[0.04] text-indigo-500 focus:ring-indigo-500/40"
                              />
                              <span className={`text-sm transition-colors ${form.checklistDone[idx] ? "text-emerald-400" : "text-gray-400 group-hover:text-gray-300"}`}>
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                        {!allChecked && (
                          <p className="text-xs text-amber-400 mt-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Alle Checkpunkte m\u00fcssen best\u00e4tigt sein.
                          </p>
                        )}
                      </div>

                      {/* Form fields */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Tats\u00e4chliches Gewicht (kg)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                            placeholder="z.B. 24.5"
                            value={form.actualWeightKg}
                            onChange={(e) => updateForm(flight.id, { actualWeightKg: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Flugdauer (Minuten)</label>
                          <input
                            type="number"
                            min="1"
                            max="480"
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                            placeholder="z.B. 45"
                            value={form.flightDurationMinutes}
                            onChange={(e) => updateForm(flight.id, { flightDurationMinutes: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Notizen (optional)</label>
                        <textarea
                          rows={2}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
                          placeholder="Besonderheiten, Extras, Abweichungen..."
                          value={form.notes}
                          onChange={(e) => updateForm(flight.id, { notes: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Zwischenfall-Bericht (optional)</label>
                        <textarea
                          rows={2}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all resize-none"
                          placeholder="Beschreiben Sie allfällige Zwischenfälle..."
                          value={form.incidentReport}
                          onChange={(e) => updateForm(flight.id, { incidentReport: e.target.value })}
                        />
                      </div>

                      {submitMutation.error && (
                        <p className="text-sm text-red-400">{submitMutation.error.message}</p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            const weight = parseFloat(form.actualWeightKg);
                            const duration = parseInt(form.flightDurationMinutes, 10);
                            if (!allChecked || isNaN(weight) || isNaN(duration)) return;
                            submitMutation.mutate({
                              flightId: flight.id,
                              actualWeightKg: weight,
                              flightDurationMinutes: duration,
                              notes: form.notes || undefined,
                              incidentReport: form.incidentReport || undefined,
                            });
                          }}
                          disabled={!allChecked || !form.actualWeightKg || !form.flightDurationMinutes || submitMutation.isPending}
                          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-40 shadow-lg shadow-indigo-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {submitMutation.isPending ? "Wird eingereicht..." : "Post-Flight-Log einreichen"}
                        </button>
                        <button
                          onClick={() => setShowPostFlight(null)}
                          className="px-6 py-3.5 text-gray-400 font-semibold rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}

                  {flight.status === "completed" && (
                    <div className="flex items-center gap-2.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/15 rounded-xl px-5 py-3">
                      <CheckCircle2 className="w-5 h-5" />
                      Flug abgeschlossen \u2014 Post-Flight-Log eingereicht
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
