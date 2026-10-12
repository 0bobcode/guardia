package com.guardia.companion

import android.accessibilityservice.AccessibilityService
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Reads text as it appears inside the monitored AI apps (configured in
 * accessibility_service_config.xml) and forwards it to the paired parent's
 * Guardia dashboard. In Chrome it reads only Google search queries. This is
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
        val query = GoogleSearchParser.queryFrom(webViewText(root) ?: return) ?: return

        pendingRunnables[SEARCH_KEY]?.let { handler.removeCallbacks(it) }
        val runnable = Runnable {
            if (lastSentText[SEARCH_KEY] == query) return@Runnable
            lastSentText[SEARCH_KEY] = query
            val token = Prefs.token(this) ?: return@Runnable
            ApiClient.ingest(token, SEARCH_ID, "STUDENT", query)
        }
        pendingRunnables[SEARCH_KEY] = runnable
        handler.postDelayed(runnable, DEBOUNCE_MS)
    }

    /** Finds Chrome's page node and returns ONLY its own text (the page
     *  title/URL). Other nodes are only looked at for their class name; no
     *  other node's text — and nothing inside the page — is ever read. */
    private fun webViewText(node: AccessibilityNodeInfo, depth: Int = 0): String? {
        if (depth > MAX_TREE_DEPTH) return null
        if (node.className?.toString() == "android.webkit.WebView") return node.text?.toString()
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            webViewText(child, depth + 1)?.let { return it }
        }
        return null
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
        private val CHROME_STRINGS = listOf(
            "Ask Gemini",
            "Gemini can make mistakes, so double-check it",
            "Flash-Lite",
            "Just a sec…",
        )
    }
}
