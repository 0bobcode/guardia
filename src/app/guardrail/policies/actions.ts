"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { CATEGORY_DEFS } from "@/lib/scanEngine";
import type { GradeBand, ScanAction } from "@prisma/client";

const BUILT_IN_KEYS = new Set(CATEGORY_DEFS.map((c) => c.key));
const ALL_BANDS: GradeBand[] = ["K_5", "G6_8", "G9_12"];

function slugify(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "custom_category"
  );
}

// Custom categories aren't in the fixed CATEGORY_DEFS taxonomy, so they're
// created across all three grade bands at once (one Policy row each) with
// the same starting rule — from there they're tuned per band exactly like
// the built-in categories, via updatePolicyAction.
export async function createPolicyCategoryAction(formData: FormData) {
  const session = await requireActionUser("DISTRICT_ADMIN");
  const districtId = session.user.districtId!;

  const label = String(formData.get("label") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "").trim();
  const action = String(formData.get("action")) as ScanAction;
  const band = String(formData.get("band") ?? "K_5") as GradeBand;

  if (!label) redirect(`/guardrail/policies?band=${band}&error=categoryname`);
  if (!keywords) redirect(`/guardrail/policies?band=${band}&error=categorykeywords`);

  const key = slugify(label);
  if (BUILT_IN_KEYS.has(key)) redirect(`/guardrail/policies?band=${band}&error=categoryexists`);

  const existing = await prisma.policy.findFirst({ where: { districtId, category: key } });
  if (existing) redirect(`/guardrail/policies?band=${band}&error=categoryexists`);

  await prisma.policy.createMany({
    data: ALL_BANDS.map((gradeBand) => ({
      districtId,
      gradeBand,
      category: key,
      keywords,
      action,
      enabled: true,
    })),
  });
  // Custom category labels aren't stored anywhere else (CATEGORY_DEFS only
  // knows the fixed 9), so the page derives a display label from the key
  // itself — title-cased on render. Nothing further to persist here.

  revalidatePath("/guardrail/policies");
  redirect(`/guardrail/policies?band=${band}&categoryadded=1`);
}

export async function deletePolicyCategoryAction(formData: FormData) {
  const session = await requireActionUser("DISTRICT_ADMIN");
  const districtId = session.user.districtId!;

  const category = String(formData.get("category") ?? "");
  const band = String(formData.get("band") ?? "K_5");
  if (BUILT_IN_KEYS.has(category)) throw new Error("Cannot delete a built-in category");

  await prisma.policy.deleteMany({ where: { districtId, category } });

  revalidatePath("/guardrail/policies");
  redirect(`/guardrail/policies?band=${band}&categoryremoved=1`);
}

export async function updatePolicyAction(formData: FormData) {
  const session = await requireActionUser("DISTRICT_ADMIN");

  const policyId = String(formData.get("policyId"));
  const keywords = String(formData.get("keywords") ?? "");
  const action = String(formData.get("action")) as ScanAction;
  const enabled = formData.get("enabled") === "on";

  const policy = await prisma.policy.findUnique({ where: { id: policyId } });
  if (!policy || policy.districtId !== session.user.districtId) throw new Error("Not found");

  await prisma.policy.update({
    where: { id: policyId },
    data: { keywords, action, enabled },
  });

  revalidatePath("/guardrail/policies");
  redirect(`/guardrail/policies?band=${policy.gradeBand}&saved=1`);
}
