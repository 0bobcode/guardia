import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireRole(role: "DISTRICT_ADMIN" | "PARENT") {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== role) redirect(role === "DISTRICT_ADMIN" ? "/trusted" : "/guardrail");

  // The session cookie can outlive the user it points to (e.g. after a
  // reseed) — fail back to login instead of crashing on a dangling FK.
  const stillExists = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!stillExists) redirect("/login?error=1");

  return session;
}

/**
 * Same dangling-session guard as requireRole, for use inside server actions
 * (which can't rely on requireRole's page-level redirect flow). Throws for
 * a plain auth/role failure; redirects to login if the session's user no
 * longer exists in the DB.
 */
export async function requireActionUser(role: "DISTRICT_ADMIN" | "PARENT") {
  const session = await auth();
  if (!session?.user || session.user.role !== role) throw new Error("Unauthorized");

  const stillExists = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!stillExists) redirect("/login?error=1");

  return session;
}
