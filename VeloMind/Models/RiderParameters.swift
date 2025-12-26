import Foundation

/// Rider parameters for power calculation
struct RiderParameters: Codable {
    var mass: Double            // kg (rider + bike)
    var cda: Double            // Coefficient of drag × frontal area (m²)
    var crr: Double            // Coefficient of rolling resistance
    var drivetrainLoss: Double // Percentage (0.03 = 3%)
    
    // Fitness profile
    var ftp: Double?           // Functional Threshold Power (watts)
    var ftpLastUpdated: Date?
    var estimatedFTP: Double?  // Auto-estimated from recent rides
    var maxHeartRate: Int?     // bpm
    var restingHeartRate: Int? // bpm
    var vo2max: Double?        // ml/kg/min
    
    // Historical performance
    var recentRides: [RidePerformance] = []
    var fatigueCoefficient: Double = 1.0  // Learned over time
    var heatTolerance: Double = 1.0       // 1.0 = average, >1.0 = better
    var windTolerance: Double = 1.0       // Learned resistance to headwinds
    
    // Defaults for typical road cyclist
    static let `default` = RiderParameters(
        mass: 85.0,           // 75kg rider + 10kg bike
        cda: 0.32,            // Hoods position, typical road bike
        crr: 0.0045,          // Road tires on asphalt
        drivetrainLoss: 0.03, // 3% drivetrain loss
        ftp: nil,
        ftpLastUpdated: nil,
        estimatedFTP: nil,
        maxHeartRate: nil,
        restingHeartRate: nil,
        vo2max: nil,
        recentRides: [],
        fatigueCoefficient: 1.0,
        heatTolerance: 1.0,
        windTolerance: 1.0
    )
    
    // Position presets
    static let hoods = RiderParameters(
        mass: 85.0,
        cda: 0.32,
        crr: 0.0045,
        drivetrainLoss: 0.03,
        ftp: nil,
        ftpLastUpdated: nil,
        estimatedFTP: nil,
        maxHeartRate: nil,
        restingHeartRate: nil,
        vo2max: nil,
        recentRides: [],
        fatigueCoefficient: 1.0,
        heatTolerance: 1.0,
        windTolerance: 1.0
    )
    
    static let drops = RiderParameters(
        mass: 85.0,
        cda: 0.26,            // More aerodynamic
        crr: 0.0045,
        drivetrainLoss: 0.03,
        ftp: nil,
        ftpLastUpdated: nil,
        estimatedFTP: nil,
        maxHeartRate: nil,
        restingHeartRate: nil,
        vo2max: nil,
        recentRides: [],
        fatigueCoefficient: 1.0,
        heatTolerance: 1.0,
        windTolerance: 1.0
    )
}

/// Power calculation result
struct PowerResult {
    let totalPower: Double       // Watts
    let aeroPower: Double        // Watts
    let gravityPower: Double     // Watts
    let rollingPower: Double     // Watts
    let timestamp: Date
    let confidence: Double       // 0-1 (data quality indicator)
}

/// Historical ride performance for learning
struct RidePerformance: Codable, Identifiable {
    let id: UUID
    let date: Date
    let avgPower: Double
    let normalizedPower: Double
    let duration: TimeInterval
    let tss: Double             // Training Stress Score
    let avgSpeed: Double
    let temperature: Double?
    let windSpeed: Double?
    let elevationGain: Double
    
    init(id: UUID = UUID(), date: Date, avgPower: Double, normalizedPower: Double, duration: TimeInterval, tss: Double, avgSpeed: Double, temperature: Double?, windSpeed: Double?, elevationGain: Double) {
        self.id = id
        self.date = date
        self.avgPower = avgPower
        self.normalizedPower = normalizedPower
        self.duration = duration
        self.tss = tss
        self.avgSpeed = avgSpeed
        self.temperature = temperature
        self.windSpeed = windSpeed
        self.elevationGain = elevationGain
    }
}
