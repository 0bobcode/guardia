// Service worker: owns the pairing token and all network calls to Guardia's
// backend. Content scripts never hold the token or make the request
// directly — keeping this in one place means the popup (pairing) and every
// site's content script share the same stored credential and endpoint.
const BASE_URL = "https://guardia-seven.vercel.app";

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getToken() {
  const { guardiaToken } = await chrome.storage.local.get("guardiaToken");
  return guardiaToken || null;
}

// `password` gates this extension's own "Unpair" button in the popup —
// it is NOT a security boundary against Chrome itself. Nothing running in
// an extension can intercept or block Chrome's native Remove/toggle-off
// controls in chrome://extensions; that's a deliberate Chrome restriction
// (otherwise malicious extensions could make themselves unremovable). This
// only stops a casual "just click Unpair" bypass, same spirit as a Screen
// Time passcode not being real OS-level security either.
async function pairDevice(pairCode, password) {
  const res = await fetch(`${BASE_URL}/api/device/pair`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pairCode, deviceName: "Browser extension" }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.token) return null;
  const passwordHash = password ? await sha256Hex(password) : null;
  await chrome.storage.local.set({
    guardiaToken: json.token,
    guardiaStudentName: json.studentName ?? "your child",
    guardiaUnpairPasswordHash: passwordHash,
  });
  return json;
}

async function ingest(packageId, role, text) {
  const token = await getToken();
  if (!token) return; // not paired yet — nothing to send to

  try {
    await fetch(`${BASE_URL}/api/device/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, packageName: packageId, role, text }),
    });
  } catch {
    // Fire-and-forget, matching the Android/iOS companion apps — a dropped
    // report isn't retried, since the next message will supersede it soon.
  }
}

async function tryUnpair(password) {
  const { guardiaUnpairPasswordHash } = await chrome.storage.local.get("guardiaUnpairPasswordHash");
  if (guardiaUnpairPasswordHash) {
    const attemptHash = await sha256Hex(password || "");
    if (attemptHash !== guardiaUnpairPasswordHash) {
      return { ok: false, error: "Incorrect password" };
    }
  }
  await chrome.storage.local.remove(["guardiaToken", "guardiaStudentName", "guardiaUnpairPasswordHash"]);
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GUARDIA_MESSAGE") {
    ingest(message.packageId, message.role, message.text);
    return false;
  }
  if (message.type === "GUARDIA_PAIR") {
    pairDevice(message.pairCode, message.password).then(sendResponse);
    return true; // keep the message channel open for the async response
  }
  if (message.type === "GUARDIA_STATUS") {
    chrome.storage.local
      .get(["guardiaToken", "guardiaStudentName", "guardiaUnpairPasswordHash"])
      .then((s) =>
        sendResponse({
          paired: !!s.guardiaToken,
          studentName: s.guardiaStudentName ?? null,
          hasPassword: !!s.guardiaUnpairPasswordHash,
        })
      );
    return true;
  }
  if (message.type === "GUARDIA_UNPAIR") {
    tryUnpair(message.password).then(sendResponse);
    return true;
  }
  return false;
});
