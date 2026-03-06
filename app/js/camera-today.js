/**
 * camera-today.js — Sky-photo upload handler for Today (index.html)
 * ──────────────────────────────────────────────────────────────────
 * Delegates pixel analysis to CameraService.analyse() so the
 * algorithm lives in one place.  Calls window.onCameraPM25(pm25)
 * when analysis completes so today.js can re-fuse the result.
 */

(function CameraTodayInit() {
  const dropZone    = document.getElementById('drop-zone');
  const fileInput   = document.getElementById('file-input');
  if (!dropZone || !fileInput) return; // guard: only runs on index.html

  const previewContainer = document.getElementById('preview-container');
  const previewImage     = document.getElementById('preview-image');
  const clearBtn         = document.getElementById('clear-btn');
  const cameraResult     = document.getElementById('camera-result');
  const camPmValue       = document.getElementById('cam-pm-value');
  const camConfBar       = document.getElementById('cam-confidence-bar');
  const camConfText      = document.getElementById('cam-confidence-text');

  // ── Drag-and-drop ────────────────────────────────────────────
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) loadFile(f);
  });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
  clearBtn?.addEventListener('click', reset);

  // ── File → preview → analyse ─────────────────────────────────
  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      previewImage.src = ev.target.result;
      dropZone.style.display = 'none';
      previewContainer.style.display = 'flex';
      previewContainer.style.flexDirection = 'column';
      // Wait for image to decode before pixel-scanning
      previewImage.onload = runAnalysis;
    };
    reader.readAsDataURL(file);
  }

  function reset() {
    dropZone.style.display = 'flex';
    previewContainer.style.display = 'none';
    previewImage.src = '';
    fileInput.value  = '';
    if (cameraResult) cameraResult.style.display = 'none';
  }

  async function runAnalysis() {
    if (cameraResult) cameraResult.style.display = 'block';
    if (camPmValue)   camPmValue.textContent = '…';

    await new Promise(r => setTimeout(r, 300)); // brief UX pause

    // ── CameraService does the pixel math ────────────────────
    const { pm25, confidence } = window.CameraService
      ? CameraService.analyse(previewImage)
      : _fallbackAnalyse(previewImage);

    // ── Update UI ─────────────────────────────────────────────
    if (camPmValue)  camPmValue.textContent = pm25.toFixed(1);
    if (camConfBar)  camConfBar.style.width = `${(confidence * 100).toFixed(0)}%`;
    if (camConfText) {
      const label = window.I18n?.t('today.camera.confidence') ?? 'Model confidence';
      camConfText.textContent = `${label} ${(confidence * 100).toFixed(0)}%`;
    }

    // Notify today.js → fuse with station PM2.5
    window.onCameraPM25?.(pm25);
  }

  // Fallback if cameraService.js failed to load (should not happen)
  function _fallbackAnalyse(img) {
    return { pm25: 25, confidence: 0.5 };
  }
})();
