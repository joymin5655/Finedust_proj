//
//  GlobeViewModel.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import SceneKit
import CoreLocation
import SwiftUI

@MainActor
class GlobeViewModel: ObservableObject {
    @Published var selectedStation: Station?
    @Published var rotationAngle: Double = 0
    @Published var isRotating = true
    @Published var showStationDetails = false
    @Published var zoomLevel: Float = 2.5
    @Published var cameraPosition: SCNVector3 = SCNVector3(x: 0, y: 0, z: 5)
    
    // 3D Scene 관련
    let scene = SCNScene()
    var earthNode: SCNNode?
    var particleSystem: SCNParticleSystem?
    var stationNodes: [String: SCNNode] = [:]
    
    // 타이머
    private var rotationTimer: Timer?
    
    init() {
        setupScene()
    }
    
    // MARK: - Scene Setup
    
    func setupScene() {
        // 지구 노드 생성
        let earthGeometry = SCNSphere(radius: 2.0)
        earthNode = SCNNode(geometry: earthGeometry)
        
        // 지구 텍스처 설정 (임시 - 실제 텍스처 파일 필요)
        let material = SCNMaterial()
        material.diffuse.contents = UIColor.blue.withAlphaComponent(0.8)
        material.specular.contents = UIColor.white
        material.shininess = 0.1
        earthGeometry.materials = [material]
        
        if let earth = earthNode {
            scene.rootNode.addChildNode(earth)
        }
        
        // 조명 설정
        setupLighting()
        
        // 파티클 시스템 설정
        setupParticleSystem()
        
        // 회전 시작
        startRotation()
    }
    
    // 조명 설정
    private func setupLighting() {
        // Ambient light
        let ambientLight = SCNLight()
        ambientLight.type = .ambient
        ambientLight.intensity = 500
        ambientLight.color = UIColor.white
        
        let ambientLightNode = SCNNode()
        ambientLightNode.light = ambientLight
        scene.rootNode.addChildNode(ambientLightNode)
        
        // Directional light (태양)
        let directionalLight = SCNLight()
        directionalLight.type = .directional
        directionalLight.intensity = 1000
        directionalLight.color = UIColor.white
        directionalLight.castsShadow = true
        
        let directionalLightNode = SCNNode()
        directionalLightNode.light = directionalLight
        directionalLightNode.position = SCNVector3(x: 5, y: 5, z: 5)
        directionalLightNode.look(at: SCNVector3(0, 0, 0), up: SCNVector3(0, 1, 0))
        scene.rootNode.addChildNode(directionalLightNode)
    }
    
    // 파티클 시스템 설정 (대기 흐름 표현)
    private func setupParticleSystem() {
        particleSystem = SCNParticleSystem()
        particleSystem?.birthRate = 100
        particleSystem?.particleLifeSpan = 5
        particleSystem?.particleSize = 0.01
        particleSystem?.particleColor = UIColor.white.withAlphaComponent(0.3)
        particleSystem?.emitterShape = .some(SCNSphere(radius: 2.1))
        
        if let particles = particleSystem {
            earthNode?.addParticleSystem(particles)
        }
    }
    
    // MARK: - Station Management
    
    // 측정소를 지구본에 추가
    func addStations(_ stations: [Station]) {
        // 기존 노드 제거
        stationNodes.values.forEach { $0.removeFromParentNode() }
        stationNodes.removeAll()
        
        for station in stations {
            let node = createStationNode(for: station)
            if let earth = earthNode {
                earth.addChildNode(node)
                stationNodes[station.id] = node
            }
        }
    }
    
    // 측정소 노드 생성
    private func createStationNode(for station: Station) -> SCNNode {
        // 구체 생성 (측정소 마커)
        let sphere = SCNSphere(radius: 0.02)
        let material = SCNMaterial()
        
        // PM2.5 값에 따른 색상 설정
        material.diffuse.contents = colorForPM25(station.pm25)
        material.emission.contents = colorForPM25(station.pm25)
        material.emission.intensity = 0.5
        sphere.materials = [material]
        
        let node = SCNNode(geometry: sphere)
        
        // 위도/경도를 3D 좌표로 변환
        let position = coordinateToPosition(
            latitude: station.latitude,
            longitude: station.longitude,
            radius: 2.05
        )
        node.position = position
        node.name = station.id
        
        return node
    }
    
    // 위도/경도를 3D 좌표로 변환
    private func coordinateToPosition(latitude: Double, longitude: Double, radius: Float) -> SCNVector3 {
        let lat = latitude * .pi / 180
        let lon = longitude * .pi / 180
        
        let x = radius * Float(cos(lat) * cos(lon))
        let y = radius * Float(sin(lat))
        let z = radius * Float(cos(lat) * sin(lon))
        
        return SCNVector3(x, y, z)
    }
    
    // PM2.5 값에 따른 색상
    private func colorForPM25(_ value: Double) -> UIColor {
        let category = PM25Category(pm25: value)
        switch category {
        case .good:
            return UIColor.green
        case .moderate:
            return UIColor.yellow
        case .unhealthy:
            return UIColor.orange
        case .veryUnhealthy:
            return UIColor.red
        case .hazardous:
            return UIColor.purple
        }
    }
    
    // MARK: - Interaction
    
    // 측정소 선택
    func selectStation(at point: CGPoint, in view: SCNView) {
        let hitResults = view.hitTest(point, options: nil)
        
        if let hit = hitResults.first,
           let stationId = hit.node.name,
           let station = findStation(by: stationId) {
            selectedStation = station
            showStationDetails = true
        }
    }
    
    // ID로 측정소 찾기
    private func findStation(by id: String) -> Station? {
        // StationViewModel에서 찾기 (실제 구현 시 연결 필요)
        return nil
    }
    
    // MARK: - Animation
    
    // 회전 시작
    func startRotation() {
        isRotating = true
        rotationTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { _ in
            self.rotationAngle += 0.5
            if self.rotationAngle >= 360 {
                self.rotationAngle = 0
            }
            
            self.earthNode?.rotation = SCNVector4(0, 1, 0, Float(self.rotationAngle * .pi / 180))
        }
    }
    
    // 회전 정지
    func stopRotation() {
        isRotating = false
        rotationTimer?.invalidate()
        rotationTimer = nil
    }
    
    // 회전 토글
    func toggleRotation() {
        if isRotating {
            stopRotation()
        } else {
            startRotation()
        }
    }
    
    // 줌 인/아웃
    func zoom(delta: Float) {
        zoomLevel = max(1.5, min(5.0, zoomLevel + delta))
        cameraPosition.z = zoomLevel
    }
    
    // 특정 위치로 포커스
    func focusOn(latitude: Double, longitude: Double) {
        stopRotation()
        
        // 해당 위치가 보이도록 지구 회전
        let targetLongitude = -longitude - 90
        let targetLatitude = latitude
        
        let rotation = SCNVector4(
            x: Float(targetLatitude * .pi / 180),
            y: Float(targetLongitude * .pi / 180),
            z: 0,
            w: 1
        )
        
        SCNTransaction.begin()
        SCNTransaction.animationDuration = 1.0
        earthNode?.rotation = rotation
        SCNTransaction.commit()
    }
    
    deinit {
        rotationTimer?.invalidate()
    }
}