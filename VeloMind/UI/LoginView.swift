import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var isRegistering = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(spacing: 30) {
                    Spacer()
                    
                    // Logo and Title
                    VStack(spacing: 15) {
                        if let logo = UIImage(named: "VeloMind_Logo") {
                            Image(uiImage: logo)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(height: 120)
                                .shadow(color: .veloCyan.opacity(0.3), radius: 20, x: 0, y: 0)
                        } else {
                            // Fallback: cycling icon
                            Image(systemName: "bicycle.circle.fill")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(height: 120)
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [.veloCyan, .veloTeal, .veloGreen],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .shadow(color: .veloCyan.opacity(0.3), radius: 20, x: 0, y: 0)
                        }
                        
                        Text("VeloMind")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("Power Your Ride")
                            .font(.title3)
                            .foregroundColor(.gray)
                    }
                    .padding(.bottom, 40)
                    
                    // Form Fields
                    VStack(spacing: 16) {
                        TextField("Email", text: $email)
                            .textFieldStyle(RoundedTextFieldStyle())
                            .textContentType(.emailAddress)
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)
                        
                        if isRegistering {
                            TextField("Name", text: $name)
                                .textFieldStyle(RoundedTextFieldStyle())
                                .textContentType(.name)
                        }
                        
                        SecureField("Password", text: $password)
                            .textFieldStyle(RoundedTextFieldStyle())
                            .textContentType(isRegistering ? .newPassword : .password)
                    }
                    .padding(.horizontal)
                    
                    // Action Button
                    Button(action: handleAuth) {
                        if authManager.isLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text(isRegistering ? "Create Account" : "Sign In")
                                .font(.headline)
                                .foregroundColor(.white)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 55)
                    .background(
                        LinearGradient(
                            colors: [.veloCyan, .veloTeal, .veloGreen],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                    .padding(.horizontal)
                    .disabled(authManager.isLoading || !isFormValid)
                    .opacity(isFormValid ? 1.0 : 0.6)
                    
                    // Toggle Button
                    Button(action: {
                        withAnimation {
                            isRegistering.toggle()
                            errorMessage = ""
                            showError = false
                        }
                    }) {
                        HStack(spacing: 4) {
                            Text(isRegistering ? "Already have an account?" : "Don't have an account?")
                                .foregroundColor(.gray)
                            Text(isRegistering ? "Sign In" : "Create Account")
                                .foregroundColor(.veloTeal)
                                .fontWeight(.semibold)
                        }
                        .font(.subheadline)
                    }
                    .disabled(authManager.isLoading)
                    
                    Spacer()
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private var isFormValid: Bool {
        let emailValid = email.contains("@") && email.contains(".")
        let passwordValid = password.count >= 6
        
        if isRegistering {
            return emailValid && passwordValid && !name.isEmpty
        } else {
            return emailValid && passwordValid
        }
    }
    
    private func handleAuth() {
        Task {
            do {
                if isRegistering {
                    try await authManager.register(email: email, password: password, name: name)
                } else {
                    try await authManager.login(email: email, password: password)
                }
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
        }
    }
}

struct RoundedTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(Color.gray.opacity(0.2))
            .foregroundColor(.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthenticationManager())
}
