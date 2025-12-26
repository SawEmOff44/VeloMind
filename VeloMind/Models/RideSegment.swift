import Foundation

/// Represents a segment of ride data used for machine learning
struct RideSegment: Codable, Identifiable {
    let id: UUID
    let timestamp: Date
    let duration: TimeInterval
    let avgPower: Double
    let avgSpeed: Double
    let avgGrade: Double
    let windSpeed: Double
    let temperature: Double
    let humidity: Double
    let heartRate: Double?
    let normalizedPower: Double?
    let intensityFactor: Double?
    
    init(
        id: UUID = UUID(),
        timestamp: Date,
        duration: TimeInterval,
        avgPower: Double,
        avgSpeed: Double,
        avgGrade: Double,
        windSpeed: Double,
        temperature: Double,
        humidity: Double,
        heartRate: Double?,
        normalizedPower: Double?,
        intensityFactor: Double?
    ) {
        self.id = id
        self.timestamp = timestamp
        self.duration = duration
        self.avgPower = avgPower
        self.avgSpeed = avgSpeed
        self.avgGrade = avgGrade
        self.windSpeed = windSpeed
        self.temperature = temperature
        self.humidity = humidity
        self.heartRate = heartRate
        self.normalizedPower = normalizedPower
        self.intensityFactor = intensityFactor
    }
}

/// Represents a complete ride for learning purposes
struct LearningRide: Codable, Identifiable {
    let id: UUID
    let startTime: Date
    let endTime: Date
    let totalDistance: Double
    let avgPower: Double
    let normalizedPower: Double
    let avgSpeed: Double
    let maxPower: Double
    let avgTemperature: Double
    let avgHeartRate: Double?
    let segments: [RideSegment]
    
    var duration: TimeInterval {
        endTime.timeIntervalSince(startTime)
    }
    
    var isLongRide: Bool {
        duration >= 5400  // 90 minutes or more
    }
    
    var hasFlatSegments: Bool {
        segments.contains { abs($0.avgGrade) < 0.01 }
    }
    
    init(
        id: UUID = UUID(),
        startTime: Date,
        endTime: Date,
        totalDistance: Double,
        avgPower: Double,
        normalizedPower: Double,
        avgSpeed: Double,
        maxPower: Double,
        avgTemperature: Double,
        avgHeartRate: Double?,
        segments: [RideSegment]
    ) {
        self.id = id
        self.startTime = startTime
        self.endTime = endTime
        self.totalDistance = totalDistance
        self.avgPower = avgPower
        self.normalizedPower = normalizedPower
        self.avgSpeed = avgSpeed
        self.maxPower = maxPower
        self.avgTemperature = avgTemperature
        self.avgHeartRate = avgHeartRate
        self.segments = segments
    }
}
