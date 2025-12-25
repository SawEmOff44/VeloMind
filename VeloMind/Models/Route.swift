import Foundation
import CoreLocation

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
    let id: UUID
    let name: String
    let points: [RoutePoint]
    let totalDistance: Double   // meters
    let totalElevationGain: Double  // meters
    let createdAt: Date
    
    init(id: UUID = UUID(), name: String, points: [RoutePoint], totalDistance: Double, totalElevationGain: Double, createdAt: Date = Date()) {
        self.id = id
        self.name = name
        self.points = points
        self.totalDistance = totalDistance
        self.totalElevationGain = totalElevationGain
        self.createdAt = createdAt
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
