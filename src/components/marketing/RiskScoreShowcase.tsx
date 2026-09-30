import { BrowserFrame } from "./BrowserFrame";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { RiskBreakdownBars } from "@/components/charts/RiskBreakdownBars";

const COUNTS = { HIGH: 3, MED: 11, LOW: 24, NONE: 812 };

export function RiskScoreShowcase() {
  const total = Object.values(COUNTS).reduce((a, b) => a + b, 0);
  const score = (COUNTS.HIGH * 100 + COUNTS.MED * 60 + COUNTS.LOW * 25) / total;

  return (
    <BrowserFrame title="guardia.ai/guardrail">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-white">District Risk Overview</span>
        <span className="text-[10px] text-slate-500">Illustrative</span>
      </div>
      <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <RiskGauge score={score} size={140} />
        <div className="w-full">
          <RiskBreakdownBars counts={COUNTS} />
        </div>
      </div>
    </BrowserFrame>
  );
}
