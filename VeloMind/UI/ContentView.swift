import SwiftUI

struct ContentView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationStack {
            TabView(selection: $selectedTab) {
                RideView()
                    .tabItem {
                        Label("Ride", systemImage: "bicycle")
                    }
                    .tag(0)
                
                RouteView()
                    .tabItem {
                        Label("Routes", systemImage: "map")
                    }
                    .tag(1)
                
                HistoryView()
                    .tabItem {
                        Label("History", systemImage: "clock")
                    }
                    .tag(2)
                
                SettingsView()
                    .tabItem {
                        Label("Settings", systemImage: "gear")
                    }
                    .tag(3)
            }
            .navigationTitle(navigationTitle)
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private var navigationTitle: String {
        switch selectedTab {
        case 0: return "Ride"
        case 1: return "Routes"
        case 2: return "History"
        case 3: return "Settings"
        default: return "VeloMind"
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(RideCoordinator())
}
