import SwiftUI

/// components/layout/ErrorBanner.jsx — errors are plain, own the failure,
/// and say what to do; always dismissible by tapping it
/// (readme.md § Content fundamentals).
struct ErrorBanner: View {
    var message: String
    var onDismiss: () -> Void

    var body: some View {
        Button(action: onDismiss) {
            Text("\(message) — tap to dismiss")
                .font(MBFont.metaSm)
                .foregroundStyle(Color.dangerStrong)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
        }
        .background(Color.dangerSurface)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous))
        .buttonStyle(.plain)
        .padding(.horizontal, MBSpace.screenPadding)
    }
}
