// Minimal transactional email via Resend's REST API (no SDK dependency).
// Needs RESEND_API_KEY and EMAIL_FROM (a sender on a domain verified in
// Resend). Without them, nothing is sent: in development the message is
// logged to the server console so the flow is still testable; in
// production it logs an error — the caller must not tell the user either way.

export async function sendEmail(opts: { to: string; subject: string; text: string; html: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email:dev] to=${opts.to} subject="${opts.subject}"\n${opts.text}`);
    } else {
      console.error("[email] RESEND_API_KEY / EMAIL_FROM not set — email was NOT sent");
    }
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html }),
  });
  if (!res.ok) {
    console.error(`[email] Resend rejected the message (${res.status})`);
    return false;
  }
  return true;
}

/** Base URL for links in emails. Never derived from the request's Host
 *  header in production — that would let an attacker poison reset links. */
export function appBaseUrl(devFallbackHost?: string | null): string | null {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.NODE_ENV !== "production" && devFallbackHost) return `http://${devFallbackHost}`;
  return null;
}
