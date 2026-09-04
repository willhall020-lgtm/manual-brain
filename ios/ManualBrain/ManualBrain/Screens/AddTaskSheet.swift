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
struct AddTaskSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    var preselectedSectionId: String?
    var defaultDueDate: String?

    @State private var text = ""
    @State private var sectionId: String = ""
    @State private var dueDate: String?
    @State private var minutes: Int?
    @State private var timeOfDay: TimeOfDay?
    @State private var repeatFrequency: RepeatFrequency?
    @State private var showDatePicker = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    TextField("what needs doing?", text: $text)
                        .font(.system(size: 17, weight: .semibold))
                        .padding(.bottom, 8)
                        .overlay(Rectangle().fill(Color.accentFocus).frame(height: 2), alignment: .bottom)

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
                }
                .padding(MBSpace.screenPadding)
            }
            .safeAreaInset(edge: .bottom) {
                HStack(spacing: 10) {
                    SecondaryTextButton(label: "cancel") { dismiss() }
                    PrimaryPillButton(label: "add task", enabled: isValid, action: submit)
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.vertical, 10)
                .background(Color.bgPage)
            }
            .background(Color.bgPage)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("new task").font(MBFont.eyebrowSmall).mbTracking(0.14, fontSize: 10).foregroundStyle(Color.iconRest)
                }
            }
        }
        .presentationDetents([.fraction(0.9)])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(MBRadius.panel)
        .onAppear {
            sectionId = preselectedSectionId ?? store.sections.first?.id ?? ""
            dueDate = defaultDueDate
        }
        .sheet(isPresented: $showDatePicker) {
            DatePickerSheet(dateKey: $dueDate)
        }
    }

    private var isValid: Bool { !text.trimmingCharacters(in: .whitespaces).isEmpty && !sectionId.isEmpty }

    private func submit() {
        guard isValid else { return }
        Task {
            await store.addTask(
                name: text, sectionId: sectionId, dueDate: dueDate, durationMinutes: minutes,
                timeOfDay: timeOfDay, repeatFrequency: repeatFrequency)
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
