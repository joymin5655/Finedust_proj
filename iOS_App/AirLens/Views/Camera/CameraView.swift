//
//  CameraView.swift
//  AirLens
//
//  Camera view for capturing sky images and analyzing PM2.5
//

import SwiftUI
import AVFoundation

struct CameraView: View {
    @EnvironmentObject var viewModel: CameraViewModel
    @EnvironmentObject var locationService: LocationService

    @State private var showImagePicker = false
    @State private var showCamera = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "#0f172a"), Color(hex: "#1e293b")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            if viewModel.showResults, let result = viewModel.predictionResult {
                // Show results
                ResultsView(prediction: result) {
                    viewModel.retake()
                }
            } else if let image = viewModel.capturedImage {
                // Show captured image with analyze button
                CapturedImageView(image: image) {
                    // Analyze
                    Task {
                        await viewModel.analyzeCurrentImage(location: locationService.location)
                    }
                } onRetake: {
                    // Retake
                    viewModel.retake()
                }
            } else {
                // Main camera interface
                MainCameraInterface(
                    onCapture: {
                        showCamera = true
                    },
                    onUpload: {
                        showImagePicker = true
                    }
                )
            }

            // Loading overlay
            if viewModel.isAnalyzing {
                AnalyzingOverlay()
            }
        }
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(image: $viewModel.capturedImage)
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraCapture(viewModel: viewModel)
        }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") {
                viewModel.error = nil
            }
        } message: {
            if let error = viewModel.error {
                Text(error.localizedDescription)
            }
        }
    }
}

struct MainCameraInterface: View {
    let onCapture: () -> Void
    let onUpload: () -> Void

    var body: some View {
        VStack(spacing: 40) {
            Spacer()

            // Title
            VStack(spacing: 12) {
                Image(systemName: "camera.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.cyan)

                Text("Air Quality Scanner")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)

                Text("Capture the sky to analyze PM2.5 levels")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Spacer()

            // Action buttons
            VStack(spacing: 20) {
                Button(action: onCapture) {
                    HStack {
                        Image(systemName: "camera.fill")
                        Text("Take Photo")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [Color.cyan, Color.blue],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                }

                Button(action: onUpload) {
                    HStack {
                        Image(systemName: "photo.fill")
                        Text("Upload Photo")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [Color.purple, Color.pink],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                }
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 60)
        }
    }
}

struct CapturedImageView: View {
    let image: UIImage
    let onAnalyze: () -> Void
    let onRetake: () -> Void

    var body: some View {
        VStack {
            // Image preview
            Image(uiImage: image)
                .resizable()
                .scaledToFit()
                .frame(maxHeight: 400)
                .cornerRadius(16)
                .padding()

            Spacer()

            // Action buttons
            VStack(spacing: 16) {
                Button(action: onAnalyze) {
                    HStack {
                        Image(systemName: "wand.and.stars")
                        Text("Analyze Air Quality")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [Color.green, Color.cyan],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
                }

                Button(action: onRetake) {
                    HStack {
                        Image(systemName: "arrow.counterclockwise")
                        Text("Retake Photo")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray.opacity(0.3))
                    .cornerRadius(12)
                }
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 60)
        }
    }
}

struct AnalyzingOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.7)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                ProgressView()
                    .scaleEffect(1.5)
                    .tint(.cyan)

                Text("Analyzing air quality...")
                    .font(.headline)
                    .foregroundColor(.white)

                Text("Using AI to predict PM2.5 levels")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            .padding(40)
            .background(Color(.systemBackground).opacity(0.9))
            .cornerRadius(20)
        }
    }
}

// Camera capture view using AVFoundation
struct CameraCapture: View {
    @ObservedObject var viewModel: CameraViewModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            CameraPreview(cameraService: viewModel.setupCamera())
                .ignoresSafeArea()

            VStack {
                // Top bar
                HStack {
                    Button(action: {
                        dismiss()
                    }) {
                        Image(systemName: "xmark")
                            .font(.title2)
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.black.opacity(0.5))
                            .clipShape(Circle())
                    }
                    Spacer()
                }
                .padding()

                Spacer()

                // Capture button
                Button(action: {
                    viewModel.capturePhoto()
                    dismiss()
                }) {
                    Circle()
                        .strokeBorder(Color.white, lineWidth: 4)
                        .frame(width: 70, height: 70)
                        .overlay(
                            Circle()
                                .fill(Color.white)
                                .frame(width: 60, height: 60)
                        )
                }
                .padding(.bottom, 50)
            }
        }
    }
}

// Camera preview wrapper
struct CameraPreview: UIViewRepresentable {
    let cameraService: CameraService

    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.backgroundColor = .black

        if let session = cameraService.setupSession() {
            let previewLayer = AVCaptureVideoPreviewLayer(session: session)
            previewLayer.videoGravity = .resizeAspectFill
            previewLayer.frame = UIScreen.main.bounds
            view.layer.addSublayer(previewLayer)

            cameraService.startSession()
        }

        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

// Image picker for photo library
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) var dismiss

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

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}
