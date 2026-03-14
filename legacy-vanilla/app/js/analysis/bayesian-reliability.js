/**
 * bayesian-reliability.js — Bayesian Sensor Reliability Engine
 * ─────────────────────────────────────────────────────────────
 * Production Spec §11: 센서 신뢰도 실시간 업데이트
 *
 * 센서 i의 신뢰도를 Beta 분포로 모델링:
 *   R_i ~ Beta(α, β)
 *   Prior: α₀=5, β₀=3 → 초기 기대값 0.625
 *
 * 관측마다 성공/실패 업데이트:
 *   성공: |obs - pred| ≤ τ → α += 1
 *   실패: |obs - pred| > τ → β += 1
 *
 * Posterior mean: E[R_i] = α / (α + β)
 * 95% credible interval via Beta quantiles (근사)
 *
 * 향후 확장:
 *   - 거리 기반 가중 관측
 *   - Bayesian Network (기상 불안정도 노드)
 *   - 시간 감쇠 (오래된 관측 영향 감소)
 *
 * @module analysis/bayesian-reliability
 */

// ── Default Parameters ───────────────────────────────────────
const DEFAULT_ALPHA = 5;
const DEFAULT_BETA = 3;
const DEFAULT_TAU = 8.0;     // µg/m³ residual threshold
const DECAY_FACTOR = 0.995;  // 시간 감쇠: 매 스텝마다 α,β에 곱하기

/**
 * 센서 신뢰도 상태 객체
 */
export class SensorReliability {
  /**
   * @param {string} stationId
   * @param {number} [alpha=5]
   * @param {number} [beta=3]
   */
  constructor(stationId, alpha = DEFAULT_ALPHA, beta = DEFAULT_BETA) {
    this.stationId = stationId;
    this.alpha = alpha;
    this.beta = beta;
    this.updateCount = 0;
    this.lastUpdated = null;
  }

  /** Posterior mean: E[R] = α / (α + β) */
  get reliability() {
    return this.alpha / (this.alpha + this.beta);
  }

  /** 총 관측 수 (α + β - 초기값) */
  get totalObservations() {
    return this.updateCount;
  }

  /** 95% credible interval (Normal 근사) */
  get credibleInterval() {
    const mean = this.reliability;
    const n = this.alpha + this.beta;
    const se = Math.sqrt((mean * (1 - mean)) / n);
    return {
      lower: Math.max(0, mean - 1.96 * se),
      upper: Math.min(1, mean + 1.96 * se),
    };
  }

  /** 신뢰도 등급 */
  get grade() {
    const r = this.reliability;
    if (r >= 0.85) return 'Excellent';
    if (r >= 0.70) return 'Good';
    if (r >= 0.50) return 'Fair';
    if (r >= 0.30) return 'Poor';
    return 'Unreliable';
  }

  /**
   * 단일 관측 업데이트
   * @param {number} residual - |obs - pred|
   * @param {number} [tau=8] - 성공 임계값
   * @param {boolean} [applyDecay=true] - 시간 감쇠 적용
   */
  update(residual, tau = DEFAULT_TAU, applyDecay = true) {
    // 시간 감쇠: 최근 관측에 더 높은 가중치
    if (applyDecay) {
      this.alpha *= DECAY_FACTOR;
      this.beta *= DECAY_FACTOR;
    }

    if (Math.abs(residual) <= tau) {
      this.alpha += 1;
    } else {
      this.beta += 1;
    }

    this.updateCount++;
    this.lastUpdated = new Date().toISOString();
    return this.reliability;
  }

  /**
   * 배치 업데이트 (여러 관측 한꺼번에)
   * @param {Array<number>} residuals
   * @param {number} [tau=8]
   */
  batchUpdate(residuals, tau = DEFAULT_TAU) {
    const successes = residuals.filter(r => Math.abs(r) <= tau).length;
    const failures = residuals.length - successes;

    // 시간 감쇠는 배치 전체에 1회만 적용
    this.alpha = this.alpha * DECAY_FACTOR + successes;
    this.beta = this.beta * DECAY_FACTOR + failures;

    this.updateCount += residuals.length;
    this.lastUpdated = new Date().toISOString();
    return this.reliability;
  }

  /** 직렬화 */
  toJSON() {
    return {
      stationId: this.stationId,
      alpha: Math.round(this.alpha * 1000) / 1000,
      beta: Math.round(this.beta * 1000) / 1000,
      reliability: Math.round(this.reliability * 1000) / 1000,
      grade: this.grade,
      credibleInterval: this.credibleInterval,
      updateCount: this.updateCount,
      lastUpdated: this.lastUpdated,
    };
  }

  /** 역직렬화 */
  static fromJSON(json) {
    const s = new SensorReliability(json.stationId, json.alpha, json.beta);
    s.updateCount = json.updateCount || 0;
    s.lastUpdated = json.lastUpdated || null;
    return s;
  }
}

// ── Reliability Engine (전체 관측소 관리) ─────────────────────

/**
 * 전체 관측소의 Bayesian 신뢰도를 관리하는 엔진
 */
export class BayesianReliabilityEngine {
  constructor() {
    /** @type {Map<string, SensorReliability>} */
    this.sensors = new Map();
  }

  /**
   * 센서 등록 (없으면 생성)
   */
  getOrCreate(stationId, alpha = DEFAULT_ALPHA, beta = DEFAULT_BETA) {
    if (!this.sensors.has(stationId)) {
      this.sensors.set(stationId, new SensorReliability(stationId, alpha, beta));
    }
    return this.sensors.get(stationId);
  }

  /**
   * 단일 관측 업데이트
   */
  updateSensor(stationId, residual, tau = DEFAULT_TAU) {
    const sensor = this.getOrCreate(stationId);
    return sensor.update(residual, tau);
  }

  /**
   * 전체 관측소 배치 업데이트
   * @param {Array<{stationId, residuals}>} batch
   */
  batchUpdateAll(batch, tau = DEFAULT_TAU) {
    const results = {};
    for (const { stationId, residuals } of batch) {
      const sensor = this.getOrCreate(stationId);
      results[stationId] = sensor.batchUpdate(residuals, tau);
    }
    return results;
  }

  /**
   * 특정 센서의 신뢰도 조회
   */
  getReliability(stationId) {
    const sensor = this.sensors.get(stationId);
    return sensor ? sensor.reliability : null;
  }

  /**
   * 전체 센서 요약 통계
   */
  getSummary() {
    const reliabilities = [];
    const grades = { Excellent: 0, Good: 0, Fair: 0, Poor: 0, Unreliable: 0 };

    for (const [, sensor] of this.sensors) {
      reliabilities.push(sensor.reliability);
      grades[sensor.grade] = (grades[sensor.grade] || 0) + 1;
    }

    const n = reliabilities.length;
    return {
      totalSensors: n,
      meanReliability: n > 0 ? reliabilities.reduce((s, v) => s + v, 0) / n : 0,
      grades,
      lowReliabilityCount: reliabilities.filter(r => r < 0.5).length,
    };
  }

  /**
   * 신뢰도 가중 PM2.5 평균 계산
   * (DQSS, 정책 분석에서 품질가중 평균에 사용)
   */
  weightedAverage(observations) {
    let weightSum = 0;
    let valueSum = 0;

    for (const obs of observations) {
      if (obs.pm25 == null) continue;
      const sensor = this.sensors.get(obs.stationId || obs.id);
      const weight = sensor ? sensor.reliability : 0.5; // 미등록 센서는 0.5
      weightSum += weight;
      valueSum += weight * obs.pm25;
    }

    return weightSum > 0 ? valueSum / weightSum : null;
  }

  /** 전체 직렬화 */
  toJSON() {
    const data = {};
    for (const [id, sensor] of this.sensors) {
      data[id] = sensor.toJSON();
    }
    return data;
  }

  /** 역직렬화 */
  static fromJSON(json) {
    const engine = new BayesianReliabilityEngine();
    for (const [id, sData] of Object.entries(json)) {
      engine.sensors.set(id, SensorReliability.fromJSON(sData));
    }
    return engine;
  }
}

// 싱글턴 인스턴스
export const reliabilityEngine = new BayesianReliabilityEngine();

export default { SensorReliability, BayesianReliabilityEngine, reliabilityEngine };
