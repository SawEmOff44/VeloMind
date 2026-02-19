import SwiftUI

struct RideView: View {
    @EnvironmentObject var coordinator: RideCoordinator

    private var currentSpeedMps: Double {
        let bleSpeed = coordinator.bleManager.currentSpeed
        if bleSpeed > 0 {
            return bleSpeed
        }
        let gpsSpeed = coordinator.locationManager.currentSpeed
        return gpsSpeed > 0 ? gpsSpeed : 0
    }
    
    var body: some View {
        GeometryReader { proxy in
            let compactLayout = proxy.size.height < 760 || proxy.size.width > proxy.size.height
            ZStack {
                // Background - full screen
                Color.black
                    .edgesIgnoringSafeArea(.all)
                
                LinearGradient(
                    gradient: Gradient(colors: [Color.clear, Color.gray.opacity(0.22)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .edgesIgnoringSafeArea(.all)
                
                VStack(spacing: compactLayout ? 6 : 8) {
                    if coordinator.backgroundTaskManager.isInBackground {
                        BackgroundStatusBanner(manager: coordinator.backgroundTaskManager)
                    }
                    
                    // Fixed nav height so active navigation does not push out other data.
                    NavigationAlertBox()
                        .frame(height: compactLayout ? 62 : 72)
                    
                    SensorFreshnessStrip(
                        speedState: coordinator.bleManager.speedFreshness,
                        cadenceState: coordinator.bleManager.cadenceFreshness
                    )
                    
                    VStack(spacing: compactLayout ? 6 : 8) {
                        MetricCard(
                            title: "POWER",
                            value: String(format: "%.0f", coordinator.powerEngine.smoothedPower10s),
                            unit: "W",
                            color: .orange,
                            size: .large
                        )
                        
                        HStack(spacing: compactLayout ? 6 : 8) {
                            MetricCard(
                                title: "SPEED",
                                value: String(format: "%.1f", currentSpeedMps * 2.23694),
                                unit: "mph",
                                color: .veloCyan
                            )
                            
                            MetricCard(
                                title: "CADENCE",
                                value: String(format: "%.0f", coordinator.bleManager.currentCadence),
                                unit: "rpm",
                                color: .veloGreen
                            )
                        }
                    }
                    
                    VStack(spacing: compactLayout ? 6 : 8) {
                        HStack(spacing: compactLayout ? 6 : 8) {
                            SmallMetricCard(
                                title: "WIND",
                                value: String(format: "%.1f", abs(coordinator.weatherManager.currentWind?.speed ?? 0) * 2.23694),
                                unit: "mph"
                            )
                            
                            SmallMetricCard(
                                title: "GRADE",
                                value: String(format: "%.1f", (coordinator.routeManager.currentMatchResult?.grade150m ?? 0) * 100),
                                unit: "%"
                            )
                        }
                        
                        HStack(spacing: compactLayout ? 6 : 8) {
                            SmallMetricCard(
                                title: "TIME",
                                value: formatDuration(coordinator.rideDuration),
                                unit: ""
                            )
                            
                            SmallMetricCard(
                                title: "DISTANCE",
                                value: String(format: "%.2f", coordinator.rideDistance * 0.000621371),
                                unit: "mi"
                            )
                        }
                    }
                    
                    IntelligenceMetricsView(compact: compactLayout)
                    IntelligenceAlertsView(engine: coordinator.intelligenceEngine)
                    
                    Spacer(minLength: 0)
                    
                    RideControlButtons(coordinator: coordinator)
                }
                .padding(.horizontal, compactLayout ? 8 : 10)
                .padding(.top, coordinator.backgroundTaskManager.isInBackground ? 6 : max(6, proxy.safeAreaInsets.top + 2))
                .padding(.bottom, max(8, proxy.safeAreaInsets.bottom))
            }
            .edgesIgnoringSafeArea(.all)
        }
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

private extension BLEManager.SensorFreshnessState {
    var label: String {
        switch self {
        case .live: return "Live"
        case .stale: return "Stale"
        case .inactive: return "Inactive"
        }
    }

    var color: Color {
        switch self {
        case .live: return .green
        case .stale: return .orange
        case .inactive: return .gray
        }
    }
}

struct SensorFreshnessStrip: View {
    let speedState: BLEManager.SensorFreshnessState
    let cadenceState: BLEManager.SensorFreshnessState

    var body: some View {
        HStack(spacing: 8) {
            SensorFreshnessChip(label: "SPD", state: speedState)
            SensorFreshnessChip(label: "CAD", state: cadenceState)
            Spacer()
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.gray.opacity(0.14))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.gray.opacity(0.25), lineWidth: 1)
                )
        )
    }
}

struct SensorFreshnessChip: View {
    let label: String
    let state: BLEManager.SensorFreshnessState

    var body: some View {
        HStack(spacing: 5) {
            Circle()
                .fill(state.color)
                .frame(width: 7, height: 7)
            Text(label)
                .font(.caption2)
                .foregroundColor(.gray.opacity(0.9))
            Text(state.label)
                .font(.caption2)
                .fontWeight(.semibold)
                .foregroundColor(state.color)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.black.opacity(0.2))
        .cornerRadius(8)
    }
}

// MARK: - Navigation Alert Box

struct NavigationAlertBox: View {
    @EnvironmentObject var coordinator: RideCoordinator
    @State private var pulseAnimation: Bool = false
    @State private var arrowScale: CGFloat = 1.0
    
    var body: some View {
        if let turn = coordinator.routeManager.nextTurn {
            let distanceToTurn = turn.distance - (coordinator.routeManager.currentMatchResult?.distanceAlongRoute ?? 0)
            let distanceMiles = distanceToTurn * 0.000621371
            let distanceDisplay = distanceMiles < 0.1 ? 
                String(format: "%.0f ft", distanceToTurn * 3.28084) :
                String(format: "%.1f mi", distanceMiles)
            
            NavigationAlertContent(
                direction: turn.type,
                distance: distanceDisplay,
                pulseAnimation: $pulseAnimation,
                arrowScale: $arrowScale
            )
        } else if coordinator.routeManager.currentRoute != nil {
            // On route but no turns ahead
            NavigationAlertContent(
                direction: .straight,
                distance: "Continue",
                pulseAnimation: $pulseAnimation,
                arrowScale: $arrowScale
            )
        } else {
            // No route loaded - placeholder
            NoRouteContent()
        }
    }
}

struct NavigationAlertContent: View {
    let direction: TurnType
    let distance: String
    @Binding var pulseAnimation: Bool
    @Binding var arrowScale: CGFloat
    
    var body: some View {
        HStack(spacing: 12) {
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
                    .frame(width: 46, height: 46)
                    .scaleEffect(pulseAnimation ? 1.2 : 1.0)
                    .opacity(pulseAnimation ? 0.3 : 0.8)
                    .animation(
                        Animation.easeInOut(duration: 1.5)
                            .repeatForever(autoreverses: true),
                        value: pulseAnimation
                    )
                
                // Arrow icon
                Image(systemName: direction.icon)
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(arrowColor)
                    .shadow(color: arrowColor.opacity(0.5), radius: 8, x: 0, y: 0)
                    .scaleEffect(arrowScale)
                    .animation(
                        Animation.spring(response: 0.5, dampingFraction: 0.6)
                            .repeatForever(autoreverses: true),
                        value: arrowScale
                    )
            }
            .frame(width: 48)
            
            // Distance Info with animated gradient text
            VStack(alignment: .leading, spacing: 2) {
                Text("IN \(distance)")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.white, arrowColor.opacity(0.8)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 1)
                
                Text(direction.description)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .tracking(0.5)
                    .lineLimit(1)
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
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
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
        .onAppear {
            pulseAnimation = true
            arrowScale = 1.1
        }
    }
    
    private var arrowColor: Color {
        switch direction {
        case .straight: return .cyan
        case .slightLeft, .left, .sharpLeft: return .yellow
        case .slightRight, .right, .sharpRight: return .orange
        }
    }
}

struct NoRouteContent: View {
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "map")
                .font(.system(size: 22))
                .foregroundColor(.gray.opacity(0.5))
            
            VStack(alignment: .leading, spacing: 2) {
                Text("No Route Loaded")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white.opacity(0.7))
                
                Text("Load a route in Settings for navigation")
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
                    .lineLimit(1)
            }
            
            Spacer()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.gray.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
        )
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
            case .info: return .veloTeal
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
        HStack(spacing: 8) {
            if !coordinator.isRiding {
                Button(action: {
                    coordinator.startRide()
                }) {
                    HStack {
                        Image(systemName: "play.circle.fill")
                            .font(.headline)
                        Text("Start Ride")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 11)
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
                            .font(.headline)
                        Text("Pause")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 11)
                    .background(Color.yellow)
                    .foregroundColor(.black)
                    .cornerRadius(14)
                }
                
                Button(action: {
                    coordinator.stopRide()
                }) {
                    HStack {
                        Image(systemName: "stop.circle.fill")
                            .font(.headline)
                        Text("Stop")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 11)
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
        VStack(spacing: 4) {
            Text(title)
                .font(.caption2)
                .foregroundColor(.gray)
                .tracking(1.2)
                .fontWeight(.medium)
            
            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(value)
                    .font(size == .large ? .system(size: 56, weight: .bold, design: .rounded) : .system(size: 30, weight: .bold, design: .rounded))
                    .foregroundColor(color)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                
                Text(unit)
                    .font(size == .large ? .title3 : .footnote)
                    .foregroundColor(.gray.opacity(0.8))
                    .fontWeight(.medium)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, size == .large ? 14 : 10)
        .padding(.horizontal, 10)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
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
        VStack(spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundColor(.gray.opacity(0.9))
                .tracking(1)
                .fontWeight(.medium)
            
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(value)
                    .font(.system(size: 22, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                
                if !unit.isEmpty {
                    Text(unit)
                        .font(.caption2)
                        .foregroundColor(.gray.opacity(0.8))
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .padding(.horizontal, 8)
        .background(
            RoundedRectangle(cornerRadius: 10)
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
        VStack(spacing: 6) {
            if let primaryAlert {
                AlertBanner(
                    message: primaryAlert.message,
                    severity: primaryAlert.severity,
                    icon: primaryAlert.icon
                )
            } else if let routeAnalysis = engine.routeAheadAnalysis {
                CompactRouteAheadCard(analysis: routeAnalysis)
            }
        }
    }
    
    private var primaryAlert: (message: String, severity: AlertSeverity, icon: String)? {
        if let alert = engine.overcookingAlert {
            return (alert.message, alert.severity, "exclamationmark.triangle.fill")
        }
        if let alert = engine.fatigueAlert {
            return (alert.message, .medium, "bolt.heart.fill")
        }
        if let pacing = engine.pacingRecommendation {
            return (pacing.message, .medium, "figure.outdoor.cycle")
        }
        if let nutrition = engine.nutritionAlert {
            return (nutrition.message, .medium, "fork.knife")
        }
        return nil
    }
}

struct CompactRouteAheadCard: View {
    let analysis: RouteAheadAnalysis
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "arrow.forward.circle.fill")
                .foregroundColor(.veloCyan)
            Text("Next \(String(format: "%.1f", analysis.distanceAhead / 1609.34)) mi")
                .font(.subheadline)
                .foregroundColor(.white)
            Text("+\(Int(analysis.elevationGain * 3.28084)) ft")
                .font(.caption)
                .foregroundColor(.orange)
            Text("\(String(format: "%.1f", analysis.avgGrade))%")
                .font(.caption)
                .foregroundColor(.yellow)
            Spacer()
            Text(analysis.difficulty.rawValue)
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(analysis.difficulty.color)
                .cornerRadius(6)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(Color.veloCyan.opacity(0.14))
        .cornerRadius(10)
    }
}

// MARK: - Phase 2 Route Ahead Card

struct RouteAheadCard: View {
    let analysis: RouteAheadAnalysis
    let currentZone: PowerZone
    let targetZone: PowerZone?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Image(systemName: "arrow.forward.circle.fill")
                    .foregroundColor(.veloCyan)
                    .font(.title3)
                Text("Next \(String(format: "%.1f", analysis.distanceAhead / 1609.34)) Miles")
                    .font(.headline)
                    .foregroundColor(.white)
                Spacer()
                Text(analysis.difficulty.rawValue)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(analysis.difficulty.color)
                    .cornerRadius(8)
            }
            
            // Stats Grid
            HStack(spacing: 16) {
                StatPill(icon: "arrow.up", value: "+\(Int(analysis.elevationGain * 3.28084)) ft", color: .orange)
                StatPill(icon: "percent", value: "\(String(format: "%.1f", analysis.avgGrade))% avg", color: .yellow)
                StatPill(icon: "clock", value: formatTime(analysis.estimatedTime), color: .green)
            }
            
            // Power Zones
            HStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Current")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    HStack(spacing: 4) {
                        Circle()
                            .fill(currentZone.color)
                            .frame(width: 8, height: 8)
                        Text(currentZone.rawValue)
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    }
                }
                
                Image(systemName: "arrow.right")
                    .foregroundColor(.gray)
                    .font(.caption)
                
                if let target = targetZone {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Target")
                            .font(.caption2)
                            .foregroundColor(.gray)
                        HStack(spacing: 4) {
                            Circle()
                                .fill(target.color)
                                .frame(width: 8, height: 8)
                            Text(target.rawValue)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                        }
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(Int(analysis.requiredPower.lowerBound))-\(Int(analysis.requiredPower.upperBound))W")
                        .font(.headline)
                        .foregroundColor(.veloCyan)
                    Text("target range")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            }
            
            // Recommendation
            HStack(spacing: 8) {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(.yellow)
                    .font(.caption)
                Text(analysis.recommendation)
                    .font(.subheadline)
                    .foregroundColor(.white)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(10)
            .background(Color.white.opacity(0.1))
            .cornerRadius(8)
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color.veloCyan.opacity(0.2), Color.veloBlue.opacity(0.2)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.veloCyan.opacity(0.3), lineWidth: 1)
        )
    }
    
    private func formatTime(_ seconds: TimeInterval) -> String {
        let mins = Int(seconds / 60)
        if mins < 60 {
            return "\(mins)m"
        } else {
            let hours = mins / 60
            let remainingMins = mins % 60
            return "\(hours)h \(remainingMins)m"
        }
    }
}

struct StatPill: View {
    let icon: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
        }
        .foregroundColor(color)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(color.opacity(0.2))
        .cornerRadius(12)
    }
}

// MARK: - Phase 2 Power Zone Gauge

struct PowerZoneGauge: View {
    let currentZone: PowerZone
    let targetZone: PowerZone?
    let currentPower: Double
    let ftp: Double
    
    private let allZones: [PowerZone] = [.recovery, .endurance, .tempo, .threshold, .vo2max, .anaerobic]
    
    var body: some View {
        VStack(spacing: 4) {
            // Header
            HStack {
                Text("POWER ZONE")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.gray)
                    .tracking(0.5)
                Spacer()
                Text("\(Int(currentPower))W")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                Text("(\(Int((currentPower / ftp) * 100))% FTP)")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.gray)
            }
            
            // Zone Bar
            HStack(spacing: 2) {
                ForEach(allZones, id: \.self) { zone in
                    ZStack {
                        Rectangle()
                            .fill(zone.color.opacity(currentZone == zone ? 1.0 : 0.3))
                            .frame(height: 12)
                        
                        if currentZone == zone {
                            Rectangle()
                                .fill(Color.white.opacity(0.3))
                                .frame(height: 12)
                                .overlay(
                                    Rectangle()
                                        .stroke(Color.white, lineWidth: 1.5)
                                )
                        }
                        
                        if let target = targetZone, target == zone {
                            VStack {
                                Image(systemName: "arrowtriangle.down.fill")
                                    .font(.system(size: 8))
                                    .foregroundColor(.white)
                                    .offset(y: -5)
                                Spacer()
                            }
                        }
                    }
                }
            }
            .cornerRadius(4)
            
            // Labels
            HStack {
                Text(currentZone.rawValue)
                    .font(.system(size: 10, weight: .semibold))
                    .fontWeight(.semibold)
                    .foregroundColor(currentZone.color)
                
                if let target = targetZone, target != currentZone {
                    Image(systemName: "arrow.right")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.gray)
                    Text(target.rawValue)
                        .font(.system(size: 10, weight: .semibold))
                        .fontWeight(.semibold)
                        .foregroundColor(target.color)
                }
                
                Spacer()
                
                Text(currentZone.ftpRange)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.gray)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(Color.gray.opacity(0.12))
        .cornerRadius(8)
    }
}

struct IntelligenceMetricsView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    var compact: Bool = false
    
    var body: some View {
        VStack(spacing: compact ? 5 : 8) {
            // Phase 2: Power Zone Gauge
            PowerZoneGauge(
                currentZone: coordinator.intelligenceEngine.currentPowerZone,
                targetZone: coordinator.intelligenceEngine.targetPowerZone,
                currentPower: coordinator.powerEngine.smoothedPower3s,
                ftp: coordinator.intelligenceEngine.riderParameters.ftp ?? 200
            )
            
            // Environmental Load & Effort Budget
            HStack(spacing: compact ? 6 : 10) {
                // Environmental Load Index
                VStack(spacing: 2) {
                    Text("CONDITIONS")
                        .font(.caption2)
                        .foregroundColor(.gray)
                        .tracking(0.5)
                    
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Image(systemName: "cloud.sun.fill")
                            .foregroundColor(.orange)
                        Text("+\(Int(coordinator.intelligenceEngine.environmentalLoadIndex))%")
                            .font(.system(size: compact ? 17 : 20, weight: .bold))
                            .foregroundColor(.orange)
                    }
                    
                    Text("effort cost")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, compact ? 6 : 9)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
                
                // Effort Budget
                VStack(spacing: 2) {
                    Text("EFFORT BUDGET")
                        .font(.caption2)
                        .foregroundColor(.gray)
                        .tracking(0.5)
                    
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.3), lineWidth: 6)
                            .frame(width: compact ? 40 : 50, height: compact ? 40 : 50)
                        
                        Circle()
                            .trim(from: 0, to: coordinator.intelligenceEngine.effortBudgetRemaining / 100.0)
                            .stroke(budgetColor(coordinator.intelligenceEngine.effortBudgetRemaining), lineWidth: 6)
                            .frame(width: compact ? 40 : 50, height: compact ? 40 : 50)
                            .rotationEffect(.degrees(-90))
                        
                        Text("\(Int(coordinator.intelligenceEngine.effortBudgetRemaining))%")
                            .font(.system(size: compact ? 12 : 14, weight: .bold))
                            .foregroundColor(budgetColor(coordinator.intelligenceEngine.effortBudgetRemaining))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, compact ? 6 : 9)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
            }
            
            if compact {
                if let predicted = coordinator.intelligenceEngine.predictedSpeedValue {
                    HStack {
                        Image(systemName: "wind")
                            .foregroundColor(.cyan)
                        Text("Predicted: ~\(String(format: "%.1f", predicted.speed)) mph (\(predicted.windCondition))")
                            .font(.caption)
                            .foregroundColor(.white)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .padding(.horizontal, 10)
                    .background(Color.cyan.opacity(0.2))
                    .cornerRadius(8)
                } else if let climb = coordinator.intelligenceEngine.upcomingClimb {
                    let distanceDisplay = String(format: "%.1f", climb.distance)
                    let gradeDisplay = String(format: "%.1f", climb.grade)
                    let powerRange = "\(Int(climb.recommendedPower.lowerBound))–\(Int(climb.recommendedPower.upperBound))W"
                    
                    HStack {
                        Image(systemName: "triangle.fill")
                            .rotationEffect(.degrees(45))
                            .foregroundColor(.red)
                        Text("Upcoming: \(distanceDisplay) mi @ \(gradeDisplay)% — rec: \(powerRange)")
                            .font(.caption)
                            .foregroundColor(.white)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .padding(.horizontal, 10)
                    .background(Color.red.opacity(0.2))
                    .cornerRadius(8)
                }
            } else {
                // Wind-Aware Speed Prediction
                if let predicted = coordinator.intelligenceEngine.predictedSpeedValue {
                    HStack {
                        Image(systemName: "wind")
                            .foregroundColor(.cyan)
                        
                        Text("Predicted: ~\(String(format: "%.1f", predicted.speed)) mph (\(predicted.windCondition))")
                            .font(.caption)
                            .foregroundColor(.white)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .padding(.horizontal, 10)
                    .background(Color.cyan.opacity(0.2))
                    .cornerRadius(8)
                }
                
                // Upcoming Climb Preview
                if let climb = coordinator.intelligenceEngine.upcomingClimb {
                    let distanceValue = climb.distance
                    let distanceDisplay = String(format: "%.1f", distanceValue)
                    let gradeDisplay = String(format: "%.1f", climb.grade)
                    let powerRange = "\(Int(climb.recommendedPower.lowerBound))–\(Int(climb.recommendedPower.upperBound))W"
                    
                    HStack {
                        Image(systemName: "triangle.fill")
                            .rotationEffect(.degrees(45))
                            .foregroundColor(.red)
                        
                        Text("Upcoming: \(distanceDisplay) mi @ \(gradeDisplay)% — rec: \(powerRange)")
                            .font(.caption)
                            .foregroundColor(.white)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .padding(.horizontal, 10)
                    .background(Color.red.opacity(0.2))
                    .cornerRadius(8)
                }
            }
        }
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
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(severity.color)
            
            Text(message)
                .font(.caption)
                .foregroundColor(.white)
                .lineLimit(1)
            
            Spacer()
        }
        .padding(.vertical, 7)
        .padding(.horizontal, 10)
        .background(severity.color.opacity(0.25))
        .cornerRadius(9)
        .overlay(
            RoundedRectangle(cornerRadius: 9)
                .stroke(severity.color, lineWidth: 1)
        )
    }
}

// MARK: - Learning Active Indicator

struct LearningActiveIndicator: View {
    @ObservedObject var learningEngine: LearningEngine
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "brain.head.profile")
                .foregroundColor(.cyan)
                .font(.caption)
            
            Text("Using learned parameters")
                .font(.caption2)
                .foregroundColor(.gray)
            
            Spacer()
            
            HStack(spacing: 4) {
                if learningEngine.learnedParameters.cdaLearningStatus == .highConfidence {
                    Text("CdA")
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.cyan.opacity(0.2))
                        .cornerRadius(4)
                }
                
                if learningEngine.learnedParameters.fatigueLearningStatus == .highConfidence {
                    Text("Fatigue")
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.green.opacity(0.2))
                        .cornerRadius(4)
                }
                
                if learningEngine.learnedParameters.heatLearningStatus == .highConfidence {
                    Text("Heat")
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.orange.opacity(0.2))
                        .cornerRadius(4)
                }
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Background Status Banner

struct BackgroundStatusBanner: View {
    @ObservedObject var manager: BackgroundTaskManager
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "moon.fill")
                .foregroundColor(.yellow)
                .font(.caption2)
            
            Text("Background Mode")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.white)
            
            Spacer()
            
            if manager.isLowPowerModeEnabled {
                HStack(spacing: 4) {
                    Image(systemName: "battery.25")
                        .foregroundColor(.orange)
                        .font(.caption2)
                    Text("Low Power")
                        .font(.caption2)
                        .foregroundColor(.orange)
                }
            }
            
            if manager.backgroundTimeRemaining < Double.infinity {
                Text("\(Int(manager.backgroundTimeRemaining / 60))m")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            LinearGradient(
                colors: [Color.yellow.opacity(0.3), Color.orange.opacity(0.3)],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .cornerRadius(8)
    }
}
