package com.guardia.companion

import android.accessibilityservice.AccessibilityService
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Reads text as it appears inside the monitored AI apps (configured in
 * accessibility_service_config.xml) and forwards it to the paired parent's
 * Guardia dashboard. In Chrome it reads only Google searches and what Google
 * shows back on the results page, and nothing on any other page. This is
 * read-only: it cannot change what those apps display, block a reply, or
 * interact with them in any way.
 *
 * Content-changed events fire repeatedly while a reply is still streaming
 * in, so each (package, role) stream is debounced — only the text that's
 * still current after a short pause of no further changes gets sent, and
 * only if it's different from the last thing sent for that stream.
 */
class MonitorAccessibilityService : AccessibilityService() {

    private val handler = Handler(Looper.getMainLooper())
    private val pendingRunnables = HashMap<String, Runnable>()
    private val lastSentText = HashMap<String, String>()
    private var replyScheduledFor: String? = null

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return
        // Window-state-changed fires on app open/activity transitions; its
        // `text` is the window/activity title (e.g. the app's own name),
        // never message content. Real content arrives via the other two
        // configured event types as the conversation actually renders.
        val pkg = event.packageName?.toString() ?: return
        if (pkg == CHROME_PACKAGE) {
            // Chrome is a general web browser, so it must NEVER go through the
            // generic text extraction below — that would read whatever page is
            // open. It's handled separately and only ever yields a Google
            // search query.
            handleChrome()
            return
        }
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        if (Prefs.token(this) == null) return // not paired yet — nothing to send to

        val role = if (event.source?.isEditable == true) "STUDENT" else "ASSISTANT"
        val text = extractText(event)
        if (text.length < 3) return

        val streamKey = "$pkg:$role"
        pendingRunnables[streamKey]?.let { handler.removeCallbacks(it) }
        val runnable = Runnable { maybeSend(pkg, role, text) }
        pendingRunnables[streamKey] = runnable
        handler.postDelayed(runnable, DEBOUNCE_MS)
    }

    private fun handleChrome() {
        if (Prefs.token(this) == null) return
        val root = rootInActiveWindow ?: return
        if (root.packageName?.toString() != CHROME_PACKAGE) return
        val web = findWebView(root) ?: return
        val query = GoogleSearchParser.queryFrom(web.text?.toString() ?: return) ?: return

        pendingRunnables[SEARCH_KEY]?.let { handler.removeCallbacks(it) }
        val runnable = Runnable {
            if (lastSentText[SEARCH_KEY] == query) return@Runnable
            lastSentText[SEARCH_KEY] = query
            val token = Prefs.token(this) ?: return@Runnable
            ApiClient.ingest(token, SEARCH_ID, "STUDENT", query)
        }
        pendingRunnables[SEARCH_KEY] = runnable
        handler.postDelayed(runnable, DEBOUNCE_MS)

        scheduleReply(query)
    }

    /** Once per search, a few seconds after it's first seen (so the results
     *  have rendered), sends what Google showed back. This is the ONLY place
     *  page text is read, and only inside a page already recognised as a
     *  Google results page for this exact query. */
    private fun scheduleReply(query: String) {
        if (replyScheduledFor == query) return
        replyScheduledFor = query
        handler.postDelayed({
            val token = Prefs.token(this) ?: return@postDelayed
            val root = rootInActiveWindow ?: return@postDelayed
            if (root.packageName?.toString() != CHROME_PACKAGE) return@postDelayed
            val web = findWebView(root) ?: return@postDelayed
            // The user moved on to something else — don't read that page.
            if (GoogleSearchParser.queryFrom(web.text?.toString() ?: return@postDelayed) != query) return@postDelayed
            val lines = ArrayList<String>()
            collectVisibleText(web, lines, intArrayOf(0))
            val reply = GoogleSearchParser.replyFrom(lines) ?: return@postDelayed
            ApiClient.ingest(token, SEARCH_ID, "ASSISTANT", reply)
        }, REPLY_DELAY_MS)
    }

    /** Finds Chrome's page node. Other nodes are only looked at for their
     *  class name here. */
    private fun findWebView(node: AccessibilityNodeInfo, depth: Int = 0): AccessibilityNodeInfo? {
        if (depth > MAX_TREE_DEPTH) return null
        if (node.className?.toString() == "android.webkit.WebView") return node
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            findWebView(child, depth + 1)?.let { return it }
        }
        return null
    }

    private fun collectVisibleText(node: AccessibilityNodeInfo, out: MutableList<String>, visited: IntArray, depth: Int = 0) {
        if (depth > MAX_PAGE_DEPTH || visited[0] >= MAX_PAGE_NODES) return
        visited[0]++
        if (!node.isShowingHintText) node.text?.toString()?.takeIf { it.isNotBlank() }?.let { out.add(it) }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            collectVisibleText(child, out, visited, depth + 1)
        }
    }

    private fun maybeSend(pkg: String, role: String, text: String) {
        val streamKey = "$pkg:$role"
        if (lastSentText[streamKey] == text) return
        lastSentText[streamKey] = text
        val token = Prefs.token(this) ?: return
        ApiClient.ingest(token, pkg, role, text)
    }

    /** Prefers the event's own text (reliable for an edited input field);
     *  falls back to walking the changed node's subtree, which is where a
     *  freshly rendered reply bubble's text actually lives. */
    private fun extractText(event: AccessibilityEvent): String {
        val direct = event.text?.joinToString(" ") { it.toString() }?.trim().orEmpty()
        if (direct.isNotEmpty()) return direct

        val root = event.source ?: return ""
        val sb = StringBuilder()
        collectText(root, sb)
        return sb.toString().trim()
    }

    private fun collectText(node: AccessibilityNodeInfo, sb: StringBuilder, depth: Int = 0) {
        if (depth > MAX_TREE_DEPTH) return
        // A node showing its hint/placeholder (e.g. an empty "Ask Gemini"
        // input box) exposes that hint via the same .text property as real
        // typed content — without this check, a message send that clears
        // the input gets misread as a follow-up message reading the hint.
        // Fixed UI chrome (disclaimers, model badges, status text) shows up
        // both as its own isolated node AND concatenated into a shared
        // header node alongside other text, so this strips each known
        // chrome phrase out of whatever the node's text turns out to be,
        // rather than only matching nodes that contain nothing else.
        if (!node.isShowingHintText) {
            var text = node.text?.toString().orEmpty()
            for (chrome in CHROME_STRINGS) {
                text = text.replace(chrome, "")
            }
            text = text.trim()
            if (text.isNotBlank()) sb.append(text).append(' ')
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            collectText(child, sb, depth + 1)
        }
    }

    override fun onInterrupt() {}

    companion object {
        private const val DEBOUNCE_MS = 1200L
        private const val MAX_TREE_DEPTH = 12
        private const val CHROME_PACKAGE = "com.android.chrome"
        // Same identifier the browser extension uses, so the server treats
        // searches from both the same way.
        private const val SEARCH_ID = "google.com/search"
        private const val SEARCH_KEY = "chrome:google-search"
        private const val REPLY_DELAY_MS = 3500L
        private const val MAX_PAGE_DEPTH = 40
        private const val MAX_PAGE_NODES = 600
        private val CHROME_STRINGS = listOf(
            "Ask Gemini",
            "Gemini can make mistakes, so double-check it",
            "Flash-Lite",
            "Just a sec…",
        )
    }
}
