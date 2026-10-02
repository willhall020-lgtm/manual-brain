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
    @State private var assignedTo = ""
    @State private var showDatePicker = false
    @State private var confirmingDelete = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                TextField("what needs doing?", text: $text)
                    .font(MBFont.sheetTitleField)
                    .mbTracking(-0.01, fontSize: 17)
                    .foregroundStyle(Color.textBody)
                    .padding(.top, 4)
                    .padding(.bottom, 8)
                    .overlay(Rectangle().fill(Color.accentFocus).frame(height: 2), alignment: .bottom)

                Button {
                    Task {
                        await store.toggleDone(id: task.id, done: true)
                        dismiss()
                    }
                } label: {
                    HStack(spacing: 10) {
                        Circle()
                            .strokeBorder(Color.borderCheck, lineWidth: 1.5)
                            .background(Circle().fill(Color.surfaceCard))
                            .frame(width: 21, height: 21)
                        Text("mark it done").font(MBFont.bodySmBold).mbLowercase()
                    }
                    .foregroundStyle(Color.textSubtle)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 13)
                    .frame(minHeight: 48)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
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
                        // AddSheet.jsx's `field` style date input, opening
                        // the native picker rather than typing a date.
                        Button {
                            showDatePicker = true
                        } label: {
                            Text(dueDate.map(DueDate.format) ?? "pick a date")
                                .font(MBFont.field)
                                .foregroundStyle(dueDate == nil ? Color.textPlaceholder : Color.textBody)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal, 12)
                                .frame(minHeight: MBHitTarget.minimum)
                                .background(Color.surfaceInput)
                                .clipShape(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous))
                                .overlay(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous).stroke(Color.borderControl, lineWidth: 1))
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        if dueDate != nil {
                            Button {
                                dueDate = nil
                                repeatFrequency = nil
                            } label: {
                                Text(MBGlyph.delete)
                                    .font(Brand.font(size: 12, weight: .regular))
                                    .foregroundStyle(Color.iconRest)
                                    .frame(width: MBHitTarget.minimum, height: MBHitTarget.minimum)
                                    .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("clear due date")
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

                fieldGroup("assigned to?") {
                    AssigneeField(text: $assignedTo, suggestions: store.knownAssignees)
                }

                Button {
                    confirmingDelete = true
                } label: {
                    Text("delete this task")
                        .font(MBFont.metaSmBold)
                        .foregroundStyle(Color.danger)
                        .padding(.horizontal, 2)
                        .frame(minHeight: MBHitTarget.minimum)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, MBSpace.screenPadding)
            .padding(.top, 28) // clears the grabber: Sheet.jsx's 10pt pad + 4pt grabber + 14pt gap
            .padding(.bottom, 4)
        }
        .safeAreaInset(edge: .bottom) {
            HStack(spacing: 10) {
                SecondaryTextButton(label: "cancel") { dismiss() }
                PrimaryPillButton(label: "save", enabled: isValid, action: submit)
            }
            .padding(.horizontal, MBSpace.screenPadding)
            .padding(.top, 4)
            .padding(.bottom, 10)
            .background(Color.surfaceCard)
        }
        .scrollDismissesKeyboard(.interactively)
        .presentationBackground(Color.surfaceCard)
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
            assignedTo = task.assignedTo ?? ""
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
                durationMinutes: minutes, timeOfDay: timeOfDay, repeatFrequency: repeatFrequency,
                assignedTo: assignedTo)
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
