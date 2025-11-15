/**
 * Policy Markers Module - Globe 위에 정책 마커 표시 및 관리
 * 참고: react-globe.gl의 마커 스타일을 적용
 * 
 * 기능:
 * - 글로브 위에 작은 Policy 마커 렌더링
 * - 마커 클릭으로 정책 정보 표시
 * - 마커 호버 효과 (확대, 빛남)
 * - 마커 애니메이션 (펄스, 스핀)
 */

class PolicyMarkersManager {
    constructor(globeContainer, canvasElement) {
        this.globeContainer = globeContainer;
        this.canvasElement = canvasElement;
        this.markers = new Map();
        this.markersContainer = null;
        this.policies = [];
        this.selectedCountry = null;
        
        this.init();
    }

    init() {
        // 마커 컨테이너 생성
        this.markersContainer = document.createElement('div');
        this.markersContainer.id = 'policy-markers-container';
        this.markersContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
        `;
        
        const globeContainer = document.getElementById('globe-container');
        if (globeContainer) {
            globeContainer.appendChild(this.markersContainer);
        }
        
        console.log('✅ Policy Markers Manager initialized');
    }

    /**
     * 정책 마커 렌더링
     * @param {Array} policies - 정책 데이터 배열
     * @param {Function} onMarkerClick - 마커 클릭 콜백
     */
    renderMarkers(policies, onMarkerClick) {
        this.policies = policies;
        this.onMarkerClick = onMarkerClick;
        
        // 기존 마커 제거
        this.clearMarkers();
        
        // 각 정책마다 마커 생성
        policies.forEach(policy => {
            if (policy.latitude && policy.longitude) {
                this.createMarker(policy);
            }
        });
        
        console.log(`✅ Rendered ${this.markers.size} policy markers`);
    }

    /**
     * 단일 마커 생성
     */
    createMarker(policy) {
        const marker = document.createElement('div');
        marker.className = 'policy-marker';
        marker.style.pointerEvents = 'auto';
        marker.dataset.country = policy.country;
        marker.dataset.lat = policy.latitude;
        marker.dataset.lon = policy.longitude;
        
        // 마커 콘텐츠 (아이콘)
        const flagEmoji = this.getCountryFlag(policy.country);
        marker.innerHTML = `
            <div style="
                font-size: 16px;
                filter: drop-shadow(0 0 4px rgba(37, 226, 244, 0.6));
                transition: all 0.2s ease;
            ">
                ${flagEmoji}
            </div>
            <div class="policy-tooltip">
                <strong>${policy.country}</strong><br/>
                ${policy.title || 'Policy'}
            </div>
        `;
        
        // 클릭 이벤트
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectMarker(marker, policy);
            if (this.onMarkerClick) {
                this.onMarkerClick(policy);
            }
        });
        
        // 마우스 이벤트
        marker.addEventListener('mouseenter', () => {
            marker.style.zIndex = '10';
        });
        
        marker.addEventListener('mouseleave', () => {
            marker.style.zIndex = '5';
        });
        
        this.markersContainer.appendChild(marker);
        this.markers.set(policy.country, { marker, policy });
        
        // 초기 위치 설정
        this.updateMarkerPosition(marker, policy.latitude, policy.longitude);
    }

    /**
     * 마커 선택
     */
    selectMarker(marker, policy) {
        // 이전 선택된 마커 해제
        this.markers.forEach(item => {
            item.marker.classList.remove('active');
        });
        
        // 현재 마커 활성화
        marker.classList.add('active');
        this.selectedCountry = policy.country;
    }

    /**
     * 마커 선택 해제
     */
    deselectMarker() {
        if (this.selectedCountry) {
            const markerItem = this.markers.get(this.selectedCountry);
            if (markerItem) {
                markerItem.marker.classList.remove('active');
            }
        }
        this.selectedCountry = null;
    }

    /**
     * 마커 위치 업데이트 (3D 좌표 → 2D 스크린 좌표)
     * globe.js의 projection 함수와 연동 필요
     */
    updateMarkerPosition(marker, lat, lon) {
        // 나중에 globe.js의 projection 함수와 연동
        // 현재는 기본 위치 계산
        const canvasRect = this.canvasElement.getBoundingClientRect();
        
        // 간단한 메르카토르 투영
        const x = ((lon + 180) / 360) * canvasRect.width;
        const y = ((90 - lat) / 180) * canvasRect.height;
        
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
    }

    /**
     * 국가별 국기 이모지 반환
     */
    getCountryFlag(country) {
        const flagMap = {
            'South Korea': '🇰🇷',
            'North Korea': '🇰🇵',
            'China': '🇨🇳',
            'Japan': '🇯🇵',
            'India': '🇮🇳',
            'Bangladesh': '🇧🇩',
            'Pakistan': '🇵🇰',
            'United States': '🇺🇸',
            'Canada': '🇨🇦',
            'Mexico': '🇲🇽',
            'United Kingdom': '🇬🇧',
            'Germany': '🇩🇪',
            'France': '🇫🇷',
            'Italy': '🇮🇹',
            'Spain': '🇪🇸',
            'Poland': '🇵🇱',
            'Russia': '🇷🇺',
            'Australia': '🇦🇺',
            'Brazil': '🇧🇷',
            'Argentina': '🇦🇷'
        };
        
        return flagMap[country] || '🌍';
    }

    /**
     * 모든 마커 제거
     */
    clearMarkers() {
        this.markers.forEach(item => {
            item.marker.remove();
        });
        this.markers.clear();
    }

    /**
     * 글로브 회전에 따라 마커 위치 업데이트 (animation frame callback)
     */
    updateAllMarkerPositions() {
        this.markers.forEach(item => {
            this.updateMarkerPosition(
                item.marker,
                item.policy.latitude,
                item.policy.longitude
            );
        });
    }

    /**
     * 특정 국가로 스크롤
     */
    focusCountry(countryName) {
        const markerItem = this.markers.get(countryName);
        if (markerItem) {
            markerItem.marker.classList.add('active');
            // globe.js의 rotate 함수와 연동 필요
            console.log(`🔍 Focusing on: ${countryName}`);
        }
    }

    /**
     * 마커 필터링 (검색)
     */
    filterMarkers(searchTerm) {
        this.markers.forEach(item => {
            const matches = item.policy.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.policy.title && item.policy.title.toLowerCase().includes(searchTerm.toLowerCase()));
            item.marker.style.opacity = matches ? '1' : '0.3';
            item.marker.style.pointerEvents = matches ? 'auto' : 'none';
        });
    }

    /**
     * 모든 마커 표시
     */
    showAllMarkers() {
        this.markers.forEach(item => {
            item.marker.style.opacity = '1';
            item.marker.style.pointerEvents = 'auto';
        });
    }

    /**
     * 마커 가시성 토글
     */
    toggleMarkerVisibility(visible) {
        this.markersContainer.style.display = visible ? 'block' : 'none';
    }
}

// 내보내기
export default PolicyMarkersManager;
