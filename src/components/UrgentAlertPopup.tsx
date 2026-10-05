"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Alert = { id: string; at: number; action: string; student: string | null; app: string; categories: string[] };

const POLL_MS = 15_000;

/** Pops up when a new HIGH-risk event lands while the dashboard is open.
 *  Only events created after the page loaded are shown (no replaying
 *  history), and a popup stays until dismissed since these are urgent. */
export function UrgentAlertPopup({ href, linkLabel }: { href: string; linkLabel: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const since = useRef(0);

  useEffect(() => {
    since.current = Date.now();
    let stopped = false;

    async function poll() {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/alerts/urgent?since=${since.current}`, { cache: "no-store" });
        if (!res.ok || stopped) return;
        const data: { alerts: Alert[] } = await res.json();
        if (data.alerts.length === 0) return;
        since.current = Math.max(...data.alerts.map((a) => a.at));
        setAlerts((cur) => [...cur, ...data.alerts].slice(-3));
      } catch {
        // transient network error — try again next tick
      }
    }

    const timer = setInterval(poll, POLL_MS);
    // Anything that arrived while the tab was hidden shows the moment it's back.
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2" role="alert" aria-live="assertive">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="stagger-in rounded-xl border border-red-500/40 bg-[#1a0d12] p-4 shadow-2xl shadow-black/60"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-red-400">
                Urgent · {a.action === "BLOCKED" ? "Message blocked" : "High-risk message"}
              </p>
              <p className="mt-1 text-sm text-white">
                {a.student ? `${a.student} · ` : ""}
                {a.app}
              </p>
              {a.categories.length > 0 && <p className="mt-0.5 text-xs text-slate-400">{a.categories.join(", ")}</p>}
            </div>
            <button
              onClick={() => setAlerts((cur) => cur.filter((x) => x.id !== a.id))}
              aria-label="Dismiss alert"
              className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <Link href={href} className="mt-3 inline-block text-xs font-semibold text-red-300 hover:underline">
            {linkLabel} →
          </Link>
        </div>
      ))}
    </div>
  );
}
