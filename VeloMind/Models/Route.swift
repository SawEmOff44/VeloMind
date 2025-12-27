import Foundation
import CoreLocation

/// Waypoint type enumeration
enum WaypointType: String, Codable {
    case alert
    case danger
    case water
    case food
    case rest
    case photo
    case turn
    case steep
    
    var icon: String {
        switch self {
        case .alert: return "⚠️"
        case .danger: return "🚨"
        case .water: return "💧"
        case .food: return "🍎"
        case .rest: return "🛑"
        case .photo: return "📷"
        case .turn: return "↪️"
        case .steep: return "⛰️"
        }
    }
}

/// Waypoint on a route
struct RouteWaypoint: Codable, Identifiable {
    let id: Int
    let routeId: Int?
    let latitude: Double
    let longitude: Double
    let type: WaypointType
    let label: String?
    let notes: String?
    let distanceFromStart: Double?
    let alertDistance: Int  // in feet
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case routeId = "route_id"
        case latitude
        case longitude
        case type
        case label
        case notes
        case distanceFromStart = "distance_from_start"
        case alertDistance = "alert_distance"
    }
}

/// Represents a point on a route
struct RoutePoint: Codable {
    let latitude: Double
    let longitude: Double
    let elevation: Double?
    let distance: Double        // Cumulative distance in meters
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}

/// Represents a complete route
struct Route: Codable, Identifiable {
    let id: Int
    let name: String
    let points: [RoutePoint]
    let totalDistance: Double   // meters
    let totalElevationGain: Double  // meters
    let waypoints: [RouteWaypoint]
    let createdAt: Date?
    
    init(id: Int, name: String, points: [RoutePoint], totalDistance: Double, totalElevationGain: Double, waypoints: [RouteWaypoint] = [], createdAt: Date? = nil) {
        self.id = id
        self.name = name
        self.points = points
        self.totalDistance = totalDistance
        self.totalElevationGain = totalElevationGain
        self.waypoints = waypoints
        self.createdAt = createdAt
    }
    
    enum CodingKeys: String, CodingKey {
        case id, name, points, waypoints
        case totalDistance = "total_distance"
        case totalElevationGain = "total_elevation_gain"
        case createdAt = "created_at"
    }
}

/// Route matching result
struct RouteMatchResult {
    let nearestPoint: RoutePoint
    let distanceAlongRoute: Double  // meters
    let distanceFromRoute: Double   // meters (perpendicular)
    let grade30m: Double            // Grade over 30m window
    let grade150m: Double           // Grade over 150m window
    let isOnRoute: Bool
}
