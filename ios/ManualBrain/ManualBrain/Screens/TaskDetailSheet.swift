import SwiftUI

/// components/mobile/TaskSheet.jsx — the same field set as AddTaskSheet
/// plus "mark it done" at the top and "delete this task" at the bottom,
/// deliberately far from Save (readme.md § Touch targets: "destructive
/// controls stay out of dense rows" — delete lives only here, never on the
/// row itself).
struct TaskDetailSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    var task: APITask

    @State private var text = ""
    @State private var sectionId = ""
    @State private var dueDate: String?
    @State private var minutes: Int?
    @State private var timeOfDay: TimeOfDay?
    @State private var repeatFrequency: RepeatFrequency?
    @State private var showDatePicker = false
    @State private var confirmingDelete = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    TextField("what needs doing?", text: $text)
                        .font(.system(size: 17, weight: .semibold))
                        .padding(.bottom, 8)
                        .overlay(Rectangle().fill(Color.accentFocus).frame(height: 2), alignment: .bottom)

                    Button {
                        Task {
                            await store.toggleDone(id: task.id, done: true)
                            dismiss()
                        }
                    } label: {
                        HStack(spacing: 10) {
                            Circle().stroke(Color.borderCheck, lineWidth: 1.5).frame(width: 21, height: 21)
                            Text("mark it done").font(MBFont.bodySm).mbLowercase()
                        }
                        .foregroundStyle(Color.textSubtle)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 13)
                        .frame(minHeight: 48)
                    }
                    .background(
                        RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                            .strokeBorder(Color.borderDashed, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                    )

                    fieldGroup("which list?") {
                        FlowLayout(spacing: 6) {
                            ForEach(store.sections) { section in
                                Chip(label: section.name, selected: sectionId == section.id) {
                                    sectionId = section.id
                                }
                            }
                        }
                    }

                    fieldGroup("due date") {
                        HStack(spacing: 8) {
                            Chip(label: "today", selected: dueDate == store.todayKey) {
                                dueDate = store.todayKey
                            }
                            Button {
                                showDatePicker = true
                            } label: {
                                Text(dueDate.map(DueDate.format) ?? "pick a date")
                                    .font(MBFont.metaBold)
                                    .foregroundStyle(Color.mbG800)
                                    .padding(.horizontal, 12)
                                    .frame(minHeight: MBHitTarget.minimum)
                            }
                            .background(Color.surfaceInput)
                            .clipShape(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous).stroke(Color.borderControl, lineWidth: 1))
                            if dueDate != nil {
                                Button {
                                    dueDate = nil
                                    repeatFrequency = nil
                                } label: {
                                    Text(MBGlyph.delete)
                                        .foregroundStyle(Color.textFaint)
                                        .frame(width: MBHitTarget.minimum, height: MBHitTarget.minimum)
                                }
                            }
                        }
                    }

                    fieldGroup("how long?") {
                        FlowLayout(spacing: 6) {
                            ForEach(DurationOption.minutesOptions, id: \.self) { m in
                                Chip(label: DurationOption.label(forMinutes: m), selected: minutes == m) {
                                    minutes = (minutes == m) ? nil : m
                                }
                            }
                        }
                    }

                    fieldGroup("when?") {
                        FlowLayout(spacing: 6) {
                            Chip(label: "any time", selected: timeOfDay == nil) { timeOfDay = nil }
                            ForEach(TimeOfDay.allCases) { option in
                                Chip(label: option.label, selected: timeOfDay == option) { timeOfDay = option }
                            }
                        }
                    }

                    if dueDate != nil {
                        fieldGroup("repeats?") {
                            FlowLayout(spacing: 6) {
                                Chip(label: "never", selected: repeatFrequency == nil) { repeatFrequency = nil }
                                ForEach(RepeatFrequency.allCases) { option in
                                    Chip(label: option.label, selected: repeatFrequency == option) { repeatFrequency = option }
                                }
                            }
                        }
                    }

                    Button("delete this task", role: .destructive) {
                        confirmingDelete = true
                    }
                    .font(MBFont.metaBold)
                    .foregroundStyle(Color.danger)
                    .frame(minHeight: MBHitTarget.minimum, alignment: .leading)
                }
                .padding(MBSpace.screenPadding)
            }
            .safeAreaInset(edge: .bottom) {
                HStack(spacing: 10) {
                    SecondaryTextButton(label: "cancel") { dismiss() }
                    PrimaryPillButton(label: "save", enabled: isValid, action: submit)
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.vertical, 10)
                .background(Color.bgPage)
            }
            .background(Color.bgPage)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("edit task").font(MBFont.eyebrowSmall).mbTracking(0.14, fontSize: 10).foregroundStyle(Color.iconRest)
                }
            }
        }
        .presentationDetents([.fraction(0.9)])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(MBRadius.panel)
        .onAppear {
            text = task.name
            sectionId = task.sectionId
            dueDate = task.dueDate
            minutes = task.durationMinutes
            timeOfDay = task.timeOfDay.flatMap(TimeOfDay.init(rawValue:))
            repeatFrequency = task.repeatFrequency.flatMap(RepeatFrequency.init(rawValue:))
        }
        .sheet(isPresented: $showDatePicker) {
            DatePickerSheet(dateKey: $dueDate)
        }
        .confirmationDialog(
            "delete \"\(task.name)\"? this can't be undone.",
            isPresented: $confirmingDelete, titleVisibility: .visible
        ) {
            Button("delete task", role: .destructive) {
                Task {
                    await store.deleteTask(id: task.id)
                    dismiss()
                }
            }
            Button("cancel", role: .cancel) {}
        }
    }

    private var isValid: Bool { !text.trimmingCharacters(in: .whitespaces).isEmpty }

    private func submit() {
        guard isValid else { return }
        Task {
            await store.saveTask(
                id: task.id, name: text, sectionId: sectionId, dueDate: dueDate,
                durationMinutes: minutes, timeOfDay: timeOfDay, repeatFrequency: repeatFrequency)
            dismiss()
        }
    }

    @ViewBuilder
    private func fieldGroup<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(MBFont.eyebrowSmall)
                .mbTracking(0.14, fontSize: 10)
                .foregroundStyle(Color.iconRest)
            content()
        }
    }
}
