//
//  CameraView.swift
//  AirLens
//
//  Created on 2025-11-06
//

import SwiftUI
import PhotosUI

struct CameraView: View {
    @EnvironmentObject var cameraViewModel: CameraViewModel
    @EnvironmentObject var locationService: LocationService
    @EnvironmentObject var stationViewModel: StationViewModel
    
    @State private var showImagePicker = false
    @State private var showCamera = false
    @State private var showHistory = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                CameraHeaderView()
                
                // Image Selection Area
                ImageSelectionArea(
                    selectedImage: cameraViewModel.selectedImage,
                    showImagePicker: $showImagePicker,
                    showCamera: $showCamera
                )
                
                // Process Button
                if cameraViewModel.selectedImage != nil {
                    ProcessButton()
                }
                
                // Results
                if cameraViewModel.isProcessing {
                    ProcessingView()
                } else if let prediction = cameraViewModel.prediction {
                    PredictionResultCard(prediction: prediction)
                }
                
                // History Button
                if !cameraViewModel.predictionHistory.isEmpty {
                    HistoryButton(showHistory: $showHistory)
                }
            }
            .padding()
        }
        .background(Color(UIColor.systemBackground))
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(image: .init(get: { cameraViewModel.selectedImage }, 
                                   set: { cameraViewModel.selectImage($0 ?? UIImage()) }))
        }
        .sheet(isPresented: $showCamera) {
            CameraPicker(image: .init(get: { cameraViewModel.selectedImage },
                                    set: { cameraViewModel.selectImage($0 ?? UIImage()) }))
        }
        .sheet(isPresented: $showHistory) {
            PredictionHistoryView()
        }
        .onAppear {
            cameraViewModel.loadHistory()
        }
    }
}

// MARK: - Camera Header
struct CameraHeaderView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "camera.aperture")
                .font(.system(size: 50))
                .foregroundColor(.blue)
            
            Text("AI Air Quality Prediction")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Take or select a photo to predict PM2.5 levels")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// MARK: - Image Selection Area
struct ImageSelectionArea: View {
    let selectedImage: UIImage?
    @Binding var showImagePicker: Bool
    @Binding var showCamera: Bool
    
    var body: some View {
        VStack(spacing: 16) {
            // Image Display
            if let image = selectedImage {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 300)
                    .cornerRadius(12)
                    .shadow(radius: 5)
            } else {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(UIColor.secondarySystemBackground))
                    .frame(height: 250)
                    .overlay(
                        VStack(spacing: 16) {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 60))
                                .foregroundColor(.gray)
                            Text("No image selected")
                                .foregroundColor(.gray)
                        }
                    )
            }
            
            // Selection Buttons
            HStack(spacing: 16) {
                Button(action: { showCamera = true }) {
                    Label("Camera", systemImage: "camera.fill")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                
                Button(action: { showImagePicker = true }) {
                    Label("Gallery", systemImage: "photo.fill")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
        }
    }
}

// MARK: - Process Button
struct ProcessButton: View {
    @EnvironmentObject var cameraViewModel: CameraViewModel
    
    var body: some View {
        Button(action: {
            Task {
                if let image = cameraViewModel.selectedImage {
                    await cameraViewModel.processImage(image)
                }
            }
        }) {
            HStack {
                Image(systemName: "wand.and.stars")
                Text("Analyze Air Quality")
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.purple, Color.blue]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundColor(.white)
            .cornerRadius(10)
        }
        .disabled(cameraViewModel.isProcessing)
    }
}

// MARK: - Processing View
struct ProcessingView: View {
    @State private var animationAmount = 1.0
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "brain")
                .font(.system(size: 60))
                .foregroundColor(.purple)
                .scaleEffect(animationAmount)
                .animation(
                    .easeInOut(duration: 1.0)
                    .repeatForever(autoreverses: true),
                    value: animationAmount
                )
            
            Text("Analyzing image...")
                .font(.headline)
            
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .onAppear {
            animationAmount = 1.2
        }
    }
}

// MARK: - Prediction Result Card
struct PredictionResultCard: View {
    let prediction: PredictionResult
    @EnvironmentObject var cameraViewModel: CameraViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Title
            HStack {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundColor(.green)
                Text("Prediction Complete")
                    .font(.headline)
            }
            
            // PM2.5 Value
            HStack {
                VStack(alignment: .leading) {
                    Text("PM2.5 Level")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(alignment: .lastTextBaseline, spacing: 4) {
                        Text(prediction.formattedPM25)
                            .font(.system(size: 48, weight: .bold))
                            .foregroundColor(Color(hex: prediction.pm25Category.color))
                        Text("μg/m³")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                VStack {
                    Text(prediction.pm25Category.emoji)
                        .font(.system(size: 50))
                    Text(prediction.pm25Category.label)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            // Confidence
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Confidence")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(prediction.confidencePercentage)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 8)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.blue)
                            .frame(width: geometry.size.width * prediction.confidence, height: 8)
                    }
                }
                .frame(height: 8)
            }
            
            // Breakdown
            if prediction.breakdown.station != nil || prediction.breakdown.satellite != nil {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Data Sources")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 12) {
                        DataSourceBadge(
                            icon: "camera",
                            label: "Camera",
                            value: prediction.breakdown.camera
                        )
                        
                        if let station = prediction.breakdown.station {
                            DataSourceBadge(
                                icon: "antenna.radiowaves.left.and.right",
                                label: "Station",
                                value: station
                            )
                        }
                        
                        if let satellite = prediction.breakdown.satellite {
                            DataSourceBadge(
                                icon: "dot.radiowaves.up.forward",
                                label: "Satellite",
                                value: satellite
                            )
                        }
                    }
                }
            }
            
            // Health Recommendation
            Text(prediction.pm25Category.description)
                .font(.subheadline)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color(hex: prediction.pm25Category.color).opacity(0.1))
                .cornerRadius(8)
            
            // Share Button (iOS 15 compatible)
            Button(action: {
                let shareText = cameraViewModel.sharePrediction()
                let activityVC = UIActivityViewController(
                    activityItems: [shareText],
                    applicationActivities: nil
                )
                
                if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                   let rootVC = windowScene.windows.first?.rootViewController {
                    activityVC.popoverPresentationController?.sourceView = rootVC.view
                    rootVC.present(activityVC, animated: true)
                }
            }) {
                Label("Share Result", systemImage: "square.and.arrow.up")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct DataSourceBadge: View {
    let icon: String
    let label: String
    let value: Double
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
            Text(label)
                .font(.caption2)
            Text("\(Int(value * 100))%")
                .font(.caption2)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.blue.opacity(0.1))
        .cornerRadius(6)
    }
}

// MARK: - History Button
struct HistoryButton: View {
    @Binding var showHistory: Bool
    
    var body: some View {
        Button(action: { showHistory = true }) {
            HStack {
                Image(systemName: "clock.arrow.circlepath")
                Text("View Prediction History")
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(10)
        }
    }
}

// MARK: - Image Picker
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController,
                                 didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.presentationMode.wrappedValue.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

// MARK: - Camera Picker
struct CameraPicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .camera
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraPicker
        
        init(_ parent: CameraPicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController,
                                 didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.presentationMode.wrappedValue.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

// MARK: - Prediction History View
struct PredictionHistoryView: View {
    @EnvironmentObject var cameraViewModel: CameraViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            List(cameraViewModel.predictionHistory) { prediction in
                PredictionHistoryRow(prediction: prediction)
            }
            .navigationTitle("Prediction History")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct PredictionHistoryRow: View {
    let prediction: PredictionResult
    
    var body: some View {
        HStack {
            // Thumbnail
            if let imageData = prediction.imageData,
               let image = UIImage(data: imageData) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 60, height: 60)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            } else {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Image(systemName: "photo")
                            .foregroundColor(.gray)
                    )
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text("PM2.5: \(prediction.formattedPM25) μg/m³")
                    .font(.headline)
                    .foregroundColor(Color(hex: prediction.pm25Category.color))
                
                Text(prediction.pm25Category.label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(prediction.timestamp, style: .date)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(prediction.pm25Category.emoji)
                .font(.title)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    CameraView()
        .environmentObject(CameraViewModel())
        .environmentObject(LocationService.shared)
        .environmentObject(StationViewModel())
}