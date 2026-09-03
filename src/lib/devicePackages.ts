// Maps an Android package name (as reported by the companion app's
// Accessibility Service) to the Guardia App this traffic should be scanned
// and logged against. Unrecognized packages are ignored — the device
// monitor only tracks apps Guardia actually knows about.
export const KNOWN_PACKAGES: Record<string, string> = {
  "com.google.android.apps.bard": "Gemini",
  "com.google.android.apps.gemini": "Gemini",
  "com.openai.chatgpt": "ChatGPT",
  "com.anthropic.claude": "Claude",
};

export function appNameForPackage(packageName: string): string | null {
  return KNOWN_PACKAGES[packageName] ?? null;
}
