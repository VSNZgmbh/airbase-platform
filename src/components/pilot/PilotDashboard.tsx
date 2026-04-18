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
  Battery,
  Gauge,
  ShieldCheck,
  Navigation,
  FileText,
} from "lucide-react";
import { WeatherBadge } from "./WeatherBadge";
import { MissionControlLayout, SwissMap, KeyMetrics } from "@/components/mission-control";

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

// ─── Telemetry Gauge (SVG ring) ──────────────────────────────────────────────

function TelemetryGauge({ label, value, unit, max, icon: Icon }: {
  label: string; value: number; unit: string; max: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#D32F2F" strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-500" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-gray-900 leading-none">
          {value}<span className="text-[10px] text-gray-400 ml-0.5">{unit}</span>
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
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

// ─── Active Mission Detail ───────────────────────────────────────────────────

function ActiveMissionDetail({ flight }: { flight: any }) {
  if (!flight) return null;
  const booking = flight.booking;
  const statusCfg = FLIGHT_STATUS_LABELS[flight.status] ?? FLIGHT_STATUS_LABELS.scheduled;
  const missionType = MISSION_TYPES[booking?.serviceSubtype ?? ""] ?? MISSION_TYPES.LASTENFLUG;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Active Mission</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-gray-900">
            {booking?.identifier ?? flight.id.slice(0, 8)}
          </span>
          <span className={`text-xs font-semibold ${missionType.color}`}>{missionType.label}</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Telemetry Grid */}
        <div className="grid grid-cols-4 gap-3">
          <TelemetryGauge label="Nutzlast" value={parseFloat(booking?.payloadWeightKg ?? "0")} unit="kg" max={100} icon={Package} />
          <TelemetryGauge label="Batterie" value={92} unit="%" max={100} icon={Battery} />
          <TelemetryGauge label="Geschw." value={75} unit="km/h" max={120} icon={Gauge} />
          <TelemetryGauge label="Höhe" value={120} unit="m" max={300} icon={Navigation} />
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-3">
          {booking?.pickupAddress && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Abflugort</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{booking.pickupAddress}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3 h-3 text-brand-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lieferadresse</span>
            </div>
            <p className="text-xs font-semibold text-gray-900">{booking?.deliveryAddress ?? "—"}</p>
          </div>
        </div>

        {/* SORA category */}
        <SORAGuidelines soraCategory={flight.soraCategory} />

        {/* Safety Checklist (read-only for active view) */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Vorflug-Checkliste</p>
          <div className="space-y-1.5">
            {SAFETY_CHECKLIST.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-300 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mission List ─────────────────────────────────────────────────────────────

function MissionList({
  flights,
  expandedId,
  setExpandedId,
  showPostFlight,
  setShowPostFlight,
  forms,
  getForm,
  updateForm,
  toggleChecklist,
  submitMutation,
}: {
  flights: any[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  showPostFlight: string | null;
  setShowPostFlight: (id: string | null) => void;
  forms: Record<string, PostFlightForm>;
  getForm: (id: string) => PostFlightForm;
  updateForm: (id: string, patch: Partial<PostFlightForm>) => void;
  toggleChecklist: (id: string, idx: number) => void;
  submitMutation: any;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 140px)" }}>
      <div className="px-5 py-3 border-b border-gray-50 flex-shrink-0">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Mission Briefings</h3>
        <p className="text-[10px] text-gray-300 mt-0.5">{flights.length} Flüge</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {flights.map((flight: any) => {
          const isExpanded = expandedId === flight.id;
          const isPostFlightOpen = showPostFlight === flight.id;
          const statusCfg = FLIGHT_STATUS_LABELS[flight.status] ?? FLIGHT_STATUS_LABELS.scheduled;
          const booking = flight.booking;
          const form = getForm(flight.id);
          const allChecked = form.checklistDone.every(Boolean);
          const missionType = MISSION_TYPES[booking?.serviceSubtype ?? ""] ?? MISSION_TYPES.LASTENFLUG;

          return (
            <div key={flight.id} className={`border-b border-gray-50 last:border-b-0 ${statusCfg.glow}`}>
              {/* Row header */}
              <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : flight.id)}
              >
                {/* Status dot */}
                <div className="flex-shrink-0">
                  {flight.status === "in_air" ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500" />
                    </span>
                  ) : flight.status === "pre_flight_check" ? (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                  ) : (
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold text-gray-700 truncate">
                      {booking?.identifier ?? flight.id.slice(0, 8)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    {flight.scheduledDeparture && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(flight.scheduledDeparture), "d. MMM HH:mm", { locale: de })}
                      </span>
                    )}
                    {booking?.payloadWeightKg && (
                      <>
                        <span className="text-gray-200">|</span>
                        <span>{booking.payloadWeightKg} kg</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expand arrow */}
                <div className="flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 pb-4 space-y-4">
                  {/* Mission type & service */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold ${missionType.color}`}>{missionType.label}</span>
                    {flight.soraCategory && (
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {flight.soraCategory}
                      </span>
                    )}
                  </div>

                  {/* Weather badge */}
                  {flight.status !== "completed" && flight.status !== "aborted" && booking?.deliveryLat && booking?.deliveryLng && (
                    <WeatherBadge
                      lat={parseFloat(booking.deliveryLat)}
                      lng={parseFloat(booking.deliveryLng)}
                      datetime={flight.scheduledDeparture ? new Date(flight.scheduledDeparture).toISOString() : undefined}
                    />
                  )}

                  {/* Flight details */}
                  <div className="space-y-2 text-xs">
                    {booking?.pickupAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-300 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Abflug</span>
                          <p className="text-gray-700 font-medium">{booking.pickupAddress}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Lieferung</span>
                        <p className="text-gray-700 font-medium">{booking?.deliveryAddress ?? "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Drone info */}
                  {flight.drone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      <Plane className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-gray-700">{flight.drone.model}</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-mono text-[10px]">{flight.drone.serialNumber}</span>
                    </div>
                  )}

                  {/* Permits */}
                  {flight.permits.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        Bewilligungen
                      </p>
                      <div className="space-y-1.5">
                        {flight.permits.map((permit: any) => (
                          <div key={permit.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            <span className="font-medium text-gray-700">{permit.authority}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
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

                  {/* Payload details */}
                  {booking?.isDangerousGoods && (
                    <p className="text-red-600 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      GEFAHRGUT
                    </p>
                  )}

                  {/* Post-flight button */}
                  {flight.status !== "completed" && flight.status !== "aborted" && (
                    <button
                      onClick={() => setShowPostFlight(isPostFlightOpen ? null : flight.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 w-full justify-center"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Post-Flight-Log einreichen
                    </button>
                  )}

                  {/* Post-flight form */}
                  {isPostFlightOpen && (
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 space-y-4">
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-brand-500" />
                        Post-Flight-Log
                      </h4>

                      {/* Safety checklist */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Vorflug-Checkliste (Pflicht)
                        </p>
                        <div className="space-y-1.5">
                          {SAFETY_CHECKLIST.map((item, idx) => (
                            <label key={idx} className="flex items-start gap-2.5 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={form.checklistDone[idx]}
                                onChange={() => toggleChecklist(flight.id, idx)}
                                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 bg-white text-brand-500 focus:ring-brand-500/40"
                              />
                              <span className={`text-xs transition-colors ${form.checklistDone[idx] ? "text-brand-600" : "text-gray-500 group-hover:text-gray-700"}`}>
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                        {!allChecked && (
                          <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Alle Checkpunkte müssen bestätigt sein.
                          </p>
                        )}
                      </div>

                      {/* Form fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1">Tatsächliches Gewicht (kg)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all"
                            placeholder="z.B. 24.5"
                            value={form.actualWeightKg}
                            onChange={(e) => updateForm(flight.id, { actualWeightKg: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1">Flugdauer (Minuten)</label>
                          <input
                            type="number"
                            min="1"
                            max="480"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all"
                            placeholder="z.B. 45"
                            value={form.flightDurationMinutes}
                            onChange={(e) => updateForm(flight.id, { flightDurationMinutes: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Notizen (optional)</label>
                        <textarea
                          rows={2}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-300 transition-all resize-none"
                          placeholder="Besonderheiten, Extras, Abweichungen..."
                          value={form.notes}
                          onChange={(e) => updateForm(flight.id, { notes: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Zwischenfall-Bericht (optional)</label>
                        <textarea
                          rows={2}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-300 transition-all resize-none"
                          placeholder="Beschreiben Sie allfällige Zwischenfälle..."
                          value={form.incidentReport}
                          onChange={(e) => updateForm(flight.id, { incidentReport: e.target.value })}
                        />
                      </div>

                      {submitMutation.error && (
                        <p className="text-xs text-red-600">{submitMutation.error.message}</p>
                      )}

                      <div className="flex gap-2">
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
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-brand-500/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {submitMutation.isPending ? "Wird eingereicht..." : "Einreichen"}
                        </button>
                        <button
                          onClick={() => setShowPostFlight(null)}
                          className="px-4 py-2.5 text-gray-500 text-xs font-semibold rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  )}

                  {flight.status === "completed" && (
                    <div className="flex items-center gap-2 text-brand-600 text-xs font-semibold bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5">
                      <CheckCircle2 className="w-4 h-4" />
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

  // Use API data if available, otherwise fall back to demo flights
  const flights = data?.flights?.length ? data.flights : DEMO_FLIGHTS;

  // Stats
  const activeCount = flights.filter((f: any) => f.status === "in_air" || f.status === "pre_flight_check").length;
  const completedCount = flights.filter((f: any) => f.status === "completed").length;

  // Active flight (or first scheduled)
  const activeFlightOrFirst =
    flights.find((f: any) => f.status === "in_air") ??
    flights.find((f: any) => f.status === "pre_flight_check") ??
    flights[0] ?? null;

  if (isLoading) {
    return (
      <MissionControlLayout>
        <div className="p-5">
          <div className="grid grid-cols-[1fr_380px] gap-5">
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse h-48" />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse h-20" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse h-96" />
          </div>
        </div>
      </MissionControlLayout>
    );
  }

  if (error) {
    return (
      <MissionControlLayout>
        <div className="p-5">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
            {error.message}
          </div>
        </div>
      </MissionControlLayout>
    );
  }

  return (
    <MissionControlLayout>
      <div className="p-5">
        <div className="grid grid-cols-[1fr_380px] gap-5">
          {/* Left: Map + Metrics + Current Mission detail */}
          <div className="flex flex-col gap-5">
            <SwissMap compact />

            <KeyMetrics items={[
              { label: "Zugewiesene Flüge", value: flights.length, animate: true },
              { label: "Aktiv", value: activeCount, animate: true },
              { label: "Abgeschlossen", value: completedCount, animate: true },
              { label: "Status", value: "BEREIT", highlight: false },
            ]} />

            {/* Active mission detail card */}
            <ActiveMissionDetail flight={activeFlightOrFirst} />
          </div>

          {/* Right: Mission list */}
          <div className="flex flex-col gap-5">
            <MissionList
              flights={flights}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              showPostFlight={showPostFlight}
              setShowPostFlight={setShowPostFlight}
              forms={forms}
              getForm={getForm}
              updateForm={updateForm}
              toggleChecklist={toggleChecklist}
              submitMutation={submitMutation}
            />
          </div>
        </div>
      </div>
    </MissionControlLayout>
  );
}
