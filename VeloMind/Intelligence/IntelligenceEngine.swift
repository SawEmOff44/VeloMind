import Foundation
import SwiftUI

/// Central intelligence engine for real-time ride guidance
@MainActor
class IntelligenceEngine: ObservableObject {
    // Published alerts and predictions
    @Published var environmentalLoadIndex: Double = 0.0  // % added effort
    @Published var overcookingAlert: OvercookingAlert?
    @Published var fatigueAlert: FatigueAlert?
    @Published var effortBudgetRemaining: Double = 100.0 // % remaining
    @Published var nutritionAlert: NutritionAlert?
    @Published var pacingRecommendation: PacingRecommendation?
    @Published var upcomingClimb: ClimbPreview?
    @Published var predictedSpeedValue: PredictedSpeed?
    
    // State tracking
    private var rideStartTime: Date?
    private var totalTSS: Double = 0.0
    private var caloriesBurned: Double = 0.0
    private var lastCalorieIntake: Date?
    private var powerHistory: [PowerDataPoint] = []
    private var speedHistory: [SpeedDataPoint] = []
    
    // Reference to rider parameters
    private(set) var riderParameters: RiderParameters
    weak var learningEngine: LearningEngine?
    
    init(riderParameters: RiderParameters) {
        self.riderParameters = riderParameters
    }
    
    // MARK: - Main Update Loop
    
    func update(
        currentPower: Double,
        currentSpeed: Double,
        currentCadence: Double,
        heartRate: Double?,
        grade: Double?,
        windSpeed: Double?,
        temperature: Double?,
        humidity: Double?,
        rideDuration: TimeInterval,
        rideDistance: Double,
        routeAhead: Route?
    ) {
        // Calculate environmental load
        calculateEnvironmentalLoad(
            temperature: temperature,
            humidity: humidity,
            windSpeed: windSpeed
        )
        
        // Check for overcooking
        checkOvercooking(
            currentPower: currentPower,
            rideDuration: rideDuration
        )
        
        // Track fatigue drift
        trackFatigueDrift(
            currentPower: currentPower,
            currentSpeed: currentSpeed,
            heartRate: heartRate
        )
        
        // Update effort budget
        updateEffortBudget(
            currentPower: currentPower,
            rideDuration: rideDuration
        )
        
        // Predict wind-aware speed
        predictWindAwareSpeed(
            currentPower: currentPower,
            grade: grade ?? 0,
            windSpeed: windSpeed ?? 0
        )
        
        // Check nutrition timing
        checkNutritionTiming(
            rideDuration: rideDuration,
            currentPower: currentPower
        )
        
        // Generate pacing recommendation
        generatePacingRecommendation(
            currentPower: currentPower,
            routeAhead: routeAhead,
            effortBudget: effortBudgetRemaining
        )
        
        // Preview upcoming climbs
        previewUpcomingClimbs(routeAhead: routeAhead)
        
        // Record data points
        recordDataPoint(power: currentPower, speed: currentSpeed, timestamp: Date())
    }
    
    // MARK: - Environmental Load Index
    
    private func calculateEnvironmentalLoad(temperature: Double?, humidity: Double?, windSpeed: Double?) {
        var loadFactor = 0.0
        
        // Use learned heat coefficient if available
        let heatCoefficient = learningEngine?.getEffectiveHeatCoefficient() ?? 0.2
        
        // Temperature impact (>75°F / 24°C starts adding load)
        if let temp = temperature {
            let tempF = temp * 9/5 + 32
            if tempF > 75 {
                loadFactor += (tempF - 75) * heatCoefficient
            }
        }
        
        // Humidity impact (>60% starts adding load)
        if let humid = humidity {
            if humid > 60 {
                loadFactor += (humid - 60) * 0.15  // 0.15% per percentage point above 60
            }
        }
        
        // Wind impact (absolute value, any wind adds resistance)
        if let wind = windSpeed {
            let windMph = abs(wind) * 2.23694
            loadFactor += windMph * 0.3  // 0.3% per mph of wind
        }
        
        environmentalLoadIndex = min(loadFactor, 50.0)  // Cap at 50%
    }
    
    // MARK: - Overcooking Alert
    
    private func checkOvercooking(currentPower: Double, rideDuration: TimeInterval) {
        guard let ftp = riderParameters.ftp, ftp > 0 else { return }
        
        let intensityFactor = currentPower / ftp
        let minutes = rideDuration / 60.0
        
        // Alert if sustained power > 95% FTP for > 10 minutes
        // Or > 105% FTP for > 5 minutes
        // Or > 120% FTP for > 2 minutes
        
        var severity: AlertSeverity = .none
        var message = ""
        
        if intensityFactor > 1.20 && minutes > 2 {
            severity = .critical
            message = "Extreme effort may compromise your race. Consider easing 10-15W."
        } else if intensityFactor > 1.05 && minutes > 5 {
            severity = .high
            message = "Sustaining this effort may cost you later."
        } else if intensityFactor > 0.95 && minutes > 10 {
            severity = .medium
            message = "High sustained effort detected. Monitor your energy."
        }
        
        if severity != .none {
            overcookingAlert = OvercookingAlert(
                severity: severity,
                message: message,
                currentIntensity: intensityFactor,
                duration: minutes
            )
        } else {
            overcookingAlert = nil
        }
    }
    
    // MARK: - Fatigue Drift Detection
    
    private func trackFatigueDrift(currentPower: Double, currentSpeed: Double, heartRate: Double?) {
        guard powerHistory.count > 30 else { return }  // Need 30s of data
        
        // Compare recent 30s to previous 30s
        let recentPower = powerHistory.suffix(30).map { $0.power }.reduce(0, +) / 30.0
        let recentSpeed = speedHistory.suffix(30).map { $0.speed }.reduce(0, +) / 30.0
        
        let olderPower = powerHistory.dropLast(30).suffix(30).map { $0.power }.reduce(0, +) / 30.0
        let olderSpeed = speedHistory.dropLast(30).suffix(30).map { $0.speed }.reduce(0, +) / 30.0
        
        // Calculate efficiency ratio (speed per watt)
        let recentEfficiency = recentSpeed / recentPower
        let olderEfficiency = olderSpeed / olderPower
        
        let efficiencyDrop = (olderEfficiency - recentEfficiency) / olderEfficiency
        
        if efficiencyDrop > 0.10 {  // 10% drop in efficiency
            fatigueAlert = FatigueAlert(
                message: "Fatigue accumulating — efficiency dropping \(Int(efficiencyDrop * 100))%",
                efficiencyDrop: efficiencyDrop
            )
        } else {
            fatigueAlert = nil
        }
    }
    
    // MARK: - Effort Budget
    
    private func updateEffortBudget(currentPower: Double, rideDuration: TimeInterval) {
        guard let ftp = riderParameters.ftp, ftp > 0 else { return }
        
        // Calculate TSS (Training Stress Score)
        // TSS = (duration * NP * IF) / (FTP * 3600) * 100
        // Simplified: IF = currentPower / FTP
        
        let intensityFactor = currentPower / ftp
        let normalizedPower = currentPower  // Simplified for real-time
        
        // Incremental TSS for this update
        let hours = rideDuration / 3600.0
        totalTSS = hours * pow(intensityFactor, 2) * 100
        
        // Apply learned fatigue rate if available
        if let fatigueRate = learningEngine?.getEffectiveFatigueRate() {
            // Adjust budget based on learned fatigue curve
            let fatigueMultiplier = exp(-fatigueRate * intensityFactor * hours)
            effortBudgetRemaining = max(0, 100 * fatigueMultiplier)
        } else {
            // Budget: assume 200 TSS is "full" ride capacity
            effortBudgetRemaining = max(0, 100 - (totalTSS / 200.0 * 100))
        }
    }
    
    // MARK: - Wind-Aware Speed Prediction
    
    private func predictWindAwareSpeed(currentPower: Double, grade: Double, windSpeed: Double) {
        // Use power model to predict speed given current conditions
        // This is the inverse of power calculation
        
        guard currentPower > 0 else { return }
        
        let rho = 1.225  // Air density kg/m³
        let g = 9.81     // Gravity m/s²
        let mass = riderParameters.mass
        let cda = riderParameters.cda
        let crr = riderParameters.crr
        
        // Simplified power equation: P = aero + gravity + rolling
        // Solve for velocity (iterative or approximation)
        
        let gravityPower = mass * g * grade * 5.0  // Assume 5 m/s base speed
        let rollingPower = mass * g * crr * 5.0
        let availablePowerForSpeed = currentPower - gravityPower - rollingPower
        
        // v³ ≈ availablePower / (0.5 * rho * cda)
        let estimatedSpeed = pow(abs(availablePowerForSpeed) / (0.5 * rho * cda), 1.0/3.0)
        
        // Adjust for wind
        let windEffect = windSpeed * 0.3  // Simplified wind impact
        let predictedSpeed = max(0, estimatedSpeed - abs(windEffect))
        
        let speedMph = estimatedSpeed * 2.23694
        let windDescription = windSpeed > 0 ? "headwind" : (windSpeed < 0 ? "tailwind" : "calm")
        
        predictedSpeedValue = PredictedSpeed(
            speed: speedMph,
            windCondition: windDescription
        )
    }
    
    // MARK: - Nutrition Timing
    
    private func checkNutritionTiming(rideDuration: TimeInterval, currentPower: Double) {
        // Estimate calories burned
        // Very rough: 1 watt-hour ≈ 3.6 kJ ≈ 0.86 kcal
        let caloriesPerHour = currentPower * 3.6
        caloriesBurned = (rideDuration / 3600.0) * caloriesPerHour
        
        // Glycogen stores ~2000 kcal
        // Recommend carbs every 45-60 min or every 400 kcal
        
        let minutesSinceIntake: Double
        if let lastIntake = lastCalorieIntake {
            minutesSinceIntake = Date().timeIntervalSince(lastIntake) / 60.0
        } else {
            minutesSinceIntake = rideDuration / 60.0
        }
        
        if minutesSinceIntake > 45 || caloriesBurned > 400 {
            let minutesUntilRecommended = max(0, 45 - minutesSinceIntake)
            nutritionAlert = NutritionAlert(
                message: "Carb intake recommended in ~\(Int(minutesUntilRecommended)) minutes",
                caloriesBurned: caloriesBurned
            )
        } else {
            nutritionAlert = nil
        }
    }
    
    // MARK: - Pacing Recommendation
    
    private func generatePacingRecommendation(currentPower: Double, routeAhead: Route?, effortBudget: Double) {
        guard let route = routeAhead else { return }
        guard let ftp = riderParameters.ftp, ftp > 0 else { return }
        
        // Look ahead 2-5 minutes
        // If climb approaching and effort budget low, recommend easing
        
        let intensityFactor = currentPower / ftp
        
        if effortBudget < 30 && intensityFactor > 0.85 {
            pacingRecommendation = PacingRecommendation(
                message: "Ease 5–10W for the next 3 min to protect effort budget",
                recommendedPowerChange: -8
            )
        } else {
            pacingRecommendation = nil
        }
    }
    
    // MARK: - Climb Preview
    
    private func previewUpcomingClimbs(routeAhead: Route?) {
        guard let route = routeAhead else { 
            upcomingClimb = nil
            return 
        }
        guard let ftp = riderParameters.ftp, ftp > 0 else {
            upcomingClimb = nil
            return
        }
        
        // This would be called with route manager's climb analysis
        // For now, placeholder - real implementation would use RouteManager.analyzeUpcomingTerrain()
        
        upcomingClimb = nil  // Updated when integrated with RouteManager
    }
    
    // MARK: - Data Recording
    
    private func recordDataPoint(power: Double, speed: Double, timestamp: Date) {
        powerHistory.append(PowerDataPoint(power: power, timestamp: timestamp))
        speedHistory.append(SpeedDataPoint(speed: speed, timestamp: timestamp))
        
        // Keep last 5 minutes of data
        let cutoff = timestamp.addingTimeInterval(-300)
        powerHistory.removeAll { $0.timestamp < cutoff }
        speedHistory.removeAll { $0.timestamp < cutoff }
    }
    
    // MARK: - Public Methods
    
    func recordCalorieIntake() {
        lastCalorieIntake = Date()
        nutritionAlert = nil
    }
    
    func startRide() {
        rideStartTime = Date()
        totalTSS = 0
        caloriesBurned = 0
        lastCalorieIntake = nil
        powerHistory = []
        speedHistory = []
        effortBudgetRemaining = 100
    }
    
    func updateRiderParameters(_ parameters: RiderParameters) {
        self.riderParameters = parameters
    }
}

// MARK: - Supporting Structures

enum AlertSeverity {
    case none, medium, high, critical
    
    var color: Color {
        switch self {
        case .none: return .clear
        case .medium: return .yellow
        case .high: return .orange
        case .critical: return .red
        }
    }
}

struct OvercookingAlert {
    let severity: AlertSeverity
    let message: String
    let currentIntensity: Double
    let duration: Double
}

struct FatigueAlert {
    let message: String
    let efficiencyDrop: Double
}

struct PredictedSpeed {
    let speed: Double
    let windCondition: String
}

struct NutritionAlert {
    let message: String
    let caloriesBurned: Double
}

struct PacingRecommendation {
    let message: String
    let recommendedPowerChange: Int
}

struct ClimbPreview {
    let distance: Double  // miles
    let grade: Double     // %
    let recommendedPower: ClosedRange<Double>
}

struct PowerDataPoint {
    let power: Double
    let timestamp: Date
}

struct SpeedDataPoint {
    let speed: Double
    let timestamp: Date
}
