// A scripted FAQ knowledge base for the marketing site's chat widget.
// There is no AI/LLM behind this — every answer below is fixed text,
// matched by keyword overlap against what the visitor types. If nothing
// matches well enough, the widget says so and offers real suggestions
// instead of guessing.

export type ChatCategory =
  | "Product"
  | "Platforms"
  | "Privacy & security"
  | "For parents"
  | "For districts"
  | "For vendors"
  | "Pricing"
  | "Account"
  | "Company";

export type ChatPrompt = { q: string; a: string; category: ChatCategory };

export const CHAT_PROMPTS: ChatPrompt[] = [
  // Product
  { category: "Product", q: "What is Guardia?", a: "Guardia is the umbrella brand for two products: GuardRail (an AI safety compliance API) and TrustEd (a parental dashboard). Together they scan AI-app messages a child sends or receives, block or flag unsafe content, and give parents and districts a real audit trail." },
  { category: "Product", q: "What is GuardRail?", a: "GuardRail is a REST API that sits between any AI application and the student using it. It scores every message against a grade-band policy in real time and blocks, flags, or passes it before a reply reaches the child." },
  { category: "Product", q: "What is TrustEd?", a: "TrustEd is the parent- and district-facing dashboard. Parents see one feed across every AI app their child uses at school, get real-time alerts on flagged content, and manage consent. Districts get the compliance/audit view regulators ask for." },
  { category: "Product", q: "How is GuardRail different from TrustEd?", a: "GuardRail is the detection layer — an API that scans content. TrustEd is the visibility layer — the dashboard where a parent or district admin actually sees what GuardRail caught." },
  { category: "Product", q: "How does GuardRail work?", a: "An AI app sends the message text to GuardRail's /api/scan endpoint along with a grade band. GuardRail scores it against policy categories and returns a risk level and an action (passed, flagged, or blocked) — all before the child sees a reply." },
  { category: "Product", q: "Is this a real product or a prototype?", a: "It's built as a real, functioning product — real database, real auth, real detection engine — not a mockup. Some marketing copy uses illustrative example data, and we label that clearly wherever it appears." },
  { category: "Product", q: "What problem does Guardia solve?", a: "Schools are rolling out AI tutoring/chat tools faster than they can vet them, and there's no consistent way to detect, block, or document an unsafe AI interaction. GuardRail and TrustEd close that gap." },
  { category: "Product", q: "Who is Guardia for?", a: "Three groups: K-12 school districts, the ed-tech vendors building AI tools for those districts, and the parents of students using those tools." },
  { category: "Product", q: "Do you have a live demo?", a: "Yes — scroll to the \"Try it yourself\" section on the homepage or the GuardRail product page. It runs GuardRail's real default detection rules in your browser; nothing you type is sent anywhere." },
  { category: "Product", q: "What happens when GuardRail blocks something?", a: "The reply never reaches the child. The attempt is logged as a scan event with its risk tier and matched category, and shows up in both the district's GuardRail alerts and the parent's TrustEd dashboard." },
  { category: "Product", q: "What's the difference between flagged and blocked?", a: "Blocked means the AI's reply was stopped before the student saw it. Flagged means the content was allowed through but logged for review — typically used for medium-risk content that isn't clearly unsafe." },
  { category: "Product", q: "What is a risk score?", a: "A weighted score (0-100) that rolls up all recent scan events for a district into one number, based on how many were HIGH, MEDIUM, or LOW risk. It's the same view shown on the homepage's \"District Risk Overview\" example." },
  { category: "Product", q: "Can I see a changelog?", a: "Yes — /changelog lists what's actually shipped, pulled from real commit history, not a curated highlight reel." },

  // Platforms
  { category: "Platforms", q: "What AI apps does GuardRail work with?", a: "Any AI application that can call a REST API — it's not tied to one vendor. We also ship a browser extension that monitors AI web apps like Gemini and ChatGPT directly." },
  { category: "Platforms", q: "Does this work with ChatGPT?", a: "The browser extension monitors ChatGPT's web interface for content visibility. For blocking unsafe replies before they're generated, an AI app (including a ChatGPT-based one) needs to integrate GuardRail's API directly." },
  { category: "Platforms", q: "Does this work with Gemini?", a: "Yes — the browser extension has web monitoring support for Gemini, including handling its consolidated Android package for device-level monitoring." },
  { category: "Platforms", q: "Is there an iOS app?", a: "Yes, a Guardia companion app for iOS. Apple's sandboxing means no app can read another app's on-screen message content on iOS, at any price tier — so the iOS companion uses Screen Time (Family Controls/DeviceActivity) for usage-time tracking, not message content." },
  { category: "Platforms", q: "Is there an Android app?", a: "Yes — the Android companion app uses Android's Accessibility Service to read on-screen text from apps like Gemini or ChatGPT and reports relevant activity to TrustEd." },
  { category: "Platforms", q: "Why can't the iOS app read messages like the Android app?", a: "It's a platform limitation, not a Guardia choice: iOS sandboxing categorically blocks any app from reading another app's on-screen content. Paying for a developer account doesn't unlock it. Only coarse usage-time tracking is possible on iOS." },
  { category: "Platforms", q: "Is there a browser extension?", a: "Yes, for monitoring AI web apps (currently Gemini and ChatGPT) directly in the browser. It's built for Chrome and documents its data practices in our privacy policy." },
  { category: "Platforms", q: "What languages/programming languages does the API support?", a: "GuardRail is a standard REST API — any language that can make an HTTP request can integrate it." },
  { category: "Platforms", q: "Does GuardRail work with any grade level?", a: "Policies are tiered by grade band: K-5, 6-8, and 9-12, each with different default severity thresholds." },
  { category: "Platforms", q: "Can I use GuardRail without TrustEd?", a: "Yes, districts and vendors can integrate GuardRail's API on its own. TrustEd is what gives parents visibility into what GuardRail caught." },

  // Privacy & security
  { category: "Privacy & security", q: "Is my child's data safe?", a: "Content scanned by GuardRail is used to detect and log unsafe interactions, not sold or used for advertising. See our privacy policy for the full data-handling details, including what the browser extension collects." },
  { category: "Privacy & security", q: "What data does the browser extension collect?", a: "The extension's data practices are documented in our privacy policy — it captures message content from supported AI web apps (currently Gemini and ChatGPT) to detect unsafe content, and nothing beyond that scope." },
  { category: "Privacy & security", q: "Is Guardia COPPA compliant?", a: "TrustEd's consent-request workflow and GuardRail's compliance reporting are built with COPPA and state child-safety laws in mind. Talk to us about your district's specific compliance needs." },
  { category: "Privacy & security", q: "Where is data stored?", a: "In a managed PostgreSQL database. We don't publish the specific hosting region in marketing copy — ask us directly if that's a requirement for your district." },
  { category: "Privacy & security", q: "Do you sell data to third parties?", a: "No. Scan data exists to detect and document unsafe AI interactions for parents and districts, not to be sold or used for advertising." },
  { category: "Privacy & security", q: "Can a parent delete their data?", a: "Parents can delete a session from their TrustEd dashboard. For full account deletion requests, contact us." },
  { category: "Privacy & security", q: "Is the connection encrypted?", a: "Yes, all traffic to Guardia's services runs over HTTPS." },
  { category: "Privacy & security", q: "How do you handle passwords?", a: "Passwords are hashed (bcrypt) before storage — we never store plaintext passwords. SSO-provisioned accounts (Microsoft Entra ID) don't have a local password at all." },
  { category: "Privacy & security", q: "Do you have SOC 2?", a: "Not yet — it's on our draft roadmap given the compliance-focused buyer audience, but isn't certified today. Don't take a claim otherwise as accurate." },
  { category: "Privacy & security", q: "What happens to flagged content — who sees it?", a: "The district's GuardRail alerts and the affected student's parent(s) in TrustEd. It isn't shared outside that district's account." },
  { category: "Privacy & security", q: "Is Guardia FERPA aware?", a: "GuardRail's audit trail and TrustEd's parent-facing controls are designed with student-record privacy in mind. For a formal FERPA compliance conversation, contact us directly." },
  { category: "Privacy & security", q: "Do you use my data to train AI models?", a: "No. GuardRail's detection rules are keyword/policy-based, not a model trained on customer data." },
  { category: "Privacy & security", q: "Can I request an unpair/removal from device monitoring?", a: "Yes — the browser extension unpair flow requires a password managed from TrustEd, so it can't be removed silently without parent/admin action." },
  { category: "Privacy & security", q: "What's your data retention policy?", a: "We don't publish a specific retention window in marketing copy today — this is a good one to ask us directly in a sales conversation." },

  // For parents
  { category: "For parents", q: "What does a parent see in TrustEd?", a: "One dashboard across every AI app their child uses at school: real-time alerts on flagged content, full session transcripts for flagged moments, usage time, and consent requests." },
  { category: "For parents", q: "How do I sign up as a parent?", a: "Districts and ed-tech vendors provision parent accounts as part of onboarding. If your child's school uses Guardia, you'll get an invite; otherwise use /signup or contact us." },
  { category: "For parents", q: "Can I see exactly what my child asked an AI?", a: "For flagged moments, yes — TrustEd shows the full transcript so you can read exactly what was asked and what was blocked or flagged, not just a summary." },
  { category: "For parents", q: "Will I get notified in real time?", a: "TrustEd is built to surface flagged content as it's scanned, not on a delay. Notification delivery (email/push) depends on your district's configuration." },
  { category: "For parents", q: "Can I set time limits on AI apps?", a: "TrustEd includes time & subject-area controls as part of the parent feature set." },
  { category: "For parents", q: "What is a consent request?", a: "When a new AI app or feature needs parental approval, it shows up in TrustEd as a consent request you approve or deny — tracked with a status (pending/approved/denied/expired)." },
  { category: "For parents", q: "Can I delete a session?", a: "Yes, parents can delete a session directly from their TrustEd dashboard." },
  { category: "For parents", q: "Do I need to install anything as a parent?", a: "The TrustEd dashboard works in any browser. Companion apps (iOS/Android) are optional, for device-level usage tracking beyond what's visible in the dashboard alone." },
  { category: "For parents", q: "What if I have more than one child?", a: "TrustEd supports multiple children under one parent account, each with their own activity feed and consent requests." },
  { category: "For parents", q: "Can I see which AI app is riskiest?", a: "TrustEd's alert feed shows which app a flagged or blocked message came from, so patterns by app are visible over time." },
  { category: "For parents", q: "Is TrustEd free for parents?", a: "TrustEd is provisioned through your child's school district or the ed-tech vendor they use — pricing is set at that level, not billed directly to individual parents in our current model." },
  { category: "For parents", q: "Can I turn off monitoring?", a: "Monitoring is configured by your district as part of their safety policy. Ask your school's administrator about opt-out options where applicable by policy or law." },
  { category: "For parents", q: "What does \"Guardia OS\" mean in my parent settings?", a: "It's the installed feature/version level for your account, capped at whatever version your district's admin has approved and published — you install up to that ceiling from TrustEd Settings." },
  { category: "For parents", q: "Does TrustEd work on mobile?", a: "The dashboard is responsive and works in a mobile browser. There's also a Guardia Parent mobile-preview experience you can try in-browser." },

  // For districts
  { category: "For districts", q: "What does a district admin see in GuardRail?", a: "A compliance console: real-time alerts, a district-wide risk score, policy management by grade band, and audit-ready compliance reporting." },
  { category: "For districts", q: "How long does integration take?", a: "GuardRail is a single REST endpoint — it's designed to integrate in under 4 hours for a typical AI app. That's a design target, not a measured average across every customer yet." },
  { category: "For districts", q: "Can we customize our own policies?", a: "Yes — district admins can add and remove custom policy categories on top of the default, grade-tiered presets." },
  { category: "For districts", q: "What states does GuardRail's compliance reporting cover?", a: "Auto-generated audit trails are formatted for Ohio, Texas, and other emerging state regulations, with Ohio's framework treated as a likely template other states are adopting." },
  { category: "For districts", q: "Can we filter alerts by student?", a: "Yes, GuardRail Alerts supports filtering by student." },
  { category: "For districts", q: "Do you support SSO?", a: "Yes — Microsoft Entra ID SSO login is supported for district accounts, alongside standard email/password." },
  { category: "For districts", q: "What's the audit trail actually contain?", a: "Every scan event: the matched category, risk level, action taken (passed/flagged/blocked), which app it came from, timestamp, and — where applicable — which student." },
  { category: "For districts", q: "Can we self-host GuardRail?", a: "Guardia is currently offered as a hosted service, not a self-hosted deployment. Ask us if a dedicated/on-prem conversation is relevant to your district." },
  { category: "For districts", q: "How many students can GuardRail support?", a: "It's built to scan per-message in real time regardless of district size — see the Super Admin view internally for real current scan volume across all districts." },
  { category: "For districts", q: "What's a grade band?", a: "A policy tier — K-5, 6-8, or 9-12 — each with different default severity thresholds, since what's appropriate to flag or block differs by age group." },
  { category: "For districts", q: "Who manages our GuardRail OS version?", a: "District admins approve and publish the OS version ceiling from GuardRail Settings, which caps what parents can install from TrustEd." },
  { category: "For districts", q: "Can we get a compliance report for a board meeting?", a: "GuardRail's Compliance Reporting feature auto-generates audit trails formatted for state regulatory review — ask us about exporting one for a specific meeting." },
  { category: "For districts", q: "Do you offer a pilot program?", a: "Yes, we work with districts and ed-tech vendors on early pilots — reach out via /contact." },
  { category: "For districts", q: "What if we already use a web filter like Securly or GoGuardian?", a: "Those work at the device/network level; GuardRail works inside the AI application's request path, scoring the actual conversation content. They're complementary, not redundant." },

  // For vendors
  { category: "For vendors", q: "I build an AI tutoring app — how do I integrate GuardRail?", a: "Send the message text and a grade band to GuardRail's /api/scan endpoint. It returns a risk level and an action (blocked/flagged/passed) you apply before showing a reply to the student." },
  { category: "For vendors", q: "What does the API request/response look like?", a: "POST /api/scan with { text, gradeBand }. Response: { riskLevel, action, matchedCategories }. See the GuardRail product page for a live example." },
  { category: "For vendors", q: "Can we white-label TrustEd?", a: "TrustEd's SDK is built to be embedded and white-labeled as your own product for ed-tech vendors." },
  { category: "For vendors", q: "Do you have a consent-request workflow we can use?", a: "Yes — TrustEd's SDK includes automatic parental consent workflows you can drop into your app." },
  { category: "For vendors", q: "Do you send weekly usage digests?", a: "Yes, TrustEd can send weekly usage digests to parents as part of the vendor SDK." },
  { category: "For vendors", q: "What's the latency of a scan call?", a: "We haven't published a specific latency benchmark in marketing copy — ask us for current numbers relevant to your integration." },
  { category: "For vendors", q: "Is there a sandbox/test environment?", a: "Ask us about a sandbox for testing your GuardRail integration before going live — this isn't self-serve yet." },
  { category: "For vendors", q: "Do you rate-limit the API?", a: "Rate limits exist to protect the service; specific thresholds are discussed per integration — contact us for details relevant to your expected volume." },
  { category: "For vendors", q: "Can we get webhook notifications instead of polling?", a: "Ask us about your specific integration needs — this is a good question for a sales/engineering conversation, not something with a published default today." },
  { category: "For vendors", q: "How is GuardRail priced for vendors?", a: "There's no public price list yet; pricing is discussed per integration. Contact us via /contact." },

  // Pricing
  { category: "Pricing", q: "How much does Guardia cost?", a: "There's no public price list today — pricing is discussed case-by-case with districts and vendors depending on scale. Reach out via /contact for a quote." },
  { category: "Pricing", q: "Is there a free trial?", a: "Ask us about a pilot program — we work with districts and vendors on early pilots, which is the closest thing to a trial today." },
  { category: "Pricing", q: "Do you charge per student or per API call?", a: "Pricing model specifics are discussed directly with each district/vendor — we haven't published a standard unit (per-seat vs per-call) in marketing copy." },
  { category: "Pricing", q: "Is TrustEd billed separately from GuardRail?", a: "They're typically part of the same engagement for a district, but ask us directly if you need them billed or scoped separately." },
  { category: "Pricing", q: "Do non-profits get a discount?", a: "Guardia itself is built by a non-profit (the Campus Consortium Foundation) — ask us directly about pricing for non-profit or public-school customers." },
  { category: "Pricing", q: "What's included at the base tier?", a: "We don't publish tiered plans today — every engagement is scoped directly. Contact us to talk through what you need." },
  { category: "Pricing", q: "Can I see a sample invoice or contract?", a: "That's a conversation for our sales team — reach out via /contact and we'll walk you through it." },
  { category: "Pricing", q: "Do you require a long-term contract?", a: "Contract terms are discussed per engagement — ask us directly." },

  // Account
  { category: "Account", q: "How do I log in?", a: "Go to /login. District admins and parents both use the same login page; Microsoft Entra ID SSO is available for district accounts." },
  { category: "Account", q: "How do I sign up?", a: "Use /signup, or if your school/district already uses Guardia, ask your administrator for an invite instead of self-signing up." },
  { category: "Account", q: "I forgot my password.", a: "Use the \"Forgot password?\" link on the login page to reset it. SSO-linked accounts don't have a local password to reset — sign in through your organization's Microsoft account instead." },
  { category: "Account", q: "Can I use Google to sign in?", a: "SSO today is Microsoft Entra ID, not Google — ask us if Google Workspace SSO matters for your district." },
  { category: "Account", q: "How do I change my email?", a: "Contact us or your district admin — this isn't currently a self-service settings option." },
  { category: "Account", q: "Can I have two-factor authentication?", a: "Microsoft Entra ID SSO accounts inherit your organization's own MFA policy. For credentials-based accounts, ask us about current 2FA support." },
  { category: "Account", q: "How do I delete my account?", a: "Contact us directly via /contact to request account deletion." },
  { category: "Account", q: "Why can't I see the district admin console?", a: "District-admin features are only visible to accounts with the DISTRICT_ADMIN role. If you're a parent, you'll land in TrustEd instead — that's expected." },
  { category: "Account", q: "Can one account be both a parent and a district admin?", a: "No, each account has a single role today. Use separate accounts if you need both views." },
  { category: "Account", q: "Is there a mobile app I need to log into separately?", a: "The iOS/Android companion apps pair with your existing TrustEd account rather than requiring a separate login." },

  // Company
  { category: "Company", q: "Who makes Guardia?", a: "Guardia is built and operated by the Campus Consortium Foundation (CCF), a non-profit with a long track record in education technology." },
  { category: "Company", q: "Is Guardia a non-profit?", a: "Yes — it's positioned as a 501(c)(3) non-profit initiative, not a profit-driven vendor. See /about for more." },
  { category: "Company", q: "Why does Guardia exist?", a: "Because kids are using AI tools with zero safety guardrails or parental visibility, and there's no dominant compliance vendor helping districts catch up to fast-moving state legislation. See /about for the full story." },
  { category: "Company", q: "How can I contact you?", a: "Use the /contact page, or click \"Talk to us\" on any product page." },
  { category: "Company", q: "Do you have a changelog or roadmap?", a: "Yes — /changelog for what's shipped, and /about has a draft (non-committal) roadmap." },
  { category: "Company", q: "Are you hiring?", a: "Reach out via /contact and mention you're asking about roles — we don't have a public careers page live yet." },
  { category: "Company", q: "Who are your competitors?", a: "Companies like Bark, Gaggle, Securly, GoGuardian, and Qustodio/Life360 work in adjacent spaces (monitoring, filtering, consumer controls). GuardRail's focus — scoring AI conversation content inside the request path — is more specific than most of them." },
  { category: "Company", q: "Where are you based?", a: "We haven't published specific office/location details in marketing copy — ask us directly via /contact." },
  { category: "Company", q: "Can I write about Guardia / are you on Trustpilot?", a: "Yes, we have a verified Trustpilot listing — feel free to leave a review there, and reach out via /contact for press inquiries." },
  { category: "Company", q: "What's next for Guardia?", a: "See the draft roadmap on /about — near-term work includes broader browser-extension coverage, analytics integration, and a human-review queue for high-risk flags." },
];

export const CHAT_CATEGORIES: ChatCategory[] = [
  "Product",
  "Platforms",
  "Privacy & security",
  "For parents",
  "For districts",
  "For vendors",
  "Pricing",
  "Account",
  "Company",
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "do", "does", "i", "my", "your", "you", "to", "of", "in", "on",
  "for", "and", "or", "what", "how", "can", "will", "it", "this", "that", "with", "as", "be",
]);

function tokenize(s: string): string[] {
  return normalize(s).split(" ").filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

const INDEXED = CHAT_PROMPTS.map((p) => ({ prompt: p, tokens: new Set(tokenize(p.q)) }));

/** Simple keyword-overlap search — no external calls, no model. Returns the
 *  best-matching prompts for free-text input, best first. */
export function searchPrompts(query: string, limit = 5): ChatPrompt[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];

  const scored = INDEXED.map(({ prompt, tokens }) => {
    let score = 0;
    for (const t of qTokens) {
      if (tokens.has(t)) score += 2;
      else if ([...tokens].some((tok) => tok.startsWith(t) || t.startsWith(tok))) score += 1;
    }
    return { prompt, score };
  }).filter((r) => r.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((r) => r.prompt);
}

export function promptsForCategory(category: ChatCategory): ChatPrompt[] {
  return CHAT_PROMPTS.filter((p) => p.category === category);
}
