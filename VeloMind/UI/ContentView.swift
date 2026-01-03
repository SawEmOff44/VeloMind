import SwiftUI

struct ContentView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var showMenu = false
    
    var body: some View {
        ZStack(alignment: .topTrailing) {
            RideView()

            // Menu button (more visible, top-right)
            Button(action: {
                showMenu = true
            }) {
                Image(systemName: "gearshape.fill")
                    .font(.title3)
                    .foregroundColor(.white)
                    .padding(14)
                    .background(Color.black.opacity(0.5))
                    .clipShape(Circle())
            }
            .padding(.top, 56)
            .padding(.trailing, 14)
        }
        .sheet(isPresented: $showMenu) {
            MenuView()
        }
        .edgesIgnoringSafeArea(.all)
    }
}

struct MenuView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.edgesIgnoringSafeArea(.all)
                
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
                .scrollContentBackground(.hidden)
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
        .presentationBackground(.black)
    }
}

#Preview {
    ContentView()
        .environmentObject(RideCoordinator())
}
