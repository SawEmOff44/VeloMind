import SwiftUI

@main
struct VeloMindApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var rideCoordinator = RideCoordinator()
    
    var body: some Scene {
        WindowGroup {
            if authManager.isAuthenticated {
                ContentView()
                    .environmentObject(authManager)
                    .environmentObject(rideCoordinator)
                    .statusBar(hidden: true)
                    .edgesIgnoringSafeArea(.all)
                    .onAppear {
                        if let userId = authManager.currentUser?.id.uuidString {
                            rideCoordinator.persistenceManager.setCurrentUser(userId)
                        }
                    }
                    .onOpenURL { url in
                        // Handle Strava OAuth callback
                        if url.scheme == "velomind" && url.host == "strava" {
                            // URL will be handled by ASWebAuthenticationSession automatically
                            print("Received Strava callback: \(url)")
                        }
                    }
            } else {
                LoginView()
                    .environmentObject(authManager)
            }
        }
    }
}
