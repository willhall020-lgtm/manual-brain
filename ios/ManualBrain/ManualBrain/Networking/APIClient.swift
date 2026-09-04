import Foundation

enum APIError: Error, LocalizedError {
    /// A 401 always carries the server's own message (lib/auth.ts returns
    /// "Wrong password." from the login endpoint itself, "Not authenticated."
    /// from proxy.ts everywhere else) — callers pattern-match on the case to
    /// decide what a 401 *means* here (show it on the login form vs. drop
    /// back to the login screen), but never need to invent their own text.
    case unauthorized(String)
    case server(String)
    case invalidResponse
    case notConfigured

    var errorDescription: String? {
        switch self {
        case .unauthorized(let message): return message
        case .server(let message): return message
        case .invalidResponse: return "couldn't reach manual brain — try again."
        case .notConfigured: return "set the server address in Settings first."
        }
    }
}

/// Talks to the existing Next.js API routes (app/api/**) — this app adds no
/// backend of its own, it's a native client for the same routes the web
/// dashboard already uses (plus the small read-only additions in
/// app/api/calendar and app/api/settings, and the Sign in with Apple route
/// below, all added alongside this app).
///
/// Auth ends up as the same session cookie the web app's password login
/// sets (lib/auth.ts) — `URLSession`'s own cookie storage receives and
/// resends it automatically once `signInWithApple(identityToken:)`
/// succeeds, exactly like a browser would, so nothing else in the app has
/// to think about it. This app never sees or sends a password at all;
/// see app/api/auth/apple/route.ts for how the two paths end up issuing
/// the identical cookie.
actor APIClient {
    private let session: URLSession
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    var baseURL: URL

    init(baseURL: URL) {
        self.baseURL = baseURL
        let configuration = URLSessionConfiguration.default
        configuration.httpCookieStorage = HTTPCookieStorage.shared
        configuration.httpShouldSetCookies = true
        configuration.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: configuration)
        self.encoder = JSONEncoder()
        self.decoder = JSONDecoder()
    }

    func updateBaseURL(_ url: URL) {
        self.baseURL = url
    }

    // MARK: - Core request

    private func send(_ path: String, method: String = "GET", body: Data? = nil) async throws -> Data {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.invalidResponse
        }

        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
        let serverMessage = (try? decoder.decode(ErrorBody.self, from: data))?.error
        if http.statusCode == 401 {
            throw APIError.unauthorized(serverMessage ?? "not logged in.")
        }
        guard (200..<300).contains(http.statusCode) else {
            throw APIError.server(serverMessage ?? "something went wrong (\(http.statusCode)).")
        }
        return data
    }

    private func get<T: Decodable>(_ path: String) async throws -> T {
        try decoder.decode(T.self, from: try await send(path))
    }

    private func send<Body: Encodable, T: Decodable>(_ path: String, method: String, _ body: Body) async throws -> T {
        let data = try encoder.encode(body)
        return try decoder.decode(T.self, from: try await send(path, method: method, body: data))
    }

    private func sendNoContent<Body: Encodable>(_ path: String, method: String, _ body: Body) async throws {
        let data = try encoder.encode(body)
        _ = try await send(path, method: method, body: data)
    }

    // MARK: - Auth

    func signInWithApple(identityToken: String) async throws {
        try await sendNoContent(
            "/api/auth/apple", method: "POST", AppleSignInRequest(identityToken: identityToken))
    }

    func logout() async throws {
        _ = try await send("/api/auth/logout", method: "POST")
    }

    // MARK: - State

    func fetchState() async throws -> StateResponse {
        try await get("/api/state")
    }

    // MARK: - Tasks

    func createTask(_ body: CreateTaskRequest) async throws -> APITask {
        try await send("/api/tasks", method: "POST", body)
    }

    func updateTask(id: String, _ body: UpdateTaskRequest) async throws -> APITask {
        try await send("/api/tasks/\(id)", method: "PATCH", body)
    }

    func deleteTask(id: String) async throws {
        _ = try await send("/api/tasks/\(id)", method: "DELETE")
    }

    func bookTask(id: String) async throws -> BookResponse {
        try await send("/api/tasks/\(id)/book", method: "POST", EmptyBody())
    }

    // MARK: - Sections

    func createSection(name: String) async throws -> Section {
        try await send("/api/sections", method: "POST", CreateSectionRequest(name: name))
    }

    func renameSection(id: String, name: String) async throws -> Section {
        try await send("/api/sections/\(id)", method: "PATCH", RenameSectionRequest(name: name))
    }

    func deleteSection(id: String) async throws {
        _ = try await send("/api/sections/\(id)", method: "DELETE")
    }

    // MARK: - Calendar & settings

    func fetchCalendar() async throws -> CalendarResponse {
        try await get("/api/calendar")
    }

    func fetchSettings() async throws -> SettingsResponse {
        try await get("/api/settings")
    }

    func savePlanningRules(_ text: String) async throws -> String {
        struct Response: Decodable { let planningRules: String }
        let response: Response = try await send(
            "/api/preferences", method: "POST", SavePreferencesRequest(planningRules: text))
        return response.planningRules
    }

    // MARK: - Chat

    func chat(messages: [ChatMessage]) async throws -> ChatResponse {
        try await send("/api/chat", method: "POST", ChatRequest(messages: messages))
    }
}

/// A handful of endpoints (logout, book) take no body — `Encodable` still
/// needs something to serialize, so this is a standing empty JSON object.
private struct EmptyBody: Encodable {}
