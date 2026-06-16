import type { Metadata } from "next";
import { FinancialPlan } from "@/components/financial-plan/FinancialPlan";

export const metadata: Metadata = {
  title: "AIRBASE — Financial Plan",
  description:
    "Investor-Grade Financial Projections — Confidential",
  robots: { index: false, follow: false },
};

export default function FinancialPlanPage() {
  return <FinancialPlan />;
}
