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

    fun queryFrom(pageText: String): String? {
        val text = pageText.trim()
        val query = when {
            text.startsWith("$URL_PREFIX?") || text.startsWith("$URL_PREFIX/?") -> queryParam(text)
            text.endsWith(TITLE_SUFFIX) -> text.removeSuffix(TITLE_SUFFIX)
            else -> null
        }
        return query?.trim()?.take(MAX_LENGTH)?.takeIf { it.isNotEmpty() }
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
