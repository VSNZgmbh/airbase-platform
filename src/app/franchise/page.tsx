import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUserId } from "@/lib/demo-auth";
import { FranchiseDashboard } from "@/components/operator/FranchiseDashboard";
import { Building2, ShieldCheck, BarChart2 } from "lucide-react";

export const metadata = {
  title: "Franchise Admin — Airbase",
};

export default async function FranchisePage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <header className="bg-[#0d1224]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-white">Airbase</span>
            <span className="text-[10px] font-bold bg-cyan-500/15 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 tracking-wider">
              FRANCHISE
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/operator" className="text-gray-400 hover:text-white transition-colors">
              Operator
            </Link>
            <Link href="/safety" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Safety
            </Link>
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4" />
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Franchise-Verwaltung</h1>
            <p className="text-gray-400 mt-1 text-sm">Flotte, Piloten, Umsatz und Preiskonfiguration</p>
          </div>
        </div>
        <FranchiseDashboard />
      </div>
    </div>
  );
}
