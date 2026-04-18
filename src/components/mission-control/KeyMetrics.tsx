"use client";

import { useState, useEffect } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display.toLocaleString("de-CH")}</span>;
}

interface MetricItem {
  label: string;
  value: number | string;
  animate?: boolean;
  highlight?: boolean;
}

export function KeyMetrics({ items }: { items: MetricItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 py-3 border-b border-gray-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Key Metrics</h3>
      </div>
      <div className={`grid grid-cols-${items.length} divide-x divide-gray-50`}>
        {items.map((item) => (
          <div key={item.label} className="px-5 py-4 text-center">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`text-2xl font-bold tracking-tight ${item.highlight ? "text-brand-600" : "text-gray-900"}`}>
              {item.animate && typeof item.value === "number" ? (
                <AnimatedNumber value={item.value} />
              ) : (
                item.value
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
