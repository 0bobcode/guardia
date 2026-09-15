import Foundation

/// Shared storage between the main app and the DeviceActivityMonitor
/// extension. Extensions run in a separate, short-lived, sandboxed process
/// that can't reliably hold a network connection open, so the standard
/// pattern is: the extension just records "this threshold fired" into a
/// shared App Group container, and the main app (which has a normal
/// lifecycle) picks those events up on next launch/foreground — here, via
/// GuardiaScreenTime.drainPendingUsageEvents(), called from JS.
///
/// Requires the same App Group id added under Signing & Capabilities on
/// BOTH the main app target and the extension target.
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

    /// Called from the main app (via GuardiaScreenTime) to drain and report events.
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
