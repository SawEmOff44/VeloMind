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
                        let userId = authManager.currentUser.map { String($0.id) }
                        rideCoordinator.configurePersistenceUser(userId)
                        rideCoordinator.authManager = authManager
                        rideCoordinator.retryPendingSessionUploads()
                    }
                    .onChange(of: authManager.currentUser?.id) { _, newUserID in
                        rideCoordinator.configurePersistenceUser(newUserID.map { String($0) })
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
                    .onReceive(NotificationCenter.default.publisher(for: .authTokenExpired)) { _ in
                        authManager.logout()
                    }
            } else {
                LoginView()
                    .environmentObject(authManager)
                    .onAppear {
                        rideCoordinator.configurePersistenceUser(nil)
                    }
            }
        }
    }
}
