import Foundation
import CoreData

/// Ride session for persistence
struct RideSession: Codable, Identifiable {
    let id: UUID
    var backendSessionId: Int?
    var backendRouteId: Int?
    let startTime: Date
    let endTime: Date?
    let duration: TimeInterval
    let distance: Double
    let averagePower: Double
    let normalizedPower: Double
    let averageSpeed: Double
    let averageCadence: Double
    let averageHeartRate: Int?
    let totalElevationGain: Double
    let routeID: UUID?
    let dataPoints: [RideDataPoint]
    
    init(id: UUID = UUID(), backendSessionId: Int? = nil, backendRouteId: Int? = nil, startTime: Date, endTime: Date? = nil, duration: TimeInterval,
         distance: Double, averagePower: Double, normalizedPower: Double, averageSpeed: Double,
         averageCadence: Double, averageHeartRate: Int? = nil, totalElevationGain: Double,
         routeID: UUID? = nil, dataPoints: [RideDataPoint] = []) {
        self.id = id
        self.backendSessionId = backendSessionId
        self.backendRouteId = backendRouteId
        self.startTime = startTime
        self.endTime = endTime
        self.duration = duration
        self.distance = distance
        self.averagePower = averagePower
        self.normalizedPower = normalizedPower
        self.averageSpeed = averageSpeed
        self.averageCadence = averageCadence
        self.averageHeartRate = averageHeartRate
        self.totalElevationGain = totalElevationGain
        self.routeID = routeID
        self.dataPoints = dataPoints
    }

    var isUploadedToBackend: Bool {
        backendSessionId != nil
    }
}

/// Individual data point during a ride
struct RideDataPoint: Codable {
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
