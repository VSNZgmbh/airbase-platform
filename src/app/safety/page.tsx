import { redirect } from "next/navigation";
import { getAuthUserId, getUserRole, isClerkConfigured } from "@/lib/demo-auth";
import { SafetyDashboard } from "@/components/safety/SafetyDashboard";

export const metadata = { title: "Compliance — Airbase Aviation OS" };

export default async function SafetyPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");
  const role = await getUserRole(userId);
  if (isClerkConfigured && role !== "operator") redirect("/dashboard");
  return <SafetyDashboard />;
}
