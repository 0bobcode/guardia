import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GuardRailPreview } from "@/components/marketing/GuardRailPreview";
import { LiveDemo } from "@/components/marketing/LiveDemo";
import { LiveBadgeCounter } from "@/components/marketing/LiveBadgeCounter";
import { Reveal } from "@/components/marketing/Reveal";
import { CountUp } from "@/components/marketing/CountUp";
import { IconAlert, IconPolicies, IconReports, IconChat, IconCheck, IconClock } from "@/components/icons";

const FEATURES = [
  {
    Icon: IconAlert,
    title: "Real-time detection",
    body: "Every message is scored before it reaches a child — not sampled afterward.",
  },
  {
    Icon: IconPolicies,
    title: "Age-tiered policies",
    body: "K-5, 6-8, and 9-12 each get their own rules. Districts edit them live, no redeploy.",
  },
  {
    Icon: IconReports,
    title: "Audit-ready reporting",
    body: "Every scan is logged and exportable, formatted for state child-safety statutes.",
  },
  {
    Icon: IconChat,
    title: "Full session transcripts",
    body: "Parents see the whole conversation, not a single flagged line stripped of context.",
  },
  {
    Icon: IconCheck,
    title: "One-tap consent",
    body: "When an app wants a child's data, a parent approves or denies it from their phone.",
  },
  {
    Icon: IconClock,
    title: "Time & subject controls",
    body: "Per-app daily limits parents set themselves — no ticket to the district required.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Point traffic at GuardRail",
    body: "One REST endpoint. Any AI app, any language. Most vendors are live in under 4 hours.",
  },
  {
    n: "02",
    title: "Every message gets scanned",
    body: "Content is scored against the grade band's policy in real time — blocked, flagged, or passed before the child sees a reply.",
  },
  {
    n: "03",
    title: "Parents see what happened",
    body: "TrustEd turns every flagged moment into a full transcript a parent can actually read, react to, and act on.",
  },
];

export default function Home() {
  return (
    <>
      <section className="marketing-hero text-white relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-20 relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 mb-7 tabular-nums">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulse" />
            <LiveBadgeCounter />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-[1.05]">
            The safety layer between kids and AI.
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
            GuardRail scans every message before it reaches a child. TrustEd shows their parent
            exactly what happened next. Nothing slips through either side.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="group px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 hover:shadow-xl hover:shadow-brand-teal/25 transition-all inline-flex items-center gap-2"
            >
              Sign in to your dashboard
              <svg className="transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/products/guardrail"
              className="px-5 py-3 rounded-md border border-white/20 text-white font-semibold hover:bg-white/5 hover:border-white/35 transition-colors"
            >
              Explore the products
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-28 relative grid md:grid-cols-2 gap-5">
          <GuardRailPreview />
          <LiveDemo />
        </div>
      </section>

      <section className="border-b border-brand-border">
        <div className="mx-auto max-w-6xl px-6 py-10 grid sm:grid-cols-4 gap-6 text-center sm:text-left">
          <Reveal>
            <p className="text-2xl font-bold text-brand-ink tabular-nums">
              <CountUp end={15} suffix="+" />
            </p>
            <p className="text-xs text-brand-muted mt-1">States with pending AI child-safety laws</p>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-2xl font-bold text-brand-ink tabular-nums">
              <CountUp end={50} prefix="$" suffix="B+" />
            </p>
            <p className="text-xs text-brand-muted mt-1">Ed-tech market lacking compliance infra</p>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-2xl font-bold text-brand-ink tabular-nums">
              <CountUp end={56} suffix="M+" />
            </p>
            <p className="text-xs text-brand-muted mt-1">K-12 students in the US</p>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-2xl font-bold text-brand-ink tabular-nums">
              <CountUp end={4} prefix="<" suffix="h" />
            </p>
            <p className="text-xs text-brand-muted mt-1">Average GuardRail integration time</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="max-w-xl mb-12">
          <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">How it works</p>
          <h2 className="text-3xl font-bold text-brand-ink tracking-tight">
            From integration to audit trail, in three steps.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120} className="relative">
              <p className="text-4xl font-bold text-brand-teal/25">{s.n}</p>
              <h3 className="mt-2 text-lg font-bold text-brand-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-brand-muted leading-relaxed">{s.body}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-5 -right-4 text-brand-border">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-brand-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="max-w-xl mb-12">
            <p className="text-xs font-semibold tracking-wide text-brand-teal uppercase mb-3">
              GuardRail + TrustEd
            </p>
            <h2 className="text-3xl font-bold text-brand-ink tracking-tight">
              Everything a district, a vendor, and a parent each actually need.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ Icon, title, body }, i) => (
              <Reveal key={title} delay={(i % 3) * 100}>
                <div className="bg-white rounded-xl border border-brand-border p-6 h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 hover:border-brand-teal/30">
                  <div className="h-10 w-10 rounded-lg bg-brand-teal-soft flex items-center justify-center text-brand-teal mb-4">
                    <Icon />
                  </div>
                  <h3 className="text-sm font-bold text-brand-ink">{title}</h3>
                  <p className="mt-1.5 text-sm text-brand-muted leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <Reveal className="mx-auto max-w-6xl px-6 py-16 text-center">
          <Logo size={40} className="mx-auto mb-6" />
          <p className="text-lg text-brand-ink font-medium max-w-2xl mx-auto leading-relaxed">
            &ldquo;Every child deserves an AI experience that is safe, transparent, and worthy of
            their parents&apos; trust.&rdquo;
          </p>
          <Link
            href="/about"
            className="inline-block mt-6 text-sm font-semibold text-brand-teal hover:underline"
          >
            Learn about Guardia →
          </Link>
        </Reveal>
      </section>

      <section className="marketing-hero text-white">
        <Reveal className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            No dominant compliance vendor yet. That window closes fast.
          </h2>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto">
            Ohio&apos;s framework is already becoming the national template. Districts are looking
            for a solution today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="px-5 py-3 rounded-md bg-brand-teal text-brand-navy font-semibold hover:opacity-90 hover:shadow-xl hover:shadow-brand-teal/25 transition-all"
            >
              Sign in to your dashboard
            </Link>
            <Link
              href="/contact"
              className="px-5 py-3 rounded-md border border-white/20 text-white font-semibold hover:bg-white/5 hover:border-white/35 transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
