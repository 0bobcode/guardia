"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { nextPublishedVersion, DEFAULT_VERSION } from "@/lib/osVersion";

// Publishes a new approved Guardia OS release for the whole district — the
// ceiling parents see and can install up to from TrustEd. One-click bump
// (minor version), not a free-text field, so it can't drift into a bad or
// unparseable value the way the old plain-integer version did.
export async function publishOsUpdateAction() {
  const session = await requireActionUser("DISTRICT_ADMIN");
  const districtId = session.user.districtId!;

  const district = await prisma.district.findUnique({ where: { id: districtId }, select: { osVersion: true } });
  const next = nextPublishedVersion(district?.osVersion ?? DEFAULT_VERSION);

  await prisma.district.update({ where: { id: districtId }, data: { osVersion: next } });

  revalidatePath("/guardrail/settings");
  redirect("/guardrail/settings?published=1");
}
