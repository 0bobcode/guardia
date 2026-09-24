import { execFile } from "node:child_process";
import path from "node:path";

// Runs Guardia's local "Ask Guardia" brief writer (scripts/ask_brief_ai.py)
// — a fully local, rule-based text generator with no model and no API key,
// so this always works offline and never costs anything to call. It's a
// plain child process, not a deployed service: if python3 isn't on PATH
// (e.g. some serverless hosts), this quietly returns null and the caller
// falls back to its own plain stats line — same graceful-degradation
// pattern used elsewhere in this codebase.

const SCRIPT_PATH = path.join(process.cwd(), "scripts", "ask_brief_ai.py");

export type BriefAiInput = {
  scope: "student" | "district";
  subject: string;
  question: string;
  windowDays: number;
  stats: { totalMessages: number; flaggedCount: number; blockedCount: number; topApp: string | null };
  highlights: { severity: string; title: string; detail: string }[];
};

export function runLocalBriefAi(input: BriefAiInput): Promise<string | null> {
  return new Promise((resolve) => {
    const child = execFile(
      "python3",
      [SCRIPT_PATH],
      { timeout: 3000 },
      (error, stdout) => {
        if (error) {
          resolve(null);
          return;
        }
        try {
          const parsed = JSON.parse(stdout);
          resolve(typeof parsed.summary === "string" && parsed.summary ? parsed.summary : null);
        } catch {
          resolve(null);
        }
      }
    );
    child.stdin?.write(JSON.stringify(input));
    child.stdin?.end();
  });
}
