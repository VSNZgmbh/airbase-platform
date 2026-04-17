"use client";

import { useState } from "react";
import { Calendar, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { de } from "date-fns/locale";
import type { BookingData } from "./BookingWizard";

interface Props {
  data: BookingData;
  onNext: (data: Pick<BookingData, "requestedDate" | "requestedTimeFrom" | "requestedTimeTo">) => void;
  onBack: () => void;
}

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00",
];

export function Step2DateTime({ data, onNext, onBack }: Props) {
  const minDate = addDays(startOfToday(), 2); // 48h advance booking
  const [selectedDate, setSelectedDate] = useState<string>(
    data.requestedDate ?? ""
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    data.requestedTimeFrom ?? ""
  );

  const canProceed = selectedDate && selectedTime;

  // Quick date options
  const quickDates = Array.from({ length: 14 }, (_, i) => addDays(minDate, i));

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Datum & Uhrzeit</h2>
      <p className="text-gray-500 mb-8">
        Buchungen sind mindestens 48 Stunden im Voraus erforderlich.
      </p>

      {/* Date selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <Calendar className="inline w-4 h-4 mr-1" />
          Flugdatum
        </label>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
            <div key={day} className="text-center text-xs text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {quickDates.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const isSelected = dateStr === selectedDate;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`py-2 px-1 rounded-lg text-sm transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white font-semibold"
                    : isWeekend
                    ? "text-gray-400 hover:bg-gray-100"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="text-xs text-center opacity-60">
                  {format(date, "d")}
                </div>
                <div className="text-center">{format(date, "d.M", { locale: de })}</div>
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <div className="mt-3 text-sm text-brand-600 font-medium">
            Ausgewählt: {format(new Date(selectedDate), "EEEE, d. MMMM yyyy", { locale: de })}
          </div>
        )}
      </div>

      {/* Time selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <Clock className="inline w-4 h-4 mr-1" />
          Gewünschte Abflugzeit
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {TIME_SLOTS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(time)}
              className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                selectedTime === time
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
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
              requestedDate: selectedDate,
              requestedTimeFrom: selectedTime,
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
