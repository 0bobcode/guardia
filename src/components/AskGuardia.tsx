"use client";

import { useState, useTransition } from "react";
import { RiskBadge } from "@/components/RiskBadge";
import type { Brief } from "@/lib/askGuardia";

// A Rolli-style "ask a question, get a brief" card: real stats are always
// computed server-side (see src/lib/askGuardia.ts) before the model ever
// sees them, so this can only ever narrate real numbers, never invent them.

const STEPS = ["Reading activity…", "Checking policy matches…", "Scoring risk…", "Building brief…"];

function badgeLevel(severity: "HIGH" | "MEDIUM" | "LOW") {
  return severity === "HIGH" ? "HIGH" : severity === "MEDIUM" ? "MED" : "LOW";
}

export function AskGuardia({
  ask,
  placeholder,
  examples,
}: {
  ask: (question: string) => Promise<Brief>;
  placeholder: string;
  examples: string[];
}) {
  const [question, setQuestion] = useState("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  function submit(q: string) {
    if (!q.trim() || pending) return;
    setError(null);
    setBrief(null);
    setStep(0);
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 550);
    startTransition(async () => {
      try {
        const result = await ask(q);
        setBrief(result);
      } catch {
        setError("Couldn't build a brief — try again.");
      } finally {
        clearInterval(interval);
      }
    });
  }

  return (
    <div className="app-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-1.5 w-1.5 rounded-full bg-app-teal inline-block" />
        <h2 className="text-sm font-semibold text-app-text">Ask Guardia</h2>
      </div>
      <p className="text-xs text-app-muted mb-3">
        Ask a plain-English question — Guardia reads real activity and briefs you back.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
        className="flex items-center gap-2 mb-3"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          className="app-input flex-1 rounded-md px-3 py-2 text-sm text-app-text"
        />
        <button
          type="submit"
          disabled={pending || !question.trim()}
          className="text-xs font-semibold px-3 py-2 rounded-md bg-app-teal text-[#04211d] disabled:opacity-50 shrink-0"
        >
          {pending ? "Asking…" : "Ask"}
        </button>
      </form>

      {!brief && !pending && (
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuestion(ex);
                submit(ex);
              }}
              className="text-[11px] text-app-muted border border-app-border rounded-full px-2.5 py-1 hover:border-app-teal/40 hover:text-app-text transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {pending && (
        <div className="space-y-1.5 py-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-2 text-xs transition-opacity ${i <= step ? "opacity-100" : "opacity-30"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${i <= step ? "bg-app-teal" : "bg-app-border"}`} />
              <span className={i === step ? "text-app-text" : "text-app-faint"}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {brief && (
        <div className="mt-1 border-t border-app-border pt-3 space-y-3 stagger-in">
          <p className="text-sm text-app-text leading-relaxed">{brief.summary}</p>
          <div className="flex flex-wrap gap-2">
            <StatChip label="Messages" value={brief.stats.totalMessages} delay={60} />
            <StatChip label="Flagged" value={brief.stats.flaggedCount} accent={brief.stats.flaggedCount > 0} delay={110} />
            <StatChip label="Blocked" value={brief.stats.blockedCount} accent={brief.stats.blockedCount > 0} delay={160} />
            {brief.stats.topApp && <StatChip label="Most used" value={brief.stats.topApp} delay={210} />}
          </div>
          {brief.highlights.length > 0 && (
            <div className="space-y-1.5">
              {brief.highlights.map((h, i) => (
                <div
                  key={h.title}
                  className="stagger-in flex items-center justify-between text-xs border border-app-border rounded-md px-3 py-2 transition-all hover:border-app-border-strong hover:-translate-y-0.5"
                  style={{ animationDelay: `${260 + i * 70}ms` }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <RiskBadge level={badgeLevel(h.severity)} />
                    <span className="text-app-text font-medium truncate">{h.title}</span>
                  </div>
                  <span className="text-app-faint shrink-0 ml-2">{h.detail}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-app-faint">
            Based on the last {brief.windowDays} days · {brief.live ? "AI-phrased summary" : "Guardia's own analysis"}
          </p>
        </div>
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`stagger-in text-xs rounded-md px-2.5 py-1.5 border transition-transform hover:-translate-y-0.5 ${
        accent ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-app-border text-app-text"
      }`}
      style={{ animationDelay: `${delay ?? 0}ms` }}
    >
      <span className="font-semibold">{value}</span> <span className="text-app-faint">{label}</span>
    </div>
  );
}
