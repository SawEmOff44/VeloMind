import SwiftUI

@main
struct VeloMindApp: App {
    @StateObject private var rideCoordinator = RideCoordinator()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(rideCoordinator)
        }
    }
}
