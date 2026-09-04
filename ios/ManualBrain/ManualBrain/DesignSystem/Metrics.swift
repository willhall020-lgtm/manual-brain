import CoreGraphics

// tokens/spacing.css + tokens/radius.css, literally — Manual Brain does not
// use a 4/8 grid, these are hand-tuned odd numbers. Keep them exact.
enum MBSpace {
    static let gapRow: CGFloat = 7 // between rows in the today block
    static let gapListRow: CGFloat = 8 // between rows inside a list view
    static let gapRowInner: CGFloat = 11 // checkbox -> title -> pill inside a row
    static let gapStack: CGFloat = 18 // between major blocks on a mobile screen
    static let screenPadding: CGFloat = 16 // PAD in the ios kit's screens.jsx
}

enum MBRadius {
    static let pill: CGFloat = 99
    static let panel: CGFloat = 22 // today block, sunken list container, sheets
    static let card: CGFloat = 20 // list rows
    static let box: CGFloat = 16 // add boxes, chat bubbles
    static let row: CGFloat = 14 // task rows, banners
    static let menu: CGFloat = 13
    static let input: CGFloat = 10
    static let icon: CGFloat = 8
}

/// Manual Brain's painted controls are drawn small (a 21px check ring, a
/// 25px icon square) because the design originated on a mouse-driven web
/// app. readme.md § Touch targets requires every one of them to sit inside
/// a 44pt pressable box on a touch surface without changing its painted
/// size — this is that floor.
enum MBHitTarget {
    static let minimum: CGFloat = 44
}
