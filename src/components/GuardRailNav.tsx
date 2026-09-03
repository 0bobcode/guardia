"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDashboard, IconAlert, IconReports, IconPolicies, IconSettings } from "@/components/icons";

const NAV = [
  { href: "/guardrail", label: "Dashboard", Icon: IconDashboard },
  { href: "/guardrail/alerts", label: "Alerts", Icon: IconAlert },
  { href: "/guardrail/reports", label: "Reports", Icon: IconReports },
  { href: "/guardrail/policies", label: "Policies", Icon: IconPolicies },
  { href: "/guardrail/settings", label: "Settings", Icon: IconSettings },
];

export function GuardRailNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map((item) => {
        const active = item.href === "/guardrail" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.Icon className={active ? "text-app-teal" : "text-slate-400"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
