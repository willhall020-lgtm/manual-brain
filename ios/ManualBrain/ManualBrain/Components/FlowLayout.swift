import SwiftUI

/// A minimal wrapping row layout — used wherever the design system's chips
/// wrap onto multiple lines (`flex-wrap: wrap`): suggestion chips, add/edit
/// sheet option rows.
struct FlowLayout: Layout {
    var spacing: CGFloat = 6
    var lineSpacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var rowWidth: CGFloat = 0
        var totalHeight: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            // Must match placeSubviews' wrap test exactly, spacing included —
            // otherwise the measured height can come up a row short and the
            // last wrapped chip overlaps whatever sits below the layout.
            if rowWidth > 0, rowWidth + spacing + size.width > maxWidth {
                totalHeight += rowHeight + lineSpacing
                rowWidth = 0
                rowHeight = 0
            }
            rowWidth += size.width + (rowWidth > 0 ? spacing : 0)
            rowHeight = max(rowHeight, size.height)
        }
        totalHeight += rowHeight
        return CGSize(width: maxWidth.isFinite ? maxWidth : rowWidth, height: totalHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let maxWidth = bounds.width

        // Break into rows first so each item can be centred vertically in
        // its row (`align-items: center`) — placing at the row's top edge
        // left smaller text (a 10.5pt repeat/assignee label next to 13pt
        // meta) riding visibly high.
        var rows: [[(subview: LayoutSubview, size: CGSize)]] = [[]]
        var rowWidth: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if rowWidth > 0, rowWidth + spacing + size.width > maxWidth {
                rows.append([])
                rowWidth = 0
            }
            rowWidth += size.width + (rowWidth > 0 ? spacing : 0)
            rows[rows.count - 1].append((subview, size))
        }

        var y = bounds.minY
        for row in rows where !row.isEmpty {
            let rowHeight = row.map(\.size.height).max() ?? 0
            var x = bounds.minX
            for (subview, size) in row {
                subview.place(
                    at: CGPoint(x: x, y: y + (rowHeight - size.height) / 2),
                    proposal: ProposedViewSize(size))
                x += size.width + spacing
            }
            y += rowHeight + lineSpacing
        }
    }
}
