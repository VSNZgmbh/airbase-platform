"use client";

import { useState, useEffect } from "react";
import { Battery, Signal, Wifi } from "lucide-react";

export function TopBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-6">
        <span className="font-mono text-lg font-bold text-gray-900 tracking-wider">{time}</span>
        <span className="text-xs text-gray-400 font-medium">UTC+2</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Battery className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">95%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Signal className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-semibold text-gray-500">4G+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-semibold text-gray-500">Stabil</span>
        </div>
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          <span className="text-xs font-bold text-brand-600">LIVE</span>
        </div>
      </div>
    </div>
  );
}
