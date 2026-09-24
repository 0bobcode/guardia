import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GuardRailNav } from "@/components/GuardRailNav";
import { Logo } from "@/components/Logo";
import { logoutAction } from "../logout-action";

export default async function GuardRailLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "DISTRICT_ADMIN") redirect("/trusted");

  return (
    <div className="app-shell flex-1 flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-60 md:shrink-0 bg-[#0b0f1c] border-b md:border-b-0 md:border-r border-app-border text-slate-200 flex flex-col sticky top-0 z-40 md:static">
        <div className="px-4 sm:px-5 py-3 md:py-5 flex items-center justify-between md:justify-start gap-2 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <Logo size={26} />
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-none">GuardRail</p>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Compliance Console</p>
            </div>
          </div>
          <form action={logoutAction} className="md:hidden shrink-0">
            <button type="submit" className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 transition-colors">
              Sign out
            </button>
          </form>
        </div>
        <GuardRailNav />
        <div className="hidden md:block px-3 py-4 border-t border-white/10 mt-auto">
          <p className="px-3 text-xs text-slate-400">{session.user.name}</p>
          <p className="px-3 text-[11px] text-slate-500 mb-2">{session.user.email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-md transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
