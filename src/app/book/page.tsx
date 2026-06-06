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
            <img src="/airbase-logo-transparent.png" alt="airBASE" className="h-10 w-auto" />
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
