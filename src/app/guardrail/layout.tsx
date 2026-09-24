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
    <div className="app-shell flex-1 flex min-h-screen">
      <aside className="w-60 shrink-0 bg-[#0b0f1c] border-r border-app-border text-slate-200 flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <Logo size={26} />
          <div>
            <p className="text-white text-sm font-semibold leading-none">GuardRail</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Compliance Console</p>
          </div>
        </div>
        <GuardRailNav />
        <div className="px-3 py-4 border-t border-white/10">
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
