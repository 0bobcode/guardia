"use server";

import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { buildStudentBrief, type Brief } from "@/lib/askGuardia";

export async function askGuardiaForStudent(studentId: string, question: string): Promise<Brief> {
  const session = await requireActionUser("PARENT");

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.parentId !== session.user.id) throw new Error("Not found");

  const q = question.trim().slice(0, 300);
  if (!q) throw new Error("Ask a question first");

  return buildStudentBrief(studentId, q);
}
