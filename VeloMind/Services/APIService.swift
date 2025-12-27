import Foundation

/// Service for communicating with VeloMind backend API
@MainActor
class APIService: ObservableObject {
    private let baseURL = "http://127.0.0.1:3001/api" // Use 127.0.0.1 for iOS Simulator
    private let tokenKey = "velomind.authToken"
    
    private var authToken: String? {
        UserDefaults.standard.string(forKey: tokenKey)
    }
    
    private func authorizedRequest(url: URL, method: String = "GET") -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        return request
    }
    
    // MARK: - Routes
    
    func fetchRoutes() async throws -> [RouteInfo] {
        guard let url = URL(string: "\(baseURL)/gpx") else {
            throw APIError.invalidURL
        }
        
        let request = authorizedRequest(url: url)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode([RouteInfo].self, from: data)
    }
    
    func downloadRoute(id: Int) async throws -> Data {
        guard let url = URL(string: "\(baseURL)/gpx/\(id)/download") else {
            throw APIError.invalidURL
        }
        
        let request = authorizedRequest(url: url)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
        
        return data
    }
    
    func uploadRoute(name: String, gpxData: Data) async throws {
        guard let url = URL(string: "\(baseURL)/gpx") else {
            throw APIError.invalidURL
        }
        
        var request = authorizedRequest(url: url, method: "POST")
        
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        
        // Add name field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"name\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(name)\r\n".data(using: .utf8)!)
        
        // Add GPX file
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"gpxFile\"; filename=\"route.gpx\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: application/gpx+xml\r\n\r\n".data(using: .utf8)!)
        body.append(gpxData)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
    }
}

// MARK: - Models

struct RouteInfo: Codable, Identifiable {
    let id: Int
    let name: String
    let distance: Double?
    let elevationGain: Double?
    let createdAt: String
    
    var distanceMiles: Double {
        (distance ?? 0) * 0.000621371
    }
    
    var elevationFeet: Double {
        (elevationGain ?? 0) * 3.28084
    }
}

enum APIError: Error {
    case invalidURL
    case serverError
    case decodingError
}
