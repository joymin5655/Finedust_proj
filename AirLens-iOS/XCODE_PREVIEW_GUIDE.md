# Xcode 미리보기 작업 가이드

## 빠른 시작

### 1️⃣ 미리보기 열기
- **단축키**: `⌥ ⌘ Enter`
- 또는 Editor → Canvas

### 2️⃣ 실시간 모드 활성화
- 미리보기 하단의 "▶️" 버튼 클릭
- 또는 `⌘ ⌥ ⌃ P`

### 3️⃣ 코드 수정 → 자동 업데이트!
- 코드를 수정하면 미리보기가 자동으로 업데이트됩니다
- 저장할 필요 없이 타이핑하는 즉시 반영됩니다

---

## 유용한 단축키

| 기능 | 단축키 |
|------|--------|
| 캔버스 열기/닫기 | `⌥ ⌘ Enter` |
| 미리보기 새로고침 | `⌘ ⌥ P` |
| 실시간 모드 토글 | `⌘ ⌥ ⌃ P` |
| 디바이스 변경 | 미리보기 상단 드롭다운 |
| 다크/라이트 모드 | 미리보기 하단 아이콘 |

---

## 다중 미리보기 설정

### 여러 디바이스 동시에 보기
```swift
#Preview("iPhone 15 Pro") {
    ContentView()
}

#Preview("iPhone SE") {
    ContentView()
        .previewDevice("iPhone SE (3rd generation)")
}

#Preview("iPad") {
    ContentView()
        .previewDevice("iPad Pro (12.9-inch)")
}
```

### 다크/라이트 모드 동시에 보기
```swift
#Preview("Light Mode") {
    ContentView()
        .preferredColorScheme(.light)
}

#Preview("Dark Mode") {
    ContentView()
        .preferredColorScheme(.dark)
}
```

### 다양한 상태 테스트
```swift
#Preview("Loading State") {
    CameraView(
        onNavigateToGlobe: {},
        onNavigateToSettings: {}
    )
}

#Preview("With Data") {
    ResultsDisplayView(
        pm25: 35.5,
        aqi: 100,
        airQualityLevel: "Moderate"
    )
}
```

---

## 미리보기 최적화 팁

### 1. Mock 데이터 사용
```swift
// 미리보기용 샘플 데이터
extension AirQualityData {
    static var preview: AirQualityData {
        AirQualityData(
            pm25: 35.5,
            aqi: 100,
            timestamp: Date()
        )
    }
}

#Preview {
    ResultsDisplayView(data: .preview)
}
```

### 2. 빠른 반복을 위한 분리된 컴포넌트
```swift
// 큰 뷰를 작은 컴포넌트로 분리
struct AQIBadgeView: View {
    let aqi: Int
    
    var body: some View {
        // 뷰 코드
    }
}

#Preview {
    AQIBadgeView(aqi: 100)
        .padding()
}
```

### 3. 조건부 컴파일
```swift
#if DEBUG
#Preview {
    ContentView()
}
#endif
```

---

## 문제 해결

### ❌ 미리보기가 로드되지 않을 때

1. **캐시 정리**
   - Product → Clean Build Folder (`⇧ ⌘ K`)

2. **Xcode 재시작**
   - Xcode 완전 종료 후 재시작

3. **파생 데이터 삭제**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```

4. **시뮬레이터 재시작**
   - Xcode → Settings → Platforms → 시뮬레이터 선택 → Delete

### ⚠️ 미리보기가 느릴 때

1. **복잡한 뷰 단순화**
   - 큰 뷰를 작은 컴포넌트로 분리
   - 네트워크 호출 제거 (Mock 데이터 사용)

2. **조건부 빌드 사용**
   ```swift
   #if DEBUG
   // 미리보기용 간단한 버전
   #else
   // 프로덕션 코드
   #endif
   ```

3. **실시간 모드 비활성화**
   - 빌드가 완료될 때만 업데이트

---

## 프로젝트별 설정

### 현재 프로젝트 (AirLens)

**주요 뷰 파일:**
- `ContentView.swift` - 메인 네비게이션
- `CameraView.swift` - 카메라 인터페이스
- `GlobeView.swift` - 3D 지구본 뷰
- `ResultsDisplayView.swift` - 결과 표시
- `SettingsView.swift` - 설정 화면

**권장 작업 흐름:**
1. 작업할 뷰 파일 열기
2. `⌥ ⌘ Enter`로 미리보기 활성화
3. 실시간 모드 켜기 (`⌘ ⌥ ⌃ P`)
4. 코드 수정 → 즉시 확인!
5. 만족스러우면 `⌘ S`로 저장

---

## 실전 예제: CameraView 개선하기

### Step 1: 기본 미리보기 확인
```swift
// CameraView.swift 열기
// ⌥ ⌘ Enter로 미리보기 활성화
```

### Step 2: 여러 상태 테스트
```swift
#Preview("카메라 준비") {
    CameraView(
        onNavigateToGlobe: {},
        onNavigateToSettings: {}
    )
}

#Preview("측정 중") {
    CameraView(
        onNavigateToGlobe: {},
        onNavigateToSettings: {}
    )
    // 측정 상태를 시뮬레이션
}

#Preview("다크 모드") {
    CameraView(
        onNavigateToGlobe: {},
        onNavigateToSettings: {}
    )
    .preferredColorScheme(.dark)
}
```


### Step 3: 컴포넌트 분리 예제
```swift
// CameraView에서 버튼을 별도 컴포넌트로 분리
struct CameraButton: View {
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.white)
                .frame(width: 50, height: 50)
                .background(Color.blue.opacity(0.8))
                .clipShape(Circle())
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        CameraButton(icon: "globe", action: {})
        CameraButton(icon: "gearshape", action: {})
        CameraButton(icon: "camera.fill", action: {})
    }
    .padding()
    .background(Color.black)
}
```

---

## 추가 리소스

- [Apple 공식 문서](https://developer.apple.com/documentation/swiftui/previews-in-xcode)
- [SwiftUI Preview Tips](https://www.hackingwithswift.com/quick-start/swiftui/how-to-preview-your-layout-in-different-devices)

---

**프로젝트**: AirLens-iOS  
**위치**: /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS
