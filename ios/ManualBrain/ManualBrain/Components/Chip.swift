import SwiftUI

/// components/forms/Chip.jsx's `size="touch"` variant (13pt bold, 12×16
/// padding, grey-on-white at rest, ink when selected) — every chip in this
/// app is inside a sheet a thumb has to hit, so there is no non-touch size
/// here.
struct Chip: View {
    var label: String
    var selected: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(MBFont.chipTouch)
                .mbLowercase()
                .foregroundStyle(selected ? .white : Color.textSubtle)
                .padding(.horizontal, 16)
                .frame(minHeight: MBHitTarget.minimum)
                .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .background(
            Capsule()
                .fill(selected ? Color.mbInk : Color.surfaceCard)
        )
        .overlay(
            Capsule().stroke(selected ? Color.mbInk : Color.borderControl, lineWidth: 1)
        )
    }
}

/// A pill-shaped, ink-filled call-to-action — "add task", "save" — that
/// dims to a neutral grey until the form is valid, per
/// components/forms/AddButton.jsx.
struct PrimaryPillButton: View {
    var label: String
    var enabled: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(MBFont.button)
                .mbTracking(0.05, fontSize: 12.5)
                .mbLowercase()
                .foregroundStyle(enabled ? .white : Color.iconRest)
                .frame(maxWidth: .infinity)
                .frame(minHeight: 46)
                .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .background(Capsule().fill(enabled ? Color.mbInk : Color.mbN600))
        .disabled(!enabled)
    }
}

struct SecondaryTextButton: View {
    var label: String
    var color: Color = .textSubtle
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(MBFont.metaSmBold)
                .mbLowercase()
                .foregroundStyle(color)
                .frame(minHeight: 46)
                .padding(.horizontal, 6)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
