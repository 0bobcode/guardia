"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/products/guardrail", label: "GuardRail" },
  { href: "/products/trusted", label: "TrustEd" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-white/10 bg-brand-navy/90 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Logo size={30} className="transition-transform group-hover:scale-105" />
          <span className="font-semibold text-white tracking-tight">GUARDIA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  active ? "text-white bg-white/10 font-medium" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-md bg-brand-teal text-brand-navy hover:opacity-90 hover:shadow-lg hover:shadow-brand-teal/25 transition-all"
          >
            Sign in
          </Link>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 -mr-2 text-white"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 px-6 py-3 flex flex-col gap-1 bg-brand-navy">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 text-sm rounded-md ${
                pathname === item.href ? "text-white bg-white/10 font-medium" : "text-slate-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-2 text-sm font-medium px-4 py-2.5 rounded-md bg-brand-teal text-brand-navy text-center"
          >
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
