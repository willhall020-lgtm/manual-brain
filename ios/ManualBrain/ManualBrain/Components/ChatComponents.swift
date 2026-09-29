import SwiftUI

/// components/mobile/ChatBubble.jsx — one dropped corner marks "this side
/// spoke", ink-on-white for the assistant, ink-fill for the user (matching
/// the web's `ChatPanel.tsx` reversed contrast).
struct ChatBubbleView: View {
    var isMe: Bool
    var text: String
    var pending: Bool = false

    /// 16pt corners with the speaker's bottom corner dropped to 5pt.
    private var shape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: MBRadius.box,
            bottomLeadingRadius: isMe ? MBRadius.box : 5,
            bottomTrailingRadius: isMe ? 5 : MBRadius.box,
            topTrailingRadius: MBRadius.box,
            style: .continuous
        )
    }

    var body: some View {
        HStack {
            // maxWidth: 84% of the column, as a trailing/leading gutter.
            if isMe { Spacer(minLength: 56) }
            Text(text)
                .font(MBFont.bodyMediumLg)
                .mbTracking(-0.01, fontSize: 14.5)
                .lineSpacing(5) // ≈ --lh-body 1.5 over Archivo's own line height
                .mbLowercase()
                .foregroundStyle(isMe ? .white : Color.textBody)
                .padding(.horizontal, 13)
                .padding(.vertical, 11)
                .background(shape.fill(isMe ? Color.mbInk : Color.surfaceCard))
                .overlay {
                    if !isMe { shape.strokeBorder(Color.borderCard, lineWidth: 1) }
                }
                .opacity(pending ? 0.55 : 1)
            if !isMe { Spacer(minLength: 56) }
        }
    }
}

/// components/mobile/SuggestionChips.jsx — dashed ghost prompts shown only
/// on the empty chat state.
struct SuggestionChipsRow: View {
    var items: [String]
    var onPick: (String) -> Void

    var body: some View {
        FlowLayout(spacing: 7) {
            ForEach(items, id: \.self) { item in
                Button {
                    onPick(item)
                } label: {
                    Text(item)
                        .font(MBFont.metaSmBold)
                        .mbLowercase()
                        .foregroundStyle(Color.textSubtle)
                        .padding(.horizontal, 13)
                        .padding(.vertical, 9)
                        .frame(minHeight: 40)
                        .contentShape(Capsule())
                }
                .buttonStyle(.plain)
                .background(
                    Capsule().strokeBorder(Color.borderDashed, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                )
            }
        }
    }
}

/// components/mobile/ChatComposer.jsx — a pill input plus a grey-until-ready
/// send button, following AddButton's own rule.
struct ChatComposerView: View {
    @Binding var text: String
    var busy: Bool
    var onSend: () -> Void

    private var ready: Bool { !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !busy }

    var body: some View {
        HStack(alignment: .bottom, spacing: 9) {
            TextField("ask your brain…", text: $text, axis: .vertical)
                .font(MBFont.bodyLgMedium)
                .mbTracking(-0.01, fontSize: 15)
                .lineLimit(1...4)
                .padding(.horizontal, 16)
                .frame(minHeight: 46)
                .background(Color.surfaceCard)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(Color.borderControl, lineWidth: 1))
                .onSubmit(onSend)

            Button(action: onSend) {
                Text(MBGlyph.send)
                    .font(MBFont.sendGlyph)
                    .foregroundStyle(ready ? .white : Color.iconRest)
                    .frame(width: 46, height: 46)
                    .background(Circle().fill(ready ? Color.mbInk : Color.mbN600))
                    .contentShape(Circle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("send")
            .disabled(!ready)
        }
        .padding(.horizontal, MBSpace.screenPadding)
        .padding(.top, 10)
        .padding(.bottom, 12)
        .background(Color.bgPage)
        .overlay(alignment: .top) {
            Rectangle().fill(Color.borderCard).frame(height: 1)
        }
    }
}
