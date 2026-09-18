import SwiftUI
import UIKit

@main
struct ManualBrainApp: App {
    @StateObject private var store = AppStore()

    init() {
        // Temporary diagnostic (no #if DEBUG — XcodeGen-generated projects
        // don't define that compilation flag the way Xcode's own project
        // templates do, so a DEBUG-gated block here silently never runs):
        // prints every registered font family/name at launch, so a
        // font-not-rendering report can be checked against what actually
        // got bundled + registered rather than guessed at. Safe to delete
        // once Archivo is confirmed showing correctly.
        print("[Fonts] registered families: \(UIFont.familyNames.sorted())")
        for family in UIFont.familyNames.sorted() where family.localizedCaseInsensitiveContains("archivo") {
            print("[Fonts] \(family) -> \(UIFont.fontNames(forFamilyName: family))")
        }
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                // The product is deliberately flat, warm and light-only —
                // see DesignSystem/Colors.swift's header comment. Forcing
                // light mode keeps every hand-tuned colour (the lime block,
                // the greige ramp) exactly as designed rather than letting
                // the system re-derive a dark variant that was never
                // designed for this brand.
                .preferredColorScheme(.light)
                .tint(.mbInk)
        }
    }
}

struct RootView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        Group {
            switch store.authState {
            case .unknown:
                SplashView()
            case .loggedOut:
                OnboardingScreen()
            case .loggedIn:
                RootTabView()
            }
        }
        .task {
            if store.authState == .unknown {
                await store.bootstrap()
            }
        }
    }
}

private struct SplashView: View {
    var body: some View {
        ZStack {
            Color.bgPage.ignoresSafeArea()
            Text("manual brain")
                .font(MBFont.wordmark)
                .mbTracking(-0.035, fontSize: 40)
                .foregroundStyle(Color.textBody)
        }
    }
}
