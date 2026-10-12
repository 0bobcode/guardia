package com.guardia.companion

import java.net.URLDecoder

/**
 * Pulls a Google search query out of the text Chrome exposes for a page.
 *
 * Chrome reports a page's title (or its URL, when a page has no title) as the
 * text of the web-content node, so a results page shows up either as
 * "https://www.google.com/search?q=cats&..." or as "cats - Google Search".
 * Anything else — every other site, and every other Google page — returns
 * null. Nothing from the page's own content is ever involved.
 */
object GoogleSearchParser {
    private const val URL_PREFIX = "https://www.google.com/search"
    private const val TITLE_SUFFIX = " - Google Search"
    private const val MAX_LENGTH = 500
    private const val MAX_REPLY = 2000
    private const val MIN_REPLY = 40

    fun queryFrom(pageText: String): String? {
        val text = pageText.trim()
        val query = when {
            text.startsWith("$URL_PREFIX?") || text.startsWith("$URL_PREFIX/?") -> queryParam(text)
            text.endsWith(TITLE_SUFFIX) -> text.removeSuffix(TITLE_SUFFIX)
            else -> null
        }
        return query?.trim()?.take(MAX_LENGTH)?.takeIf { it.isNotEmpty() }
    }

    /**
     * Turns the visible text lines Chrome exposes on a Google results page
     * into one compact reply: trimmed, consecutive repeats dropped, capped.
     * Returns null when there isn't enough text to be a real results page.
     */
    fun replyFrom(lines: List<String>): String? {
        val out = StringBuilder()
        var last = ""
        for (raw in lines) {
            val line = raw.trim().replace(Regex("\\s+"), " ")
            if (line.length < 2 || line == last) continue
            if (out.length + line.length + 1 > MAX_REPLY) break
            if (out.isNotEmpty()) out.append('\n')
            out.append(line)
            last = line
        }
        return out.toString().takeIf { it.length >= MIN_REPLY }
    }

    private fun queryParam(url: String): String? {
        val qs = url.substringAfter('?', "").substringBefore('#')
        for (pair in qs.split('&')) {
            if (pair.startsWith("q=")) {
                return try {
                    URLDecoder.decode(pair.removePrefix("q="), "UTF-8")
                } catch (_: IllegalArgumentException) {
                    null
                }
            }
        }
        return null
    }
}
