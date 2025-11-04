//
//  CrossValidationView.swift
//  Finedust
//
//  View for displaying triple verification results
//

import SwiftUI

struct CrossValidationView: View {
    let stationPM25: Double?
    let cameraPM25: Double?
    let satellitePM25: Double?
    let finalPM25: Double
    let confidence: Double
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Triple Verification")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 16) {
                if let stationPM25 = stationPM25 {
                    VerificationRow(
                        tier: "Tier 1",
                        source: "Station IDW",
                        value: stationPM25,
                        icon: "antenna.radiowaves.left.and.right",
                        color: .blue
                    )
                }
                
                if let cameraPM25 = cameraPM25 {
                    VerificationRow(
                        tier: "Tier 2",
                        source: "Camera CNN-LSTM",
                        value: cameraPM25,
                        icon: "camera.fill",
                        color: .purple
                    )
                }
                
                if let satellitePM25 = satellitePM25 {
                    VerificationRow(
                        tier: "Tier 3",
                        source: "Satellite AOD",
                        value: satellitePM25,
                        icon: "globe.americas.fill",
                        color: .green
                    )
                }
            }
            .padding()
            .background(Color.white.opacity(0.05))
            .cornerRadius(16)
            
            Rectangle()
                .fill(Color.white.opacity(0.3))
                .frame(height: 1)
            
            VStack(spacing: 12) {
                Text("Bayesian Fusion Result")
                    .font(.headline)
                    .foregroundColor(.white.opacity(0.7))
                
                HStack(spacing: 8) {
                    Text("\(Int(finalPM25))")
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundColor(aqiColor(for: finalPM25))
                    
                    Text("μg/m³")
                        .font(.title3)
                        .foregroundColor(.white.opacity(0.7))
                }
                
                HStack(spacing: 8) {
                    Image(systemName: confidenceIcon(for: confidence))
                        .foregroundColor(confidenceColor(for: confidence))
                    
                    Text("Confidence: \(String(format: "%.0f%%", confidence * 100))")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                }
                
                Text(aqiLevel(for: finalPM25))
                    .font(.headline)
                    .foregroundColor(aqiColor(for: finalPM25))
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                    .background(aqiColor(for: finalPM25).opacity(0.2))
                    .cornerRadius(20)
            }
            .padding()
            .background(Color.white.opacity(0.08))
            .cornerRadius(16)
        }
        .padding()
        .background(Color.black.opacity(0.3))
        .cornerRadius(24)
    }
    
    private func aqiColor(for pm25: Double) -> Color {
        switch pm25 {
        case 0...12: return .green
        case 12...35: return .yellow
        case 35...55: return .orange
        case 55...150: return .red
        default: return .purple
        }
    }
    
    private func aqiLevel(for pm25: Double) -> String {
        switch pm25 {
        case 0...12: return "Good"
        case 12...35: return "Moderate"
        case 35...55: return "Unhealthy for Sensitive"
        case 55...150: return "Unhealthy"
        default: return "Very Unhealthy"
        }
    }
    
    private func confidenceIcon(for confidence: Double) -> String {
        if confidence >= 0.9 { return "checkmark.seal.fill" }
        else if confidence >= 0.7 { return "checkmark.circle.fill" }
        else { return "exclamationmark.triangle.fill" }
    }
    
    private func confidenceColor(for confidence: Double) -> Color {
        if confidence >= 0.9 { return .green }
        else if confidence >= 0.7 { return .yellow }
        else { return .orange }
    }
}

struct VerificationRow: View {
    let tier: String
    let source: String
    let value: Double
    let icon: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(tier)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.5))
                
                Text(source)
                    .font(.subheadline)
                    .foregroundColor(.white)
            }
            
            Spacer()
            
            HStack(spacing: 4) {
                Text("\(Int(value))")
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(color)
                
                Text("μg/m³")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        CrossValidationView(
            stationPM25: 28.5,
            cameraPM25: 32.1,
            satellitePM25: 29.8,
            finalPM25: 30.2,
            confidence: 0.92
        )
        .padding()
    }
}
