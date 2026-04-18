import { redirect } from "next/navigation";

export const metadata = { title: "Redirecting — Airbase Aviation OS" };

export default function FranchisePage() {
  redirect("/admin/fleet");
}
