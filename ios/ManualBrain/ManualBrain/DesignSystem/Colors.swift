import SwiftUI

// Values lifted verbatim from the Manual Brain design system's
// tokens/colors.css, which was itself lifted from manual-brain's
// app/globals.css, lib/urgency.ts and the inline styles in components/*.tsx.
// Do not round these, and do not add dark-mode variants: the product is
// deliberately flat and light-only — see readme.md § Visual foundations
// ("Backgrounds: flat colour only... no dark mode is mentioned or implied").
extension Color {
    init(hex: UInt32, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }

    // --- base palette ---
    static let mbInk = Color(hex: 0x14140F)
    static let mbPaper = Color(hex: 0xF6F6F3)

    static let mbLime = Color(hex: 0xD6EC3C)
    static let mbLimeBorder = Color(hex: 0xC6DC2C)
    static let mbLimeDashed = Color(hex: 0xA9BA2E)
    static let mbLimeInk = Color(hex: 0x41470F)
    static let mbLimeTint = Color(hex: 0xECF5CE)
    static let mbOlive = Color(hex: 0x7E8A16)

    static let mbBlue = Color(hex: 0x2B34EE)
    static let mbBlueHover = Color(hex: 0x1B22B4)
    static let mbBlueTint = Color(hex: 0xE3E5FD)
    static let mbBlueTintBorder = Color(hex: 0xD2D6FB)

    static let mbRed = Color(hex: 0xC4372B)
    static let mbRedStrong = Color(hex: 0xB3261E)
    static let mbRedTint = Color(hex: 0xFDEDEB)

    // warm greige ramp, light to dark
    static let mbN050 = Color(hex: 0xFBFBF8)
    static let mbN200 = Color(hex: 0xF1F1EC)
    static let mbN350 = Color(hex: 0xEEEEEA)
    static let mbN550 = Color(hex: 0xE6E6E0)
    static let mbN600 = Color(hex: 0xE4E4DE)
    static let mbN700 = Color(hex: 0xDFDFD8)
    static let mbN750 = Color(hex: 0xDCDCD5)
    static let mbN850 = Color(hex: 0xCFCFC6)
    static let mbN900 = Color(hex: 0xC7C7BE)
    static let mbN950 = Color(hex: 0xC4C4BB)

    static let mbG100 = Color(hex: 0xB0B0A7) // --text-faint   2.18:1 — decorative/dimmed only
    static let mbG400 = Color(hex: 0xA3A39A) // --icon-rest    2.54:1 — rest-state glyphs
    static let mbG500 = Color(hex: 0x9A9A91) // --text-done    2.84:1 — struck-through done text
    static let mbG600 = Color(hex: 0x93938A) // --text-subtle  3.10:1 — tertiary metadata
    static let mbG700 = Color(hex: 0x8E8E85) // --text-muted   3.30:1 — tertiary metadata
    static let mbG800 = Color(hex: 0x7C7C73) // 4.21:1 — AA-large only
    static let mbG850 = Color(hex: 0x6E6E67) // 5.14:1 — the floor for small readable text
    static let mbG900 = Color(hex: 0x5E5E56) // 6.54:1 — secondary body

    // --- semantic roles ---
    static let bgPage = mbPaper
    static let surfaceCard = Color.white
    static let surfaceSunken = mbN350
    static let surfaceInput = mbN050
    static let surfaceToday = mbLime

    static let textBody = mbInk
    static let textMuted = mbG700
    static let textSubtle = mbG600
    static let textFaint = mbG100
    static let textDone = mbG500
    static let textOnLime = mbLimeInk

    static let borderCard = mbN550
    static let borderStrong = mbInk
    static let borderDashed = mbN850
    static let borderControl = mbN700
    static let borderCheck = mbN900

    static let accentFocus = mbBlue
    static let danger = mbRed
    static let dangerStrong = mbRedStrong
    static let dangerSurface = mbRedTint
    static let textOverdue = mbRed
    static let surfaceBooked = mbLimeTint
    static let textBooked = mbOlive

    static let iconRest = mbG400
    static let iconHover = mbInk

    /// The text-colour floor rule from readme.md § Visual foundations:
    /// `--text-faint` and friends are for decoration only; anything a
    /// person has to actually read starts at `--mb-g-850` (5.14:1). Used
    /// for nav labels and other small, load-bearing text — never mbG100 or
    /// mbG400 for that role, even though the web prototype's inactive tab
    /// state originally reached for the lighter one before that was fixed.
    static let textReadableFloor = mbG850
}
