package com.guardia.companion

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * JS-facing bridge for pairing state and Accessibility Service status. The
 * actual on-screen text reading happens entirely in
 * MonitorAccessibilityService, independent of this module and of whether
 * the JS/Metro bundle is even running — this module only lets the RN UI
 * mirror and change that native state (equivalent to MainActivity.kt in
 * the original Kotlin-only app).
 */
class GuardiaAccessibilityModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "GuardiaAccessibility"

    @ReactMethod
    fun isServiceEnabled(promise: Promise) {
        val context = reactApplicationContext
        val am = context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
        val enabledServices = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_GENERIC)
        val enabled = enabledServices.any { it.resolveInfo.serviceInfo.packageName == context.packageName }
        promise.resolve(enabled)
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun saveToken(token: String, studentName: String, promise: Promise) {
        Prefs.saveToken(reactApplicationContext, token, studentName)
        promise.resolve(null)
    }

    @ReactMethod
    fun clearToken(promise: Promise) {
        Prefs.clear(reactApplicationContext)
        promise.resolve(null)
    }
}
