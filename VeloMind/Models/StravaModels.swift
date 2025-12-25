import Foundation

/// Strava athlete data
struct StravaAthlete: Codable {
    let id: Int
    let firstname: String
    let lastname: String
    let profileMedium: String?
    let profile: String?
    
    enum CodingKeys: String, CodingKey {
        case id, firstname, lastname
        case profileMedium = "profile_medium"
        case profile
    }
}

/// Strava activity summary
struct StravaActivity: Codable, Identifiable {
    let id: Int
    let name: String
    let distance: Double        // meters
    let movingTime: Int        // seconds
    let elapsedTime: Int       // seconds
    let totalElevationGain: Double  // meters
    let type: String
    let startDate: Date
    let averageSpeed: Double?   // m/s
    let maxSpeed: Double?       // m/s
    let averageCadence: Double?
    let averageHeartrate: Double?
    let maxHeartrate: Double?
    let averageWatts: Double?
    
    enum CodingKeys: String, CodingKey {
        case id, name, distance, type
        case movingTime = "moving_time"
        case elapsedTime = "elapsed_time"
        case totalElevationGain = "total_elevation_gain"
        case startDate = "start_date"
        case averageSpeed = "average_speed"
        case maxSpeed = "max_speed"
        case averageCadence = "average_cadence"
        case averageHeartrate = "average_heartrate"
        case maxHeartrate = "max_heartrate"
        case averageWatts = "average_watts"
    }
}

/// Strava activity streams (detailed data)
struct StravaStreams: Codable {
    let time: [Int]?
    let latlng: [[Double]]?
    let distance: [Double]?
    let altitude: [Double]?
    let velocitySmooth: [Double]?
    let heartrate: [Int]?
    let cadence: [Int]?
    let watts: [Int]?
    let temp: [Int]?
    let moving: [Bool]?
    let gradeSmooth: [Double]?
    
    enum CodingKeys: String, CodingKey {
        case time, latlng, distance, altitude, heartrate, cadence, watts, temp, moving
        case velocitySmooth = "velocity_smooth"
        case gradeSmooth = "grade_smooth"
    }
}

/// OAuth tokens
struct StravaTokens: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Int
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
    }
    
    var isExpired: Bool {
        Date().timeIntervalSince1970 > Double(expiresAt)
    }
}
