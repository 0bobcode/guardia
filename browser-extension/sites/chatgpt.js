// Site adapter for chatgpt.com — real selectors confirmed by inspecting a
// live conversation's DOM directly (not guessed). ChatGPT's current web
// shell ("Octane") is a rewrite unlike older/training-data ChatGPT markup —
// no `data-message-author-role`, no `.markdown` class on replies.
//
//   <ol data-conversation-transcript>
//     <li data-message-role="user">
//       <h4 data-message-attribution>You said:</h4>
//       ...<p data-user-message-copy>the typed text</p>...
//     </li>
//     <li data-message-role="assistant">
//       <h4 data-message-attribution>ChatGPT said:</h4>
//       ...<div data-assistant-markdown>the rendered reply</div>...
//     </li>
//   </ol>
//
// data-assistant-markdown holds only the reply's rendered markdown — the
// "ChatGPT said:" attribution and the copy/share action buttons sit
// outside it, so reading just this div (like Gemini's <message-content>)
// avoids capturing UI chrome.
window.__guardiaSiteAdapter = {
  packageId: location.hostname.includes("chat.openai.com") ? "chat.openai.com" : "chatgpt.com",

  getContainer() {
    return document.querySelector("[data-conversation-transcript]");
  },

  isUserMessage(node) {
    return node.tagName === "LI" && node.getAttribute("data-message-role") === "user";
  },

  isAssistantMessage(node) {
    return node.tagName === "LI" && node.getAttribute("data-message-role") === "assistant";
  },

  // A user turn can be multiple paragraphs (Shift+Enter) — each is its own
  // [data-user-message-copy], so join them rather than reading just the first.
  extractUserText(node) {
    const paras = node.querySelectorAll("[data-user-message-copy]");
    return Array.from(paras)
      .map((p) => p.innerText.trim())
      .filter(Boolean)
      .join("\n");
  },

  extractAssistantText(node) {
    const content = node.querySelector("[data-assistant-markdown]");
    return content ? content.innerText.trim() : "";
  },
};
