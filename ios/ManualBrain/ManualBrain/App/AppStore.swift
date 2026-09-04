import Foundation
import SwiftUI

/// One place for state + mutations, playing the same role Dashboard.tsx's
/// hooks play on the web: everything reads from here, every mutation goes
/// through here first. Unlike Dashboard.tsx this does not do optimistic
/// local updates before the network call resolves — each mutation awaits
/// its API response and then folds the server's own row back into state,
/// which is simpler to get right without a live device to test timing
/// races against. See ios/README.md for the tradeoff.
@MainActor
final class AppStore: ObservableObject {
    // MARK: - Server address (set once, before login)

    @AppStorage("mb_server_url") private var storedServerURLString: String = "https://www.manualbrain.xyz"

    var serverURLString: String {
        get { storedServerURLString }
        set {
            storedServerURLString = newValue
            if let url = URL(string: newValue) {
                Task { await client.updateBaseURL(url) }
            }
        }
    }

    private(set) var client: APIClient

    // MARK: - Auth

    enum AuthState: Equatable {
        case unknown
        case loggedOut
        case loggedIn
    }
    @Published var authState: AuthState = .unknown
    @Published var loginError: String?
    @Published var isLoggingIn = false

    // MARK: - Data

    @Published var sections: [Section] = []
    @Published var tasks: [APITask] = []
    @Published var isLoadingState = false
    @Published var actionError: String?

    @Published var calendar: CalendarResponse?
    @Published var settings: SettingsResponse?

    @Published var bookingTaskIDs: Set<String> = []

    // MARK: - Chat

    @Published var chatWireMessages: [ChatMessage] = []
    @Published var chatDisplay: [ChatDisplayMessage] = []
    @Published var chatBusy = false
    @Published var chatError: String?

    init() {
        let url = URL(string: "https://www.manualbrain.xyz")!
        self.client = APIClient(baseURL: url)
        if let stored = URL(string: storedServerURLString) {
            Task { await client.updateBaseURL(stored) }
        }
    }

    var todayKey: String { DueDate.todayKey() }
    var tomorrowKey: String { DueDate.tomorrowKey() }

    var activeTasks: [APITask] { tasks.filter { !$0.isDone } }
    var doneTasks: [APITask] {
        tasks.filter { $0.isDone }.sorted { ($0.doneAt ?? "") > ($1.doneAt ?? "") }
    }

    func sectionName(for id: String) -> String {
        sections.first(where: { $0.id == id })?.name ?? ""
    }

    // MARK: - Bootstrap

    /// Called once at launch: try loading state directly. A 401 means no
    /// session yet (or it expired) — that's the normal "show the login
    /// screen" path, not an error to surface.
    func bootstrap() async {
        await refreshAll()
    }

    func login(password: String) async {
        isLoggingIn = true
        loginError = nil
        defer { isLoggingIn = false }
        do {
            try await client.login(password: password)
            authState = .loggedIn
            await refreshAll()
        } catch {
            loginError = error.localizedDescription
        }
    }

    func logout() async {
        try? await client.logout()
        authState = .loggedOut
        sections = []
        tasks = []
        calendar = nil
        settings = nil
        chatWireMessages = []
        chatDisplay = []
    }

    // MARK: - State loading

    func refreshAll() async {
        isLoadingState = true
        defer { isLoadingState = false }
        async let stateTask: Void = loadState()
        async let calendarTask: Void = loadCalendar()
        async let settingsTask: Void = loadSettings()
        _ = await (stateTask, calendarTask, settingsTask)
    }

    func loadState() async {
        do {
            let response = try await client.fetchState()
            let (sections, tasks) = response.flattened()
            self.sections = sections
            self.tasks = tasks
            authState = .loggedIn
        } catch APIError.unauthorized(_) {
            authState = .loggedOut
        } catch {
            actionError = error.localizedDescription
        }
    }

    func loadCalendar() async {
        do {
            calendar = try await client.fetchCalendar()
        } catch APIError.unauthorized(_) {
            authState = .loggedOut
        } catch {
            // Best-effort, same as the web sidebar: a broken feed collapses
            // to an inline message rather than blocking the rest of the app.
        }
    }

    func loadSettings() async {
        do {
            settings = try await client.fetchSettings()
        } catch APIError.unauthorized(_) {
            authState = .loggedOut
        } catch {
            // Non-fatal — the Settings screen shows what it has.
        }
    }

    // MARK: - Task mutations

    func addTask(
        name: String, sectionId: String, dueDate: String?, durationMinutes: Int?,
        timeOfDay: TimeOfDay?, repeatFrequency: RepeatFrequency?
    ) async {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !sectionId.isEmpty else { return }
        do {
            let created = try await client.createTask(
                CreateTaskRequest(
                    sectionId: sectionId, name: trimmed, dueDate: dueDate,
                    durationMinutes: durationMinutes, timeOfDay: timeOfDay?.rawValue,
                    repeatFrequency: dueDate != nil ? repeatFrequency?.rawValue : nil))
            tasks.append(created)
        } catch {
            actionError = "couldn't save that task — try again."
        }
    }

    /// Saves every editable field on a task in one PATCH — see
    /// UpdateTaskRequest's own comment for why explicit-null vs. absent
    /// matters here (clearing the due date also clears any repeat rule,
    /// same cascade the server enforces either way).
    func saveTask(
        id: String, name: String, sectionId: String, dueDate: String?, durationMinutes: Int?,
        timeOfDay: TimeOfDay?, repeatFrequency: RepeatFrequency?
    ) async {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        do {
            let updated = try await client.updateTask(
                id: id,
                UpdateTaskRequest(
                    name: trimmed,
                    sectionId: sectionId,
                    dueDate: .some(dueDate),
                    durationMinutes: .some(durationMinutes),
                    timeOfDay: .some(timeOfDay?.rawValue),
                    repeatFrequency: .some(dueDate != nil ? repeatFrequency?.rawValue : nil)))
            if let index = tasks.firstIndex(where: { $0.id == id }) {
                tasks[index] = updated
            }
        } catch {
            actionError = "couldn't save that task — try again."
        }
    }

    func toggleDone(id: String, done: Bool) async {
        do {
            let updated = try await client.updateTask(id: id, UpdateTaskRequest(done: done))
            if let index = tasks.firstIndex(where: { $0.id == id }) {
                tasks[index] = updated
            }
        } catch {
            actionError = "couldn't sync that — refreshing."
            await loadState()
        }
    }

    func deleteTask(id: String) async {
        do {
            try await client.deleteTask(id: id)
            tasks.removeAll { $0.id == id }
        } catch {
            actionError = "couldn't delete that — try again."
        }
    }

    func bookTask(id: String) async {
        guard !bookingTaskIDs.contains(id) else { return }
        bookingTaskIDs.insert(id)
        defer { bookingTaskIDs.remove(id) }
        do {
            let result = try await client.bookTask(id: id)
            if result.ok, let index = tasks.firstIndex(where: { $0.id == id }) {
                tasks[index].calendarEventId = result.calendarEventId
            } else if !result.ok {
                actionError = result.message ?? "couldn't find a time to book that — try the chat instead."
            }
        } catch {
            actionError = error.localizedDescription
        }
    }

    // MARK: - Section mutations

    func addSection(name: String) async {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        do {
            let created = try await client.createSection(name: trimmed)
            sections.append(created)
        } catch {
            actionError = "couldn't create that list — try again."
        }
    }

    func renameSection(id: String, name: String) async {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        do {
            let updated = try await client.renameSection(id: id, name: trimmed)
            if let index = sections.firstIndex(where: { $0.id == id }) {
                sections[index] = updated
            }
        } catch {
            actionError = "couldn't rename that list — try again."
        }
    }

    func deleteSection(id: String) async {
        do {
            try await client.deleteSection(id: id)
            sections.removeAll { $0.id == id }
            tasks.removeAll { $0.sectionId == id }
        } catch {
            actionError = "couldn't delete that list — try again."
        }
    }

    // MARK: - Settings

    func savePlanningRules(_ text: String) async {
        do {
            let saved = try await client.savePlanningRules(text)
            settings?.planningRules = saved
        } catch {
            actionError = "couldn't save that — try again."
        }
    }

    // MARK: - Chat

    func sendChat(_ text: String) async {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !chatBusy else { return }
        chatError = nil
        let outgoing = chatWireMessages + [.user(trimmed)]
        chatWireMessages = outgoing
        chatDisplay.append(ChatDisplayMessage(role: "user", text: trimmed, notes: []))
        chatBusy = true
        defer { chatBusy = false }
        do {
            let response = try await client.chat(messages: outgoing)
            guard let returned = response.messages else {
                chatError = response.error ?? "chat request failed."
                return
            }
            let appended = Array(returned.dropFirst(outgoing.count))
            chatWireMessages = returned
            chatDisplay.append(chatDisplayMessage(appended: appended))
            if let responseError = response.error { chatError = responseError }
            // A booking or a new task from chat changes state this screen
            // doesn't own directly — refresh so Today/Lists reflect it.
            await loadState()
        } catch {
            chatError = error.localizedDescription
        }
    }
}
