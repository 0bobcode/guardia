import Link from "next/link";
import type { Metadata } from "next";
import { SubmitButton } from "@/components/SubmitButton";
import { verifyResetToken } from "@/lib/passwordReset";
import { resetPasswordAction } from "./actions";

// The token is in the URL — don't leak it to other sites via Referer.
export const metadata: Metadata = { title: "Reset password — Guardia", referrer: "no-referrer", robots: { index: false } };

const ERRORS: Record<string, string> = {
  password: "Password must be at least 8 characters.",
  mismatch: "Passwords don't match.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token = "", error } = await searchParams;
  const valid = token ? await verifyResetToken(token) : null;

  return (
    <main className="app-shell flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="load-in flex justify-center mb-8 transition-transform hover:scale-[1.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/guardia-logo.png" alt="Guardia" className="h-9 w-auto" />
        </Link>

        <div className="app-card rounded-xl p-8 load-in" style={{ animationDelay: "80ms" }}>
          <h1 className="text-lg font-semibold text-app-text">Choose a new password</h1>

          {!valid ? (
            <>
              <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                This reset link is invalid, has expired, or was already used.
              </div>
              <Link
                href="/forgot-password"
                className="mt-5 block w-full text-center rounded-md bg-app-teal text-[#04211d] text-sm font-semibold py-2.5 hover:opacity-90 transition-opacity"
              >
                Request a new link
              </Link>
            </>
          ) : (
            <>
              {error && ERRORS[error] && (
                <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                  {ERRORS[error]}
                </div>
              )}
              <form action={resetPasswordAction} className="mt-6 space-y-4">
                <input type="hidden" name="token" value={token} />
                <div>
                  <label className="block text-xs font-medium text-app-muted mb-1">New password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="app-input w-full rounded-md px-3 py-2.5 text-sm text-app-text"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-app-muted mb-1">Confirm password</label>
                  <input
                    name="confirm"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="app-input w-full rounded-md px-3 py-2.5 text-sm text-app-text"
                  />
                </div>
                <SubmitButton
                  pendingLabel="Saving…"
                  className="w-full rounded-md bg-app-teal text-[#04211d] text-sm font-semibold py-2.5 hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  Set new password
                </SubmitButton>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
