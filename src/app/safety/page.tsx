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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Airbase</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-1">
              LUC SAFETY
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/operator"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Buchungen
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Analytics
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LUC Safety Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Light UAS Operator Certificate — Selbst-Autorisierungssystem für Flugfreigaben.
              Alle Entscheidungen werden für BAZL-Audits protokolliert.
            </p>
          </div>
        </div>
        <SafetyDashboard />
      </div>
    </div>
  );
}
