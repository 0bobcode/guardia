import { Suspense } from "react";
import { requireRole } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { CATEGORY_DEFS } from "@/lib/scanEngine";
import { PolicyTester } from "@/components/PolicyTester";
import { Toast } from "@/components/Toast";
import { updatePolicyAction } from "./actions";
import type { GradeBand } from "@prisma/client";

const BANDS: { value: GradeBand; label: string }[] = [
  { value: "K_5", label: "Grade K–5" },
  { value: "G6_8", label: "Grade 6–8" },
  { value: "G9_12", label: "Grade 9–12" },
];

const ACTION_OPTIONS = ["PASSED", "FLAGGED", "BLOCKED"] as const;

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ band?: string }>;
}) {
  const session = await requireRole("DISTRICT_ADMIN");
  const districtId = session!.user.districtId!;
  const params = await searchParams;
  const activeBand = (BANDS.find((b) => b.value === params.band)?.value ?? "K_5") as GradeBand;

  const policies = await prisma.policy.findMany({
    where: { districtId, gradeBand: activeBand },
  });
  const byCategory = new Map(policies.map((p) => [p.category, p]));
  const apps = await prisma.app.findMany({
    where: { districtId, name: { not: "Policy Tester" } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-xl font-semibold text-app-text mb-1">Policies</h1>
      <p className="text-sm text-app-muted mb-6">
        Age-tiered rule presets. Edit keywords and actions per grade band — changes apply immediately
        to GuardRail&apos;s live scanning.
      </p>

      <div className="mb-6">
        <PolicyTester apps={apps} />
      </div>

      <div className="flex gap-1 app-card rounded-lg p-1 mb-5 w-fit">
        {BANDS.map((b) => (
          <a
            key={b.value}
            href={`/guardrail/policies?band=${b.value}`}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeBand === b.value ? "bg-app-teal text-[#04211d]" : "text-app-muted hover:text-app-text"
            }`}
          >
            {b.label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {CATEGORY_DEFS.map((cat) => {
          const policy = byCategory.get(cat.key);
          if (!policy) return null;
          return (
            <form
              key={cat.key}
              action={updatePolicyAction}
              className="app-card rounded-xl p-5 transition-shadow hover:border-app-border-strong"
            >
              <input type="hidden" name="policyId" value={policy.id} />
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-app-text">{cat.label}</h3>
                  <p className="text-xs text-app-muted">Default severity: {cat.defaultSeverity}</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-app-muted shrink-0">
                  <input type="checkbox" name="enabled" defaultChecked={policy.enabled} className="accent-app-teal" />
                  Enabled
                </label>
              </div>
              <label className="block text-xs font-medium text-app-muted mb-1">
                Keywords / phrases (comma-separated)
              </label>
              <textarea
                name="keywords"
                defaultValue={policy.keywords}
                rows={2}
                className="w-full text-sm border border-app-border rounded-md px-3 py-2 bg-app-surface-2 text-app-text focus:outline-none focus:ring-2 focus:ring-app-teal font-mono"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-app-muted">Action when matched</label>
                  <select
                    name="action"
                    defaultValue={policy.action}
                    className="text-xs border border-app-border rounded-md px-2 py-1.5 bg-app-surface-2"
                  >
                    {ACTION_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a.charAt(0) + a.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="text-xs font-semibold px-4 py-1.5 rounded-md bg-app-teal text-[#04211d] hover:opacity-90 active:scale-[0.97] transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          );
        })}
      </div>
      <Suspense fallback={null}>
        <Toast paramKey="saved" message="Policy updated" />
      </Suspense>
    </div>
  );
}
