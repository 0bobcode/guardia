package com.guardia.companion

import android.accessibilityservice.AccessibilityService
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * Reads text as it appears inside the monitored AI apps (configured in
 * accessibility_service_config.xml) and forwards it to the paired parent's
 * Guardia dashboard. This is read-only: it cannot change what those apps
 * display, block a reply, or interact with them in any way.
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
        val pkg = event.packageName?.toString() ?: return
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
        node.text?.let { if (it.isNotBlank()) sb.append(it).append(' ') }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            collectText(child, sb, depth + 1)
        }
    }

    override fun onInterrupt() {}

    companion object {
        private const val DEBOUNCE_MS = 1200L
        private const val MAX_TREE_DEPTH = 12
    }
}
