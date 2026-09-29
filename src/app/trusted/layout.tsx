import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TrustedNav } from "@/components/TrustedNav";
import { Avatar } from "@/components/Avatar";
import { logoutAction } from "../logout-action";

export default async function TrustedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/guardrail");

  const students = await prisma.student.findMany({ where: { parentId: session.user.id }, select: { id: true } });
  const pendingConsents = await prisma.consentRequest.count({
    where: { studentId: { in: students.map((s) => s.id) }, status: "PENDING" },
  });
  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { osVersion: true } });

  return (
    <div className="app-shell flex-1 min-h-screen">
      <header className="border-b border-app-border bg-app-bg/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 md:h-16 md:py-0 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3 md:contents">
            <div className="flex items-center gap-2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/trusted-logo.png" alt="TrustEd" className="h-6 w-auto" />
              {currentUser?.osVersion && (
                <span className="text-[10px] text-app-faint hidden sm:inline">· OS {currentUser.osVersion}</span>
              )}
            </div>
            <div className="flex items-center gap-3 md:order-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-app-text leading-none">{session.user.name}</p>
              </div>
              <Avatar name={session.user.name} size={32} />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs font-medium text-app-muted hover:text-app-text px-2 py-1 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <TrustedNav pendingConsents={pendingConsents} />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-0">{children}</main>
    </div>
  );
}
