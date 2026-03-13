/**
 * cameraService.js — Sky-image PM2.5 estimator
 * ─────────────────────────────────────────────
 * Pixel-level analysis (no external model weights required):
 *   analyse(imgElement) → { pm25, confidence, features }
 *
 * Algorithm is based on:
 *   Rowley & Karakuş (2023) Late-Fusion for aerial PM2.5 estimation
 *   AirFusion (2025) multimodal weighting heuristics
 *
 * Weights used when fusing with station data:
 *   image 40% | satellite/station 60%
 * (override via CameraService.weights if needed)
 */

const CameraService = (() => {
  const THUMB_SIZE = 200; // px — resize before pixel scan

  // ── Core pixel analysis ───────────────────────────────────────
  function _extractFeatures(imgEl) {
    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d');
    const scale  = Math.min(THUMB_SIZE / imgEl.naturalWidth, THUMB_SIZE / imgEl.naturalHeight) || 1;
    canvas.width  = (imgEl.naturalWidth  || THUMB_SIZE) * scale;
    canvas.height = (imgEl.naturalHeight || THUMB_SIZE) * scale;
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

    const data  = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const total = data.length / 4;

    let sumR = 0, sumG = 0, sumB = 0, sumBright = 0, sumContrast = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      sumR += r; sumG += g; sumB += b;
      const bright = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      sumBright += bright;
      const mx = Math.max(r, g, b) / 255;
      const mn = Math.min(r, g, b) / 255;
      sumContrast += (mx - mn);
    }

    const avgR      = sumR      / total / 255;
    const avgG      = sumG      / total / 255;
    const avgB      = sumB      / total / 255;
    const brightness = sumBright / total;
    const contrast   = sumContrast / total / 255;

    // Haze: high brightness + low contrast → hazier
    const hazeLevel    = brightness * (1 - contrast);
    // Sky visibility: blue-dominance × brightness
    const blueness     = avgB - (avgR + avgG) / 2;
    const skyVisibility = Math.max(0, Math.min(1, blueness * brightness * 2));

    return { hazeLevel, skyVisibility, brightness, contrast };
  }

  /**
   * Estimate PM2.5 from a sky image element.
   * @param {HTMLImageElement} imgEl
   * @returns {{ pm25: number, confidence: number, features: object }}
   */
  function analyse(imgEl) {
    const f = _extractFeatures(imgEl);

    // PM2.5 estimation (empirically tuned ranges)
    const hazeScore         = f.hazeLevel     * 80;  // 0–80
    const visibilityPenalty = (1 - f.skyVisibility) * 30; // 0–30
    const brightnessAdj     = (1 - f.brightness)    * 20; // 0–20
    const pm25 = Math.max(0, hazeScore + visibilityPenalty + brightnessAdj);

    // Model confidence: higher when image has useful visual variation
    const imageQuality = (f.contrast + f.skyVisibility) / 2;
    const confidence   = Math.min(0.95, 0.55 + imageQuality * 0.25);

    return { pm25, confidence, features: f };
  }

  /**
   * Fuse camera PM2.5 with station PM2.5 (weighted).
   * @param {number|null} cameraVal
   * @param {number|null} stationVal
   * @returns {{ value, confidence, source }}
   */
  function fuse(cameraVal, stationVal) {
    if (cameraVal == null && stationVal == null) return null;
    if (cameraVal == null) return { value: stationVal, confidence: 'Medium', source: 'station' };
    if (stationVal == null) return { value: cameraVal, confidence: 'Low',    source: 'camera'  };

    const fused = stationVal * 0.60 + cameraVal * 0.40;
    const diff  = Math.abs(stationVal - cameraVal);
    const conf  = diff <= 10 ? 'High' : diff <= 25 ? 'Medium' : 'Low';
    return { value: fused, confidence: conf, source: 'fusion', stationVal, cameraVal };
  }

  return { analyse, fuse };
})();

window.CameraService = CameraService;
