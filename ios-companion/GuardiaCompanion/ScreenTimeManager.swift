import Foundation
import FamilyControls
import DeviceActivity
import Combine
import SwiftUI

/// Requests Family Controls authorization and starts/stops per-app usage
/// monitoring. Everything here runs in the main app; the extension
/// (GuardiaCompanionMonitor target, added separately in Xcode) only
/// receives the threshold-crossed callbacks this schedules.
@MainActor
final class ScreenTimeManager: ObservableObject {
    @Published var authorizationStatus: AuthorizationStatus = .notDetermined
    @Published var selections: [MonitoredApp: FamilyActivitySelection] = [:]
    @Published var monitoringApps: Set<MonitoredApp> = []
    @Published var lastError: String?

    private let authorizationCenter = AuthorizationCenter.shared
    private let activityCenter = DeviceActivityCenter()

    init() {
        authorizationStatus = authorizationCenter.authorizationStatus
    }

    var isAuthorized: Bool { authorizationStatus == .approved }

    /// Screen Time authorization is requested from the child's own device —
    /// this prompts for the parent's Screen Time passcode right there,
    /// rather than anything happening remotely from TrustEd.
    func requestAuthorization() async {
        do {
            try await authorizationCenter.requestAuthorization(for: .child)
            authorizationStatus = authorizationCenter.authorizationStatus
            lastError = nil
        } catch {
            authorizationStatus = authorizationCenter.authorizationStatus
            lastError = "Screen Time authorization was denied or unavailable."
        }
    }

    func selection(for app: MonitoredApp) -> Binding<FamilyActivitySelection> {
        Binding(
            get: { self.selections[app] ?? FamilyActivitySelection() },
            set: { self.selections[app] = $0 }
        )
    }

    func hasSelection(for app: MonitoredApp) -> Bool {
        let sel = selections[app]
        return !(sel?.applicationTokens.isEmpty ?? true) || !(sel?.categoryTokens.isEmpty ?? true)
    }

    func startMonitoring(_ app: MonitoredApp) {
        guard let selection = selections[app], hasSelection(for: app) else { return }

        let schedule = DeviceActivitySchedule(
            intervalStart: DateComponents(hour: 0, minute: 0),
            intervalEnd: DateComponents(hour: 23, minute: 59),
            repeats: true
        )

        var events: [DeviceActivityEvent.Name: DeviceActivityEvent] = [:]
        for minutes in UsageThreshold.minutes {
            events[UsageThreshold.eventName(minutes)] = DeviceActivityEvent(
                applications: selection.applicationTokens,
                categories: selection.categoryTokens,
                threshold: DateComponents(minute: minutes)
            )
        }

        do {
            try activityCenter.startMonitoring(app.activityName, during: schedule, events: events)
            monitoringApps.insert(app)
            lastError = nil
        } catch {
            lastError = "Couldn't start monitoring \(app.displayName): \(error.localizedDescription)"
        }
    }

    func stopMonitoring(_ app: MonitoredApp) {
        activityCenter.stopMonitoring([app.activityName])
        monitoringApps.remove(app)
    }
}
