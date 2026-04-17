"use client";

import { useState } from "react";
import { Package, Clock, ChevronRight } from "lucide-react";
import type { BookingData } from "./BookingWizard";

interface Props {
  data: BookingData;
  onNext: (data: Pick<BookingData, "serviceType" | "serviceSubtype">) => void;
}

export function Step1ServiceType({ data, onNext }: Props) {
  const [serviceType, setServiceType] = useState<"LASTENFLUG">(
    (data.serviceType as "LASTENFLUG") ?? "LASTENFLUG"
  );
  const [serviceSubtype, setServiceSubtype] = useState<
    "EINMALIGE_LIEFERUNG" | "LANGZEIT_EINSATZ" | undefined
  >(data.serviceSubtype);

  const canProceed = serviceType && serviceSubtype;

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Leistung wählen</h2>
      <p className="text-gray-500 mb-8">
        Wählen Sie den gewünschten Dienst und den Einsatztyp.
      </p>

      {/* Service type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Dienstleistung
        </label>
        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => setServiceType("LASTENFLUG")}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              serviceType === "LASTENFLUG"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">LASTENFLUG</div>
              <div className="text-sm text-gray-500">
                Frachttransport bis 100 kg mit Airbase T100
              </div>
            </div>
            {serviceType === "LASTENFLUG" && (
              <div className="ml-auto w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Sub-type */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Einsatztyp
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setServiceSubtype("EINMALIGE_LIEFERUNG")}
            className={`flex flex-col gap-2 p-5 rounded-xl border-2 text-left transition-all ${
              serviceSubtype === "EINMALIGE_LIEFERUNG"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-brand-600" />
              <span className="font-semibold text-gray-900">Einmalige Lieferung</span>
            </div>
            <p className="text-sm text-gray-500">
              Ein einzelner Transportauftrag. Ideal für dringende oder
              seltene Lieferungen.
            </p>
            {serviceSubtype === "EINMALIGE_LIEFERUNG" && (
              <div className="flex justify-end">
                <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setServiceSubtype("LANGZEIT_EINSATZ")}
            className={`flex flex-col gap-2 p-5 rounded-xl border-2 text-left transition-all ${
              serviceSubtype === "LANGZEIT_EINSATZ"
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-600" />
              <span className="font-semibold text-gray-900">Langzeit-Einsatz</span>
            </div>
            <p className="text-sm text-gray-500">
              Wiederkehrende Transporte für Baustellen, Events oder
              Industrieprojekte.
            </p>
            {serviceSubtype === "LANGZEIT_EINSATZ" && (
              <div className="flex justify-end">
                <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={!canProceed}
        onClick={() => onNext({ serviceType, serviceSubtype })}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold py-4 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Weiter
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
