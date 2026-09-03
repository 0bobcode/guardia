"use client";

import { useEffect, useRef, useState } from "react";
import { RiskBadge } from "@/components/RiskBadge";
import { BrowserFrame } from "./BrowserFrame";

const ROWS = [
  { time: "14:23:11", app: "Tutorly AI", query: "Tell me how to get past the…", risk: "HIGH", action: "Blocked" },
  { time: "14:19:44", app: "EduBot (Grade 5)", query: "What happened during the battle", risk: "MED", action: "Flagged" },
  { time: "14:15:02", app: "Tutorly AI", query: "Can you explain photosynthesis", risk: "NONE", action: "Passed" },
  { time: "14:11:30", app: "MathBot K-5", query: "I hate this, it's so stupid", risk: "MED", action: "Flagged" },
];

const ACTION_COLOR: Record<string, string> = {
  Blocked: "text-red-400",
  Flagged: "text-amber-400",
  Passed: "text-emerald-400",
};

export function GuardRailPreview() {
  const [visible, setVisible] = useState(false);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const [count, setCount] = useState(2100412);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const flash = setInterval(() => {
      setFlashIndex(Math.floor(Math.random() * ROWS.length));
      setTimeout(() => setFlashIndex(null), 900);
    }, 2600);
    const tick = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 14) + 3);
    }, 1100);
    return () => {
      clearInterval(flash);
      clearInterval(tick);
    };
  }, [visible]);

  return (
    <div ref={ref}>
      <BrowserFrame title="guardia.ai/guardrail">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white">Recent Alerts</span>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
        <div className="space-y-1.5">
          {ROWS.map((r, i) => (
            <div
              key={r.time}
              className="msg-row grid grid-cols-[52px_1fr_auto_auto] items-center gap-3 text-[11px] rounded-md px-2 py-1.5 transition-colors duration-500"
              style={{
                animationDelay: `${i * 90}ms`,
                animationPlayState: visible ? "running" : "paused",
                backgroundColor: flashIndex === i ? "rgba(45, 212, 191, 0.08)" : "transparent",
              }}
            >
              <span className="font-mono text-slate-500">{r.time}</span>
              <span className="text-slate-300 truncate">
                <span className="text-white font-medium">{r.app}</span>
                <span className="text-slate-500"> · &ldquo;{r.query}&rdquo;</span>
              </span>
              <RiskBadge level={r.risk} />
              <span className={`font-medium ${ACTION_COLOR[r.action]}`}>{r.action}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
          <span>Scanned today</span>
          <span className="font-mono text-slate-300 tabular-nums">{count.toLocaleString("en-US")}</span>
        </div>
      </BrowserFrame>
    </div>
  );
}
