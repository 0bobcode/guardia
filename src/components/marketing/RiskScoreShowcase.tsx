"use client";

import { useEffect, useState } from "react";
import { BrowserFrame } from "./BrowserFrame";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { RiskBreakdownBars } from "@/components/charts/RiskBreakdownBars";

const BASE_COUNTS = { HIGH: 3, MED: 11, LOW: 24, NONE: 812 };

export function RiskScoreShowcase() {
  const [counts, setCounts] = useState(BASE_COUNTS);

  useEffect(() => {
    const tick = setInterval(() => {
      setCounts((c) => ({ ...c, NONE: c.NONE + Math.floor(Math.random() * 5) + 1 }));
    }, 1400);
    return () => clearInterval(tick);
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const score = (counts.HIGH * 100 + counts.MED * 60 + counts.LOW * 25) / total;

  return (
    <BrowserFrame title="guardia.ai/guardrail">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-white">District Risk Overview</span>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
      <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <RiskGauge score={score} size={140} />
        <div className="w-full">
          <RiskBreakdownBars counts={counts} />
        </div>
      </div>
    </BrowserFrame>
  );
}
