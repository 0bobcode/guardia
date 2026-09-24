"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserFrame } from "./BrowserFrame";

// A scripted stand-in for the real "Ask Guardia" feature (see
// src/components/AskGuardia.tsx, live on TrustEd/GuardRail) — this runs for
// every anonymous visitor, so it loops fixed example briefs instead of
// hitting the database or a model on each page load.

type Highlight = { severity: "HIGH" | "MEDIUM" | "LOW"; title: string; detail: string };
type Scene = {
  question: string;
  summary: string;
  stats: { messages: number; flagged: number; blocked: number; topApp: string };
  highlights: Highlight[];
};

const SCENES: Scene[] = [
  {
    question: "What has Max been using AI for this week?",
    summary:
      "Mostly homework help — 62 messages across Tutorly AI and MathBot K-5, almost all routine. One message triggered a review: a jailbreak attempt aimed at a school content filter, which GuardRail blocked before it reached a reply.",
    stats: { messages: 62, flagged: 1, blocked: 1, topApp: "Tutorly AI" },
    highlights: [{ severity: "HIGH", title: "jailbreak_bypass", detail: "1 blocked message today" }],
  },
  {
    question: "Any spikes in policy violations this week?",
    summary:
      "District-wide, self-harm-adjacent language is up 8% over last week, concentrated in grades 6-8 during afternoon hours. Every match was flagged or blocked before a reply went out — no unreviewed exposure.",
    stats: { messages: 4218, flagged: 14, blocked: 6, topApp: "EduChat" },
    highlights: [
      { severity: "HIGH", title: "self_harm_language", detail: "6 flagged, up 8% w/w" },
      { severity: "MEDIUM", title: "bullying_language", detail: "5 flagged scans" },
    ],
  },
];

const TYPE_MS = 34;
const badgeClass: Record<Highlight["severity"], string> = {
  HIGH: "risk-badge risk-HIGH",
  MEDIUM: "risk-badge risk-MED",
  LOW: "risk-badge risk-LOW",
};

type Phase = "typing" | "thinking" | "brief" | "pause";
const THINK_STEPS = ["Reading activity…", "Checking policy matches…", "Scoring risk…", "Building brief…"];

function sleep(ms: number, signal: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    if (signal.cancelled) clearTimeout(t);
  });
}

export function AskGuardiaDemo() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [thinkStep, setThinkStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [phase, thinkStep]);

  useEffect(() => {
    const signal = { cancelled: false };

    async function run() {
      let i = 0;
      while (!signal.cancelled) {
        const scene = SCENES[i % SCENES.length];
        setSceneIdx(i % SCENES.length);

        setPhase("typing");
        setTyped("");
        for (let c = 1; c <= scene.question.length; c++) {
          if (signal.cancelled) return;
          setTyped(scene.question.slice(0, c));
          await sleep(TYPE_MS, signal);
        }
        await sleep(400, signal);
        if (signal.cancelled) return;

        setPhase("thinking");
        for (let s = 0; s < THINK_STEPS.length; s++) {
          if (signal.cancelled) return;
          setThinkStep(s);
          await sleep(500, signal);
        }
        if (signal.cancelled) return;

        setPhase("brief");
        await sleep(5200, signal);
        if (signal.cancelled) return;

        setPhase("pause");
        await sleep(900, signal);

        i++;
      }
    }

    run();
    return () => {
      signal.cancelled = true;
    };
  }, []);

  const scene = SCENES[sceneIdx];

  return (
    <BrowserFrame title="guardia.ai — Ask Guardia">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-1.5 w-1.5 rounded-full bg-app-teal inline-block" />
        <p className="text-xs font-semibold text-white">Ask Guardia</p>
      </div>
      <p className="text-[11px] text-slate-400 mb-3">Real activity in, a plain-English brief out.</p>

      <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-slate-200 mb-3 min-h-[32px] flex items-center">
        {typed}
        {phase === "typing" && (
          <span className="inline-block w-[2px] h-3 bg-app-teal ml-0.5 animate-pulse" />
        )}
      </div>

      <div ref={scrollRef} className="dark-scroll h-[230px] overflow-y-auto pr-1">
        {phase === "thinking" && (
          <div className="space-y-1.5 py-1">
            {THINK_STEPS.map((s, idx) => (
              <div
                key={s}
                className={`flex items-center gap-2 text-[11px] transition-opacity ${idx <= thinkStep ? "opacity-100" : "opacity-30"}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${idx <= thinkStep ? "bg-app-teal" : "bg-white/20"}`} />
                <span className={idx === thinkStep ? "text-white" : "text-slate-400"}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {(phase === "brief" || phase === "pause") && (
          <div className="space-y-3 py-1">
            <p className="stagger-in text-[11px] text-slate-200 leading-relaxed">{scene.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              <span
                className="stagger-in text-[10px] rounded-md px-2 py-1 border border-white/10 text-slate-200"
                style={{ animationDelay: "60ms" }}
              >
                <b>{scene.stats.messages}</b> <span className="text-slate-400">messages</span>
              </span>
              <span
                className="stagger-in text-[10px] rounded-md px-2 py-1 border border-amber-500/30 bg-amber-500/10 text-amber-300"
                style={{ animationDelay: "110ms" }}
              >
                <b>{scene.stats.flagged}</b> flagged
              </span>
              <span
                className="stagger-in text-[10px] rounded-md px-2 py-1 border border-red-500/30 bg-red-500/10 text-red-300"
                style={{ animationDelay: "160ms" }}
              >
                <b>{scene.stats.blocked}</b> blocked
              </span>
              <span
                className="stagger-in text-[10px] rounded-md px-2 py-1 border border-white/10 text-slate-200"
                style={{ animationDelay: "210ms" }}
              >
                <span className="text-slate-400">Top:</span> {scene.stats.topApp}
              </span>
            </div>
            <div className="space-y-1.5">
              {scene.highlights.map((h, i) => (
                <div
                  key={h.title}
                  className="stagger-in flex items-center justify-between text-[11px] border border-white/10 rounded-md px-2.5 py-1.5 transition-all hover:border-white/25 hover:-translate-y-0.5"
                  style={{ animationDelay: `${260 + i * 70}ms` }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={badgeClass[h.severity]}>{h.severity}</span>
                    <span className="text-white font-medium truncate">{h.title}</span>
                  </div>
                  <span className="text-slate-400 shrink-0 ml-2">{h.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BrowserFrame>
  );
}
