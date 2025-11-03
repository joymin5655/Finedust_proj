//
//  CameraView.swift
//  AirLens
//
//  Main camera capture view
//

import SwiftUI
import AVFoundation

struct CameraView: View {
    @StateObject private var viewModel = CameraViewModel()
    @StateObject private var locationService = LocationService()
    @State private var showImagePicker = false
    @State private var showCamera = false
    @State private var selectedImage: UIImage?
    
    var onNavigateToGlobe: () -> Void
    var onNavigateToSettings: () -> Void
    
    var body: some View {
        ZStack {
            // Background
            Color.black
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                header
                
                Spacer()
                
                // Globe Animation Area
                globeArea
                
                Spacer()
                
                // Control Panel
                controlPanel
                    .padding()
            }
            
            // Camera Overlay
            if showCamera {
                CameraPickerView(
                    isPresented: $showCamera,
                    selectedImage: $selectedImage,
                    onImageCaptured: { image in
                        Task {
                            await viewModel.analyzeImage(image)
                        }
                    }
                )
            }
            
            // Loading Overlay
            if viewModel.isLoading {
                loadingOverlay
            }
            
            // Results Display
            if viewModel.showResults, let prediction = viewModel.prediction {
                ResultsDisplayView(
                    prediction: prediction,
                    onClose: { viewModel.closeResults() }
                )
            }
        }
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(selectedImage: $selectedImage)
                .onDisappear {
                    if let image = selectedImage {
                        Task {
                            await viewModel.analyzeImage(image)
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
                    .foregroundColor(.white)
                
                // Native ML Indicator
                HStack(spacing: 4) {
                    Image(systemName: "cpu")
                        .font(.caption2)
                    Text("Native ML")
                        .font(.caption2)
                }
                .foregroundColor(.green)
                .padding(.horizontal, 8)
                .padding(.vertical, 2)
                .background(Color.green.opacity(0.2))
                .cornerRadius(8)
            }
            
            Spacer()
            
            Button(action: onNavigateToGlobe) {
                Image(systemName: "globe")
                    .font(.title3)
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.white.opacity(0.2))
                    .clipShape(Circle())
            }
            
            Button(action: onNavigateToSettings) {
                Image(systemName: "gearshape.fill")
                    .font(.title3)
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.white.opacity(0.2))
                    .clipShape(Circle())
            }
        }
        .padding()
    }
    
    // MARK: - Globe Area
    private var globeArea: some View {
        ZStack {
            AnimatedGlobeView()
        }
        .frame(maxWidth: .infinity)
        .frame(height: 300)
    }
    
    // MARK: - Control Panel
    private var controlPanel: some View {
        VStack(spacing: 16) {
            // Location Info
            if let locationDetails = locationService.locationDetails {
                HStack {
                    Text(locationDetails.flag)
                        .font(.title)
                    Text(locationDetails.country)
                        .font(.headline)
                        .foregroundColor(.white)
                    Text(locationDetails.city)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            } else {
                Text("Determining location...")
                    .foregroundColor(.gray)
            }
            
            // Error Message
            if let error = viewModel.error {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }
            
            // Action Buttons
            HStack(spacing: 12) {
                // Capture Button
                Button(action: { showCamera = true }) {
                    HStack {
                        Image(systemName: "camera.fill")
                        Text("Capture")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.gray.opacity(0.8))
                    .cornerRadius(12)
                }
                
                // Upload Button
                Button(action: { showImagePicker = true }) {
                    HStack {
                        Image(systemName: "square.and.arrow.up.fill")
                        Text("Upload")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(width: 100)
                    .frame(height: 50)
                    .background(Color.blue)
                    .cornerRadius(12)
                }
            }
            
            // Check Stations Button
            Button(action: {
                Task {
                    await viewModel.checkStations()
                }
            }) {
                HStack {
                    Image(systemName: "antenna.radiowaves.left.and.right")
                    Text("Check Stations")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.purple.opacity(0.8))
                .cornerRadius(12)
            }
        }
        .padding()
        .background(Color.black.opacity(0.3))
        .cornerRadius(20)
    }
    
    // MARK: - Loading Overlay
    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.6)
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.5)
                
                Text("Analyzing...")
                    .font(.headline)
                    .foregroundColor(.white)
            }
        }
    }
}

#Preview {
    CameraView(
        onNavigateToGlobe: {},
        onNavigateToSettings: {}
    )
}
