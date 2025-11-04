import SwiftUI
import Combine

// MARK: - Main Progress View

struct MeasurementProgressView: View {
    @ObservedObject var stateManager: MeasurementStateManager
    @State private var showDetailedLog = false
    
    var body: some View {
        VStack(spacing: 20) {
            // Overall Progress Card
            OverallProgressCard(
                step: stateManager.currentStep,
                progress: stateManager.overallProgress,
                message: stateManager.statusMessage
            )
            
            // Step Progress View
            StepProgressView(currentStep: stateManager.currentStep)
            
            // Capture Progress (only during capture)
            if stateManager.currentStep == .capturing {
                CaptureProgressView(
                    progress: stateManager.captureProgress,
                    frameCount: stateManager.frameCount
                )
            }
            
            // Triple Verification Cards
            if let tier1 = stateManager.tier1Result {
                TierResultCard(result: tier1)
            }
            
            if let tier2 = stateManager.tier2Result {
                TierResultCard(result: tier2)
            }
            
            if let tier3 = stateManager.tier3Result {
                TierResultCard(result: tier3)
            }
            
            // Data Agreement
            if stateManager.tier1Result != nil && stateManager.tier2Result != nil && stateManager.tier3Result != nil {
                AgreementView(stateManager: stateManager)
            }
            
            // Final Result
            if stateManager.currentStep == .complete {
                FinalResultCard(stateManager: stateManager)
            }
            
            // Detailed Log (Expandable)
            DisclosureGroup("📋 Detailed Log (\(stateManager.detailedLog.count))", isExpanded: $showDetailedLog) {
                DetailedLogView(logs: stateManager.detailedLog)
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .padding()
    }
}

// MARK: - Overall Progress Card

struct OverallProgressCard: View {
    let step: MeasurementStep
    let progress: Double
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(step.color.opacity(0.2))
                        .frame(width: 60, height: 60)
                    
                    if step == .idle {
                        Image(systemName: step.icon)
                            .font(.system(size: 24))
                            .foregroundColor(step.color)
                    } else {
                        Image(systemName: step.icon)
                            .font(.system(size: 24))
                            .foregroundColor(step.color)
                            .scaleEffect(1.2)
                            .animation(.easeInOut(duration: 1).repeatForever(), value: step)
                    }
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text(step.title)
                        .font(.headline)
                        .fontWeight(.bold)
                    
                    Text(message)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                Spacer()
            }
            
            // Progress Bar
            ProgressView(value: progress)
                .progressViewStyle(LinearProgressViewStyle(tint: step.color))
            
            HStack {
                Text("Progress")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text("\(Int(progress * 100))%")
                    .font(.caption)
                    .fontWeight(.semibold)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        )
    }
}

// MARK: - Step Progress View

struct StepProgressView: View {
    let currentStep: MeasurementStep
    
    var body: some View {
        VStack(spacing: 12) {
            ForEach(MeasurementStep.allCases, id: \.self) { step in
                HStack(spacing: 12) {
                    // Status Icon
                    ZStack {
                        Circle()
                            .fill(getStepColor(step).opacity(0.2))
                            .frame(width: 40, height: 40)
                        
                        if step.rawValue < currentStep.rawValue {
                            Image(systemName: "checkmark")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(getStepColor(step))
                        } else if step == currentStep {
                            ProgressView()
                                .tint(getStepColor(step))
                        } else {
                            Circle()
                                .fill(getStepColor(step).opacity(0.3))
                                .frame(width: 8, height: 8)
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Step \(step.rawValue): \(step.title)")
                            .font(.caption)
                            .fontWeight(.semibold)
                        
                        Text(step.description)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                    
                    Spacer()
                    
                    // Chevron for complete steps
                    if step.rawValue < currentStep.rawValue {
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 8)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        )
    }
    
    private func getStepColor(_ step: MeasurementStep) -> Color {
        if step.rawValue < currentStep.rawValue {
            return .green
        } else if step == currentStep {
            return step.color
        } else {
            return .gray
        }
    }
}

// MARK: - Capture Progress View

struct CaptureProgressView: View {
    let progress: Float
    let frameCount: Int
    
    var body: some View {
        VStack(spacing: 16) {
            VStack(spacing: 12) {
                HStack {
                    Text("Frame Capture")
                        .font(.headline)
                    
                    Spacer()
                    
                    Text("\(frameCount)/30")
                        .font(.headline)
                        .foregroundColor(.blue)
                }
                
                ProgressView(value: Double(progress))
                    .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                
                // Frame Grid
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 6), spacing: 4) {
                    ForEach(0..<30, id: \.self) { index in
                        RoundedRectangle(cornerRadius: 4)
                            .fill(index < frameCount ? Color.blue : Color.gray.opacity(0.2))
                            .aspectRatio(1, contentMode: .fit)
                            .animation(.easeInOut(duration: 0.1), value: frameCount)
                    }
                }
            }
            
            Text("Capturing \(frameCount) of 30 frames at 30 FPS")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        )
    }
}

// MARK: - Tier Result Card

struct TierResultCard: View {
    let result: TierResult
    
    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                // Tier Number
                Text("T\(result.tier)")
                    .font(.system(size: 18, weight: .bold, design: .monospaced))
                    .frame(width: 40, height: 40)
                    .background(
                        Circle()
                            .fill(getTierColor(result.tier).opacity(0.2))
                    )
                
                // Details
                VStack(alignment: .leading, spacing: 4) {
                    Text(result.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Text(result.details)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // Status Icon
                Image(systemName: result.status.icon)
                    .font(.system(size: 16))
                    .foregroundColor(result.status.color)
            }
            
            Divider()
            
            HStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("PM2.5")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(String(format: "%.1f", result.pm25Value))
                        .font(.headline)
                        .fontWeight(.bold)
                    
                    Text("µg/m³")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Confidence")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 4) {
                        Text(String(format: "%.0f", result.confidence * 100))
                            .font(.headline)
                            .fontWeight(.bold)
                        
                        Text("%")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Weight")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 4) {
                        Text(String(format: "%.0f", result.weight * 100))
                            .font(.headline)
                            .fontWeight(.bold)
                        
                        Text("%")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: getTierColor(result.tier).opacity(0.2), radius: 10, x: 0, y: 5)
        )
    }
    
    private func getTierColor(_ tier: Int) -> Color {
        switch tier {
        case 1: return .orange
        case 2: return .purple
        case 3: return .green
        default: return .blue
        }
    }
}

// MARK: - Agreement View

struct AgreementView: View {
    @ObservedObject var stateManager: MeasurementStateManager
    
    var agreement: Float {
        guard let tier1 = stateManager.tier1Result,
              let tier2 = stateManager.tier2Result,
              let tier3 = stateManager.tier3Result else {
            return 0
        }
        
        let values = [tier1.pm25Value, tier2.pm25Value, tier3.pm25Value]
        let mean = values.reduce(0, +) / Float(values.count)
        let variance = values.map { pow($0 - mean, 2) }.reduce(0, +) / Float(values.count)
        let stdDev = sqrt(variance)
        
        return max(0, 1.0 - (stdDev / 50))
    }
    
    var agreementColor: Color {
        switch agreement {
        case 0.9...: return .green
        case 0.75..<0.9: return .yellow
        case 0.5..<0.75: return .orange
        default: return .red
        }
    }
    
    var agreementMessage: String {
        switch agreement {
        case 0.9...: return "✓ Excellent agreement - results are highly reliable"
        case 0.75..<0.9: return "✓ Good agreement - results are reliable"
        case 0.5..<0.75: return "△ Moderate agreement - consider retrying"
        default: return "⚠ Low agreement - results may not be reliable"
        }
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Data Agreement")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Text(String(format: "%.0f", agreement * 100))
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(agreementColor)
                    
                    Text("%")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            ProgressView(value: Double(agreement))
                .progressViewStyle(LinearProgressViewStyle(tint: agreementColor))
            
            Text(agreementMessage)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(agreementColor.opacity(0.1))
                .stroke(agreementColor.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Final Result Card

struct FinalResultCard: View {
    @ObservedObject var stateManager: MeasurementStateManager
    
    var aqiCategory: String {
        let pm25 = stateManager.finalPM25
        if pm25 <= 12 { return "Good" }
        else if pm25 <= 35 { return "Moderate" }
        else if pm25 <= 55 { return "Unhealthy for Sensitive" }
        else if pm25 <= 150 { return "Unhealthy" }
        else if pm25 <= 250 { return "Very Unhealthy" }
        else { return "Hazardous" }
    }
    
    var aqiColor: Color {
        let pm25 = stateManager.finalPM25
        if pm25 <= 12 { return .green }
        else if pm25 <= 35 { return .yellow }
        else if pm25 <= 55 { return .orange }
        else if pm25 <= 150 { return .red }
        else if pm25 <= 250 { return .purple }
        else { return .black }
    }
    
    var body: some View {
        VStack(spacing: 20) {
            VStack(spacing: 12) {
                Text("Final Result")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                HStack(alignment: .top, spacing: 20) {
                    VStack(spacing: 8) {
                        HStack(alignment: .top, spacing: 4) {
                            Text(String(format: "%.1f", stateManager.finalPM25))
                                .font(.system(size: 48, weight: .bold, design: .default))
                                .foregroundColor(aqiColor)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("µg/m³")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                Text("±\(String(format: "%.1f", stateManager.finalUncertainty))")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Text(aqiCategory)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(aqiColor)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 12) {
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Confidence")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            HStack(spacing: 4) {
                                Text(String(format: "%.0f", stateManager.finalConfidence * 100))
                                    .font(.headline)
                                    .fontWeight(.bold)
                                
                                Text("%")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Measured at")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Text(Date().formatted(date: .abbreviated, time: .shortened))
                                .font(.caption)
                                .fontWeight(.semibold)
                        }
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(aqiColor.opacity(0.1))
                .stroke(aqiColor.opacity(0.3), lineWidth: 2)
        )
    }
}

// MARK: - Detailed Log View

struct DetailedLogView: View {
    let logs: [String]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(logs, id: \.self) { log in
                HStack(spacing: 12) {
                    Text("→")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(log)
                        .font(.caption)
                        .lineLimit(2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.gray.opacity(0.05))
        .cornerRadius(8)
    }
}

// MARK: - Preview

struct MeasurementProgressView_Previews: PreviewProvider {
    static var previews: some View {
        MeasurementProgressView(stateManager: MeasurementStateManager())
    }
}
