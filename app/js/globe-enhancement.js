/**
 * globe-enhancement.js — Safe Globe Enhancement (v4.0 Refactored)
 * ────────────────────────────────────────────────────────────────
 * ⚠️ v3.0 문제: init/animate/onClick/onMouseMove를 덮어씌워
 *    기존 mixin 로직(clouds, markers, particles 등)이 유실됨.
 *
 * v4.0 방침:
 *   - 기존 메서드를 절대 덮어쓰지 않음
 *   - 추가 기능만 prototype에 안전하게 추가
 *   - init 후 콜백 형태로 enhancement 초기화
 */

import { EnhancedPolicyVisualization } from './services/policy/policy-visualization.js';
// PolicyComparisonPanel → Policy Explorer에 통합, 독립 패널 사용 안 함
import { dataIntegrationService } from './services/policy/data-integration-service.js';

export function enhanceGlobe(PolicyGlobe) {
  const P = PolicyGlobe.prototype;

  // ── 안전한 enhancement 초기화 (init 덮어쓰기 X) ─────────
  // globe-core.js의 backgroundLoadData 완료 후 호출됨
  P._initEnhancement = async function () {
    try {
      // Enhanced policy visualization (Three.js 기반)
      if (this.scene && this.earth) {
        this.enhancedPolicyViz = new EnhancedPolicyVisualization(this.scene, this.earth);
      }

      // PolicyComparisonPanel은 독립 패널로 표시하지 않음
      // → Policy Explorer(control-panel) 안에서 국가 선택 시 데이터 표시
      // this.comparisonPanel = new PolicyComparisonPanel(); // ← 제거

      // 데이터 통합 서비스 구독
      this._setupEnhancementSubscriptions();

      // 최적화된 정책 데이터 로드
      await this._loadEnhancedPolicyData();

      console.log('✅ Globe enhancements initialized (safe mode)');
    } catch (error) {
      console.warn('⚠️ Globe enhancement init failed (non-critical):', error.message);
    }
  };

  // ── 데이터 구독 ────────────────────────────────────────────
  P._setupEnhancementSubscriptions = function () {
    try {
      this._enhancementUnsub = dataIntegrationService.subscribe?.((event) => {
        const { type, data } = event?.detail || {};
        if (type === 'policy_impact' && data) {
          // Policy Explorer 패널에서 이 데이터를 활용 (showCountryPolicy에서 처리)
          console.log(`[Enhancement] Policy impact event: ${data.country || data.title}`);
        }
      });
    } catch (e) {
      // dataIntegrationService가 없을 수 있음 — 무시
    }
  };

  // ── 강화된 정책 마커 데이터 로드 ──────────────────────────
  P._loadEnhancedPolicyData = async function () {
    if (!this.enhancedPolicyViz) return;

    try {
      const policies = dataIntegrationService?.centralStore?.policies;
      const comparisons = dataIntegrationService?.centralStore?.comparisons;
      if (!policies || policies.size === 0) return;

      let count = 0;
      for (const [id, policy] of policies) {
        if (policy.latitude && policy.longitude) {
          const comparison = comparisons?.get(id);
          const effectiveness = this._calcEffectiveness(comparison);

          this.enhancedPolicyViz.createPolicyMarker({
            id: policy.id, lat: policy.latitude, lon: policy.longitude,
            country: policy.country, effectiveness,
            title: policy.title, implementation_date: policy.implementation_date
          });

          if (comparison) {
            this.enhancedPolicyViz.setPolicyComparisonData?.(
              policy.id,
              { pm25: comparison.before?.average },
              { pm25: comparison.after?.average }
            );
          }
          count++;
        }
      }
      if (count > 0) console.log(`✅ Enhanced policy markers: ${count}`);
    } catch (e) {
      // 데이터 없을 때 조용히 실패
    }
  };

  P._calcEffectiveness = function (comparison) {
    if (!comparison) return 'moderate';
    const improvement = parseFloat(comparison.improvement) || 0;
    if (improvement > 30) return 'highly_effective';
    if (improvement > 20) return 'effective';
    if (improvement > 10) return 'moderate';
    if (improvement > 0) return 'low';
    return 'minimal';
  };

  // ── LOD 최적화 (animate에서 선택적 호출) ──────────────────
  P._updateEnhancementLOD = function () {
    if (!this.enhancedPolicyViz) return;
    const distance = this.camera?.position?.length() || 2.5;
    const visible = distance <= 3;
    this.enhancedPolicyViz.setVisible?.(visible);
  };

  // ── 정리 ──────────────────────────────────────────────────
  P._disposeEnhancement = function () {
    if (this._enhancementUnsub) this._enhancementUnsub();
    if (this.enhancedPolicyViz) this.enhancedPolicyViz.clearAllMarkers?.();
  };
}
