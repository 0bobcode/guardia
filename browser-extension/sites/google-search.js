// Google Search monitoring. Unlike the chat sites there's no conversation DOM
// to observe — a search is just its query. This reads ONLY the ?q= parameter
// of a results-page URL (e.g. google.com/search?q=how+do+volcanoes+work) and
// reports that text. It never reads the results, the page content, or any
// other Google page, and it only runs after a parent has paired the extension.
(() => {
  if (location.pathname !== "/search") return;

  const MAX_LEN = 500;
  let lastSent = null;

  function currentQuery() {
    const q = new URLSearchParams(location.search).get("q");
    return q ? q.trim().slice(0, MAX_LEN) : "";
  }

  function report() {
    const q = currentQuery();
    if (!q || q === lastSent) return;
    lastSent = q;
    try {
      chrome.runtime.sendMessage({
        type: "GUARDIA_MESSAGE",
        packageId: "google.com/search",
        role: "STUDENT",
        text: q,
      });
    } catch {
      // Extension was reloaded/updated while this tab was open — nothing to do.
    }
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
