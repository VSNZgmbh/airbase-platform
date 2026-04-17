"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Step1ServiceType } from "./Step1ServiceType";
import { Step2DateTime } from "./Step2DateTime";
import { Step3Payload } from "./Step3Payload";
import { Step4Location } from "./Step4Location";
import { Step5PriceSummary } from "./Step5PriceSummary";
import { Step6Confirm } from "./Step6Confirm";
import type { BookingStep1, BookingStep2, BookingStep3, BookingStep4 } from "@/lib/validations";

export type BookingData = Partial<
  BookingStep1 & BookingStep2 & BookingStep3 & BookingStep4
>;

const STEPS = [
  { id: 1, label: "Leistung" },
  { id: 2, label: "Datum" },
  { id: 3, label: "Nutzlast" },
  { id: 4, label: "Standort" },
  { id: 5, label: "Angebot" },
  { id: 6, label: "Buchen" },
];

export function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  const updateData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 overflow-x-auto -mx-1 px-1">
        <div className="flex items-center justify-between min-w-[320px]">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step.id < currentStep
                      ? "bg-brand-600 text-white"
                      : step.id === currentStep
                      ? "bg-brand-600 text-white ring-4 ring-brand-100"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`text-xs mt-1 hidden sm:block ${
                    step.id <= currentStep ? "text-brand-600 font-medium" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    step.id < currentStep ? "bg-brand-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {currentStep === 1 && (
          <Step1ServiceType
            data={bookingData}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
          />
        )}
        {currentStep === 2 && (
          <Step2DateTime
            data={bookingData}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        {currentStep === 3 && (
          <Step3Payload
            data={bookingData}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        {currentStep === 4 && (
          <Step4Location
            data={bookingData}
            onNext={(data) => {
              updateData(data);
              nextStep();
            }}
            onBack={prevStep}
          />
        )}
        {currentStep === 5 && (
          <Step5PriceSummary
            data={bookingData as BookingData}
            onNext={() => nextStep()}
            onBack={prevStep}
          />
        )}
        {currentStep === 6 && (
          <Step6Confirm
            data={bookingData as BookingData}
            onBack={prevStep}
          />
        )}
      </div>
    </div>
  );
}
