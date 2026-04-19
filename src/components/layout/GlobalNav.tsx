"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Plane, Settings } from "lucide-react";

const dashboards = [
  { href: "/dashboard", label: "Kunden", icon: LayoutDashboard },
  { href: "/admin", label: "Admin", icon: Settings },
  { href: "/pilot", label: "Pilot", icon: Plane },
  { href: "/safety", label: "Safety", icon: ShieldCheck },
] as const;

export function GlobalNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Demo Banner */}
      <div
        className="w-full text-center text-xs font-semibold py-1.5 tracking-wide"
        style={{ background: "#FEF3C7", color: "#92400E", borderBottom: "1px solid #FDE68A" }}
      >
        DEMO-MODUS — Kein echtes Login erforderlich. Alle Dashboards frei zugänglich.
      </div>

      {/* Global Dashboard Nav */}
      <nav
        className="w-full border-b"
        style={{ background: "#0F172A", borderColor: "#1E293B" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <Link
              href="/"
              className="text-sm font-black tracking-tight transition-colors"
              style={{ color: pathname === "/" ? "#FFFFFF" : "rgba(248,250,252,0.7)" }}
            >
              AIRBASE
            </Link>

            <div className="flex items-center gap-1">
              {dashboards.map(({ href, label, icon: Icon }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                    style={
                      isActive
                        ? { background: "#D32F2F", color: "#FFFFFF" }
                        : { color: "rgba(248,250,252,0.7)" }
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
