import type { Metadata } from "next";
import { submitContactAction } from "./actions";

export const metadata: Metadata = {
  title: "Contact — Guardia",
  description: "Get in touch about GuardRail, TrustEd, or a pilot program.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-5 gap-12">
      <div className="md:col-span-2">
        <p className="text-brand-teal text-sm font-semibold tracking-wide uppercase mb-4">Contact</p>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">Let&apos;s talk.</h1>
        <p className="mt-4 text-sm text-brand-muted leading-relaxed">
          Whether you&apos;re a district evaluating compliance options, an ed-tech vendor looking
          to integrate, or a parent with a question — we&apos;d like to hear from you.
        </p>
        <div className="mt-8 space-y-4 text-sm">
          <div>
            <p className="text-xs text-brand-muted">Email</p>
            <p className="text-brand-ink font-medium">hello@guardia.ai</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Backed by</p>
            <p className="text-brand-ink font-medium">Campus Consortium Foundation</p>
          </div>
        </div>
      </div>

      <div className="md:col-span-3">
        {params.sent ? (
          <div className="bg-brand-teal-soft border border-brand-teal/30 rounded-xl p-8 text-center">
            <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#0ea5a0" fillOpacity="0.15" />
              <path d="M12 20.5l5.5 5.5L28 14" stroke="#0ea5a0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-lg font-bold text-brand-ink">Message received</h2>
            <p className="text-sm text-brand-muted mt-2">
              Thanks for reaching out — we&apos;ll get back to you shortly.
            </p>
          </div>
        ) : (
          <form action={submitContactAction} className="bg-white border border-brand-border rounded-xl p-6 space-y-4">
            {params.error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                Please fill in your name, email, and message.
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Name</label>
                <input
                  name="name"
                  required
                  className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">
                Organization <span className="text-brand-muted/70">(optional)</span>
              </label>
              <input
                name="organization"
                className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">I&apos;m interested in</label>
              <select
                name="interest"
                defaultValue="General inquiry"
                className="w-full rounded-md border border-brand-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option>General inquiry</option>
                <option>GuardRail API</option>
                <option>TrustEd SDK</option>
                <option>Compliance Suite</option>
                <option>Press</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-brand-navy text-white text-sm font-semibold py-2.5 hover:bg-brand-navy-soft active:scale-[0.99] transition-all"
            >
              Send message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
