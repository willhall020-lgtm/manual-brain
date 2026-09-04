import Foundation

// The entire icon system, verbatim from readme.md § Iconography: ten
// unicode characters set in Archivo, no icon font, no SVGs, no emoji —
// substituting a stroke-icon set here would immediately read as a
// different product. Any glyph with an emoji presentation must carry the
// variation selector U+FE0E so it renders as monochrome text rather than a
// colour emoji (the same trap the design system's own build hit and fixed
// for the gear glyph below).
enum MBGlyph {
    static let edit = "✎"
    static let delete = "✕"
    static let undo = "↺"
    static let done = "✓"
    static let openList = "→"
    static let back = "←"
    static let add = "+"
    static let send = "↑"
    static let repeats = "↻"
    static let settings = "\u{2699}\u{FE0E}" // ⚙︎ — U+2699 + variation selector-15
    static let enterHint = "↵"
    static let expand = "▼"
    static let collapse = "▲"
}
