import SwiftUI
import UniformTypeIdentifiers

struct RouteView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @StateObject private var apiService = APIService()
    @State private var isImporting = false
    @State private var availableRoutes: [RouteInfo] = []
    @State private var isLoadingRoutes = false
    @State private var errorMessage: String?
    
    var body: some View {
        List {
            // Current Active Route
            if let route = coordinator.routeManager.currentRoute {
                Section("Active Route") {
                    RouteCard(route: route)
                }
            }
            
            // Available Routes from Backend
            Section {
                if isLoadingRoutes {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                } else if availableRoutes.isEmpty {
                    ContentUnavailableView(
                        "No Routes Available",
                        systemImage: "map",
                        description: Text("Import a GPX or FIT file to get started")
                    )
                } else {
                    ForEach(availableRoutes) { routeInfo in
                        RouteInfoCard(routeInfo: routeInfo) {
                            loadRouteFromBackend(routeInfo)
                        }
                    }
                }
            } header: {
                Text("Available Routes")
            }
            
            if let error = errorMessage {
                Section {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                }
            }
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button(action: {
                        isImporting = true
                    }) {
                        Label("Import from File", systemImage: "square.and.arrow.down")
                    }
                    
                    Button(action: {
                        Task {
                            await fetchRoutes()
                        }
                    }) {
                        Label("Refresh Routes", systemImage: "arrow.clockwise")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .fileImporter(
            isPresented: $isImporting,
            allowedContentTypes: [.xml, .fitFile],
            allowsMultipleSelection: false
        ) { result in
            handleRouteImport(result)
        }
        .task {
            await fetchRoutes()
        }
    }
    
    private func fetchRoutes() async {
        isLoadingRoutes = true
        errorMessage = nil
        
        do {
            availableRoutes = try await apiService.fetchRoutes()
        } catch {
            errorMessage = "Failed to load routes from server. Make sure backend is running."
            print("Failed to fetch routes: \(error)")
        }
        
        isLoadingRoutes = false
    }
    
    private func loadRouteFromBackend(_ routeInfo: RouteInfo) {
        Task {
            do {
                let route = try await apiService.downloadRouteWithWaypoints(id: routeInfo.id)
                coordinator.routeManager.loadRemoteRoute(route)
            } catch {
                errorMessage = "Failed to load route: \(error.localizedDescription)"
            }
        }
    }
    
    private func handleRouteImport(_ result: Result<[URL], Error>) {
        switch result {
        case .success(let urls):
            guard let url = urls.first else { return }
            
            Task {
                var loadedLocally = false
                do {
                    let data = try Data(contentsOf: url)
                    let name = url.deletingPathExtension().lastPathComponent
                    let metadata = try routeUploadMetadata(for: url)
                    
                    if metadata.canLoadLocally {
                        do {
                            try await coordinator.routeManager.loadRoute(from: data, name: name)
                            loadedLocally = true
                        } catch {
                            print("⚠️ Local route parse failed, falling back to backend parser: \(error.localizedDescription)")
                        }
                    }
                    
                    // Upload to backend
                    let uploadedRoute = try await apiService.uploadRoute(
                        name: name,
                        routeData: data,
                        fileName: metadata.fileName,
                        contentType: metadata.contentType
                    )

                    // Reload from backend so we keep route id + server waypoints.
                    let remoteRoute = try await apiService.downloadRouteWithWaypoints(id: uploadedRoute.id)
                    coordinator.routeManager.loadRemoteRoute(remoteRoute)
                    
                    // Refresh list
                    await fetchRoutes()
                } catch {
                    if loadedLocally {
                        errorMessage = "Route imported locally, but backend sync failed: \(error.localizedDescription)"
                    } else {
                        errorMessage = "Failed to import route: \(error.localizedDescription)"
                    }
                }
            }
            
        case .failure(let error):
            errorMessage = "File import error: \(error.localizedDescription)"
        }
    }

    private func routeUploadMetadata(for url: URL) throws -> RouteUploadMetadata {
        let ext = url.pathExtension.lowercased()
        switch ext {
        case "gpx":
            return RouteUploadMetadata(fileName: url.lastPathComponent, contentType: "application/gpx+xml", canLoadLocally: true)
        case "xml":
            return RouteUploadMetadata(fileName: url.lastPathComponent, contentType: "application/xml", canLoadLocally: true)
        case "fit":
            return RouteUploadMetadata(fileName: url.lastPathComponent, contentType: "application/vnd.ant.fit", canLoadLocally: false)
        default:
            throw RouteImportError.unsupportedFileType(ext)
        }
    }
}

private struct RouteUploadMetadata {
    let fileName: String
    let contentType: String
    let canLoadLocally: Bool
}

private enum RouteImportError: LocalizedError {
    case unsupportedFileType(String)

    var errorDescription: String? {
        switch self {
        case .unsupportedFileType(let ext):
            if ext.isEmpty {
                return "Unsupported file type"
            }
            return "Unsupported file type: .\(ext)"
        }
    }
}

private extension UTType {
    static var fitFile: UTType {
        UTType(filenameExtension: "fit") ?? UTType(importedAs: "com.garmin.fit")
    }
}

struct RouteCard: View {
    let route: Route
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var showNavigationAlert = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text(route.name)
                        .font(.headline)
                    
                    HStack {
                        let miles = route.totalDistance * 0.000621371
                        let feet = route.totalElevationGain * 3.28084
                        
                        Label(String(format: "%.1f mi", miles), systemImage: "figure.outdoor.cycle")
                            .font(.caption)
                        
                        Label(String(format: "%.0f ft", feet), systemImage: "arrow.up")
                            .font(.caption)
                        
                        if !route.waypoints.isEmpty {
                            Label("\(route.waypoints.count)", systemImage: "mappin")
                                .font(.caption)
                                .foregroundColor(.orange)
                        }
                    }
                }
                
                Spacer()
                
                Button(action: {
                    showNavigationAlert = true
                }) {
                    VStack {
                        Image(systemName: "location.fill")
                            .font(.title2)
                        Text("Navigate")
                            .font(.caption)
                    }
                    .foregroundColor(.white)
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [Color.cyan, Color.blue],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .cornerRadius(12)
                }
            }
        }
        .alert("Start Navigation?", isPresented: $showNavigationAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Start Ride") {
                coordinator.startRideWithNavigation(route: route)
            }
        } message: {
            Text("This will start a ride with turn-by-turn navigation and waypoint alerts for '\(route.name)'")
        }
    }
}

struct RouteInfoCard: View {
    let routeInfo: RouteInfo
    let onLoad: () -> Void
    
    var body: some View {
        Button(action: onLoad) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text(routeInfo.name)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    HStack(spacing: 16) {
                        Label(String(format: "%.2f mi", routeInfo.distanceMiles), systemImage: "map")
                        Label(String(format: "%.0f ft", routeInfo.elevationFeet), systemImage: "arrow.up.forward")
                    }
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "arrow.down.circle")
                    .foregroundColor(.blue)
                    .font(.title3)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    RouteView()
        .environmentObject(RideCoordinator())
}
