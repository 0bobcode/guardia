import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Guardia",
  description: "How Guardia, GuardRail, TrustEd, and the Guardia Companion apps collect, use, and protect data.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-brand-teal text-sm font-semibold tracking-wide uppercase mb-4">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-sm text-slate-300">Effective September 14, 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 space-y-12 text-sm text-slate-700 leading-relaxed">
        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">Who we are</h2>
          <p>
            Guardia — including the GuardRail compliance API, the TrustEd parental dashboard, and the
            Guardia Companion apps for Android and iOS — is built and operated by the Campus
            Consortium Foundation (CCF), a non-profit education technology organization. This policy
            describes what data those products collect, how it is used, and how it is protected.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">Who sets this up</h2>
          <p>
            Guardia Companion is installed and configured by a parent, guardian, or school
            administrator on a child&apos;s device — not by the child. Account holders (parents and
            district administrators) create the pairing code that links a device to a student
            profile in TrustEd; a child cannot enable or configure monitoring themselves.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">What we collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Account data:</strong> name and email for parents/guardians and district
              administrators, and either a hashed password or an identity from your organization&apos;s
              Microsoft Entra ID (Azure AD) single sign-on.
            </li>
            <li>
              <strong>Student profile data:</strong> a student&apos;s name, grade band, and the district
              or family account they belong to.
            </li>
            <li>
              <strong>From the Android companion app:</strong> text shown on-screen specifically within
              Gemini, ChatGPT, and Claude, captured via Android&apos;s Accessibility Service and sent to
              the linked parent&apos;s TrustEd dashboard. The service is scoped to only these three
              apps — it does not read any other app on the device.
            </li>
            <li>
              <strong>From the iOS companion app:</strong> usage-time thresholds only (for example, 15,
              30, 60, or 120 minutes/day) for Gemini, ChatGPT, and Claude, via Apple&apos;s Family
              Controls framework. Apple&apos;s platform does not allow any app, including ours, to read
              message content on iOS — the iOS app never collects or transmits what was said, only how
              long those apps were used.
            </li>
            <li>
              <strong>Policy configuration:</strong> the content-risk categories and custom policies a
              district administrator sets up in GuardRail.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">How we use it</h2>
          <p>
            Collected data is used to display session activity and usage summaries to the specific
            parent or guardian linked to that student, to evaluate messages against GuardRail&apos;s
            content-risk policies and generate alerts, and to give district administrators
            aggregate compliance reporting. We do not use this data for advertising, and we do not
            sell it to third parties.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">How we protect it</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All traffic between the companion apps, the dashboard, and our servers is encrypted in transit (HTTPS/TLS).</li>
            <li>Our database connection requires an encrypted connection (SSL).</li>
            <li>Device pairing and message-ingestion endpoints are rate-limited to reduce abuse.</li>
            <li>Only the parent/guardian linked to a student, and authorized administrators at that student&apos;s district, can view that student&apos;s data.</li>
            <li>Sign-in is available via a hashed password or your organization&apos;s Microsoft Entra ID single sign-on.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">Data retention</h2>
          <p>
            We retain data for as long as the associated account or device pairing is active, so
            parents and administrators can review activity history. You can request deletion at any
            time — see Contact below.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">Children&apos;s privacy</h2>
          <p>
            Guardia is a tool for parents, guardians, and schools to supervise a child&apos;s use of AI
            apps — it is configured by an adult, not by the child, and is not directed at children as
            its own user base. If you are a parent or school administrator with questions about how
            your child&apos;s or student&apos;s data is handled, contact us below.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of data associated with your
            account or your child&apos;s student profile by contacting us at{" "}
            <a href="mailto:hello@guardia.ai" className="text-brand-teal hover:underline">hello@guardia.ai</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">Changes to this policy</h2>
          <p>
            If we make material changes to this policy, we will update the effective date above and,
            where appropriate, notify account holders directly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-ink mb-3">Contact</h2>
          <p>
            Questions about this policy or your data can be sent to{" "}
            <a href="mailto:hello@guardia.ai" className="text-brand-teal hover:underline">hello@guardia.ai</a>.
          </p>
        </div>
      </section>
    </>
  );
}
