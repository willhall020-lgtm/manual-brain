import SwiftUI

/// The read-only calendar card at the bottom of Today/Tomorrow —
/// components/mobile/AgendaList.jsx. One white panel holding its own header
/// ("calendar" + "google · read only"), then a time column and a coloured
/// left rule per event, with a lime "now" line between what's already
/// happened and what's next. Read-only end to end: this app never writes to
/// the calendar directly, only through the chat's booking tools
/// (readme.md: "it never writes to your calendar").
struct AgendaListView: View {
    var label: String
    var events: [CalendarEvent]
    var configured: Bool
    var loadError: Bool
    /// Today shows the "now" line; tomorrow doesn't and draws every event dim.
    var showNowMarker: Bool = true

    private static let timeFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f
    }()

    /// Same split as CalendarPanel.tsx: an event is "before now" once it has ended.
    private var before: [CalendarEvent] {
        let now = Date()
        return events.filter { ($0.endDate ?? .distantFuture) <= now }
    }

    private var after: [CalendarEvent] {
        let now = Date()
        return events.filter { ($0.endDate ?? .distantFuture) > now }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .center, spacing: 8) {
                Text(label)
                    .font(MBFont.eyebrow)
                    .mbTracking(0.14, fontSize: 11)
                    .mbLowercase()
                    .foregroundStyle(Color.textMuted)
                Spacer(minLength: 0)
                Text(configured ? "google · read only" : "not connected")
                    .font(MBFont.micro)
                    .mbTracking(0.02, fontSize: 10.5)
                    .foregroundStyle(Color.textFaint)
            }
            .padding(.bottom, 2)

            if !configured {
                message("no calendar connected yet.")
            } else if loadError {
                message("couldn't load the calendar right now.", color: .dangerStrong)
            } else if showNowMarker {
                ForEach(before) { eventRow($0, bar: .mbBlue, dim: false) }
                nowMarker
                ForEach(after) { eventRow($0, bar: .mbBlueSoft, dim: false) }
                if events.isEmpty { message("nothing in the calendar. the day is yours.") }
            } else {
                ForEach(events) { eventRow($0, bar: .mbN450, dim: true) }
                if events.isEmpty { message("nothing in the calendar. the day is yours.") }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous)
                .stroke(Color.borderCard, lineWidth: 1)
        )
    }

    private func message(_ text: String, color: Color = .iconRest) -> some View {
        Text(text)
            .font(MBFont.bodySm)
            .mbLowercase()
            .foregroundStyle(color)
    }

    private var nowMarker: some View {
        HStack(spacing: 12) {
            Text("now")
                .font(MBFont.eyebrowSmall)
                .mbTracking(0.08, fontSize: 10)
                .foregroundStyle(Color.mbOlive)
                .frame(width: 44, alignment: .trailing)
            Capsule().fill(Color.mbLime).frame(height: 3)
        }
        .padding(.vertical, 2)
    }

    private func eventRow(_ event: CalendarEvent, bar: Color, dim: Bool) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Text(event.allDay ? "" : event.startDate.map(Self.timeFormatter.string(from:)) ?? "")
                .font(MBFont.agendaTime)
                .foregroundStyle(dim ? Color.textFaint : Color.textDone)
                .frame(width: 44, alignment: .leading)
                .padding(.top, 2)
            VStack(alignment: .leading, spacing: 2) {
                Text(event.title)
                    .font(MBFont.body)
                    .mbLowercase()
                    .foregroundStyle(dim ? Color.mbG900 : Color.textBody)
                    .fixedSize(horizontal: false, vertical: true)
                Text(meta(for: event))
                    .font(MBFont.agendaMeta)
                    .mbLowercase()
                    .foregroundStyle(dim ? Color.textFaint : Color.textDone)
            }
            .padding(.vertical, 1)
            .padding(.leading, 11)
            .frame(maxWidth: .infinity, alignment: .leading)
            .overlay(alignment: .leading) {
                Rectangle().fill(bar).frame(width: 3)
            }
        }
    }

    /// "30 min" / "1.5 hr" / "all day", then the location if there is one —
    /// CalendarPanel.tsx's EventRow meta line.
    private func meta(for event: CalendarEvent) -> String {
        var parts: [String] = []
        if event.allDay {
            parts.append("all day")
        } else if let start = event.startDate, let end = event.endDate {
            let mins = Int((end.timeIntervalSince(start) / 60).rounded())
            if mins < 60 {
                parts.append("\(mins) min")
            } else {
                let hours = (Double(mins) / 60 * 2).rounded() / 2
                parts.append(hours == hours.rounded() ? "\(Int(hours)) hr" : "\(hours) hr")
            }
        }
        if let location = event.location, !location.isEmpty { parts.append(location) }
        return parts.joined(separator: " · ")
    }
}
