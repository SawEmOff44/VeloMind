import SwiftUI

struct RideView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Intelligence Alerts (top priority)
                IntelligenceAlertsView(engine: coordinator.intelligenceEngine)
                
                // Primary metrics
                VStack(spacing: 12) {
                    // Power
                    MetricCard(
                        title: "POWER",
                        value: String(format: "%.0f", coordinator.powerEngine.smoothedPower10s),
                        unit: "W",
                        color: .orange,
                        size: .large
                    )
                    
                    HStack(spacing: 12) {
                        // Speed (convert m/s to mph)
                        MetricCard(
                            title: "SPEED",
                            value: String(format: "%.1f", coordinator.bleManager.currentSpeed * 2.23694),
                            unit: "mph",
                            color: .blue
                        )
                        
                        // Cadence
                        MetricCard(
                            title: "CADENCE",
                            value: String(format: "%.0f", coordinator.bleManager.currentCadence),
                            unit: "rpm",
                            color: .green
                        )
                    }
                }
                
                // Secondary metrics
                VStack(spacing: 8) {
                    HStack(spacing: 12) {
                        // Wind (convert m/s to mph)
                        SmallMetricCard(
                            title: "WIND",
                            value: String(format: "%.1f", abs(coordinator.weatherManager.currentWind?.speed ?? 0) * 2.23694),
                            unit: "mph"
                        )
                        
                        // Grade
                        SmallMetricCard(
                            title: "GRADE",
                            value: String(format: "%.1f", (coordinator.routeManager.currentMatchResult?.grade150m ?? 0) * 100),
                            unit: "%"
                        )
                    }
                    
                    HStack(spacing: 15) {
                        // Duration
                        SmallMetricCard(
                            title: "TIME",
                            value: formatDuration(coordinator.rideDuration),
                            unit: ""
                        )
                        
                        // Distance (convert m to miles)
                        SmallMetricCard(
                            title: "DISTANCE",
                            value: String(format: "%.2f", coordinator.rideDistance * 0.000621371),
                            unit: "mi"
                        )
                    }
                }
                
                // Intelligence Metrics
                IntelligenceMetricsView(engine: coordinator.intelligenceEngine)
                
                Spacer()
                
                // Ride controls
                HStack(spacing: 16) {
                    if !coordinator.isRiding {
                        Button(action: {
                            coordinator.startRide()
                        }) {
                            Label("Start Ride", systemImage: "play.circle.fill")
                                .font(.title2)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    } else {
                        Button(action: {
                            coordinator.pauseRide()
                        }) {
                            Label("Pause", systemImage: "pause.circle.fill")
                                .font(.title2)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.yellow)
                                .foregroundColor(.black)
                                .cornerRadius(12)
                        }
                        
                        Button(action: {
                            coordinator.stopRide()
                        }) {
                            Label("Stop", systemImage: "stop.circle.fill")
                                .font(.title2)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding()
        }
        .background(Color.black)
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let hours = Int(duration) / 3600
        let minutes = (Int(duration) % 3600) / 60
        let seconds = Int(duration) % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
}

struct MetricCard: View {
        let title: String
        let value: String
        let unit: String
        let color: Color
        var size: Size = .medium
        
        enum Size {
            case small, medium, large
        }
        
        var body: some View {
            VStack(spacing: 4) {
                Text(title)
                    .font(size == .large ? .subheadline : .caption2)
                    .foregroundColor(.gray)
                    .tracking(1)
                
                HStack(alignment: .lastTextBaseline, spacing: 4) {
                    Text(value)
                        .font(size == .large ? .system(size: 60, weight: .bold) : .system(size: 28, weight: .bold))
                        .foregroundColor(color)
                        .minimumScaleFactor(0.4)
                        .lineLimit(1)
                    
                    Text(unit)
                        .font(size == .large ? .title2 : .callout)
                        .foregroundColor(.gray)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .padding(.horizontal, 8)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
        }
}

struct SmallMetricCard: View {
        let title: String
        let value: String
        let unit: String
        
        var body: some View {
            VStack(spacing: 3) {
                Text(title)
                    .font(.caption2)
                    .foregroundColor(.gray)
                    .tracking(0.5)
                
                HStack(alignment: .lastTextBaseline, spacing: 2) {
                    Text(value)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                    
                    if !unit.isEmpty {
                        Text(unit)
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .padding(.horizontal, 6)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(8)
        }
}

#Preview {
    RideView()
        .environmentObject(RideCoordinator())
}

// MARK: - Intelligence Alert Views

struct IntelligenceAlertsView: View {
    @ObservedObject var engine: IntelligenceEngine
    
    var body: some View {
        VStack(spacing: 8) {
            // Overcooking Alert
            if let alert = engine.overcookingAlert {
                AlertBanner(
                    message: alert.message,
                    severity: alert.severity
                )
            }
            
            // Fatigue Alert
            if let alert = engine.fatigueAlert {
                AlertBanner(
                    message: alert.message,
                    severity: .medium
                )
            }
            
            // Pacing Recommendation
            if let pacing = engine.pacingRecommendation {
                AlertBanner(
                    message: pacing.message,
                    severity: .medium
                )
            }
            
            // Nutrition Alert
            if let nutrition = engine.nutritionAlert {
                AlertBanner(
                    message: nutrition.message,
                    severity: .medium,
                    icon: "fork.knife"
                )
            }
        }
        .padding(.horizontal)
    }
}

struct IntelligenceMetricsView: View {
    @ObservedObject var engine: IntelligenceEngine
    
    var body: some View {
        VStack(spacing: 12) {
            // Environmental Load & Effort Budget
            HStack(spacing: 12) {
                // Environmental Load Index
                VStack(spacing: 4) {
                    Text("CONDITIONS")
                        .font(.caption2)
                        .foregroundColor(.gray)
                        .tracking(0.5)
                    
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Image(systemName: "cloud.sun.fill")
                            .foregroundColor(.orange)
                        Text("+\(Int(engine.environmentalLoadIndex))%")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.orange)
                    }
                    
                    Text("effort cost")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
                
                // Effort Budget
                VStack(spacing: 4) {
                    Text("EFFORT BUDGET")
                        .font(.caption2)
                        .foregroundColor(.gray)
                        .tracking(0.5)
                    
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.3), lineWidth: 6)
                            .frame(width: 50, height: 50)
                        
                        Circle()
                            .trim(from: 0, to: engine.effortBudgetRemaining / 100.0)
                            .stroke(budgetColor(engine.effortBudgetRemaining), lineWidth: 6)
                            .frame(width: 50, height: 50)
                            .rotationEffect(.degrees(-90))
                        
                        Text("\(Int(engine.effortBudgetRemaining))%")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(budgetColor(engine.effortBudgetRemaining))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
            }
            
            // Wind-Aware Speed Prediction
            if let predicted = engine.predictedSpeed {
                HStack {
                    Image(systemName: "wind")
                        .foregroundColor(.cyan)
                    
                    Text("Predicted: ~\(String(format: "%.1f", predicted.speed)) mph (\(predicted.windCondition))")
                        .font(.subheadline)
                        .foregroundColor(.white)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .padding(.horizontal, 12)
                .background(Color.cyan.opacity(0.2))
                .cornerRadius(8)
            }
            
            // Upcoming Climb Preview
            if let climb = engine.upcomingClimb {
                let distanceValue = climb.distance
                let distanceDisplay = String(format: "%.1f", distanceValue)
                let gradeDisplay = String(format: "%.1f", climb.grade)
                let powerRange = "\(Int(climb.recommendedPower.lowerBound))–\(Int(climb.recommendedPower.upperBound))W"
                
                HStack {
                    Image(systemName: "triangle.fill")
                        .rotationEffect(.degrees(45))
                        .foregroundColor(.red)
                    
                    Text("Upcoming: \(distanceDisplay) mi @ \(gradeDisplay)% — rec: \(powerRange)")
                        .font(.subheadline)
                        .foregroundColor(.white)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .padding(.horizontal, 12)
                .background(Color.red.opacity(0.2))
                .cornerRadius(8)
            }
        }
        .padding(.horizontal)
    }
    
    private func budgetColor(_ remaining: Double) -> Color {
        if remaining > 60 {
            return .green
        } else if remaining > 30 {
            return .yellow
        } else {
            return .red
        }
    }
}

struct AlertBanner: View {
    let message: String
    let severity: AlertSeverity
    var icon: String = "exclamationmark.triangle.fill"
    
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(severity.color)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.white)
                .lineLimit(2)
            
            Spacer()
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 14)
        .background(severity.color.opacity(0.25))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(severity.color, lineWidth: 1)
        )
    }
}

