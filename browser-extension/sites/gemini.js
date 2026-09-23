// Site adapter for gemini.google.com — real selectors confirmed by
// inspecting a live conversation's DOM directly (not guessed):
//
//   <user-query>...<p class="query-text-line">the typed text</p>...</user-query>
//   <model-response>...<message-content>the reply text</message-content>...</model-response>
//
// #chat-history is the stable scroll container both live inside; observing
// it (rather than something transient) survives new messages, edits, and
// the sidebar collapsing/expanding.
window.__guardiaSiteAdapter = {
  packageId: "gemini.google.com",

  getContainer() {
    return document.getElementById("chat-history");
  },

  isUserMessage(node) {
    return node.tagName === "USER-QUERY";
  },

  isAssistantMessage(node) {
    return node.tagName === "MODEL-RESPONSE";
  },

  // A user turn can be multiple lines (Shift+Enter) — each renders as its
  // own .query-text-line, so join them rather than reading just the first.
  extractUserText(node) {
    const lines = node.querySelectorAll(".query-text .query-text-line");
    return Array.from(lines)
      .map((l) => l.innerText.trim())
      .filter(Boolean)
      .join("\n");
  },

  // <message-content> holds only the rendered reply — no "Gemini said"
  // accessibility label, no disclaimer, no model-name badge mixed in.
  extractAssistantText(node) {
    const content = node.querySelector("message-content");
    return content ? content.innerText.trim() : "";
  },
};
