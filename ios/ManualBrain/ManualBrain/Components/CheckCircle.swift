import SwiftUI

/// components/tasks/CheckCircle.jsx — a 24pt ring drawn small on purpose,
/// wrapped in a 44pt tappable box per readme.md § Touch targets ("never
/// shrink a hit box to fit a layout; drop a control instead").
struct CheckCircle: View {
    var size: CGFloat = 24
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Circle()
                .stroke(Color.borderCheck, lineWidth: 1.5)
                .background(Circle().fill(Color.surfaceCard))
                .frame(width: size, height: size)
        }
        .frame(width: MBHitTarget.minimum, height: MBHitTarget.minimum)
        .contentShape(Rectangle())
    }
}
