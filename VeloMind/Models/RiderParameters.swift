import Foundation

/// Rider parameters for power calculation
struct RiderParameters: Codable {
    var mass: Double            // kg (rider + bike)
    var cda: Double            // Coefficient of drag × frontal area (m²)
    var crr: Double            // Coefficient of rolling resistance
    var drivetrainLoss: Double // Percentage (0.03 = 3%)
    
    // Defaults for typical road cyclist
    static let `default` = RiderParameters(
        mass: 85.0,           // 75kg rider + 10kg bike
        cda: 0.32,            // Hoods position, typical road bike
        crr: 0.0045,          // Road tires on asphalt
        drivetrainLoss: 0.03  // 3% drivetrain loss
    )
    
    // Position presets
    static let hoods = RiderParameters(
        mass: 85.0,
        cda: 0.32,
        crr: 0.0045,
        drivetrainLoss: 0.03
    )
    
    static let drops = RiderParameters(
        mass: 85.0,
        cda: 0.26,            // More aerodynamic
        crr: 0.0045,
        drivetrainLoss: 0.03
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
