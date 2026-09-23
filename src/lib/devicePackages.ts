// Maps a device identifier — an Android package name (from the companion
// app's Accessibility Service) or a website hostname (from the browser
// extension's content script) — to the Guardia App this traffic should be
// scanned and logged against. Unrecognized identifiers are ignored — the
// device monitor only tracks apps/sites Guardia actually knows about.
export const KNOWN_PACKAGES: Record<string, string> = {
  "com.google.android.apps.bard": "Gemini",
  "com.google.android.apps.gemini": "Gemini",
  // Google has been consolidating Search/Assistant/Gemini into one app on
  // some devices/versions — the Gemini surface there is served from this
  // shared package rather than the standalone Gemini app.
  "com.google.android.googlequicksearchbox": "Gemini",
  "com.openai.chatgpt": "ChatGPT",
  "com.anthropic.claude": "Claude",
  // Browser extension identifiers (website hostnames, not package names).
  "gemini.google.com": "Gemini",
  "chatgpt.com": "ChatGPT",
  "chat.openai.com": "ChatGPT",
  "claude.ai": "Claude",
};

export function appNameForPackage(packageName: string): string | null {
  return KNOWN_PACKAGES[packageName] ?? null;
}
