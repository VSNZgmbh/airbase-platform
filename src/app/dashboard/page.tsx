import { redirect } from "next/navigation";
import { getAuthUserId, isClerkConfigured } from "@/lib/demo-auth";
import { UserButton } from "@clerk/nextjs";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";

export const metadata = { title: "Overview — Airbase Aviation OS" };

export default async function DashboardPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  return <CustomerDashboard />;
}
