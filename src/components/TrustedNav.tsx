"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/trusted", label: "Dashboard" },
  { href: "/trusted/sessions", label: "Sessions" },
  { href: "/trusted/activity", label: "Activity" },
  { href: "/trusted/consents", label: "Consents" },
  { href: "/trusted/settings", label: "Settings" },
];

export function TrustedNav({ pendingConsents }: { pendingConsents: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {NAV.map((item) => {
        const active = item.href === "/trusted" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-3 py-2 text-sm rounded-md transition-colors ${
              active ? "text-app-text bg-white/8" : "text-app-muted hover:text-app-text hover:bg-white/5"
            }`}
          >
            {item.label}
            {item.href === "/trusted/consents" && pendingConsents > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-app-teal text-[#04211d] text-[10px] font-semibold flex items-center justify-center">
                {pendingConsents}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
