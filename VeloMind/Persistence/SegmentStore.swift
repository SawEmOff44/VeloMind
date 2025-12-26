import Foundation

/// Handles persistence of ride segments and learned parameters
actor SegmentStore {
    static let shared = SegmentStore()
    
    private let ridesKey = "learning_rides"
    private let parametersKey = "learned_parameters"
    private let maxStoredRides = 100
    
    private init() {}
    
    // MARK: - Ride Storage
    
    func saveRide(_ ride: LearningRide) async {
        var rides = await loadAllRides()
        rides.append(ride)
        
        // Keep only most recent rides
        if rides.count > maxStoredRides {
            rides = Array(rides.suffix(maxStoredRides))
        }
        
        await saveRides(rides)
    }
    
    func loadRecentRides(limit: Int = 100) async -> [LearningRide] {
        let rides = await loadAllRides()
        return Array(rides.suffix(min(limit, rides.count)))
    }
    
    func loadAllRides() async -> [LearningRide] {
        guard let data = UserDefaults.standard.data(forKey: ridesKey) else {
            return []
        }
        
        do {
            let rides = try JSONDecoder().decode([LearningRide].self, from: data)
            return rides
        } catch {
            print("Failed to decode rides: \(error)")
            return []
        }
    }
    
    private func saveRides(_ rides: [LearningRide]) async {
        do {
            let data = try JSONEncoder().encode(rides)
            UserDefaults.standard.set(data, forKey: ridesKey)
        } catch {
            print("Failed to encode rides: \(error)")
        }
    }
    
    func clearRides() async {
        UserDefaults.standard.removeObject(forKey: ridesKey)
    }
    
    // MARK: - Parameters Storage
    
    func saveLearnedParameters(_ parameters: LearnedParameters) async {
        do {
            let data = try JSONEncoder().encode(parameters)
            UserDefaults.standard.set(data, forKey: parametersKey)
        } catch {
            print("Failed to encode learned parameters: \(error)")
        }
    }
    
    func loadLearnedParameters() async -> LearnedParameters? {
        guard let data = UserDefaults.standard.data(forKey: parametersKey) else {
            return nil
        }
        
        do {
            let parameters = try JSONDecoder().decode(LearnedParameters.self, from: data)
            return parameters
        } catch {
            print("Failed to decode learned parameters: \(error)")
            return nil
        }
    }
    
    func clearLearnedParameters() async {
        UserDefaults.standard.removeObject(forKey: parametersKey)
    }
    
    // MARK: - Statistics
    
    func getRideCount() async -> Int {
        let rides = await loadAllRides()
        return rides.count
    }
    
    func getTotalDistance() async -> Double {
        let rides = await loadAllRides()
        return rides.map { $0.totalDistance }.reduce(0, +)
    }
    
    func getTotalDuration() async -> TimeInterval {
        let rides = await loadAllRides()
        return rides.map { $0.duration }.reduce(0, +)
    }
    
    // MARK: - Data Export
    
    func exportRidesAsJSON() async -> String? {
        let rides = await loadAllRides()
        
        do {
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(rides)
            return String(data: data, encoding: .utf8)
        } catch {
            print("Failed to export rides: \(error)")
            return nil
        }
    }
}
