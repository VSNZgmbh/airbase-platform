"use client";

import { useState } from "react";
import { Package, AlertTriangle, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { validatePayload, FLYCART_100 } from "@/lib/pricing";
import type { BookingData } from "./BookingWizard";

interface Props {
  data: BookingData;
  onNext: (data: Pick<BookingData, "payloadWeightKg" | "payloadDescription" | "isDangerousGoods">) => void;
  onBack: () => void;
}

export function Step3Payload({ data, onNext, onBack }: Props) {
  const [weight, setWeight] = useState<string>(
    data.payloadWeightKg ? String(data.payloadWeightKg) : ""
  );
  const [description, setDescription] = useState<string>(
    data.payloadDescription ?? ""
  );
  const [isDangerous, setIsDangerous] = useState<boolean>(
    data.isDangerousGoods ?? false
  );

  const weightNum = parseFloat(weight);
  const validation = weight ? validatePayload(weightNum) : null;
  const canProceed = weight && validation?.valid;

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Nutzlast</h2>
      <p className="text-gray-500 mb-8">
        Angaben zur zu transportierenden Fracht.
      </p>

      {/* Drone info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Airbase T100:</strong> Max. Nutzlast{" "}
          {FLYCART_100.MAX_PAYLOAD_KG} kg · Max. Reichweite {FLYCART_100.MAX_RANGE_KM} km ·{" "}
          Reisegeschwindigkeit {FLYCART_100.CRUISE_SPEED_KMH} km/h
        </div>
      </div>

      {/* Weight input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Gewicht der Fracht (kg)*
        </label>
        <div className="relative">
          <input
            type="number"
            min="0.1"
            max={FLYCART_100.MAX_PAYLOAD_KG}
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="z.B. 25"
            className={`w-full px-4 py-3 pr-16 rounded-xl border-2 text-lg font-semibold transition-colors focus:outline-none ${
              validation?.valid === false
                ? "border-red-300 focus:border-red-400 bg-red-50"
                : validation?.valid === true
                ? "border-green-300 focus:border-green-400"
                : "border-gray-200 focus:border-brand-400"
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            kg
          </span>
        </div>

        {/* Weight visualization */}
        {weightNum > 0 && weightNum <= FLYCART_100.MAX_PAYLOAD_KG && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0 kg</span>
              <span>{FLYCART_100.MAX_PAYLOAD_KG} kg max</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  weightNum > 80
                    ? "bg-orange-400"
                    : weightNum > 50
                    ? "bg-yellow-400"
                    : "bg-green-400"
                }`}
                style={{
                  width: `${(weightNum / FLYCART_100.MAX_PAYLOAD_KG) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {((weightNum / FLYCART_100.MAX_PAYLOAD_KG) * 100).toFixed(0)}% der
              Maximalkapazität
            </p>
          </div>
        )}

        {validation?.valid === false && (
          <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {validation.error}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Beschreibung der Fracht
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="z.B. Baumaterial, Lebensmittel, Medikamente, Ersatzteile..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-400 focus:outline-none resize-none"
        />
      </div>

      {/* Dangerous goods */}
      <div className="mb-8">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDangerous}
            onChange={(e) => setIsDangerous(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="text-sm font-semibold text-gray-700">
              Gefahrgut vorhanden
            </span>
            <p className="text-sm text-gray-500 mt-0.5">
              Aktivieren Sie diese Option, wenn die Fracht gefährliche Güter
              enthält (gemäss IATA DGR / ADR). Wir werden Ihre Anfrage gesondert
              prüfen.
            </p>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Zurück
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={() =>
            onNext({
              payloadWeightKg: weightNum,
              payloadDescription: description || undefined,
              isDangerousGoods: isDangerous,
            })
          }
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold py-4 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Weiter
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
