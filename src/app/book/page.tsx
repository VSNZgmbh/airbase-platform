import { BookingWizard } from "@/components/booking/BookingWizard";
import Link from "next/link";

export const metadata = {
  title: "Flug buchen — AIRBASE",
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AIRBASE</span>
          </Link>
          <span className="text-sm text-gray-500">Flug buchen</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <BookingWizard />
      </div>
    </div>
  );
}
