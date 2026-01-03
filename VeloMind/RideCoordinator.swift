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
    let backgroundTaskManager = BackgroundTaskManager()
    let watchConnectivityManager = WatchConnectivityManager.shared
    let apiService = APIService()
    
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

    private var rideDataPoints: [RideDataPoint] = []
    private var totalElevationGain: Double = 0.0
    private var lastAltitude: Double?

    private var isRetryingBackendUploads = false
    
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
        setupWatchNotifications()
        
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
    
    private func setupWatchNotifications() {
        // Listen for watch control requests
        NotificationCenter.default.addObserver(
            forName: .watchRequestedRideStart,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.startRide()
            }
        }
        
        NotificationCenter.default.addObserver(
            forName: .watchRequestedRideStop,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.stopRide()
            }
        }
    }
    
    // MARK: - Ride Control
    
    func startRide() {
        isRiding = true
        rideStartTime = Date()
        rideDuration = 0
        rideDistance = 0
        rideDataPoints = []
        totalElevationGain = 0
        lastAltitude = nil
        
        // Configure background support
        backgroundTaskManager.configureAudioSession()
        backgroundTaskManager.activateAudioSession()
        
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

        let endTime = Date()
        
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
            maxPower: powerEngine.allPowerResults.map { $0.totalPower }.max() ?? 0
        )
        
        // Stop services
        stopUpdateLoop()
        locationManager.stopTracking()
        bleManager.stopScanning()
        
        // Deactivate background support
        backgroundTaskManager.deactivateAudioSession()

        // Persist + upload completed session
        if let startTime = rideStartTime {
            let avgSpeed = rideDistance / max(rideDuration, 1)
            let avgCadence: Double = {
                let values = rideDataPoints.map { $0.cadence }.filter { $0 > 0 }
                guard !values.isEmpty else { return 0 }
                return values.reduce(0, +) / Double(values.count)
            }()

            let hrValues = rideDataPoints.compactMap { $0.heartRate }.filter { $0 > 0 }
            let avgHeartRate: Int? = hrValues.isEmpty ? nil : Int(Double(hrValues.reduce(0, +)) / Double(hrValues.count))

            var session = RideSession(
                startTime: startTime,
                endTime: endTime,
                duration: rideDuration,
                distance: rideDistance,
                averagePower: powerEngine.averagePower,
                normalizedPower: powerEngine.normalizedPower,
                averageSpeed: avgSpeed,
                averageCadence: avgCadence,
                averageHeartRate: avgHeartRate,
                totalElevationGain: totalElevationGain,
                routeID: nil,
                dataPoints: rideDataPoints
            )

            persistenceManager.saveRideSession(session)

            Task {
                do {
                    let routeId = (routeManager.currentRoute?.id ?? 0) > 0 ? routeManager.currentRoute?.id : nil
                    let ftp = powerEngine.riderParameters.ftp
                    let backendId = try await apiService.uploadSession(session, routeId: routeId, ftp: ftp)
                    session.backendSessionId = backendId
                    persistenceManager.updateRideSession(session)
                    print("✅ Uploaded session to backend: \(backendId)")
                } catch {
                    // Keep session locally; it can be retried later.
                    print("⚠️ Failed to upload session: \(error.localizedDescription)")
                }
            }
        }
    }

    // MARK: - Backend Sync

    /// Best-effort retry of any locally saved sessions that haven't been uploaded.
    /// Call this when the app becomes active and the user is authenticated.
    func retryPendingSessionUploads(maxSessions: Int = 3) {
        guard !isRetryingBackendUploads else { return }
        isRetryingBackendUploads = true

        Task {
            defer { self.isRetryingBackendUploads = false }

            let ftp = persistenceManager.loadRiderParameters()?.ftp

            let pending = persistenceManager
                .loadRideSessions()
                .filter { !$0.isUploadedToBackend }
                .sorted { $0.startTime < $1.startTime }

            guard !pending.isEmpty else { return }

            var uploaded = 0
            for var session in pending {
                if uploaded >= maxSessions { break }
                do {
                    let backendId = try await apiService.uploadSession(session, routeId: session.routeID, ftp: ftp)
                    session.backendSessionId = backendId
                    persistenceManager.updateRideSession(session)
                    uploaded += 1
                    print("✅ Retried upload succeeded: \(backendId)")
                } catch {
                    print("⚠️ Retried upload failed: \(error.localizedDescription)")
                }
            }
        }
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
        // Adapt interval based on power mode
        let interval = backgroundTaskManager.recommendedUpdateInterval()
        updateTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.updateRideData()
            }
        }
        
        // Restart timer if power mode changes
        NotificationCenter.default.addObserver(
            forName: .NSProcessInfoPowerStateDidChange,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.stopUpdateLoop()
                self?.startUpdateLoop()
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

        // Elevation gain (positive deltas)
        if let lastAlt = lastAltitude {
            let delta = location.altitude - lastAlt
            if delta > 0 {
                totalElevationGain += delta
            }
        }
        lastAltitude = location.altitude
        
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

        // Record datapoint for persistence/backend
        let windSpeed = weatherManager.currentWind?.speed ?? 0.0
        let windDirection = weatherManager.currentWind?.direction ?? 0.0
        let dp = RideDataPoint(
            timestamp: Date(),
            latitude: location.coordinate.latitude,
            longitude: location.coordinate.longitude,
            distance: rideDistance,
            altitude: location.altitude,
            speed: speed,
            cadence: bleManager.currentCadence,
            heartRate: bleManager.currentHeartRate > 0 ? bleManager.currentHeartRate : nil,
            power: powerResult.totalPower,
            grade: grade,
            windSpeed: windSpeed,
            windDirection: windDirection
        )
        rideDataPoints.append(dp)
        
        // Sync data to Apple Watch
        syncToWatch(speed: speed, powerResult: powerResult)
        
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

// MARK: - Apple Watch Sync

extension RideCoordinator {
    private func syncToWatch(speed: Double, powerResult: PowerResult) {
        watchConnectivityManager.sendRideData(
            power: powerResult.totalPower,
            speed: speed * 2.23694,  // Convert m/s to mph
            cadence: bleManager.currentCadence,
            heartRate: Double(bleManager.currentHeartRate),
            distance: rideDistance * 0.000621371,  // Convert m to miles
            duration: rideDuration,
            currentZone: intelligenceEngine.currentPowerZone.rawValue,
            targetZone: intelligenceEngine.targetPowerZone?.rawValue,
            routeAnalysis: intelligenceEngine.routeAheadAnalysis,
            isRiding: isRiding
        )
        
        // Update complication with key metrics
        if let routeAnalysis = intelligenceEngine.routeAheadAnalysis {
            watchConnectivityManager.updateComplication(
                power: powerResult.totalPower,
                zone: intelligenceEngine.currentPowerZone.rawValue,
                upcomingElevation: routeAnalysis.elevationGain * 3.28084
            )
        }
    }
}
