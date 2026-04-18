export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIRBASE — Drohnen-Gütertransport Schweiz",
  description:
    "LASTENFLUG: Schwere Lasten per Drohne transportieren. Bis 100 kg Nutzlast. DJI FlyCart 100. SORA-zertifiziert. BAZL-konform. Für Bau, Alpine Logistik & Notfallversorgung in der Schweiz.",
  metadataBase: new URL("https://airbase.one"),
  openGraph: {
    title: "AIRBASE — Schweizer Drohnen-Logistik",
    description:
      "Der fortschrittlichste Drohnen-Transportservice der Schweiz. DJI FlyCart 100 — bis 100 kg Nutzlast.",
    url: "https://airbase.one",
    siteName: "AIRBASE",
    locale: "de_CH",
    type: "website",
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIRBASE — Schweizer Drohnen-Logistik",
    description:
      "DJI FlyCart 100 — bis 100 kg Nutzlast. SORA-zertifiziert. BAZL-konform.",
    images: ["/og-image.jpg"],
  },
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isClerkConfigured =
  clerkKey.startsWith("pk_") &&
  clerkKey !== "pk_test_placeholder" &&
  clerkKey.length > 20;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const content = (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <TRPCProvider>{children}</TRPCProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );

  if (isClerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
