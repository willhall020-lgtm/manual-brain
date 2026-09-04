import SwiftUI
import UIKit

// One family, Archivo — weight and tracking carry all hierarchy, there is
// no second family, no serif, no mono (readme.md § Visual foundations).
//
// Archivo's actual font files aren't vendored in this repo, the same way
// they aren't vendored in the design system bundle this app was built from
// (tokens/fonts.css `@import`s it from Google Fonts for the web — see that
// project's readme.md § Known gaps). Drop the four weights below into
// Assets (or a `Fonts/` group added to the Xcode target and to
// `UIAppFonts` in Info.plist) and this resolves them automatically; until
// then every call below falls back to the system font at a matching
// weight, which is the same graceful-degradation the web app itself uses
// when a font isn't available.
//
// Expected PostScript names, from Google Fonts' static Archivo family:
//   Archivo-Regular (400) · Archivo-Medium (500) · Archivo-SemiBold (600)
//   Archivo-Bold (700) · Archivo-ExtraBold (800)
enum Brand {
    static func font(size: CGFloat, weight: Font.Weight) -> Font {
        let name: String
        switch weight {
        case .black, .heavy: name = "Archivo-ExtraBold"
        case .bold: name = "Archivo-Bold"
        case .semibold: name = "Archivo-SemiBold"
        case .medium: name = "Archivo-Medium"
        default: name = "Archivo-Regular"
        }
        if UIFont(name: name, size: size) != nil {
            return .custom(name, size: size)
        }
        return .system(size: size, weight: weight)
    }
}

/// The literal type scale from tokens/typography.css — half-pixel sizes are
/// intentional, keep them.
enum MBFont {
    static let wordmark = Brand.font(size: 40, weight: .black)
    static let screenTitle = Brand.font(size: 27, weight: .black) // MobileNavBar's <h1>
    static let todayCount = Brand.font(size: 44, weight: .black)
    static let h2 = Brand.font(size: 28, weight: .black)
    static let listTitle = Brand.font(size: 18, weight: .black)
    static let listRowTitle = Brand.font(size: 17, weight: .black)
    static let todayLabel = Brand.font(size: 17, weight: .black)
    static let bodyLg = Brand.font(size: 15, weight: .semibold)
    static let body = Brand.font(size: 14.5, weight: .semibold)
    static let bodyMedium = Brand.font(size: 14, weight: .medium)
    static let bodySm = Brand.font(size: 13.5, weight: .semibold)
    static let meta = Brand.font(size: 13, weight: .medium)
    static let metaBold = Brand.font(size: 13, weight: .bold)
    static let metaSm = Brand.font(size: 12.5, weight: .semibold)
    static let caption = Brand.font(size: 11.5, weight: .semibold)
    static let chip = Brand.font(size: 11, weight: .bold)
    static let micro = Brand.font(size: 10.5, weight: .bold)
    static let microBlack = Brand.font(size: 10.5, weight: .black)
    static let eyebrow = Brand.font(size: 11, weight: .bold)
    static let eyebrowSmall = Brand.font(size: 10, weight: .black)
    static let button = Brand.font(size: 12.5, weight: .black)
    static let tabLabel = Brand.font(size: 13, weight: .black)
    static let tabGlyph = Brand.font(size: 17, weight: .medium)
}

/// Applies em-based letter-tracking the way the design tokens express it
/// (e.g. `-.035em`) — SwiftUI's `.tracking` takes points, so this scales by
/// the font size actually in use at the call site.
extension View {
    func mbTracking(_ em: CGFloat, fontSize: CGFloat) -> some View {
        self.tracking(em * fontSize)
    }

    /// Display-only lowercasing — exactly what the web app's
    /// `text-transform: lowercase` does: never touches the underlying
    /// string, only how this one Text renders it. See readme.md's Content
    /// fundamentals: "what the user typed is preserved in the data and
    /// only ever *rendered* lowercase."
    func mbLowercase() -> some View {
        self.textCase(.lowercase)
    }
}
