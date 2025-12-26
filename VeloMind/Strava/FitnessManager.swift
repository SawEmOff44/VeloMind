import Foundation
import os.log

/// Training load and fitness metrics
struct FitnessMetrics: Codable {
    let acuteTrainingLoad: Double      // ATL (7-day weighted average)
    let chronicTrainingLoad: Double    // CTL (42-day weighted average)
    let trainingStressBalance: Double  // TSB = CTL - ATL
    let fitness: Double                // Approximation based on CTL
    let fatigue: Double                // Approximation based on ATL
    let form: Double                   // TSB interpretation
    let calculatedAt: Date
    
    var formStatus: String {
        if trainingStressBalance > 10 {
            return "Fresh"
        } else if trainingStressBalance > 0 {
            return "Optimal"
        } else if trainingStressBalance > -10 {
            return "Productive"
        } else if trainingStressBalance > -20 {
            return "Fatigued"
        } else {
            return "High Fatigue"
        }
    }
}

/// Daily training stress score
struct TrainingStress: Codable {
    let date: Date
    let tss: Double  // Training Stress Score
    let duration: TimeInterval
    let normalizedPower: Double?
    let intensityFactor: Double?
}

/// Manages fitness modeling and predictions
@MainActor
class FitnessManager: ObservableObject {
    @Published var currentMetrics: FitnessMetrics?
    @Published var trainingHistory: [TrainingStress] = []
    @Published var ftpEstimate: Double = 250.0  // Functional Threshold Power estimate
    
    private let logger = Logger(subsystem: "com.velomind.app", category: "Fitness")
    
    // Exponential moving average time constants
    private let atlTimeConstant = 7.0   // days
    private let ctlTimeConstant = 42.0  // days
    
    // MARK: - Calculate Training Stress Score
    
    func calculateTSS(normalizedPower: Double, duration: TimeInterval, ftp: Double) -> Double {
        // TSS = (duration_seconds * NP * IF) / (FTP * 3600) * 100
        // where IF (Intensity Factor) = NP / FTP
        
        let intensityFactor = normalizedPower / ftp
        let tss = (duration * normalizedPower * intensityFactor) / (ftp * 3600.0) * 100.0
        
        return tss
    }
    
    func addTrainingSession(normalizedPower: Double, duration: TimeInterval, date: Date = Date()) {
        let intensityFactor = normalizedPower / ftpEstimate
        let tss = calculateTSS(normalizedPower: normalizedPower, duration: duration, ftp: ftpEstimate)
        
        let stress = TrainingStress(
            date: date,
            tss: tss,
            duration: duration,
            normalizedPower: normalizedPower,
            intensityFactor: intensityFactor
        )
        
        trainingHistory.append(stress)
        trainingHistory.sort { $0.date < $1.date }
        
        // Recalculate metrics
        updateFitnessMetrics()
        
        logger.info("Added training session: TSS \(Int(tss)), IF \(String(format: "%.2f", intensityFactor))")
    }
    
    // MARK: - Fitness Calculations
    
    func updateFitnessMetrics() {
        guard !trainingHistory.isEmpty else {
            currentMetrics = nil
            return
        }
        
        let atl = calculateATL()
        let ctl = calculateCTL()
        let tsb = ctl - atl
        
        let metrics = FitnessMetrics(
            acuteTrainingLoad: atl,
            chronicTrainingLoad: ctl,
            trainingStressBalance: tsb,
            fitness: ctl,
            fatigue: atl,
            form: tsb,
            calculatedAt: Date()
        )
        
        currentMetrics = metrics
        
        logger.info("Fitness: ATL=\(Int(atl)), CTL=\(Int(ctl)), TSB=\(Int(tsb)), Form=\(metrics.formStatus)")
    }
    
    private func calculateATL() -> Double {
        // Acute Training Load (7-day exponential weighted average)
        return calculateExponentialAverage(timeConstant: atlTimeConstant)
    }
    
    private func calculateCTL() -> Double {
        // Chronic Training Load (42-day exponential weighted average)
        return calculateExponentialAverage(timeConstant: ctlTimeConstant)
    }
    
    private func calculateExponentialAverage(timeConstant: Double) -> Double {
        guard !trainingHistory.isEmpty else { return 0.0 }
        
        var ema = 0.0
        let alpha = 2.0 / (timeConstant + 1.0)
        
        // Sort by date
        let sorted = trainingHistory.sorted { $0.date < $1.date }
        
        for stress in sorted {
            ema = alpha * stress.tss + (1 - alpha) * ema
        }
        
        return ema
    }
    
    // MARK: - FTP Estimation
    
    func estimateFTP(from activities: [StravaActivity]) {
        // Simple FTP estimation from best 20-minute power
        // FTP ≈ 95% of 20-minute power
        
        var best20MinPower = 0.0
        
        for activity in activities {
            if let avgWatts = activity.averageWatts,
               activity.movingTime >= 1200 {  // At least 20 minutes
                let duration = Double(activity.movingTime)
                
                // Adjust for duration (longer rides have lower relative intensity)
                let adjusted = avgWatts * pow(duration / 1200.0, -0.05)
                
                if adjusted > best20MinPower {
                    best20MinPower = adjusted
                }
            }
        }
        
        if best20MinPower > 0 {
            self.ftpEstimate = best20MinPower * 0.95
            logger.info("Estimated FTP: \(Int(self.ftpEstimate))W")
        }
    }
    
    // MARK: - Pacing Recommendations
    
    func recommendPower(for duration: TimeInterval, currentFatigue: Double = 0) -> Double {
        // Recommend sustainable power based on FTP, duration, and fatigue
        
        let fatigueMultiplier = max(0.7, 1.0 - (currentFatigue * 0.01))
        
        // Duration-based multiplier (shorter = higher %)
        let durationMultiplier: Double
        if duration < 300 {  // < 5 minutes
            durationMultiplier = 1.2
        } else if duration < 1200 {  // 5-20 minutes
            durationMultiplier = 1.05
        } else if duration < 3600 {  // 20-60 minutes
            durationMultiplier = 0.95
        } else if duration < 7200 {  // 1-2 hours
            durationMultiplier = 0.85
        } else {  // > 2 hours
            durationMultiplier = 0.75
        }
        
        return ftpEstimate * durationMultiplier * fatigueMultiplier
    }
    
    // MARK: - Strava Integration
    
    func importFromStrava(_ activities: [StravaActivity]) {
        logger.info("Importing \(activities.count) Strava activities")
        
        for activity in activities {
            guard activity.type == "Ride" else { continue }
            
            if let avgWatts = activity.averageWatts {
                // Use actual power data
                addTrainingSession(
                    normalizedPower: avgWatts * 1.05,  // Approximate NP from avg
                    duration: Double(activity.movingTime),
                    date: activity.startDate
                )
            } else {
                // Estimate power from speed and other data
                let estimatedPower = estimatePowerFromActivity(activity)
                addTrainingSession(
                    normalizedPower: estimatedPower,
                    duration: Double(activity.movingTime),
                    date: activity.startDate
                )
            }
        }
        
        // Estimate FTP
        estimateFTP(from: activities)
    }
    
    private func estimatePowerFromActivity(_ activity: StravaActivity) -> Double {
        // Rough power estimation from speed and elevation
        guard let avgSpeed = activity.averageSpeed else {
            return ftpEstimate * 0.6  // Conservative estimate
        }
        
        // Very rough calculation
        let baseWatts = pow(avgSpeed * 3.6, 2) * 2.5  // Empirical formula
        
        // Adjust for elevation
        let elevationFactor = 1 + (activity.totalElevationGain / activity.distance) * 10
        
        return baseWatts * elevationFactor
    }
}
