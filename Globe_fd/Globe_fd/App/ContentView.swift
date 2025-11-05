//
//  ContentView.swift
//  Globe_fd
//
//  Created by JOYMIN on 11/5/25.
//
import SwiftUI

struct ContentView: View {
    @StateObject var stationVM = StationViewModel()
    @StateObject var policyVM = PolicyViewModel()
    @StateObject var cameraVM = CameraViewModel()
    
    @State var selectedTab = 0
    @State var showImagePicker = false
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            TabView(selection: $selectedTab) {
                // 🌍 지구본 탭
                globeTab
                    .tabItem {
                        Label("Globe", systemImage: "globe")
                    }
                    .tag(0)
                
                // 📸 카메라 탭
                cameraTab
                    .tabItem {
                        Label("Camera", systemImage: "camera")
                    }
                    .tag(1)
                
                // 📋 정책 탭
                policiesTab
                    .tabItem {
                        Label("Policies", systemImage: "doc.text")
                    }
                    .tag(2)
                
                // 📊 통계 탭
                statsTab
                    .tabItem {
                        Label("Stats", systemImage: "chart.bar")
                    }
                    .tag(3)
            }
            .tint(.green)
        }
        .onAppear {
            Task {
                await stationVM.fetchStations()
                await policyVM.fetchPolicies()
            }
        }
    }
    
    // MARK: - Tabs
    
    var globeTab: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 12) {
                Text("🌍 AirLens Globe")
                    .font(.title)
                    .foregroundColor(.white)
                
                if stationVM.isLoading {
                    ProgressView()
                        .tint(.green)
                } else {
                    Text("Stations: \(stationVM.stations.count)")
                        .foregroundColor(.green)
                    
                    ScrollView {
                        VStack(spacing: 8) {
                            ForEach(stationVM.stations.prefix(20)) { station in
                                HStack {
                                    Circle()
                                        .fill(station.pm25Category.color)
                                        .frame(width: 8, height: 8)
                                    
                                    Text(station.name)
                                        .font(.caption)
                                    
                                    Spacer()
                                    
                                    Text("\(String(format: "%.1f", station.pm25))")
                                        .font(.caption)
                                        .foregroundColor(station.pm25Category.color)
                                }
                                .padding(8)
                                .background(Color(white: 0.1))
                                .cornerRadius(4)
                            }
                        }
                        .padding()
                    }
                }
            }
            .padding()
        }
    }
    
    var cameraTab: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 20) {
                Text("📸 Camera AI")
                    .font(.title)
                    .foregroundColor(.white)
                
                if let image = cameraVM.selectedImage {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(height: 300)
                        .cornerRadius(12)
                }
                
                VStack(spacing: 12) {
                    Button(action: { showImagePicker = true }) {
                        HStack {
                            Image(systemName: "photo")
                            Text("Select Photo")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                }
                .padding()
                
                if let prediction = cameraVM.prediction {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("📊 Result")
                            .font(.headline)
                            .foregroundColor(.yellow)
                        
                        HStack {
                            Text("PM2.5:")
                            Text("\(String(format: "%.1f", prediction.pm25))")
                                .foregroundColor(.green)
                        }
                        
                        HStack {
                            Text("Confidence:")
                            Text("\(String(format: "%.0f%%", prediction.confidence * 100))")
                                .foregroundColor(.yellow)
                        }
                    }
                    .padding()
                    .background(Color(white: 0.1))
                    .cornerRadius(8)
                    .padding()
                }
                
                if cameraVM.isProcessing {
                    ProgressView()
                }
                
                Spacer()
            }
            .padding()
        }
        .sheet(isPresented: $showImagePicker) {
            ImagePickerView { image in
                Task {
                    await cameraVM.processImage(image)
                }
            }
        }
    }
    
    var policiesTab: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 12) {
                Text("📋 Policies")
                    .font(.title)
                    .foregroundColor(.white)
                
                if policyVM.isLoading {
                    ProgressView()
                } else {
                    Text("Total: \(policyVM.policies.count)")
                        .foregroundColor(.cyan)
                    
                    List {
                        ForEach(policyVM.policies.prefix(20)) { policy in
                            VStack(alignment: .leading, spacing: 8) {
                                Text(policy.title)
                                    .font(.headline)
                                    .foregroundColor(.white)
                                
                                HStack {
                                    Text(policy.country)
                                        .font(.caption)
                                        .foregroundColor(.cyan)
                                    
                                    Spacer()
                                    
                                    Text("✓ \(String(format: "%.2f", policy.credibilityScore))")
                                        .font(.caption)
                                        .foregroundColor(.green)
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                }
            }
            .padding()
        }
    }
    
    var statsTab: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    Text("📊 Statistics")
                        .font(.title)
                        .foregroundColor(.white)
                    
                    HStack(spacing: 15) {
                        StatBox(title: "Stations", value: "\(stationVM.stations.count)",
                               color: .green, icon: "📍")
                        StatBox(title: "Policies", value: "\(policyVM.policies.count)",
                               color: .cyan, icon: "📋")
                    }
                    
                    VStack(alignment: .leading, spacing: 12) {
                        Text("🔴 Highest PM2.5")
                            .font(.headline)
                            .foregroundColor(.red)
                        
                        ForEach(stationVM.getHighestPM25(limit: 5)) { station in
                            HStack {
                                Text(station.name)
                                    .font(.caption)
                                Spacer()
                                Text("\(String(format: "%.1f", station.pm25))")
                                    .foregroundColor(.red)
                            }
                            .padding(8)
                            .background(Color(white: 0.1))
                            .cornerRadius(4)
                        }
                    }
                    .padding()
                    .background(Color(white: 0.05))
                    .cornerRadius(12)
                }
                .padding()
            }
        }
    }
}

// MARK: - Helper Views

struct StatBox: View {
    let title: String
    let value: String
    let color: Color
    let icon: String
    
    var body: some View {
        VStack {
            Text(icon)
                .font(.title)
            Text(value)
                .font(.title2)
                .bold()
                .foregroundColor(color)
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(white: 0.1))
        .cornerRadius(12)
    }
}

struct ImagePickerView: UIViewControllerRepresentable {
    var onImageSelected: (UIImage) -> Void
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController,
                              context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePickerView
        
        init(_ parent: ImagePickerView) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController,
                                 didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.onImageSelected(image)
            }
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

#Preview {
    ContentView()
}
