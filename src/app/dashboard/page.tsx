import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import { ArrowRight, Plus } from "lucide-react";

export const metadata = {
  title: "Meine Buchungen — Airbase",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Airbase</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Neuer Flug
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Meine Buchungen</h1>
          <p className="text-gray-500 mt-1">Übersicht und Status Ihrer Drohnenflüge</p>
        </div>
        <CustomerDashboard />
      </div>
    </div>
  );
}
