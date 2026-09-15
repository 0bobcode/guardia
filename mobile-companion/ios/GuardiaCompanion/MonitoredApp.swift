import DeviceActivity

/// The three AI apps GuardRail already recognizes server-side
/// (src/lib/devicePackages.ts). Apple's FamilyControls framework keeps
/// `ApplicationToken`s opaque — no code, in the main app or the extension,
/// can ever turn a token back into a bundle identifier string. So instead
/// of one combined picker, the parent picks each app individually, and we
/// track which is which by the *name we chose* for its monitoring
/// schedule — not by inspecting the token.
///
/// This file must be added to BOTH the main app target and the
/// DeviceActivityMonitor extension target (Xcode: File Inspector → Target
/// Membership, check both boxes) — it's how the extension maps a fired
/// event back to a packageName without ever seeing the token itself.
enum MonitoredApp: String, CaseIterable, Identifiable {
    case gemini
    case chatgpt
    case claude

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .gemini: return "Gemini"
        case .chatgpt: return "ChatGPT"
        case .claude: return "Claude"
        }
    }

    /// Matches devicePackages.ts's KNOWN_PACKAGES keys — chosen for
    /// continuity with the Android companion, not because these are real
    /// iOS bundle identifiers (Apple never exposes those to us here either).
    var packageName: String {
        switch self {
        case .gemini: return "com.google.android.apps.bard"
        case .chatgpt: return "com.openai.chatgpt"
        case .claude: return "com.anthropic.claude"
        }
    }

    var activityName: DeviceActivityName { DeviceActivityName("guardia.\(rawValue)") }

    init?(activityName: DeviceActivityName) {
        self.init(rawValue: activityName.rawValue.replacingOccurrences(of: "guardia.", with: ""))
    }
}

enum UsageThreshold {
    /// Minutes-per-day checkpoints reported to TrustEd. Coarser than a
    /// live stopwatch by design — see ApiClient.reportUsage.
    static let minutes = [15, 30, 60, 120]

    static func eventName(_ minutes: Int) -> DeviceActivityEvent.Name {
        DeviceActivityEvent.Name("threshold_\(minutes)")
    }

    static func minutes(from eventName: DeviceActivityEvent.Name) -> Int? {
        Int(eventName.rawValue.replacingOccurrences(of: "threshold_", with: ""))
    }
}
