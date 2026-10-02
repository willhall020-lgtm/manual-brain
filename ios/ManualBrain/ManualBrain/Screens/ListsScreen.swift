import SwiftUI

/// screens.jsx's ListsScreen — full-width rows replacing the desktop card
/// grid, plus the "+ add a list" affordance (components/layout/AddListCard).
struct ListsScreen: View {
    @EnvironmentObject private var store: AppStore
    var onOpenList: (String) -> Void

    @State private var addingList = false
    @State private var newListName = ""
    @FocusState private var nameFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(
                dateLabel: "task lists", title: "your lists",
                meta: TaskFieldFormat.count(store.activeTasks.count, noun: "task") + " open"
            )
            ScrollView {
                VStack(spacing: 10) {
                    ForEach(store.sections) { section in
                        let sectionTasks = store.activeTasks.filter { $0.sectionId == section.id }
                        let dueCount = sectionTasks.filter { DueDate.isDueOrOverdue($0.dueDate, todayKey: store.todayKey) }.count
                        MobileListRowView(
                            name: section.name, taskCount: sectionTasks.count, dueCount: dueCount,
                            action: { onOpenList(section.id) }
                        )
                    }

                    addListCard
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.top, 12)
                .padding(.bottom, 26)
            }
        }
        .background(Color.bgPage)
    }

    /// components/layout/AddListCard.jsx — a tall dashed ghost card with its
    /// label sat bottom-left; tapped, it becomes a white ink-bordered card
    /// with an underlined name field and an ink "create list" pill.
    @ViewBuilder
    private var addListCard: some View {
        let shape = RoundedRectangle(cornerRadius: MBRadius.card, style: .continuous)
        if addingList {
            VStack(alignment: .leading, spacing: 12) {
                TextField("list name", text: $newListName)
                    .font(Brand.font(size: 16, weight: .black))
                    .mbTracking(-0.02, fontSize: 16)
                    .focused($nameFocused)
                    .submitLabel(.done)
                    .onSubmit(commitAddList)
                    .padding(.vertical, 2)
                    .overlay(alignment: .bottom) {
                        Rectangle().fill(Color.accentFocus).frame(height: 2).offset(y: 4)
                    }
                Spacer(minLength: 0)
                HStack(spacing: 10) {
                    SecondaryTextButton(label: "cancel") {
                        addingList = false
                        newListName = ""
                    }
                    Button(action: commitAddList) {
                        Text("create list")
                            .font(Brand.font(size: 11, weight: .black))
                            .mbTracking(0.05, fontSize: 11)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(minHeight: MBHitTarget.minimum)
                            .background(Capsule().fill(Color.mbInk))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, minHeight: 126, alignment: .topLeading)
            .background(Color.surfaceCard)
            .clipShape(shape)
            .overlay(shape.strokeBorder(Color.borderStrong, lineWidth: 1.5))
            .onAppear { nameFocused = true }
        } else {
            Button {
                addingList = true
            } label: {
                Text("\(MBGlyph.add) add a list")
                    .font(MBFont.bodyBold)
                    .foregroundStyle(Color.textSubtle)
                    .padding(16)
                    .frame(maxWidth: .infinity, minHeight: 126, alignment: .bottomLeading)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .overlay(shape.strokeBorder(Color.borderDashed, style: StrokeStyle(lineWidth: 1.5, dash: [5, 4])))
        }
    }

    private func commitAddList() {
        let name = newListName
        newListName = ""
        addingList = false
        guard !name.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        Task { await store.addSection(name: name) }
    }
}
