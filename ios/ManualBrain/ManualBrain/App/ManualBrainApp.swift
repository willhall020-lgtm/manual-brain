import SwiftUI

@main
struct ManualBrainApp: App {
    @StateObject private var store = AppStore()

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
                LoginScreen()
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
