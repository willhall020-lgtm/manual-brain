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
    var isBooking: Bool
    var googleCalendarConnected: Bool
    var flat: Bool // true on Today, where rows sit directly on the lime block
    var onOpen: () -> Void
    var onToggleDone: () -> Void
    var onBook: () -> Void

    var body: some View {
        // Deliberately not a `Button` wrapping the row: SwiftUI's nested
        // buttons inside a Button's label can swallow taps meant for the
        // check ring / book pill inside it. A plain container with its own
        // tap gesture — the same "row opens the sheet, every control inside
        // stops its own tap from bubbling" shape as the web's onClick +
        // stopPropagation pattern — keeps both independently tappable.
        HStack(alignment: .top, spacing: 12) {
            CheckCircle(size: 24, action: onToggleDone)

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
                            .font(MBFont.eyebrowSmall)
                            .mbTracking(0.04, fontSize: 10)
                            .mbLowercase()
                            .foregroundStyle(Color.mbG800)
                    }
                }
                TaskMetaRow(
                    task: task, todayKey: todayKey, isBooking: isBooking,
                    googleCalendarConnected: googleCalendarConnected, onBook: onBook)
            }
            Spacer(minLength: 0)
        }
        .padding(.leading, 14)
        .padding(.trailing, 10)
        .padding(.vertical, 13)
        .frame(minHeight: 56)
        .background(flat ? Color.clear : Color.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                .stroke(flat ? Color.clear : Color.borderCard, lineWidth: 1)
        )
        .contentShape(Rectangle())
        .onTapGesture(perform: onOpen)
    }
}
