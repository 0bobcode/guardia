package com.guardia.companion

import android.content.Context
import android.content.SharedPreferences

/**
 * Local device-pairing state. This is a prototype, so the token lives in
 * plain SharedPreferences rather than the Android Keystore-backed
 * EncryptedSharedPreferences a production build would use.
 */
object Prefs {
    private const val FILE = "guardia_companion_prefs"
    private const val KEY_TOKEN = "token"
    private const val KEY_STUDENT_NAME = "student_name"

    // Debug builds hit the emulator's alias for the host machine's localhost
    // (10.0.2.2); release builds point at the real deployment. See
    // build.gradle.kts's buildConfigField per build type.
    val BASE_URL: String = BuildConfig.BASE_URL

    private fun prefs(context: Context): SharedPreferences =
        context.getSharedPreferences(FILE, Context.MODE_PRIVATE)

    fun saveToken(context: Context, token: String, studentName: String) {
        prefs(context).edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_STUDENT_NAME, studentName)
            .apply()
    }

    fun token(context: Context): String? = prefs(context).getString(KEY_TOKEN, null)

    fun studentName(context: Context): String? = prefs(context).getString(KEY_STUDENT_NAME, null)

    fun clear(context: Context) {
        prefs(context).edit().remove(KEY_TOKEN).remove(KEY_STUDENT_NAME).apply()
    }
}
