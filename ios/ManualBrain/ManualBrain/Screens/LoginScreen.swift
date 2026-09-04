import SwiftUI

/// app/login/page.tsx, adapted full-screen for a phone. Manual Brain's own
/// shared-password gate (lib/auth.ts) — there is no per-user account system
/// (README.md: "Deliberately out of scope... Per-user accounts").
struct LoginScreen: View {
    @EnvironmentObject private var store: AppStore
    @State private var password = ""
    @State private var showServerField = false
    @FocusState private var passwordFocused: Bool

    var body: some View {
        ZStack {
            Color.bgPage.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 22) {
                    Spacer(minLength: 40)

                    Text("manual brain")
                        .font(MBFont.wordmark)
                        .mbTracking(-0.035, fontSize: 40)
                        .foregroundStyle(Color.textBody)

                    VStack(spacing: 14) {
                        SecureField("password", text: $password)
                            .focused($passwordFocused)
                            .font(MBFont.bodyLg)
                            .padding(.horizontal, 12)
                            .frame(minHeight: 44)
                            .background(Color.surfaceInput)
                            .clipShape(RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: MBRadius.input, style: .continuous)
                                    .stroke(Color.borderControl, lineWidth: 1)
                            )
                            .submitLabel(.go)
                            .onSubmit(submit)

                        if let error = store.loginError {
                            Text(error)
                                .font(MBFont.metaSm)
                                .foregroundStyle(Color.dangerStrong)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        PrimaryPillButton(
                            label: store.isLoggingIn ? "checking…" : "enter",
                            enabled: !password.isEmpty && !store.isLoggingIn,
                            action: submit
                        )
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
        .onAppear { passwordFocused = true }
    }

    private func submit() {
        guard !password.isEmpty else { return }
        Task { await store.login(password: password) }
    }
}
