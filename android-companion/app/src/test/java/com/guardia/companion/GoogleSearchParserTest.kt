package com.guardia.companion

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class GoogleSearchParserTest {
    @Test fun parsesQueryFromSearchUrl() =
        assertEquals("how do volcanoes work", GoogleSearchParser.queryFrom("https://www.google.com/search?q=how+do+volcanoes+work&sei=abc"))

    @Test fun decodesPercentEncoding() =
        assertEquals("what's 5 + 5?", GoogleSearchParser.queryFrom("https://www.google.com/search?hl=en&q=what%27s+5+%2B+5%3F&oq=x"))

    @Test fun parsesQueryFromResultsTitle() =
        assertEquals("how do volcanoes work", GoogleSearchParser.queryFrom("how do volcanoes work - Google Search"))

    @Test fun keepsDashesInsideTheQuery() =
        assertEquals("spider-man - the movie", GoogleSearchParser.queryFrom("spider-man - the movie - Google Search"))

    @Test fun ignoresEveryOtherPage() {
        assertNull(GoogleSearchParser.queryFrom("https://www.google.com/maps?q=pizza"))
        assertNull(GoogleSearchParser.queryFrom("https://www.google.com/"))
        assertNull(GoogleSearchParser.queryFrom("https://example.com/search?q=cats"))
        assertNull(GoogleSearchParser.queryFrom("Google"))
        assertNull(GoogleSearchParser.queryFrom("my homework - Docs"))
        assertNull(GoogleSearchParser.queryFrom(""))
    }

    @Test fun ignoresEmptyQueries() {
        assertNull(GoogleSearchParser.queryFrom("https://www.google.com/search?q="))
        assertNull(GoogleSearchParser.queryFrom("https://www.google.com/search?hl=en"))
        assertNull(GoogleSearchParser.queryFrom(" - Google Search"))
    }

    @Test fun capsVeryLongQueries() =
        assertEquals(500, GoogleSearchParser.queryFrom("https://www.google.com/search?q=" + "a".repeat(900))!!.length)
}
