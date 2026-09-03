import { Suspense } from "react";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { Toast } from "@/components/Toast";
import { formatDateTime } from "@/lib/format";
import { respondToConsentAction } from "./actions";

export default async function ConsentsPage() {
  const session = await requireRole("PARENT");
  const parentId = session!.user.id;

  const students = await prisma.student.findMany({ where: { parentId } });
  const studentIds = students.map((s) => s.id);

  const consents = await prisma.consentRequest.findMany({
    where: { studentId: { in: studentIds } },
    orderBy: { createdAt: "desc" },
    include: { app: true, student: true },
  });

  const pending = consents.filter((c) => c.status === "PENDING");
  const resolved = consents.filter((c) => c.status !== "PENDING");

  return (
    <div className="px-6 py-8">
      <h1 className="text-xl font-semibold text-app-text mb-1">Consents</h1>
      <p className="text-sm text-app-muted mb-6">
        Approve or deny requests from ed-tech apps to use your child&apos;s data.
      </p>

      <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wide mb-3">
        Pending ({pending.length})
      </h2>
      <div className="space-y-3 mb-8">
        {pending.map((c) => (
          <div
            key={c.id}
            className="app-card rounded-xl p-5 transition-shadow hover:border-app-border-strong"
          >
            <p className="text-sm font-semibold text-app-text">
              {c.app.name} — {c.student.name}
            </p>
            <p className="text-sm text-app-muted mt-1">{c.reason}</p>
            <p className="text-xs text-app-muted mt-1">
              Requested {Math.round((Date.now() - c.createdAt.getTime()) / 60000)} min ago · Expires{" "}
              {formatDateTime(c.expiresAt)}
            </p>
            <div className="flex gap-2 mt-4">
              <form action={respondToConsentAction}>
                <input type="hidden" name="consentId" value={c.id} />
                <input type="hidden" name="decision" value="DENIED" />
                <button
                  type="submit"
                  className="text-xs font-semibold px-4 py-2 rounded-md border border-app-border text-app-text hover:bg-white/5 active:scale-[0.97] transition-all"
                >
                  Deny
                </button>
              </form>
              <form action={respondToConsentAction}>
                <input type="hidden" name="consentId" value={c.id} />
                <input type="hidden" name="decision" value="APPROVED" />
                <button
                  type="submit"
                  className="text-xs font-semibold px-4 py-2 rounded-md bg-app-teal text-[#04211d] hover:opacity-90 active:scale-[0.97] transition-all"
                >
                  ✓ Approve
                </button>
              </form>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <p className="text-sm text-app-muted app-card rounded-xl p-5">
            No pending consent requests.
          </p>
        )}
      </div>

      <h2 className="text-xs font-semibold text-app-muted uppercase tracking-wide mb-3">History</h2>
      <div className="space-y-2">
        {resolved.map((c) => (
          <div
            key={c.id}
            className="app-card rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-app-text font-medium">
                {c.app.name} — {c.student.name}
              </p>
              <p className="text-xs text-app-muted">{c.reason}</p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                c.status === "APPROVED" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 bg-white/8"
              }`}
            >
              {c.status}
            </span>
          </div>
        ))}
      </div>
      <Suspense fallback={null}>
        <Toast paramKey="saved" message="Response recorded" />
      </Suspense>
    </div>
  );
}
