import SwiftUI
import UIKit

/// components/mobile/ChatBubble.jsx — one dropped corner marks "this side
/// spoke", ink-on-white for the assistant, ink-fill for the user (matching
/// the web's `ChatPanel.tsx` reversed contrast).
struct ChatBubbleView: View {
    var isMe: Bool
    var text: String
    var pending: Bool = false

    var body: some View {
        HStack {
            if isMe { Spacer(minLength: 40) }
            Text(text)
                .font(MBFont.body)
                .mbTracking(-0.01, fontSize: 14.5)
                .mbLowercase()
                .foregroundStyle(isMe ? .white : Color.textBody)
                .padding(.horizontal, 13)
                .padding(.vertical, 11)
                .background(isMe ? Color.mbInk : Color.surfaceCard)
                .clipShape(BubbleShape(isMe: isMe))
                .overlay(
                    Group {
                        if !isMe {
                            BubbleShape(isMe: isMe).stroke(Color.borderCard, lineWidth: 1)
                        }
                    }
                )
                .opacity(pending ? 0.55 : 1)
            if !isMe { Spacer(minLength: 40) }
        }
    }
}

private struct BubbleShape: Shape {
    var isMe: Bool
    func path(in rect: CGRect) -> Path {
        var corners: UIRectCorner = [.topLeft, .topRight]
        corners.insert(isMe ? .bottomLeft : .bottomRight)
        let droppedCorner: UIRectCorner = isMe ? .bottomRight : .bottomLeft
        let path = UIBezierPath(
            roundedRect: rect, byRoundingCorners: corners.union(droppedCorner),
            cornerRadii: CGSize(width: MBRadius.box, height: MBRadius.box))
        // Redraw the dropped corner tighter (5pt) — matches the design
        // system's "one corner dropped to 5px" chat-bubble rule.
        let tightPath = UIBezierPath(
            roundedRect: rect, byRoundingCorners: droppedCorner,
            cornerRadii: CGSize(width: 5, height: 5))
        path.append(tightPath)
        return Path(path.cgPath)
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
                        .font(MBFont.metaSm)
                        .mbLowercase()
                        .foregroundStyle(Color.textSubtle)
                        .padding(.horizontal, 13)
                        .frame(minHeight: 40)
                }
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
                .font(MBFont.bodyLg)
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
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(ready ? .white : Color.iconRest)
                    .frame(width: 46, height: 46)
            }
            .background(Circle().fill(ready ? Color.mbInk : Color.mbN600))
            .disabled(!ready)
        }
        .padding(.horizontal, MBSpace.screenPadding)
        .padding(.top, 10)
        .padding(.bottom, 12)
        .background(
            VStack(spacing: 0) {
                Divider().overlay(Color.borderCard)
                Color.bgPage
            }
        )
    }
}
