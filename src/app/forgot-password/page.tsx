import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { forgotPasswordAction } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="app-shell flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="load-in flex justify-center mb-8 transition-transform hover:scale-[1.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/guardia-logo.png" alt="Guardia" className="h-9 w-auto" />
        </Link>

        <div className="app-card rounded-xl p-8 load-in" style={{ animationDelay: "80ms" }}>
          <h1 className="text-lg font-semibold text-app-text">Reset your password</h1>

          {params.sent ? (
            <div className="mt-4 text-sm text-app-text bg-app-teal-soft border border-app-teal/30 rounded-md px-3 py-3">
              If an account exists for that email, we&apos;ve sent a link to reset the password. It expires in 30
              minutes. Accounts that sign in with Microsoft don&apos;t have a Guardia password — use
              &ldquo;Continue with Microsoft&rdquo; instead.
            </div>
          ) : (
            <>
              <p className="text-sm text-app-muted mt-1">Enter your email and we&apos;ll send you a reset link.</p>
              {params.error && (
                <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                  {params.error === "slow"
                    ? "Too many requests. Please wait a few minutes and try again."
                    : "Enter a valid email address."}
                </div>
              )}
              <form action={forgotPasswordAction} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-app-muted mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="app-input w-full rounded-md px-3 py-2.5 text-sm text-app-text"
                    placeholder="you@school.edu"
                  />
                </div>
                <SubmitButton
                  pendingLabel="Sending…"
                  className="w-full rounded-md bg-app-teal text-[#04211d] text-sm font-semibold py-2.5 hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  Send reset link
                </SubmitButton>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-sm text-app-muted">
            <Link href="/login" className="text-app-teal font-medium hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
