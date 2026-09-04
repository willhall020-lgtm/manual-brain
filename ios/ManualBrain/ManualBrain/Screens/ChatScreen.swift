import SwiftUI

/// screens.jsx's ChatScreen — a system prompt built server-side from the
/// live task list plus the brand's voice rules (lib/chat-loop.ts), so
/// replies come back already in Manual Brain's tone; this screen just
/// renders the wire messages, it does no prompting of its own.
struct ChatScreen: View {
    @EnvironmentObject private var store: AppStore
    @State private var draft = ""

    private let starters = [
        "what's due today?",
        "what's slipping?",
        "add something to my list",
    ]

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(dateLabel: "ask your brain", title: "chat", meta: store.chatBusy ? "thinking…" : nil)

            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        if store.chatDisplay.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                ChatBubbleView(
                                    isMe: false,
                                    text: "ask me what to do next, what's slipping, or to add something. i can see your lists."
                                )
                                SuggestionChipsRow(items: starters) { draft = $0; send() }
                            }
                            .padding(.top, 4)
                        }

                        ForEach(store.chatDisplay) { message in
                            VStack(alignment: message.role == "user" ? .trailing : .leading, spacing: 4) {
                                ChatBubbleView(isMe: message.role == "user", text: message.text)
                                if !message.notes.isEmpty {
                                    HStack(spacing: 6) {
                                        ForEach(message.notes, id: \.self) { note in
                                            Text(note)
                                                .font(MBFont.microBlack)
                                                .mbTracking(0.03, fontSize: 10.5)
                                                .foregroundStyle(Color.mbOlive)
                                                .padding(.horizontal, 9)
                                                .padding(.vertical, 3)
                                                .background(Capsule().fill(Color.mbLimeTint))
                                        }
                                    }
                                    .padding(.leading, 4)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: message.role == "user" ? .trailing : .leading)
                        }

                        if store.chatBusy {
                            ChatBubbleView(isMe: false, text: "thinking…", pending: true)
                        }
                        if let error = store.chatError {
                            Text(error)
                                .font(MBFont.metaSm)
                                .foregroundStyle(Color.dangerStrong)
                        }
                        Color.clear.frame(height: 1).id("bottom")
                    }
                    .padding(.horizontal, MBSpace.screenPadding)
                    .padding(.bottom, 16)
                }
                .onChange(of: store.chatDisplay.count) {
                    withAnimation { proxy.scrollTo("bottom", anchor: .bottom) }
                }
                .onChange(of: store.chatBusy) {
                    withAnimation { proxy.scrollTo("bottom", anchor: .bottom) }
                }
            }

            ChatComposerView(text: $draft, busy: store.chatBusy, onSend: send)
        }
        .background(Color.bgPage)
    }

    private func send() {
        let text = draft
        draft = ""
        Task { await store.sendChat(text) }
    }
}
