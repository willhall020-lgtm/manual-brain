import SwiftUI

/// screens.jsx's TodayScreen — lime "for today" block, then Done, then the
/// read-only calendar. "For today" is driven entirely by due_date (today or
/// earlier, not done) rather than any bucket a person has to re-triage —
/// see lib/due-date.ts's isDueOrOverdue and this project's own README.
struct TodayScreen: View {
    @EnvironmentObject private var store: AppStore
    @State private var doneOpen = false
    var onOpenTask: (APITask) -> Void
    var onAddTask: () -> Void

    private var todayTasks: [APITask] {
        store.activeTasks
            .filter { DueDate.isDueOrOverdue($0.dueDate, todayKey: store.todayKey) }
            .sorted { ($0.dueDate ?? "") < ($1.dueDate ?? "") }
    }

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(dateLabel: DueDate.weekdayDateLabel())
            ScrollView {
                VStack(spacing: MBSpace.gapStack) {
                    TodayBlockView(count: todayTasks.count) {
                        ForEach(todayTasks) { task in
                            MobileTaskRowView(
                                task: task,
                                sectionName: store.sectionName(for: task.sectionId),
                                todayKey: store.todayKey,
                                isBooking: store.bookingTaskIDs.contains(task.id),
                                googleCalendarConnected: store.settings?.googleCalendarConnected ?? false,
                                flat: true,
                                onOpen: { onOpenTask(task) },
                                onToggleDone: { Task { await store.toggleDone(id: task.id, done: true) } },
                                onBook: { Task { await store.bookTask(id: task.id) } }
                            )
                        }
                        if todayTasks.isEmpty {
                            EmptyStateCard(text: "nothing marked for today. that's allowed.")
                        }
                        AddStripButton(label: "add something for today", tone: .lime, action: onAddTask)
                    }

                    DonePanelView(
                        items: store.doneTasks,
                        sectionName: { store.sectionName(for: $0) },
                        isOpen: $doneOpen,
                        onUndo: { id in Task { await store.toggleDone(id: id, done: false) } }
                    )

                    AgendaListView(
                        label: "today's calendar",
                        events: (store.calendar?.events ?? []).filter { $0.day == "today" },
                        configured: store.calendar?.configured ?? false,
                        loadError: store.calendar?.error ?? false
                    )
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.bottom, 26)
            }
        }
        .background(Color.bgPage)
    }
}
