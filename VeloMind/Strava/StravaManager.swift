import Foundation
import os.log

/// Manages Strava OAuth and API interactions
@MainActor
class StravaManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var athlete: StravaAthlete?
    @Published var recentActivities: [StravaActivity] = []
    @Published var isLoading = false
    
    private let logger = Logger(subsystem: "com.velomind.app", category: "Strava")

    // NOTE: Strava OAuth should be handled via the backend.
    // Do not ship Strava client secrets in the iOS app.

    private var tokens: StravaTokens?
    
    // API endpoints (only used if tokens are injected; OAuth exchange is backend-only)
    private let baseURL = "https://www.strava.com/api/v3"
    
    // MARK: - Authentication
    
    func getAuthorizationURL() -> URL? {
        // Deprecated: use backend OAuth flow.
        return nil
    }

    func handleAuthorizationCallback(code: String) async {
        // Deprecated: use backend OAuth flow.
        logger.warning("Strava OAuth callback received on iOS client; ignored. Use backend OAuth flow.")
    }

    private func refreshTokensIfNeeded() async throws {
        guard let tokens = tokens, tokens.isExpired else {
            return
        }

        // Without a client secret, token refresh must be done via the backend.
        throw StravaError.notAuthenticated
    }
    
    // MARK: - API Requests
    
    private func makeAuthenticatedRequest(endpoint: String) async throws -> Data {
        try await refreshTokensIfNeeded()
        
        guard let tokens = tokens else {
            throw StravaError.notAuthenticated
        }
        
        let url = URL(string: "\(baseURL)\(endpoint)")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(tokens.accessToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw StravaError.requestFailed
        }
        
        return data
    }
    
    // MARK: - Athlete Data
    
    func fetchAthleteProfile() async {
        do {
            let data = try await makeAuthenticatedRequest(endpoint: "/athlete")
            let decoder = JSONDecoder()
            self.athlete = try decoder.decode(StravaAthlete.self, from: data)
            logger.info("Fetched athlete: \(self.athlete?.firstname ?? "Unknown")")
        } catch {
            logger.error("Failed to fetch athlete: \(error.localizedDescription)")
        }
    }
    
    // MARK: - Activities
    
    func fetchRecentActivities(limit: Int = 30) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let data = try await makeAuthenticatedRequest(endpoint: "/athlete/activities?per_page=\(limit)")
            
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            self.recentActivities = try decoder.decode([StravaActivity].self, from: data)
            
            logger.info("Fetched \(self.recentActivities.count) activities")
        } catch {
            logger.error("Failed to fetch activities: \(error.localizedDescription)")
        }
    }
    
    // For FitnessProfileManager integration
    func fetchRecentActivities() async throws -> [StravaActivity] {
        let data = try await makeAuthenticatedRequest(endpoint: "/athlete/activities?per_page=30")
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([StravaActivity].self, from: data)
    }
    
    func fetchActivityStreams(activityID: Int, streamTypes: [String] = ["time", "latlng", "altitude", "velocity_smooth", "heartrate", "cadence", "watts"]) async throws -> StravaStreams {
        let types = streamTypes.joined(separator: ",")
        let data = try await makeAuthenticatedRequest(endpoint: "/activities/\(activityID)/streams?keys=\(types)&key_by_type=true")
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(StravaStreams.self, from: data)
    }
    
    // MARK: - Upload Activity
    
    func uploadActivity(name: String, type: String, startDate: Date, elapsedTime: Int, data: Data, dataType: String = "gpx") async throws -> Int {
        // Upload activity to Strava
        // Returns activity ID
        
        let url = URL(string: "\(baseURL)/uploads")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        guard let tokens = tokens else {
            throw StravaError.notAuthenticated
        }
        
        request.setValue("Bearer \(tokens.accessToken)", forHTTPHeaderField: "Authorization")
        
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        
        // Add form fields
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"name\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(name)\r\n".data(using: .utf8)!)
        
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"type\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(type)\r\n".data(using: .utf8)!)
        
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"data_type\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(dataType)\r\n".data(using: .utf8)!)
        
        // Add file
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"activity.\(dataType)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: application/octet-stream\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n".data(using: .utf8)!)
        
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (responseData, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw StravaError.uploadFailed
        }
        
        let result = try JSONSerialization.jsonObject(with: responseData) as? [String: Any]
        guard let activityID = result?["id"] as? Int else {
            throw StravaError.uploadFailed
        }
        
        logger.info("Uploaded activity to Strava: \(activityID)")
        return activityID
    }
}

// MARK: - Errors

enum StravaError: Error {
    case authenticationFailed
    case notAuthenticated
    case tokenRefreshFailed
    case requestFailed
    case uploadFailed
}
