// Parent-requested screen sharing, from the browser extension side.
//
// The child is always told: a real Chrome notification (not just something
// inside a web page, which a page's own script could hide) asks them to
// Allow or Decline, every single time, and nothing is captured before they
// answer. While it's running, the toolbar badge says "LIVE" with a red
// background for as long as it's active, and a second, undismissable
// notification offers a one-click way to stop it. This file only ever runs
// inside the extension's own background worker — a web page cannot call it.

const NOTIF_ASK = "guardia-screen-ask";
const NOTIF_LIVE = "guardia-screen-live";
const POLL_ALARM = "guardia-screen-poll";
const CAPTURE_INTERVAL_MS = 1500;

let captureTimer = null;
let activeSessionId = null;
let activeNeedsPasscode = false;
let knownRequestId = null;

async function getToken() {
  const { guardiaToken } = await chrome.storage.local.get("guardiaToken");
  return guardiaToken || null;
}

async function api(path, body) {
  const res = await fetch(`https://guardia-seven.vercel.app${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok ? res.json() : null;
}

/** Called on a recurring alarm so it keeps working even if the service
 *  worker was unloaded in between — nothing here depends on in-memory state
 *  surviving, except the current capture loop while one is running. */
async function pollForRequest() {
  const token = await getToken();
  if (!token) return;

  const result = await api("/api/device/screen/poll", { token });
  if (!result) return;

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
    askChild(result.request);
  }
  if (!result.request && knownRequestId) {
    knownRequestId = null;
    chrome.notifications.clear(NOTIF_ASK);
  }
}

function askChild(request) {
  chrome.notifications.create(NOTIF_ASK, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Allow your parent to view your screen?",
    message: `${request.parentName} wants to see what's on your screen right now, just for this browser tab. You can say no.`,
    buttons: [{ title: "Allow" }, { title: "Decline" }],
    priority: 2,
    requireInteraction: true,
  });
}

chrome.notifications.onButtonClicked.addListener(async (notifId, buttonIndex) => {
  if (notifId !== NOTIF_ASK) return;
  const id = knownRequestId;
  knownRequestId = null;
  chrome.notifications.clear(NOTIF_ASK);
  if (!id) return;

  const token = await getToken();
  if (!token) return;
  const accept = buttonIndex === 0;
  const result = await api("/api/device/screen/respond", { token, id, accept });
  if (result?.accepted) {
    const poll = await api("/api/device/screen/poll", { token });
    startCapturing(id, poll?.active?.endNeedsPasscode ?? false);
  }
});

function startCapturing(sessionId, needsPasscode) {
  if (captureTimer) return;
  activeSessionId = sessionId;
  activeNeedsPasscode = needsPasscode;
  chrome.action.setBadgeText({ text: "LIVE" });
  chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
  chrome.notifications.create(NOTIF_LIVE, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Your parent is viewing this tab",
    message: needsPasscode
      ? "It will stop on its own soon. Ask your parent for the Screen Time passcode to stop it sooner."
      : "Click Stop sharing to end it whenever you want.",
    buttons: needsPasscode ? undefined : [{ title: "Stop sharing" }],
    priority: 2,
    requireInteraction: true,
  });
  captureOnce();
  captureTimer = setInterval(captureOnce, CAPTURE_INTERVAL_MS);
}

chrome.notifications.onButtonClicked.addListener(async (notifId) => {
  if (notifId !== NOTIF_LIVE || activeNeedsPasscode) return;
  const token = await getToken();
  if (token && activeSessionId) await api("/api/device/screen/end", { token, id: activeSessionId });
  stopCapturingLocally();
});

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
    if (!tab) return;
    dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "jpeg", quality: 55 });
  } catch {
    return; // e.g. a chrome:// tab is focused, or the window lost focus — just skip this tick
  }

  const jpegBytes = await (await fetch(dataUrl)).arrayBuffer();
  let result;
  try {
    const res = await fetch(`https://guardia-seven.vercel.app/api/device/screen/frame?id=${activeSessionId}`, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg", "x-guardia-token": token },
      body: jpegBytes,
    });
    result = res.ok ? await res.json() : null;
  } catch {
    return; // transient network error — try again next tick
  }
  if (result && result.active === false) stopCapturingLocally(); // parent ended it, or it timed out
}

export function initScreenShare() {
  chrome.alarms.create(POLL_ALARM, { periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === POLL_ALARM) pollForRequest();
  });
  pollForRequest();
}

export async function stopScreenShareFromPopup(passcode) {
  const token = await getToken();
  if (!token || !activeSessionId) return { ok: false, error: "Nothing is being shared." };
  const res = await fetch("https://guardia-seven.vercel.app/api/device/screen/end", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, id: activeSessionId, passcode: passcode || "" }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, error: json?.error || "Couldn't stop it." };
  stopCapturingLocally();
  return { ok: true };
}

export function screenShareStatus() {
  return { active: !!captureTimer, needsPasscode: activeNeedsPasscode };
}
