// Site adapter for claude.ai — UNVERIFIED. claude.ai requires sign-in for
// any use (no anonymous chat like chatgpt.com), so unlike gemini.js and
// chatgpt.js — whose selectors were confirmed against a real live
// conversation's DOM — these are a best-effort guess from commonly
// documented/observed claude.ai markup, shipped without live verification
// at the user's explicit request. Test this against a real logged-in
// conversation before trusting it; these selectors are exactly the kind
// that silently break when a site's UI changes (see chatgpt.js's header
// comment for a real example of that happening).
window.__guardiaSiteAdapter = {
  packageId: "claude.ai",

  getContainer() {
    // No confirmed stable scroll-container id/attribute — falling back to
    // <main>, which every modern web app has, at the cost of observing a
    // slightly wider subtree than strictly necessary.
    return document.querySelector("main");
  },

  isUserMessage(node) {
    return node.getAttribute?.("data-testid") === "user-message";
  },

  isAssistantMessage(node) {
    // font-claude-message is the class Claude's own rendered-markdown
    // reply container has used across several UI revisions.
    return typeof node.className === "string" && node.className.split(/\s+/).includes("font-claude-message");
  },

  extractUserText(node) {
    return node.innerText?.trim() ?? "";
  },

  extractAssistantText(node) {
    return node.innerText?.trim() ?? "";
  },
};
