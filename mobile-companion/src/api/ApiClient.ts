import { Platform } from 'react-native';

/** Mirrors the native apps' ApiClient (ios-companion/ApiClient.swift,
 *  android-companion/ApiClient.kt) — same three endpoints, same shapes.
 *  Android's emulator needs the 10.0.2.2 host alias for the dev machine's
 *  localhost; iOS's simulator shares the Mac's own network stack so
 *  localhost works directly. Release builds always use the real deployment. */
const DEV_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3912',
  default: 'http://localhost:3912',
});
const PROD_BASE_URL = 'https://guardia-seven.vercel.app';

export const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;

async function post<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type PairResult = { token: string; studentName: string };

export const ApiClient = {
  async pairDevice(pairCode: string, deviceName: string): Promise<PairResult | null> {
    const json = await post<{ token?: string; studentName?: string }>('/api/device/pair', {
      pairCode,
      deviceName,
    });
    if (!json?.token) return null;
    return { token: json.token, studentName: json.studentName ?? 'your child' };
  },

  async ingest(token: string, packageName: string, role: string, text: string): Promise<boolean> {
    const json = await post<{ ok?: boolean }>('/api/device/ingest', { token, packageName, role, text });
    return json?.ok ?? false;
  },

  /** Reports a Screen Time threshold crossing — a minute count, never
   *  message content. `minutes` is the threshold just reached (e.g. 30),
   *  not a live running total. */
  async reportUsage(token: string, packageName: string, minutes: number): Promise<boolean> {
    const json = await post<{ ok?: boolean }>('/api/device/usage', { token, packageName, minutes });
    return json?.ok ?? false;
  },
};
