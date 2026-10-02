import SwiftUI

/// components/layout/DonePanel.jsx — the sunken, collapsible done list:
/// a "done" eyebrow + count pill + "show ▼"/"hide ▲" header, and
/// DoneTaskRow cards (blue tick, struck-through name, list tag, undo) when
/// open. Always present, even at zero, same as the design. Nothing here is
/// ever truly deleted by mistake: undo is the only reversible action in the
/// whole system (readme.md: "deleting a task is not undoable — only *done* is").
struct DonePanelView: View {
    var items: [APITask]
    var sectionName: (String) -> String
    @Binding var isOpen: Bool
    var onUndo: (String) -> Void

    var body: some View {
        VStack(spacing: 0) {
            Button {
                withAnimation(.easeInOut(duration: 0.12)) { isOpen.toggle() }
            } label: {
                HStack(spacing: 10) {
                    Text("done")
                        .font(MBFont.eyebrow)
                        .mbTracking(0.14, fontSize: 11)
                        .foregroundStyle(Color.textMuted)
                    Text("\(items.count)")
                        .font(MBFont.chip)
                        .foregroundStyle(Color.mbG900)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Color.mbN750))
                    Spacer(minLength: 0)
                    Text(isOpen ? "hide \(MBGlyph.collapse)" : "show \(MBGlyph.expand)")
                        .font(MBFont.chip)
                        .foregroundStyle(Color.textMuted)
                }
                .padding(12)
                .frame(minHeight: MBHitTarget.minimum)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            if isOpen {
                VStack(spacing: 7) {
                    ForEach(items) { task in
                        DoneTaskRowView(
                            name: task.name,
                            sectionName: sectionName(task.sectionId),
                            onUndo: { onUndo(task.id) }
                        )
                    }
                    if items.isEmpty {
                        Text("nothing finished yet.")
                            .font(MBFont.metaSm)
                            .foregroundStyle(Color.iconRest)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 10)
                    }
                }
                .padding(.horizontal, 8)
                .padding(.bottom, 8)
            }
        }
        .padding(6)
        .background(Color.surfaceSunken)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous))
    }
}

/// components/tasks/DoneTaskRow.jsx.
private struct DoneTaskRowView: View {
    var name: String
    var sectionName: String
    var onUndo: () -> Void

    var body: some View {
        HStack(spacing: 10) {
            Text(MBGlyph.done)
                .font(Brand.font(size: 9, weight: .black))
                .foregroundStyle(.white)
                .frame(width: 17, height: 17)
                .background(Circle().fill(Color.accentFocus))
            Text(name)
                .font(MBFont.meta)
                .strikethrough()
                .mbLowercase()
                .foregroundStyle(Color.textDone)
                .frame(maxWidth: .infinity, alignment: .leading)
            if !sectionName.isEmpty {
                Text(sectionName)
                    .font(MBFont.micro)
                    .mbTracking(0.02, fontSize: 10.5)
                    .mbLowercase()
                    .foregroundStyle(Color.textFaint)
                    .lineLimit(1)
            }
            // IconButton size 24 in a 44pt hit box, pulled in vertically only.
            Button(action: onUndo) {
                Text(MBGlyph.undo)
                    .font(Brand.font(size: 13, weight: .regular))
                    .foregroundStyle(Color.iconRest)
                    .frame(width: 24, height: 24)
                    .frame(width: MBHitTarget.minimum, height: MBHitTarget.minimum)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .padding(.vertical, -10)
            .accessibilityLabel("move back")
        }
        .padding(.leading, 12)
        .padding(.trailing, 10)
        .padding(.vertical, 9)
        .background(Color.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                .stroke(Color.mbN500, lineWidth: 1)
        )
    }
}
