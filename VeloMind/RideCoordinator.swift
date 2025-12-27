import Foundation
import Combine

/// Coordinates all ride-related managers and state
@MainActor
class RideCoordinator: ObservableObject {
    // Managers
    let bleManager = BLEManager()
    let locationManager = LocationManager()
    let routeManager = RouteManager()
    let weatherManager = WeatherManager()
    let powerEngine = PowerEngine()
    let calibrationManager = CalibrationManager()
    let stravaManager = StravaManager()
    let fitnessManager = FitnessManager()
    let persistenceManager = PersistenceManager()
    let navigationManager: RouteNavigationManager
    
    // Intelligence & Fitness
    let intelligenceEngine: IntelligenceEngine
    let fitnessProfileManager: FitnessProfileManager
    let learningEngine: LearningEngine
    var authManager: AuthenticationManager?
    
    // Ride state
    @Published var isRiding = false
    @Published var rideStartTime: Date?
    @Published var rideDuration: TimeInterval = 0
    @Published var rideDistance: Double = 0
    @Published var isNavigating = false
    
    private var cancellables = Set<AnyCancellable>()
    private var updateTimer: Timer?
    
    init() {
        // Initialize intelligence components
        let riderParams = persistenceManager.loadRiderParameters() ?? RiderParameters.default
        
        // Load learned parameters
        let learnedParams = Task {
            await SegmentStore.shared.loadLearnedParameters() ?? LearnedParameters()
        }
        
        self.learningEngine = LearningEngine(
            riderParameters: riderParams,
            learnedParameters: LearnedParameters()  // Will be updated async
        )
        self.intelligenceEngine = IntelligenceEngine(riderParameters: riderParams)
        self.fitnessProfileManager = FitnessProfileManager(
            persistenceManager: persistenceManager,
            stravaManager: stravaManager
        )
        self.navigationManager = RouteNavigationManager(locationManager: locationManager)
        
        // Link learning engine to other components
        self.powerEngine.learningEngine = learningEngine
        self.intelligenceEngine.learningEngine = learningEngine
        
        setupDelegates()
        
        // Load learned parameters async
        Task {
            if let params = await SegmentStore.shared.loadLearnedParameters() {
                await MainActor.run {
                    self.learningEngine.learnedParameters = params
                }
            }
        }
    }
    
    private func setupDelegates() {
        bleManager.delegate = self
    }
    
    // MARK: - Ride Control
    
    func startRide() {
        isRiding = true
        rideStartTime = Date()
        rideDuration = 0
        rideDistance = 0
        
        // Start all services
        locationManager.startTracking()
        bleManager.startScanning()
        powerEngine.resetMetrics()
        
        // Start intelligence engine
        intelligenceEngine.startRide()
        
        // Start learning engine
        learningEngine.startRide()
        
        // Start update loop
        startUpdateLoop()
    }
    
    func startRideWithNavigation(route: Route) {
        // Start normal ride
        startRide()
        
        // Start navigation
        navigationManager.startNavigation(route: route)
        isNavigating = true
    }
    
    func stopRide() {
        isRiding = false
        
        // Stop navigation if active
        if isNavigating {
            navigationManager.stopNavigation()
            isNavigating = false
        }
        
        // End learning session and save ride data
        learningEngine.endRide(
            totalDistance: rideDistance,
            avgPower: powerEngine.averagePower,
            normalizedPower: powerEngine.normalizedPower,
            avgSpeed: rideDistance / max(rideDuration, 1),
            maxPower: powerEngine.powerHistory.map { $0.totalPower }.max() ?? 0
        )
        
        // Stop services
        stopUpdateLoop()
        locationManager.stopTracking()
        bleManager.stopScanning()
    }
    
    func pauseRide() {
        isRiding = false
        stopUpdateLoop()
    }
    
    func resumeRide() {
        isRiding = true
        startUpdateLoop()
    }
    
    // MARK: - Update Loop
    
    private func startUpdateLoop() {
        updateTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.updateRideData()
            }
        }
    }
    
    private func stopUpdateLoop() {
        updateTimer?.invalidate()
        updateTimer = nil
    }
    
    private func updateRideData() async {
        guard isRiding else { return }
        
        // Update duration
        if let startTime = rideStartTime {
            rideDuration = Date().timeIntervalSince(startTime)
        }
        
        // Get current location
        guard let location = locationManager.currentLocation else { return }
        
        // Fetch weather if needed
        await weatherManager.fetchWeather(at: location)
        
        // Match to route if available
        let routeMatch = routeManager.matchLocation(location)
        
        // Analyze upcoming climbs
        var upcomingClimb: ClimbSegment? = nil
        if let currentIndex = routeManager.getCurrentPositionIndex() {
            upcomingClimb = routeManager.analyzeUpcomingTerrain(currentIndex: currentIndex)
        }
        
        // Get speed (prefer BLE sensor, fallback to GPS)
        let speed = bleManager.currentSpeed > 0 ? bleManager.currentSpeed : locationManager.currentSpeed
        
        // Get grade from route or calculate from GPS
        let grade = routeMatch?.grade150m ?? 0.0
        
        // Calculate bearing for wind
        let bearing = location.course >= 0 ? location.course : 0
        let headwind = weatherManager.getHeadwind(bearing: bearing)
        
        // Calculate power
        let powerResult = powerEngine.calculatePower(
            speed: speed,
            grade: grade,
            headwind: headwind,
            altitude: location.altitude
        )
        
        // Update intelligence engine with all current data
        intelligenceEngine.update(
            currentPower: powerResult.totalPower,
            currentSpeed: speed,
            currentCadence: bleManager.currentCadence,
            heartRate: Double(bleManager.currentHeartRate),
            grade: grade,
            windSpeed: headwind,
            temperature: weatherManager.currentTemperature,
            humidity: weatherManager.currentHumidity,
            rideDuration: rideDuration,
            rideDistance: rideDistance,
            routeAhead: routeManager.currentRoute
        )
        
        // Update learning engine with ride data
        learningEngine.updateRide(
            power: powerResult.totalPower,
            speed: speed,
            grade: grade,
            windSpeed: headwind,
            temperature: weatherManager.currentTemperature ?? 20.0,
            humidity: weatherManager.currentHumidity ?? 50.0,
            heartRate: bleManager.currentHeartRate > 0 ? Double(bleManager.currentHeartRate) : nil
        )
        
        // Update climb preview if available
        if let climb = upcomingClimb, let ftp = intelligenceEngine.riderParameters.ftp {
            let distanceMiles = climb.distance * 0.000621371
            let gradePercent = climb.averageGrade * 100
            
            // Estimate recommended power (1.0-1.1x FTP for moderate climbs)
            let powerMultiplier = 1.0 + (gradePercent / 100.0) // Rough estimate
            let recommendedPower = ftp * powerMultiplier
            
            intelligenceEngine.upcomingClimb = ClimbPreview(
                distance: distanceMiles,
                grade: gradePercent,
                recommendedPower: (recommendedPower - 10)...(recommendedPower + 10)
            )
        } else {
            intelligenceEngine.upcomingClimb = nil
        }
        
        // Update distance
        // This is simplified - should track actual distance traveled
        rideDistance += speed * 1.0  // 1 second interval
        
        // Record calibration data if active
        if calibrationManager.isCalibrating {
            calibrationManager.recordData(
                speed: speed,
                grade: grade,
                wind: headwind,
                power: powerResult.totalPower
            )
        }
    }
}

// MARK: - SensorDataDelegate
@MainActor
extension RideCoordinator: SensorDataDelegate {
    func didUpdateSpeed(_ speed: Double, timestamp: Date) {
        // Speed already published by BLEManager
    }
    
    func didUpdateCadence(_ cadence: Double, timestamp: Date) {
        // Cadence already published by BLEManager
    }
    
    func didUpdateHeartRate(_ heartRate: Int, timestamp: Date) {
        // Heart rate already published by BLEManager
    }
    
    func didUpdateConnectionState(_ isConnected: Bool, sensorType: BLESensorType) {
        // Connection state already published by BLEManager
    }
}
