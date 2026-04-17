import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FranchiseDashboard } from "@/components/operator/FranchiseDashboard";

export const metadata = {
  title: "Franchise Admin — Airbase",
};

export default async function FranchisePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00B4D8] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Airbase</span>
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-1">
              FRANCHISE
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/operator" className="text-gray-500 hover:text-gray-900 transition-colors">
              Operator
            </Link>
            <Link href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Franchise-Verwaltung</h1>
          <p className="text-gray-500 mt-1">Übersicht, Piloten, Drohnen und Preiskonfiguration</p>
        </div>
        <FranchiseDashboard />
      </div>
    </div>
  );
}
