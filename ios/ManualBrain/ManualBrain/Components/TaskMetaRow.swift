import SwiftUI

/// The scheduling metadata line under a task's title — due date, duration,
/// time of day, repeat, book state — in their canonical order, mirroring
/// components/tasks/TaskMeta.jsx exactly (including which pieces are
/// mutually exclusive with "not shown at all").
struct TaskMetaRow: View {
    var task: APITask
    var todayKey: String
    var isBooking: Bool
    var googleCalendarConnected: Bool
    var onBook: () -> Void

    private var overdue: Bool {
        guard let due = task.dueDate else { return false }
        return DueDate.isOverdue(due, todayKey: todayKey)
    }

    var body: some View {
        let hasAnything =
            task.dueDate != nil || task.durationMinutes != nil || task.timeOfDay != nil
            || task.repeatFrequency != nil

        if hasAnything {
            HStack(spacing: 8) {
                if let due = task.dueDate {
                    Text(DueDate.displayLabel(dueDate: due, todayKey: todayKey) ?? "")
                        .font(overdue ? MBFont.metaBold : MBFont.meta)
                        .foregroundStyle(overdue ? Color.textOverdue : Color.textMuted)
                }
                if let minutes = task.durationMinutes {
                    Text(DurationOption.label(forMinutes: minutes))
                        .font(MBFont.meta)
                        .foregroundStyle(Color.textMuted)
                }
                if let when = task.timeOfDay {
                    Text(when)
                        .font(MBFont.meta)
                        .foregroundStyle(Color.textFaint)
                }
                if let repeatFrequency = task.repeatFrequency {
                    Text("\(MBGlyph.repeats) \(repeatFrequency)")
                        .font(MBFont.micro)
                        .foregroundStyle(Color.textMuted)
                }
                if googleCalendarConnected {
                    BookPill(booked: task.isBooked, busy: isBooking, action: onBook)
                }
            }
            .mbLowercase()
            .fixedSize(horizontal: false, vertical: true)
        }
    }
}

/// components/tasks/TaskMeta.jsx's BookButton — a pill that hands the task
/// to the chat's scheduling loop (POST /api/tasks/:id/book) rather than a
/// separate "pick a time" UI of its own.
///
/// The web version solves "44pt tap target, zero layout cost" inside its
/// wrapping meta row with a `.mb-hit` pseudo-element overlay (readme.md
/// § Touch targets). SwiftUI has no equivalent that doesn't also reserve
/// the extra space in a wrapping HStack, so this keeps the pill's own
/// generous padding but doesn't force a full 44pt frame here — a known,
/// documented simplification (see ios/README.md) rather than a silent one.
struct BookPill: View {
    var booked: Bool
    var busy: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(booked ? "booked" : (busy ? "booking…" : "book"))
                .font(MBFont.micro)
                .mbTracking(0.05, fontSize: 10.5)
                .foregroundStyle(booked ? Color.textBooked : .white)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
        }
        .background(Capsule().fill(booked ? Color.surfaceBooked : Color.mbInk))
        .disabled(booked || busy)
    }
}
