import type { GradeBand, RiskLevel, ScanAction } from "@prisma/client";

export type CategoryDef = {
  key: string;
  label: string;
  /** Baseline severity used only to seed sensible default policies — actual
   *  behavior at runtime is driven entirely by the district's Policy rows. */
  defaultSeverity: "HIGH" | "MED" | "LOW";
  defaultKeywords: string[];
};

// The fixed taxonomy GuardRail scans against. Districts cannot add new
// categories (that needs a model review), but they fully control the
// keyword list, the enabled flag, and the resulting action per grade band
// via the Policy table — this is what the "Policies" screen edits.
export const CATEGORY_DEFS: CategoryDef[] = [
  {
    key: "self_harm",
    label: "Self-Harm / Suicide Risk",
    defaultSeverity: "HIGH",
    defaultKeywords: [
      "kill myself",
      "want to die",
      "end my life",
      "hurt myself",
      "cutting myself",
      "suicide",
      "not worth living",
    ],
  },
  {
    key: "violence_weapons",
    label: "Violence & Weapons",
    defaultSeverity: "HIGH",
    defaultKeywords: [
      "make a bomb",
      "build a gun",
      "how to hurt someone",
      "school shooting",
      "stab someone",
      "kill someone",
    ],
  },
  {
    key: "sexual_content",
    label: "Sexual Content",
    defaultSeverity: "HIGH",
    defaultKeywords: ["nude", "porn", "sexual photos", "naked pictures", "sexting"],
  },
  {
    key: "jailbreak_bypass",
    label: "Safety Bypass / Jailbreak Attempt",
    defaultSeverity: "HIGH",
    defaultKeywords: [
      "ignore your instructions",
      "ignore previous instructions",
      "pretend you have no rules",
      "bypass the filter",
      "get past the",
      "override your safety",
      "act as dan",
      "jailbreak",
    ],
  },
  {
    key: "drugs_alcohol",
    label: "Drugs & Alcohol",
    defaultSeverity: "MED",
    defaultKeywords: ["get high", "buy weed", "vape", "cocaine", "how to get drunk"],
  },
  {
    key: "hate_harassment",
    label: "Hate Speech & Harassment",
    defaultSeverity: "HIGH",
    defaultKeywords: ["racial slur", "hate group", "ethnic cleansing", "kill all"],
  },
  {
    key: "cyberbullying_distress",
    label: "Bullying & Emotional Distress",
    defaultSeverity: "MED",
    defaultKeywords: [
      "i hate this",
      "i hate you",
      "everyone hates me",
      "so stupid",
      "i'm worthless",
      "nobody likes me",
      "want to give up",
    ],
  },
  {
    key: "academic_dishonesty",
    label: "Academic Dishonesty",
    defaultSeverity: "LOW",
    defaultKeywords: [
      "write my essay for me",
      "do my homework for me",
      "give me the test answers",
      "take my test for me",
      "write this essay so it sounds like a kid wrote it",
    ],
  },
  {
    key: "personal_info_pii",
    label: "Personal Information Sharing",
    defaultSeverity: "MED",
    defaultKeywords: [
      "my home address is",
      "my phone number is",
      "my social security number",
      "my password is",
      "here's my address",
    ],
  },
];

export type PolicyRule = {
  category: string;
  keywords: string[];
  action: ScanAction;
  enabled: boolean;
};

export type ScanResult = {
  riskLevel: RiskLevel;
  action: ScanAction;
  matchedCategories: string[];
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function containsPhrase(haystack: string, phrase: string): boolean {
  const p = normalize(phrase);
  if (!p) return false;
  // word-boundary-ish match that still works for multi-word phrases
  const re = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(p)}(?:$|[^a-z0-9])`, "i");
  return re.test(` ${haystack} `);
}

const ACTION_SEVERITY: Record<ScanAction, number> = {
  PASSED: 0,
  FLAGGED: 1,
  BLOCKED: 2,
};

/**
 * The real detection core: given a raw query and the district's active
 * policy rules for a grade band, determines which safety categories match
 * and what the resulting risk level / action is. Pulls purely from `rules`
 * so editing Policy rows in the DB changes behavior immediately — no
 * hardcoded per-district logic.
 */
export function scanText(rawText: string, rules: PolicyRule[]): ScanResult {
  const text = normalize(rawText);
  const matched: { category: string; action: ScanAction }[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const hit = rule.keywords.some((kw) => containsPhrase(text, kw));
    if (hit) matched.push({ category: rule.category, action: rule.action });
  }

  if (matched.length === 0) {
    return { riskLevel: "NONE", action: "PASSED", matchedCategories: [] };
  }

  const worstAction = matched.reduce<ScanAction>(
    (acc, m) => (ACTION_SEVERITY[m.action] > ACTION_SEVERITY[acc] ? m.action : acc),
    "PASSED"
  );

  const riskLevel: RiskLevel =
    worstAction === "BLOCKED" ? "HIGH" : worstAction === "FLAGGED" ? "MED" : "NONE";

  return {
    riskLevel,
    action: worstAction,
    matchedCategories: [...new Set(matched.map((m) => m.category))],
  };
}

export function defaultActionForSeverity(
  severity: "HIGH" | "MED" | "LOW",
  gradeBand: GradeBand
): ScanAction {
  if (severity === "HIGH") return "BLOCKED";
  if (severity === "MED") return "FLAGGED";
  // LOW severity: stricter for younger grade bands, lenient for high schoolers
  return gradeBand === "G9_12" ? "PASSED" : "FLAGGED";
}
