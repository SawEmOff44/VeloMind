import SwiftUI
import Charts

/// Displays 5-minute power zone history chart
struct PowerHistoryChart: View {
    let history: [PowerZoneHistoryPoint]
    let targetPower: ClosedRange<Double>?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .foregroundColor(.veloCyan)
                    .font(.caption)
                Text("Power History (5min)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                Spacer()
            }
            
            if history.isEmpty {
                Text("No data yet")
                    .font(.caption2)
                    .foregroundColor(.gray)
                    .frame(height: 100)
                    .frame(maxWidth: .infinity)
            } else {
                Chart {
                    // Target power range (if available)
                    if let target = targetPower {
                        RectangleMark(
                            xStart: .value("Start", history.first?.timestamp ?? Date()),
                            xEnd: .value("End", history.last?.timestamp ?? Date()),
                            yStart: .value("Min", target.lowerBound),
                            yEnd: .value("Max", target.upperBound)
                        )
                        .foregroundStyle(Color.veloCyan.opacity(0.2))
                        .annotation(position: .top) {
                            Text("Target")
                                .font(.caption2)
                                .foregroundColor(.veloCyan)
                        }
                    }
                    
                    // Actual power line
                    ForEach(history) { point in
                        LineMark(
                            x: .value("Time", point.timestamp),
                            y: .value("Power", point.power)
                        )
                        .foregroundStyle(point.zone.color)
                        .lineStyle(StrokeStyle(lineWidth: 2))
                        
                        // Zone indicator points
                        PointMark(
                            x: .value("Time", point.timestamp),
                            y: .value("Power", point.power)
                        )
                        .foregroundStyle(point.zone.color)
                        .symbolSize(30)
                    }
                }
                .chartXAxis {
                    AxisMarks(values: .stride(by: 60)) { _ in
                        AxisValueLabel(format: .dateTime.minute())
                            .foregroundStyle(.gray)
                    }
                }
                .chartYAxis {
                    AxisMarks { value in
                        AxisValueLabel()
                            .foregroundStyle(.gray)
                    }
                }
                .frame(height: 120)
                .chartPlotStyle { plotArea in
                    plotArea.background(Color.black.opacity(0.3))
                }
            }
            
            // Zone legend
            HStack(spacing: 8) {
                ForEach([PowerZone.recovery, .endurance, .tempo, .threshold, .vo2max, .anaerobic], id: \.self) { zone in
                    HStack(spacing: 2) {
                        Circle()
                            .fill(zone.color)
                            .frame(width: 6, height: 6)
                        Text(zone.rawValue.prefix(3))
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.15))
        .cornerRadius(12)
    }
}

/// Compact actual vs. required power comparison
struct PowerComparison: View {
    let currentPower: Double
    let requiredPower: ClosedRange<Double>?
    let ftp: Double?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "gauge.medium")
                    .foregroundColor(.orange)
                    .font(.caption)
                Text("Power Status")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                Spacer()
            }
            
            if let required = requiredPower, let ftp = ftp {
                HStack(spacing: 16) {
                    // Current
                    VStack(alignment: .leading, spacing: 2) {
                        Text("CURRENT")
                            .font(.caption2)
                            .foregroundColor(.gray)
                        Text("\(Int(currentPower))W")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        Text("\(Int((currentPower/ftp)*100))% FTP")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                    
                    // Comparison arrow
                    VStack {
                        if currentPower < required.lowerBound {
                            Image(systemName: "arrow.up")
                                .foregroundColor(.red)
                            Text("↑\(Int(required.lowerBound - currentPower))W")
                                .font(.caption)
                                .foregroundColor(.red)
                        } else if currentPower > required.upperBound {
                            Image(systemName: "arrow.down")
                                .foregroundColor(.green)
                            Text("↓\(Int(currentPower - required.upperBound))W")
                                .font(.caption)
                                .foregroundColor(.green)
                        } else {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Perfect")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                    }
                    
                    // Required
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("REQUIRED")
                            .font(.caption2)
                            .foregroundColor(.gray)
                        Text("\(Int(required.lowerBound))-\(Int(required.upperBound))W")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.veloCyan)
                        Text("\(Int((((required.lowerBound+required.upperBound)/2)/ftp)*100))% FTP")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }
            } else {
                Text("Route data not available")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.15))
        .cornerRadius(12)
    }
}
