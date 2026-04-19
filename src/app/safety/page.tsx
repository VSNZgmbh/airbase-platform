import { redirect } from "next/navigation";

export const metadata = { title: "Safety — Redirecting to Admin & Safety" };

export default function SafetyPage() {
  redirect("/admin");
}
