"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import type { ScanAction } from "@prisma/client";

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
