//
//  EnhancedCameraView.swift
//  Finedust
//
//  Enhanced camera view with measurement process visualization
//

import SwiftUI
import AVFoundation

struct EnhancedCameraView: View {
    @StateObject private var measurementManager = EnhancedMeasurementManager()
    @StateObject private var locationService = LocationService()
    @State private var showImagePicker = false
    @State private var showCamera = false
    @State private var selectedImage: UIImage?
    
    var onNavigateToGlobe: () -> Void
    var onNavigateToSettings: () -> Void
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [Color.blue.opacity(0.1), Color.purple.opacity(0.1)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                header
                
                // Content
                ScrollView {
                    VStack(spacing: 24) {
                        // Start Button or Progress
                        if measurementManager.stateManager.currentStep == .idle {
                            measureButton
                        } else {
                            progressView
                        }
                    }
                    .padding()
                }
            }
            
            // Camera Overlay
            if showCamera {
                CameraPickerView(
                    isPresented: $showCamera,
                    selectedImage: $selectedImage,
                    onImageCaptured: { image in
                        selectedImage = image
                        Task {
                            await measurementManager.startMeasurement(with: image)
                        }
                    }
                )
            }
        }
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(selectedImage: $selectedImage)
                .onDisappear {
                    if let image = selectedImage {
                        Task {
                            await measurementManager.startMeasurement(with: image)
                        }
                    }
                }
        }
        .onAppear {
            locationService.requestPermission()
        }
    }
    
    // MARK: - Header
    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("AirLens")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                if let location = locationService.locationDetails {
                    HStack(spacing: 4) {
                        Text(location.flag)
                        Text(location.city)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
            
            Button(action: onNavigateToGlobe) {
                Image(systemName: "globe")
                    .font(.title3)
                    .foregroundColor(.primary)
                    .frame(width: 44, height: 44)
                    .background(Color(.systemGray6))
                    .clipShape(Circle())
            }
            
            Button(action: onNavigateToSettings) {
                Image(systemName: "gearshape.fill")
                    .font(.title3)
                    .foregroundColor(.primary)
                    .frame(width: 44, height: 44)
                    .background(Color(.systemGray6))
                    .clipShape(Circle())
            }
        }
        .padding()
    }
    
    // MARK: - Measure Button
    private var measureButton: some View {
        VStack(spacing: 24) {
            // Icon
            ZStack {
                Circle()
                    .fill(LinearGradient(
                        colors: [.blue, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(width: 120, height: 120)
                    .shadow(color: .blue.opacity(0.4), radius: 20)
                
                Image(systemName: "camera.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.white)
            }
            
            VStack(spacing: 8) {
                Text("Start Measurement")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Capture or upload an image")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Buttons
            HStack(spacing: 16) {
                Button(action: { showCamera = true }) {
                    Label("Camera", systemImage: "camera.fill")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                }
                
                Button(action: { showImagePicker = true }) {
                    Label("Upload", systemImage: "photo.fill")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.purple)
                        .cornerRadius(12)
                }
            }
        }
        .padding(32)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 20)
        )
    }
    
    // MARK: - Progress View
    private var progressView: some View {
        VStack(spacing: 24) {
            // Overall Progress Card
            overallProgressCard
            
            // Step Progress
            stepProgressList
            
            // Triple Verification (if active)
            if measurementManager.stateManager.currentStep.rawValue >= MeasurementStep.tier1Station.rawValue {
                tripleVerificationCards
            }
            
            // Final Result (if complete)
            if measurementManager.isComplete {
                finalResultCard
            }
        }
    }
    
    private var overallProgressCard: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(measurementManager.stateManager.currentStep.color.opacity(0.2))
                    .frame(width: 100, height: 100)
                
                Image(systemName: measurementManager.stateManager.currentStep.icon)
                    .font(.system(size: 40))
                    .foregroundColor(measurementManager.stateManager.currentStep.color)
            }
            
            Text(measurementManager.stateManager.currentStep.title)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(measurementManager.stateManager.statusMessage)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            ProgressView(value: measurementManager.stateManager.overallProgress)
                .progressViewStyle(LinearProgressViewStyle(
                    tint: measurementManager.stateManager.currentStep.color
                ))
                .frame(height: 8)
            
            Text("\(Int(measurementManager.stateManager.overallProgress * 100))%")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10)
        )
    }
    
    private var stepProgressList: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Progress")
                .font(.headline)
            
            ForEach([
                MeasurementStep.locating,
                .capturing,
                .processing,
                .tier1Station,
                .tier2Camera,
                .tier3Satellite,
                .fusion,
                .complete
            ], id: \.self) { step in
                stepRow(step)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10)
        )
    }
    
    private func stepRow(_ step: MeasurementStep) -> some View {
        let isActive = measurementManager.stateManager.currentStep == step
        let isCompleted = measurementManager.stateManager.currentStep.rawValue > step.rawValue
        
        return HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill((isCompleted ? Color.green : step.color).opacity(0.2))
                    .frame(width: 44, height: 44)
                
                if isCompleted {
                    Image(systemName: "checkmark")
                        .foregroundColor(.green)
                        .fontWeight(.bold)
                } else {
                    Image(systemName: step.icon)
                        .foregroundColor(isActive ? step.color : .gray)
                }
            }
            
            Text(step.title)
                .font(.subheadline)
                .fontWeight(isActive ? .semibold : .regular)
                .foregroundColor(isActive ? .primary : .secondary)
            
            Spacer()
            
            if isActive {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: step.color))
            }
        }
        .padding(.vertical, 8)
        .background(isActive ? step.color.opacity(0.1) : Color.clear)
        .cornerRadius(8)
    }
    
    private var tripleVerificationCards: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Triple Verification")
                .font(.headline)
            
            if let tier1 = measurementManager.stateManager.tier1Result {
                tierCard(tier1)
            }
            
            if let tier2 = measurementManager.stateManager.tier2Result {
                tierCard(tier2)
            }
            
            if let tier3 = measurementManager.stateManager.tier3Result {
                tierCard(tier3)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10)
        )
    }
    
    private func tierCard(_ result: TierResult) -> some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(result.status.color.opacity(0.2))
                    .frame(width: 50, height: 50)
                
                VStack(spacing: 2) {
                    Text("T\(result.tier)")
                        .font(.caption2)
                        .fontWeight(.bold)
                    Image(systemName: result.status.icon)
                        .font(.system(size: 18))
                }
                .foregroundColor(result.status.color)
            }
            
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(result.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    Spacer()
                    
                    Text("\(String(format: "%.1f", result.pm25Value)) μg/m³")
                        .font(.headline)
                        .foregroundColor(getPM25Color(result.pm25Value))
                }
                
                Text(result.details)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(result.status.color.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(result.status.color.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    private var finalResultCard: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.2))
                    .frame(width: 80, height: 80)
                
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.green)
            }
            
            VStack(spacing: 8) {
                Text("\(String(format: "%.1f", measurementManager.stateManager.finalPM25)) μg/m³")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(getPM25Color(measurementManager.stateManager.finalPM25))
                
                Text("± \(String(format: "%.1f", measurementManager.stateManager.finalUncertainty)) μg/m³")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
            
            Text(getAQICategory(measurementManager.stateManager.finalPM25))
                .font(.title2)
                .fontWeight(.semibold)
                .padding(.horizontal, 20)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(getPM25Color(measurementManager.stateManager.finalPM25).opacity(0.2))
                )
            
            Label(
                "\(Int(measurementManager.stateManager.finalConfidence * 100))% Confidence",
                systemImage: "checkmark.seal.fill"
            )
            .font(.headline)
            .foregroundColor(.green)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.green.opacity(0.1))
            )
            
            Button("New Measurement") {
                measurementManager.stateManager.reset()
                selectedImage = nil
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue)
            .cornerRadius(12)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10)
        )
    }
    
    // MARK: - Helper Functions
    private func getPM25Color(_ value: Float) -> Color {
        switch value {
        case 0..<13: return .green
        case 13..<36: return .yellow
        case 36..<56: return .orange
        case 56..<151: return .red
        default: return .purple
        }
    }
    
    private func getAQICategory(_ value: Float) -> String {
        switch value {
        case 0..<13: return "Good"
        case 13..<36: return "Moderate"
        case 36..<56: return "Unhealthy for Sensitive Groups"
        case 56..<151: return "Unhealthy"
        case 151..<251: return "Very Unhealthy"
        default: return "Hazardous"
        }
    }
}

#Preview {
    EnhancedCameraView(
        onNavigateToGlobe: {},
        onNavigateToSettings: {}
    )
}
