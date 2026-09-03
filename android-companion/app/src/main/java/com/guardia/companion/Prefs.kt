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

    // 10.0.2.2 is the Android emulator's alias for the host machine's
    // localhost. Swap to https://guardia-seven.vercel.app for a real device.
    const val BASE_URL = "http://10.0.2.2:3912"

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
}
