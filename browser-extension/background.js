console.log("[Guardia] background service worker loaded");

// A visible-without-DevTools sign that this script actually ran: a small
// green dot on the toolbar icon. Cleared the instant anything else sets the
// badge (pairing status, LIVE sharing), so it only ever means "the script
// started, nothing else has happened yet" — not an ongoing status.
chrome.action.setBadgeText({ text: "•" });
chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });

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

// ===== Parent-requested screen sharing =====
//
// The child is always told: a real Chrome notification (not just something
// inside a web page, which a page's own script could hide) asks them to
// Allow or Decline, every single time, and nothing is captured before they
// answer. While it's running, the toolbar badge says "LIVE" with a red
// background for as long as it's active, and a second, undismissable
// notification offers a one-click way to stop it.
//
// Plain script (not an ES module) on purpose — a classic background script
// is the most broadly compatible way to run a Manifest V3 service worker.

const NOTIF_ASK = "guardia-screen-ask";
const NOTIF_LIVE = "guardia-screen-live";
const POLL_ALARM = "guardia-screen-poll";
const CAPTURE_INTERVAL_MS = 1500;

let captureTimer = null;
let activeSessionId = null;
let activeNeedsPasscode = false;
let knownRequestId = null;

// Visible only in this extension's own service-worker console
// (chrome://extensions → Guardia Companion → "service worker").
const screenLog = (...args) => console.log("[Guardia screen]", ...args);

async function screenApi(path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      screenLog(`${path} -> HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    screenLog(`${path} -> network error:`, err?.message || err);
    return null;
  }
}

/** Called on a recurring alarm so it keeps working even if the service
 *  worker was unloaded in between — nothing here depends on in-memory state
 *  surviving, except the current capture loop while one is running. */
async function pollForScreenRequest() {
  const token = await getToken();
  if (!token) {
    screenLog("poll skipped — not paired (no token in storage)");
    return;
  }

  const result = await screenApi("/api/device/screen/poll", { token });
  if (!result) {
    screenLog("poll got no result (see error above)");
    return;
  }
  screenLog(
    "poll ->",
    result.request ? `request from ${result.request.parentName}` : result.active ? "active session" : "nothing pending"
  );

  if (result.active && !captureTimer) {
    // We were mid-session when the worker got unloaded — resume sending
    // frames rather than leaving the parent's view stuck.
    startCapturing(result.active.id, result.active.endNeedsPasscode);
    return;
  }
  if (!result.active && captureTimer) {
    stopCapturingLocally(); // ended on the server (parent stopped it, or it timed out)
  }

  if (result.request && result.request.id !== knownRequestId) {
    knownRequestId = result.request.id;
    askChildForScreenShare(result.request);
  }
  if (!result.request && knownRequestId) {
    knownRequestId = null;
    chrome.notifications.clear(NOTIF_ASK);
  }
}

function logNotificationResult(label) {
  return (notificationId) => {
    if (chrome.runtime.lastError) {
      screenLog(`${label} FAILED:`, chrome.runtime.lastError.message);
    } else {
      screenLog(`${label} created ok, id=${notificationId}`);
    }
  };
}

function askChildForScreenShare(request) {
  screenLog("showing consent notification for request", request.id);
  chrome.notifications.create(
    NOTIF_ASK,
    {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Allow your parent to view your screen?",
      message: `${request.parentName} wants to see what's on this tab right now. Photos will be saved for them to look at later too. You can say no.`,
      buttons: [{ title: "Allow" }, { title: "Decline" }],
      priority: 2,
      requireInteraction: true,
    },
    logNotificationResult("ask notification")
  );
}

function startCapturing(sessionId, needsPasscode) {
  if (captureTimer) return;
  screenLog("sharing started, session", sessionId);
  activeSessionId = sessionId;
  activeNeedsPasscode = needsPasscode;
  chrome.action.setBadgeText({ text: "LIVE" });
  chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
  chrome.notifications.create(
    NOTIF_LIVE,
    {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Your parent is viewing this tab",
      message: needsPasscode
        ? "It will stop on its own soon. Ask your parent for the Screen Time passcode to stop it sooner."
        : "Click Stop sharing to end it whenever you want.",
      buttons: needsPasscode ? undefined : [{ title: "Stop sharing" }],
      priority: 2,
      requireInteraction: true,
    },
    logNotificationResult("live notification")
  );
  captureOnce();
  captureTimer = setInterval(captureOnce, CAPTURE_INTERVAL_MS);
}

function stopCapturingLocally() {
  if (captureTimer) clearInterval(captureTimer);
  captureTimer = null;
  activeSessionId = null;
  activeNeedsPasscode = false;
  chrome.action.setBadgeText({ text: "" });
  chrome.notifications.clear(NOTIF_LIVE);
}

async function captureOnce() {
  if (!activeSessionId) return;
  const token = await getToken();
  if (!token) return stopCapturingLocally();

  let dataUrl;
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab) return screenLog("capture skipped — no focused tab found");
    dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "jpeg", quality: 55 });
  } catch (err) {
    return screenLog("capture skipped —", err?.message || err); // e.g. a chrome:// tab is focused, or the window lost focus
  }

  const jpegBytes = await (await fetch(dataUrl)).arrayBuffer();
  let result;
  try {
    const res = await fetch(`${BASE_URL}/api/device/screen/frame?id=${activeSessionId}`, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg", "x-guardia-token": token },
      body: jpegBytes,
    });
    result = res.ok ? await res.json() : null;
    if (!res.ok) screenLog(`frame upload -> HTTP ${res.status}`);
  } catch (err) {
    return screenLog("frame upload — network error:", err?.message || err); // try again next tick
  }
  if (result && result.active === false) {
    screenLog("server ended the session (timeout, or parent stopped it)");
    stopCapturingLocally();
  }
}

async function stopScreenShareFromPopup(passcode) {
  const token = await getToken();
  if (!token || !activeSessionId) return { ok: false, error: "Nothing is being shared." };
  const res = await fetch(`${BASE_URL}/api/device/screen/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, id: activeSessionId, passcode: passcode || "" }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, error: json?.error || "Couldn't stop it." };
  stopCapturingLocally();
  return { ok: true };
}

chrome.notifications.onButtonClicked.addListener(async (notifId, buttonIndex) => {
  if (notifId === NOTIF_ASK) {
    const id = knownRequestId;
    knownRequestId = null;
    chrome.notifications.clear(NOTIF_ASK);
    if (!id) return;

    const token = await getToken();
    if (!token) return;
    const accept = buttonIndex === 0;
    screenLog(accept ? "child chose Allow" : "child chose Decline");
    const result = await screenApi("/api/device/screen/respond", { token, id, accept });
    if (result?.accepted) {
      const poll = await screenApi("/api/device/screen/poll", { token });
      startCapturing(id, poll?.active?.endNeedsPasscode ?? false);
    }
    return;
  }
  if (notifId === NOTIF_LIVE && !activeNeedsPasscode) {
    const token = await getToken();
    if (token && activeSessionId) await screenApi("/api/device/screen/end", { token, id: activeSessionId });
    stopCapturingLocally();
  }
});

function initScreenShare() {
  screenLog("starting up");
  // Chrome's own, authoritative read of whether it can show a notification
  // right now — independent of what any settings panel appears to say.
  chrome.notifications.getPermissionLevel((level) => {
    screenLog("notification permission level:", level);
    if (level !== "granted") {
      chrome.action.setBadgeText({ text: "OFF" });
      chrome.action.setBadgeBackgroundColor({ color: "#eab308" });
    }
  });
  chrome.alarms.create(POLL_ALARM, { periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === POLL_ALARM) {
      screenLog("alarm fired, polling");
      pollForScreenRequest();
    }
  });
  pollForScreenRequest();
}

function screenShareStatus() {
  return { active: !!captureTimer, needsPasscode: activeNeedsPasscode };
}

// ===== Message routing =====

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
  if (message.type === "GUARDIA_SCREEN_STATUS") {
    sendResponse(screenShareStatus());
    return false;
  }
  if (message.type === "GUARDIA_SCREEN_STOP") {
    stopScreenShareFromPopup(message.passcode).then(sendResponse);
    return true;
  }
  return false;
});

initScreenShare();
