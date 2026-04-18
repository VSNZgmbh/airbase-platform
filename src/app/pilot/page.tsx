import { redirect } from "next/navigation";
import { getAuthUserId, getUserRole, isClerkConfigured } from "@/lib/demo-auth";
import { PilotDashboard } from "@/components/pilot/PilotDashboard";

export const metadata = { title: "Mission Control — VOLTAIR" };

export default async function PilotPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");
  const role = await getUserRole(userId);
  if (isClerkConfigured && role !== "pilot") redirect("/dashboard");
  return <PilotDashboard />;
}
