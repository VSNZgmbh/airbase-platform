import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Meine Buchungen — Airbase",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/15">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Airbase</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Neuer Flug
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <CustomerDashboard />
      </div>
    </div>
  );
}
