import Foundation

/// Manages rider fitness profile with auto-estimation and external data integration
@MainActor
class FitnessProfileManager: ObservableObject {
    @Published var currentProfile: RiderParameters
    @Published var ftpNeedsUpdate: Bool = false
    @Published var ftpUpdateSuggestion: String?
    
    private let persistenceManager: PersistenceManager
    private let apiService: APIService
    
    init(persistenceManager: PersistenceManager, apiService: APIService) {
        self.persistenceManager = persistenceManager
        self.apiService = apiService
        self.currentProfile = persistenceManager.loadRiderParameters() ?? RiderParameters.default
    }
    
    // MARK: - FTP Management
    
    /// Manually update FTP
    func updateFTP(_ newFTP: Double) {
        currentProfile.ftp = newFTP
        currentProfile.ftpLastUpdated = Date()
        saveProfile()
        
        // Clear any update notifications
        ftpNeedsUpdate = false
        ftpUpdateSuggestion = nil
    }
    
    /// Auto-estimate FTP from recent rides
    func estimateFTPFromRecentRides() -> Double? {
        guard currentProfile.recentRides.count >= 3 else { return nil }
        
        // Get rides from last 6 weeks
        let sixWeeksAgo = Date().addingTimeInterval(-6 * 7 * 24 * 3600)
        let recentRides = currentProfile.recentRides.filter { $0.date > sixWeeksAgo }
        
        guard recentRides.count >= 3 else { return nil }
        
        // Method 1: Find best 20-minute power
        let best20MinPower = findBest20MinutePower(from: recentRides)
        
        // Method 2: Use normalized power from longer rides
        let normalizedPowers = recentRides
            .filter { $0.duration > 3600 }  // Rides > 1 hour
            .map { $0.normalizedPower }
        
        var estimatedFTP: Double?
        
        if let best20 = best20MinPower {
            // FTP ≈ 95% of best 20-minute power
            estimatedFTP = best20 * 0.95
        } else if !normalizedPowers.isEmpty {
            // Use 90th percentile of normalized power
            let sorted = normalizedPowers.sorted()
            let index = Int(Double(sorted.count) * 0.9)
            estimatedFTP = sorted[min(index, sorted.count - 1)] * 0.90
        }
        
        if let ftp = estimatedFTP {
            currentProfile.estimatedFTP = ftp
            saveProfile()
            
            // Check if it's significantly different from manual FTP
            checkFTPDivergence()
        }
        
        return estimatedFTP
    }
    
    /// Check if estimated FTP differs significantly from manual FTP
    private func checkFTPDivergence() {
        guard let manualFTP = currentProfile.ftp,
              let estimatedFTP = currentProfile.estimatedFTP else { return }
        
        let difference = abs(estimatedFTP - manualFTP)
        let percentDifference = (difference / manualFTP) * 100
        
        // Alert if difference > 5%
        if percentDifference > 5.0 {
            ftpNeedsUpdate = true
            
            if estimatedFTP > manualFTP {
                ftpUpdateSuggestion = "Your fitness may have improved! Recent rides suggest FTP of ~\(Int(estimatedFTP))W (current: \(Int(manualFTP))W). Consider updating."
            } else {
                ftpUpdateSuggestion = "Recent performance suggests FTP of ~\(Int(estimatedFTP))W (current: \(Int(manualFTP))W). This may indicate fatigue or need for FTP test."
            }
        } else {
            ftpNeedsUpdate = false
            ftpUpdateSuggestion = nil
        }
    }
    
    // MARK: - Strava Integration
    
    /// Import recent activities from Strava
    func importStravaActivities() async {
        do {
            // Fetch recent Strava activities via backend (tokens stored server-side)
            let activities = try await apiService.fetchStravaActivities()
            
            // Convert to RidePerformance
            let performances = activities.compactMap { activity -> RidePerformance? in
                guard let avgPower = activity.averageWatts, avgPower > 0 else { return nil }
                
                return RidePerformance(
                    date: activity.startDate,
                    avgPower: avgPower,
                    normalizedPower: avgPower, // Strava doesn't provide NP directly
                    duration: TimeInterval(activity.elapsedTime),
                    tss: calculateTSS(avgPower: avgPower, duration: Double(activity.elapsedTime)),
                    avgSpeed: activity.averageSpeed ?? 0,
                    temperature: nil, // Strava doesn't provide this in activity summary
                    windSpeed: nil,  // Strava doesn't provide this
                    elevationGain: activity.totalElevationGain
                )
            }
            
            // Merge with existing rides (avoid duplicates)
            mergeRidePerformances(performances)
            
            // Auto-estimate FTP
            _ = estimateFTPFromRecentRides()
            
        } catch {
            print("Failed to import Strava activities: \(error)")
        }
    }
    
    // MARK: - Peloton Integration (Placeholder)
    
    /// Import workout data from Peloton
    func importPelotonWorkouts() async {
        // TODO: Implement Peloton API integration
        // Peloton provides: avg power, max power, duration, calories
        // Can be used to estimate FTP and track indoor training
    }
    
    // MARK: - Learning & Calibration
    
    /// Add a completed ride to performance history
    func recordRidePerformance(_ performance: RidePerformance) {
        currentProfile.recentRides.append(performance)
        
        // Keep only last 50 rides
        if currentProfile.recentRides.count > 50 {
            currentProfile.recentRides = Array(currentProfile.recentRides.suffix(50))
        }
        
        saveProfile()
        
        // Update estimated FTP
        _ = estimateFTPFromRecentRides()
    }
    
    /// Learn fatigue coefficient from ride history
    func learnFatigueCoefficient() {
        // Analyze power decay over long rides
        let longRides = currentProfile.recentRides.filter { $0.duration > 7200 }  // > 2 hours
        
        guard longRides.count >= 3 else { return }
        
        // Calculate average power decay rate
        // This would require more detailed power stream data
        // For now, use simplified estimate
        
        let avgFatigueRate = longRides.map { ride in
            // Estimate: assume 10% power decay over 3 hours for average rider
            return ride.avgPower / ride.normalizedPower
        }.reduce(0, +) / Double(longRides.count)
        
        currentProfile.fatigueCoefficient = avgFatigueRate
        saveProfile()
    }
    
    /// Learn heat tolerance from summer rides
    func learnHeatTolerance() {
        // Compare power/speed ratio in hot vs. cool conditions
        let hotRides = currentProfile.recentRides.filter { ($0.temperature ?? 0) > 27 }  // > 80°F
        let coolRides = currentProfile.recentRides.filter { ($0.temperature ?? 0) < 21 }  // < 70°F
        
        guard hotRides.count >= 3 && coolRides.count >= 3 else { return }
        
        let hotEfficiency = hotRides.map { $0.avgSpeed / $0.avgPower }.reduce(0, +) / Double(hotRides.count)
        let coolEfficiency = coolRides.map { $0.avgSpeed / $0.avgPower }.reduce(0, +) / Double(coolRides.count)
        
        // Ratio > 1.0 means performs better in heat
        currentProfile.heatTolerance = coolEfficiency / hotEfficiency
        saveProfile()
    }
    
    // MARK: - Helper Methods
    
    private func findBest20MinutePower(from rides: [RidePerformance]) -> Double? {
        // Find rides with duration >= 20 minutes
        let validRides = rides.filter { $0.duration >= 1200 }  // 20 minutes
        
        guard !validRides.isEmpty else { return nil }
        
        // Use normalized power as proxy for best 20-min effort
        let powers = validRides.map { $0.normalizedPower }
        return powers.max()
    }
    
    private func calculateTSS(avgPower: Double, duration: Double) -> Double {
        guard let ftp = currentProfile.ftp, ftp > 0 else { return 0 }
        
        let intensityFactor = avgPower / ftp
        let hours = duration / 3600.0
        return hours * pow(intensityFactor, 2) * 100
    }
    
    private func mergeRidePerformances(_ newPerformances: [RidePerformance]) {
        for newRide in newPerformances {
            // Check if ride already exists (within 5 minutes)
            let exists = currentProfile.recentRides.contains { existingRide in
                abs(existingRide.date.timeIntervalSince(newRide.date)) < 300
            }
            
            if !exists {
                currentProfile.recentRides.append(newRide)
            }
        }
        
        // Sort by date
        currentProfile.recentRides.sort { $0.date > $1.date }
        
        // Keep only last 50
        if currentProfile.recentRides.count > 50 {
            currentProfile.recentRides = Array(currentProfile.recentRides.prefix(50))
        }
        
        saveProfile()
    }
    
    func saveProfile() {
        persistenceManager.saveRiderParameters(currentProfile)
    }
}
