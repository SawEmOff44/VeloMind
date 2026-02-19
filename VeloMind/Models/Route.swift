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

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        routeId = try? container.decodeIfPresent(Int.self, forKey: .routeId)

        // Postgres NUMERIC may arrive as string; accept either.
        latitude = container.decodeLossyDoubleIfPresent(forKey: .latitude) ?? 0
        longitude = container.decodeLossyDoubleIfPresent(forKey: .longitude) ?? 0

        type = (try? container.decode(WaypointType.self, forKey: .type)) ?? .alert
        label = try? container.decodeIfPresent(String.self, forKey: .label)
        notes = try? container.decodeIfPresent(String.self, forKey: .notes)
        distanceFromStart = container.decodeLossyDoubleIfPresent(forKey: .distanceFromStart)
        alertDistance = container.decodeLossyIntIfPresent(forKey: .alertDistance) ?? 0
    }

    init(
        id: Int,
        routeId: Int? = nil,
        latitude: Double,
        longitude: Double,
        type: WaypointType,
        label: String? = nil,
        notes: String? = nil,
        distanceFromStart: Double? = nil,
        alertDistance: Int
    ) {
        self.id = id
        self.routeId = routeId
        self.latitude = latitude
        self.longitude = longitude
        self.type = type
        self.label = label
        self.notes = notes
        self.distanceFromStart = distanceFromStart
        self.alertDistance = alertDistance
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

    enum CodingKeys: String, CodingKey {
        case latitude
        case longitude
        case elevation
        case distance
        // Back-compat keys from older payloads
        case lat
        case lon
        case ele
        case alt
        case altitude
        case dist
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        latitude =
            container.decodeLossyDoubleIfPresent(forKey: .latitude) ??
            container.decodeLossyDoubleIfPresent(forKey: .lat) ??
            0
        longitude =
            container.decodeLossyDoubleIfPresent(forKey: .longitude) ??
            container.decodeLossyDoubleIfPresent(forKey: .lon) ??
            0
        elevation =
            container.decodeLossyDoubleIfPresent(forKey: .elevation) ??
            container.decodeLossyDoubleIfPresent(forKey: .ele) ??
            container.decodeLossyDoubleIfPresent(forKey: .alt) ??
            container.decodeLossyDoubleIfPresent(forKey: .altitude)
        distance =
            container.decodeLossyDoubleIfPresent(forKey: .distance) ??
            container.decodeLossyDoubleIfPresent(forKey: .dist) ??
            0
    }

    init(latitude: Double, longitude: Double, elevation: Double?, distance: Double) {
        self.latitude = latitude
        self.longitude = longitude
        self.elevation = elevation
        self.distance = distance
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(latitude, forKey: .latitude)
        try container.encode(longitude, forKey: .longitude)
        try container.encodeIfPresent(elevation, forKey: .elevation)
        try container.encode(distance, forKey: .distance)
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
        // Back-compat keys
        case totalDistanceAlt = "totalDistance"
        case totalElevationGainAlt = "totalElevationGain"
        case elevationGain = "elevation_gain"
        case createdAt = "created_at"
        case createdAtAlt = "createdAt"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        id = (try? container.decode(Int.self, forKey: .id)) ?? 0
        name = (try? container.decode(String.self, forKey: .name)) ?? "Route"
        points = (try? container.decode([RoutePoint].self, forKey: .points)) ?? []

        totalDistance =
            container.decodeLossyDoubleIfPresent(forKey: .totalDistance) ??
            container.decodeLossyDoubleIfPresent(forKey: .totalDistanceAlt) ??
            0
        totalElevationGain =
            container.decodeLossyDoubleIfPresent(forKey: .totalElevationGain) ??
            container.decodeLossyDoubleIfPresent(forKey: .totalElevationGainAlt) ??
            container.decodeLossyDoubleIfPresent(forKey: .elevationGain) ??
            0

        waypoints = (try? container.decode([RouteWaypoint].self, forKey: .waypoints)) ?? []
        createdAt =
            (try? container.decodeIfPresent(Date.self, forKey: .createdAt)) ??
            (try? container.decodeIfPresent(Date.self, forKey: .createdAtAlt))
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encode(points, forKey: .points)
        try container.encode(totalDistance, forKey: .totalDistance)
        try container.encode(totalElevationGain, forKey: .totalElevationGain)
        try container.encode(waypoints, forKey: .waypoints)
        try container.encodeIfPresent(createdAt, forKey: .createdAt)
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
