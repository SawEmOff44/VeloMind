import Foundation
import os.log

/// Power calculation engine using physics-based model
@MainActor
class PowerEngine: ObservableObject {
    @Published var instantaneousPower: Double = 0.0  // Watts
    @Published var smoothedPower3s: Double = 0.0     // 3-second average
    @Published var smoothedPower10s: Double = 0.0    // 10-second average
    @Published var averagePower: Double = 0.0        // Ride average
    @Published var normalizedPower: Double = 0.0     // NP (intensity metric)
    
    var riderParameters = RiderParameters.default
    
    private let logger = Logger(subsystem: "com.velomind.app", category: "Power")
    
    // Constants
    private let g = 9.81            // Gravity (m/s²)
    private let airDensity = 1.225  // kg/m³ (sea level, 15°C)
    
    // Smoothing buffers
    private var powerHistory: [PowerResult] = []
    private var power3sBuffer: [Double] = []
    private var power10sBuffer: [Double] = []
    
    // MARK: - Power Calculation
    
    func calculatePower(
        speed: Double,          // m/s
        grade: Double,          // rise/run (e.g., 0.05 = 5%)
        headwind: Double,       // m/s (positive = headwind, negative = tailwind)
        altitude: Double = 0    // meters (for air density adjustment)
    ) -> PowerResult {
        
        // Adjust air density for altitude
        let rho = adjustedAirDensity(altitude: altitude)
        
        // Apparent wind speed (rider speed + headwind)
        let vAir = speed + headwind
        
        // 1. Aerodynamic drag power
        // P_aero = 0.5 * rho * CdA * v_air^3
        let pAero = 0.5 * rho * riderParameters.cda * pow(vAir, 3)
        
        // 2. Rolling resistance power
        // P_roll = Crr * m * g * v * cos(arctan(grade))
        let angleRad = atan(grade)
        let pRoll = riderParameters.crr * riderParameters.mass * g * speed * cos(angleRad)
        
        // 3. Gravity power
        // P_grav = m * g * grade * v
        let pGrav = riderParameters.mass * g * grade * speed
        
        // Total power (without drivetrain loss)
        let totalPower = pAero + pRoll + pGrav
        
        // Apply drivetrain efficiency
        let outputPower = totalPower / (1 - riderParameters.drivetrainLoss)
        
        // Confidence based on data quality (simplified)
        let confidence = calculateConfidence(speed: speed)
        
        let result = PowerResult(
            totalPower: max(0, outputPower),
            aeroPower: pAero,
            gravityPower: pGrav,
            rollingPower: pRoll,
            timestamp: Date(),
            confidence: confidence
        )
        
        // Update published values
        updatePowerMetrics(result)
        
        logger.debug("Power: \(Int(outputPower))W | Aero: \(Int(pAero))W | Gravity: \(Int(pGrav))W | Roll: \(Int(pRoll))W")
        
        return result
    }
    
    // MARK: - Smoothing and Metrics
    
    private func updatePowerMetrics(_ result: PowerResult) {
        instantaneousPower = result.totalPower
        powerHistory.append(result)
        
        // Update 3s buffer
        power3sBuffer.append(result.totalPower)
        if power3sBuffer.count > 3 {
            power3sBuffer.removeFirst()
        }
        smoothedPower3s = power3sBuffer.reduce(0, +) / Double(power3sBuffer.count)
        
        // Update 10s buffer
        power10sBuffer.append(result.totalPower)
        if power10sBuffer.count > 10 {
            power10sBuffer.removeFirst()
        }
        smoothedPower10s = power10sBuffer.reduce(0, +) / Double(power10sBuffer.count)
        
        // Update average power
        let totalSum = powerHistory.map { $0.totalPower }.reduce(0, +)
        averagePower = totalSum / Double(powerHistory.count)
        
        // Calculate normalized power (rolling 30s average of 4th power)
        calculateNormalizedPower()
        
        // Trim history if it gets too large (keep last hour)
        if powerHistory.count > 3600 {
            powerHistory.removeFirst(powerHistory.count - 3600)
        }
    }
    
    private func calculateNormalizedPower() {
        guard powerHistory.count >= 30 else {
            normalizedPower = averagePower
            return
        }
        
        // Take last 30 seconds
        let recent = Array(powerHistory.suffix(30))
        let avgPower = recent.map { $0.totalPower }.reduce(0, +) / Double(recent.count)
        
        // NP = (average of 4th power)^(1/4)
        let fourthPowers = recent.map { pow($0.totalPower, 4) }
        let avgFourthPower = fourthPowers.reduce(0, +) / Double(fourthPowers.count)
        normalizedPower = pow(avgFourthPower, 0.25)
    }
    
    // MARK: - Helper Methods
    
    private func adjustedAirDensity(altitude: Double) -> Double {
        // Approximate air density adjustment for altitude
        // rho = rho0 * exp(-altitude / 8500)
        return airDensity * exp(-altitude / 8500)
    }
    
    private func calculateConfidence(speed: Double) -> Double {
        // Simple confidence metric
        // Low confidence if speed is very low (coasting/stopped)
        if speed < 2.0 {
            return 0.3
        } else if speed < 4.0 {
            return 0.6
        } else {
            return 1.0
        }
    }
    
    // MARK: - Calibration
    
    func calibrateCdA(measuredPower: Double, speed: Double, grade: Double, headwind: Double) {
        // Reverse calculate CdA from known power
        // Solve for CdA: P = 0.5 * rho * CdA * v_air^3 + other_terms
        
        let vAir = speed + headwind
        let angleRad = atan(grade)
        let pRoll = self.riderParameters.crr * self.riderParameters.mass * g * speed * cos(angleRad)
        let pGrav = self.riderParameters.mass * g * grade * speed
        
        // Power attributable to aero drag
        let pAero = measuredPower * (1 - self.riderParameters.drivetrainLoss) - pRoll - pGrav
        
        if vAir > 0 && pAero > 0 {
            // Solve for CdA
            let newCdA = (2 * pAero) / (airDensity * pow(vAir, 3))
            
            // Smooth the update (moving average)
            self.riderParameters.cda = 0.8 * self.riderParameters.cda + 0.2 * newCdA
            
            logger.info("Calibrated CdA: \(self.riderParameters.cda, privacy: .public)")
        }
    }
    
    func resetMetrics() {
        instantaneousPower = 0
        smoothedPower3s = 0
        smoothedPower10s = 0
        averagePower = 0
        normalizedPower = 0
        powerHistory.removeAll()
        power3sBuffer.removeAll()
        power10sBuffer.removeAll()
    }
}
