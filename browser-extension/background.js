const BASE_URL = "https://guardia-seven.vercel.app";

async function getToken() {
  const { guardiaToken } = await chrome.storage.local.get("guardiaToken");
  return guardiaToken || null;
}

async function pairDevice(pairCode) {
  const res = await fetch(`${BASE_URL}/api/device/pair`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pairCode, deviceName: "Browser extension" }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.token) return null;
  await chrome.storage.local.set({ guardiaToken: json.token, guardiaStudentName: json.studentName ?? "your child" });
  return json;
}

async function ingest(packageId, role, text) {
  const token = await getToken();
  if (!token) return;
  try {
    await fetch(`${BASE_URL}/api/device/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, packageName: packageId, role, text }),
    });
  } catch {}
}

// The unpair password, if the parent set one from TrustEd's Settings page,
// lives server-side on the DevicePairing row — never in this extension's
// storage — so it can be set/changed remotely without touching this browser.
async function tryUnpair(password) {
  const token = await getToken();
  if (!token) return { ok: true };
  try {
    const res = await fetch(`${BASE_URL}/api/device/unpair`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: password || "" }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: json?.error || "Couldn't unpair." };
  } catch {
    return { ok: false, error: "Couldn't reach Guardia — check your connection and try again." };
  }
  await chrome.storage.local.remove(["guardiaToken", "guardiaStudentName"]);
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GUARDIA_MESSAGE") {
    ingest(message.packageId, message.role, message.text);
    return false;
  }
  if (message.type === "GUARDIA_PAIR") {
    pairDevice(message.pairCode).then(sendResponse);
    return true;
  }
  if (message.type === "GUARDIA_STATUS") {
    chrome.storage.local.get(["guardiaToken", "guardiaStudentName"]).then((s) =>
      sendResponse({ paired: !!s.guardiaToken, studentName: s.guardiaStudentName ?? null })
    );
    return true;
  }
  if (message.type === "GUARDIA_UNPAIR") {
    tryUnpair(message.password).then(sendResponse);
    return true;
  }
  return false;
});
