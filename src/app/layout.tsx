export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airbase — Drohnentransport Schweiz",
  description:
    "Schneller, zuverlässiger Drohnentransport in der Schweiz. Buchen Sie jetzt Ihren LASTENFLUG mit dem FlyCart 100.",
  metadataBase: new URL("https://airbase.one"),
  openGraph: {
    title: "Airbase — Drohnentransport Schweiz",
    description: "Buchen Sie jetzt Ihren Drohnentransport",
    url: "https://airbase.one",
    siteName: "Airbase",
    locale: "de_CH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="de">
        <body>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
