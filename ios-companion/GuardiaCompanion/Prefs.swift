import Foundation

/// Local device-pairing state, mirroring the Android companion's Prefs.kt.
/// This is a prototype/demo, so the token lives in plain UserDefaults
/// rather than the Keychain a production build would use.
enum Prefs {
    private static let defaults = UserDefaults.standard
    private static let tokenKey = "guardia.token"
    private static let studentNameKey = "guardia.studentName"

    /// The iOS Simulator shares the Mac's own network stack, so
    /// "http://localhost:3912" also works for local dev — unlike Android's
    /// emulator, no 10.0.2.2 alias or cleartext exception is needed here.
    static let baseURL = "https://guardia-seven.vercel.app"

    static var token: String? { defaults.string(forKey: tokenKey) }
    static var studentName: String? { defaults.string(forKey: studentNameKey) }

    static func save(token: String, studentName: String) {
        defaults.set(token, forKey: tokenKey)
        defaults.set(studentName, forKey: studentNameKey)
    }

    static func clear() {
        defaults.removeObject(forKey: tokenKey)
        defaults.removeObject(forKey: studentNameKey)
    }
}

/// Shared storage between the main app and the DeviceActivityMonitor
/// extension. Extensions run in a separate, short-lived, sandboxed process
/// that can't reliably hold a network connection open, so the standard
/// pattern is: the extension just records "this threshold fired" into a
/// shared App Group container, and the main app (which has a normal
/// lifecycle) picks those events up on next launch/foreground and does the
/// actual network call.
///
/// Requires adding an App Group capability in Xcode (Signing & Capabilities
/// → + App Groups) to BOTH the main app target and the extension target,
/// using the same group id — self-service, no Apple approval needed
/// (unlike Family Controls itself).
enum SharedUsageStore {
    static let appGroupId = "group.com.guardia.companion"

    private static var defaults: UserDefaults? {
        UserDefaults(suiteName: appGroupId)
    }
    private static let pendingKey = "guardia.pendingUsageEvents"

    struct PendingEvent: Codable {
        let packageName: String
        let minutes: Int
        let recordedAt: Date
    }

    /// Called from the DeviceActivityMonitor extension when a threshold fires.
    static func recordThresholdReached(packageName: String, minutes: Int) {
        guard let defaults else { return }
        var pending = readPending()
        pending.append(PendingEvent(packageName: packageName, minutes: minutes, recordedAt: Date()))
        if let data = try? JSONEncoder().encode(pending) {
            defaults.set(data, forKey: pendingKey)
        }
    }

    /// Called from the main app on foreground to drain and report events.
    static func readPending() -> [PendingEvent] {
        guard let defaults, let data = defaults.data(forKey: pendingKey),
              let pending = try? JSONDecoder().decode([PendingEvent].self, from: data)
        else { return [] }
        return pending
    }

    static func clearPending() {
        defaults?.removeObject(forKey: pendingKey)
    }
}
