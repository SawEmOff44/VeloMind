import Foundation

/// Service for syncing routes between web backend and iOS app
actor RouteSyncService {
    static let shared = RouteSyncService()
    
    private let baseURL: String
    private var authToken: String?
    
    private init() {
        // Use environment variable or default to localhost
        self.baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3000/api"
    }
    
    func setAuthToken(_ token: String) {
        self.authToken = token
    }
    
    // MARK: - Route Sync
    
    func fetchAvailableRoutes() async throws -> [RemoteRoute] {
        guard let token = authToken else {
            throw RouteSyncError.notAuthenticated
        }
        
        let url = URL(string: "\(baseURL)/gpx/list")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw RouteSyncError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw RouteSyncError.serverError(statusCode: httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        
        let result = try decoder.decode(RouteListResponse.self, from: data)
        return result.routes
    }
    
    func downloadRoute(id: Int) async throws -> String {
        guard let token = authToken else {
            throw RouteSyncError.notAuthenticated
        }
        
        let url = URL(string: "\(baseURL)/gpx/download/\(id)")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw RouteSyncError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw RouteSyncError.serverError(statusCode: httpResponse.statusCode)
        }
        
        guard let gpxString = String(data: data, encoding: .utf8) else {
            throw RouteSyncError.invalidData
        }
        
        return gpxString
    }
    
    func syncRoutes(to routeManager: RouteManager) async throws {
        let remoteRoutes = try await fetchAvailableRoutes()
        
        for remoteRoute in remoteRoutes {
            // Check if route already exists locally
            let hasRoute = await MainActor.run {
                routeManager.hasRoute(withId: String(remoteRoute.id))
            }
            
            if !hasRoute {
                // Download and parse GPX
                let gpxData = try await downloadRoute(id: remoteRoute.id)
                
                // Save to documents directory
                let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let fileName = "\(remoteRoute.name).gpx"
                let fileURL = documentsPath.appendingPathComponent(fileName)
                
                try gpxData.write(to: fileURL, atomically: true, encoding: .utf8)
                
                // Load into route manager
                await MainActor.run {
                    routeManager.loadGPX(from: fileURL, routeId: String(remoteRoute.id))
                }
            }
        }
    }
}

// MARK: - Data Models

struct RouteListResponse: Codable {
    let routes: [RemoteRoute]
}

struct RemoteRoute: Codable, Identifiable {
    let id: Int
    let userId: Int
    let name: String
    let totalDistance: Double
    let totalElevationGain: Double?
    let pointCount: Int
    let createdAt: Date
    let updatedAt: Date?
}

enum RouteSyncError: LocalizedError {
    case notAuthenticated
    case invalidResponse
    case serverError(statusCode: Int)
    case invalidData
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Not authenticated. Please log in."
        case .invalidResponse:
            return "Invalid response from server"
        case .serverError(let code):
            return "Server error: \(code)"
        case .invalidData:
            return "Invalid data received from server"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}
