//
//  ResultsDisplayView.swift
//  AirLens
//
//  Display PM2.5 prediction results
//

import SwiftUI
import Charts

struct ResultsDisplayView: View {
    let prediction: PM25Prediction
    var onClose: () -> Void
    
    private var aqiLevel: AQILevel {
        AQILevel.from(pm25: prediction.pm25)
    }
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.6)
                .ignoresSafeArea()
                .onTapGesture { onClose() }
            
            VStack(spacing: 20) {
                // Close Button
                HStack {
                    Spacer()
                    Button(action: onClose) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title)
                            .foregroundColor(.gray)
                    }
                }
                .padding(.horizontal)
                
                // PM2.5 Value Display
                VStack(spacing: 8) {
                    Text("\(Int(prediction.pm25))")
                        .font(.system(size: 72, weight: .bold))
                        .foregroundColor(colorForAQI())
                    
                    Text("PM2.5 (μg/m³)")
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    Text(aqiLevel.name)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(colorForAQI())
                        .padding(.horizontal, 20)
                        .padding(.vertical, 8)
                        .background(colorForAQI().opacity(0.2))
                        .cornerRadius(20)
                }
                .padding(.vertical, 20)
                
                // Confidence and Uncertainty
                HStack(spacing: 40) {
                    VStack {
                        Text("Confidence")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Text("\(Int(prediction.confidence * 100))%")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                    
                    VStack {
                        Text("Uncertainty")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Text("±\(String(format: "%.1f", prediction.uncertainty))")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                }
                
                // Source Breakdown
                VStack(alignment: .leading, spacing: 12) {
                    Text("Data Sources")
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    ForEach(["station", "camera", "satellite"], id: \.self) { source in
                        let value = valueForSource(source)
                        if value > 0 {
                            HStack {
                                Image(systemName: iconForSource(source))
                                    .foregroundColor(.blue)
                                Text(source.capitalized)
                                    .foregroundColor(.white)
                                Spacer()
                                Text("\(Int(value)) μg/m³")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                }
                .padding()
                .background(Color.white.opacity(0.1))
                .cornerRadius(12)
                
                Spacer()
            }
            .padding()
            .frame(maxWidth: 400)
            .background(Color.black)
            .cornerRadius(20)
            .shadow(radius: 20)
        }
    }
    
    private func valueForSource(_ source: String) -> Double {
        switch source {
        case "station": return prediction.breakdown.station
        case "camera": return prediction.breakdown.camera
        case "satellite": return prediction.breakdown.satellite
        default: return 0
        }
    }
    
    private func iconForSource(_ source: String) -> String {
        switch source {
        case "station": return "antenna.radiowaves.left.and.right"
        case "camera": return "camera.fill"
        case "satellite": return "globe"
        default: return "questionmark"
        }
    }
    
    private func colorForAQI() -> Color {
        switch aqiLevel {
        case .good: return Color(hex: "#30d158")
        case .moderate: return Color(hex: "#ffd60a")
        case .unhealthyForSensitive: return Color(hex: "#ff9f0a")
        case .unhealthy: return Color(hex: "#ff453a")
        case .veryUnhealthy: return Color(hex: "#bf5af2")
        case .hazardous: return Color(hex: "#8b0000")
        }
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: UInt64
        switch hex.count {
        case 6:
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: 1
        )
    }
}

#Preview {
    ResultsDisplayView(
        prediction: PM25Prediction(
            pm25: 45.5,
            confidence: 0.87,
            uncertainty: 2.3,
            breakdown: PredictionBreakdown(station: 43.2, camera: 45.8, satellite: 47.5),
            sources: ["station", "camera", "satellite"]
        ),
        onClose: {}
    )
}
