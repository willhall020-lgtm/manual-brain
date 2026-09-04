import SwiftUI

/// components/mobile/SettingsRow.jsx.
struct SettingsRowView<Trailing: View>: View {
    var label: String
    var description: String?
    var value: String?
    @ViewBuilder var trailing: Trailing

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack(alignment: .firstTextBaseline) {
                Text(label)
                    .font(MBFont.body)
                    .mbTracking(-0.01, fontSize: 14.5)
                    .mbLowercase()
                    .foregroundStyle(Color.textBody)
                Spacer()
                if let value {
                    Text(value)
                        .font(MBFont.metaSm)
                        .mbLowercase()
                        .foregroundStyle(Color.mbG850)
                }
            }
            if let description {
                Text(description)
                    .font(MBFont.meta)
                    .foregroundStyle(Color.mbG850)
                    .fixedSize(horizontal: false, vertical: true)
            }
            trailing
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 13)
        .background(Color.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: MBRadius.row, style: .continuous)
                .stroke(Color.borderCard, lineWidth: 1)
        )
    }
}

extension SettingsRowView where Trailing == EmptyView {
    init(label: String, description: String? = nil, value: String? = nil) {
        self.init(label: label, description: description, value: value, trailing: { EmptyView() })
    }
}
