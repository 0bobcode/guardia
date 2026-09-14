import Foundation

/// Minimal JSON-over-HTTPS client — mirrors the Android companion's
/// ApiClient.kt. No third-party networking library needed for two POSTs.
enum ApiClient {
    struct PairResult {
        let token: String
        let studentName: String
    }

    static func pairDevice(pairCode: String, deviceName: String, completion: @escaping (PairResult?) -> Void) {
        let body: [String: Any] = ["pairCode": pairCode, "deviceName": deviceName]
        post(path: "/api/device/pair", body: body) { json in
            guard let json, let token = json["token"] as? String else {
                completion(nil)
                return
            }
            let studentName = json["studentName"] as? String ?? "your child"
            completion(PairResult(token: token, studentName: studentName))
        }
    }

    static func ingest(token: String, packageName: String, role: String, text: String, completion: @escaping (Bool) -> Void) {
        let body: [String: Any] = ["token": token, "packageName": packageName, "role": role, "text": text]
        post(path: "/api/device/ingest", body: body) { json in
            completion((json?["ok"] as? Bool) ?? false)
        }
    }

    /// Reports a Screen Time threshold crossing — a count of minutes, never
    /// message content. `minutes` is today's threshold that was just
    /// reached (e.g. 30), not a live running total; see SharedUsageStore.
    static func reportUsage(token: String, packageName: String, minutes: Int, completion: @escaping (Bool) -> Void) {
        let body: [String: Any] = ["token": token, "packageName": packageName, "minutes": minutes]
        post(path: "/api/device/usage", body: body) { json in
            completion((json?["ok"] as? Bool) ?? false)
        }
    }

    /// Drains whatever threshold events the extension recorded while this
    /// app wasn't running, and reports each one. Call from `.onAppear` /
    /// `scenePhase == .active` in the main app.
    static func syncPendingUsageEvents() {
        guard let token = Prefs.token else { return }
        let pending = SharedUsageStore.readPending()
        guard !pending.isEmpty else { return }
        SharedUsageStore.clearPending() // clear first: a duplicate re-send is harmless (see route's comment), a lost event is not

        for event in pending {
            reportUsage(token: token, packageName: event.packageName, minutes: event.minutes) { _ in }
        }
    }

    private static func post(path: String, body: [String: Any], completion: @escaping ([String: Any]?) -> Void) {
        guard let url = URL(string: Prefs.baseURL + path) else {
            completion(nil)
            return
        }
        var request = URLRequest(url: url, timeoutInterval: 8)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, response, error in
            guard error == nil, let data,
                  let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode),
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
            else {
                DispatchQueue.main.async { completion(nil) }
                return
            }
            DispatchQueue.main.async { completion(json) }
        }.resume()
    }
}
