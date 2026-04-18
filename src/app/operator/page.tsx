import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getAuthUserId, getUserRole, isClerkConfigured } from "@/lib/demo-auth";
import { OperatorDashboard } from "@/components/operator/OperatorDashboard";
import { BarChart2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Operator Dashboard — Airbase Aviation OS",
};

export default async function OperatorPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const role = await getUserRole(userId);
  if (isClerkConfigured && role !== "operator") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AIRBASE</span>
            <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-1">
              OPERATOR
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/safety"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Safety
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Analytics
            </Link>
            {isClerkConfigured && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Buchungsübersicht</h1>
          <p className="text-gray-500 mt-1">
            Alle Buchungen prüfen, genehmigen oder ablehnen
          </p>
        </div>
        <OperatorDashboard />
      </div>
    </div>
  );
}
