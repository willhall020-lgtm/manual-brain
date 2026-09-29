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
    @State private var renaming = false
    @State private var renameDraft = ""

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
                VStack(spacing: 12) {
                    // screens.jsx's ListDetailScreen: every row, the empty
                    // state and the add strip live in one sunken panel.
                    VStack(spacing: MBSpace.gapListRow) {
                        ForEach(tasks) { task in
                            MobileTaskRowView(
                                task: task,
                                sectionName: nil,
                                todayKey: store.todayKey,
                                flat: false,
                                onOpen: { onOpenTask(task) },
                                onToggleDone: { Task { await store.toggleDone(id: task.id, done: true) } }
                            )
                        }
                        if tasks.isEmpty {
                            EmptyStateCard(text: "this list is empty. nice.", style: .sunken)
                        }
                        AddStripButton(label: "add task", action: onAddTask)
                    }
                    .padding(10)
                    .background(Color.surfaceSunken)
                    .clipShape(RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous))

                    // Rename (Dashboard.tsx's click-to-rename title) and
                    // delete sit together, well away from the task rows.
                    HStack(spacing: 18) {
                        Button {
                            renameDraft = section?.name ?? ""
                            renaming = true
                        } label: {
                            Text("rename this list")
                                .font(MBFont.metaSmBold)
                                .foregroundStyle(Color.textSubtle)
                                .padding(.horizontal, 2)
                                .frame(minHeight: MBHitTarget.minimum)
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        Button {
                            confirmingDelete = true
                        } label: {
                            Text("delete this list")
                                .font(MBFont.metaSmBold)
                                .foregroundStyle(Color.danger)
                                .padding(.horizontal, 2)
                                .frame(minHeight: MBHitTarget.minimum)
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        Spacer(minLength: 0)
                    }
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.top, 12)
                .padding(.bottom, 26)
            }
        }
        .background(Color.bgPage)
        .alert("rename list", isPresented: $renaming) {
            TextField("list name", text: $renameDraft)
            Button("save") {
                let name = renameDraft.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !name.isEmpty, name != section?.name else { return }
                Task { await store.renameSection(id: sectionId, name: name) }
            }
            Button("cancel", role: .cancel) {}
        }
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
