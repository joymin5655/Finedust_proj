import SwiftUI
import Combine

// MARK: - Main Measurement Screen

struct MainMeasurementView: View {
    @StateObject private var measurementManager = EnhancedMeasurementManager()
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background Gradient
                LinearGradient(
                    colors: [
                        Color.blue.opacity(0.1),
                        Color.purple.opacity(0.1)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        HeaderView()
                        
                        // Measure Button (when idle)
                        if measurementManager.stateManager.currentStep == .idle {
                            MeasureButton {
                                Task {
                                    await measurementManager.startMeasurement()
                                }
                            }
                        }
                        
                        // Progress View (when measuring)
                        if measurementManager.stateManager.currentStep != .idle {
                            MeasurementProgressView(
                                stateManager: measurementManager.stateManager
                            )
                        }
                        
                        // Action Buttons (when complete)
                        if measurementManager.isComplete {
                            ActionButtons(
                                onNewMeasurement: {
                                    withAnimation {
                                        measurementManager.stateManager.reset()
                                    }
                                },
                                onViewHistory: {
                                    // Navigate to history
                                },
                                onShare: {
                                    shareResults(measurementManager)
                                }
                            )
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("AirLens Camera")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Measurement Failed", isPresented: .constant(measurementManager.error != nil)) {
                Button("OK") {
                    measurementManager.stateManager.reset()
                }
            } message: {
                if let error = measurementManager.error {
                    Text(error.localizedDescription)
                }
            }
        }
    }
    
    private func shareResults(_ manager: EnhancedMeasurementManager) {
        let pm25 = manager.stateManager.finalPM25
        let confidence = manager.stateManager.finalConfidence
        
        let text = """
        AirLens Measurement
        PM2.5: \(String(format: "%.1f", pm25)) µg/m³
        Confidence: \(Int(confidence * 100))%
        
        Measured with AirLens - Triple Verification Air Quality System
        """
        
        let activityVC = UIActivityViewController(
            activityItems: [text],
            applicationActivities: nil
        )
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let rootVC = window.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }
}

// MARK: - Header View

struct HeaderView: View {
    var body: some View {
        VStack(spacing: 12) {
            // App Icon
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.blue, .purple],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 100, height: 100)
                
                Image(systemName: "camera.metering.matrix")
                    .font(.system(size: 40))
                    .foregroundColor(.white)
            }
            .shadow(color: .blue.opacity(0.3), radius: 10, x: 0, y: 5)
            
            // Title
            Text("Air Quality Measurement")
                .font(.title)
                .fontWeight(.bold)
            
            Text("Triple-verified PM2.5 detection")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

// MARK: - Measure Button

struct MeasureButton: View {
    let action: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                isPressed = false
                action()
            }
        }) {
            VStack(spacing: 16) {
                // Camera Icon
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [.blue, .purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 120, height: 120)
                        .shadow(color: .blue.opacity(0.4), radius: 20, x: 0, y: 10)
                    
                    Image(systemName: "camera.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.white)
                }
                .scaleEffect(isPressed ? 0.95 : 1.0)
                
                // Text
                VStack(spacing: 8) {
                    Text("Start Measurement")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("Tap to capture and analyze")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            .padding(32)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color(.systemBackground))
                    .shadow(color: .black.opacity(0.1), radius: 20, x: 0, y: 10)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Action Buttons

struct ActionButtons: View {
    let onNewMeasurement: () -> Void
    let onViewHistory: () -> Void
    let onShare: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            // Primary: New Measurement
            Button(action: onNewMeasurement) {
                HStack {
                    Image(systemName: "camera.fill")
                    Text("New Measurement")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(
                    LinearGradient(
                        colors: [.blue, .purple],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            
            HStack(spacing: 16) {
                // Secondary: History
                Button(action: onViewHistory) {
                    HStack {
                        Image(systemName: "clock.arrow.circlepath")
                        Text("History")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray.opacity(0.2))
                    .foregroundColor(.primary)
                    .cornerRadius(12)
                }
                
                // Secondary: Share
                Button(action: onShare) {
                    HStack {
                        Image(systemName: "square.and.arrow.up")
                        Text("Share")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray.opacity(0.2))
                    .foregroundColor(.primary)
                    .cornerRadius(12)
                }
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

// MARK: - Demo View (For Testing)

struct DemoMeasurementView: View {
    @StateObject private var measurementManager = EnhancedMeasurementManager()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                MeasurementProgressView(stateManager: measurementManager.stateManager)
                
                HStack(spacing: 12) {
                    Button(action: {
                        Task {
                            await simulateMeasurement(measurementManager)
                        }
                    }) {
                        HStack {
                            Image(systemName: "play.fill")
                            Text("Simulate")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    
                    Button(action: {
                        measurementManager.stateManager.reset()
                    }) {
                        HStack {
                            Image(systemName: "arrow.counterclockwise")
                            Text("Reset")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(8)
                    }
                }
                .padding()
                
                Spacer()
            }
            .navigationTitle("Demo Mode")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Simulation Helper

func simulateMeasurement(_ manager: EnhancedMeasurementManager) async {
    // Simulate each step with delays
    manager.stateManager.updateStep(.locating)
    try? await Task.sleep(nanoseconds: 1_000_000_000)
    
    manager.stateManager.updateStep(.capturing)
    for i in 1...30 {
        try? await Task.sleep(nanoseconds: 100_000_000)
        manager.stateManager.updateCaptureProgress(Float(i) / 30.0, frames: i)
    }
    
    manager.stateManager.updateStep(.processing)
    try? await Task.sleep(nanoseconds: 1_500_000_000)
    
    manager.stateManager.updateStep(.tier1Station)
    try? await Task.sleep(nanoseconds: 1_000_000_000)
    manager.stateManager.updateTier1(pm25: 30.2, confidence: 0.85, stationCount: 5)
    
    manager.stateManager.updateStep(.tier2Camera)
    try? await Task.sleep(nanoseconds: 2_000_000_000)
    manager.stateManager.updateTier2(pm25: 34.1, confidence: 0.90, inferenceTime: 2.0)
    
    manager.stateManager.updateStep(.tier3Satellite)
    try? await Task.sleep(nanoseconds: 1_500_000_000)
    manager.stateManager.updateTier3(pm25: 31.5, confidence: 0.75, aodValue: 0.22)
    
    manager.stateManager.updateStep(.fusion)
    try? await Task.sleep(nanoseconds: 500_000_000)
    manager.stateManager.updateFinalResult(pm25: 32.1, confidence: 0.92, uncertainty: 2.3)
    
    manager.stateManager.updateStep(.complete)
}

// MARK: - Preview

struct MainMeasurementView_Previews: PreviewProvider {
    static var previews: some View {
        MainMeasurementView()
    }
}
