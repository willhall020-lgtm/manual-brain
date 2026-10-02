import SwiftUI

/// The scheduling metadata line under a task's title — due date, duration,
/// time of day, repeat, assignee — in their canonical order, mirroring
/// components/tasks/TaskMeta.jsx exactly (including which pieces are
/// mutually exclusive with "not shown at all").
struct TaskMetaRow: View {
    var task: APITask
    var todayKey: String

    private var overdue: Bool {
        guard let due = task.dueDate else { return false }
        return DueDate.isOverdue(due, todayKey: todayKey)
    }

    var body: some View {
        let hasAnything =
            task.dueDate != nil || task.durationMinutes != nil || task.timeOfDay != nil
            || task.repeatFrequency != nil || task.assignedTo != nil

        if hasAnything {
            // FlowLayout, not HStack: the web version marks every one of
            // these labels `whiteSpace: "nowrap"` and lets the *row* wrap as
            // whole chips onto a second line when they don't all fit
            // (`flexWrap: wrap` in TaskMeta.jsx) — an HStack instead
            // compresses each Text below its own width and wraps individual
            // words mid-label (the "bo"/"ok" bug). FlowLayout sizes every
            // child at its own unconstrained ideal width, so a chip can
            // wrap to the next line as a whole, but never breaks internally.
            FlowLayout(spacing: 8, lineSpacing: 4) {
                if let due = task.dueDate {
                    Text(DueDate.displayLabel(dueDate: due, todayKey: todayKey) ?? "")
                        .font(overdue ? MBFont.metaBold : MBFont.meta)
                        .foregroundStyle(overdue ? Color.textOverdue : Color.textMuted)
                        .lineLimit(1)
                        .fixedSize()
                }
                if let minutes = task.durationMinutes {
                    Text(DurationOption.label(forMinutes: minutes))
                        .font(MBFont.meta)
                        .foregroundStyle(Color.textMuted)
                        .lineLimit(1)
                        .fixedSize()
                }
                if let when = task.timeOfDay {
                    Text(when)
                        .font(MBFont.meta)
                        .foregroundStyle(Color.textFaint)
                        .lineLimit(1)
                        .fixedSize()
                }
                if let repeatFrequency = task.repeatFrequency {
                    Text("\(MBGlyph.repeats) \(repeatFrequency)")
                        .font(MBFont.micro)
                        .foregroundStyle(Color.textMuted)
                        .lineLimit(1)
                        .fixedSize()
                }
                if let assignee = task.assignedTo, !assignee.isEmpty {
                    // AssigneeInput.tsx's resting label.
                    Text("@\(assignee)")
                        .font(MBFont.micro)
                        .mbTracking(0.02, fontSize: 10.5)
                        .foregroundStyle(Color.textSubtle)
                        .lineLimit(1)
                        .fixedSize()
                }
            }
            .mbLowercase()
        }
    }
}
