"use server";

import { requireActionUser } from "@/lib/requireSession";
import { buildDistrictBrief, type Brief } from "@/lib/askGuardia";

export async function askGuardiaForDistrict(question: string): Promise<Brief> {
  const session = await requireActionUser("DISTRICT_ADMIN");
  const districtId = session.user.districtId!;

  const q = question.trim().slice(0, 300);
  if (!q) throw new Error("Ask a question first");

  return buildDistrictBrief(districtId, q);
}
