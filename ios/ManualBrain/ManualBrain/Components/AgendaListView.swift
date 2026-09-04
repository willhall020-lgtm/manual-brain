import SwiftUI

/// The read-only calendar strip at the bottom of Today/Tomorrow —
/// components/mobile/AgendaList.jsx. Read-only end to end: this app never
/// writes to the calendar directly, only through the chat's booking tools
/// (readme.md: "it never writes to your calendar" — see
/// components/layout/CalendarPanel's own copy, echoed on Settings).
struct AgendaListView: View {
    var label: String
    var events: [CalendarEvent]
    var configured: Bool
    var loadError: Bool
    var showNowMarker: Bool = true

    private static let timeFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "h:mm a"
        return f
    }()

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(label)
                .font(MBFont.eyebrowSmall)
                .mbTracking(0.14, fontSize: 10)
                .foregroundStyle(Color.textMuted)

            if !configured {
                EmptyStateCard(text: "no calendar connected yet.", dashed: true)
            } else if loadError {
                EmptyStateCard(text: "couldn't load the calendar right now.", dashed: true)
            } else if events.isEmpty {
                EmptyStateCard(text: "nothing on the calendar.", dashed: true)
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(events.enumerated()), id: \.element.id) { index, event in
                        if showNowMarker, isNowBefore(event) {
                            nowMarker
                        }
                        eventRow(event)
                        if index < events.count - 1 {
                            Divider().overlay(Color.borderCard)
                        }
                    }
                    if showNowMarker && events.allSatisfy({ !isNowBefore($0) }) {
                        nowMarker
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 4)
                .background(Color.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous)
                        .stroke(Color.borderCard, lineWidth: 1)
                )
            }
        }
    }

    private func isNowBefore(_ event: CalendarEvent) -> Bool {
        guard let start = event.startDate else { return false }
        return Date() < start
    }

    private var nowMarker: some View {
        HStack(spacing: 8) {
            Rectangle().fill(Color.mbLime).frame(height: 2)
            Text("now")
                .font(MBFont.microBlack)
                .mbTracking(0.03, fontSize: 10.5)
                .foregroundStyle(Color.mbOlive)
            Rectangle().fill(Color.mbLime).frame(height: 2)
        }
        .padding(.vertical, 4)
    }

    private func eventRow(_ event: CalendarEvent) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Text(event.allDay ? "all day" : timeRange(event))
                .font(MBFont.metaSm)
                .foregroundStyle(Color.textMuted)
                .frame(width: 84, alignment: .leading)
            VStack(alignment: .leading, spacing: 2) {
                Text(event.title)
                    .font(MBFont.bodySm)
                    .mbLowercase()
                    .foregroundStyle(Color.textBody)
                if let location = event.location, !location.isEmpty {
                    Text(location)
                        .font(MBFont.meta)
                        .foregroundStyle(Color.textFaint)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 10)
    }

    private func timeRange(_ event: CalendarEvent) -> String {
        guard let start = event.startDate else { return "" }
        guard let end = event.endDate else { return Self.timeFormatter.string(from: start) }
        return "\(Self.timeFormatter.string(from: start))–\(Self.timeFormatter.string(from: end))"
    }
}
