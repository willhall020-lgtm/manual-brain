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
                Button(action: onBack) {
                    Text(backLabel)
                        .font(MBFont.metaBold)
                        .foregroundStyle(Color.textBody)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                }
                .background(Capsule().stroke(Color.mbN750, lineWidth: 1.5))
                .frame(minHeight: MBHitTarget.minimum, alignment: .leading)
            } else if let dateLabel {
                Text(dateLabel)
                    .font(MBFont.eyebrowSmall)
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
