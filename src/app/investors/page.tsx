import type { Metadata } from "next";
import { InvestorPitchDeck } from "@/components/investors/InvestorPitchDeck";

export const metadata: Metadata = {
  title: "AIRBASE — Investor Pitch Deck",
  description:
    "Switzerland's Drone-as-a-Service Infrastructure. Order Today. Fly Tomorrow.",
  robots: { index: false, follow: false },
};

export default function InvestorsPage() {
  return <InvestorPitchDeck />;
}
