import Foundation

/// Mirrors lib/time-of-day.ts.
enum TimeOfDay: String, CaseIterable, Identifiable {
    case morning, afternoon, evening
    var id: String { rawValue }
    var label: String { rawValue } // already lowercase, matches the house style
}

/// Mirrors lib/repeat.ts.
enum RepeatFrequency: String, CaseIterable, Identifiable {
    case daily, weekly, monthly
    var id: String { rawValue }
    var label: String { rawValue }
}

/// The duration quick-picks offered in the add/edit sheets — same set as
/// the design system's AddSheet.jsx (`DURATIONS`).
enum DurationOption {
    static let minutesOptions = [15, 30, 45, 60, 90]

    static func label(forMinutes minutes: Int) -> String {
        if minutes >= 60 && minutes % 60 == 0 {
            return "\(minutes / 60) hr"
        }
        return "\(minutes) min"
    }
}

enum TaskFieldFormat {
    /// "1 task" / "6 tasks" — the singular-aware count style used
    /// throughout the product's copy (see readme.md § Content fundamentals).
    static func count(_ n: Int, noun: String) -> String {
        n == 1 ? "1 \(noun)" : "\(n) \(noun)s"
    }
}
