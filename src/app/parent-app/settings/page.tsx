import Link from "next/link";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { StudentAvatar } from "@/components/parent-app/StudentAvatar";
import { logoutAction } from "../../logout-action";

export default async function ParentAppSettings() {
  const session = await requireRole("PARENT");
  const students = await prisma.student.findMany({
    where: { parentId: session.user.id },
    include: { enrollments: { include: { app: true } } },
  });

  return (
    <div className="px-5 pt-5 pb-6 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-app-text">Settings</h1>
        <p className="text-xs text-app-muted mt-0.5">{session.user.name} · {session.user.email}</p>
      </div>

      <div className="app-card rounded-xl divide-y divide-app-border">
        {students.map((student) => (
          <div key={student.id} className="p-4 flex items-center gap-3">
            <StudentAvatar name={student.name} />
            <div>
              <p className="text-sm font-medium text-app-text">{student.name}</p>
              <p className="text-[11px] text-app-faint mt-0.5">
                {student.enrollments.length} app{student.enrollments.length === 1 ? "" : "s"} monitored
              </p>
            </div>
          </div>
        ))}
        {students.length === 0 && <p className="p-4 text-xs text-app-muted">No students linked yet.</p>}
      </div>

      <Link
        href="/trusted/settings"
        className="app-card rounded-xl p-4 flex items-center justify-between text-sm text-app-text hover:border-app-border-strong transition-colors"
      >
        Full settings (device pairing, consents)
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full app-card rounded-xl p-4 text-sm font-medium text-red-400 hover:border-red-400/40 transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
