import SwiftUI

struct ContentView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            RideView()
                .tabItem {
                    Label("Ride", systemImage: "bicycle")
                }
                .tag(0)
            
            NavigationStack {
                RouteView()
            }
            .tabItem {
                Label("Routes", systemImage: "map")
            }
            .tag(1)
            
            NavigationStack {
                HistoryView()
            }
            .tabItem {
                Label("History", systemImage: "clock")
            }
            .tag(2)
            
            NavigationStack {
                SettingsView()
            }
            .tabItem {
                Label("Settings", systemImage: "gear")
            }
            .tag(3)
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(RideCoordinator())
}
