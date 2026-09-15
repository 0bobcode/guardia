import Foundation
import SwiftUI
import FamilyControls
import DeviceActivity

/// JS-facing bridge to Apple's FamilyControls/DeviceActivity frameworks —
/// mirrors ScreenTimeManager.swift from the original SwiftUI app. Exposed
/// to JS via GuardiaScreenTime.m's RCT_EXTERN_MODULE declarations.
///
/// The FamilyActivityPicker is a system SwiftUI view Apple doesn't expose
/// any other way, so `presentPicker` hosts it in a UIHostingController
/// presented over RN's root view controller and resolves once dismissed.
@objc(GuardiaScreenTime)
class GuardiaScreenTime: NSObject {

    private let authorizationCenter = AuthorizationCenter.shared
    private let activityCenter = DeviceActivityCenter()
    private var selections: [MonitoredApp: FamilyActivitySelection] = [:]
    private var monitoringApps: Set<MonitoredApp> = []
    private var lastError: String?

    @objc static func requiresMainQueueSetup() -> Bool { false }

    private func statusString(_ status: AuthorizationStatus) -> String {
        switch status {
        case .notDetermined: return "notDetermined"
        case .denied: return "denied"
        case .approved: return "approved"
        @unknown default: return "unknown"
        }
    }

    @objc func getAuthorizationStatus(
        _ resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        resolve(statusString(authorizationCenter.authorizationStatus))
    }

    @objc func requestAuthorization(
        _ resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        Task { @MainActor in
            do {
                try await authorizationCenter.requestAuthorization(for: .child)
                self.lastError = nil
            } catch {
                self.lastError = "Screen Time authorization failed (\(error.localizedDescription)). On a free/Personal Team build this is expected — Family Controls needs a paid Apple Developer account, even just for local testing."
            }
            resolve(self.statusString(self.authorizationCenter.authorizationStatus))
        }
    }

    @objc func getLastError(
        _ resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        resolve(lastError)
    }

    @objc func hasSelection(
        _ app: String,
        resolver resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        guard let monitoredApp = MonitoredApp(rawValue: app), let sel = selections[monitoredApp] else {
            resolve(false)
            return
        }
        resolve(!sel.applicationTokens.isEmpty || !sel.categoryTokens.isEmpty)
    }

    @objc func getMonitoringApps(
        _ resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        resolve(monitoringApps.map { $0.rawValue })
    }

    @objc func presentPicker(
        _ app: String,
        resolver resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        guard let monitoredApp = MonitoredApp(rawValue: app) else {
            resolve(false)
            return
        }
        DispatchQueue.main.async {
            guard let rootVC = Self.topViewController() else {
                resolve(false)
                return
            }
            let initial = self.selections[monitoredApp] ?? FamilyActivitySelection()
            let hosting = UIHostingController(
                rootView: PickerHost(selection: initial) { finalSelection, didPick in
                    if didPick { self.selections[monitoredApp] = finalSelection }
                    rootVC.dismiss(animated: true)
                    resolve(didPick)
                }
            )
            hosting.view.backgroundColor = .clear
            hosting.modalPresentationStyle = .overFullScreen
            rootVC.present(hosting, animated: false)
        }
    }

    @objc func startMonitoring(
        _ app: String,
        resolver resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        guard let monitoredApp = MonitoredApp(rawValue: app), let selection = selections[monitoredApp] else {
            resolve(false)
            return
        }

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
            try activityCenter.startMonitoring(monitoredApp.activityName, during: schedule, events: events)
            monitoringApps.insert(monitoredApp)
            lastError = nil
            resolve(true)
        } catch {
            lastError = "Couldn't start monitoring \(monitoredApp.displayName): \(error.localizedDescription)"
            resolve(false)
        }
    }

    @objc func stopMonitoring(
        _ app: String,
        resolver resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        guard let monitoredApp = MonitoredApp(rawValue: app) else {
            resolve(nil)
            return
        }
        activityCenter.stopMonitoring([monitoredApp.activityName])
        monitoringApps.remove(monitoredApp)
        resolve(nil)
    }

    @objc func drainPendingUsageEvents(
        _ resolve: @escaping (Any?) -> Void,
        rejecter reject: @escaping (String?, String?, Error?) -> Void
    ) {
        let pending = SharedUsageStore.readPending()
        SharedUsageStore.clearPending() // clear first: a duplicate re-send is harmless, a lost event is not
        resolve(pending.map { ["packageName": $0.packageName, "minutes": $0.minutes] })
    }

    private static func topViewController() -> UIViewController? {
        let scene = UIApplication.shared.connectedScenes.first { $0.activationState == .foregroundActive } as? UIWindowScene
        var top = scene?.windows.first { $0.isKeyWindow }?.rootViewController
        while let presented = top?.presentedViewController {
            top = presented
        }
        return top
    }
}

/// Hosts the system FamilyActivityPicker sheet and reports back the final
/// selection once the parent dismisses it.
private struct PickerHost: View {
    @State private var isPresented = true
    @State private var selection: FamilyActivitySelection
    let onDismiss: (FamilyActivitySelection, Bool) -> Void

    init(selection: FamilyActivitySelection, onDismiss: @escaping (FamilyActivitySelection, Bool) -> Void) {
        _selection = State(initialValue: selection)
        self.onDismiss = onDismiss
    }

    var body: some View {
        Color.clear
            .familyActivityPicker(isPresented: $isPresented, selection: $selection)
            .onChange(of: isPresented) { newValue in
                if !newValue {
                    let picked = !selection.applicationTokens.isEmpty || !selection.categoryTokens.isEmpty
                    onDismiss(selection, picked)
                }
            }
    }
}
