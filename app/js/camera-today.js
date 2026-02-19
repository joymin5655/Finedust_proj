/**
 * camera-today.js
 * Today 뷰 전용 카메라 AI 경량 래퍼
 * camera.js의 이미지 분석 로직을 재사용하되, Today DOM에 맞게 연결
 */

(function () {
  // DOM 존재 확인 (today.html 전용)
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  if (!dropZone || !fileInput) return;

  const previewContainer = document.getElementById('preview-container');
  const previewImage = document.getElementById('preview-image');
  const clearBtn = document.getElementById('clear-btn');
  const cameraResult = document.getElementById('camera-result');
  const camPmValue = document.getElementById('cam-pm-value');
  const camConfidenceBar = document.getElementById('cam-confidence-bar');
  const camConfidenceText = document.getElementById('cam-confidence-text');

  // ── 드래그앤드롭 이벤트 ──
  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  });

  clearBtn && clearBtn.addEventListener('click', clearImage);

  // ── 파일 처리 ──
  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      dropZone.style.display = 'none';
      previewContainer.style.display = 'flex';
      previewContainer.style.flexDirection = 'column';
      analyzeImage();
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    dropZone.style.display = 'flex';
    previewContainer.style.display = 'none';
    previewImage.src = '';
    fileInput.value = '';
    if (cameraResult) cameraResult.style.display = 'none';
  }

  // ── 이미지 분석 (픽셀 기반 PM2.5 추정) ──
  async function analyzeImage() {
    if (cameraResult) cameraResult.style.display = 'block';
    if (camPmValue) camPmValue.textContent = '분석 중...';

    await new Promise(r => setTimeout(r, 400)); // UX 딜레이

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = previewImage;

    const maxSize = 200;
    const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight);
    canvas.width = (img.naturalWidth || 200) * scale;
    canvas.height = (img.naturalHeight || 200) * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixelCount = pixels.length / 4;

    let totalR = 0, totalG = 0, totalB = 0, totalBrightness = 0;
    let totalContrast = 0, totalSaturation = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
      totalR += r; totalG += g; totalB += b;
      const brightness = (0.299*r + 0.587*g + 0.114*b) / 255;
      totalBrightness += brightness;
      const max = Math.max(r,g,b)/255, min = Math.min(r,g,b)/255;
      totalSaturation += max === 0 ? 0 : (max-min)/max;
      totalContrast += (max - min);
    }

    const avgR = totalR / pixelCount / 255;
    const avgG = totalG / pixelCount / 255;
    const avgB = totalB / pixelCount / 255;
    const avgBrightness = totalBrightness / pixelCount;
    const avgContrast = totalContrast / pixelCount / 255;

    const hazeLevel = avgBrightness * (1 - avgContrast);
    const blueness = avgB - (avgR + avgG) / 2;
    const skyVisibility = Math.max(0, Math.min(1, blueness * avgBrightness * 2));

    // PM2.5 추정
    const hazeScore = hazeLevel * 80;
    const visibilityPenalty = (1 - skyVisibility) * 30;
    const brightnessAdj = (1 - avgBrightness) * 20;
    const cameraPM25 = Math.max(0, hazeScore + visibilityPenalty + brightnessAdj);

    // 신뢰도
    const imageQuality = (avgContrast + skyVisibility) / 2;
    const confidence = 0.55 + imageQuality * 0.20;

    // UI 업데이트
    if (camPmValue) camPmValue.textContent = cameraPM25.toFixed(1);
    if (camConfidenceBar) camConfidenceBar.style.width = `${(confidence * 100).toFixed(0)}%`;
    if (camConfidenceText) camConfidenceText.textContent = `모델 신뢰도 ${(confidence * 100).toFixed(0)}%`;

    // today.js 콜백으로 통합 계산 트리거
    if (typeof window.onCameraPM25 === 'function') {
      window.onCameraPM25(cameraPM25);
    }
  }
})();
