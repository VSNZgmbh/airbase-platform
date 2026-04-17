import { getLocale } from "next-intl/server";
import { LandingPageContent } from "@/components/landing/LandingPageContent";

export default async function LandingPage() {
  const locale = await getLocale();
  return <LandingPageContent locale={locale} />;
}

