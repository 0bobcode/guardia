// Shared observer logic, generic across sites — the actual DOM knowledge
// lives in sites/<name>.js's window.__guardiaSiteAdapter, loaded first.
//
// Mirrors the Android companion app's approach: watch for real content
// nodes (never scan the whole page), debounce while a reply is still
// streaming in, and only send text that's still current after a short
// pause — same shape as MonitorAccessibilityService.kt's design.
(() => {
  const adapter = window.__guardiaSiteAdapter;
  if (!adapter) return;

  const DEBOUNCE_MS = 1200;
  const pendingTimers = new WeakMap();
  const lastSentText = new WeakMap();

  function scheduleSend(node, role, extract) {
    clearTimeout(pendingTimers.get(node));
    const timer = setTimeout(() => {
      const text = extract(node);
      if (!text || text.length < 3) return;
      if (lastSentText.get(node) === text) return;
      lastSentText.set(node, text);
      chrome.runtime.sendMessage({
        type: "GUARDIA_MESSAGE",
        packageId: adapter.packageId,
        role,
        text,
      });
    }, DEBOUNCE_MS);
    pendingTimers.set(node, timer);
  }

  function handleNode(node) {
    if (adapter.isUserMessage(node)) {
      scheduleSend(node, "STUDENT", adapter.extractUserText);
    } else if (adapter.isAssistantMessage(node)) {
      scheduleSend(node, "ASSISTANT", adapter.extractAssistantText);
    }
  }

  function scanForMessageNodes(root) {
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (adapter.isUserMessage(root) || adapter.isAssistantMessage(root)) {
      handleNode(root);
    }
    // A whole new turn (query + response) often arrives as one wrapper
    // node, so also check descendants, not just the added node itself.
    root.querySelectorAll?.("*").forEach((el) => {
      if (adapter.isUserMessage(el) || adapter.isAssistantMessage(el)) handleNode(el);
    });
  }

  function nearestMessageNode(el) {
    let n = el;
    while (n && n !== document.body) {
      if (adapter.isUserMessage(n) || adapter.isAssistantMessage(n)) return n;
      n = n.parentElement;
    }
    return null;
  }

  function startObserving(container) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(scanForMessageNodes);
        // Streaming replies mutate text inside an *existing* model-response
        // node rather than adding a new one — re-schedule that node too.
        const changedEl = mutation.target.nodeType === Node.ELEMENT_NODE
          ? mutation.target
          : mutation.target.parentElement;
        const owner = changedEl ? nearestMessageNode(changedEl) : null;
        if (owner) handleNode(owner);
      }
    });
    observer.observe(container, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    const container = adapter.getContainer();
    if (container) {
      startObserving(container);
    } else {
      // The chat SPA hasn't finished mounting yet — keep checking rather
      // than giving up after one miss.
      setTimeout(init, 1000);
    }
  }

  init();
})();
