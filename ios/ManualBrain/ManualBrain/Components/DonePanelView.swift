import SwiftUI

/// components/layout/DonePanel.jsx — collapsible, undo-able done list.
/// Nothing here is ever truly deleted from this panel by mistake: undo is
/// the only reversible action in the whole system (readme.md: "deleting a
/// task is not undoable — only *done* is").
struct DonePanelView: View {
    var items: [APITask]
    var sectionName: (String) -> String
    @Binding var isOpen: Bool
    var onUndo: (String) -> Void

    var body: some View {
        if !items.isEmpty {
            VStack(spacing: 0) {
                Button {
                    withAnimation(.easeInOut(duration: 0.12)) { isOpen.toggle() }
                } label: {
                    HStack {
                        Text(TaskFieldFormat.count(items.count, noun: "task") + " done")
                            .font(MBFont.metaBold)
                            .mbLowercase()
                            .foregroundStyle(Color.textMuted)
                        Spacer()
                        Text(isOpen ? MBGlyph.collapse : MBGlyph.expand)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(Color.iconRest)
                    }
                    .padding(.horizontal, 16)
                    .frame(minHeight: MBHitTarget.minimum)
                }
                .buttonStyle(.plain)

                if isOpen {
                    VStack(spacing: 6) {
                        ForEach(items) { task in
                            HStack(spacing: 10) {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(task.name)
                                        .font(MBFont.bodySm)
                                        .mbLowercase()
                                        .strikethrough()
                                        .foregroundStyle(Color.textDone)
                                    let section = sectionName(task.sectionId)
                                    if !section.isEmpty {
                                        Text(section)
                                            .font(MBFont.eyebrowSmall)
                                            .mbLowercase()
                                            .foregroundStyle(Color.textFaint)
                                    }
                                }
                                Spacer(minLength: 0)
                                Button {
                                    onUndo(task.id)
                                } label: {
                                    Text(MBGlyph.undo)
                                        .font(.system(size: 13, weight: .semibold))
                                        .foregroundStyle(Color.iconRest)
                                        .frame(width: MBHitTarget.minimum, height: MBHitTarget.minimum)
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                    .padding(.bottom, 10)
                }
            }
            .background(Color.surfaceSunken)
            .clipShape(RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous))
        }
    }
}
