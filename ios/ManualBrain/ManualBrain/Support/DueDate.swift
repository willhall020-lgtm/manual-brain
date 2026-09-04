import Foundation

/// Mirrors lib/due-date.ts exactly, including its reasoning: dates stay
/// plain "YYYY-MM-DD" strings end to end, and comparisons use plain string
/// ordering rather than parsing into a Date — that format already sorts
/// lexicographically the same as chronologically, and going through Date
/// risks a local-timezone shift corrupting the calendar day, which is the
/// exact bug the web app's own lib/data.ts comment describes hitting.
enum DueDate {
    private static let calendar: Calendar = {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = .current
        return cal
    }()

    /// "YYYY-MM-DD" for a Date, using its local calendar fields.
    static func key(for date: Date) -> String {
        let comps = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", comps.year ?? 0, comps.month ?? 0, comps.day ?? 0)
    }

    static func todayKey() -> String { key(for: Date()) }

    static func tomorrowKey() -> String {
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        return key(for: tomorrow)
    }

    static func isOverdue(_ dueDate: String, todayKey: String) -> Bool {
        dueDate < todayKey
    }

    /// Due today or earlier (and not done) — what populates the "for today" block.
    static func isDueOrOverdue(_ dueDate: String?, todayKey: String) -> Bool {
        guard let dueDate else { return false }
        return dueDate <= todayKey
    }

    private static let monthsShort = [
        "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
    ]

    /// "3 sep" — reads the string's own digits directly, same as the web
    /// app's formatDueDate, so it can never drift a day depending on the
    /// device's timezone. Lowercase throughout, per the design system's
    /// absolute-lowercase rule for this surface.
    static func format(_ dueDate: String) -> String {
        let parts = dueDate.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3, parts[1] >= 1, parts[1] <= 12 else { return dueDate }
        return "\(parts[2]) \(monthsShort[parts[1] - 1])"
    }

    /// The short display label a task row shows for its due date — "today",
    /// "overdue · 3 sep", a formatted date, or nil when unset. Matches
    /// DueDatePicker.tsx's resting (non-editing) text exactly.
    static func displayLabel(dueDate: String?, todayKey: String) -> String? {
        guard let dueDate else { return nil }
        if dueDate == todayKey { return "today" }
        if isOverdue(dueDate, todayKey: todayKey) { return "overdue · \(format(dueDate))" }
        return format(dueDate)
    }

    /// A full, spoken-style date label for screen headers — "tuesday 2 september".
    static func weekdayDateLabel(for date: Date = Date()) -> String {
        let weekday = calendar.component(.weekday, from: date)
        let weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        let months = [
            "january", "february", "march", "april", "may", "june", "july", "august",
            "september", "october", "november", "december",
        ]
        let comps = calendar.dateComponents([.day, .month], from: date)
        let day = comps.day ?? 1
        let month = months[(comps.month ?? 1) - 1]
        return "\(weekdays[weekday - 1]) \(day) \(month)"
    }
}
