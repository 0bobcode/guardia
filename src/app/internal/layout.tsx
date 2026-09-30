import Link from "next/link";
import { requireInternalUser } from "@/lib/internal-auth";
import { logoutAction } from "../logout-action";

const NAV = [
  { href: "/internal/admin", label: "Super Admin" },
  { href: "/internal/developer", label: "Developer" },
  { href: "/internal/presenter", label: "Presenter" },
  { href: "/internal/sales", label: "Sales" },
  { href: "/internal/marketing", label: "Marketing" },
  { href: "/internal/company", label: "Founder Handbook" },
];

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireInternalUser();

  return (
    <div className="min-h-screen bg-[#0b0f1c] text-white flex flex-col">
      <header className="border-b border-white/10 bg-brand-navy/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/guardia-mark.png" alt="Guardia" className="h-6 w-6" />
            <span className="text-sm font-semibold">Internal</span>
            <span className="text-[10px] rounded-full border border-white/15 px-2 py-0.5 text-slate-400">
              staff only
            </span>
          </div>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-md px-3 py-1.5 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{user.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-medium text-slate-400 hover:text-white px-2 py-1 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">{children}</main>
    </div>
  );
}
