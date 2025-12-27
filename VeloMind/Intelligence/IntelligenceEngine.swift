import Foundation
import SwiftUI
import AVFoundation

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
    @Published var routeAheadAnalysis: RouteAheadAnalysis?
    @Published var currentPowerZone: PowerZone = .recovery
    @Published var targetPowerZone: PowerZone?
    @Published var audioAlert: AudioAlert?
    
    // State tracking
    private var rideStartTime: Date?
    private var totalTSS: Double = 0.0
    private var caloriesBurned: Double = 0.0
    private var lastCalorieIntake: Date?
    private var powerHistory: [PowerDataPoint] = []
    private var speedHistory: [SpeedDataPoint] = []
    private var lastAudioAlertTime: Date?
    private var currentRoutePosition: Double = 0.0  // meters along route
    
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
        // Update power zone
        updatePowerZone(currentPower: currentPower)
        
        // Analyze route ahead if available
        if let route = routeAhead {
            analyzeRouteAhead(route: route, currentPosition: rideDistance, currentPower: currentPower)
            calculateTargetPowerZone(routeAhead: routeAheadAnalysis)
        }
        
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
        currentRoutePosition = 0.0
        lastAudioAlertTime = nil
    }
    
    func updateRiderParameters(_ parameters: RiderParameters) {
        self.riderParameters = parameters
    }
    
    func updateRoutePosition(_ distance: Double) {
        currentRoutePosition = distance
    }
    
    // MARK: - Phase 2: Route-Ahead Analysis
    
    /// Analyze the next 2 miles of route and provide recommendations
    func analyzeRouteAhead(route: Route, currentPosition: Double, currentPower: Double) {
        let lookaheadDistance = 3218.69  // 2 miles in meters
        let endPosition = currentPosition + lookaheadDistance
        
        // Get route points in the lookahead window
        let aheadPoints = route.points.filter { point in
            point.distance >= currentPosition && point.distance <= endPosition
        }
        
        guard aheadPoints.count > 1 else {
            routeAheadAnalysis = nil
            return
        }
        
        // Calculate statistics
        let elevationGain = calculateElevationGain(points: aheadPoints)
        let distance = aheadPoints.last!.distance - aheadPoints.first!.distance
        let avgGrade = (elevationGain / distance) * 100
        let maxGrade = calculateMaxGrade(points: aheadPoints)
        
        // Calculate required power range
        let (minPower, maxPower) = calculateRequiredPower(
            distance: distance,
            elevationGain: elevationGain,
            avgGrade: avgGrade
        )
        
        // Estimate time
        let estimatedTime = estimateSegmentTime(
            distance: distance,
            avgGrade: avgGrade,
            targetPower: (minPower + maxPower) / 2
        )
        
        // Determine difficulty
        let difficulty = determineDifficulty(grade: avgGrade, elevationGain: elevationGain)
        
        // Generate recommendation
        let recommendation = generateRouteRecommendation(
            currentPower: currentPower,
            requiredPower: (minPower + maxPower) / 2,
            difficulty: difficulty,
            distance: distance
        )
        
        routeAheadAnalysis = RouteAheadAnalysis(
            distanceAhead: distance,
            elevationGain: elevationGain,
            avgGrade: avgGrade,
            maxGrade: maxGrade,
            requiredPower: minPower...maxPower,
            estimatedTime: estimatedTime,
            difficulty: difficulty,
            recommendation: recommendation
        )
        
        // Trigger audio alert if significant change ahead
        checkForAudioAlert(analysis: routeAheadAnalysis!)
    }
    
    /// Update current power zone
    func updatePowerZone(currentPower: Double) {
        guard let ftp = riderParameters.ftp, ftp > 0 else { return }
        
        let zones: [PowerZone] = [.recovery, .endurance, .tempo, .threshold, .vo2max, .anaerobic]
        for zone in zones {
            if zone.range(ftp: ftp).contains(currentPower) {
                currentPowerZone = zone
                break
            }
        }
    }
    
    /// Calculate required target power zone for route ahead
    func calculateTargetPowerZone(routeAhead: RouteAheadAnalysis?) {
        guard let analysis = routeAhead, let ftp = riderParameters.ftp else {
            targetPowerZone = nil
            return
        }
        
        let targetPower = (analysis.requiredPower.lowerBound + analysis.requiredPower.upperBound) / 2
        
        let zones: [PowerZone] = [.recovery, .endurance, .tempo, .threshold, .vo2max, .anaerobic]
        for zone in zones {
            if zone.range(ftp: ftp).contains(targetPower) {
                targetPowerZone = zone
                break
            }
        }
    }
    
    // MARK: - Helper Methods for Route Analysis
    
    private func calculateElevationGain(points: [RoutePoint]) -> Double {
        var gain = 0.0
        for i in 1..<points.count {
            let diff = (points[i].elevation ?? 0) - (points[i-1].elevation ?? 0)
            if diff > 0 {
                gain += diff
            }
        }
        return gain
    }
    
    private func calculateMaxGrade(points: [RoutePoint]) -> Double {
        var maxGrade = 0.0
        for i in 1..<points.count {
            let elevDiff = (points[i].elevation ?? 0) - (points[i-1].elevation ?? 0)
            let distDiff = points[i].distance - points[i-1].distance
            if distDiff > 0 {
                let grade = (elevDiff / distDiff) * 100
                maxGrade = max(maxGrade, grade)
            }
        }
        return maxGrade
    }
    
    private func calculateRequiredPower(distance: Double, elevationGain: Double, avgGrade: Double) -> (Double, Double) {
        guard let ftp = riderParameters.ftp else { return (150, 200) }
        
        // Base power on grade
        let basePower: Double
        if avgGrade < 2 {
            basePower = ftp * 0.65  // Endurance
        } else if avgGrade < 4 {
            basePower = ftp * 0.80  // Tempo
        } else if avgGrade < 6 {
            basePower = ftp * 0.90  // Threshold
        } else if avgGrade < 8 {
            basePower = ftp * 1.00  // At FTP
        } else {
            basePower = ftp * 1.10  // Above FTP
        }
        
        // Adjust for total elevation
        let elevationFactor = 1.0 + (elevationGain / 1000.0) * 0.05
        
        let minPower = basePower * 0.9 * elevationFactor
        let maxPower = basePower * 1.1 * elevationFactor
        
        return (minPower, maxPower)
    }
    
    private func estimateSegmentTime(distance: Double, avgGrade: Double, targetPower: Double) -> TimeInterval {
        // Simple speed estimation based on power and grade
        let mass = riderParameters.mass
        let cda = riderParameters.cda
        
        // Rough speed calculation (simplified physics)
        var speed: Double
        if avgGrade < 1 {
            speed = 30 * 0.44704  // 30 mph flat
        } else if avgGrade < 3 {
            speed = 20 * 0.44704  // 20 mph slight climb
        } else if avgGrade < 5 {
            speed = 15 * 0.44704  // 15 mph moderate
        } else if avgGrade < 7 {
            speed = 10 * 0.44704  // 10 mph steep
        } else {
            speed = 7 * 0.44704   // 7 mph very steep
        }
        
        // Adjust by power-to-weight
        if let ftp = riderParameters.ftp {
            let powerToWeight = ftp / (mass * 0.453592)  // W/kg
            if powerToWeight > 4.0 {
                speed *= 1.2
            } else if powerToWeight > 3.0 {
                speed *= 1.1
            } else if powerToWeight < 2.0 {
                speed *= 0.9
            }
        }
        
        return distance / speed
    }
    
    private func determineDifficulty(grade: Double, elevationGain: Double) -> RouteAheadAnalysis.DifficultyLevel {
        let difficultyScore = (abs(grade) * 10) + (elevationGain / 10)
        
        if difficultyScore < 30 {
            return .easy
        } else if difficultyScore < 60 {
            return .moderate
        } else if difficultyScore < 90 {
            return .hard
        } else if difficultyScore < 120 {
            return .veryHard
        } else {
            return .extreme
        }
    }
    
    private func generateRouteRecommendation(currentPower: Double, requiredPower: Double, difficulty: RouteAheadAnalysis.DifficultyLevel, distance: Double) -> String {
        let powerDiff = requiredPower - currentPower
        let distanceMiles = distance / 1609.34
        
        if abs(powerDiff) < 10 {
            return "Maintain current effort for next \(String(format: "%.1f", distanceMiles)) miles"
        } else if powerDiff > 30 {
            return "Increase effort by \(Int(powerDiff))W for upcoming \(difficulty.rawValue.lowercased()) section"
        } else if powerDiff > 10 {
            return "Slightly increase effort (+\(Int(powerDiff))W) ahead"
        } else if powerDiff < -30 {
            return "Easy pace ahead - recover \(Int(abs(powerDiff)))W for next \(String(format: "%.1f", distanceMiles)) mi"
        } else {
            return "Slight decrease (-\(Int(abs(powerDiff)))W) ahead"
        }
    }
    
    private func checkForAudioAlert(analysis: RouteAheadAnalysis) {
        // Only trigger audio alerts every 2 minutes minimum
        if let lastAlert = lastAudioAlertTime, Date().timeIntervalSince(lastAlert) < 120 {
            return
        }
        
        var message: String?
        var priority: AudioAlert.AlertPriority = .medium
        
        // Alert for steep climbs
        if analysis.maxGrade > 8 {
            message = "Steep climb ahead: \(String(format: "%.0f", analysis.maxGrade)) percent grade in \(String(format: "%.1f", analysis.distanceAhead / 1609.34)) miles"
            priority = .high
        }
        // Alert for significant power changes
        else if let current = powerHistory.last?.power {
            let targetPower = (analysis.requiredPower.lowerBound + analysis.requiredPower.upperBound) / 2
            let powerDiff = targetPower - current
            
            if abs(powerDiff) > 50 {
                if powerDiff > 0 {
                    message = "Increase effort by \(Int(powerDiff)) watts for upcoming climb"
                } else {
                    message = "Easy pace ahead. Recover for \(String(format: "%.1f", analysis.distanceAhead / 1609.34)) miles"
                }
                priority = .medium
            }
        }
        
        if let msg = message {
            audioAlert = AudioAlert(message: msg, priority: priority, timestamp: Date())
            lastAudioAlertTime = Date()
            
            // Trigger actual audio speech
            speakAlert(message: msg)
        }
    }
    
    private func speakAlert(message: String) {
        let utterance = AVSpeechUtterance(string: message)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.5
        
        let synthesizer = AVSpeechSynthesizer()
        synthesizer.speak(utterance)
        
        // Send to Apple Watch for haptic feedback
        WatchConnectivityManager.shared.sendAudioAlertToWatch(message: message)
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

// MARK: - Phase 2 Intelligence Models

/// Power zone classification
enum PowerZone: String, Hashable {
    case recovery = "Recovery"
    case endurance = "Endurance"
    case tempo = "Tempo"
    case threshold = "Threshold"
    case vo2max = "VO2 Max"
    case anaerobic = "Anaerobic"
    
    var color: Color {
        switch self {
        case .recovery: return .gray
        case .endurance: return .blue
        case .tempo: return .green
        case .threshold: return .yellow
        case .vo2max: return .orange
        case .anaerobic: return .red
        }
    }
    
    var ftpRange: String {
        switch self {
        case .recovery: return "0-55% FTP"
        case .endurance: return "56-75% FTP"
        case .tempo: return "76-90% FTP"
        case .threshold: return "91-105% FTP"
        case .vo2max: return "106-120% FTP"
        case .anaerobic: return "121%+ FTP"
        }
    }
    
    func range(ftp: Double) -> ClosedRange<Double> {
        switch self {
        case .recovery: return 0...(ftp * 0.55)
        case .endurance: return (ftp * 0.56)...(ftp * 0.75)
        case .tempo: return (ftp * 0.76)...(ftp * 0.90)
        case .threshold: return (ftp * 0.91)...(ftp * 1.05)
        case .vo2max: return (ftp * 1.06)...(ftp * 1.20)
        case .anaerobic: return (ftp * 1.21)...9999
        }
    }
}

/// Analysis of route ahead (next 2 miles)
struct RouteAheadAnalysis {
    let distanceAhead: Double  // meters
    let elevationGain: Double  // meters
    let avgGrade: Double       // %
    let maxGrade: Double       // %
    let requiredPower: ClosedRange<Double>  // watts
    let estimatedTime: TimeInterval  // seconds
    let difficulty: DifficultyLevel
    let recommendation: String
    
    enum DifficultyLevel: String {
        case easy = "Easy"
        case moderate = "Moderate"
        case hard = "Hard"
        case veryHard = "Very Hard"
        case extreme = "Extreme"
        
        var color: Color {
            switch self {
            case .easy: return .green
            case .moderate: return .yellow
            case .hard: return .orange
            case .veryHard: return .red
            case .extreme: return .purple
            }
        }
    }
}

/// Audio alert for voice announcements
struct AudioAlert {
    let message: String
    let priority: AlertPriority
    let timestamp: Date
    
    enum AlertPriority {
        case low
        case medium
        case high
        case critical
    }
}


struct SpeedDataPoint {
    let speed: Double
    let timestamp: Date
}
