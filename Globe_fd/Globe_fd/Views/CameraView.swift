//
//  CameraView.swift
//  Globe_fd
//
//  AI-Powered Camera Analysis View
//  Created on 2025-11-05.
//

import SwiftUI
import AVFoundation
import PhotosUI

struct CameraView: View {
    @EnvironmentObject var viewModel: CameraViewModel
    @StateObject private var camera = CameraManager()
    
    @State private var showImagePicker = false
    @State private var showCamera = false
    @State private var selectedImage: UIImage?
    @State private var analysisHistory: [AnalysisRecord] = []
    @State private var showingTips = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background Gradient
                LinearGradient(
                    colors: [Color(.systemBackground), Color(.secondarySystemBackground)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header Section
                        headerSection
                        
                        // Camera/Image Section
                        imageSection
                        
                        // Action Buttons
                        actionButtons
                        
                        // Analysis Result
                        if viewModel.isProcessing {
                            analysisLoadingView
                        } else if let prediction = viewModel.prediction {
                            analysisResultView(prediction: prediction)
                        }
                        
                        // Tips Section
                        tipsSection
                        
                        // History Section
                        if !analysisHistory.isEmpty {
                            historySection
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Air Quality Scanner")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingTips.toggle() }) {
                        Image(systemName: "info.circle")
                    }
                }
            }
            .sheet(isPresented: $showImagePicker) {
                ImagePicker(image: $selectedImage, onImagePicked: { image in
                    analyzeImage(image)
                })
            }
            .sheet(isPresented: $showCamera) {
                CameraViewRepresentable(image: $selectedImage, onImageCaptured: { image in
                    analyzeImage(image)
                })
            }
            .sheet(isPresented: $showingTips) {
                TipsView()
            }
        }
    }
    
    // MARK: - View Components
    
    var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "camera.fill")
                .font(.system(size: 50))
                .foregroundColor(.blue)
                .padding()
                .background(
                    Circle()
                        .fill(Color.blue.opacity(0.1))
                )
            
            Text("AI-Powered Analysis")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Take or select a photo to analyze air quality")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
    
    var imageSection: some View {
        Group {
            if let image = selectedImage {
                VStack {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 300)
                        .cornerRadius(16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.blue.opacity(0.3), lineWidth: 2)
                        )
                        .shadow(radius: 5)
                    
                    Button(action: { selectedImage = nil }) {
                        Label("Remove Image", systemImage: "xmark.circle.fill")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 8)
                }
            } else {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.secondarySystemBackground))
                    .frame(height: 250)
                    .overlay(
                        VStack(spacing: 16) {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 60))
                                .foregroundColor(.secondary)
                            
                            Text("No image selected")
                                .font(.headline)
                                .foregroundColor(.secondary)
                        }
                    )
            }
        }
    }
    
    var actionButtons: some View {
        HStack(spacing: 16) {
            Button(action: { showCamera = true }) {
                Label("Take Photo", systemImage: "camera.fill")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [.blue, .blue.opacity(0.8)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            
            Button(action: { showImagePicker = true }) {
                Label("Choose Photo", systemImage: "photo.fill")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(.systemFill))
                    .foregroundColor(.primary)
                    .cornerRadius(12)
            }
        }
    }
    
    var analysisLoadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
                .padding()
            
            Text("Analyzing image...")
                .font(.headline)
            
            Text("Using AI to detect air quality indicators")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
    
    func analysisResultView(prediction: PredictionResult) -> some View {
        VStack(spacing: 20) {
            // Main Result
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Analysis Result")
                        .font(.headline)
                    
                    HStack(alignment: .bottom, spacing: 4) {
                        Text(String(format: "%.1f", prediction.pm25))
                            .font(.system(size: 48, weight: .bold))
                        Text("μg/m³")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .padding(.bottom, 8)
                    }
                    
                    Text(PM25Category(pm25: prediction.pm25).label)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(PM25Category(pm25: prediction.pm25).color.opacity(0.2))
                        .foregroundColor(PM25Category(pm25: prediction.pm25).color)
                        .cornerRadius(8)
                }
                
                Spacer()
                
                // Visual Indicator
                ZStack {
                    Circle()
                        .fill(PM25Category(pm25: prediction.pm25).color.gradient)
                        .frame(width: 80, height: 80)
                    
                    VStack(spacing: 2) {
                        Image(systemName: "aqi.medium")
                            .font(.title2)
                            .foregroundColor(.white)
                        Text("PM2.5")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            }
            
            // Confidence Score
            VStack(alignment: .leading, spacing: 8) {
                Text("Confidence Level")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color(.systemFill))
                            .frame(height: 8)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(confidenceColor(prediction.confidence))
                            .frame(width: geometry.size.width * prediction.confidence, height: 8)
                    }
                }
                .frame(height: 8)
                
                Text("\(Int(prediction.confidence * 100))% confidence")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Analysis Breakdown
            if let breakdown = prediction.breakdown {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Analysis Breakdown")
                        .font(.headline)
                    
                    BreakdownRow(label: "Camera Analysis", value: breakdown.camera)
                    
                    if let station = breakdown.station {
                        BreakdownRow(label: "Nearby Station", value: station)
                    }
                    
                    if let satellite = breakdown.satellite {
                        BreakdownRow(label: "Satellite Data", value: satellite)
                    }
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(12)
            }
            
            // Save Button
            Button(action: saveAnalysis) {
                Label("Save Analysis", systemImage: "square.and.arrow.down")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
    
    var tipsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(.yellow)
                Text("Photo Tips")
                    .font(.headline)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                TipRow(text: "Take photos during daylight for best results")
                TipRow(text: "Include the sky in your photo")
                TipRow(text: "Avoid heavily filtered or edited images")
                TipRow(text: "Ensure the photo is clear and not blurry")
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent Analyses")
                    .font(.headline)
                
                Spacer()
                
                Button("Clear") {
                    analysisHistory.removeAll()
                }
                .font(.caption)
                .foregroundColor(.red)
            }
            
            ForEach(analysisHistory) { record in
                HistoryRow(record: record)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    // MARK: - Functions
    
    func analyzeImage(_ image: UIImage) {
        Task {
            await viewModel.processImage(image)
            
            // Add to history
            if let prediction = viewModel.prediction {
                let record = AnalysisRecord(
                    id: UUID(),
                    date: Date(),
                    pm25: prediction.pm25,
                    confidence: prediction.confidence,
                    image: image
                )
                analysisHistory.insert(record, at: 0)
                
                // Keep only last 5 analyses
                if analysisHistory.count > 5 {
                    analysisHistory.removeLast()
                }
            }
        }
    }
    
    func saveAnalysis() {
        // Implementation for saving analysis
        print("Saving analysis...")
    }
    
    func confidenceColor(_ confidence: Double) -> Color {
        if confidence >= 0.8 {
            return .green
        } else if confidence >= 0.6 {
            return .yellow
        } else {
            return .orange
        }
    }
}

// MARK: - Helper Views

struct TipRow: View {
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Circle()
                .fill(Color.blue)
                .frame(width: 6, height: 6)
                .padding(.top, 6)
            
            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct BreakdownRow: View {
    let label: String
    let value: Double
    
    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(String(format: "%.1f μg/m³", value))
                .font(.caption)
                .fontWeight(.medium)
        }
    }
}

struct HistoryRow: View {
    let record: AnalysisRecord
    
    var body: some View {
        HStack {
            Image(uiImage: record.image)
                .resizable()
                .scaledToFill()
                .frame(width: 50, height: 50)
                .cornerRadius(8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(formatDate(record.date))
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                HStack {
                    Text("PM2.5: \(String(format: "%.1f", record.pm25))")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Circle()
                        .fill(PM25Category(pm25: record.pm25).color)
                        .frame(width: 8, height: 8)
                }
            }
            
            Spacer()
            
            Text("\(Int(record.confidence * 100))%")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(12)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
    
    func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Models

struct AnalysisRecord: Identifiable {
    let id: UUID
    let date: Date
    let pm25: Double
    let confidence: Double
    let image: UIImage
}

// MARK: - Tips View

struct TipsView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Photo Tips
                    TipSection(
                        title: "📸 Photo Tips",
                        tips: [
                            "Take photos outdoors with clear sky visibility",
                            "Best results during daylight hours (10 AM - 4 PM)",
                            "Avoid flash photography",
                            "Include horizon line when possible",
                            "Ensure lens is clean"
                        ]
                    )
                    
                    // Understanding Results
                    TipSection(
                        title: "📊 Understanding Results",
                        tips: [
                            "PM2.5 levels below 12 μg/m³ are considered good",
                            "Higher confidence scores mean more accurate predictions",
                            "Results are estimates based on visual analysis",
                            "Compare with nearby station data for validation",
                            "Weather conditions affect accuracy"
                        ]
                    )
                    
                    // Best Practices
                    TipSection(
                        title: "✅ Best Practices",
                        tips: [
                            "Take multiple photos for comparison",
                            "Check results against official stations",
                            "Consider time of day and weather",
                            "Use original, unedited photos",
                            "Update the app regularly for improved AI"
                        ]
                    )
                }
                .padding()
            }
            .navigationTitle("Tips & Guide")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct TipSection: View {
    let title: String
    let tips: [String]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            
            VStack(alignment: .leading, spacing: 8) {
                ForEach(tips, id: \.self) { tip in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                            .font(.caption)
                        
                        Text(tip)
                            .font(.body)
                            .foregroundColor(.primary)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
}

#Preview {
    CameraView()
        .environmentObject(CameraViewModel())
}
