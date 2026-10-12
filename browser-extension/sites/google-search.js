// Google Search monitoring. Reports two things for a paired child:
//   1. the search itself — the ?q= parameter of a results-page URL, and
//   2. what Google showed back — the AI Overview text (when there is one) and
//      the top few results' title, site name and snippet, as one summary.
// It only runs on google.com/search results pages, and only after a parent has
// paired the extension. It never reads other Google pages or other sites, never
// sends result URLs (just the site name), and caps everything it sends.
(() => {
  if (location.pathname !== "/search") return;

  const MAX_QUERY = 500;
  const MAX_AI = 1200;
  const MAX_SNIPPET = 220;
  const MAX_RESULTS = 5;

  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

  function currentQuery() {
    const q = new URLSearchParams(location.search).get("q");
    return q ? q.trim().slice(0, MAX_QUERY) : "";
  }

  function send(role, text) {
    try {
      chrome.runtime.sendMessage({ type: "GUARDIA_MESSAGE", packageId: "google.com/search", role, text });
    } catch {
      // Extension was reloaded/updated while this tab was open — nothing to do.
    }
  }

  // The AI Overview has no stable class names, so find it by its own heading.
  function aiOverviewText() {
    const heading = Array.from(document.querySelectorAll("[role='heading'], div")).find(
      (el) => el.children.length === 0 && clean(el.textContent) === "AI Overview"
    );
    if (!heading) return "";
    let node = heading;
    for (let i = 0; i < 6 && node.parentElement; i++) {
      node = node.parentElement;
      if (clean(node.innerText).length > 200) break;
    }
    const text = clean(node.innerText).replace(/^AI Overview\s*/i, "");
    return text.length > 40 ? text.slice(0, MAX_AI) : "";
  }

  function topResults() {
    const results = [];
    for (const h3 of document.querySelectorAll("#rso h3")) {
      if (results.length >= MAX_RESULTS) break;
      const title = clean(h3.innerText);
      if (!title) continue;
      const link = h3.closest("a");
      let site = "";
      try {
        site = link ? new URL(link.href).hostname.replace(/^www\./, "") : "";
      } catch {
        // malformed href — leave the site blank
      }
      const block = h3.closest("[data-hveid]") || h3.parentElement;
      const snippetEl = block && block.querySelector("[data-sncf], .VwiC3b");
      const snippet = clean(snippetEl && snippetEl.innerText).slice(0, MAX_SNIPPET);
      results.push(`${results.length + 1}. ${title}${site ? ` (${site})` : ""}${snippet ? ` — ${snippet}` : ""}`);
    }
    return results;
  }

  function googleReply() {
    const parts = [];
    const ai = aiOverviewText();
    if (ai) parts.push(`AI Overview: ${ai}`);
    const results = topResults();
    if (results.length) parts.push(`Top results:\n${results.join("\n")}`);
    return parts.join("\n\n");
  }

  // Results and the AI Overview render a moment after the page loads (and the
  // overview streams in), so wait until two reads a second apart agree.
  function reportReplyWhenSettled(query) {
    let previous = "";
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (currentQuery() !== query) return clearInterval(timer); // user searched again
      const reply = googleReply();
      if (reply && reply === previous) {
        clearInterval(timer);
        send("ASSISTANT", reply);
      } else if (tries >= 12) {
        clearInterval(timer);
        if (reply) send("ASSISTANT", reply);
      }
      previous = reply;
    }, 1000);
  }

  let lastSent = null;
  function report() {
    const q = currentQuery();
    if (!q || q === lastSent) return;
    lastSent = q;
    send("STUDENT", q);
    reportReplyWhenSettled(q);
  }

  report();

  // Google can change the query without a full page load (results tabs, "AI
  // Mode", the search box on a results page), so watch the URL too.
  let lastHref = location.href;
  setInterval(() => {
    if (location.href === lastHref) return;
    lastHref = location.href;
    report();
  }, 800);
})();
