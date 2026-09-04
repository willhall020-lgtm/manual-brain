import SwiftUI

/// The one loud thing on the whole app — components/layout/TodayBlock.jsx —
/// the lime "for today" container. Appears at full size exactly once per
/// screen (readme.md § Visual foundations).
struct TodayBlockView<Content: View>: View {
    var count: Int
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .firstTextBaseline, spacing: 10) {
                Text("\(count)")
                    .font(MBFont.todayCount)
                    .mbTracking(-0.04, fontSize: 44)
                    .foregroundStyle(Color.mbInk)
                Text("for today")
                    .font(MBFont.todayLabel)
                    .mbTracking(-0.02, fontSize: 17)
                    .foregroundStyle(Color.mbInk)
            }
            .padding(.horizontal, 4)

            VStack(spacing: MBSpace.gapRow) {
                content
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 18)
        .padding(.bottom, 16)
        .background(Color.mbLime)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous))
    }
}

/// components/mobile's MAddStrip — the dashed "add" affordance, lime-tinted
/// on the Today block, plain everywhere else.
struct AddStripButton: View {
    var label: String
    var tone: Tone = .plain
    var action: () -> Void

    enum Tone { case lime, plain }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Text(MBGlyph.add)
                    .font(.system(size: 13, weight: .bold))
                Text(label)
                    .font(MBFont.bodySm)
                    .mbLowercase()
            }
            .foregroundStyle(tone == .lime ? Color.mbLimeInk : Color.textSubtle)
            .frame(maxWidth: .infinity)
            .frame(minHeight: MBHitTarget.minimum)
        }
        .background(
            RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                .strokeBorder(
                    tone == .lime ? Color.mbLimeDashed : Color.borderDashed,
                    style: StrokeStyle(lineWidth: 1.5, dash: [4, 3])
                )
        )
    }
}

struct EmptyStateCard: View {
    var text: String
    var dashed: Bool = false

    var body: some View {
        Text(text)
            .font(MBFont.bodyMedium)
            .mbLowercase()
            .foregroundStyle(Color.textSubtle)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Color.surfaceCard)
            .clipShape(RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous))
            .overlay(
                Group {
                    if dashed {
                        RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                            .strokeBorder(Color.borderDashed, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                    }
                }
            )
    }
}
