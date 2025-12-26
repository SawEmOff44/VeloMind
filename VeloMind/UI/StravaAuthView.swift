import SwiftUI
import AuthenticationServices

struct StravaAuthView: View {
    @EnvironmentObject var stravaManager: StravaManager
    @Environment(\.dismiss) var dismiss
    @State private var showingWebAuth = false
    @State private var errorMessage: String?
    
    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [Color.orange.opacity(0.8), Color.red.opacity(0.6)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 30) {
                    // Strava Logo Area
                    VStack(spacing: 16) {
                        Image(systemName: "figure.outdoor.cycle")
                            .font(.system(size: 80))
                            .foregroundColor(.white)
                        
                        Text("Connect with Strava")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Import your workout history and automatically sync your rides")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.9))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)
                    }
                    
                    // Benefits
                    VStack(alignment: .leading, spacing: 18) {
                        BenefitRow(
                            icon: "arrow.triangle.2.circlepath",
                            text: "Auto-sync your power data"
                        )
                        BenefitRow(
                            icon: "chart.line.uptrend.xyaxis",
                            text: "Estimate FTP from rides"
                        )
                        BenefitRow(
                            icon: "brain.head.profile",
                            text: "Learn your fitness patterns"
                        )
                        BenefitRow(
                            icon: "shield.checkered",
                            text: "Secure OAuth authentication"
                        )
                    }
                    .padding(.horizontal, 40)
                    
                    // Connect Button
                    Button(action: {
                        authenticateWithStrava()
                    }) {
                        HStack {
                            Image(systemName: "link.circle.fill")
                                .font(.title2)
                            Text("Connect to Strava")
                                .fontWeight(.bold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(Color.white)
                        .foregroundColor(.orange)
                        .cornerRadius(16)
                        .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 5)
                    }
                    .padding(.horizontal, 40)
                    
                    // Skip Button
                    Button(action: {
                        dismiss()
                    }) {
                        Text("Skip for now")
                            .foregroundColor(.white.opacity(0.8))
                            .underline()
                    }
                    .padding(.bottom, 20)
                    
                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(.horizontal)
                    }
                    }
                .padding(.top, 60)
                .padding(.bottom, 40)
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Done") {
                    dismiss()
                }
                .foregroundColor(.white)
            }
        }
    }
    
    private func authenticateWithStrava() {
        guard let authURL = stravaManager.getAuthorizationURL() else {
            errorMessage = "Failed to generate authorization URL"
            return
        }
        
        // Use ASWebAuthenticationSession for OAuth
        let session = ASWebAuthenticationSession(
            url: authURL,
            callbackURLScheme: "velomind"
        ) { callbackURL, error in
            if let error = error {
                errorMessage = "Authentication failed: \(error.localizedDescription)"
                return
            }
            
            guard let callbackURL = callbackURL,
                  let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: true),
                  let code = components.queryItems?.first(where: { $0.name == "code" })?.value else {
                errorMessage = "Failed to extract authorization code"
                return
            }
            
            // Exchange code for tokens
            Task {
                await stravaManager.handleAuthorizationCallback(code: code)
                if stravaManager.isAuthenticated {
                    dismiss()
                }
            }
        }
        
        session.prefersEphemeralWebBrowserSession = false
        session.start()
    }
}

struct BenefitRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.white)
                .frame(width: 30)
            
            Text(text)
                .font(.body)
                .foregroundColor(.white)
        }
    }
}

#Preview {
    StravaAuthView()
        .environmentObject(StravaManager())
}
