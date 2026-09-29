import SwiftUI

/// The per-tab header — mirrors components/mobile/MobileNavBar.jsx: either
/// a small date eyebrow above the title, or a back pill instead of it when
/// `onBack` is set. Title defaults to the wordmark, same as the web
/// component's own default prop.
struct ScreenHeader: View {
    var dateLabel: String?
    var title: String = "manual brain"
    var meta: String?
    var backLabel: String = "← all lists"
    var onBack: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let onBack {
                // Painted pill is 34pt tall (MobileNavBar.jsx); the 44pt
                // hit box is pulled back in vertically so it costs no layout.
                Button(action: onBack) {
                    Text(backLabel)
                        .font(MBFont.backButton)
                        .foregroundStyle(Color.textBody)
                        .padding(.horizontal, 14)
                        .frame(minHeight: 34)
                        .overlay(Capsule().strokeBorder(Color.mbN750, lineWidth: 1.5))
                        .padding(.vertical, 5)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .padding(.vertical, -5)
            } else if let dateLabel {
                Text(dateLabel)
                    .font(MBFont.eyebrowSmallBold)
                    .mbTracking(0.14, fontSize: 10)
                    .foregroundStyle(Color.textMuted)
            }

            HStack(alignment: .lastTextBaseline, spacing: 12) {
                Text(title)
                    .font(MBFont.screenTitle)
                    .mbTracking(-0.035, fontSize: 27)
                    .mbLowercase()
                    .foregroundStyle(Color.textBody)
                Spacer(minLength: 0)
                if let meta {
                    Text(meta)
                        .font(MBFont.caption)
                        .foregroundStyle(Color.textMuted)
                }
            }
        }
        .padding(.horizontal, MBSpace.screenPadding)
        .padding(.top, 10)
        .padding(.bottom, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.bgPage)
    }
}
