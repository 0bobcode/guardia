"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/requireSession";
import { prisma } from "@/lib/db";

const PARENT_FLAG_REPLY =
  "Sorry, your parent flagged this message. Let's talk about something else — if you want to talk about it, ask a parent or trusted adult.";

const FOLLOW_UPS = ["ok", "okay, sorry", "alright", "ok, can we talk about something else"];

export async function flagMessageAction(formData: FormData) {
  const session = await requireActionUser("PARENT");

  const messageId = String(formData.get("messageId"));

  const message = await prisma.sessionMessage.findUnique({
    where: { id: messageId },
    include: { session: { include: { student: true } } },
  });
  if (!message || message.session.student.parentId !== session.user.id) throw new Error("Not found");
  if (message.role !== "STUDENT" || message.parentFlagged) {
    redirect(`/trusted/sessions/${message.sessionId}`);
  }

  await prisma.sessionMessage.update({
    where: { id: messageId },
    data: { parentFlagged: true },
  });

  const reply = await prisma.sessionMessage.create({
    data: {
      sessionId: message.sessionId,
      role: "ASSISTANT",
      content: PARENT_FLAG_REPLY,
      riskLevel: "NONE",
      action: "PASSED",
      // Sort right after the flagged message, ahead of whatever followed it.
      createdAt: new Date(message.createdAt.getTime() + 1000),
    },
  });

  // The kid keeps talking to the AI — the session doesn't just end on the
  // safety redirect, so a short, natural follow-up from the student lands
  // right after it.
  const followUp = FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)];
  const followUpMessage = await prisma.sessionMessage.create({
    data: {
      sessionId: message.sessionId,
      role: "STUDENT",
      content: followUp,
      riskLevel: "NONE",
      action: "PASSED",
      createdAt: new Date(reply.createdAt.getTime() + 1000),
    },
  });

  const aiSession = await prisma.aiSession.findUnique({ where: { id: message.sessionId } });
  if (aiSession && (!aiSession.endedAt || aiSession.endedAt < followUpMessage.createdAt)) {
    await prisma.aiSession.update({
      where: { id: message.sessionId },
      data: { endedAt: followUpMessage.createdAt },
    });
  }

  revalidatePath(`/trusted/sessions/${message.sessionId}`);
  revalidatePath("/trusted/sessions");
  redirect(`/trusted/sessions/${message.sessionId}?jump=${reply.id}`);
}
