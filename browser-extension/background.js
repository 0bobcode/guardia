// Service worker: owns the pairing token and all network calls to Guardia's
// backend. Content scripts never hold the token or make the request
// directly — keeping this in one place means the popup (pairing) and every
// site's content script share the same stored credential and endpoint.
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
  await chrome.storage.local.set({
    guardiaToken: json.token,
    guardiaStudentName: json.studentName ?? "your child",
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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GUARDIA_MESSAGE") {
    ingest(message.packageId, message.role, message.text);
    return false;
  }
  if (message.type === "GUARDIA_PAIR") {
    pairDevice(message.pairCode).then(sendResponse);
    return true; // keep the message channel open for the async response
  }
  if (message.type === "GUARDIA_STATUS") {
    chrome.storage.local.get(["guardiaToken", "guardiaStudentName"]).then((s) =>
      sendResponse({ paired: !!s.guardiaToken, studentName: s.guardiaStudentName ?? null })
    );
    return true;
  }
  if (message.type === "GUARDIA_UNPAIR") {
    chrome.storage.local.remove(["guardiaToken", "guardiaStudentName"]).then(() => sendResponse(true));
    return true;
  }
  return false;
});
