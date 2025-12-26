import SwiftUI

struct RideView: View {
    @EnvironmentObject var coordinator: RideCoordinator
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
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
