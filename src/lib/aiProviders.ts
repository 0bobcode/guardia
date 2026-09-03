import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type ProviderId = "anthropic" | "openai" | "google";

export const PROVIDERS: { id: ProviderId; label: string; shortLabel: string; envVar: string; defaultModel: string }[] = [
  { id: "anthropic", label: "Claude (Anthropic)", shortLabel: "Claude", envVar: "ANTHROPIC_API_KEY", defaultModel: "claude-sonnet-5" },
  { id: "openai", label: "ChatGPT (OpenAI)", shortLabel: "ChatGPT", envVar: "OPENAI_API_KEY", defaultModel: "gpt-4o" },
  { id: "google", label: "Gemini (Google)", shortLabel: "Gemini", envVar: "GOOGLE_API_KEY", defaultModel: "gemini-2.5-flash" },
];

export function providerConnected(provider: ProviderId): boolean {
  const def = PROVIDERS.find((p) => p.id === provider);
  return !!(def && process.env[def.envVar]);
}

export function providerLabel(provider: string): string {
  return PROVIDERS.find((p) => p.id === provider)?.label ?? provider;
}

export function providerShortLabel(provider: string): string {
  return PROVIDERS.find((p) => p.id === provider)?.shortLabel ?? provider;
}

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropicClient;
}

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

async function callGoogle(model: string, systemPrompt: string, userMessage: string): Promise<string> {
  const key = process.env.GOOGLE_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 300 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/**
 * Generates a real reply from the configured model when a key is present.
 * Falls back to a clearly-labeled simulated reply otherwise — so the
 * calling code (and the product) work identically either way; only the
 * source of the text changes once a key is added.
 */
export async function generateAiReply(
  provider: string,
  model: string,
  systemPrompt: string,
  userMessage: string
): Promise<{ text: string; live: boolean }> {
  try {
    if (provider === "anthropic" && providerConnected("anthropic")) {
      const res = await getAnthropic().messages.create({
        model,
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });
      const block = res.content[0];
      return { text: block.type === "text" ? block.text : "", live: true };
    }

    if (provider === "openai" && providerConnected("openai")) {
      const res = await getOpenAI().chat.completions.create({
        model,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });
      return { text: res.choices[0]?.message?.content ?? "", live: true };
    }

    if (provider === "google" && providerConnected("google")) {
      const text = await callGoogle(model, systemPrompt, userMessage);
      return { text, live: true };
    }
  } catch {
    // Fall through to simulated reply — a real integration shouldn't take
    // down the product if the upstream model call fails.
  }

  return { text: simulateReply(userMessage), live: false };
}

const TUTOR_SYSTEM_PROMPT =
  "You are a friendly, encouraging K-12 tutor. Explain concepts step by step rather than just giving answers. Keep replies under 3 sentences.";

export { TUTOR_SYSTEM_PROMPT };

function simulateReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (/\d+\s*[x×*]\s*\d+/.test(lower) || /times|divided|plus|minus/.test(lower)) {
    return "Let's break that down step by step — what's the first part you're not sure about?";
  }
  if (/help|explain|understand/.test(lower)) {
    return "Sure — let's work through it together. Can you tell me what you've tried so far?";
  }
  return "That's a great question! Let's think about it together, one step at a time.";
}
