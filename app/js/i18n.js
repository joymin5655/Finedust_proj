/**
 * i18n.js - AirLens Internationalization System
 * Translates all [data-i18n] elements based on localStorage 'language' key.
 * Supported: en (default), ko, ja, zh, es, fr
 *
 * Usage in HTML:  <span data-i18n="nav.home">Home</span>
 * Usage in JS:    window.t('nav.home')
 */

const TRANSLATIONS = {
  en: {
    // Navigation (nav.home kept for backward compat but nav.today is primary)
    'nav.home':     'Today',
    'nav.today':    'Today',
    'nav.globe':    'Globe',
    'nav.camera':   'Camera AI',
    'nav.policy':   'Policy',
    'nav.about':    'About',

    // Index / Hero
    'hero.title':    'See the air.<br>Understand the world.',
    'hero.subtitle': 'Global air quality visualization powered by AI.<br>Historical data from official sources. One beautiful interface.',
    'hero.cta.today':  'Check Today\'s Air →',
    'hero.cta.globe':  'Explore Globe',
    'features.title':  'Three ways to see air quality',
    'feature.globe.title':  'Interactive Globe',
    'feature.globe.desc':   'Explore air quality data from official international sources on a stunning 3D Earth. Rotate, zoom, and discover PM2.5 trends based on verified historical data.',
    'feature.globe.btn':    'Launch Globe →',
    'feature.camera.title': 'Camera AI',
    'feature.camera.desc':  'Upload a photo of the sky and our AI instantly predicts PM2.5 levels. Advanced computer vision meets environmental science.',
    'feature.camera.btn':   'Try It Now →',
    'feature.policy.title': 'Policy Research',
    'feature.policy.desc':  'Comprehensive analysis of global air quality policies and their effectiveness. Data-driven insights for a cleaner future.',
    'feature.policy.btn':   'Read More →',
    'stats.title':          'The numbers speak',
    'stats.global':         'Global Coverage',
    'stats.global.sub':     'Historical data worldwide',
    'stats.eu':             'EU Copernicus CAMS',
    'stats.eu.sub':         'Official European Union data',
    'stats.owid':           'Our World in Data',
    'stats.owid.sub':       'IHME verified statistics',
    'cta.title':            'Ready to see the air?',
    'cta.sub':              'Start exploring global air quality data in seconds.',
    'cta.btn':              'Explore Now →',

    // Today
    'today.title':          'Today\'s Air Quality 🌤️',
    'today.subtitle':       'Combining station data + sky photo AI to measure PM2.5',
    'today.location.checking': 'Detecting your location...',
    'today.location.select':   'Please select your city',
    'today.city.placeholder':  '-- Select a city --',
    'today.pm.label':           'Combined PM2.5',
    'today.pm.unit':            'µg/m³',
    'today.pm.loading':         'Loading data...',
    'today.confidence.loading': 'Fetching data...',
    'today.guide.loading':      'Waiting for analysis results...',
    'today.camera.title':       'Improve Accuracy with a Sky Photo',
    'today.camera.hint':        'Take a clear sky photo outdoors with the sky centered.\nToo many buildings or trees will reduce accuracy.',
    'today.camera.upload':      'Upload / Drag a Photo',
    'today.camera.formats':     'JPG, PNG supported',
    'today.camera.clear':       'Upload a different photo',
    'today.camera.result':      'Photo Analysis Result',
    'today.camera.confidence':  'Model confidence',
    'today.cta.globe':          'Compare on World Map',
    'today.cta.camera':         'Full Camera AI',
    'today.loading.waqi':       '📡 Loading WAQI data...',
    'today.loading.gps':        '📍 Detecting location...',

    // PM Grade labels
    'grade.good':         'Good',
    'grade.moderate':     'Moderate',
    'grade.unhealthy':    'Unhealthy',
    'grade.very':         'Very Unhealthy',

    // Action guides
    'guide.good':         'Air quality is excellent. Enjoy outdoor activities freely.',
    'guide.moderate':     'Sensitive groups (children, elderly, respiratory patients) should wear masks.',
    'guide.unhealthy':    'Wear a KN95/N95 mask. Avoid prolonged strenuous outdoor exercise.',
    'guide.very':         'KN95/N95 mask required. Avoid outdoor activities and minimize ventilation.',

    // Confidence labels
    'conf.high':   'High ✅',
    'conf.medium': 'Medium ⚠️',
    'conf.low':    'Low ❗',
    'conf.station.only': '(Station data only)',
    'conf.camera.only':  '(Camera analysis only)',
    'conf.fused':        'Station {s} / Photo {c} µg/m³',

    // Footer
    'footer.copy': '© 2026 AirLens. Built with ❤️ for a cleaner planet.',
    'footer.github': 'View on GitHub',

    // Settings
    'settings.title':    'Settings',
    'settings.subtitle': 'Customize your AirLens experience',
    'settings.appearance.title': '🎨 Appearance',
    'settings.appearance.sub':   'Customize how AirLens looks',
    'settings.theme.label':      'Theme',
    'settings.theme.sub':        'Choose between light and dark mode',
    'settings.theme.light':      'Light',
    'settings.theme.dark':       'Dark',
    'settings.lang.title':       '🌍 Language',
    'settings.lang.sub':         'Select your preferred language',
    'settings.lang.label':       'Display Language',
    'settings.lang.hint':        'Choose the language for the interface',
    'settings.saved':            'Language updated to',

    // Camera page
    'camera.title':    'AirLens PM2.5 Predictor',
    'camera.subtitle': 'Upload a clear image of the sky to estimate PM2.5 using multimodal AI fusion (Image + Satellite + Ground Data).',
    'camera.location': 'Location will be requested during analysis',
    'camera.step1':    '1. Upload Your Image',
    'camera.drop':     'Drag & drop or click to upload',
    'camera.drop.sub': 'Supports JPG, PNG. For best results, use a photo with a clear view of the sky.',
    'camera.step2':    '2. Image Preview',
    'camera.clear':    'Clear & Upload New',
    'camera.step3':    '3. Analysis Results',
    'camera.empty':    'Upload an image to get started',
    'camera.empty.sub':'Our AI will analyze sky conditions and predict PM2.5 levels using multimodal fusion',
    'camera.analyzing':'Analyzing image with AI...',
    'camera.processing':'Processing sky conditions...',
    'camera.pm25.label':'Estimated PM2.5',
    'camera.confidence.label': 'Model Confidence',
    'camera.sources.label':    'Data Sources',
    'camera.analyze.again':    'Analyze Another Image',
    'camera.view.satellite':   'View Satellite Data',

    // About
    'about.title': 'About & Research',

    // Policy page
    'nav.policy':                'Policy',
    'today.cta.policy':          'Policy Research',
    'policy.title':              '🌿 Policy Research',
    'policy.subtitle':           'How do government policies actually affect PM2.5? Explore 66 countries with real historical data.',
    'policy.stat.countries':     'Countries',
    'policy.stat.policies':      'Policies',
    'policy.stat.source':        'OWID · IHME data',
    'policy.search.placeholder': 'Search country or policy…',
    'policy.detail.hint':        'Click a policy to see details',
    'policy.detail.credibility': 'Data Credibility',
    'policy.detail.target':      'PM2.5 Target',
    'policy.detail.trend':       'PM2.5 Trend',
    'policy.detail.source':      'Official Source',
  },

  ko: {
    'nav.home':     '오늘',
    'nav.today':    '오늘',
    'nav.globe':    '지구본',
    'nav.camera':   '카메라 AI',
    'nav.policy':   '정책',
    'nav.about':    '소개',

    'hero.title':    '공기를 보세요.<br>세상을 이해하세요.',
    'hero.subtitle': 'AI로 구동되는 전 세계 대기질 시각화.<br>공식 출처의 역사 데이터. 아름다운 인터페이스.',
    'hero.cta.today':  '오늘 내 공기 확인 →',
    'hero.cta.globe':  '지구본 보기',
    'features.title':  '대기질을 확인하는 3가지 방법',
    'feature.globe.title':  '인터랙티브 지구본',
    'feature.globe.desc':   '공식 국제 출처의 대기질 데이터를 3D 지구에서 탐색하세요.',
    'feature.globe.btn':    '지구본 열기 →',
    'feature.camera.title': '카메라 AI',
    'feature.camera.desc':  '하늘 사진을 업로드하면 AI가 즉시 PM2.5 수치를 예측합니다.',
    'feature.camera.btn':   '지금 시도 →',
    'feature.policy.title': '정책 연구',
    'feature.policy.desc':  '전 세계 대기질 정책과 그 효과에 대한 포괄적인 분석.',
    'feature.policy.btn':   '더 읽기 →',
    'stats.title':          '숫자가 말해줍니다',
    'stats.global':         '전 세계 커버리지',
    'stats.global.sub':     '전 세계 역사 데이터',
    'stats.eu':             'EU 코페르니쿠스 CAMS',
    'stats.eu.sub':         '공식 유럽 연합 데이터',
    'stats.owid':           'Our World in Data',
    'stats.owid.sub':       'IHME 검증 통계',
    'cta.title':            '공기를 볼 준비가 되셨나요?',
    'cta.sub':              '몇 초 안에 전 세계 대기질 데이터 탐색을 시작하세요.',
    'cta.btn':              '지금 탐색 →',

    'today.title':          '오늘의 공기는? 🌤️',
    'today.subtitle':       '측정소 데이터 + 하늘 사진 AI를 통합해 PM2.5를 분석합니다',
    'today.location.checking': '위치 확인 중...',
    'today.location.select':   '도시를 선택해 주세요',
    'today.city.placeholder':  '-- 도시를 선택하세요 --',
    'today.pm.label':           '통합 PM2.5',
    'today.pm.unit':            'µg/m³',
    'today.pm.loading':         '--',
    'today.confidence.loading': '데이터를 불러오는 중입니다...',
    'today.guide.loading':      '분석 결과를 기다리는 중입니다...',
    'today.camera.title':       '하늘 사진으로 정확도 높이기',
    'today.camera.hint':        '야외에서 하늘을 중앙에 두고 찍어주세요.\n건물·나무가 너무 많이 나오면 정확도가 떨어집니다.',
    'today.camera.upload':      '사진 업로드 / 드래그',
    'today.camera.formats':     'JPG, PNG 지원',
    'today.camera.clear':       '다른 사진 업로드',
    'today.camera.result':      '사진 분석 결과',
    'today.camera.confidence':  '모델 신뢰도',
    'today.cta.globe':          '세계 지도에서 비교하기',
    'today.cta.camera':         'Camera AI 전체 기능',
    'today.loading.waqi':       '📡 WAQI 데이터 로딩 중...',
    'today.loading.gps':        '📍 위치 확인 중...',

    'grade.good':         '좋음',
    'grade.moderate':     '보통',
    'grade.unhealthy':    '나쁨',
    'grade.very':         '매우 나쁨',

    'guide.good':         '야외 활동에 적합한 공기입니다. 마음껏 즐기세요.',
    'guide.moderate':     '민감군(어린이, 노약자, 호흡기 질환자)은 마스크 착용을 권장합니다.',
    'guide.unhealthy':    'KF94 마스크 착용을 권장합니다. 장시간 야외 운동은 자제하세요.',
    'guide.very':         'KF94 마스크 필수 착용. 장시간 야외 활동을 피하고 환기를 최소화하세요.',

    'conf.high':   '높음 ✅',
    'conf.medium': '보통 ⚠️',
    'conf.low':    '낮음 ❗',
    'conf.station.only': '(측정소 데이터만 사용)',
    'conf.camera.only':  '(카메라 분석만 사용)',
    'conf.fused':        '측정소 {s} / 사진 {c} µg/m³',

    'footer.copy':   '© 2026 AirLens. 더 깨끗한 지구를 위해 ❤️',
    'footer.github': 'GitHub에서 보기',

    'settings.title':    '설정',
    'settings.subtitle': 'AirLens 경험을 맞춤 설정하세요',
    'settings.appearance.title': '🎨 외관',
    'settings.appearance.sub':   'AirLens의 외관을 맞춤 설정하세요',
    'settings.theme.label':      '테마',
    'settings.theme.sub':        '라이트 또는 다크 모드 선택',
    'settings.theme.light':      '라이트',
    'settings.theme.dark':       '다크',
    'settings.lang.title':       '🌍 언어',
    'settings.lang.sub':         '선호하는 언어를 선택하세요',
    'settings.lang.label':       '표시 언어',
    'settings.lang.hint':        '인터페이스 언어를 선택하세요',
    'settings.saved':            '언어가 변경되었습니다:',

    'camera.title':    'AirLens PM2.5 예측기',
    'camera.subtitle': '하늘 사진을 업로드하여 멀티모달 AI 융합으로 PM2.5를 추정하세요.',
    'camera.location': '분석 시 위치 정보가 요청됩니다',
    'camera.step1':    '1. 이미지 업로드',
    'camera.drop':     '드래그 앤 드롭 또는 클릭하여 업로드',
    'camera.drop.sub': 'JPG, PNG 지원. 최상의 결과를 위해 하늘이 잘 보이는 사진을 사용하세요.',
    'camera.step2':    '2. 이미지 미리보기',
    'camera.clear':    '지우고 새로 업로드',
    'camera.step3':    '3. 분석 결과',
    'camera.empty':    '이미지를 업로드하여 시작하세요',
    'camera.empty.sub':'AI가 하늘 상태를 분석하고 멀티모달 융합으로 PM2.5 수치를 예측합니다',
    'camera.analyzing':'AI로 이미지 분석 중...',
    'camera.processing':'하늘 상태 처리 중...',
    'camera.pm25.label':'예상 PM2.5',
    'camera.confidence.label': '모델 신뢰도',
    'camera.sources.label':    '데이터 소스',
    'camera.analyze.again':    '다른 이미지 분석',
    'camera.view.satellite':   '위성 데이터 보기',

    'about.title': '소개 & 연구',

    // Policy page (Korean)
    'nav.policy':                '정책',
    'today.cta.policy':          '정책 연구',
    'policy.title':              '🌿 정책 연구',
    'policy.subtitle':           '정부 정책이 PM2.5에 실제로 어떤 영향을 미쳤나요? 66개국 실제 데이터로 확인하세요.',
    'policy.stat.countries':     '국가',
    'policy.stat.policies':      '정책',
    'policy.stat.source':        'OWID · IHME 데이터',
    'policy.search.placeholder': '국가 또는 정책 검색…',
    'policy.detail.hint':        '정책을 클릭하면 상세 정보를 볼 수 있습니다',
    'policy.detail.credibility': '데이터 신뢰도',
    'policy.detail.target':      'PM2.5 목표',
    'policy.detail.trend':       'PM2.5 추세',
    'policy.detail.source':      '공식 출처',
  },

  ja: {
    'nav.home':  '今日', 'nav.today': '今日', 'nav.globe': '地球儀',
    'nav.camera': 'カメラAI', 'nav.policy': '政策', 'nav.about': '概要',
    'hero.title': '空気を見る。<br>世界を理解する。',
    'hero.subtitle': 'AIが駆動するグローバル大気質の可視化。',
    'hero.cta.today': '今日の空気を確認 →', 'hero.cta.globe': '地球儀を探索',
    'today.title': '今日の空気 🌤️',
    'today.subtitle': 'PM2.5を計測します',
    'today.location.checking': '位置を検出中...',
    'today.location.select': '都市を選択してください',
    'today.city.placeholder': '-- 都市を選択 --',
    'today.pm.label': 'PM2.5', 'today.pm.unit': 'µg/m³',
    'today.camera.title': '空の写真で精度を上げる',
    'today.camera.upload': '写真をアップロード',
    'today.camera.formats': 'JPG・PNG対応',
    'today.camera.clear': '別の写真をアップロード',
    'today.camera.result': '写真分析結果',
    'today.camera.confidence': 'モデル信頼度',
    'today.cta.globe': '世界地図で比較する', 'today.cta.camera': 'Camera AI全機能',
    'grade.good': '良い', 'grade.moderate': '普通', 'grade.unhealthy': '悪い', 'grade.very': '非常に悪い',
    'guide.good': '屋外活動に適した空気です。', 'guide.moderate': '敏感な人はマスク着用を推奨します。',
    'guide.unhealthy': 'マスクを着用し、長時間の屋外運動は控えてください。',
    'guide.very': 'マスク必須。屋外活動を避けてください。',
    'conf.high': '高 ✅', 'conf.medium': '中 ⚠️', 'conf.low': '低 ❗',
    'settings.title': '設定', 'settings.subtitle': 'AirLensをカスタマイズ',
    'settings.lang.title': '🌍 言語', 'settings.saved': '言語を変更しました:',
    'footer.copy': '© 2026 AirLens. より清潔な地球のために ❤️', 'footer.github': 'GitHubで見る',
  },

  zh: {
    'nav.home': '今天', 'nav.today': '今天', 'nav.globe': '地球仪',
    'nav.camera': '相机AI', 'nav.policy': '政策', 'nav.about': '关于',
    'hero.title': '看见空气。<br>理解世界。',
    'hero.subtitle': 'AI驱动的全球空气质量可视化。',
    'hero.cta.today': '查看今天的空气 →', 'hero.cta.globe': '探索地球仪',
    'today.title': '今天的空气 🌤️',
    'today.subtitle': '综合测站数据 + 天空照片 AI 测量 PM2.5',
    'today.location.checking': '检测位置中...',
    'today.location.select': '请选择城市',
    'today.city.placeholder': '-- 选择城市 --',
    'today.pm.label': 'PM2.5综合', 'today.pm.unit': 'µg/m³',
    'today.camera.title': '用天空照片提高精度',
    'today.camera.upload': '上传照片',
    'today.camera.formats': '支持JPG、PNG',
    'today.camera.clear': '上传其他照片',
    'today.camera.result': '照片分析结果',
    'today.camera.confidence': '模型置信度',
    'today.cta.globe': '在世界地图上比较', 'today.cta.camera': '完整Camera AI',
    'grade.good': '良好', 'grade.moderate': '一般', 'grade.unhealthy': '不健康', 'grade.very': '非常不健康',
    'guide.good': '空气质量优良，适合户外活动。', 'guide.moderate': '敏感人群建议佩戴口罩。',
    'guide.unhealthy': '建议佩戴KN95口罩，避免长时间户外运动。',
    'guide.very': '必须佩戴KN95口罩，避免户外活动。',
    'conf.high': '高 ✅', 'conf.medium': '中 ⚠️', 'conf.low': '低 ❗',
    'settings.title': '设置', 'settings.subtitle': '自定义您的AirLens体验',
    'settings.lang.title': '🌍 语言', 'settings.saved': '语言已更新为:',
    'footer.copy': '© 2026 AirLens. 为更清洁的地球而建 ❤️', 'footer.github': '在GitHub查看',
  },

  es: {
    'nav.home': 'Hoy', 'nav.today': 'Hoy', 'nav.globe': 'Globo',
    'nav.camera': 'Cámara IA', 'nav.policy': 'Política', 'nav.about': 'Acerca',
    'hero.title': 'Ver el aire.<br>Entender el mundo.',
    'hero.subtitle': 'Visualización global de calidad del aire con IA.',
    'hero.cta.today': 'Ver mi aire hoy →', 'hero.cta.globe': 'Explorar globo',
    'today.title': 'Calidad del Aire Hoy 🌤️',
    'today.subtitle': 'Combinando datos de estaciones + IA de fotos del cielo',
    'today.location.checking': 'Detectando ubicación...',
    'today.location.select': 'Seleccione su ciudad',
    'today.city.placeholder': '-- Seleccionar ciudad --',
    'today.pm.label': 'PM2.5 Combinado', 'today.pm.unit': 'µg/m³',
    'today.camera.title': 'Mejorar precisión con foto del cielo',
    'today.camera.upload': 'Subir foto',
    'today.camera.formats': 'JPG, PNG compatibles',
    'today.camera.clear': 'Subir otra foto',
    'today.camera.result': 'Resultado del análisis',
    'today.camera.confidence': 'Confianza del modelo',
    'today.cta.globe': 'Comparar en mapa mundial', 'today.cta.camera': 'Cámara IA completa',
    'grade.good': 'Bueno', 'grade.moderate': 'Moderado', 'grade.unhealthy': 'Poco saludable', 'grade.very': 'Muy poco saludable',
    'guide.good': 'El aire es excelente. ¡Disfrute las actividades al aire libre!',
    'guide.moderate': 'Los grupos sensibles deben usar mascarilla.',
    'guide.unhealthy': 'Use mascarilla KN95 y evite el ejercicio prolongado al aire libre.',
    'guide.very': 'Mascarilla KN95 obligatoria. Evite las actividades al aire libre.',
    'conf.high': 'Alta ✅', 'conf.medium': 'Media ⚠️', 'conf.low': 'Baja ❗',
    'settings.title': 'Configuración', 'settings.subtitle': 'Personaliza tu experiencia en AirLens',
    'settings.lang.title': '🌍 Idioma', 'settings.saved': 'Idioma actualizado a:',
    'footer.copy': '© 2026 AirLens. Construido con ❤️ por un planeta más limpio.', 'footer.github': 'Ver en GitHub',
  },

  fr: {
    'nav.home': "Aujourd'hui", 'nav.today': "Aujourd'hui", 'nav.globe': 'Globe',
    'nav.camera': 'Caméra IA', 'nav.policy': 'Politique', 'nav.about': 'À propos',
    'hero.title': "Voir l'air.<br>Comprendre le monde.",
    'hero.subtitle': "Visualisation mondiale de la qualité de l'air par l'IA.",
    'hero.cta.today': "Vérifier l'air aujourd'hui →", 'hero.cta.globe': 'Explorer le globe',
    'today.title': "Qualité de l'air aujourd'hui 🌤️",
    'today.subtitle': 'Combinaison données stations + IA photos du ciel',
    'today.location.checking': 'Détection de la position...',
    'today.location.select': 'Veuillez sélectionner une ville',
    'today.city.placeholder': '-- Sélectionner une ville --',
    'today.pm.label': 'PM2.5 Combiné', 'today.pm.unit': 'µg/m³',
    'today.camera.title': 'Améliorer la précision avec une photo du ciel',
    'today.camera.upload': 'Télécharger une photo',
    'today.camera.formats': 'JPG, PNG pris en charge',
    'today.camera.clear': 'Télécharger une autre photo',
    'today.camera.result': "Résultat de l'analyse",
    'today.camera.confidence': 'Confiance du modèle',
    'today.cta.globe': 'Comparer sur la carte mondiale', 'today.cta.camera': 'Caméra IA complète',
    'grade.good': 'Bon', 'grade.moderate': 'Modéré', 'grade.unhealthy': 'Mauvais', 'grade.very': 'Très mauvais',
    'guide.good': "L'air est excellent. Profitez des activités en plein air !",
    'guide.moderate': 'Les groupes sensibles doivent porter un masque.',
    'guide.unhealthy': 'Portez un masque KN95 et évitez l\'exercice prolongé en plein air.',
    'guide.very': "Masque KN95 obligatoire. Évitez les activités en plein air.",
    'conf.high': 'Élevée ✅', 'conf.medium': 'Moyenne ⚠️', 'conf.low': 'Faible ❗',
    'settings.title': 'Paramètres', 'settings.subtitle': 'Personnalisez votre expérience AirLens',
    'settings.lang.title': '🌍 Langue', 'settings.saved': 'Langue mise à jour :',
    'footer.copy': '© 2026 AirLens. Construit avec ❤️ pour une planète plus propre.', 'footer.github': 'Voir sur GitHub',
  }
};

// ── Core i18n engine ──────────────────────────────────────────────

const I18n = {
  lang: 'en',

  init() {
    this.lang = localStorage.getItem('language') || 'en';
    if (!TRANSLATIONS[this.lang]) this.lang = 'en';
    this.applyAll();
  },

  /** Translate a key, with optional variable substitution {var} */
  t(key, vars = {}) {
    const dict = TRANSLATIONS[this.lang] || TRANSLATIONS['en'];
    let str = dict[key] ?? TRANSLATIONS['en'][key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return str;
  },

  /** Apply translations to all [data-i18n] elements in the document */
  applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = this.t(key);
      // Allow HTML in translations (for <br> etc.)
      if (translated.includes('<')) {
        el.innerHTML = translated;
      } else {
        el.textContent = translated;
      }
    });

    // data-i18n-placeholder for <input> / <select>
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', this.t(el.getAttribute('data-i18n-placeholder')));
    });

    // Update <html lang="">
    document.documentElement.lang = this.lang;
  },

  /** Change language, save, and re-apply */
  setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.lang = lang;
    localStorage.setItem('language', lang);
    this.applyAll();
  }
};

// Expose globally
window.I18n = I18n;
window.t = (key, vars) => I18n.t(key, vars);

// Auto-init as soon as script loads
I18n.init();
