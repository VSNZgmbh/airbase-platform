import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { SafetyDashboard } from "@/components/safety/SafetyDashboard";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Safety Dashboard — Airbase LUC",
};

export default async function SafetyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = (user.publicMetadata as { role?: string })?.role;

  if (role !== "operator") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <header className="bg-[#0d1224]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-white">Airbase</span>
            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-wider">
              LUC SAFETY
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/operator"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Buchungen
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Analytics
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">LUC Safety Dashboard</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Light UAS Operator Certificate — Selbst-Autorisierungssystem f&uuml;r Flugfreigaben.
              Alle Entscheidungen werden f&uuml;r BAZL-Audits protokolliert.
            </p>
          </div>
        </div>
        <SafetyDashboard />
      </div>
    </div>
  );
}
