import { redirect } from "next/navigation";
import { getAuthUserId, getUserRole, isClerkConfigured } from "@/lib/demo-auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const role = await getUserRole(userId);
  if (isClerkConfigured && role !== "operator") redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Buchungsstatistiken und Betriebskennzahlen im Überblick
          </p>
        </div>
        <AdminDashboard />
      </div>
    </main>
  );
}
