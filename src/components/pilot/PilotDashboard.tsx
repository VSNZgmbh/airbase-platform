"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { DEMO_FLIGHTS } from "@/lib/demo-data";
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
  scheduled: { label: "Geplant", color: "bg-gray-50 text-gray-600 border-gray-200", glow: "" },
  pre_flight_check: { label: "Vorflugcheck", color: "bg-amber-50 text-amber-600 border-amber-200", glow: "" },
  in_air: { label: "In der Luft", color: "bg-brand-50 text-brand-600 border-brand-200", glow: "shadow-brand-500/10 shadow-lg" },
  landed: { label: "Gelandet", color: "bg-gray-50 text-gray-600 border-gray-200", glow: "" },
  completed: { label: "Abgeschlossen", color: "bg-gray-50 text-gray-500 border-gray-200", glow: "" },
  aborted: { label: "Abgebrochen", color: "bg-red-50 text-red-600 border-red-200", glow: "" },
};

const SAFETY_CHECKLIST = [
  "Akku vollständig geladen und geprüft",
  "Propeller auf Schäden geprüft",
  "GPS-Signal stabil (min. 8 Satelliten)",
  "Hinderniserkennungs-Sensoren kalibriert",
  "Wetterkonditionen innerhalb der Betriebsgrenzen",
  "Luftraum-Freigabe bestätigt (NOTAM geprüft)",
  "Kommunikation mit Bodenstelle hergestellt",
  "Nutzlast korrekt gesichert und gewogen",
];

const MISSION_TYPES: Record<string, { label: string; color: string }> = {
  LASTENFLUG: { label: "Lastenflug", color: "text-brand-500" },
  EINMALIGE_LIEFERUNG: { label: "Einmalige Lieferung", color: "text-brand-600" },
  LANGZEIT_EINSATZ: { label: "Langzeit-Einsatz", color: "text-brand-700" },
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

function ProgressRing({ value, max = 100, size = 48, stroke = 4, color = "#D32F2F" }: {
  value: number; max?: number; size?: number; stroke?: number; color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={stroke} />
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
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-lg font-bold text-gray-900">{value}<span className="text-xs text-gray-500 ml-0.5">{unit}</span></p>
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
      "Max. Höhe 120m AGL",
      "Abstand zu Menschen halten",
    ],
    II: [
      "VLOS oder erweiterter VLOS mit Beobachter",
      "Risikobewertung durchführen",
      "Notfallverfahren bereithalten",
    ],
    III: [
      "BVLOS möglich mit Genehmigung",
      "Erweiterte Risikobewertung erforderlich",
      "C2 Link-Redundanz sicherstellen",
      "Notlandeverfahren aktivieren",
    ],
    IV: [
      "Safety Manager Freigabe erforderlich",
      "Vollständige SORA-Dokumentation",
      "Betriebssicherheitsplan aktiv",
      "Echtzeit-Monitoring durch Bodenstelle",
    ],
  };

  const rules = guidelines[sail] ?? guidelines["I"] ?? [];

  return (
    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">SORA SAIL {sail} — Richtlinien</span>
      </div>
      <ul className="space-y-1.5">
        {rules.map((rule, i) => (
          <li key={i} className="text-xs text-brand-700 flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-brand-500 mt-0.5 flex-shrink-0" />
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
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-50 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
        {error.message}
      </div>
    );
  }

  // Use API data if available, otherwise fall back to demo flights
  const flights = data?.flights?.length ? data.flights : DEMO_FLIGHTS;

  // Stats
  const totalFlights = flights.length;
  const activeFlights = flights.filter((f: any) => f.status === "in_air" || f.status === "pre_flight_check").length;
  const completedFlights = flights.filter((f: any) => f.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Pilot KPI Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Zugewiesene Flüge", value: totalFlights, icon: Plane, color: "#D32F2F" },
          { label: "Aktiv", value: activeFlights, icon: Radio, color: "#D32F2F" },
          { label: "Abgeschlossen", value: completedFlights, icon: CheckCircle2, color: "#D32F2F" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedNumber value={kpi.value} />
            </p>
          </div>
        ))}
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {flights.map((flight: any) => {
          const isExpanded = expandedId === flight.id;
          const isPostFlightOpen = showPostFlight === flight.id;
          const statusCfg = FLIGHT_STATUS_LABELS[flight.status] ?? FLIGHT_STATUS_LABELS.scheduled;
          const booking = flight.booking;
          const form = getForm(flight.id);
          const allChecked = form.checklistDone.every(Boolean);
          const missionType = MISSION_TYPES[booking?.serviceSubtype ?? ""] ?? MISSION_TYPES.LASTENFLUG;

          return (
            <div key={flight.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${statusCfg.glow}`}>
              {/* Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : flight.id)}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-500">
                        {booking?.identifier ?? flight.id.slice(0, 8)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`text-xs font-semibold ${missionType.color}`}>{missionType.label}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">
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
                          <span className="text-gray-300">·</span>
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
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-5 space-y-6">
                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <TelemetryGauge label="Nutzlast" value={parseFloat(booking?.payloadWeightKg ?? "0")} unit="kg" max={100} color="#D32F2F" icon={Package} />
                    <TelemetryGauge label="Batterie" value={92} unit="%" max={100} color="#D32F2F" icon={Battery} />
                    <TelemetryGauge label="Geschw." value={75} unit="km/h" max={120} color="#D32F2F" icon={Gauge} />
                    <TelemetryGauge label="Höhe" value={120} unit="m" max={300} color="#D32F2F" icon={Navigation} />
                  </div>

                  {/* Flight details */}
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nutzlast</span>
                      </div>
                      <p className="font-semibold text-gray-900">{booking?.payloadWeightKg} kg</p>
                      {booking?.payloadDescription && <p className="text-gray-500 text-xs mt-1">{booking.payloadDescription}</p>}
                      {booking?.isDangerousGoods && (
                        <p className="text-red-600 text-xs font-bold mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          GEFAHRGUT
                        </p>
                      )}
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lieferadresse</span>
                      </div>
                      <p className="font-semibold text-gray-900">{booking?.deliveryAddress ?? "—"}</p>
                      {booking?.deliveryLat && booking?.deliveryLng && (
                        <p className="text-gray-500 text-xs mt-1 font-mono">
                          {parseFloat(booking.deliveryLat).toFixed(5)}°N, {parseFloat(booking.deliveryLng).toFixed(5)}°E
                        </p>
                      )}
                    </div>

                    {booking?.pickupAddress && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Abflugort</span>
                        </div>
                        <p className="font-semibold text-gray-900">{booking.pickupAddress}</p>
                      </div>
                    )}

                    {flight.drone && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Plane className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Drohne</span>
                        </div>
                        <p className="font-semibold text-gray-900">{flight.drone.model}</p>
                        <p className="text-gray-500 text-xs mt-1 font-mono">{flight.drone.serialNumber}</p>
                      </div>
                    )}
                  </div>

                  {/* SORA Guidelines */}
                  <SORAGuidelines soraCategory={flight.soraCategory} />

                  {/* Permits */}
                  {flight.permits.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Bewilligungen
                      </h4>
                      <div className="space-y-2">
                        {flight.permits.map((permit: any) => (
                          <div key={permit.id} className="flex items-center justify-between text-sm bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                            <span className="font-medium text-gray-900">{permit.authority}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              permit.status === "approved"
                                ? "bg-gray-50 text-gray-600 border-gray-200"
                                : permit.status === "rejected"
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
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
                      className="flex items-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Post-Flight-Log einreichen
                    </button>
                  )}

                  {/* Post-flight form */}
                  {isPostFlightOpen && (
                    <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 space-y-5">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-brand-500" />
                        Post-Flight-Log
                      </h4>

                      {/* Safety checklist */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                          Vorflug-Checkliste (Pflicht)
                        </p>
                        <div className="space-y-2">
                          {SAFETY_CHECKLIST.map((item, idx) => (
                            <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={form.checklistDone[idx]}
                                onChange={() => toggleChecklist(flight.id, idx)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-300 bg-white text-brand-500 focus:ring-brand-500/40"
                              />
                              <span className={`text-sm transition-colors ${form.checklistDone[idx] ? "text-brand-600" : "text-gray-500 group-hover:text-gray-700"}`}>
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                        {!allChecked && (
                          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Alle Checkpunkte müssen bestätigt sein.
                          </p>
                        )}
                      </div>

                      {/* Form fields */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Tatsächliches Gewicht (kg)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all"
                            placeholder="z.B. 24.5"
                            value={form.actualWeightKg}
                            onChange={(e) => updateForm(flight.id, { actualWeightKg: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Flugdauer (Minuten)</label>
                          <input
                            type="number"
                            min="1"
                            max="480"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all"
                            placeholder="z.B. 45"
                            value={form.flightDurationMinutes}
                            onChange={(e) => updateForm(flight.id, { flightDurationMinutes: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Notizen (optional)</label>
                        <textarea
                          rows={2}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all resize-none"
                          placeholder="Besonderheiten, Extras, Abweichungen..."
                          value={form.notes}
                          onChange={(e) => updateForm(flight.id, { notes: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Zwischenfall-Bericht (optional)</label>
                        <textarea
                          rows={2}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-300 transition-all resize-none"
                          placeholder="Beschreiben Sie allfällige Zwischenfälle..."
                          value={form.incidentReport}
                          onChange={(e) => updateForm(flight.id, { incidentReport: e.target.value })}
                        />
                      </div>

                      {submitMutation.error && (
                        <p className="text-sm text-red-600">{submitMutation.error.message}</p>
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
                          className="flex items-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-brand-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {submitMutation.isPending ? "Wird eingereicht..." : "Post-Flight-Log einreichen"}
                        </button>
                        <button
                          onClick={() => setShowPostFlight(null)}
                          className="px-6 py-3.5 text-gray-500 font-semibold rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}

                  {flight.status === "completed" && (
                    <div className="flex items-center gap-2.5 text-brand-600 font-semibold bg-brand-50 border border-brand-100 rounded-xl px-5 py-3">
                      <CheckCircle2 className="w-5 h-5" />
                      Flug abgeschlossen — Post-Flight-Log eingereicht
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
