import SwiftUI

/// components/mobile/MobileListRow.jsx — full-width list row replacing the
/// desktop card grid, which can't work one-handed (readme.md § How the
/// desktop system was adapted).
struct MobileListRowView: View {
    var name: String
    var taskCount: Int
    var dueCount: Int
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 9) {
                    Text(name)
                        .font(MBFont.listRowTitle)
                        .mbTracking(-0.025, fontSize: 17)
                        .mbLowercase()
                        .foregroundStyle(Color.textBody)
                    HStack(spacing: 7) {
                        Text(TaskFieldFormat.count(taskCount, noun: "task"))
                            .font(MBFont.metaSm)
                            .foregroundStyle(Color.textMuted)
                        if dueCount > 0 {
                            Text("\(dueCount) due")
                                .font(MBFont.microBlack)
                                .mbTracking(0.03, fontSize: 10.5)
                                .foregroundStyle(Color.mbInk)
                                .padding(.horizontal, 9)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(Color.mbLime))
                        }
                    }
                }
                Spacer(minLength: 0)
                Text(MBGlyph.openList)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(Color.mbN950)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 15)
        }
        .buttonStyle(.plain)
        .frame(minHeight: 72)
        .background(Color.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.card, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: MBRadius.card, style: .continuous)
                .stroke(Color.borderCard, lineWidth: 1)
        )
    }
}
