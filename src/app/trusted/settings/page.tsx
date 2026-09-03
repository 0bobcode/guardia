import { Suspense } from "react";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { Toast } from "@/components/Toast";
import { ProviderBadge } from "@/components/ProviderBadge";
import { providerLabel, providerShortLabel } from "@/lib/aiProviders";
import { formatDateTime } from "@/lib/format";
import {
  updateDailyLimitAction,
  addChildAction,
  removeChildAction,
  addAppToChildAction,
  removeAppFromChildAction,
  addDevicePairingAction,
  removeDevicePairingAction,
} from "./actions";

const LIMIT_OPTIONS = [0.5, 1, 1.5, 2, 3, 4, 6];
const GRADE_BANDS = [
  { value: "K_5", label: "K–5" },
  { value: "G6_8", label: "6–8" },
  { value: "G9_12", label: "9–12" },
];

const ERRORS: Record<string, string> = {
  name: "Please enter a name.",
  grade: "Please choose a grade band.",
  childemail: "That doesn't look like a valid email.",
  childpassword: "Password must be at least 6 characters.",
  noapp: "Choose an app to add.",
};

export default async function TrustedSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; paired?: string }>;
}) {
  const session = await requireRole("PARENT");
  const parentId = session!.user.id;
  const params = await searchParams;
  const students = await prisma.student.findMany({
    where: { parentId },
    include: {
      enrollments: { include: { app: true } },
      devicePairings: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const district = await prisma.district.findFirst({ include: { apps: true } });
  const districtApps = district?.apps ?? [];

  return (
    <div className="px-6 py-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-app-text mb-1">Settings</h1>
      <p className="text-sm text-app-muted mb-6">Manage your account, children, and time controls.</p>

      <div className="app-card rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-app-text mb-3">Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-app-muted">Name</p>
            <p className="text-app-text font-medium">{session!.user.name}</p>
          </div>
          <div>
            <p className="text-xs text-app-muted">Email</p>
            <p className="text-app-text font-medium">{session!.user.email}</p>
          </div>
        </div>
      </div>

      {students.map((student) => {
        const enrolledAppIds = new Set(student.enrollments.map((e) => e.appId));
        const availableApps = districtApps.filter((a) => !enrolledAppIds.has(a.id));

        return (
          <div
            key={student.id}
            className="app-card rounded-xl p-5 mb-6 transition-shadow hover:border-app-border-strong"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h2 className="text-sm font-semibold text-app-text">
                  {student.name} · Grade {student.gradeBand.replace("_", "–").replace("G", "")}
                </h2>
                {student.email && <p className="text-xs text-app-muted mt-0.5">{student.email}</p>}
              </div>
              <form action={removeChildAction}>
                <input type="hidden" name="studentId" value={student.id} />
                <button
                  type="submit"
                  className="text-xs text-app-faint hover:text-red-400 transition-colors shrink-0"
                >
                  Remove
                </button>
              </form>
            </div>
            <p className="text-xs text-app-muted mb-3">
              Choose which AI apps this child can use, and set a daily limit for each.
            </p>
            <div className="space-y-2">
              {student.enrollments.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between text-sm border border-app-border rounded-md px-3 py-2 gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-app-text font-medium">{e.app.name}</span>
                      <ProviderBadge provider={e.app.provider} appName={e.app.name} />
                    </div>
                    <span className="text-app-muted text-xs block">{e.app.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={updateDailyLimitAction} className="flex items-center gap-2">
                      <input type="hidden" name="enrollmentId" value={e.id} />
                      <select
                        name="hours"
                        defaultValue={e.dailyLimitMin / 60}
                        className="text-xs border border-app-border rounded-md px-2 py-1.5 bg-app-surface-2"
                      >
                        {LIMIT_OPTIONS.map((h) => (
                          <option key={h} value={h}>
                            {h < 1 ? `${h * 60} min` : `${h}h`} / day
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-xs font-semibold px-3 py-1.5 rounded-md bg-app-teal text-[#04211d] hover:opacity-90 active:scale-[0.97] transition-all"
                      >
                        Save
                      </button>
                    </form>
                    <form action={removeAppFromChildAction}>
                      <input type="hidden" name="enrollmentId" value={e.id} />
                      <button
                        type="submit"
                        title={`Remove ${e.app.name}`}
                        className="text-app-faint hover:text-red-400 transition-colors p-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {student.enrollments.length === 0 && (
                <p className="text-xs text-app-muted py-2">No apps enrolled yet.</p>
              )}
            </div>

            {availableApps.length > 0 && (
              <form action={addAppToChildAction} className="flex items-center gap-2 mt-3 pt-3 border-t border-app-border">
                <input type="hidden" name="studentId" value={student.id} />
                <select
                  name="appId"
                  defaultValue=""
                  className="flex-1 text-xs border border-app-border rounded-md px-2 py-1.5 bg-app-surface-2 text-app-text"
                >
                  <option value="" disabled>
                    Add another app…
                  </option>
                  {availableApps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.subject}
                      {providerShortLabel(a.provider) !== a.name ? ` (via ${providerLabel(a.provider)})` : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="text-xs font-semibold px-3 py-1.5 rounded-md border border-app-border text-app-text hover:border-app-teal/40 hover:bg-white/[0.03] transition-colors"
                >
                  Add
                </button>
              </form>
            )}

            <div className="mt-3 pt-3 border-t border-app-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-app-text">Device monitor</p>
                <form action={addDevicePairingAction}>
                  <input type="hidden" name="studentId" value={student.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold px-3 py-1.5 rounded-md border border-app-border text-app-text hover:border-app-teal/40 hover:bg-white/[0.03] transition-colors"
                  >
                    Pair a device
                  </button>
                </form>
              </div>
              <p className="text-xs text-app-muted mb-2">
                Install the Guardia companion app on {student.name.split(" ")[0]}&apos;s phone to
                monitor real AI apps directly on the device.
              </p>

              {params.paired && student.devicePairings.some((d) => d.pairCode === params.paired) && (
                <div className="bg-app-teal-soft border border-app-teal/30 rounded-md px-3 py-3 mb-2">
                  <p className="text-xs text-app-muted mb-1">
                    Open the Guardia companion app on the phone and enter this code:
                  </p>
                  <p className="text-2xl font-bold tracking-[0.3em] text-app-teal font-mono">{params.paired}</p>
                </div>
              )}

              <div className="space-y-1.5">
                {student.devicePairings.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between text-xs border border-app-border rounded-md px-3 py-2"
                  >
                    <div className="min-w-0">
                      <span className="text-app-text font-medium">
                        {d.deviceName || (d.pairedAt ? "Unnamed device" : `Code ${d.pairCode} — waiting`)}
                      </span>
                      <span className="text-app-faint block">
                        {d.pairedAt
                          ? d.lastSeenAt
                            ? `Last active ${formatDateTime(d.lastSeenAt)}`
                            : "Paired, no activity yet"
                          : "Not paired yet"}
                      </span>
                    </div>
                    <form action={removeDevicePairingAction}>
                      <input type="hidden" name="pairingId" value={d.id} />
                      <button
                        type="submit"
                        title="Remove device"
                        className="text-app-faint hover:text-red-400 transition-colors p-1 shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </form>
                  </div>
                ))}
                {student.devicePairings.length === 0 && (
                  <p className="text-xs text-app-faint py-1">No devices paired yet.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="app-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-app-text mb-1">Add a child</h2>
        <p className="text-xs text-app-muted mb-4">
          Choose which apps to monitor for them — you can add or remove apps anytime.
        </p>
        {params.error && (
          <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {ERRORS[params.error] ?? "Something went wrong."}
          </div>
        )}
        <form action={addChildAction} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Child&apos;s name</label>
              <input
                name="name"
                required
                placeholder="e.g. Sam Chopra"
                className="app-input w-full rounded-md px-3 py-2 text-sm text-app-text"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Grade band</label>
              <select
                name="gradeBand"
                defaultValue="K_5"
                className="w-full text-sm border border-app-border rounded-md px-3 py-2 bg-app-surface-2 text-app-text"
              >
                {GRADE_BANDS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">
                Child&apos;s email <span className="text-app-faint">(optional)</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="zak@email.com"
                className="app-input w-full rounded-md px-3 py-2 text-sm text-app-text"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">
                Account password <span className="text-app-faint">(optional)</span>
              </label>
              <input
                name="password"
                type="password"
                minLength={6}
                placeholder="At least 6 characters"
                className="app-input w-full rounded-md px-3 py-2 text-sm text-app-text"
              />
            </div>
          </div>

          {districtApps.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-app-muted mb-2">Apps to monitor</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {districtApps.map((app) => (
                  <label
                    key={app.id}
                    className="flex items-center gap-2 text-sm border border-app-border rounded-md px-3 py-2 cursor-pointer hover:bg-white/[0.03]"
                  >
                    <input type="checkbox" name="appIds" value={app.id} defaultChecked className="accent-app-teal" />
                    <span className="text-app-text">{app.name}</span>
                    <span className="text-app-faint text-xs">· {app.subject}</span>
                    <ProviderBadge provider={app.provider} appName={app.name} className="ml-auto" />
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="text-sm font-semibold px-4 py-2 rounded-md bg-app-teal text-[#04211d] hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Add child
          </button>
        </form>
      </div>

      <Suspense fallback={null}>
        <Toast paramKey="saved" message="Time limit updated" />
      </Suspense>
      <Suspense fallback={null}>
        <Toast paramKey="added" message="Child added" />
      </Suspense>
      <Suspense fallback={null}>
        <Toast paramKey="removed" message="Child removed" />
      </Suspense>
      <Suspense fallback={null}>
        <Toast paramKey="appadded" message="App added" />
      </Suspense>
      <Suspense fallback={null}>
        <Toast paramKey="appremoved" message="App removed" />
      </Suspense>
      <Suspense fallback={null}>
        <Toast paramKey="deviceremoved" message="Device removed" />
      </Suspense>
    </div>
  );
}
