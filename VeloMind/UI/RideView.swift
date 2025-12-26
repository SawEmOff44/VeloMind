import SwiftUI

struct RideView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    
    var body: some View {
        ZStack {
            // Background - full screen
            Color.black
                .edgesIgnoringSafeArea(.all)
            
            LinearGradient(
                gradient: Gradient(colors: [Color.clear, Color.gray.opacity(0.3)]),
                startPoint: .top,
                endPoint: .bottom
            )
            .edgesIgnoringSafeArea(.all)
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 8) {
                    // Navigation Box - Full width at top
                    NavigationAlertBox()
                        .frame(height: 80)
                    
                    // Intelligence Alerts
                    IntelligenceAlertsView(engine: coordinator.intelligenceEngine)
                        .padding(.horizontal, 8)
                    
                    // Primary metrics
                    VStack(spacing: 8) {
                        // Power - Large display
                        MetricCard(
                            title: "POWER",
                            value: String(format: "%.0f", coordinator.powerEngine.smoothedPower10s),
                            unit: "W",
                            color: .orange,
                            size: .large
                        )
                        
                        HStack(spacing: 10) {
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
                    .padding(.horizontal, 12)
                    
                    // Secondary metrics
                    VStack(spacing: 8) {
                        HStack(spacing: 10) {
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
                        
                        HStack(spacing: 10) {
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
                    .padding(.horizontal, 12)
                    
                    // Intelligence Metrics
                    IntelligenceMetricsView(engine: coordinator.intelligenceEngine)
                        .padding(.horizontal, 12)
                    
                    // Message Dialog Box - Full width
                    MessageDialogBox()
                        .padding(.top, 4)
                    
                    // Ride controls
                    RideControlButtons(coordinator: coordinator)
                        .padding(.horizontal, 12)
                        .padding(.bottom, 12)
                }
                .padding(.vertical, 0)
            }
        }
        .edgesIgnoringSafeArea(.all)
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

// MARK: - Navigation Alert Box

struct NavigationAlertBox: View {
    @State private var direction: String = "straight"  // left, straight, right
    @State private var distance: String = "0.2 mi"
    
    var body: some View {
        HStack(spacing: 16) {
            // Direction Arrow
            Image(systemName: directionIcon)
                .font(.system(size: 42, weight: .bold))
                .foregroundColor(.blue)
                .frame(width: 65)
            
            // Distance Info
            VStack(alignment: .leading, spacing: 4) {
                Text("IN \(distance)")
                    .font(.headline)
                    .foregroundColor(.white)
                Text(directionText)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.2))
                .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
        )
        .padding(.horizontal, 12)
    }
    
    private var directionIcon: String {
        switch direction {
        case "left": return "arrow.turn.up.left"
        case "right": return "arrow.turn.up.right"
        default: return "arrow.up"
        }
    }
    
    private var directionText: String {
        switch direction {
        case "left": return "Turn Left"
        case "right": return "Turn Right"
        default: return "Continue Straight"
        }
    }
}

// MARK: - Message Dialog Box

struct MessageDialogBox: View {
    @State private var message: String = ""
    @State private var showMessage: Bool = false
    
    var body: some View {
        if showMessage && !message.isEmpty {
            HStack(spacing: 12) {
                Image(systemName: "info.circle.fill")
                    .foregroundColor(.blue)
                    .font(.title3)
                
                Text(message)
                    .font(.body)
                    .foregroundColor(.white)
                    .lineLimit(2)
                
                Spacer()
                
                Button(action: {
                    withAnimation {
                        showMessage = false
                    }
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.blue.opacity(0.2))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.blue.opacity(0.5), lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
            )
            .padding(.horizontal, 12)
            .transition(.move(edge: .top).combined(with: .opacity))
        } else {
            EmptyView()
        }
    }
}

// MARK: - Ride Control Buttons

struct RideControlButtons: View {
    @ObservedObject var coordinator: RideCoordinator
    
    var body: some View {
        HStack(spacing: 14) {
            if !coordinator.isRiding {
                Button(action: {
                    coordinator.startRide()
                }) {
                    HStack {
                        Image(systemName: "play.circle.fill")
                            .font(.title2)
                        Text("Start Ride")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [Color.green, Color.green.opacity(0.8)]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(14)
                    .shadow(color: Color.green.opacity(0.3), radius: 8, x: 0, y: 4)
                }
            } else {
                Button(action: {
                    coordinator.pauseRide()
                }) {
                    HStack {
                        Image(systemName: "pause.circle.fill")
                            .font(.title3)
                        Text("Pause")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.yellow)
                    .foregroundColor(.black)
                    .cornerRadius(14)
                }
                
                Button(action: {
                    coordinator.stopRide()
                }) {
                    HStack {
                        Image(systemName: "stop.circle.fill")
                            .font(.title3)
                        Text("Stop")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [Color.red, Color.red.opacity(0.8)]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(14)
                    .shadow(color: Color.red.opacity(0.3), radius: 8, x: 0, y: 4)
                }
            }
        }
    }
}

// MARK: - Format Duration Helper

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
        VStack(spacing: 8) {
            Text(title)
                .font(size == .large ? .subheadline : .caption)
                .foregroundColor(.gray)
                .tracking(1.5)
                .fontWeight(.medium)
            
            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(value)
                    .font(size == .large ? .system(size: 72, weight: .bold, design: .rounded) : .system(size: 38, weight: .bold, design: .rounded))
                    .foregroundColor(color)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                
                Text(unit)
                    .font(size == .large ? .title : .title3)
                    .foregroundColor(.gray.opacity(0.8))
                    .fontWeight(.medium)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, size == .large ? 24 : 18)
        .padding(.horizontal, 14)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.gray.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(color.opacity(0.3), lineWidth: 1)
                )
        )
        .shadow(color: color.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct SmallMetricCard: View {
    let title: String
    let value: String
    let unit: String
    
    var body: some View {
        VStack(spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray.opacity(0.9))
                .tracking(1)
                .fontWeight(.medium)
            
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(value)
                    .font(.system(size: 26, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                
                if !unit.isEmpty {
                    Text(unit)
                        .font(.subheadline)
                        .foregroundColor(.gray.opacity(0.8))
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .padding(.horizontal, 10)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.12))
        )
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
            if let predicted = engine.predictedSpeedValue {
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

