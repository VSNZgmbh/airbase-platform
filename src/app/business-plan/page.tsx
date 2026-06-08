import type { Metadata } from "next";
import { BusinessPlan } from "@/components/business-plan/BusinessPlan";

export const metadata: Metadata = {
  title: "AIRBASE — Business Plan",
  description:
    "Europe's First AI-Powered Heavy-Lift Drone Airline — Confidential Business Plan",
  robots: { index: false, follow: false },
};

export default function BusinessPlanPage() {
  return <BusinessPlan />;
}
