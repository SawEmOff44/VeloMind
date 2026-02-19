import Foundation

/// Service for syncing routes between web backend and iOS app
actor RouteSyncService {
    static let shared = RouteSyncService()
    
    private let baseURL: String
    private var authToken: String?
    private let tokenKey = "velomind.authToken"
    
    private init() {
        self.baseURL = AppConfiguration.apiBaseURL
    }
    
    func setAuthToken(_ token: String) {
        self.authToken = token
    }

    private func resolvedAuthToken() -> String? {
        if let authToken, !authToken.isEmpty {
            return authToken
        }
        return UserDefaults.standard.string(forKey: tokenKey)
    }
    
    // MARK: - Route Sync
    
    func fetchAvailableRoutes() async throws -> [RemoteRoute] {
        guard let token = resolvedAuthToken() else {
            throw RouteSyncError.notAuthenticated
        }
        
        guard let url = URL(string: "\(baseURL)/gpx/list") else {
            throw RouteSyncError.invalidResponse
        }
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
    
    func downloadRoute(id: Int) async throws -> Data {
        guard let token = resolvedAuthToken() else {
            throw RouteSyncError.notAuthenticated
        }
        
        guard let url = URL(string: "\(baseURL)/gpx/download/\(id)") else {
            throw RouteSyncError.invalidResponse
        }
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
        
        return data
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
                let fileName = "\(sanitizeFileName(remoteRoute.name)).gpx"
                let fileURL = documentsPath.appendingPathComponent(fileName)
                
                try gpxData.write(to: fileURL, options: .atomic)
                
                // Load into route manager (throws on parse issues)
                try await routeManager.loadGPXFile(from: fileURL, routeId: String(remoteRoute.id))
            }
        }
    }

    private func sanitizeFileName(_ name: String) -> String {
        let invalid = CharacterSet(charactersIn: "/:\\?%*|\"<>")
        let parts = name.components(separatedBy: invalid)
        let sanitized = parts.joined(separator: "_").trimmingCharacters(in: .whitespacesAndNewlines)
        return sanitized.isEmpty ? "route" : sanitized
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

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case name
        case totalDistance = "total_distance"
        case totalElevationGain = "total_elevation_gain"
        case pointCount = "point_count"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        userId = try container.decode(Int.self, forKey: .userId)
        name = try container.decode(String.self, forKey: .name)
        totalDistance = container.decodeLossyDoubleIfPresent(forKey: .totalDistance) ?? 0
        totalElevationGain = container.decodeLossyDoubleIfPresent(forKey: .totalElevationGain)
        pointCount = container.decodeLossyIntIfPresent(forKey: .pointCount) ?? 0
        createdAt = (try? container.decode(Date.self, forKey: .createdAt)) ?? Date()
        updatedAt = try? container.decodeIfPresent(Date.self, forKey: .updatedAt)
    }
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
