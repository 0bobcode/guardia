// Site adapter for chatgpt.com — ChatGPT serves TWO different web UIs
// depending on account state, confirmed by inspecting both live (not
// guessed): an anonymous/guest session gets a newer shell ("Octane") with
// <li data-message-role>; a signed-in account gets the older/classic
// structure below, which is what actually matters for real usage since a
// monitored child's account is always signed in.
//
// Classic (signed-in) structure:
//   <section data-testid="conversation-turn-N" data-turn="user|assistant">
//     ...<div data-message-author-role="user" data-message-id="...">the text</div>...
//   </section>
//
// Octane (anonymous) structure:
//   <ol data-conversation-transcript>
//     <li data-message-role="user">...<p data-user-message-copy>the text</p>...</li>
//     <li data-message-role="assistant">...<div data-assistant-markdown>the reply</div>...</li>
//   </ol>
//
// Both are handled here so this keeps working regardless of which shell a
// given session gets.
window.__guardiaSiteAdapter = {
  packageId: location.hostname.includes("chat.openai.com") ? "chat.openai.com" : "chatgpt.com",

  getContainer() {
    return (
      document.querySelector("[data-conversation-transcript]") ||
      document.querySelector("main") ||
      document.body
    );
  },

  isUserMessage(node) {
    if (node.tagName === "LI" && node.getAttribute("data-message-role") === "user") return true;
    return node.getAttribute?.("data-message-author-role") === "user";
  },

  isAssistantMessage(node) {
    if (node.tagName === "LI" && node.getAttribute("data-message-role") === "assistant") return true;
    return node.getAttribute?.("data-message-author-role") === "assistant";
  },

  // A user turn can be multiple paragraphs (Shift+Enter) — each is its own
  // [data-user-message-copy] in the Octane shell, so join them rather than
  // reading just the first. The classic shell just uses innerText directly.
  extractUserText(node) {
    const paras = node.querySelectorAll("[data-user-message-copy]");
    if (paras.length) {
      return Array.from(paras)
        .map((p) => p.innerText.trim())
        .filter(Boolean)
        .join("\n");
    }
    return node.innerText?.trim() ?? "";
  },

  extractAssistantText(node) {
    const content = node.querySelector("[data-assistant-markdown]");
    if (content) return content.innerText.trim();
    return node.innerText?.trim() ?? "";
  },
};
