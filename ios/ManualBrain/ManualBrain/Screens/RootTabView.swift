import SwiftUI

/// Owns tab selection and the sheets that float above every tab (add task,
/// edit task) — the native SwiftUI shape of what IosApp.jsx does for the
/// prototype.
struct RootTabView: View {
    @EnvironmentObject private var store: AppStore
    @State private var selection: AppTab = .today
    @State private var listDetailSectionId: String?
    @State private var addSheet: AddSheetContext?
    @State private var editingTask: APITask?

    struct AddSheetContext: Identifiable {
        let id = UUID()
        var preselectedSectionId: String?
        var defaultDueDate: String?
    }

    var body: some View {
        VStack(spacing: 0) {
            if let error = store.actionError {
                ErrorBanner(message: error) { store.actionError = nil }
                    .padding(.top, 8)
            }

            ZStack {
                switch selection {
                case .chat:
                    ChatScreen()
                case .today:
                    TodayScreen(
                        onOpenTask: { editingTask = $0 },
                        onAddTask: { addSheet = AddSheetContext(preselectedSectionId: nil, defaultDueDate: store.todayKey) }
                    )
                case .tomorrow:
                    TomorrowScreen(onOpenTask: { editingTask = $0 })
                case .lists:
                    if let sectionId = listDetailSectionId,
                       store.sections.contains(where: { $0.id == sectionId }) {
                        ListDetailScreen(
                            sectionId: sectionId,
                            onBack: { listDetailSectionId = nil },
                            onOpenTask: { editingTask = $0 },
                            onAddTask: {
                                addSheet = AddSheetContext(preselectedSectionId: sectionId, defaultDueDate: store.todayKey)
                            }
                        )
                    } else {
                        ListsScreen(onOpenList: { listDetailSectionId = $0 })
                    }
                case .settings:
                    SettingsScreen()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            TabBarView(selection: Binding(
                get: { selection },
                set: { newValue in
                    if newValue != .lists { listDetailSectionId = nil }
                    selection = newValue
                }
            ))
        }
        .background(Color.bgPage)
        .ignoresSafeArea(.container, edges: .bottom)
        .sheet(item: $addSheet) { context in
            AddTaskSheet(
                preselectedSectionId: context.preselectedSectionId,
                defaultDueDate: context.defaultDueDate
            )
        }
        .sheet(item: $editingTask) { task in
            TaskDetailSheet(task: task)
        }
        .task { await store.refreshAll() }
        .refreshable { await store.refreshAll() }
    }
}
