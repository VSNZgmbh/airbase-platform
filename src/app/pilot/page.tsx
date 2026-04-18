import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getAuthUserId, getUserRole, isClerkConfigured } from "@/lib/demo-auth";
import { PilotDashboard } from "@/components/pilot/PilotDashboard";
import { Plane } from "lucide-react";

export const metadata = {
  title: "Pilot Interface — VOLTAIR",
};

export default async function PilotPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const role = await getUserRole(userId);
  if (isClerkConfigured && role !== "pilot") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/15">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-xl text-gray-900">VOLTAIR</span>
            <span className="text-[10px] font-bold bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full border border-brand-200 tracking-wider">
              PILOT
            </span>
          </Link>
          {isClerkConfigured && <UserButton afterSignOutUrl="/" />}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meine Flüge</h1>
            <p className="text-gray-500 mt-1 text-sm">Mission Briefings, Telemetrie und Post-Flight-Logs</p>
          </div>
        </div>
        <PilotDashboard />
      </div>
    </div>
  );
}
