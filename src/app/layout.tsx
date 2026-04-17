export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airbase.one — Drohnen-Gütertransport Schweiz",
  description:
    "LASTENFLUG: Schwere Lasten per Drohne transportieren. Bis 100 kg Nutzlast. SORA-zertifiziert. BAZL-konform. Für Bau, Alpine Logistik & Notfallversorgung in der Schweiz.",
  metadataBase: new URL("https://airbase.one"),
  openGraph: {
    title: "Airbase.one — Schweizer Drohnen-Logistik",
    description:
      "Der fortschrittlichste Drohnen-Transportservice der Schweiz. Bis 100 kg Nutzlast.",
    url: "https://airbase.one",
    siteName: "Airbase.one",
    locale: "de_CH",
    type: "website",
    images: [{ url: "/og-image.jpg" }],
  },
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isClerkConfigured =
  clerkKey.startsWith("pk_") &&
  clerkKey !== "pk_test_placeholder" &&
  clerkKey.length > 20;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="de">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );

  if (isClerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
