import SwiftUI

/// screens.jsx's ListsScreen — full-width rows replacing the desktop card
/// grid, plus the "+ add a list" affordance (components/layout/AddListCard).
struct ListsScreen: View {
    @EnvironmentObject private var store: AppStore
    var onOpenList: (String) -> Void

    @State private var addingList = false
    @State private var newListName = ""

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(
                dateLabel: "task lists", title: "your lists",
                meta: TaskFieldFormat.count(store.activeTasks.count, noun: "task") + " open"
            )
            ScrollView {
                VStack(spacing: MBSpace.gapListRow) {
                    ForEach(store.sections) { section in
                        let sectionTasks = store.activeTasks.filter { $0.sectionId == section.id }
                        let dueCount = sectionTasks.filter { DueDate.isDueOrOverdue($0.dueDate, todayKey: store.todayKey) }.count
                        MobileListRowView(
                            name: section.name, taskCount: sectionTasks.count, dueCount: dueCount,
                            action: { onOpenList(section.id) }
                        )
                    }

                    if addingList {
                        HStack(spacing: 10) {
                            TextField("list name", text: $newListName)
                                .font(MBFont.body)
                                .submitLabel(.done)
                                .onSubmit(commitAddList)
                            Button("add") { commitAddList() }
                                .font(MBFont.metaBold)
                        }
                        .padding(16)
                        .background(Color.surfaceCard)
                        .clipShape(RoundedRectangle(cornerRadius: MBRadius.card, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: MBRadius.card, style: .continuous)
                                .stroke(Color.mbInk, lineWidth: 1.5)
                        )
                    } else {
                        Button {
                            addingList = true
                        } label: {
                            HStack {
                                Text("\(MBGlyph.add) add a list")
                                    .font(MBFont.bodyMedium)
                                    .mbLowercase()
                            }
                            .foregroundStyle(Color.textSubtle)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(16)
                            .frame(minHeight: 72)
                        }
                        .background(
                            RoundedRectangle(cornerRadius: MBRadius.card, style: .continuous)
                                .strokeBorder(Color.borderDashed, style: StrokeStyle(lineWidth: 1.5, dash: [5, 4]))
                        )
                    }
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.bottom, 26)
            }
        }
        .background(Color.bgPage)
    }

    private func commitAddList() {
        let name = newListName
        newListName = ""
        addingList = false
        guard !name.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        Task { await store.addSection(name: name) }
    }
}
