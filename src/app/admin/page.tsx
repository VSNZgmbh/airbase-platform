import { redirect } from "next/navigation";
import { getAuthUserId, getUserRole, isClerkConfigured } from "@/lib/demo-auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const role = await getUserRole(userId);
  if (isClerkConfigured && role !== "operator") redirect("/dashboard");

  return <AdminDashboard />;
}
