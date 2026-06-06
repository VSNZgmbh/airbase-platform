"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Navigation,
  Plane,
  ShieldCheck,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/pilot", label: "Mission Control", icon: Navigation },
  { href: "/admin/fleet", label: "Fleet Status", icon: Plane },
  { href: "/safety", label: "Compliance", icon: ShieldCheck },
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/operator", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-2">
          <img src="/airbase-logo-new.jpg" alt="airBASE" className="h-8 w-auto" />
        </div>
        <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-1 ml-0.5">Aviation OS</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-brand-500" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Drone image placeholder */}
      <div className="px-5 pb-6">
        <div className="bg-brand-50 rounded-xl p-4 flex flex-col items-center">
          <Plane className="w-10 h-10 text-brand-500 mb-2 -rotate-45" />
          <span className="text-[10px] font-bold text-brand-600 tracking-wider">FLYCART 100</span>
        </div>
      </div>
    </aside>
  );
}
