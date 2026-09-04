import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case chat, today, tomorrow, lists, settings
    var id: String { rawValue }
}

/// components/mobile/TabBar.jsx — a custom, type-led tab bar rather than
/// the system `TabView` chrome: Manual Brain has no icon set (readme.md
/// § How the desktop system was adapted), the active tab is marked by a
/// lime underline rather than a tinted icon, and the settings tab is a
/// single fixed-width glyph so it doesn't compete with the four word tabs
/// (readme.md: "the gear glyph carries the variation selector... a fixed
/// 52px glyph tab pulled out of the equal-width flex").
struct TabBarView: View {
    @Binding var selection: AppTab

    var body: some View {
        HStack(spacing: 2) {
            Spacer(minLength: 0)
            tabButton(.chat, label: "chat")
            tabButton(.today, label: "today")
            tabButton(.tomorrow, label: "tomorrow")
            tabButton(.lists, label: "lists")
            tabButton(.settings, glyph: MBGlyph.settings, accessibilityLabel: "settings")
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 8)
        .frame(height: 46)
        .background(
            VStack(spacing: 0) {
                Divider().overlay(Color.borderCard)
                Color.surfaceCard
            }
        )
    }

    @ViewBuilder
    private func tabButton(_ tab: AppTab, label: String? = nil, glyph: String? = nil, accessibilityLabel: String? = nil) -> some View {
        let isOn = selection == tab
        Button {
            selection = tab
        } label: {
            VStack(spacing: 5) {
                if let glyph {
                    Text(glyph)
                        .font(MBFont.tabGlyph)
                        .foregroundStyle(isOn ? Color.textBody : Color.textReadableFloor)
                } else if let label {
                    Text(label)
                        .font(MBFont.tabLabel)
                        .mbTracking(0.04, fontSize: 13)
                        .foregroundStyle(isOn ? Color.textBody : Color.textReadableFloor)
                }
                Capsule()
                    .fill(isOn ? Color.mbLime : Color.clear)
                    .frame(width: 20, height: 2)
            }
            .padding(.horizontal, glyph != nil ? 6 : 12)
            .padding(.vertical, 7)
            .frame(minWidth: 46, minHeight: 46)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(accessibilityLabel ?? label ?? "")
    }
}
