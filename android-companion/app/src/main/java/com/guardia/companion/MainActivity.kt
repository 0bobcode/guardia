package com.guardia.companion

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView
    private lateinit var accessibilityStatusText: TextView
    private lateinit var pairCodeInput: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        accessibilityStatusText = findViewById(R.id.accessibilityStatusText)
        pairCodeInput = findViewById(R.id.pairCodeInput)
        val pairButton = findViewById<Button>(R.id.pairButton)
        val openSettingsButton = findViewById<Button>(R.id.openAccessibilitySettingsButton)

        pairButton.setOnClickListener { onPairClicked() }
        openSettingsButton.setOnClickListener {
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }

        refreshStatus()
    }

    override fun onResume() {
        super.onResume()
        refreshStatus()
    }

    private fun onPairClicked() {
        val code = pairCodeInput.text.toString().trim().uppercase()
        if (code.isEmpty()) {
            Toast.makeText(this, "Enter the code shown in TrustEd", Toast.LENGTH_SHORT).show()
            return
        }
        val deviceName = "${Build.MANUFACTURER} ${Build.MODEL}"
        ApiClient.pairDevice(code, deviceName) { result ->
            runOnUiThread {
                if (result != null && result.has("token")) {
                    val token = result.getString("token")
                    val studentName = result.optString("studentName", "your child")
                    Prefs.saveToken(this, token, studentName)
                    Toast.makeText(this, "Paired with $studentName", Toast.LENGTH_SHORT).show()
                    refreshStatus()
                } else {
                    Toast.makeText(this, "That code didn't work — check TrustEd and try again", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun refreshStatus() {
        val studentName = Prefs.studentName(this)
        statusText.text = if (studentName != null) {
            "Paired with $studentName"
        } else {
            "Not paired yet. Enter the code shown in TrustEd."
        }

        accessibilityStatusText.text = if (isAccessibilityServiceEnabled()) {
            "Monitoring: on"
        } else {
            "Monitoring: off — tap below to enable it"
        }
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        val am = getSystemService(ACCESSIBILITY_SERVICE) as AccessibilityManager
        val enabledServices = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_GENERIC)
        return enabledServices.any { it.resolveInfo.serviceInfo.packageName == packageName }
    }
}
