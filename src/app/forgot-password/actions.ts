"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { createResetToken } from "@/lib/passwordReset";
import { appBaseUrl, sendEmail } from "@/lib/email";

// The response is identical whether or not the address has an account, and
// the lookup + send happen after the response, so neither the message nor the
// timing reveals which emails are registered.
export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/forgot-password?error=email");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`forgot:ip:${ip}`, { limit: 8, windowMs: 15 * 60_000 }).allowed) {
    redirect("/forgot-password?error=slow");
  }

  const host = h.get("host");
  const emailAllowed = rateLimit(`forgot:email:${email}`, { limit: 3, windowMs: 15 * 60_000 }).allowed;

  if (emailAllowed) {
    after(async () => {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, passwordHash: true },
      });
      // SSO-provisioned accounts have no local password to reset.
      if (!user?.passwordHash) return;

      const base = appBaseUrl(host);
      if (!base) {
        console.error("[forgot-password] APP_URL is not set — cannot build a reset link");
        return;
      }
      const link = `${base}/reset-password?token=${createResetToken(user.id, user.passwordHash)}`;
      const first = user.name.split(" ")[0];
      await sendEmail({
        to: email,
        subject: "Reset your Guardia password",
        text: `Hi ${first},\n\nUse this link to choose a new Guardia password. It expires in 30 minutes and works once:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email — your password won't change.`,
        html: `<p>Hi ${first},</p><p><a href="${link}">Choose a new Guardia password</a>. The link expires in 30 minutes and works once.</p><p>If you didn't ask for this, you can ignore this email — your password won't change.</p>`,
      });
    });
  }

  redirect("/forgot-password?sent=1");
}
