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
                        .padding(.top, 50)
                    
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
    @State private var pulseAnimation: Bool = false
    @State private var arrowScale: CGFloat = 1.0
    
    var body: some View {
        HStack(spacing: 20) {
            // Direction Arrow with animated glow
            ZStack {
                // Glow effect
                Circle()
                    .fill(
                        RadialGradient(
                            gradient: Gradient(colors: [arrowColor.opacity(0.6), Color.clear]),
                            center: .center,
                            startRadius: 10,
                            endRadius: 40
                        )
                    )
                    .frame(width: 80, height: 80)
                    .scaleEffect(pulseAnimation ? 1.2 : 1.0)
                    .opacity(pulseAnimation ? 0.3 : 0.8)
                    .animation(
                        Animation.easeInOut(duration: 1.5)
                            .repeatForever(autoreverses: true),
                        value: pulseAnimation
                    )
                
                // Arrow icon
                Image(systemName: directionIcon)
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(arrowColor)
                    .shadow(color: arrowColor.opacity(0.5), radius: 8, x: 0, y: 0)
                    .scaleEffect(arrowScale)
                    .animation(
                        Animation.spring(response: 0.5, dampingFraction: 0.6)
                            .repeatForever(autoreverses: true),
                        value: arrowScale
                    )
            }
            .frame(width: 80)
            
            // Distance Info with animated gradient text
            VStack(alignment: .leading, spacing: 6) {
                Text("IN \(distance)")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.white, arrowColor.opacity(0.8)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 1)
                
                Text(directionText)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .tracking(0.5)
            }
            
            Spacer()
            
            // Animated chevron indicator
            Image(systemName: "chevron.right")
                .font(.title2)
                .foregroundColor(arrowColor.opacity(0.6))
                .offset(x: pulseAnimation ? 4 : 0)
                .animation(
                    Animation.easeInOut(duration: 0.8)
                        .repeatForever(autoreverses: true),
                    value: pulseAnimation
                )
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(
            ZStack {
                // Gradient background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color.gray.opacity(0.3),
                        Color.gray.opacity(0.15)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                
                // Border gradient
                RoundedRectangle(cornerRadius: 16)
                    .stroke(
                        LinearGradient(
                            colors: [arrowColor.opacity(0.6), arrowColor.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 2
                    )
            }
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: arrowColor.opacity(0.3), radius: 12, x: 0, y: 4)
        )
        .padding(.horizontal, 12)
        .onAppear {
            pulseAnimation = true
            arrowScale = 1.1
        }
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
    
    private var arrowColor: Color {
        switch direction {
        case "left": return .yellow
        case "right": return .orange
        default: return .cyan
        }
    }
}

// MARK: - Message Dialog Box

struct MessageDialogBox: View {
    @State private var message: String = ""
    @State private var messageType: MessageType = .info
    
    enum MessageType {
        case info, warning, success, error
        
        var color: Color {
            switch self {
            case .info: return .blue
            case .warning: return .orange
            case .success: return .green
            case .error: return .red
            }
        }
        
        var icon: String {
            switch self {
            case .info: return "info.circle.fill"
            case .warning: return "exclamationmark.triangle.fill"
            case .success: return "checkmark.circle.fill"
            case .error: return "xmark.octagon.fill"
            }
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: messageType.icon)
                .foregroundColor(message.isEmpty ? .gray.opacity(0.3) : messageType.color)
                .font(.title2)
            
            if message.isEmpty {
                Text("No active messages")
                    .font(.body)
                    .foregroundColor(.gray.opacity(0.5))
                    .italic()
            } else {
                Text(message)
                    .font(.body)
                    .foregroundColor(.white)
                    .lineLimit(2)
            }
            
            Spacer()
            
            if !message.isEmpty {
                Button(action: {
                    withAnimation(.spring()) {
                        message = ""
                    }
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray.opacity(0.7))
                        .font(.title3)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity)
        .background(
            ZStack {
                // Base background
                RoundedRectangle(cornerRadius: 12)
                    .fill(message.isEmpty ? Color.gray.opacity(0.1) : messageType.color.opacity(0.15))
                
                // Border with gradient
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        LinearGradient(
                            colors: message.isEmpty ? 
                                [Color.gray.opacity(0.3), Color.gray.opacity(0.1)] :
                                [messageType.color.opacity(0.6), messageType.color.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1.5
                    )
            }
            .shadow(color: message.isEmpty ? .clear : messageType.color.opacity(0.2), radius: 6, x: 0, y: 3)
        )
        .padding(.horizontal, 12)
        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: message)
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

