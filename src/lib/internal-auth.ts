import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Guardia has no internal-staff role in the schema (Role is just
// DISTRICT_ADMIN / PARENT — those are customer-facing accounts). Internal
// tooling is gated by an email allowlist instead of a DB migration.
const INTERNAL_EMAILS = new Set(["newfoodsbobchopra@gmail.com"]);

export async function requireInternalUser() {
  const session = await auth();
  if (!session?.user?.email || !INTERNAL_EMAILS.has(session.user.email)) {
    redirect("/login");
  }
  return session.user;
}
