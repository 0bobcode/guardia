"use client";

import { useEffect, useRef, useState } from "react";
import { RiskBadge } from "@/components/RiskBadge";
import { BrowserFrame } from "./BrowserFrame";

const ROWS = [
  { child: "Maya", app: "Tutorly AI", summary: "Tried to get past the content filter", risk: "HIGH", time: "2m ago" },
  { child: "Maya", app: "EduBot (Grade 5)", summary: "Asked about a history battle scene", risk: "MED", time: "18m ago" },
  { child: "Jordan", app: "MathBot K-5", summary: "Expressed frustration with homework", risk: "MED", time: "41m ago" },
  { child: "Jordan", app: "Tutorly AI", summary: "Asked for help with photosynthesis", risk: "NONE", time: "1h ago" },
];

/** Illustrative preview of the parent-facing TrustEd feed — same honest
 *  labeling pattern as GuardRailPreview, just from the parent's side. */
export function TrustEdPreview() {
  const [visible, setVisible] = useState(false);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
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
      setTimeout(() => setFlashIndex(null), 550);
    }, 1400);
    return () => clearInterval(flash);
  }, [visible]);

  return (
    <div ref={ref}>
      <BrowserFrame title="guardia.ai/trusted">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white">This week&apos;s activity</span>
          <span className="text-[10px] text-slate-500">Example activity</span>
        </div>
        <div className="space-y-1.5">
          {ROWS.map((r, i) => (
            <div
              key={`${r.child}-${r.time}`}
              className="msg-row grid grid-cols-[1fr_auto] sm:grid-cols-[64px_1fr_auto_auto] items-center gap-2 sm:gap-3 text-[11px] rounded-md px-2 py-1.5 transition-colors duration-500"
              style={{
                animationDelay: `${i * 90}ms`,
                animationPlayState: visible ? "running" : "paused",
                backgroundColor: flashIndex === i ? "rgba(45, 212, 191, 0.08)" : "transparent",
              }}
            >
              <span className="font-mono text-slate-500 hidden sm:block">{r.child}</span>
              <span className="text-slate-300 truncate">
                <span className="text-white font-medium">{r.app}</span>
                <span className="text-slate-500 hidden sm:inline"> · {r.summary}</span>
              </span>
              <RiskBadge level={r.risk} />
              <span className="text-slate-500">{r.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-slate-500">
          Illustrative — this is the same feed a parent sees inside their TrustEd dashboard.
        </div>
      </BrowserFrame>
    </div>
  );
}
