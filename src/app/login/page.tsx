import Link from "next/link";
import { Logo } from "@/components/Logo";
import { loginAction } from "./actions";
import { demoLoginAction } from "./demo-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="app-shell flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <Logo size={34} />
          <span className="font-semibold text-app-text tracking-tight">GUARDIA</span>
        </Link>

        <div className="app-card rounded-xl p-8">
          <h1 className="text-lg font-semibold text-app-text">Welcome back</h1>
          <p className="text-sm text-app-muted mt-1">Sign in to your GuardRail or TrustEd dashboard.</p>

          {params.error && (
            <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              Invalid email or password.
            </div>
          )}

          <form action={loginAction} className="mt-6 space-y-4">
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
                  defaultValue={params.email}
                  className="app-input w-full rounded-md pl-9 pr-3 py-2.5 text-sm text-app-text"
                  placeholder="you@school.edu"
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
                  className="app-input w-full rounded-md pl-9 pr-3 py-2.5 text-sm text-app-text"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-app-teal text-[#04211d] text-sm font-semibold py-2.5 hover:opacity-90 active:scale-[0.99] transition-all"
            >
              Sign in
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-app-muted">
            New here?{" "}
            <Link href="/signup" className="text-app-teal font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 app-card rounded-xl p-5">
          <p className="text-xs font-semibold text-app-text mb-3">Try it without an account</p>
          <div className="grid grid-cols-2 gap-2">
            <form action={demoLoginAction}>
              <input type="hidden" name="role" value="admin" />
              <button
                type="submit"
                className="w-full text-xs font-medium px-3 py-2.5 rounded-md border border-app-border text-app-text hover:border-app-teal/40 hover:bg-white/[0.03] transition-colors"
              >
                View as district admin
              </button>
            </form>
            <form action={demoLoginAction}>
              <input type="hidden" name="role" value="parent" />
              <button
                type="submit"
                className="w-full text-xs font-medium px-3 py-2.5 rounded-md border border-app-border text-app-text hover:border-app-teal/40 hover:bg-white/[0.03] transition-colors"
              >
                View as a parent
              </button>
            </form>
          </div>
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
