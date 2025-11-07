import React from 'react';
import { CameraIcon, HistoryIcon, CloudSyncIcon, SignalTowerIcon, MapPinIcon } from './Icons';

interface LandingPageProps {
  onLaunchApp: () => void;
  onNavigateToGlobe: () => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  badge?: string;
}> = ({ icon, title, description, gradient, badge }) => (
  <div className="group relative p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-default">
    {badge && (
      <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-bold text-white shadow-lg">
        {badge}
      </div>
    )}
    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 md:mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white">{title}</h3>
    <p className="text-sm md:text-base text-gray-300 leading-relaxed">{description}</p>
  </div>
);

const StatCard: React.FC<{ value: string; label: string; sublabel?: string }> = ({ value, label, sublabel }) => (
  <div className="text-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
    <div className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">{value}</div>
    <div className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</div>
    {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
  </div>
);

const TechBadge: React.FC<{ tech: string }> = ({ tech }) => (
  <div className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-center hover:border-white/20 hover:scale-105 transition-all duration-200">
    <div className="text-sm md:text-base font-bold text-white">{tech}</div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onNavigateToGlobe }) => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center w-full max-w-6xl mx-auto">
          <div className="inline-block px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 md:mb-8 animate-fade-in">
            <span className="text-xs md:text-sm font-semibold text-blue-300">On-Device Processing • iOS 15+ • Zero External APIs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 md:mb-6 tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            AirLens
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-3 md:mb-4 font-semibold animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
            3D Globe + AI Camera for Air Quality
          </p>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in px-4" style={{ animationDelay: '0.3s' }}>
            삼중 검증 시스템(측정소·카메라·위성)과 CoreML 온디바이스 추론으로
            <br className="hidden sm:block" />
            시각장애인을 포함한 모든 사용자에게 정확한 대기질 정보를 제공합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center animate-fade-in px-4" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base md:text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.05] active:scale-[0.98] transition-all duration-200"
            >
              Launch App
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-base md:text-lg hover:bg-white/20 hover:scale-[1.05] active:scale-[0.98] transition-all duration-200"
            >
              Learn More
            </a>
          </div>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-12 md:mt-16 max-w-5xl mx-auto px-4">
            <StatCard value="30k+" label="측정소" sublabel="실시간 데이터" />
            <StatCard value="<10초" label="예측 속도" sublabel="카메라 분석" />
            <StatCard value="60 FPS" label="Globe 성능" sublabel="SceneKit 최적화" />
            <StatCard value="100%" label="접근성" sublabel="VoiceOver 지원" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:flex">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Core Modules Section - 두 가지 핵심 기능 강조 */}
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">Two Core Modules</h2>
            <p className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              하나의 앱에서 Globe와 Camera, 두 가지 강력한 모듈로 대기질을 탐색하고 측정합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
            {/* Globe Module */}
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-500 text-xs font-bold">
                Module 1
              </div>
              <div className="text-6xl mb-6">🌍</div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">3D Globe</h3>
              <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
                SceneKit/Metal 기반 60 FPS 지구본에서 30,000개 이상의 측정소를 실시간으로 탐색하고,
                대기흐름 파티클과 국가별 정책을 시각화합니다.
              </p>
              <ul className="space-y-3 text-sm md:text-base text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span><strong>30k+ 측정소</strong> 실시간 색상 마커 표시</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span><strong>대기흐름 파티클</strong> 바람장 기반 애니메이션</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span><strong>AQI 히트맵</strong> 및 정책 오버레이</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span><strong>LOD 최적화</strong> 60 FPS 유지 보장</span>
                </li>
              </ul>
              <button
                onClick={onNavigateToGlobe}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
              >
                View 3D Globe →
              </button>
            </div>

            {/* Camera Module */}
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-purple-500 text-xs font-bold">
                Module 2
              </div>
              <div className="text-6xl mb-6">📷</div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">AI Camera</h3>
              <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
                Live Photo 3초 촬영으로 15프레임 특징을 추출하고, CNN-LSTM CoreML 모델로
                온디바이스 추론하여 삼중 검증된 PM2.5 값을 제공합니다.
              </p>
              <ul className="space-y-3 text-sm md:text-base text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span><strong>Live Photo 캡처</strong> 3초 30프레임 품질 스코어링</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span><strong>CoreML 추론</strong> {'<'}2초 온디바이스 처리</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span><strong>삼중 검증</strong> 측정소·카메라·위성 융합</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span><strong>베이지안 가중</strong> 불확실도 및 신뢰도 산출</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Triple Verification System */}
      <div id="features" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">삼중 검증 시스템</h2>
            <p className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              세 가지 독립적인 데이터 소스를 베이지안 가중 융합하여 최고 수준의 정확도를 보장합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 md:mb-6 shadow-2xl">
                T1
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">측정소 데이터</h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-4">
                근접 5개 측정소 IDW 보간
              </p>
              <div className="text-xs md:text-sm text-gray-500">
                WAQI 실시간 API • 10분 TTL 캐시
              </div>
            </div>

            <div className="text-center p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 md:mb-6 shadow-2xl">
                T2
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">카메라 AI 예측</h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-4">
                CNN-LSTM 모델 온디바이스 추론
              </p>
              <div className="text-xs md:text-sm text-gray-500">
                CoreML FP16 • {'<'}2초 추론 시간
              </div>
            </div>

            <div className="text-center p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 md:mb-6 shadow-2xl">
                T3
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">위성 AOD</h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-4">
                Sentinel-5P 변환 + 보정계수
              </p>
              <div className="text-xs md:text-sm text-gray-500">
                3시간 주기 업데이트 • 지역 보정
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <div className="inline-block px-6 md:px-8 py-4 md:py-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10">
              <p className="text-base md:text-lg font-semibold text-white mb-2">
                베이지안 가중 융합 결과
              </p>
              <p className="text-sm md:text-base text-gray-300">
                최종 PM2.5 ± 불확실도 • 신뢰도 점수 • RMSE {'<'} 8.5 μg/m³
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">모든 사용자를 위한 설계</h2>
            <p className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              시각장애인을 포함한 모든 사용자에게 직관적인 대기질 인지 경험을 제공합니다
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">♿</span>}
              title="VoiceOver 완벽 지원"
              description="모든 UI 요소에 명확한 라벨과 힌트 제공. 정책 요약과 건강 가이드를 음성으로 안내합니다."
              gradient="from-blue-500 to-blue-600"
            />
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">📳</span>}
              title="진동 레벨 피드백"
              description="AQI 단계별 차별화된 햅틱 패턴. 예측 완료와 경보 발생 시 즉각적인 촉각 피드백."
              gradient="from-purple-500 to-purple-600"
            />
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">🎨</span>}
              title="색상 대비 강화"
              description="색각 보정 팔레트 지원. AQI 단계별 높은 대비 색상으로 명확한 구분 가능."
              gradient="from-green-500 to-green-600"
            />
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">🔍</span>}
              title="Dynamic Type"
              description="시스템 글꼴 크기에 자동 대응. 큰 버튼 모드와 간소화된 인터페이스 제공."
              gradient="from-orange-500 to-orange-600"
            />
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">추가 기능</h2>
            <p className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              완벽한 대기질 모니터링을 위한 모든 것
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">📍</span>}
              title="정밀 위치 인식"
              description="CoreLocation 기반 {'<'}10m 정확도. 100m/30s 업데이트로 배터리 효율 극대화."
              gradient="from-blue-500 to-blue-600"
              badge="<10초"
            />
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">📡</span>}
              title="오프라인 모드"
              description="최근 측정소/위성 데이터 7일 캐시. SQLite/Realm 기반 로컬 저장소로 인터넷 없이도 동작."
              gradient="from-purple-500 to-purple-600"
            />
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">📊</span>}
              title="정책 정보"
              description="EPA, AirKorea, EEA 등 신뢰 소스. 국가별 규제/목표/업데이트, 신뢰도 배지 제공."
              gradient="from-green-500 to-green-600"
            />
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">🔔</span>}
              title="실시간 알림"
              description="AQI 급상승 또는 정책 업데이트 발생 시 로컬 알림. Live Activity로 경보 상태 표시."
              gradient="from-orange-500 to-orange-600"
            />
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">📱</span>}
              title="위젯 지원"
              description="홈 화면 위젯으로 현재 위치 PM2.5 및 추세 확인. 앱 실행 없이 빠른 조회."
              gradient="from-teal-500 to-teal-600"
            />
            <FeatureCard
              icon={<span className="text-2xl md:text-3xl">🔒</span>}
              title="완벽한 프라이버시"
              description="이미지 영구 저장 금지. 특징 벡터만 일시 저장. 민감 정보는 키체인 암호화."
              gradient="from-pink-500 to-pink-600"
              badge="100%"
            />
          </div>
        </div>
      </div>

      {/* How It Works - Updated */}
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">작동 원리</h2>
            <p className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              3단계 간단한 프로세스로 정확한 대기질 측정
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 md:mb-6 shadow-2xl">
                1
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Live Photo 캡처</h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed px-2">
                3초 동안 30프레임 캡처 → 품질 스코어링 → 상위 15프레임 특징 추출
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 md:mb-6 shadow-2xl">
                2
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">삼중 검증</h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed px-2">
                측정소 IDW + 카메라 CoreML + 위성 AOD → 베이지안 융합
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 md:mb-6 shadow-2xl">
                3
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">결과 제공</h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed px-2">
                최종 PM2.5 ± 불확실도, 신뢰도, 소스별 분해값, 이력 비교
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">기술 스택</h2>
            <p className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              최첨단 iOS 네이티브 기술로 구현
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {[
              'SwiftUI', 'CoreML', 'SceneKit', 'Metal', 'AVFoundation',
              'CoreLocation', 'CoreHaptics', 'VoiceOver', 'SQLite/Realm',
              'iCloud', 'WidgetKit', 'Live Activity', 'FP16 Optimization',
              'CNN-LSTM', 'Bayesian Fusion'
            ].map((tech) => (
              <TechBadge key={tech} tech={tech} />
            ))}
          </div>

          <div className="mt-8 md:mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <div className="text-xl md:text-2xl font-bold text-white mb-2">iOS 15+</div>
              <div className="text-xs md:text-sm text-gray-400">iPhone 12 이상 최적화</div>
            </div>
            <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <div className="text-xl md:text-2xl font-bold text-white mb-2">{'<'} 200MB</div>
              <div className="text-xs md:text-sm text-gray-400">Camera 메모리 사용량</div>
            </div>
            <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <div className="text-xl md:text-2xl font-bold text-white mb-2">{'<'} 2%</div>
              <div className="text-xs md:text-sm text-gray-400">예측 1회당 배터리 소모</div>
            </div>
            <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <div className="text-xl md:text-2xl font-bold text-white mb-2">{'<'} 0.1%</div>
              <div className="text-xs md:text-sm text-gray-400">크래시율 목표</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">성능 기준</h2>
            <p className="text-base md:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              엄격한 품질 기준을 충족하는 최적화된 성능
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-3 md:mb-4">{'<'} 10초</div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-2">예측 완료 시간</h4>
              <p className="text-sm md:text-base text-gray-400">카메라 캡처부터 최종 결과까지</p>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/20">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-3 md:mb-4">{'<'} 2초</div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-2">CoreML 추론</h4>
              <p className="text-sm md:text-base text-gray-400">온디바이스 모델 실행 시간</p>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-green-500/5 to-green-600/5 border border-green-500/20">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-3 md:mb-4">60 FPS</div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-2">Globe 렌더링</h4>
              <p className="text-sm md:text-base text-gray-400">30k 마커 표시 시에도 유지</p>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-orange-500/5 to-orange-600/5 border border-orange-500/20">
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-3 md:mb-4">{'<'} 10초</div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-2">위치 확정</h4>
              <p className="text-sm md:text-base text-gray-400">{'<'}10m 정확도 달성</p>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-teal-500/5 to-teal-600/5 border border-teal-500/20">
              <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-3 md:mb-4">{'<'} 8.5</div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-2">RMSE μg/m³</h4>
              <p className="text-sm md:text-base text-gray-400">예측 정확도 목표</p>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-pink-500/5 to-pink-600/5 border border-pink-500/20">
              <div className="text-3xl md:text-4xl font-bold text-pink-400 mb-3 md:mb-4">7일</div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-2">캐시 보존</h4>
              <p className="text-sm md:text-base text-gray-400">오프라인 데이터 유지 기간</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">대기질 측정을 시작하세요</h2>
            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              삼중 검증 시스템과 온디바이스 AI로 가장 정확한 대기질 정보를 제공합니다.
              <br className="hidden sm:block" />
              지금 바로 시작하세요. 가입이나 로그인이 필요하지 않습니다.
            </p>
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-10 md:px-12 py-5 md:py-6 rounded-2xl bg-white text-blue-600 font-bold text-base md:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.05] active:scale-[0.98] transition-all duration-200"
            >
              Launch AirLens Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-3 md:mb-4 text-sm md:text-base">
            <span className="font-semibold text-white">AirLens</span> • Made with ❤️ by joymin5655
          </p>
          <p className="text-xs md:text-sm">
            <a href="https://github.com/joymin5655/Finedust_proj" className="hover:text-white transition-colors">
              View on GitHub
            </a>
            {' • '}
            <span>On-Device CoreML Processing</span>
            {' • '}
            <span>100% Privacy • Zero External APIs</span>
          </p>
          <p className="text-xs text-gray-500 mt-3 md:mt-4">
            iOS 15+ • iPhone 12+ Optimized • VoiceOver Accessible
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
