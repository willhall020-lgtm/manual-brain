import SwiftUI
import UIKit

/// screens.jsx's SettingsScreen, re-grounded in the real backend rather
/// than the design kit's invented urgency-display/quick-add toggles — those
/// were speculative constants in an earlier build of Dashboard.tsx that no
/// longer exist now that urgency buckets were replaced by real due dates
/// (see manual-brain's schema.sql and this project's README § "What
/// changed from the ios kit"). What's here instead is what the current
/// backend actually exposes: the read-only calendar's own status
/// (CalendarPanel.tsx's "google · read only" line), the separate
/// write-access OAuth connection (app/settings/page.tsx), the chat's
/// planning rules (lib/preferences.ts), and log out.
struct SettingsScreen: View {
    @EnvironmentObject private var store: AppStore
    @State private var rulesDraft: String = ""
    @State private var showLogoutConfirm = false

    /// Derived, not tracked: setting the draft on appear must not count as an edit.
    private var rulesDirty: Bool { rulesDraft != (store.settings?.planningRules ?? "") }

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(
                dateLabel: "manual brain", title: "settings",
                meta: TaskFieldFormat.count(store.activeTasks.count, noun: "task")
                    + " · \(store.doneTasks.count) done"
            )
            ScrollView {
                VStack(spacing: 10) {
                    SettingsRowView(
                        label: "calendar",
                        description: "manual brain can see your day so it can show you its shape. it never writes to your calendar.",
                        value: (store.settings?.calendarReadConfigured ?? false) ? "google · read only" : "not set up"
                    )

                    SettingsRowView(
                        label: "google calendar — write access",
                        description: "separate from the read-only view above. this lets the chat actually book events on your calendar."
                    ) {
                        HStack(spacing: 10) {
                            if let settings = store.settings, settings.googleOAuthConfigured {
                                Text(settings.googleCalendarConnected ? "connected" : "not connected")
                                    .font(MBFont.metaBold)
                                    .foregroundStyle(settings.googleCalendarConnected ? Color.mbOlive : Color.textSubtle)
                                Button {
                                    openGoogleConnect()
                                } label: {
                                    Text(store.settings?.googleCalendarConnected == true ? "reconnect" : "connect")
                                        .font(MBFont.microBlack)
                                        .mbTracking(0.05, fontSize: 10.5)
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 14)
                                        .frame(minHeight: 34)
                                        .background(Capsule().fill(Color.mbInk))
                                        .padding(.vertical, 5)
                                        .contentShape(Rectangle())
                                }
                                .buttonStyle(.plain)
                            } else {
                                Text("not set up on the server yet.")
                                    .font(MBFont.metaSm)
                                    .foregroundStyle(Color.textSubtle)
                            }
                        }
                    }

                    SettingsRowView(label: "planning rules", description: "how the chat decides what to book and when — read by the model, not parsed, so write it however makes sense to you.") {
                        VStack(alignment: .leading, spacing: 8) {
                            // AddSheet.jsx's `field` style: sunken-white input,
                            // 1px control border, 10pt radius. TextEditor paints
                            // its own opaque background unless it's hidden.
                            TextEditor(text: $rulesDraft)
                                .font(MBFont.field)
                                .foregroundStyle(Color.textBody)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 140)
                                .padding(.horizontal, 7)
                                .padding(.vertical, 4)
                                .background(Color.surfaceInput)
                                .clipShape(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous)
                                        .stroke(Color.borderControl, lineWidth: 1)
                                )
                            HStack {
                                SecondaryTextButton(label: "reset to default") {
                                    rulesDraft = store.settings?.defaultPlanningRules ?? ""
                                }
                                Spacer()
                                // AddButton.jsx: grey until there's something to save.
                                Button {
                                    Task {
                                        await store.savePlanningRules(rulesDraft)
                                    }
                                } label: {
                                    Text("save")
                                        .font(Brand.font(size: 11, weight: .black))
                                        .mbTracking(0.05, fontSize: 11)
                                        .foregroundStyle(rulesDirty ? .white : Color.iconRest)
                                        .padding(.horizontal, 18)
                                        .frame(minHeight: 34)
                                        .background(Capsule().fill(rulesDirty ? Color.mbInk : Color.mbN600))
                                        .padding(.vertical, 5)
                                        .contentShape(Rectangle())
                                }
                                .buttonStyle(.plain)
                                .disabled(!rulesDirty)
                            }
                        }
                    }

                    Button {
                        showLogoutConfirm = true
                    } label: {
                        Text("log out")
                            .font(MBFont.metaSmBold)
                            .foregroundStyle(Color.textBody)
                            .frame(maxWidth: .infinity)
                            .frame(minHeight: 48)
                            .overlay(Capsule().strokeBorder(Color.mbN750, lineWidth: 1.5))
                            .contentShape(Capsule())
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 4)
                }
                .padding(.horizontal, MBSpace.screenPadding)
                .padding(.top, 14)
                .padding(.bottom, 26)
            }
        }
        .background(Color.bgPage)
        .onAppear { rulesDraft = store.settings?.planningRules ?? "" }
        .onChange(of: store.settings?.planningRules) { oldValue, newValue in
            // Only follow the server's copy while there are no local edits.
            if rulesDraft == (oldValue ?? "") { rulesDraft = newValue ?? "" }
        }
        .confirmationDialog("log out of manual brain?", isPresented: $showLogoutConfirm, titleVisibility: .visible) {
            Button("log out", role: .destructive) { Task { await store.logout() } }
            Button("cancel", role: .cancel) {}
        }
    }

    /// Google's OAuth redirect URI is pinned to this deploy's own domain
    /// (manual-brain's README: "changing the canonical domain means
    /// updating that too"), so this app can't complete the flow with a
    /// custom URL scheme the way a fully native OAuth integration would —
    /// it hands off to the system browser, the same "connect" link
    /// app/settings/page.tsx renders, and the user comes back here to see
    /// the result reflected once GET /api/settings is re-read.
    private func openGoogleConnect() {
        if let url = URL(string: store.serverURLString)?.appendingPathComponent("api/auth/google/start") {
            UIApplication.shared.open(url)
        }
    }
}
