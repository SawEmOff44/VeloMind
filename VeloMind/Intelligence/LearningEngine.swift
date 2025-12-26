import Foundation
import SwiftUI

/// Machine learning engine that learns rider characteristics over time
@MainActor
class LearningEngine: ObservableObject {
    @Published var learnedParameters: LearnedParameters
    
    private let riderParameters: RiderParameters
    private var currentRideSegments: [RideSegment] = []
    private var rideStartTime: Date?
    private var segmentStartTime: Date?
    private var segmentAccumulator = SegmentAccumulator()
    
    // Constants
    private let rho = 1.225  // Air density kg/m³
    private let g = 9.81     // Gravity m/s²
    
    init(riderParameters: RiderParameters, learnedParameters: LearnedParameters = LearnedParameters()) {
        self.riderParameters = riderParameters
        self.learnedParameters = learnedParameters
    }
    
    // MARK: - Ride Lifecycle
    
    func startRide() {
        rideStartTime = Date()
        segmentStartTime = Date()
        currentRideSegments = []
        segmentAccumulator = SegmentAccumulator()
    }
    
    func updateRide(
        power: Double,
        speed: Double,
        grade: Double,
        windSpeed: Double,
        temperature: Double,
        humidity: Double,
        heartRate: Double?
    ) {
        segmentAccumulator.addDataPoint(
            power: power,
            speed: speed,
            grade: grade,
            windSpeed: windSpeed,
            temperature: temperature,
            humidity: humidity,
            heartRate: heartRate
        )
        
        // Create segment every 60 seconds
        if let start = segmentStartTime, Date().timeIntervalSince(start) >= 60 {
            if let segment = segmentAccumulator.createSegment(startTime: start) {
                currentRideSegments.append(segment)
            }
            segmentStartTime = Date()
            segmentAccumulator = SegmentAccumulator()
        }
    }
    
    func endRide(
        totalDistance: Double,
        avgPower: Double,
        normalizedPower: Double,
        avgSpeed: Double,
        maxPower: Double
    ) {
        guard let startTime = rideStartTime else { return }
        
        // Create final segment if needed
        if let segStart = segmentStartTime, !segmentAccumulator.isEmpty {
            if let segment = segmentAccumulator.createSegment(startTime: segStart) {
                currentRideSegments.append(segment)
            }
        }
        
        let ride = LearningRide(
            startTime: startTime,
            endTime: Date(),
            totalDistance: totalDistance,
            avgPower: avgPower,
            normalizedPower: normalizedPower,
            avgSpeed: avgSpeed,
            maxPower: maxPower,
            avgTemperature: currentRideSegments.map { $0.temperature }.reduce(0, +) / Double(max(currentRideSegments.count, 1)),
            avgHeartRate: nil,
            segments: currentRideSegments
        )
        
        // Store and learn from this ride
        Task {
            await SegmentStore.shared.saveRide(ride)
            await retrainModels()
        }
        
        rideStartTime = nil
        segmentStartTime = nil
        currentRideSegments = []
    }
    
    // MARK: - Learning Algorithms
    
    func retrainModels() async {
        let rides = await SegmentStore.shared.loadRecentRides(limit: 100)
        
        // Learn CdA from flat segments
        learnCdA(from: rides)
        
        // Learn fatigue curve from long rides
        learnFatigueCurve(from: rides)
        
        // Learn heat sensitivity
        learnHeatSensitivity(from: rides)
        
        // Estimate FTP from sustained efforts
        estimateFTP(from: rides)
        
        learnedParameters.lastUpdated = Date()
    }
    
    // MARK: - CdA Learning
    
    private func learnCdA(from rides: [LearningRide]) {
        var cdaSamples: [Double] = []
        
        for ride in rides {
            let flatSegments = ride.segments.filter { abs($0.avgGrade) < 0.01 && $0.avgSpeed > 5.0 }
            
            for segment in flatSegments {
                let mass = riderParameters.mass
                let crr = riderParameters.crr
                
                // Calculate rolling resistance power
                let rollingPower = mass * g * crr * segment.avgSpeed
                
                // Available power for aerodynamics
                let aeroPower = max(0, segment.avgPower - rollingPower)
                
                // Calculate effective velocity (includes wind)
                let effectiveVelocity = segment.avgSpeed + segment.windSpeed
                
                // Solve for CdA: Power = 0.5 × ρ × CdA × v³
                if effectiveVelocity > 3.0 && aeroPower > 50 {
                    let calculatedCdA = aeroPower / (0.5 * rho * pow(effectiveVelocity, 3))
                    
                    // Filter outliers (reasonable CdA range: 0.2 to 0.5)
                    if calculatedCdA >= 0.2 && calculatedCdA <= 0.5 {
                        cdaSamples.append(calculatedCdA)
                    }
                }
            }
        }
        
        if cdaSamples.count >= 20 {  // Need sufficient samples
            let meanCdA = cdaSamples.reduce(0, +) / Double(cdaSamples.count)
            let variance = cdaSamples.map { pow($0 - meanCdA, 2) }.reduce(0, +) / Double(cdaSamples.count)
            let stdDev = sqrt(variance)
            
            // Confidence based on sample size and consistency
            let sampleConfidence = min(Double(cdaSamples.count) / 100.0, 1.0)
            let consistencyConfidence = max(0, 1.0 - (stdDev / meanCdA))
            let confidence = (sampleConfidence * 0.5 + consistencyConfidence * 0.5) * 100.0
            
            learnedParameters.learnedCdA = meanCdA
            learnedParameters.cdaRideCount = rides.filter { $0.hasFlatSegments }.count
            learnedParameters.cdaConfidence = confidence
        }
    }
    
    // MARK: - Fatigue Curve Learning
    
    private func learnFatigueCurve(from rides: [LearningRide]) {
        let longRides = rides.filter { $0.isLongRide }
        
        guard longRides.count >= 5 else { return }
        
        var fatigueRateSamples: [Double] = []
        
        for ride in longRides {
            guard ride.segments.count > 10 else { continue }
            
            // Compare power in first 25% vs last 25% of ride
            let segmentCount = ride.segments.count
            let firstQuarter = ride.segments.prefix(segmentCount / 4)
            let lastQuarter = ride.segments.suffix(segmentCount / 4)
            
            let initialPower = firstQuarter.map { $0.avgPower }.reduce(0, +) / Double(firstQuarter.count)
            let finalPower = lastQuarter.map { $0.avgPower }.reduce(0, +) / Double(lastQuarter.count)
            
            // Calculate power retention ratio
            let powerRetention = finalPower / initialPower
            
            // Calculate fatigue rate (decay coefficient)
            // Model: retention = e^(-λ × time)
            let hours = ride.duration / 3600.0
            if powerRetention > 0 && powerRetention < 1.5 {  // Filter outliers
                let lambda = -log(powerRetention) / hours
                fatigueRateSamples.append(lambda)
            }
        }
        
        if fatigueRateSamples.count >= 5 {
            let meanLambda = fatigueRateSamples.reduce(0, +) / Double(fatigueRateSamples.count)
            
            let confidence = min(Double(fatigueRateSamples.count) / 15.0, 1.0) * 100.0
            
            learnedParameters.learnedFatigueRate = meanLambda
            learnedParameters.fatigueRideCount = longRides.count
            learnedParameters.fatigueConfidence = confidence
        }
    }
    
    // MARK: - Heat Sensitivity Learning
    
    private func learnHeatSensitivity(from rides: [LearningRide]) {
        // Need rides across a temperature range
        let tempRange = rides.map { $0.avgTemperature }
        guard let minTemp = tempRange.min(),
              let maxTemp = tempRange.max(),
              maxTemp - minTemp > 8.0 else { return }  // Need 8°C+ range
        
        var heatSamples: [(temp: Double, efficiency: Double)] = []
        
        for ride in rides {
            guard ride.segments.count > 5 else { continue }
            
            // Calculate efficiency: speed per watt
            let avgEfficiency = ride.segments.map { $0.avgSpeed / max($0.avgPower, 1) }.reduce(0, +) / Double(ride.segments.count)
            let tempF = ride.avgTemperature * 9/5 + 32
            
            heatSamples.append((temp: tempF, efficiency: avgEfficiency))
        }
        
        guard heatSamples.count >= 8 else { return }
        
        // Linear regression: efficiency = α × temp + β
        let n = Double(heatSamples.count)
        let sumX = heatSamples.map { $0.temp }.reduce(0, +)
        let sumY = heatSamples.map { $0.efficiency }.reduce(0, +)
        let sumXY = heatSamples.map { $0.temp * $0.efficiency }.reduce(0, +)
        let sumX2 = heatSamples.map { $0.temp * $0.temp }.reduce(0, +)
        
        let slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
        
        // Convert slope to heat penalty percentage
        let heatCoefficient = -slope * 100.0  // Negative because efficiency decreases with heat
        
        let confidence = min(Double(heatSamples.count) / 20.0, 1.0) * 100.0
        
        learnedParameters.learnedHeatCoefficient = heatCoefficient
        learnedParameters.heatRideCount = rides.count
        learnedParameters.heatConfidence = confidence
    }
    
    // MARK: - FTP Estimation
    
    private func estimateFTP(from rides: [LearningRide]) {
        var ftpEstimates: [Double] = []
        
        for ride in rides {
            // Look for sustained efforts > 20 minutes at high intensity
            for segment in ride.segments where segment.duration >= 1200 {  // 20+ minutes
                if let np = segment.normalizedPower, np > 150 {
                    // Estimate FTP as 95% of 20min power
                    let ftpEstimate = np * 0.95
                    ftpEstimates.append(ftpEstimate)
                }
            }
        }
        
        if ftpEstimates.count >= 3 {
            let meanFTP = ftpEstimates.reduce(0, +) / Double(ftpEstimates.count)
            learnedParameters.estimatedFTP = meanFTP
            learnedParameters.ftpSampleCount = ftpEstimates.count
        }
    }
    
    // MARK: - Get Learned Values (with fallback)
    
    func getEffectiveCdA() -> Double {
        if learnedParameters.cdaLearningStatus == .highConfidence,
           let learned = learnedParameters.learnedCdA {
            return learned
        }
        return riderParameters.cda
    }
    
    func getEffectiveFatigueRate() -> Double? {
        if learnedParameters.fatigueLearningStatus == .highConfidence {
            return learnedParameters.learnedFatigueRate
        }
        return nil
    }
    
    func getEffectiveHeatCoefficient() -> Double? {
        if learnedParameters.heatLearningStatus == .highConfidence {
            return learnedParameters.learnedHeatCoefficient
        }
        return nil
    }
}

// MARK: - Segment Accumulator

private class SegmentAccumulator {
    private var powerSamples: [Double] = []
    private var speedSamples: [Double] = []
    private var gradeSamples: [Double] = []
    private var windSamples: [Double] = []
    private var tempSamples: [Double] = []
    private var humiditySamples: [Double] = []
    private var hrSamples: [Double] = []
    
    var isEmpty: Bool {
        powerSamples.isEmpty
    }
    
    func addDataPoint(
        power: Double,
        speed: Double,
        grade: Double,
        windSpeed: Double,
        temperature: Double,
        humidity: Double,
        heartRate: Double?
    ) {
        powerSamples.append(power)
        speedSamples.append(speed)
        gradeSamples.append(grade)
        windSamples.append(windSpeed)
        tempSamples.append(temperature)
        humiditySamples.append(humidity)
        if let hr = heartRate {
            hrSamples.append(hr)
        }
    }
    
    func createSegment(startTime: Date) -> RideSegment? {
        guard !powerSamples.isEmpty else { return nil }
        
        let avgPower = powerSamples.reduce(0, +) / Double(powerSamples.count)
        let avgSpeed = speedSamples.reduce(0, +) / Double(speedSamples.count)
        let avgGrade = gradeSamples.reduce(0, +) / Double(gradeSamples.count)
        let avgWind = windSamples.reduce(0, +) / Double(windSamples.count)
        let avgTemp = tempSamples.reduce(0, +) / Double(tempSamples.count)
        let avgHumidity = humiditySamples.reduce(0, +) / Double(humiditySamples.count)
        let avgHR = hrSamples.isEmpty ? nil : hrSamples.reduce(0, +) / Double(hrSamples.count)
        
        let duration = Date().timeIntervalSince(startTime)
        
        return RideSegment(
            timestamp: startTime,
            duration: duration,
            avgPower: avgPower,
            avgSpeed: avgSpeed,
            avgGrade: avgGrade,
            windSpeed: avgWind,
            temperature: avgTemp,
            humidity: avgHumidity,
            heartRate: avgHR,
            normalizedPower: avgPower,  // Simplified
            intensityFactor: nil
        )
    }
}
