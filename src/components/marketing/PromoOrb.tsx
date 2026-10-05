"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EVENT = "guardia:orb";

/** A small glowing orb floating in the page. It carries no label or hint on
 *  purpose — finding it is the point. */
export function PromoOrb({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <button
      type="button"
      aria-label="Glowing orb"
      onClick={() => window.dispatchEvent(new Event(EVENT))}
      className={`promo-orb absolute z-[5] rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Mounted once on the page; opens when any orb is clicked. Deliberately says
 *  nothing about what the reward is — the contact form is where it's settled. */
export function OrbReward() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="You found an orb"
        onClick={(e) => e.stopPropagation()}
        className="stagger-in relative w-full max-w-sm overflow-hidden rounded-2xl border border-brand-teal/40 bg-[#0b0f1c] p-7 text-center shadow-[0_0_80px_-10px_rgba(45,212,191,0.55)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(340px 240px at 50% 0%, rgba(45, 212, 191, 0.28), transparent), radial-gradient(300px 220px at 100% 100%, rgba(99, 102, 241, 0.28), transparent)",
          }}
        />
        <div className="relative">
          <div className="promo-orb mx-auto mb-4 h-14 w-14 rounded-full" aria-hidden="true" />
          <h2 className="text-xl font-bold text-white">You found one.</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Hardly anyone clicks these. Say hello and tell us you were here, and we&apos;ll take care of you.
          </p>
          <Link
            href="/contact?ref=orb"
            className="mt-6 inline-block rounded-md bg-brand-teal px-5 py-2.5 text-sm font-semibold text-brand-navy transition-opacity hover:opacity-90"
          >
            Say hello →
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="mt-3 block w-full text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
