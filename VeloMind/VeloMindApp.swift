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
                    .onAppear {
                        if let userId = authManager.currentUser?.id.uuidString {
                            rideCoordinator.persistenceManager.setCurrentUser(userId)
                        }
                    }
            } else {
                LoginView()
                    .environmentObject(authManager)
            }
        }
    }
}
