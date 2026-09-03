import Link from "next/link";
import { Logo } from "@/components/Logo";
import { signupAction } from "./actions";

const ERRORS: Record<string, string> = {
  name: "Please enter your name.",
  email: "Please enter a valid email address.",
  password: "Password must be at least 8 characters.",
  mismatch: "Passwords don't match.",
  exists: "An account with that email already exists.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? ERRORS[params.error] : null;

  return (
    <main className="app-shell flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <Logo size={34} />
          <span className="font-semibold text-app-text tracking-tight">GUARDIA</span>
        </Link>

        <div className="app-card rounded-xl p-8">
          <h1 className="text-lg font-semibold text-app-text">Create your account</h1>
          <p className="text-sm text-app-muted mt-1">
            Set up TrustEd for your family — free for parents, always.
          </p>

          {errorMessage && (
            <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {errorMessage}
            </div>
          )}

          <form action={signupAction} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Your name</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-app-faint" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  name="name"
                  required
                  className="app-input w-full rounded-md pl-9 pr-3 py-2.5 text-sm text-app-text"
                  placeholder="Priya Chopra"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Email</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-app-faint" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M2 4l6 4.5L14 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  name="email"
                  type="email"
                  required
                  className="app-input w-full rounded-md pl-9 pr-3 py-2.5 text-sm text-app-text"
                  placeholder="you@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Password</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-app-faint" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="app-input w-full rounded-md pl-9 pr-3 py-2.5 text-sm text-app-text"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Confirm password</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-app-faint" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  className="app-input w-full rounded-md pl-9 pr-3 py-2.5 text-sm text-app-text"
                  placeholder="Type it again"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-app-teal text-[#04211d] text-sm font-semibold py-2.5 hover:opacity-90 active:scale-[0.99] transition-all"
            >
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-app-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-app-teal font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-app-muted">
          <Link href="/" className="hover:text-app-text">
            ← Back to guardia.ai
          </Link>
        </p>
      </div>
    </main>
  );
}
