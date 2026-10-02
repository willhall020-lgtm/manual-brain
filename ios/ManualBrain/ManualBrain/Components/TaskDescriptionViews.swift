import SwiftUI

/// A task's free-text notes under its title on a row — the web's
/// TaskDescription.tsx at rest. One clamped line by default; the ▾ beside it
/// expands to the full text in place. Tapping the text itself falls through
/// to the row's own tap (the edit sheet, which always shows it in full) —
/// only the ▾ is its own control. Kept in the case it was typed, unlike the
/// lowercased title and meta: it's the user's own prose (links, names).
struct TaskDescriptionLine: View {
    var description: String
    @State private var expanded = false

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 4) {
            Text(description)
                .font(MBFont.meta)
                .foregroundStyle(Color.textReadableFloor)
                .lineLimit(expanded ? nil : 1)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
            Button {
                withAnimation(.easeOut(duration: 0.15)) { expanded.toggle() }
            } label: {
                Text("▾")
                    .font(Brand.font(size: 11, weight: .bold))
                    .foregroundStyle(Color.iconRest)
                    .rotationEffect(.degrees(expanded ? 180 : 0))
                    // A 44pt hit box per readme.md § Touch targets, pulled in
                    // vertically so it doesn't make every row taller.
                    .frame(width: MBHitTarget.minimum, height: MBHitTarget.minimum)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .padding(.vertical, -14)
            .padding(.trailing, -10)
            .accessibilityLabel(expanded ? "collapse description" : "expand description")
        }
    }
}

/// The description field in the add and edit sheets, straight under the
/// name — the web's DraftDescriptionInput.tsx. Starts three lines tall and
/// grows with the text up to eight, then scrolls.
struct DescriptionField: View {
    @Binding var text: String

    var body: some View {
        TextField("description (optional)", text: $text, axis: .vertical)
            .font(MBFont.bodyMedium)
            .foregroundStyle(Color.textBody)
            .lineLimit(3...8)
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.surfaceInput)
            .clipShape(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous)
                    .stroke(Color.borderControl, lineWidth: 1)
            )
    }
}
