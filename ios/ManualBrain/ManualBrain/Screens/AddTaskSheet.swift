import SwiftUI

/// components/mobile/AddSheet.jsx, adapted to real due dates instead of the
/// design kit's five urgency buckets (see this project's README § "What
/// changed from the ios kit") — a "today" quick-pick plus a native date
/// picker, exactly how DueDatePicker.tsx offers it on the web, and repeat
/// only appears once a date is actually set (repeat has nothing to advance
/// from otherwise — see manual-brain's lib/repeat.ts).
///
/// Presented as a native `.sheet` rather than the design system's hand-built
/// bottom sheet + scrim: readme.md itself calls that scrim "the system's
/// one mobile-only exception" to no-modals, so leaning on the platform's own
/// equivalent (grabber, rounded top, dimmed backdrop) honors the same intent
/// more idiomatically than reproducing it by hand in SwiftUI.
///
/// The same form also backs the "add" tab (`inline: true`, see AddScreen
/// below): no cancel, and instead of dismissing after a successful add it
/// clears the name and scheduling fields — keeping the chosen list and
/// date — ready for the next one.
struct AddTaskSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    var preselectedSectionId: String?
    var defaultDueDate: String?
    var inline: Bool = false
    var onAdded: ((String) -> Void)? = nil

    @State private var text = ""
    @State private var sectionId: String = ""
    @State private var dueDate: String?
    @State private var minutes: Int?
    @State private var timeOfDay: TimeOfDay?
    @State private var repeatFrequency: RepeatFrequency?
    @State private var assignedTo = ""
    @State private var descriptionText = ""
    @State private var showDatePicker = false

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

                DescriptionField(text: $descriptionText)

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
            }
            .padding(.horizontal, MBSpace.screenPadding)
            // Sheet: clears the grabber (Sheet.jsx's 10pt pad + 4pt grabber +
            // 14pt gap). Tab: the usual gap under a screen header.
            .padding(.top, inline ? MBSpace.gapStack : 28)
            .padding(.bottom, 4)
        }
        .safeAreaInset(edge: .bottom) {
            HStack(spacing: 10) {
                if !inline {
                    SecondaryTextButton(label: "cancel") { dismiss() }
                }
                PrimaryPillButton(label: "add task", enabled: isValid, action: submit)
            }
            .padding(.horizontal, MBSpace.screenPadding)
            .padding(.top, 4)
            .padding(.bottom, 10)
            .background(inline ? Color.bgPage : Color.surfaceCard)
        }
        .background(inline ? Color.bgPage : Color.surfaceCard)
        .scrollDismissesKeyboard(.interactively)
        .presentationBackground(Color.surfaceCard)
        .presentationDetents([.fraction(0.9)])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(MBRadius.panel)
        .onAppear {
            // The tab re-appears on every switch — don't wipe a half-filled form.
            guard sectionId.isEmpty else { return }
            sectionId = preselectedSectionId ?? store.sections.first?.id ?? ""
            dueDate = defaultDueDate
        }
        .onChange(of: store.sections) {
            // Sections can land after the tab first appears (cold launch).
            if sectionId.isEmpty { sectionId = store.sections.first?.id ?? "" }
        }
        .sheet(isPresented: $showDatePicker) {
            DatePickerSheet(dateKey: $dueDate)
        }
    }

    private var isValid: Bool { !text.trimmingCharacters(in: .whitespaces).isEmpty && !sectionId.isEmpty }

    private func submit() {
        guard isValid else { return }
        Task {
            let added = await store.addTask(
                name: text, sectionId: sectionId, dueDate: dueDate, durationMinutes: minutes,
                timeOfDay: timeOfDay, repeatFrequency: repeatFrequency, assignedTo: assignedTo,
                description: descriptionText)
            guard inline else {
                dismiss()
                return
            }
            if added {
                onAdded?(store.sectionName(for: sectionId))
                text = ""
                minutes = nil
                timeOfDay = nil
                repeatFrequency = nil
                assignedTo = ""
                descriptionText = ""
            }
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

/// Who a task is assigned to — free text like the web's AssigneeInput
/// (a person, or "Instinct" for the chat's morning run to pick up), plus
/// one-tap chips for everyone already used so it's rarely typed twice.
struct AssigneeField: View {
    @Binding var text: String
    var suggestions: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            TextField("e.g. instinct", text: $text)
                .font(MBFont.field)
                .foregroundStyle(Color.textBody)
                .textInputAutocapitalization(.words)
                .autocorrectionDisabled()
                .submitLabel(.done)
                .padding(.horizontal, 12)
                .frame(minHeight: MBHitTarget.minimum)
                .background(Color.surfaceInput)
                .clipShape(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous).stroke(Color.borderControl, lineWidth: 1))
            if !suggestions.isEmpty {
                FlowLayout(spacing: 6) {
                    ForEach(suggestions, id: \.self) { name in
                        let on = text.trimmingCharacters(in: .whitespaces).lowercased() == name.lowercased()
                        Chip(label: "@\(name)", selected: on) { text = on ? "" : name }
                    }
                }
            }
        }
    }
}

/// The "add" tab — the add-task form as a screen of its own, in the slot
/// the chat tab used to hold. Header meta confirms the last add.
struct AddScreen: View {
    @EnvironmentObject private var store: AppStore
    @State private var lastAdded: String?

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(
                dateLabel: DueDate.weekdayDateLabel(),
                title: "add",
                meta: lastAdded.map { $0.isEmpty ? "added" : "added to \($0)" }
            )
            AddTaskSheet(
                defaultDueDate: store.todayKey,
                inline: true,
                onAdded: { lastAdded = $0 }
            )
        }
        .background(Color.bgPage)
    }
}

/// A thin wrapper so a "YYYY-MM-DD" string can drive SwiftUI's native
/// `DatePicker` without the rest of the app ever touching a `Date` for due
/// dates — see Support/DueDate.swift's header comment for why that matters.
struct DatePickerSheet: View {
    @Binding var dateKey: String?
    @Environment(\.dismiss) private var dismiss
    @State private var selection: Date = Date()

    var body: some View {
        NavigationStack {
            DatePicker("due date", selection: $selection, displayedComponents: .date)
                .datePickerStyle(.graphical)
                .padding()
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("done") {
                            dateKey = DueDate.key(for: selection)
                            dismiss()
                        }
                    }
                    ToolbarItem(placement: .cancellationAction) {
                        Button("cancel") { dismiss() }
                    }
                }
        }
        .presentationDetents([.medium])
        .onAppear {
            if let key = dateKey, let date = Self.formatter.date(from: key) {
                selection = date
            }
        }
    }

    private static let formatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.timeZone = .current
        return f
    }()
}
