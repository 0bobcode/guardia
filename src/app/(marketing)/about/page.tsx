import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/Reveal";
import { Particles } from "@/components/marketing/Particles";
import { CountUp } from "@/components/marketing/CountUp";

export const metadata: Metadata = {
  title: "About — Guardia",
  description: "Why Guardia exists, and why the Campus Consortium Foundation is building it.",
};

const TIMELINE = [
  {
    when: "Q3 2026",
    title: "GuardRail API beta",
    detail: "3 vendor pilots",
    icon: (
      <path d="M9 3v4M15 3v4M6 9h12l-1 10a2 2 0 01-2 2H9a2 2 0 01-2-2L6 9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    when: "Q1 2027",
    title: "TrustEd SDK GA",
    detail: "10 platform partners",
    icon: (
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    when: "Q3 2027",
    title: "Compliance Suite",
    detail: "5 state contracts",
    icon: (
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

const CCF_POINTS = [
  "501(c)(3): grant-eligible for ed-tech safety initiatives",
  "~48 staff with deep education sector relationships",
  "23-year track record trusted by districts & institutions",
  "Mission alignment: digital trust + student outcomes",
  "Positioned as non-profit guardian, not profit-driven vendor",
];

const VALUES = [
  {
    title: "Honest by default",
    body: "No inflated stats, no fake \"live\" badges, no absolute claims we can't back up. If we don't have a number, we say so.",
  },
  {
    title: "Built for the kid, not just the buyer",
    body: "A compliance checkbox that doesn't actually protect a student isn't worth shipping. Every feature traces back to a real flagged moment a parent or admin needed to see.",
  },
  {
    title: "Fast enough to matter",
    body: "A scan that arrives after the unsafe reply already reached a child is too late. GuardRail is built to sit in the request path, not review logs after the fact.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative bg-brand-navy text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: "radial-gradient(700px 500px at 50% -10%, rgba(45, 212, 191, 0.12), transparent)" }}
        />
        <Particles count={10} />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <Reveal>
            <p className="text-brand-teal text-sm font-semibold tracking-wide uppercase mb-4">About Guardia</p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Every child deserves an AI experience that is safe, transparent, and worthy of their
              parents&apos; trust.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div>
                <p className="text-2xl font-bold tabular-nums"><CountUp end={56} suffix="M+" /></p>
                <p className="text-[11px] text-slate-400 mt-1">K-12 students in the US¹</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums"><CountUp end={15} suffix="+" /></p>
                <p className="text-[11px] text-slate-400 mt-1">States legislating AI child safety²</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums"><CountUp end={0} /></p>
                <p className="text-[11px] text-slate-400 mt-1">Dominant compliance vendors, today</p>
              </div>
            </div>
            <p className="mt-6 text-[10px] text-slate-500">
              ¹ National Center for Education Statistics. ² Based on public legislative tracking.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <h2 className="text-2xl font-bold text-brand-ink mb-4">Why we exist</h2>
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              Children now interact daily with AI tutors, chatbots, and social platforms — most with
              zero safety guardrails or parental visibility. Regulators are moving fast: Ohio, Texas,
              and 15+ other states are passing AI child-safety and parental-consent laws, and
              non-compliance carries real liability.
            </p>
            <p>
              Schools are exposed. Ed-tech vendors lack the tools to comply, districts face lawsuits,
              and parents have no visibility into how their children&apos;s data and AI conversations
              are handled. Guardia builds the infrastructure that closes that gap — for districts,
              for ed-tech vendors, and for the families relying on both.
            </p>
            <p>
              We started GuardRail because the alternative — a district finding out about an unsafe
              AI interaction from a parent&apos;s phone call instead of from its own logs — keeps
              happening, and it&apos;s an entirely solvable problem. A REST call, a policy, and an
              honest audit trail shouldn&apos;t be this rare.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative border-y border-brand-border bg-slate-50 overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Reveal>
            <h2 className="text-2xl font-bold text-brand-ink mb-8 text-center">What we actually believe</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="h-full bg-white border border-brand-border rounded-xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <h3 className="text-sm font-bold text-brand-ink mb-2">{v.title}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-b border-brand-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Reveal>
            <h2 className="text-xl font-bold text-brand-ink mb-2">Why the Campus Consortium Foundation</h2>
            <p className="text-sm text-brand-muted mb-6">
              Guardia is built and operated by the Campus Consortium Foundation (CCF), a non-profit
              with a two-decade track record in education technology.
            </p>
            <ul className="space-y-3">
              {CCF_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#0ea5a0" fillOpacity="0.15" />
                    <path d="M4.5 8.2l2.2 2.2 4.8-5" stroke="#0ea5a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <h2 className="text-xl font-bold text-brand-ink mb-2">Why now</h2>
          <p className="text-sm text-brand-muted mb-10">
            Ohio&apos;s framework takes effect in 2026 and is becoming the enforcement template other
            states are adopting. There is no dominant compliance vendor yet — school districts are
            actively looking for solutions today.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="text-xl font-bold text-brand-ink mb-6">Roadmap</h2>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-5">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.when} delay={i * 120}>
              <div className="h-full rounded-xl border border-brand-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="h-10 w-10 rounded-full bg-teal-50 border border-brand-teal/30 flex items-center justify-center text-brand-teal mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    {t.icon}
                  </svg>
                </div>
                <p className="text-xs font-semibold text-brand-teal uppercase tracking-wide">{t.when}</p>
                <p className="text-sm font-semibold text-brand-ink mt-1">{t.title}</p>
                <p className="text-xs text-brand-muted mt-0.5">{t.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-slate-500">
          A forward-looking plan, not a commitment with fixed dates — see the{" "}
          <a href="/changelog" className="text-brand-teal hover:underline">changelog</a> for what&apos;s actually shipped.
        </p>
      </section>

      <section className="relative bg-brand-navy overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{ backgroundImage: "radial-gradient(600px 400px at 50% 100%, rgba(45, 212, 191, 0.1), transparent)" }}
        />
        <Particles count={6} />
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <Reveal>
            <h2 className="text-xl font-bold text-white mb-3">Want to talk to us?</h2>
            <p className="text-sm text-slate-300 mb-6">
              We&apos;re working with districts and ed-tech vendors on early pilots.
            </p>
            <Link
              href="/contact"
              className="inline-block px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 transition-opacity"
            >
              Get in touch
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
