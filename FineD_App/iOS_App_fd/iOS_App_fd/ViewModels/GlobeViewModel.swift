//
//  GlobeViewModel.swift
//  AirLens
//
//  3D Globe scene management (PRD: 60 FPS target)
//

import Foundation
import SceneKit
import Combine

@MainActor
class GlobeViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var scene: SCNScene
    @Published var isRotating = true
    @Published var selectedStation: Station?
    @Published var showStationDetails = false
    @Published var currentZoom: Float = 10.0

    // MARK: - Private Properties
    private var globeNode: SCNNode?
    private var stationNodes: [String: SCNNode] = [:]
    private var animationsEnabled = true

    // MARK: - Initialization
    init() {
        scene = SCNScene()
        setupScene()
    }

    // MARK: - Scene Setup

    private func setupScene() {
        // Create globe
        let globe = SCNSphere(radius: 5.0)
        globe.segmentCount = 100 // Smooth sphere

        // Earth texture (in production, use actual Earth texture)
        let material = SCNMaterial()
        material.diffuse.contents = UIColor.blue
        material.specular.contents = UIColor.white
        material.shininess = 0.1
        globe.materials = [material]

        globeNode = SCNNode(geometry: globe)
        scene.rootNode.addChildNode(globeNode!)

        // Camera
        let camera = SCNCamera()
        camera.fieldOfView = 60
        let cameraNode = SCNNode()
        cameraNode.camera = camera
        cameraNode.position = SCNVector3(0, 0, currentZoom)
        scene.rootNode.addChildNode(cameraNode)

        // Lighting
        let ambientLight = SCNLight()
        ambientLight.type = .ambient
        ambientLight.intensity = 300
        let ambientNode = SCNNode()
        ambientNode.light = ambientLight
        scene.rootNode.addChildNode(ambientNode)

        let directionalLight = SCNLight()
        directionalLight.type = .directional
        directionalLight.intensity = 500
        let lightNode = SCNNode()
        lightNode.light = directionalLight
        lightNode.position = SCNVector3(10, 10, 10)
        scene.rootNode.addChildNode(lightNode)

        // Start rotation if enabled
        if isRotating {
            startRotation()
        }
    }

    // MARK: - Public Methods

    func addStations(_ stations: [Station]) {
        // Remove existing station nodes
        stationNodes.values.forEach { $0.removeFromParentNode() }
        stationNodes.removeAll()

        // Add new stations (LOD: show subset for performance)
        let displayStations = stations.prefix(1000) // Limit for 60 FPS

        for station in displayStations {
            addStationMarker(station)
        }

        print("🌍 Added \(displayStations.count) stations to globe")
    }

    func toggleRotation() {
        isRotating.toggle()

        if isRotating {
            startRotation()
        } else {
            stopRotation()
        }
    }

    func focusOn(latitude: Double, longitude: Double) {
        // Convert lat/lon to 3D position on sphere
        // Animate camera to focus on location
        print("📍 Focusing on \(latitude), \(longitude)")
    }

    func zoom(delta: Float) {
        currentZoom = max(7.0, min(15.0, currentZoom + delta))

        // Animate camera zoom
        if let camera = scene.rootNode.childNodes.first(where: { $0.camera != nil }) {
            SCNTransaction.begin()
            SCNTransaction.animationDuration = 0.3
            camera.position.z = currentZoom
            SCNTransaction.commit()
        }
    }

    func disableAnimations() {
        animationsEnabled = false
        isRotating = false
        stopRotation()
    }

    // MARK: - Private Methods

    private func addStationMarker(_ station: Station) {
        // Convert lat/lon to 3D coordinates
        let (x, y, z) = latLonToXYZ(
            lat: station.latitude,
            lon: station.longitude,
            radius: 5.1
        )

        // Create marker
        let marker = SCNSphere(radius: 0.05)
        let material = SCNMaterial()
        material.diffuse.contents = colorForPM25(station.pm25)
        material.emission.contents = colorForPM25(station.pm25)
        marker.materials = [material]

        let markerNode = SCNNode(geometry: marker)
        markerNode.position = SCNVector3(x, y, z)
        markerNode.name = station.id

        globeNode?.addChildNode(markerNode)
        stationNodes[station.id] = markerNode
    }

    private func latLonToXYZ(lat: Double, lon: Double, radius: Double) -> (Double, Double, Double) {
        let latRad = lat * .pi / 180
        let lonRad = lon * .pi / 180

        let x = radius * cos(latRad) * cos(lonRad)
        let y = radius * sin(latRad)
        let z = radius * cos(latRad) * sin(lonRad)

        return (x, y, z)
    }

    private func colorForPM25(_ pm25: Double) -> UIColor {
        let category = PM25Category.from(pm25: pm25)
        return UIColor(hex: category.color) ?? .gray
    }

    private func startRotation() {
        guard animationsEnabled, let globe = globeNode else { return }

        let rotation = SCNAction.rotateBy(x: 0, y: .pi * 2, z: 0, duration: 60)
        let repeatRotation = SCNAction.repeatForever(rotation)
        globe.runAction(repeatRotation, forKey: "rotation")
    }

    private func stopRotation() {
        globeNode?.removeAction(forKey: "rotation")
    }
}

// MARK: - UIColor Extension
extension UIColor {
    convenience init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }

        self.init(
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            alpha: Double(a) / 255
        )
    }
}
