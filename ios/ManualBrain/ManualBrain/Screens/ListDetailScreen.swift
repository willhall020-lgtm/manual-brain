import SwiftUI

/// screens.jsx's ListDetailScreen — the sunken grey container holding a
/// single list's rows, plus a delete-list confirmation (mirrors
/// Dashboard.tsx's window.confirm on the web).
struct ListDetailScreen: View {
    @EnvironmentObject private var store: AppStore
    var sectionId: String
    var onBack: () -> Void
    var onOpenTask: (APITask) -> Void
    var onAddTask: () -> Void

    @State private var confirmingDelete = false

    private var section: Section? { store.sections.first(where: { $0.id == sectionId }) }
    private var tasks: [APITask] {
        store.activeTasks
            .filter { $0.sectionId == sectionId }
            .sorted { a, b in
                switch (a.dueDate, b.dueDate) {
                case (nil, nil): return false
                case (nil, _): return false
                case (_, nil): return true
                case (let x?, let y?): return x < y
                }
            }
    }

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(
                title: section?.name ?? "",
                meta: TaskFieldFormat.count(tasks.count, noun: "task"),
                onBack: onBack
            )
            ScrollView {
                VStack(spacing: MBSpace.gapListRow) {
                    ForEach(tasks) { task in
                        MobileTaskRowView(
                            task: task,
                            sectionName: nil,
                            todayKey: store.todayKey,
                            isBooking: store.bookingTaskIDs.contains(task.id),
                            googleCalendarConnected: store.settings?.googleCalendarConnected ?? false,
                            flat: false,
                            onOpen: { onOpenTask(task) },
                            onToggleDone: { Task { await store.toggleDone(id: task.id, done: true) } },
                            onBook: { Task { await store.bookTask(id: task.id) } }
                        )
                    }
                    if tasks.isEmpty {
                        EmptyStateCard(text: "this list is empty. nice.", dashed: true)
                    }
                    AddStripButton(label: "add task", action: onAddTask)

                    Button("delete this list", role: .destructive) {
                        confirmingDelete = true
                    }
                    .font(MBFont.metaBold)
                    .foregroundStyle(Color.danger)
                    .frame(minHeight: MBHitTarget.minimum)
                    .padding(.top, 8)
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.bottom, 26)
            }
        }
        .background(Color.bgPage)
        .confirmationDialog(
            "delete \"\(section?.name ?? "this list")\" and all its tasks? this can't be undone.",
            isPresented: $confirmingDelete, titleVisibility: .visible
        ) {
            Button("delete list", role: .destructive) {
                Task {
                    await store.deleteSection(id: sectionId)
                    onBack()
                }
            }
            Button("cancel", role: .cancel) {}
        }
    }
}
