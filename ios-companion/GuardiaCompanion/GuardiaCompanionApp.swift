import SwiftUI

@main
struct GuardiaCompanionApp: App {
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active {
                ApiClient.syncPendingUsageEvents()
            }
        }
    }
}
