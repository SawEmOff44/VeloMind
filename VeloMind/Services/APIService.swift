import Foundation

/// Service for communicating with VeloMind backend API
@MainActor
class APIService: ObservableObject {
    private let baseURL: String
    private let tokenKey = "velomind.authToken"
    
    init() {
        #if DEBUG
        // Use localhost for Simulator during development
        self.baseURL = "http://127.0.0.1:3001/api"
        #else
        // Use production backend for TestFlight/App Store
        self.baseURL = "https://velomind.onrender.com/api"
        #endif
    }
    
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

    private func jsonRequest(url: URL, method: String, body: Data) -> URLRequest {
        var request = authorizedRequest(url: url, method: method)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = body
        return request
    }

    // MARK: - Strava (via backend)

    struct StravaStatusResponse: Codable {
        let connected: Bool
    }

    struct StravaActivitiesResponse: Codable {
        let activities: [StravaActivity]
    }

    func fetchStravaStatus() async throws -> Bool {
        guard let url = URL(string: "\(baseURL)/strava/status") else {
            throw APIError.invalidURL
        }

        let request = authorizedRequest(url: url)
        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError
        }
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let decoded = try decoder.decode(StravaStatusResponse.self, from: data)
        return decoded.connected
    }

    func fetchStravaActivities() async throws -> [StravaActivity] {
        guard let url = URL(string: "\(baseURL)/strava/activities") else {
            throw APIError.invalidURL
        }

        let request = authorizedRequest(url: url)
        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError
        }
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        let decoded = try decoder.decode(StravaActivitiesResponse.self, from: data)
        return decoded.activities
    }

    func syncStrava() async throws {
        guard let url = URL(string: "\(baseURL)/strava/sync") else {
            throw APIError.invalidURL
        }

        var request = authorizedRequest(url: url, method: "POST")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
    }
    
    // MARK: - Routes
    
    func fetchRoutes() async throws -> [RouteInfo] {
        guard let url = URL(string: "\(baseURL)/gpx/list") else {
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
        let routesResponse = try decoder.decode(RoutesResponse.self, from: data)
        return routesResponse.routes
    }
    
    func downloadRoute(id: Int) async throws -> Data {
        // Returns GPX XML (Content-Type: application/gpx+xml)
        guard let url = URL(string: "\(baseURL)/gpx/download/\(id)") else {
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

    func downloadRouteWithWaypoints(id: Int) async throws -> Route {
        guard let url = URL(string: "\(baseURL)/gpx/\(id)/download") else {
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
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(Route.self, from: data)
    }
    
    func uploadRoute(name: String, gpxData: Data) async throws {
        // Backend expects multipart/form-data at POST /api/gpx/upload
        // with fields: name (text) and gpx (file)
        guard let url = URL(string: "\(baseURL)/gpx/upload") else {
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
        body.append("Content-Disposition: form-data; name=\"gpx\"; filename=\"route.gpx\"\r\n".data(using: .utf8)!)
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

    // MARK: - Rider Parameters

    struct BackendRiderParameters: Codable {
        let id: Int
        let name: String?
        let mass: Double?
        let cda: Double?
        let crr: Double?
        let drivetrainLoss: Double?
        let ftp: Double?
        let position: String?
        let isActive: Bool?
    }

    struct ActiveParametersResponse: Codable {
        let parameters: BackendRiderParameters
    }

    struct RiderParametersUpsertRequest: Encodable {
        let name: String
        let mass: Double
        let cda: Double
        let crr: Double
        let drivetrainLoss: Double
        let ftp: Double?
        let position: String
        let isActive: Bool
    }

    func fetchActiveRiderParameters() async throws -> BackendRiderParameters {
        guard let url = URL(string: "\(baseURL)/parameters/active") else {
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
        let decoded = try decoder.decode(ActiveParametersResponse.self, from: data)
        return decoded.parameters
    }

    func updateRiderParameters(id: Int, payload: RiderParametersUpsertRequest) async throws {
        guard let url = URL(string: "\(baseURL)/parameters/\(id)") else {
            throw APIError.invalidURL
        }

        let encoder = JSONEncoder()
        let body = try encoder.encode(payload)
        let request = jsonRequest(url: url, method: "PUT", body: body)

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }
    }

    func syncActiveRiderParameters(profile: RiderParameters, position: String) async throws {
        // Backend expects mass in kg. iOS model is inconsistent (sometimes lbs, sometimes kg).
        // Heuristic: values > 120 are almost certainly lbs.
        let massKg: Double = profile.mass > 120 ? (profile.mass / 2.2046226218) : profile.mass

        let active = try await fetchActiveRiderParameters()
        let payload = RiderParametersUpsertRequest(
            name: active.name ?? "Default",
            mass: massKg,
            cda: profile.cda,
            crr: profile.crr,
            drivetrainLoss: profile.drivetrainLoss,
            ftp: profile.ftp,
            position: position,
            isActive: true
        )
        try await updateRiderParameters(id: active.id, payload: payload)
    }

    // MARK: - Sessions

    struct CreateSessionRequest: Encodable {
        let routeId: Int?
        let name: String
        let startTime: Date
        let endTime: Date
        let duration: Double
        let distance: Double
        let averagePower: Double
        let normalizedPower: Double
        let averageSpeed: Double
        let averageCadence: Double
        let averageHeartRate: Double?
        let totalElevationGain: Double
        let tss: Double?
        let intensityFactor: Double?
        let dataPoints: [CreateSessionDataPoint]
    }

    struct CreateSessionDataPoint: Encodable {
        let timestamp: Date
        let latitude: Double
        let longitude: Double
        let distance: Double?
        let altitude: Double
        let speed: Double
        let cadence: Double
        let heartRate: Int?
        let power: Double
        let grade: Double
        let windSpeed: Double
        let windDirection: Double
    }

    struct BackendSession: Codable {
        let id: Int
    }

    struct CreateSessionResponse: Codable {
        let session: BackendSession
    }

    func uploadSession(_ session: RideSession, routeId: Int?, ftp: Double?, name: String? = nil) async throws -> Int {
        guard let url = URL(string: "\(baseURL)/sessions") else {
            throw APIError.invalidURL
        }

        let durationSeconds = max(session.duration, 1)
        let intensityFactor: Double?
        let tss: Double?
        if let ftp = ftp, ftp > 0 {
            let ifValue = session.normalizedPower / ftp
            intensityFactor = ifValue
            tss = (durationSeconds * session.normalizedPower * ifValue) / (ftp * 3600.0) * 100.0
        } else {
            intensityFactor = nil
            tss = nil
        }

        // Cap datapoints to keep payload reasonable for long rides.
        let maxPoints = 5000
        let stride = max(1, session.dataPoints.count / maxPoints)
        let sampled = stride == 1 ? session.dataPoints : session.dataPoints.enumerated().compactMap { idx, dp in
            (idx % stride == 0) ? dp : nil
        }

        let requestPayload = CreateSessionRequest(
            routeId: routeId,
            name: name ?? session.startTime.formatted(date: .abbreviated, time: .shortened),
            startTime: session.startTime,
            endTime: session.endTime ?? Date(),
            duration: session.duration,
            distance: session.distance,
            averagePower: session.averagePower,
            normalizedPower: session.normalizedPower,
            averageSpeed: session.averageSpeed,
            averageCadence: session.averageCadence,
            averageHeartRate: session.averageHeartRate.map(Double.init),
            totalElevationGain: session.totalElevationGain,
            tss: tss,
            intensityFactor: intensityFactor,
            dataPoints: sampled.map {
                CreateSessionDataPoint(
                    timestamp: $0.timestamp,
                    latitude: $0.latitude,
                    longitude: $0.longitude,
                    distance: $0.distance,
                    altitude: $0.altitude,
                    speed: $0.speed,
                    cadence: $0.cadence,
                    heartRate: $0.heartRate,
                    power: $0.power,
                    grade: $0.grade,
                    windSpeed: $0.windSpeed,
                    windDirection: $0.windDirection
                )
            }
        )

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        let body = try encoder.encode(requestPayload)
        let request = jsonRequest(url: url, method: "POST", body: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw APIError.serverError
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let decoded = try decoder.decode(CreateSessionResponse.self, from: data)
        return decoded.session.id
    }
}

// MARK: - Models

struct RoutesResponse: Codable {
    let routes: [RouteInfo]
}

struct RouteInfo: Codable, Identifiable {
    let id: Int
    let name: String
    let totalDistance: Double?
    let totalElevationGain: Double?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case totalDistance = "total_distance"
        case totalElevationGain = "total_elevation_gain"
        case createdAt = "created_at"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        totalDistance = container.decodeLossyDoubleIfPresent(forKey: .totalDistance)
        totalElevationGain = container.decodeLossyDoubleIfPresent(forKey: .totalElevationGain)
        createdAt = (try? container.decode(String.self, forKey: .createdAt)) ?? ""
    }
    
    var distanceMiles: Double {
        (totalDistance ?? 0) * 0.000621371
    }
    
    var elevationFeet: Double {
        (totalElevationGain ?? 0) * 3.28084
    }
}

enum APIError: Error {
    case invalidURL
    case serverError
    case decodingError
}
