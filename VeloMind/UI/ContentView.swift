import SwiftUI

struct ContentView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var showMenu = false
    
    var body: some View {
        NavigationStack {
            RideView()
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        Button(action: {
                            showMenu = true
                        }) {
                            Image(systemName: "line.3.horizontal")
                                .font(.title2)
                                .foregroundColor(.white)
                        }
                    }
                }
                .sheet(isPresented: $showMenu) {
                    MenuView()
                }
        }
    }
}

struct MenuView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            List {
                NavigationLink(destination: RideView()) {
                    Label("Ride", systemImage: "bicycle")
                }
                
                NavigationLink(destination: RouteView()) {
                    Label("Routes", systemImage: "map")
                }
                
                NavigationLink(destination: HistoryView()) {
                    Label("History", systemImage: "clock")
                }
                
                NavigationLink(destination: SettingsView()) {
                    Label("Settings", systemImage: "gear")
                }
            }
            .navigationTitle("Menu")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(RideCoordinator())
}
