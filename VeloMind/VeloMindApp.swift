import SwiftUI

@main
struct VeloMindApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var rideCoordinator = RideCoordinator()
    @Environment(\.scenePhase) private var scenePhase
    
    var body: some Scene {
        WindowGroup {
            if authManager.isAuthenticated {
                ContentView()
                    .environmentObject(authManager)
                    .environmentObject(rideCoordinator)
                    .statusBar(hidden: true)
                    .edgesIgnoringSafeArea(.all)
                    .onAppear {
                        if let userId = authManager.currentUser?.id {
                            rideCoordinator.persistenceManager.setCurrentUser(String(userId))
                        }
                        rideCoordinator.authManager = authManager
                        rideCoordinator.retryPendingSessionUploads()
                    }
                    .onChange(of: scenePhase) { _, phase in
                        guard authManager.isAuthenticated else { return }
                        if phase == .active {
                            rideCoordinator.retryPendingSessionUploads()
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
