"use client";

import { useState } from "react";
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
} from "lucide-react";

const FLIGHT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Geplant", color: "bg-blue-100 text-blue-700" },
  pre_flight_check: { label: "Vorflugcheck", color: "bg-yellow-100 text-yellow-700" },
  in_air: { label: "In der Luft", color: "bg-indigo-100 text-indigo-700" },
  landed: { label: "Gelandet", color: "bg-green-100 text-green-700" },
  completed: { label: "Abgeschlossen", color: "bg-gray-100 text-gray-600" },
  aborted: { label: "Abgebrochen", color: "bg-red-100 text-red-600" },
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

export function PilotDashboard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPostFlight, setShowPostFlight] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, PostFlightForm>>({});

  const { data, isLoading, error, refetch } = trpc.pilot.myFlights.useQuery({
    limit: 20,
    offset: 0,
  });

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
    setForms((prev) => ({
      ...prev,
      [flightId]: { ...getForm(flightId), ...patch },
    }));
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
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-700">
        {error.message}
      </div>
    );
  }

  if (!data?.flights.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plane className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Keine Flüge zugewiesen</h3>
        <p className="text-gray-500 text-sm">
          Ihnen sind aktuell keine Flüge zugewiesen. Der Operator weist Ihnen Flüge zu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.flights.map((flight) => {
        const isExpanded = expandedId === flight.id;
        const isPostFlightOpen = showPostFlight === flight.id;
        const statusCfg = FLIGHT_STATUS_LABELS[flight.status] ?? FLIGHT_STATUS_LABELS.scheduled;
        const booking = flight.booking;
        const form = getForm(flight.id);
        const allChecked = form.checklistDone.every(Boolean);

        return (
          <div key={flight.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : flight.id)}
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Plane className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-500">
                      {booking?.identifier ?? flight.id.slice(0, 8)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {booking?.serviceType ?? "Flug"}
                    {booking?.serviceSubtype === "EINMALIGE_LIEFERUNG"
                      ? " — Einmalige Lieferung"
                      : booking?.serviceSubtype === "LANGZEIT_EINSATZ"
                      ? " — Langzeit-Einsatz"
                      : ""}
                  </h3>
                  <div className="text-sm text-gray-500 flex gap-3 mt-0.5 flex-wrap">
                    {flight.scheduledDeparture && (
                      <span>
                        {format(new Date(flight.scheduledDeparture), "d. MMM yyyy HH:mm", {
                          locale: de,
                        })}{" "}
                        Uhr
                      </span>
                    )}
                    {booking?.payloadWeightKg && (
                      <>
                        <span>·</span>
                        <span>{booking.payloadWeightKg} kg</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 sm:p-6 space-y-6">
                {/* Flight details grid */}
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-gray-500 block">Nutzlast</span>
                      <p className="font-medium text-gray-900">{booking?.payloadWeightKg} kg</p>
                      {booking?.payloadDescription && (
                        <p className="text-gray-500 text-xs">{booking.payloadDescription}</p>
                      )}
                      {booking?.isDangerousGoods && (
                        <p className="text-red-600 text-xs font-semibold mt-1">GEFAHRGUT</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-gray-500 block">Lieferadresse</span>
                      <p className="font-medium text-gray-900">{booking?.deliveryAddress ?? "—"}</p>
                      {booking?.deliveryLat && booking?.deliveryLng && (
                        <p className="text-gray-400 text-xs">
                          {parseFloat(booking.deliveryLat).toFixed(5)}°N,{" "}
                          {parseFloat(booking.deliveryLng).toFixed(5)}°E
                        </p>
                      )}
                    </div>
                  </div>

                  {booking?.pickupAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500 block">Abflugort</span>
                        <p className="font-medium text-gray-900">{booking.pickupAddress}</p>
                      </div>
                    </div>
                  )}

                  {flight.soraCategory && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-500 block">SORA-Kategorie</span>
                        <p className="font-medium text-gray-900">{flight.soraCategory}</p>
                      </div>
                    </div>
                  )}

                  {flight.drone && (
                    <div>
                      <span className="text-gray-500 block">Drohne</span>
                      <p className="font-medium text-gray-900">
                        {flight.drone.model} ({flight.drone.serialNumber})
                      </p>
                    </div>
                  )}
                </div>

                {/* Permits */}
                {flight.permits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Bewilligungen</h4>
                    <div className="space-y-2">
                      {flight.permits.map((permit) => (
                        <div
                          key={permit.id}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-2"
                        >
                          <span className="font-medium text-gray-900">{permit.authority}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              permit.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : permit.status === "rejected"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {permit.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post-flight button for completed-eligible flights */}
                {flight.status !== "completed" && flight.status !== "aborted" && (
                  <button
                    onClick={() => setShowPostFlight(isPostFlightOpen ? null : flight.id)}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Post-Flight-Log einreichen
                  </button>
                )}

                {/* Post-flight form */}
                {isPostFlightOpen && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 sm:p-6 space-y-5">
                    <h4 className="font-semibold text-gray-900">Post-Flight-Log</h4>

                    {/* Safety checklist */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Vorflug-Checkliste (Pflicht)
                      </p>
                      <div className="space-y-2">
                        {SAFETY_CHECKLIST.map((item, idx) => (
                          <label key={idx} className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.checklistDone[idx]}
                              onChange={() => toggleChecklist(flight.id, idx)}
                              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{item}</span>
                          </label>
                        ))}
                      </div>
                      {!allChecked && (
                        <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Alle Checkpunkte müssen bestätigt sein, bevor das Log eingereicht werden kann.
                        </p>
                      )}
                    </div>

                    {/* Form fields */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tatsächliches Gewicht (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="z.B. 24.5"
                          value={form.actualWeightKg}
                          onChange={(e) =>
                            updateForm(flight.id, { actualWeightKg: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Flugdauer (Minuten)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="480"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="z.B. 45"
                          value={form.flightDurationMinutes}
                          onChange={(e) =>
                            updateForm(flight.id, { flightDurationMinutes: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notizen (optional)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Besonderheiten, Extras, Abweichungen..."
                        value={form.notes}
                        onChange={(e) => updateForm(flight.id, { notes: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zwischenfall-Bericht (optional)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        disabled={
                          !allChecked ||
                          !form.actualWeightKg ||
                          !form.flightDurationMinutes ||
                          submitMutation.isPending
                        }
                        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {submitMutation.isPending ? "Wird eingereicht..." : "Post-Flight-Log einreichen"}
                      </button>
                      <button
                        onClick={() => setShowPostFlight(null)}
                        className="px-5 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}

                {flight.status === "completed" && (
                  <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
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
  );
}
