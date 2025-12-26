import SwiftUI

struct RouteView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var isImporting = false
    
    var body: some View {
        List {
            if let route = coordinator.routeManager.currentRoute {
                Section("Active Route") {
                    RouteCard(route: route)
                }
            } else {
                ContentUnavailableView(
                    "No Route Loaded",
                    systemImage: "map",
                    description: Text("Import a GPX file to get started")
                )
            }
        }
        .navigationTitle("Routes")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: {
                    isImporting = true
                }) {
                    Label("Import GPX", systemImage: "square.and.arrow.down")
                }
            }
        }
        .fileImporter(
            isPresented: $isImporting,
            allowedContentTypes: [.xml],
            allowsMultipleSelection: false
        ) { result in
            handleGPXImport(result)
        }
    }
    
    private func handleGPXImport(_ result: Result<[URL], Error>) {
        switch result {
        case .success(let urls):
            guard let url = urls.first else { return }
            
            Task {
                do {
                    let data = try Data(contentsOf: url)
                    let name = url.deletingPathExtension().lastPathComponent
                    try await coordinator.routeManager.loadRoute(from: data, name: name)
                } catch {
                    print("Failed to import GPX: \(error)")
                }
            }
            
        case .failure(let error):
            print("File import error: \(error)")
        }
    }
}

struct RouteCard: View {
    let route: Route
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(route.name)
                .font(.headline)
            
            HStack {
                let miles = route.totalDistance * 0.000621371
                let feet = route.totalElevationGain * 3.28084
                Label(String(format: "%.2f mi", miles), systemImage: "map")
                Spacer()
                Label(String(format: "%.0f ft", feet), systemImage: "arrow.up.forward")
            }
            .font(.subheadline)
            .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    RouteView()
        .environmentObject(RideCoordinator())
}
