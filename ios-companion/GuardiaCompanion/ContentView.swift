import SwiftUI
import UIKit
import FamilyControls

/// Apps GuardRail already recognizes server-side (src/lib/devicePackages.ts).
/// The picker sends one of these package identifiers so a demo message
/// lands on the same App row a real Android device's traffic would.
private struct DemoApp: Identifiable, Hashable {
    let id: String   // package name, as devicePackages.ts expects it
    let label: String
}

private let demoApps: [DemoApp] = [
    DemoApp(id: "com.google.android.apps.bard", label: "Gemini"),
    DemoApp(id: "com.openai.chatgpt", label: "ChatGPT"),
    DemoApp(id: "com.anthropic.claude", label: "Claude"),
]

struct ContentView: View {
    @State private var pairCode = ""
    @State private var studentName = Prefs.studentName
    @State private var isPairing = false
    @State private var pairError: String?

    @State private var selectedApp = demoApps[0]
    @State private var demoMessage = "how do i get past the school content filter"
    @State private var isSending = false
    @State private var sendResult: String?

    @StateObject private var screenTime = ScreenTimeManager()
    @State private var pickerTarget: MonitoredApp?

    private var isPaired: Bool { studentName != nil }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                header
                pairingCard
                if isPaired {
                    screenTimeCard
                    demoNotice
                    demoMessageCard
                }
            }
            .padding(20)
        }
        .background(Color.guardiaBackground.ignoresSafeArea())
        .preferredColorScheme(.dark)
        .familyActivityPicker(
            isPresented: Binding(get: { pickerTarget != nil }, set: { if !$0 { pickerTarget = nil } }),
            selection: pickerTarget.map { screenTime.selection(for: $0) } ?? .constant(FamilyActivitySelection())
        )
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Guardia Companion")
                .font(.title2.bold())
                .foregroundStyle(Color.guardiaText)
            Text(isPaired ? "Paired with \(studentName ?? "")" : "Not paired yet — enter the code shown in TrustEd.")
                .font(.subheadline)
                .foregroundStyle(Color.guardiaMuted)
        }
    }

    private var demoNotice: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label("Message content: demo only", systemImage: "info.circle")
                .font(.caption.bold())
                .foregroundStyle(Color.guardiaTeal)
            Text("The Android companion reads on-screen text via Android's Accessibility API — iOS sandboxing doesn't let a third-party app do that, on this build or any other. What's below simulates the reporting pipeline: pick an app and send a sample message to see it land in TrustEd's session monitor. Screen Time usage above, by contrast, is real.")
                .font(.caption)
                .foregroundStyle(Color.guardiaMuted)
        }
        .padding(14)
        .background(Color.guardiaTeal.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private var screenTimeCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Screen Time")
                .font(.footnote.bold())
                .foregroundStyle(Color.guardiaText)

            if !screenTime.isAuthorized {
                Text("Reports real usage minutes to TrustEd — no message content, just time. Requires Screen Time authorization (your Screen Time passcode).")
                    .font(.caption)
                    .foregroundStyle(Color.guardiaMuted)
                Button {
                    Task { await screenTime.requestAuthorization() }
                } label: {
                    Text("Enable Screen Time access")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .foregroundStyle(Color.guardiaOnTeal)
                .background(Color.guardiaTeal)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            } else {
                ForEach(MonitoredApp.allCases) { app in
                    monitoredAppRow(app)
                    if app != MonitoredApp.allCases.last {
                        Divider().background(Color.guardiaBorder)
                    }
                }
            }

            if let error = screenTime.lastError {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
            }
        }
        .padding(16)
        .background(Color.guardiaSurface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func monitoredAppRow(_ app: MonitoredApp) -> some View {
        let isMonitoring = screenTime.monitoringApps.contains(app)
        let hasSelection = screenTime.hasSelection(for: app)

        return HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text(app.displayName)
                    .foregroundStyle(Color.guardiaText)
                    .fontWeight(.medium)
                Text(isMonitoring ? "Monitoring — reports at 15/30/60/120 min" : hasSelection ? "App chosen, not monitoring" : "No app chosen yet")
                    .font(.caption2)
                    .foregroundStyle(isMonitoring ? Color.guardiaTeal : Color.guardiaMuted)
            }
            Spacer()
            Button(hasSelection ? "Change" : "Choose app") {
                pickerTarget = app
            }
            .font(.caption.weight(.semibold))
            .buttonStyle(.bordered)

            Button(isMonitoring ? "Stop" : "Start") {
                isMonitoring ? screenTime.stopMonitoring(app) : screenTime.startMonitoring(app)
            }
            .font(.caption.weight(.semibold))
            .buttonStyle(.borderedProminent)
            .disabled(!hasSelection)
        }
    }

    private var pairingCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            TextField("Pairing code (e.g. E8VTLW)", text: $pairCode)
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled()
                .multilineTextAlignment(.center)
                .font(.system(.title3, design: .monospaced))
                .foregroundStyle(Color.guardiaText)
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity)
                .background(Color.guardiaSurface2)
                .clipShape(RoundedRectangle(cornerRadius: 8))

            if let pairError {
                Text(pairError)
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            Button(action: pair) {
                HStack {
                    if isPairing {
                        ProgressView().tint(Color.guardiaOnTeal)
                    }
                    Text(isPairing ? "Pairing…" : "Pair device")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
            }
            .foregroundStyle(Color.guardiaOnTeal)
            .background(Color.guardiaTeal)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .disabled(pairCode.trimmingCharacters(in: .whitespaces).isEmpty || isPairing)
        }
        .padding(16)
        .background(Color.guardiaSurface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var demoMessageCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Send a demo message")
                .font(.footnote.bold())
                .foregroundStyle(Color.guardiaText)

            Picker("App", selection: $selectedApp) {
                ForEach(demoApps) { app in
                    Text(app.label).tag(app)
                }
            }
            .pickerStyle(.segmented)

            TextField("Message text", text: $demoMessage, axis: .vertical)
                .lineLimit(2...4)
                .foregroundStyle(Color.guardiaText)
                .padding(10)
                .background(Color.guardiaSurface2)
                .clipShape(RoundedRectangle(cornerRadius: 8))

            if let sendResult {
                Text(sendResult)
                    .font(.caption)
                    .foregroundStyle(Color.guardiaMuted)
            }

            Button(action: sendDemoMessage) {
                HStack {
                    if isSending {
                        ProgressView().tint(Color.guardiaText)
                    }
                    Text(isSending ? "Sending…" : "Send as \(selectedApp.label)")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
            }
            .foregroundStyle(Color.guardiaText)
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.guardiaBorder, lineWidth: 1))
            .disabled(demoMessage.trimmingCharacters(in: .whitespaces).isEmpty || isSending)
        }
        .padding(16)
        .background(Color.guardiaSurface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func pair() {
        let code = pairCode.trimmingCharacters(in: .whitespaces).uppercased()
        guard !code.isEmpty else { return }
        isPairing = true
        pairError = nil
        ApiClient.pairDevice(pairCode: code, deviceName: UIDevice.current.name) { result in
            isPairing = false
            guard let result else {
                pairError = "That code didn't work — check TrustEd and try again."
                return
            }
            Prefs.save(token: result.token, studentName: result.studentName)
            studentName = result.studentName
        }
    }

    private func sendDemoMessage() {
        guard let token = Prefs.token else { return }
        isSending = true
        sendResult = nil
        ApiClient.ingest(token: token, packageName: selectedApp.id, role: "STUDENT", text: demoMessage) { ok in
            isSending = false
            sendResult = ok
                ? "Sent — check TrustEd's session monitor for \(studentName ?? "this student")."
                : "That didn't go through. Confirm this device is still paired."
        }
    }
}

private extension Color {
    static let guardiaBackground = Color(red: 0x09 / 255, green: 0x0C / 255, blue: 0x14 / 255)
    static let guardiaSurface = Color(red: 0x10 / 255, green: 0x15 / 255, blue: 0x2A / 255)
    static let guardiaSurface2 = Color(red: 0x17 / 255, green: 0x1D / 255, blue: 0x33 / 255)
    static let guardiaBorder = Color.white.opacity(0.12)
    static let guardiaText = Color(red: 0xF1 / 255, green: 0xF5 / 255, blue: 0xF9 / 255)
    static let guardiaMuted = Color(red: 0x94 / 255, green: 0xA3 / 255, blue: 0xB8 / 255)
    static let guardiaTeal = Color(red: 0x2D / 255, green: 0xD4 / 255, blue: 0xBF / 255)
    static let guardiaOnTeal = Color(red: 0x04 / 255, green: 0x21 / 255, blue: 0x1D / 255)
}

#Preview {
    ContentView()
}
