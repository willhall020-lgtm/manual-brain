import Foundation

// Mirrors lib/types.ts + lib/time-of-day.ts + lib/repeat.ts. `dueDate` stays
// a plain "YYYY-MM-DD" string end-to-end, same reasoning as the web app
// (Support/DueDate.swift): string ordering already sorts the same as
// chronological order for that format, so there's no reason to round-trip
// through Date and risk a timezone-shifted day.

struct Section: Codable, Identifiable, Equatable, Hashable {
    let id: String
    var name: String
}

struct APITask: Codable, Identifiable, Equatable, Hashable {
    let id: String
    var sectionId: String
    var name: String
    var dueDate: String?
    var doneAt: String?
    var calendarEventId: String?
    var durationMinutes: Int?
    var timeOfDay: String?
    var repeatFrequency: String?

    var isDone: Bool { doneAt != nil }
    var isBooked: Bool { calendarEventId != nil }
}

// GET /api/state's shape: sections, each carrying its own tasks (without a
// redundant sectionId on every task — that's implied by nesting).
struct TaskInSection: Codable {
    let id: String
    let name: String
    let dueDate: String?
    let doneAt: String?
    let calendarEventId: String?
    let durationMinutes: Int?
    let timeOfDay: String?
    let repeatFrequency: String?
}

struct SectionWithTasks: Codable {
    let id: String
    let name: String
    let tasks: [TaskInSection]
}

struct StateResponse: Codable {
    let sections: [SectionWithTasks]

    /// Flattens the nested shape into the (sections, tasks) pair the rest of
    /// the app works with — same flattening Dashboard.tsx's refetchAll does.
    func flattened() -> (sections: [Section], tasks: [APITask]) {
        var sections: [Section] = []
        var tasks: [APITask] = []
        for s in self.sections {
            sections.append(Section(id: s.id, name: s.name))
            for t in s.tasks {
                tasks.append(
                    APITask(
                        id: t.id, sectionId: s.id, name: t.name, dueDate: t.dueDate,
                        doneAt: t.doneAt, calendarEventId: t.calendarEventId,
                        durationMinutes: t.durationMinutes, timeOfDay: t.timeOfDay,
                        repeatFrequency: t.repeatFrequency))
            }
        }
        return (sections, tasks)
    }
}

struct CalendarEvent: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let start: String // ISO 8601
    let end: String
    let allDay: Bool
    let location: String?
    let day: String // "today" | "tomorrow"

    var startDate: Date? { ISO8601Formatting.parse(start) }
    var endDate: Date? { ISO8601Formatting.parse(end) }
}

struct CalendarResponse: Codable {
    let configured: Bool
    let error: Bool
    let events: [CalendarEvent]
}

struct SettingsResponse: Codable {
    let calendarReadConfigured: Bool
    let googleOAuthConfigured: Bool
    let googleCalendarConnected: Bool
    var planningRules: String // var: AppStore updates this in place after a save
    let defaultPlanningRules: String
}

struct BookResponse: Codable {
    let ok: Bool
    let message: String?
    let calendarEventId: String?
}

struct OKResponse: Codable {
    let ok: Bool
}

struct ErrorBody: Codable {
    let error: String
}

// ---- Request bodies ----

struct CreateTaskRequest: Encodable {
    var sectionId: String
    var name: String
    var dueDate: String?
    var durationMinutes: Int?
    var timeOfDay: String?
    var repeatFrequency: String?
}

/// One PATCH covers every editable field at once — /api/tasks/[id] treats
/// each key as independently optional, so the Task sheet's Save can send
/// its whole current form state in a single request rather than one call
/// per field the way the web dashboard's per-control handlers do.
struct UpdateTaskRequest: Encodable {
    var name: String? = nil
    var sectionId: String? = nil
    var dueDate: String?? = nil
    var durationMinutes: Int?? = nil
    var timeOfDay: String?? = nil
    var repeatFrequency: String?? = nil
    var done: Bool? = nil

    enum CodingKeys: String, CodingKey {
        case name, sectionId, dueDate, durationMinutes, timeOfDay, repeatFrequency, done
    }

    // A double-optional (String??) round-trips three states through this
    // request: key absent (outer nil — leave untouched), key present as
    // JSON null (outer non-nil, inner nil — explicitly clear), key present
    // with a value (both non-nil). Synthesized Encodable can't express
    // "encode key only sometimes" for a plain Optional, hence the manual
    // encode(to:) below.
    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        if let name { try c.encode(name, forKey: .name) }
        if let sectionId { try c.encode(sectionId, forKey: .sectionId) }
        if let dueDate { try c.encode(dueDate, forKey: .dueDate) }
        if let durationMinutes { try c.encode(durationMinutes, forKey: .durationMinutes) }
        if let timeOfDay { try c.encode(timeOfDay, forKey: .timeOfDay) }
        if let repeatFrequency { try c.encode(repeatFrequency, forKey: .repeatFrequency) }
        if let done { try c.encode(done, forKey: .done) }
    }
}

struct CreateSectionRequest: Encodable {
    var name: String
}

struct RenameSectionRequest: Encodable {
    var name: String
}

struct SavePreferencesRequest: Encodable {
    var planningRules: String
}

struct LoginRequest: Encodable {
    var password: String
}

enum ISO8601Formatting {
    private static let withFractional: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()
    private static let plain: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    static func parse(_ s: String) -> Date? {
        withFractional.date(from: s) ?? plain.date(from: s)
    }
}
