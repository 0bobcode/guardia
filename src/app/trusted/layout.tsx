import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TrustedNav } from "@/components/TrustedNav";
import { Logo } from "@/components/Logo";
import { logoutAction } from "../logout-action";

export default async function TrustedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/guardrail");

  const students = await prisma.student.findMany({ where: { parentId: session.user.id }, select: { id: true } });
  const pendingConsents = await prisma.consentRequest.count({
    where: { studentId: { in: students.map((s) => s.id) }, status: "PENDING" },
  });

  return (
    <div className="app-shell flex-1 min-h-screen">
      <header className="border-b border-app-border bg-app-bg/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Logo size={26} />
              <span className="font-semibold text-app-text text-sm">TrustEd</span>
            </div>
            <TrustedNav pendingConsents={pendingConsents} />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-app-text leading-none">{session.user.name}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-app-teal-soft text-app-teal flex items-center justify-center text-xs font-semibold border border-app-teal/30">
              {session.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
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
      </header>
      <main className="max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
