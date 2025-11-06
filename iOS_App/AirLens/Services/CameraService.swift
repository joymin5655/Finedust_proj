//
//  CameraService.swift
//  AirLens
//
//  Camera capture service for image analysis
//

import Foundation
import AVFoundation
import UIKit
import Combine

class CameraService: NSObject, ObservableObject {
    @Published var isAuthorized = false
    @Published var capturedImage: UIImage?
    @Published var error: CameraError?
    @Published var isSessionRunning = false

    private var captureSession: AVCaptureSession?
    private var photoOutput: AVCapturePhotoOutput?
    private var videoPreviewLayer: AVCaptureVideoPreviewLayer?

    override init() {
        super.init()
        checkAuthorization()
    }

    func checkAuthorization() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            isAuthorized = true
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                DispatchQueue.main.async {
                    self?.isAuthorized = granted
                }
            }
        case .denied, .restricted:
            isAuthorized = false
            error = .permissionDenied
        @unknown default:
            isAuthorized = false
        }
    }

    func setupSession() -> AVCaptureSession? {
        guard isAuthorized else {
            error = .permissionDenied
            return nil
        }

        let session = AVCaptureSession()
        session.beginConfiguration()
        session.sessionPreset = .photo

        // Setup camera input
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: camera) else {
            error = .setupFailed
            return nil
        }

        if session.canAddInput(input) {
            session.addInput(input)
        } else {
            error = .setupFailed
            return nil
        }

        // Setup photo output
        let output = AVCapturePhotoOutput()
        if session.canAddOutput(output) {
            session.addOutput(output)
            photoOutput = output
        } else {
            error = .setupFailed
            return nil
        }

        session.commitConfiguration()
        captureSession = session

        return session
    }

    func startSession() {
        guard let session = captureSession else { return }

        if !session.isRunning {
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                session.startRunning()
                DispatchQueue.main.async {
                    self?.isSessionRunning = true
                }
            }
        }
    }

    func stopSession() {
        guard let session = captureSession else { return }

        if session.isRunning {
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                session.stopRunning()
                DispatchQueue.main.async {
                    self?.isSessionRunning = false
                }
            }
        }
    }

    func capturePhoto() {
        guard let photoOutput = photoOutput else {
            error = .captureFailed
            return
        }

        let settings = AVCapturePhotoSettings()
        if photoOutput.availablePhotoCodecTypes.contains(.hevc) {
            settings.photoCodecType = .hevc
        }

        photoOutput.capturePhoto(with: settings, delegate: self)
    }

    func createPreviewLayer(for session: AVCaptureSession, in view: UIView) -> AVCaptureVideoPreviewLayer {
        let previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer.videoGravity = .resizeAspectFill
        previewLayer.frame = view.bounds
        return previewLayer
    }
}

extension CameraService: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error = error {
            self.error = .captureFailed
            print("Camera capture error: \(error.localizedDescription)")
            return
        }

        guard let imageData = photo.fileDataRepresentation(),
              let image = UIImage(data: imageData) else {
            self.error = .captureFailed
            return
        }

        DispatchQueue.main.async {
            self.capturedImage = image
        }
    }
}

enum CameraError: Error, LocalizedError {
    case permissionDenied
    case setupFailed
    case captureFailed

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Camera permission denied. Please enable camera access in Settings."
        case .setupFailed:
            return "Failed to setup camera."
        case .captureFailed:
            return "Failed to capture photo."
        }
    }
}
