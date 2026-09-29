import SwiftUI

/// components/mobile/MobileTaskRow.jsx — a two-line row (title, then a
/// section tag + the scheduling meta line) with the whole card as the tap
/// target for the edit sheet (readme.md: the web's 25px pencil glyph is
/// under the 44pt floor, so mobile drops it and makes the row itself the
/// target). Every control inside stops its own tap from also opening the
/// sheet, same as the source's `stop()` helper.
struct MobileTaskRowView: View {
    var task: APITask
    var sectionName: String?
    var todayKey: String
    var flat: Bool // true on Today: white card, no border, sitting on the lime block
    var onOpen: () -> Void
    var onToggleDone: () -> Void

    var body: some View {
        // Deliberately not a `Button` wrapping the row: SwiftUI's nested
        // buttons inside a Button's label can swallow taps meant for the
        // check ring inside it. A plain container with its own
        // tap gesture — the same "row opens the sheet, every control inside
        // stops its own tap from bubbling" shape as the web's onClick +
        // stopPropagation pattern — keeps both independently tappable.
        HStack(alignment: .top, spacing: 12) {
            // The 44pt hit box is pulled 10pt up, down and leading (never
            // trailing) so the painted 24pt ring lines up with the title's
            // first line and the row's own padding — CheckCircle.jsx's
            // `margin: inset 0 inset inset`.
            CheckCircle(size: 24, action: onToggleDone)
                .padding(.vertical, -10)
                .padding(.leading, -10)

            VStack(alignment: .leading, spacing: 7) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.name)
                        .font(MBFont.bodyLg)
                        .mbTracking(-0.01, fontSize: 15)
                        .mbLowercase()
                        .foregroundStyle(Color.textBody)
                        .multilineTextAlignment(.leading)
                    if let sectionName, !sectionName.isEmpty {
                        Text(sectionName)
                            .font(MBFont.eyebrowSmallBold)
                            .mbTracking(0.04, fontSize: 10)
                            .mbLowercase()
                            .foregroundStyle(Color.mbG800)
                    }
                }
                TaskMetaRow(task: task, todayKey: todayKey)
            }
            Spacer(minLength: 0)
        }
        .padding(.leading, 14)
        .padding(.trailing, 10)
        .padding(.vertical, 13)
        .frame(minHeight: 56)
        // Today rows are white cards straight on the lime block with no
        // border (`variant="today"`); everywhere else they carry the 1px
        // card border too.
        .background(Color.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                .stroke(flat ? Color.clear : Color.borderCard, lineWidth: 1)
        )
        .contentShape(Rectangle())
        .onTapGesture(perform: onOpen)
    }
}
