import SwiftUI

/// screens.jsx's TomorrowScreen — in the design bundle this was necessarily
/// a "near horizon" view (2-3 days / end of week buckets) because the
/// prototype's data model had no real dates yet. The backend now has real
/// `due_date`s (see manual-brain's lib/due-date.ts and this project's own
/// README § "What changed from the ios kit"), so this is the literal date
/// filter the kit's own README said it would become once that happened —
/// every task due exactly tomorrow.
struct TomorrowScreen: View {
    @EnvironmentObject private var store: AppStore
    var onOpenTask: (APITask) -> Void

    private var tomorrowTasks: [APITask] {
        store.activeTasks
            .filter { $0.dueDate == store.tomorrowKey }
            .sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    }

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(
                dateLabel: DueDate.weekdayDateLabel(for: Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()),
                title: "tomorrow",
                meta: TaskFieldFormat.count(tomorrowTasks.count, noun: "task")
            )
            ScrollView {
                VStack(spacing: MBSpace.gapStack) {
                    VStack(spacing: MBSpace.gapListRow) {
                        ForEach(tomorrowTasks) { task in
                            MobileTaskRowView(
                                task: task,
                                sectionName: store.sectionName(for: task.sectionId),
                                todayKey: store.todayKey,
                                isBooking: store.bookingTaskIDs.contains(task.id),
                                googleCalendarConnected: store.settings?.googleCalendarConnected ?? false,
                                flat: false,
                                onOpen: { onOpenTask(task) },
                                onToggleDone: { Task { await store.toggleDone(id: task.id, done: true) } },
                                onBook: { Task { await store.bookTask(id: task.id) } }
                            )
                        }
                        if tomorrowTasks.isEmpty {
                            EmptyStateCard(text: "nothing lined up. tomorrow is open.", dashed: true)
                        }
                    }

                    AgendaListView(
                        label: "tomorrow's calendar",
                        events: (store.calendar?.events ?? []).filter { $0.day == "tomorrow" },
                        configured: store.calendar?.configured ?? false,
                        loadError: store.calendar?.error ?? false,
                        showNowMarker: false
                    )
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.bottom, 26)
            }
        }
        .background(Color.bgPage)
    }
}
