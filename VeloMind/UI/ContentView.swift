import SwiftUI

struct ContentView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                RideView()
                    .navigationTitle("Ride")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tabItem {
                Label("Ride", systemImage: "bicycle")
            }
            .tag(0)
            
            NavigationStack {
                RouteView()
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tabItem {
                Label("Routes", systemImage: "map")
            }
            .tag(1)
            
            NavigationStack {
                HistoryView()
                    .navigationTitle("History")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tabItem {
                Label("History", systemImage: "clock")
            }
            .tag(2)
            
            NavigationStack {
                SettingsView()
                    .navigationTitle("Settings")
                    .navigationBarTitleDisplayMode(.inline)
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
