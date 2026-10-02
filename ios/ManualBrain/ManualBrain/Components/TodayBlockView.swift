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

/// ui_kits/ios/parts.jsx's MAddStrip — the dashed "add" affordance at the
/// bottom of a task group, lime-tinted on the Today block, grey elsewhere.
/// Left-aligned, like the task rows above it.
struct AddStripButton: View {
    var label: String
    var tone: Tone = .plain
    var action: () -> Void

    enum Tone { case lime, plain }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 9) {
                Text(MBGlyph.add)
                    .font(MBFont.addStripGlyph)
                Text(label)
                    .font(MBFont.addStrip)
                    .mbLowercase()
            }
            .foregroundStyle(tone == .lime ? Color.textOnLime : Color.textSubtle)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 13)
            .padding(.vertical, 14)
            .frame(minHeight: 48)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .background(
            RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                .strokeBorder(
                    tone == .lime ? Color.mbLimeDashed : Color.borderDashed,
                    style: StrokeStyle(lineWidth: 1, dash: [4, 3])
                )
        )
    }
}

/// The three empty states the ios kit's screens.jsx draws inline:
/// `.card` — white, borderless (inside the lime Today block);
/// `.dashed` — white with a dashed border (Tomorrow, calendar);
/// `.sunken` — no fill, darker dashed border (inside a list's sunken container).
struct EmptyStateCard: View {
    var text: String
    var style: Style = .card

    enum Style { case card, dashed, sunken }

    var body: some View {
        Text(text)
            .font(style == .card ? MBFont.body : MBFont.field)
            .mbLowercase()
            .foregroundStyle(style == .card ? Color.textSubtle : Color.iconRest)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(style == .sunken ? Color.clear : Color.surfaceCard)
            .clipShape(RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous))
            .overlay(
                Group {
                    if style != .card {
                        RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                            .strokeBorder(
                                style == .sunken ? Color.mbN800 : Color.borderDashed,
                                style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                    }
                }
            )
    }
}
