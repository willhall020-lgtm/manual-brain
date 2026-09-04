import SwiftUI
import AuthenticationServices

/// Replaces the old password-based LoginScreen: the "password journey" is
/// gone for this app entirely — the native Sign in with Apple button below
/// is the only credential this app ever asks for.
///
/// There is still no per-user account system (README.md: "Deliberately out
/// of scope... Per-user accounts"). What happens here is a one-time
/// **onboarding claim**, not account creation: the first Apple account
/// that ever completes this becomes the app's one permanent linked owner
/// (`app/api/auth/apple/route.ts`, `users` table) and immediately sees all
/// the data that already exists — nothing to migrate, since that data was
/// never scoped to anyone in the first place. A second, different Apple
/// account is rejected with a plain explanation rather than silently
/// creating a second, empty account.
struct OnboardingScreen: View {
    @EnvironmentObject private var store: AppStore
    @State private var showServerField = false

    var body: some View {
        ZStack {
            Color.bgPage.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 22) {
                    Spacer(minLength: 40)

                    VStack(spacing: 10) {
                        Text("manual brain")
                            .font(MBFont.wordmark)
                            .mbTracking(-0.035, fontSize: 40)
                            .foregroundStyle(Color.textBody)
                        Text("your brain, on your phone")
                            .font(MBFont.bodyMedium)
                            .mbLowercase()
                            .foregroundStyle(Color.textSubtle)
                    }

                    VStack(spacing: 14) {
                        SignInWithAppleButton(.signIn, onRequest: configure, onCompletion: handle)
                            .signInWithAppleButtonStyle(.black)
                            .frame(height: 50)
                            .clipShape(RoundedRectangle(cornerRadius: MBRadius.pill, style: .continuous))
                            .disabled(store.isAuthenticating)
                            .opacity(store.isAuthenticating ? 0.6 : 1)

                        if store.isAuthenticating {
                            Text("signing in…")
                                .font(MBFont.metaSm)
                                .foregroundStyle(Color.textSubtle)
                        }

                        if let error = store.authError {
                            Text(error)
                                .font(MBFont.metaSm)
                                .foregroundStyle(Color.dangerStrong)
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .padding(20)
                    .background(Color.surfaceCard)
                    .clipShape(RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: MBRadius.panel, style: .continuous)
                            .stroke(Color.borderCard, lineWidth: 1)
                    )

                    DisclosureGroup("server", isExpanded: $showServerField) {
                        TextField("https://your-deploy.example", text: Binding(
                            get: { store.serverURLString },
                            set: { store.serverURLString = $0 }
                        ))
                        .font(MBFont.metaSm)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(.URL)
                        .padding(.horizontal, 12)
                        .frame(minHeight: 40)
                        .background(Color.surfaceInput)
                        .clipShape(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous))
                        .padding(.top, 8)
                    }
                    .font(MBFont.metaSm)
                    .mbLowercase()
                    .foregroundStyle(Color.textSubtle)

                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 28)
                .frame(maxWidth: 420)
                .frame(maxWidth: .infinity)
            }
        }
    }

    private func configure(_ request: ASAuthorizationAppleIDRequest) {
        request.requestedScopes = [.email]
    }

    private func handle(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard
                let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                let tokenData = credential.identityToken,
                let identityToken = String(data: tokenData, encoding: .utf8)
            else {
                store.authError = "couldn't read that sign-in — try again."
                return
            }
            Task { await store.signInWithApple(identityToken: identityToken) }
        case .failure(let error):
            // ASAuthorizationError.canceled fires whenever the sheet is
            // dismissed without completing — not a real error, so it's
            // left silent rather than shown as one.
            let nsError = error as NSError
            if nsError.domain == ASAuthorizationError.errorDomain,
               nsError.code == ASAuthorizationError.canceled.rawValue {
                return
            }
            store.authError = error.localizedDescription
        }
    }
}
