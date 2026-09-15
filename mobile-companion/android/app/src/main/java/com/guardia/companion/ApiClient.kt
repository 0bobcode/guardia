package com.guardia.companion

import android.util.Log
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/** Minimal JSON-over-HTTP client — no external networking library needed
 *  for a request this simple. All calls run on a single background
 *  executor so callers never block the calling thread. */
object ApiClient {
    private const val TAG = "GuardiaApi"
    private val executor = Executors.newSingleThreadExecutor()

    private fun postJson(path: String, body: JSONObject, onResult: (JSONObject?) -> Unit) {
        executor.execute {
            try {
                val url = URL(Prefs.BASE_URL + path)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.doOutput = true
                conn.setRequestProperty("Content-Type", "application/json")
                conn.connectTimeout = 8000
                conn.readTimeout = 8000

                OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }

                val code = conn.responseCode
                val stream = if (code in 200..299) conn.inputStream else conn.errorStream
                val text = stream?.bufferedReader()?.use { it.readText() } ?: "{}"
                onResult(if (code in 200..299) JSONObject(text) else null)
            } catch (e: Exception) {
                Log.w(TAG, "request to $path failed", e)
                onResult(null)
            }
        }
    }

    fun pairDevice(pairCode: String, deviceName: String, onResult: (JSONObject?) -> Unit) {
        val body = JSONObject().apply {
            put("pairCode", pairCode)
            put("deviceName", deviceName)
        }
        postJson("/api/device/pair", body, onResult)
    }

    fun ingest(token: String, packageName: String, role: String, text: String) {
        val body = JSONObject().apply {
            put("token", token)
            put("packageName", packageName)
            put("role", role)
            put("text", text)
        }
        postJson("/api/device/ingest", body) { /* fire-and-forget */ }
    }
}
