"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Popup = {
  icon: string;
  title: string;
  body: string;
  action?: { label: string; href?: string; openChat?: boolean };
};

// Keyed by the data-popup attribute on each landing-page section. Every
// message is a true statement about the product — no invented activity,
// counts, or "someone just signed up" social proof.
const POPUPS: Record<string, Popup> = {
  demo: {
    icon: "\u{1F446}",
    title: "Try it with your own words",
    body: "Click the box and type a message. It runs GuardRail's real default rules, right in your browser.",
  },
  ask: {
    icon: "\u{1F4AC}",
    title: "Ask in plain English",
    body: "“Any concerning topics this week?” Guardia answers from the real, already-scanned activity.",
  },
  how: {
    icon: "⚡",
    title: "One endpoint to integrate",
    body: "GuardRail is a single REST call. Built to integrate in under 4 hours (a design target).",
  },
  score: {
    icon: "\u{1F4CA}",
    title: "This is example data",
    body: "Real districts see their own live score and severity breakdown inside GuardRail.",
  },
  features: {
    icon: "\u{1F6E1}️",
    title: "Blocked before the child sees it",
    body: "Unsafe replies are stopped in the request path, and every scan is logged for audit.",
  },
  audiences: {
    icon: "\u{1F3EB}",
    title: "Built for three groups",
    body: "Districts get compliance, parents get visibility, ed-tech vendors get a drop-in API.",
  },
  security: {
    icon: "\u{1F512}",
    title: "How we handle data",
    body: "Read exactly what's collected and why — including the browser extension.",
    action: { label: "Privacy policy", href: "/privacy" },
  },
  faq: {
    icon: "❓",
    title: "Still curious?",
    body: "Browse 100+ answers about Guardia, privacy, pricing, and setup.",
    action: { label: "Open the chat", openChat: true },
  },
  cta: {
    icon: "\u{1F44B}",
    title: "Want to talk to a person?",
    body: "We're working with districts and ed-tech vendors on early pilots.",
    action: { label: "Get in touch", href: "/contact" },
  },
};

const SHOW_MS = 6500;

/** Pops a small card in the bottom-left as each landing-page section scrolls
 *  into the middle of the screen — once per section per visit, one at a time. */
export function ScrollPopups() {
  const [key, setKey] = useState<string | null>(null);
  const seen = useRef(new Set<string>());
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-popup]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const k = (entry.target as HTMLElement).dataset.popup;
          if (!entry.isIntersecting || !k || seen.current.has(k) || !POPUPS[k]) continue;
          seen.current.add(k);
          setKey(k);
          if (hideTimer.current) clearTimeout(hideTimer.current);
          hideTimer.current = setTimeout(() => setKey(null), SHOW_MS);
        }
      },
      // Only the band across the middle of the viewport counts, so a popup
      // matches the section you're actually reading, not one barely peeking in.
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const popup = key ? POPUPS[key] : null;
  if (!popup) return null;

  return (
    <div
      key={key}
      role="status"
      className="stagger-in fixed bottom-6 left-6 right-24 z-40 max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f1c]/95 shadow-2xl shadow-black/50 backdrop-blur-md"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="text-xl leading-none" aria-hidden="true">
          {popup.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white leading-snug">{popup.title}</p>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">{popup.body}</p>
          {popup.action?.href && (
            <Link href={popup.action.href} className="mt-2 inline-block text-xs font-semibold text-brand-teal hover:underline">
              {popup.action.label} →
            </Link>
          )}
          {popup.action?.openChat && (
            <button
              onClick={() => {
                window.dispatchEvent(new Event("guardia:open-chat"));
                setKey(null);
              }}
              className="mt-2 text-xs font-semibold text-brand-teal hover:underline"
            >
              {popup.action.label} →
            </button>
          )}
        </div>
        <button
          onClick={() => setKey(null)}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-slate-500 hover:bg-white/10 hover:text-white transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="h-0.5 bg-white/5">
        <div className="h-full bg-brand-teal/70 origin-left" style={{ animation: `popup-timer ${SHOW_MS}ms linear forwards` }} />
      </div>
    </div>
  );
}
