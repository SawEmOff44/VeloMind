import Foundation

/// Represents parameters learned from rider's historical data
struct LearnedParameters: Codable {
    // MARK: - Learned Values
    
    /// Learned coefficient of drag area (m²)
    var learnedCdA: Double?
    
    /// Learned fatigue decay rate (λ in exponential model)
    var learnedFatigueRate: Double?
    
    /// Learned heat sensitivity coefficient (% per °F above 65°F)
    var learnedHeatCoefficient: Double?
    
    /// Estimated FTP based on sustained efforts
    var estimatedFTP: Double?
    
    // MARK: - Confidence Metrics
    
    /// Number of rides used for CdA learning
    var cdaRideCount: Int = 0
    
    /// Root mean square error for CdA predictions
    var cdaConfidence: Double = 0.0  // 0-100%
    
    /// Number of long rides used for fatigue learning
    var fatigueRideCount: Int = 0
    
    /// Confidence in fatigue model
    var fatigueConfidence: Double = 0.0  // 0-100%
    
    /// Number of rides across temperature ranges
    var heatRideCount: Int = 0
    
    /// Confidence in heat model
    var heatConfidence: Double = 0.0  // 0-100%
    
    /// Number of FTP estimation samples
    var ftpSampleCount: Int = 0
    
    /// Last update timestamp
    var lastUpdated: Date = Date()
    
    // MARK: - Learning Status
    
    var cdaLearningStatus: LearningStatus {
        if cdaRideCount < 5 {
            return .collecting
        } else if cdaConfidence < 50 {
            return .lowConfidence
        } else if cdaConfidence < 80 {
            return .mediumConfidence
        } else {
            return .highConfidence
        }
    }
    
    var fatigueLearningStatus: LearningStatus {
        if fatigueRideCount < 10 {
            return .collecting
        } else if fatigueConfidence < 50 {
            return .lowConfidence
        } else if fatigueConfidence < 80 {
            return .mediumConfidence
        } else {
            return .highConfidence
        }
    }
    
    var heatLearningStatus: LearningStatus {
        if heatRideCount < 8 {
            return .collecting
        } else if heatConfidence < 50 {
            return .lowConfidence
        } else if heatConfidence < 80 {
            return .mediumConfidence
        } else {
            return .highConfidence
        }
    }
    
    enum LearningStatus: String {
        case collecting = "Learning in progress..."
        case lowConfidence = "Low confidence"
        case mediumConfidence = "Medium confidence"
        case highConfidence = "High confidence"
        
        var stars: Int {
            switch self {
            case .collecting: return 1
            case .lowConfidence: return 2
            case .mediumConfidence: return 3
            case .highConfidence: return 5
            }
        }
    }
    
    // MARK: - Helper Methods
    
    /// Returns true if any parameter has high confidence
    var hasUsefulLearning: Bool {
        return cdaLearningStatus == .highConfidence ||
               fatigueLearningStatus == .highConfidence ||
               heatLearningStatus == .highConfidence
    }
    
    /// Returns overall learning progress (0-100%)
    var overallProgress: Double {
        let cdaProgress = min(Double(cdaRideCount) / 5.0, 1.0)
        let fatigueProgress = min(Double(fatigueRideCount) / 10.0, 1.0)
        let heatProgress = min(Double(heatRideCount) / 8.0, 1.0)
        return (cdaProgress + fatigueProgress + heatProgress) / 3.0 * 100.0
    }
}
