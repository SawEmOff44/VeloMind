import Foundation
import os.log

/// Calibration modes
enum CalibrationMode {
    case steadyState    // 10-15 minute steady effort
    case coastDown      // Coast-down test for rolling resistance
}

/// Calibration session data
struct CalibrationSession: Codable, Identifiable {
    let id: UUID
    let mode: String
    let startTime: Date
    let endTime: Date?
    let averageSpeed: Double
    let averageGrade: Double
    let averageWind: Double
    let estimatedPower: Double?
    let calibratedCdA: Double?
    let calibratedCrr: Double?
    let ridingPosition: String  // "hoods" or "drops"
    
    init(id: UUID = UUID(), mode: CalibrationMode, startTime: Date, endTime: Date? = nil,
         averageSpeed: Double = 0, averageGrade: Double = 0, averageWind: Double = 0,
         estimatedPower: Double? = nil, calibratedCdA: Double? = nil, calibratedCrr: Double? = nil,
         ridingPosition: String = "hoods") {
        self.id = id
        self.mode = mode == .steadyState ? "steadyState" : "coastDown"
        self.startTime = startTime
        self.endTime = endTime
        self.averageSpeed = averageSpeed
        self.averageGrade = averageGrade
        self.averageWind = averageWind
        self.estimatedPower = estimatedPower
        self.calibratedCdA = calibratedCdA
        self.calibratedCrr = calibratedCrr
        self.ridingPosition = ridingPosition
    }
}

/// Manages calibration workflows
@MainActor
class CalibrationManager: ObservableObject {
    @Published var isCalibrating = false
    @Published var currentSession: CalibrationSession?
    @Published var calibrationProgress: Double = 0.0
    @Published var calibrationHistory: [CalibrationSession] = []
    
    private let logger = Logger(subsystem: "com.velomind.app", category: "Calibration")
    
    // Calibration data collection
    private var speedReadings: [Double] = []
    private var gradeReadings: [Double] = []
    private var windReadings: [Double] = []
    private var powerReadings: [Double] = []
    
    private let minimumDuration: TimeInterval = 10 * 60  // 10 minutes for steady-state
    
    // MARK: - Start/Stop Calibration
    
    func startCalibration(mode: CalibrationMode, position: String = "hoods") {
        isCalibrating = true
        calibrationProgress = 0.0
        speedReadings.removeAll()
        gradeReadings.removeAll()
        windReadings.removeAll()
        powerReadings.removeAll()
        
        currentSession = CalibrationSession(
            mode: mode,
            startTime: Date(),
            ridingPosition: position
        )
        
        logger.info("Started \(mode == .steadyState ? "steady-state" : "coast-down") calibration")
    }
    
    func stopCalibration(powerEngine: PowerEngine) {
        guard var session = currentSession else { return }
        
        let avgSpeed = speedReadings.reduce(0, +) / Double(speedReadings.count)
        let avgGrade = gradeReadings.reduce(0, +) / Double(gradeReadings.count)
        let avgWind = windReadings.reduce(0, +) / Double(windReadings.count)
        let avgPower = powerReadings.reduce(0, +) / Double(powerReadings.count)
        
        // Perform calibration calculation
        let calibratedCdA = calculateCdA(
            power: avgPower,
            speed: avgSpeed,
            grade: avgGrade,
            wind: avgWind,
            parameters: powerEngine.riderParameters
        )
        
        // Update session
        session = CalibrationSession(
            id: session.id,
            mode: session.mode == "steadyState" ? .steadyState : .coastDown,
            startTime: session.startTime,
            endTime: Date(),
            averageSpeed: avgSpeed,
            averageGrade: avgGrade,
            averageWind: avgWind,
            estimatedPower: avgPower,
            calibratedCdA: calibratedCdA,
            ridingPosition: session.ridingPosition
        )
        
        // Apply calibration to power engine
        if let newCdA = calibratedCdA {
            powerEngine.riderParameters.cda = newCdA
            logger.info("Applied calibrated CdA: \(newCdA, privacy: .public)")
        }
        
        calibrationHistory.append(session)
        currentSession = nil
        isCalibrating = false
        
        logger.info("Completed calibration: CdA = \(calibratedCdA ?? 0, privacy: .public)")
    }
    
    // MARK: - Data Collection
    
    func recordData(speed: Double, grade: Double, wind: Double, power: Double) {
        guard isCalibrating else { return }
        
        speedReadings.append(speed)
        gradeReadings.append(grade)
        windReadings.append(wind)
        powerReadings.append(power)
        
        // Update progress
        if let session = currentSession {
            let elapsed = Date().timeIntervalSince(session.startTime)
            calibrationProgress = min(1.0, elapsed / minimumDuration)
        }
    }
    
    // MARK: - Calibration Calculations
    
    private func calculateCdA(power: Double, speed: Double, grade: Double, wind: Double, parameters: RiderParameters) -> Double? {
        guard speed > 5.0 else {  // Need sufficient speed
            return nil
        }
        
        let g = 9.81
        let rho = 1.225
        let vAir = speed + wind
        
        // Solve for CdA from power equation
        // P = 0.5 * rho * CdA * v_air^3 + Crr * m * g * v * cos(atan(grade)) + m * g * grade * v
        
        let angleRad = atan(grade)
        let pRoll = parameters.crr * parameters.mass * g * speed * cos(angleRad)
        let pGrav = parameters.mass * g * grade * speed
        
        // Power after accounting for drivetrain loss
        let mechanicalPower = power * (1 - parameters.drivetrainLoss)
        
        // Solve for aero power
        let pAero = mechanicalPower - pRoll - pGrav
        
        guard pAero > 0 && vAir > 0 else {
            return nil
        }
        
        let cda = (2 * pAero) / (rho * pow(vAir, 3))
        
        // Sanity check (typical CdA range: 0.2 - 0.5)
        guard cda > 0.15 && cda < 0.6 else {
            logger.warning("Calculated CdA \(cda) out of reasonable range")
            return nil
        }
        
        return cda
    }
    
    // MARK: - Coast Down Calibration
    
    func performCoastDown(initialSpeed: Double, finalSpeed: Double, distance: Double, grade: Double) -> Double? {
        // Calculate Crr from coast-down test
        // Uses energy conservation: KE_lost = Work_by_rolling + Work_by_gravity
        
        let m = 85.0  // Mass estimate
        let g = 9.81
        
        let keInitial = 0.5 * m * pow(initialSpeed, 2)
        let keFinal = 0.5 * m * pow(finalSpeed, 2)
        let keLost = keInitial - keFinal
        
        // Work by gravity
        let elevationChange = distance * grade
        let workGravity = m * g * elevationChange
        
        // Work by rolling resistance
        let workRolling = keLost - workGravity
        
        // Crr = Work_rolling / (m * g * distance)
        let crr = workRolling / (m * g * distance)
        
        // Sanity check
        guard crr > 0.002 && crr < 0.010 else {
            logger.warning("Calculated Crr \(crr) out of reasonable range")
            return nil
        }
        
        logger.info("Coast-down Crr: \(crr, privacy: .public)")
        return crr
    }
}
