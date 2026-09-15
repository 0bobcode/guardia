import DeviceActivity

/// Runs in a separate, short-lived, sandboxed process managed by iOS, not
/// in the main app. It cannot reliably hold a network connection open, so
/// it only records the event into the shared App Group container —
/// ApiClient.syncPendingUsageEvents() (called from the main app on
/// foreground) does the actual POST to Guardia's backend.
///
/// This file belongs to the GuardiaCompanionMonitor extension target
/// (create via Xcode: File → New → Target → Device Activity Monitor
/// Extension). MonitoredApp.swift must ALSO be added to this target's
/// membership — it's how `activity` below maps back to a packageName
/// without this code ever seeing what app the token actually represents.
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)

        guard let app = MonitoredApp(activityName: activity),
              let minutes = UsageThreshold.minutes(from: event)
        else { return }

        SharedUsageStore.recordThresholdReached(packageName: app.packageName, minutes: minutes)
    }

    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        // A new day started — nothing to do here; the next threshold that
        // fires today will simply report its own minute count from zero.
    }
}
