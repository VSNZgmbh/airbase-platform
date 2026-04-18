import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/demo-auth";
import { FranchiseDashboard } from "@/components/operator/FranchiseDashboard";

export const metadata = { title: "Fleet Status — VOLTAIR Mission Control" };

export default async function FranchisePage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");
  return <FranchiseDashboard />;
}
