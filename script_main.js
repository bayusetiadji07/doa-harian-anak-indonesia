/**
 * Doa Harian Anak Indonesia
 * Main Application
 */

const App = {
  currentPage: 'home',
  doaList: [],
  favorites: [],
  progress: {},
  settings: {},
  xp: 0,
  currentDoa: null
};

const STORAGE_KEYS = {
  FAVORITES: 'doa_harian_favorites',
  PROGRESS: 'doa_harian_progress',
  SETTINGS: 'doa_harian_settings',
  XP: 'doa_harian_xp',
  STREAK: 'doa_harian_streak'
};

App.streak = { count: 0, lastDate: null };

let currentFilter = 'all';

// Init
document.addEventListener('DOMContentLoaded', async () => {
  await loadDoaData();
  loadUserData();
  initRouter();
  initBottomNav();
  renderHomePage();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(err => console.error(err));
  }
  
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) splash.classList.add('hidden');
  }, 1500);
});

// Data Loading
async function loadDoaData() {
  try {
    const response = await fetch('data/doa.json');
    const data = await response.json();
    App.doaList = data.doa;
  } catch (error) {
    console.error('Failed to load:', error);
  }
}

function loadUserData() {
  const fav = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  App.favorites = fav ? JSON.parse(fav) : [];
  const prog = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  App.progress = prog ? JSON.parse(prog) : {};
  const sett = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  App.settings = sett ? JSON.parse(sett) : {darkMode: false, fontSize: 'medium'};
  const xp = localStorage.getItem(STORAGE_KEYS.XP);
  App.xp = xp ? parseInt(xp) : 0;
  const streak = localStorage.getItem(STORAGE_KEYS.STREAK);
  App.streak = streak ? JSON.parse(streak) : { count: 0, lastDate: null };

  // Apply dark mode on load
  if (App.settings.darkMode) {
    document.body.classList.add('dark-mode');
  }
  // Update streak on visit
  updateStreak();
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const last = App.streak.lastDate;
  if (last === today) return; // same day, no change
  if (last) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    App.streak.count = last === yesterday ? App.streak.count + 1 : 1;
  } else {
    App.streak.count = 1;
  }
  App.streak.lastDate = today;
  saveStreak();
}

function saveStreak() { localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(App.streak)); }

function saveFavorites() { localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(App.favorites)); }
function saveProgress() { localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(App.progress)); }
function saveSettings() { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(App.settings)); }
function saveXP() { localStorage.setItem(STORAGE_KEYS.XP, App.xp.toString()); }

// Router
function initRouter() {
  window.addEventListener('popstate', (e) => {
    const page = e.state?.page || 'home';
    renderPage(page);
  });
}

function navigateTo(page, pushState = true) {
  App.currentPage = page;
  if (pushState) {
    const url = page === 'home' ? '/' : '/?page=' + page;
    window.history.pushState({ page }, '', url);
  }
  renderPage(page);
  updateNavigation(page);
  window.scrollTo(0, 0);
}

function renderPage(page) {
  const app = document.getElementById('app');
  switch (page) {
    case 'home': renderHomePage(); break;
    case 'list': renderListPage(); break;
    case 'quiz': renderQuizPage(); break;
    case 'game': renderGamePage(); break;
    case 'progress': renderProgressPage(); break;
    case 'settings': renderSettingsPage(); break;
    case 'favorites': renderFavoritesPage(); break;
    default: renderHomePage();
  }
}

function updateNavigation(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) item.classList.add('active');
  });
}

// Bottom Nav
function initBottomNav() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;
  
  nav.innerHTML = '<div class="nav-item active" data-page="home"><span class="nav-icon">🏠</span><span class="nav-label">Beranda</span></div><div class="nav-item" data-page="list"><span class="nav-icon">📚</span><span class="nav-label">Doa</span></div><div class="nav-item" data-page="quiz"><span class="nav-icon">📝</span><span class="nav-label">Quiz</span></div><div class="nav-item" data-page="game"><span class="nav-icon">🎮</span><span class="nav-label">Game</span></div><div class="nav-item" data-page="progress"><span class="nav-icon">📈</span><span class="nav-label">Progress</span></div>';
  
  nav.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {'tidur':'🌙','makan':'🍚','bersuci':'🚿','pakaian':'👕','rumah':'🏠','masjid':'🕌','belajar':'📚','perjalanan':'🚗','cuaca':'🌦','dzikir':'🤲','kehidupan':'❤️','quran':'📖','surah':'🕋','khusus':'✨'};
  return icons[category] || '📿';
}

// ================================================
// Home Page
// ================================================
function renderHomePage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const memorized = Object.keys(App.progress).filter(id => App.progress[id] === 'memorized').length;
  const total = App.doaList.length;
  
  app.innerHTML = '<div class="main-content"><div class="hero-section animate-fade-in"><div class="hero-inner"><div class="hero-text"><span class="hero-eyebrow">Assalamu\'alaikum</span><h1 class="hero-title">Ayo Belajar Doa Setiap Hari</h1><p class="hero-subtitle">Hafalkan doa-doa harian dengan cara yang menyenangkan</p>' + (App.streak.count > 0 ? '<span class="streak-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-.5 3-2 5-4 6 1 2 4 3 4 6 3-1 5-3 5-6-2-2-4-4-5-6z"/><path d="M8 14c-2 2-2 4-1 6 3 2 8 2 10 0 1-2 1-4-1-6-2 1-6 1-8 0z"/></svg> ' + App.streak.count + ' hari beruntun</span>' : '') + '</div><div class="hero-characters"><img src="assets/characters/boy.webp" alt=""><img src="assets/characters/girl.webp" alt=""></div></div></div><div class="stats-bar"><div class="stat-item"><div class="stat-value">' + memorized + '</div><div class="stat-label">Sudah Hafal</div></div><div class="stat-item"><div class="stat-value">' + total + '</div><div class="stat-label">Total Doa</div></div><div class="stat-item"><div class="stat-value">' + (App.favorites?.length || 0) + '</div><div class="stat-label">Favorit</div></div></div><div class="section-title"><h2>Pilih Kategori</h2></div><div class="grid-container" id="menuGrid"></div></div>';
  
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  
  const items = [
    {id:'tidur',icon:'🌞',label:'Bangun Tidur',cat:'tidur'},
    {id:'sebelum-tidur',icon:'🌙',label:'Sebelum Tidur',cat:'tidur'},
    {id:'makan',icon:'🍚',label:'Makan',cat:'makan'},
    {id:'bersuci',icon:'🚿',label:'Bersuci',cat:'bersuci'},
    {id:'pakaian',icon:'👕',label:'Pakaian',cat:'pakaian'},
    {id:'rumah',icon:'🏠',label:'Rumah',cat:'rumah'},
    {id:'masjid',icon:'🕌',label:'Masjid',cat:'masjid'},
    {id:'belajar',icon:'📚',label:'Belajar',cat:'belajar'},
    {id:'perjalanan',icon:'🚗',label:'Perjalanan',cat:'perjalanan'},
    {id:'cuaca',icon:'🌦',label:'Cuaca',cat:'cuaca'},
    {id:'dzikir',icon:'🤲',label:'Dzikir',cat:'dzikir'},
    {id:'akhlak',icon:'❤️',label:'Akhlak',cat:'kehidupan'},
    {id:'keluarga',icon:'👨‍👩‍👧',label:'Keluarga',cat:'kehidupan'},
    {id:'quran',icon:'📖',label:'Al-Quran',cat:'quran'},
    {id:'surah',icon:'🕋',label:'Surah',cat:'surah'},
    {id:'favorit',icon:'⭐',label:'Favorit',page:'favorites'},
    {id:'game',icon:'🎮',label:'Game',page:'game'},
    {id:'quiz',icon:'📝',label:'Quiz',page:'quiz'},
    {id:'progress',icon:'📈',label:'Progress',page:'progress'},
    {id:'badge',icon:'🏆',label:'Badge',page:'progress'}
  ];
  
  grid.innerHTML = items.map(item => {
    return '<div class="menu-card" onclick="openMenu(\'' + (item.page || '') + '\', \'' + (item.cat || '') + '\')"><span class="menu-card-icon">' + item.icon + '</span><span class="menu-card-label">' + item.label + '</span></div>';
  }).join('');
}

function openMenu(page, category) {
  if (page) {
    navigateTo(page);
  } else if (category) {
    currentFilter = category;
    navigateTo('list');
  }
}

// ================================================
// List Page
// ================================================
function renderListPage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = '<div class="main-content"><div class="search-container"><span class="search-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span><input type="text" class="search-input" id="searchInput" placeholder="Cari doa..."><button class="search-clear" id="searchClear">✕</button></div><div class="filter-container" id="filterContainer"></div><div id="doaList"></div></div>';
  
  renderFilters();
  renderDoaList();
  
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  
  searchInput.addEventListener('input', (e) => {
    searchClear.classList.toggle('visible', e.target.value.length > 0);
    renderDoaList(e.target.value);
  });
  
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    renderDoaList();
  });
}

function renderFilters() {
  const container = document.getElementById('filterContainer');
  if (!container) return;
  
  const cats = [
    {id:'all',label:'Semua',icon:'📚'},
    {id:'tidur',label:'Tidur',icon:'🌙'},
    {id:'makan',label:'Makan',icon:'🍚'},
    {id:'bersuci',label:'Bersuci',icon:'🚿'},
    {id:'pakaian',label:'Pakaian',icon:'👕'},
    {id:'rumah',label:'Rumah',icon:'🏠'},
    {id:'masjid',label:'Masjid',icon:'🕌'},
    {id:'belajar',label:'Belajar',icon:'📚'},
    {id:'perjalanan',label:'Perjalanan',icon:'🚗'},
    {id:'kehidupan',label:'Kehidupan',icon:'❤️'},
    {id:'dzikir',label:'Dzikir',icon:'🤲'},
    {id:'quran',label:'Al-Quran',icon:'📖'},
    {id:'surah',label:'Surah',icon:'🕋'}
  ];
  
  container.innerHTML = cats.map(cat => {
    const active = (currentFilter === 'all' && cat.id === 'all') || currentFilter === cat.id;
    return '<button class="filter-chip ' + (active ? 'active' : '') + '" data-category="' + cat.id + '">' + cat.label + '</button>';
  }).join('');
  
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentFilter = chip.dataset.category;
      renderFilters();
      renderDoaList();
    });
  });
}

function renderDoaList(searchQuery = '') {
  const list = document.getElementById('doaList');
  if (!list) return;
  
  let filtered = App.doaList;
  
  if (currentFilter !== 'all') {
    filtered = filtered.filter(d => d.kategori === currentFilter);
  }
  
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d =>
      d.nama.toLowerCase().includes(q) ||
      d.latin.toLowerCase().includes(q) ||
      d.terjemahan.toLowerCase().includes(q)
    );
  }
  
  if (filtered.length === 0) {
    list.innerHTML = '<div class="text-center p-xl"><div class="text-3xl mb-md">🔍</div><p class="text-secondary">Tidak ada doa ditemukan</p></div>';
    return;
  }
  
  list.innerHTML = filtered.map(doa => {
    const status = App.progress[doa.id] || '';
    let statusClass = status === 'memorized' ? 'memorized' : status === 'learning' ? 'learned' : '';
    let statusIcon = status === 'memorized' 
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' 
      : status === 'learning' ? '◐' : '';
    
    return '<div class="doa-card" data-id="' + doa.id + '"><div class="doa-card-thumb" style="background-image:url(\'assets/doa/' + doa.id + '.webp\');"></div><div class="doa-card-content"><h3 class="doa-card-title">' + doa.nama + '</h3><span class="doa-card-category">' + (doa.kategoriLabel || doa.kategori) + '</span></div><div class="doa-card-actions"><span class="doa-card-status ' + statusClass + '">' + statusIcon + '</span></div></div>';
  }).join('');
  
  list.querySelectorAll('.doa-card').forEach(card => {
    card.addEventListener('click', () => {
      showDoaDetail(parseInt(card.dataset.id));
    });
  });
}

// ================================================
// Audio Player — Prerecorded MP3 (Arabic) with Web Speech API fallback
// ================================================
let audioState = {
  isPlaying: false,
  speed: 1,
  utterance: null,
  audioEl: null,          // HTMLAudioElement when prerecorded MP3 is available
  mode: 'tts',            // 'mp3' | 'tts'
  currentDoaId: null,
  ttsQueueIdx: 0,         // sequential playback of Arabic MP3 -> Latin TTS -> Terjemahan TTS
  ttsParts: []            // [{lang, text}]
};

function initAudio(arabic, latin, terjemahan, doaId) {
  // Cancel any ongoing speech / audio
  speechSynthesis && speechSynthesis.cancel();
  if (audioState.audioEl) {
    try { audioState.audioEl.pause(); } catch(e) {}
    audioState.audioEl = null;
  }
  audioState.isPlaying = false;
  audioState.utterance = null;
  audioState.currentDoaId = doaId || null;

  // Prepare TTS parts (used for latin + terjemahan after MP3, OR for full playback fallback)
  audioState.ttsParts = [
    { lang: 'id-ID', text: latin },
    { lang: 'id-ID', text: 'Arti: ' + terjemahan }
  ];

  // Try prerecorded MP3 first
  if (doaId) {
    const mp3Url = 'assets/audio/' + doaId + '.mp3';
    const el = new Audio(mp3Url);
    el.preload = 'auto';
    el.playbackRate = audioState.speed;
    el.addEventListener('ended', () => {
      // After Arabic MP3 finishes, chain to Latin + Terjemahan via TTS
      playTtsChain(0);
    });
    el.addEventListener('error', () => {
      // MP3 not available — fall back fully to Web Speech API
      audioState.mode = 'tts';
      audioState.audioEl = null;
      initTtsFallback(arabic, latin, terjemahan);
    });
    audioState.audioEl = el;
    audioState.mode = 'mp3';
    return;
  }

  audioState.mode = 'tts';
  initTtsFallback(arabic, latin, terjemahan);
}

function initTtsFallback(arabic, latin, terjemahan) {
  if (!('speechSynthesis' in window)) return;
  // Use combined utterance like before (all-in-one)
  const fullText = arabic + '. ' + latin + '. Arti: ' + terjemahan;
  audioState.utterance = new SpeechSynthesisUtterance(fullText);
  audioState.utterance.lang = 'ar-SA';
  audioState.utterance.rate = audioState.speed;

  const voices = speechSynthesis.getVoices();
  let selectedVoice = voices.find(v => v.lang.includes('ar'));
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.includes('id')) || voices.find(v => v.lang.includes('ms'));
  }
  if (!selectedVoice && voices.length) selectedVoice = voices[0];
  if (selectedVoice) audioState.utterance.voice = selectedVoice;

  audioState.utterance.onend = () => { audioState.isPlaying = false; updateAudioUI(); };
  audioState.utterance.onerror = () => { audioState.isPlaying = false; updateAudioUI(); };
}

function playTtsChain(idx) {
  if (!('speechSynthesis' in window)) {
    audioState.isPlaying = false;
    updateAudioUI();
    return;
  }
  if (idx >= audioState.ttsParts.length) {
    audioState.isPlaying = false;
    updateAudioUI();
    return;
  }
  const part = audioState.ttsParts[idx];
  const u = new SpeechSynthesisUtterance(part.text);
  u.lang = part.lang;
  u.rate = audioState.speed;
  const voices = speechSynthesis.getVoices();
  const v = voices.find(x => x.lang.startsWith('id')) || voices.find(x => x.lang.startsWith('ms')) || voices[0];
  if (v) u.voice = v;
  u.onend = () => playTtsChain(idx + 1);
  u.onerror = () => { audioState.isPlaying = false; updateAudioUI(); };
  audioState.utterance = u;
  speechSynthesis.speak(u);
}

function togglePlay(arabic, latin, terjemahan, doaId) {
  if (audioState.isPlaying) {
    // Pause
    if (audioState.mode === 'mp3' && audioState.audioEl) {
      try { audioState.audioEl.pause(); } catch(e) {}
    }
    if ('speechSynthesis' in window) speechSynthesis.pause();
    audioState.isPlaying = false;
    updateAudioUI();
    return;
  }

  // Resume / start
  if (audioState.mode === 'mp3' && audioState.audioEl && audioState.currentDoaId === doaId) {
    // Resume MP3 or restart chain
    const el = audioState.audioEl;
    if (el.paused && el.currentTime > 0 && !el.ended) {
      el.play().catch(() => {});
      audioState.isPlaying = true;
      updateAudioUI();
      return;
    }
    if (el.ended) {
      // MP3 finished; resume TTS chain from current position (best-effort restart)
      playTtsChain(0);
      audioState.isPlaying = true;
      updateAudioUI();
      return;
    }
    // Fresh start
    el.currentTime = 0;
    el.playbackRate = audioState.speed;
    el.play().catch(() => {
      // Autoplay blocked or other; fall back to TTS
      audioState.mode = 'tts';
      initTtsFallback(arabic, latin, terjemahan);
      if (audioState.utterance) speechSynthesis.speak(audioState.utterance);
    });
    audioState.isPlaying = true;
    updateAudioUI();
    return;
  }

  // Not initialized or different doa — reinit
  initAudio(arabic, latin, terjemahan, doaId);
  if (audioState.mode === 'mp3' && audioState.audioEl) {
    audioState.audioEl.playbackRate = audioState.speed;
    audioState.audioEl.play().catch(() => {
      audioState.mode = 'tts';
      initTtsFallback(arabic, latin, terjemahan);
      if (audioState.utterance) speechSynthesis.speak(audioState.utterance);
    });
    audioState.isPlaying = true;
  } else if (audioState.utterance) {
    speechSynthesis.speak(audioState.utterance);
    audioState.isPlaying = true;
  } else {
    showToast('Browser tidak mendukung audio', 'error');
    return;
  }
  updateAudioUI();
}

function stopAudio() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (audioState.audioEl) {
    try { audioState.audioEl.pause(); audioState.audioEl.currentTime = 0; } catch(e) {}
  }
  audioState.isPlaying = false;
  audioState.utterance = null;
  updateAudioUI();
}

function changeSpeed() {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5];
  const currentIndex = speeds.indexOf(audioState.speed);
  audioState.speed = speeds[(currentIndex + 1) % speeds.length];

  if (audioState.utterance) audioState.utterance.rate = audioState.speed;
  if (audioState.audioEl) audioState.audioEl.playbackRate = audioState.speed;

  updateAudioUI();
}

function updateAudioUI() {
  const playBtn = document.getElementById('playAudioBtn');
  const speedBtn = document.getElementById('speedBtn');

  if (playBtn) {
    playBtn.innerHTML = audioState.isPlaying 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  }
  if (speedBtn) {
    speedBtn.textContent = audioState.speed + 'x';
  }
}

// ================================================
// Detail Page
// ================================================
let currentDoaId = null;

function showDoaDetail(id) {
  currentDoaId = id;
  App.currentDoa = App.doaList.find(d => d.id === id);
  if (App.currentDoa) {
    stopAudio(); // Stop previous audio
    renderDetailPage();
  }
}

function renderDetailPage() {
  const app = document.getElementById('app');
  const doa = App.currentDoa;
  if (!app || !doa) return;

  const isFav = App.favorites.includes(doa.id);
  const status = App.progress[doa.id] || '';

  // Custom illustration per doa (AI-generated)
  const illustration = 'assets/doa/' + doa.id + '.webp';
  
  const sceneHTML = '<div style="position:relative;margin:-24px -20px 20px;height:220px;overflow:hidden;border-radius:0 0 32px 32px;background-image:url(\'' + illustration + '\');background-size:cover;background-position:center;background-color:#065F46;"><div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(4,120,87,0.35) 65%,rgba(4,78,59,0.95) 100%);"></div><button class="doa-detail-back" style="position:absolute;top:16px;left:16px;" onclick="navigateTo(\'list\')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><button class="favorite-btn ' + (isFav ? 'active' : '') + '" style="position:absolute;top:16px;right:16px;" onclick="toggleFavorite(' + doa.id + ')"><svg width="20" height="20" viewBox="0 0 24 24" fill="' + (isFav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button><div style="position:absolute;bottom:16px;left:20px;right:20px;color:white;z-index:1;"><span style="display:inline-block;font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#FCD34D;padding:3px 10px;border:1px solid rgba(252,211,77,0.4);border-radius:999px;margin-bottom:8px;background:rgba(4,78,59,0.4);backdrop-filter:blur(4px);">' + (doa.kategoriLabel || doa.kategori) + '</span><h1 style="font-family:var(--font-display);font-style:italic;font-size:1.5rem;font-weight:800;line-height:1.1;text-shadow:0 2px 8px rgba(0,0,0,0.3);">' + doa.nama + '</h1></div></div>';

  app.innerHTML = '<div class="doa-detail">' + sceneHTML + '<div class="doa-content"><div class="doa-arab-section"><div class="doa-arab">' + doa.arab + '</div><div class="doa-latin"><em>' + doa.latin + '</em></div></div><div class="audio-player-section"><div class="audio-controls"><button class="audio-btn" id="playAudioBtn" data-testid="play-audio-btn" onclick="togglePlay(\'' + escapeForJS(doa.arab) + '\', \'' + escapeForJS(doa.latin) + '\', \'' + escapeForJS(doa.terjemahan) + '\', ' + doa.id + ')"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button><button class="audio-btn-small" onclick="changeSpeed()" id="speedBtn">1x</button><button class="audio-btn-small" onclick="stopAudio()"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button></div><p class="audio-hint">Arab · Latin · Indonesia</p></div><div class="doa-translation"><h4>Terjemahan</h4><p>' + doa.terjemahan + '</p></div><div class="doa-info"><div class="info-card"><div class="info-card-header">Hikmah</div><div class="info-card-content">' + (doa.hikmah || '-') + '</div></div><div class="info-card"><div class="info-card-header">Kapan Dibaca</div><div class="info-card-content">' + (doa.kapanDibaca || '-') + '</div></div><div class="info-card"><div class="info-card-header">Sumber</div><div class="info-card-content">' + (doa.sumber || '-') + '</div></div></div><div class="status-buttons"><button class="status-btn ' + (status === 'learning' ? 'active' : '') + '" onclick="setDoaStatus(' + doa.id + ', \'learning\')"><span class="status-icon">📖</span><span class="status-label">Sedang Dipelajari</span></button><button class="status-btn ' + (status === 'memorized' ? 'active' : '') + '" onclick="setDoaStatus(' + doa.id + ', \'memorized\')"><span class="status-icon">✓</span><span class="status-label">Sudah Hafal</span></button></div></div></div>';

  // Initialize audio with this doa (prerecorded MP3 preferred, TTS fallback)
  initAudio(doa.arab, doa.latin, doa.terjemahan, doa.id);
}

function escapeForJS(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function toggleFavorite(id) {
  const idx = App.favorites.indexOf(id);
  if (idx > -1) {
    App.favorites.splice(idx, 1);
    showToast('Dihapus dari favorit', 'info');
  } else {
    App.favorites.push(id);
    showToast('Ditambahkan ke favorit', 'success');
  }
  saveFavorites();
  if (App.currentDoa) renderDetailPage();
}

function setDoaStatus(id, status) {
  const prev = App.progress[id];
  App.progress[id] = status;
  saveProgress();

  if (status === 'memorized' && prev !== 'memorized') {
    App.xp = (App.xp || 0) + 10;
    saveXP();
    showConfetti();
    showToast('Selamat! +10 XP', 'success');
  }

  if (App.currentDoa) renderDetailPage();
}

// ================================================
// Quiz Page
// ================================================
let quizState = { questions: [], currentIndex: 0, score: 0 };

function renderQuizPage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  if (quizState.questions.length === 0 || quizState.currentIndex >= quizState.questions.length) {
    app.innerHTML = '<div class="quiz-container"><div class="quiz-start"><div style="width:80px;height:80px;margin:0 auto 20px;border-radius:24px;background:rgba(252,211,77,0.2);display:flex;align-items:center;justify-content:center;font-size:2.5rem;border:1px solid rgba(252,211,77,0.35);backdrop-filter:blur(8px);">📝</div><h2>Uji Hafalanmu</h2><p style="margin-bottom:28px;">10 pertanyaan pilihan ganda untuk mengasah pengetahuanmu tentang doa harian</p><button class="btn btn-primary" style="background:linear-gradient(135deg,#FCD34D,#F59E0B);color:#7C2D12;box-shadow:0 12px 30px -8px rgba(245,158,11,0.5);" onclick="startQuiz()">Mulai Quiz <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button></div></div>';
  } else {
    renderQuizQuestion();
  }
}

function startQuiz() {
  if (typeof QUIZ_QUESTIONS !== 'undefined') {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    quizState = { questions: shuffled.slice(0, 10), currentIndex: 0, score: 0 };
    renderQuizQuestion();
  } else {
    showToast('Gagal memuat quiz', 'error');
  }
}

function renderQuizQuestion() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const q = quizState.questions[quizState.currentIndex];
  const progress = ((quizState.currentIndex + 1) / quizState.questions.length) * 100;
  
  let optionsHTML = q.options.map((opt, i) => '<div class="quiz-option" onclick="selectAnswer(' + i + ')">' + opt + '</div>').join('');
  
  app.innerHTML = '<div class="quiz-container"><div class="quiz-header"><div class="quiz-progress"><div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:' + progress + '%"></div></div><span class="quiz-progress-text">' + (quizState.currentIndex + 1) + '/' + quizState.questions.length + '</span></div><div class="quiz-score">⭐ ' + quizState.score + '</div></div><div class="quiz-question-card"><div class="quiz-question"><p class="quiz-question-text">' + q.question + '</p></div><div class="quiz-options">' + optionsHTML + '</div></div></div>';
}

function selectAnswer(index) {
  const q = quizState.questions[quizState.currentIndex];
  const options = document.querySelectorAll('.quiz-option');
  if (!options.length) return;
  
  options.forEach(opt => opt.classList.add('disabled'));
  
  const selected = options[index];
  const isCorrect = selected.textContent === q.correct;
  
  if (isCorrect) {
    selected.classList.add('correct');
    quizState.score++;
  } else {
    selected.classList.add('incorrect');
    options.forEach(opt => { if (opt.textContent === q.correct) opt.classList.add('correct'); });
  }
  
  setTimeout(function() {
    quizState.currentIndex++;
    if (quizState.currentIndex < quizState.questions.length) renderQuizQuestion();
    else showQuizResult();
  }, 1500);
}

function showQuizResult() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const pct = Math.round((quizState.score / quizState.questions.length) * 100);
  const passed = pct >= 80;
  
  let icon = '🎉', title = 'Luar Biasa!', text = 'Kamu sangat hebat!';
  if (pct >= 90) { icon = '🏆'; title = 'Juara!'; text = 'Pengetahuanmu sangat mendalam!'; }
  else if (pct >= 80) { icon = '🌟'; title = 'Hebat!'; text = 'Kamu hampir sempurna!'; }
  else if (pct >= 60) { icon = '💪'; title = 'Bagus!'; text = 'Terus belajar ya!'; }
  else { icon = '📚'; title = 'Tetap Semangat!'; text = 'Ayo belajar lagi!'; }
  
  app.innerHTML = '<div class="quiz-container"><div class="quiz-result"><div class="quiz-score-circle">' + pct + '%</div><div class="text-3xl mb-md">' + icon + '</div><h2 class="quiz-result-title">' + title + '</h2><p class="quiz-result-text">' + text + '<br>Skor: ' + quizState.score + '/' + quizState.questions.length + '</p><div class="quiz-result-actions"><button class="btn btn-primary" onclick="startQuiz()">Coba Lagi</button><button class="btn btn-secondary" onclick="navigateTo(\'home\')">Kembali</button></div></div></div>';
  
  if (passed) {
    showConfetti();
    App.xp = (App.xp || 0) + 20;
    saveXP();
  }
  
  quizState.questions = [];
}

// ================================================
// Game Page
// ================================================
function renderGamePage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = '<div class="main-content"><div class="section-title"><h2>Game Edukasi</h2></div><div class="games-grid"><div class="game-card" data-testid="game-card-memory" onclick="startMemoryGame()"><div class="game-card-icon">🧠</div><h3 class="game-card-title">Memory Card</h3><p class="game-card-desc">Pasangkan kartu</p></div><div class="game-card" data-testid="game-card-puzzle" onclick="startPuzzleGame()"><div class="game-card-icon">🧩</div><h3 class="game-card-title">Puzzle Doa</h3><p class="game-card-desc">Susun kata Latin</p></div><div class="game-card" data-testid="game-card-tebak" onclick="startTebakDoaGame()"><div class="game-card-icon">🎯</div><h3 class="game-card-title">Tebak Doa</h3><p class="game-card-desc">Tebak dari terjemahan</p></div></div></div>';
}

// ================================================
// Tebak Doa — given translation, guess prayer name
// ================================================
let tebakState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  selectedOption: null,
  answered: false
};

function startTebakDoaGame() {
  if (!App.doaList || App.doaList.length < 4) {
    showToast('Data doa belum siap', 'error');
    return;
  }

  // Pick 10 random unique doa as questions
  const shuffled = [...App.doaList].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 10);

  tebakState = {
    questions: picks.map(doa => {
      // Build 3 wrong options + 1 correct, shuffled
      const distractors = App.doaList
        .filter(d => d.id !== doa.id && d.nama !== doa.nama)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(d => d.nama);
      const options = [doa.nama, ...distractors].sort(() => Math.random() - 0.5);
      return {
        doaId: doa.id,
        terjemahan: doa.terjemahan,
        kategoriLabel: doa.kategoriLabel || doa.kategori,
        correct: doa.nama,
        options: options
      };
    }),
    currentIndex: 0,
    score: 0,
    selectedOption: null,
    answered: false
  };

  renderTebakRound();
}

function renderTebakRound() {
  const app = document.getElementById('app');
  if (!app) return;

  if (tebakState.currentIndex >= tebakState.questions.length) {
    return renderTebakResult();
  }

  const q = tebakState.questions[tebakState.currentIndex];
  const progress = ((tebakState.currentIndex + 1) / tebakState.questions.length) * 100;

  const optionsHTML = q.options.map((opt, i) =>
    '<div class="quiz-option" data-testid="tebak-option-' + i + '" onclick="selectTebakAnswer(' + i + ')">' + opt + '</div>'
  ).join('');

  app.innerHTML =
    '<div class="quiz-container" data-testid="tebak-container">' +
      '<div class="flex-between mb-md">' +
        '<button class="btn btn-secondary" data-testid="tebak-back-btn" onclick="renderGamePage()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Kembali</button>' +
        '<div class="quiz-score" data-testid="tebak-score">⭐ ' + tebakState.score + '</div>' +
      '</div>' +
      '<div class="quiz-header">' +
        '<div class="quiz-progress"><div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:' + progress + '%"></div></div>' +
        '<span class="quiz-progress-text" data-testid="tebak-progress-text">' + (tebakState.currentIndex + 1) + '/' + tebakState.questions.length + '</span></div>' +
      '</div>' +
      '<div class="quiz-question-card">' +
        '<div class="quiz-question">' +
          '<span class="hero-eyebrow" style="color:var(--gold-500);border-color:var(--gold-400);">' + q.kategoriLabel + '</span>' +
          '<p style="font-family:var(--font-body);color:var(--ink-500);font-size:0.85rem;margin-top:10px;">Terjemahan doa:</p>' +
          '<p class="quiz-question-text" data-testid="tebak-question-text" style="font-style:italic;">"' + q.terjemahan + '"</p>' +
          '<p style="font-family:var(--font-body);color:var(--ink-500);font-size:0.85rem;margin-top:12px;">Doa apakah ini?</p>' +
        '</div>' +
        '<div class="quiz-options">' + optionsHTML + '</div>' +
      '</div>' +
    '</div>';
}

function selectTebakAnswer(index) {
  if (tebakState.answered) return;
  tebakState.answered = true;

  const q = tebakState.questions[tebakState.currentIndex];
  const options = document.querySelectorAll('.quiz-option');
  if (!options.length) return;

  options.forEach(opt => opt.classList.add('disabled'));

  const selected = options[index];
  const isCorrect = selected.textContent === q.correct;

  if (isCorrect) {
    selected.classList.add('correct');
    tebakState.score++;
    App.xp = (App.xp || 0) + 15;
    saveXP();
    const scoreEl = document.querySelector('[data-testid="tebak-score"]');
    if (scoreEl) scoreEl.textContent = '⭐ ' + tebakState.score;
  } else {
    selected.classList.add('incorrect');
    options.forEach(opt => { if (opt.textContent === q.correct) opt.classList.add('correct'); });
  }

  setTimeout(function() {
    tebakState.currentIndex++;
    tebakState.answered = false;
    renderTebakRound();
  }, 1400);
}

function renderTebakResult() {
  const app = document.getElementById('app');
  if (!app) return;

  const total = tebakState.questions.length;
  const score = tebakState.score;
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;

  let icon = '📚', title = 'Tetap Semangat!', text = 'Ayo pelajari lagi setiap doanya!';
  if (pct >= 90) { icon = '🏆'; title = 'Juara!'; text = 'Kamu sangat mengenal doa-doa harian!'; }
  else if (pct >= 80) { icon = '🌟'; title = 'Hebat!'; text = 'Pengetahuanmu keren sekali!'; }
  else if (pct >= 60) { icon = '💪'; title = 'Bagus!'; text = 'Terus latihan ya, sedikit lagi jago!'; }

  app.innerHTML =
    '<div class="quiz-container" data-testid="tebak-result">' +
      '<div class="quiz-result">' +
        '<div class="quiz-score-circle"><span>' + pct + '%</span></div>' +
        '<div class="text-3xl mb-md">' + icon + '</div>' +
        '<h2 class="quiz-result-title">' + title + '</h2>' +
        '<p class="quiz-result-text">' + text + '<br>Skor: ' + score + '/' + total + '<br>+' + (score * 15) + ' XP</p>' +
        '<div class="quiz-result-actions">' +
          '<button class="btn btn-primary" data-testid="tebak-play-again" onclick="startTebakDoaGame()">Main Lagi</button>' +
          '<button class="btn btn-secondary" data-testid="tebak-back-home" onclick="renderGamePage()">Kembali</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  if (passed) showConfetti();
  tebakState.questions = [];
}

// ================================================
// Puzzle Game — arrange Latin words in correct order
// ================================================
let puzzleState = {
  doa: null,
  correctOrder: [],
  currentAnswer: [],
  shuffledBank: [],
  score: 0,
  completed: 0,
  roundsToPlay: 5,
  playedIds: []
};

function startPuzzleGame() {
  puzzleState = {
    doa: null,
    correctOrder: [],
    currentAnswer: [],
    shuffledBank: [],
    score: 0,
    completed: 0,
    roundsToPlay: 5,
    playedIds: []
  };
  nextPuzzleRound();
}

function nextPuzzleRound() {
  // Pick doa: prefer short doa (3-8 words) for playability
  const candidates = App.doaList.filter(d => {
    if (puzzleState.playedIds.includes(d.id)) return false;
    const wc = tokenizeLatin(d.latin).length;
    return wc >= 3 && wc <= 10;
  });
  if (candidates.length === 0 || puzzleState.completed >= puzzleState.roundsToPlay) {
    return renderPuzzleResult();
  }
  const doa = candidates[Math.floor(Math.random() * candidates.length)];
  puzzleState.playedIds.push(doa.id);
  puzzleState.doa = doa;
  const words = tokenizeLatin(doa.latin);
  puzzleState.correctOrder = words;
  puzzleState.currentAnswer = [];
  // Create shuffled bank with unique IDs (in case duplicates)
  puzzleState.shuffledBank = words
    .map((w, i) => ({ id: i, word: w, used: false }))
    .sort(() => Math.random() - 0.5);
  renderPuzzleRound();
}

function tokenizeLatin(latin) {
  // Split on whitespace and drop obvious punctuation-only tokens
  return latin
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w && w !== '.' && w !== ',');
}

function renderPuzzleRound() {
  const app = document.getElementById('app');
  const doa = puzzleState.doa;
  if (!app || !doa) return;

  const answerHTML = puzzleState.currentAnswer.length === 0
    ? '<span class="puzzle-answer-placeholder">Ketuk kata di bawah untuk menyusun</span>'
    : puzzleState.currentAnswer.map(item => 
        '<button class="puzzle-word-chip in-answer" onclick="unpickPuzzleWord(' + item.id + ')">' + item.word + '</button>'
      ).join('');

  const bankHTML = puzzleState.shuffledBank.map(item =>
    item.used
      ? '<button class="puzzle-word-chip used" disabled>' + item.word + '</button>'
      : '<button class="puzzle-word-chip" onclick="pickPuzzleWord(' + item.id + ')">' + item.word + '</button>'
  ).join('');

  app.innerHTML = 
    '<div class="main-content"><div class="flex-between mb-md">' +
      '<button class="btn btn-secondary" onclick="renderGamePage()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Kembali</button>' +
      '<span style="font-family:var(--font-body);font-weight:700;color:var(--emerald-700);">' + (puzzleState.completed + 1) + '/' + puzzleState.roundsToPlay + '</span>' +
    '</div>' +
    '<div class="puzzle-container">' +
      '<div class="puzzle-header"><span class="hero-eyebrow" style="color:var(--gold-500);border-color:var(--gold-400);">' + (doa.kategoriLabel || doa.kategori) + '</span><h2 style="font-family:var(--font-display);font-style:italic;color:var(--ink-900);margin-top:8px;">' + doa.nama + '</h2><p style="font-family:var(--font-body);color:var(--ink-500);font-size:0.85rem;margin-top:4px;">' + doa.terjemahan.slice(0, 100) + (doa.terjemahan.length > 100 ? '...' : '') + '</p></div>' +
      '<div class="puzzle-answer" id="puzzleAnswer">' + answerHTML + '</div>' +
      '<div class="puzzle-bank">' + bankHTML + '</div>' +
      '<div class="puzzle-actions">' +
        '<button class="btn btn-secondary" onclick="resetPuzzle()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> Reset</button>' +
        '<button class="btn btn-primary" onclick="checkPuzzle()" ' + (puzzleState.currentAnswer.length !== puzzleState.correctOrder.length ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : '') + '>Cek Jawaban</button>' +
      '</div>' +
    '</div></div>';
}

function pickPuzzleWord(id) {
  const item = puzzleState.shuffledBank.find(x => x.id === id);
  if (!item || item.used) return;
  item.used = true;
  puzzleState.currentAnswer.push({ id: item.id, word: item.word });
  renderPuzzleRound();
}

function unpickPuzzleWord(id) {
  const idx = puzzleState.currentAnswer.findIndex(x => x.id === id);
  if (idx === -1) return;
  puzzleState.currentAnswer.splice(idx, 1);
  const bankItem = puzzleState.shuffledBank.find(x => x.id === id);
  if (bankItem) bankItem.used = false;
  renderPuzzleRound();
}

function resetPuzzle() {
  puzzleState.currentAnswer = [];
  puzzleState.shuffledBank.forEach(x => x.used = false);
  renderPuzzleRound();
}

function checkPuzzle() {
  const answer = puzzleState.currentAnswer.map(x => x.word);
  const correct = puzzleState.correctOrder;
  const isCorrect = answer.length === correct.length && answer.every((w, i) => w === correct[i]);
  
  puzzleState.completed++;
  
  if (isCorrect) {
    puzzleState.score++;
    App.xp = (App.xp || 0) + 15;
    saveXP();
    showToast('Benar! +15 XP', 'success');
    showConfetti();
  } else {
    showToast('Kurang tepat, jawaban benar: ' + correct.join(' '), 'error');
  }

  // Show correct answer briefly then next round
  const answerEl = document.getElementById('puzzleAnswer');
  if (answerEl) {
    answerEl.style.background = isCorrect ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, #FEF2F2, #FEE2E2)';
    answerEl.style.borderColor = isCorrect ? 'var(--emerald-500)' : 'var(--coral-500)';
    if (!isCorrect) {
      answerEl.innerHTML = correct.map(w => '<span class="puzzle-word-chip correct-answer">' + w + '</span>').join('');
    }
  }
  
  setTimeout(() => nextPuzzleRound(), isCorrect ? 1200 : 2200);
}

function renderPuzzleResult() {
  const app = document.getElementById('app');
  if (!app) return;
  const total = puzzleState.roundsToPlay;
  const score = puzzleState.score;
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;
  const title = pct >= 80 ? 'Luar Biasa!' : passed ? 'Bagus!' : 'Terus Berlatih!';
  const text = pct >= 80 ? 'Kamu jago menyusun doa!' : passed ? 'Sudah baik, tingkatkan lagi ya' : 'Coba lagi, kamu pasti bisa!';
  
  app.innerHTML = 
    '<div class="main-content"><div class="quiz-result">' +
      '<div class="quiz-score-circle"><span>' + pct + '%</span></div>' +
      '<h2 class="quiz-result-title">' + title + '</h2>' +
      '<p class="quiz-result-text">' + text + '<br>Skor: ' + score + '/' + total + '</p>' +
      '<div class="quiz-result-actions">' +
        '<button class="btn btn-primary" onclick="startPuzzleGame()">Main Lagi</button>' +
        '<button class="btn btn-secondary" onclick="renderGamePage()">Kembali</button>' +
      '</div>' +
    '</div></div>';
  
  if (passed) showConfetti();
}

let memoryState = { cards: [], flipped: [], matched: 0, moves: 0 };

function startMemoryGame() {
  const symbols = ['A','B','C','D','E','F','G','H'];
  let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  memoryState = { cards: cards, flipped: [], matched: 0, moves: 0 };
  
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = '<div class="main-content"><div class="flex-between mb-lg"><button class="btn btn-secondary" onclick="renderGamePage()">← Kembali</button><span>Gerakan: <span id="moves">0</span></span></div><div class="memory-grid" id="memoryGrid"></div></div>';
  
  renderMemoryCards();
}

function renderMemoryCards() {
  const grid = document.getElementById('memoryGrid');
  if (!grid) return;
  
  grid.innerHTML = memoryState.cards.map((sym, i) => {
    const flipped = memoryState.flipped.includes(i) || (i < memoryState.matched);
    return '<div class="memory-card ' + (flipped ? 'flipped' : '') + '" onclick="flipCard(' + i + ')">' + (flipped ? sym : '?') + '</div>';
  }).join('');
}

function flipCard(index) {
  if (memoryState.flipped.includes(index)) return;
  if (memoryState.flipped.length >= 2) return;
  
  memoryState.flipped.push(index);
  renderMemoryCards();
  
  if (memoryState.flipped.length === 2) {
    memoryState.moves++;
    document.getElementById('moves').textContent = memoryState.moves;
    
    const [a, b] = memoryState.flipped;
    if (memoryState.cards[a] === memoryState.cards[b]) {
      memoryState.matched++;
      memoryState.flipped = [];
      renderMemoryCards();
      
      if (memoryState.matched === 8) {
        setTimeout(() => {
          showToast('Selamat! Selesai dalam ' + memoryState.moves + ' gerakan!', 'success');
          showConfetti();
          App.xp = (App.xp || 0) + 15;
          saveXP();
        }, 300);
      }
    } else {
      setTimeout(() => { memoryState.flipped = []; renderMemoryCards(); }, 1000);
    }
  }
}

// ================================================
// Progress Page
// ================================================
function renderProgressPage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const memorized = Object.keys(App.progress).filter(id => App.progress[id] === 'memorized').length;
  const total = App.doaList.length;
  const xp = App.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const pct = Math.round((memorized / total) * 100);
  
  app.innerHTML = '<div class="main-content"><div class="progress-header"><div class="progress-avatar"><img src="assets/characters/' + (App.settings.avatar === 'boy' ? 'boy' : 'girl') + '.webp" alt="Avatar"></div><div class="progress-level">Level ' + level + '</div><div class="progress-xp">' + xp + ' XP</div>' + (App.streak.count > 0 ? '<div style="margin-top:14px;"><span class="streak-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-.5 3-2 5-4 6 1 2 4 3 4 6 3-1 5-3 5-6-2-2-4-4-5-6z"/><path d="M8 14c-2 2-2 4-1 6 3 2 8 2 10 0 1-2 1-4-1-6-2 1-6 1-8 0z"/></svg> ' + App.streak.count + ' hari beruntun</span></div>' : '') + '</div><div class="progress-stats"><div class="progress-stat-card"><div class="progress-stat-value">' + memorized + '</div><div class="progress-stat-label">Sudah Hafal</div></div><div class="progress-stat-card"><div class="progress-stat-value">' + total + '</div><div class="progress-stat-label">Total Doa</div></div><div class="progress-stat-card"><div class="progress-stat-value">' + pct + '%</div><div class="progress-stat-label">Progress</div></div></div><div style="text-align:center;margin:20px 0;"><button class="share-btn" onclick="shareProgress()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg><span>Bagikan Progress</span></button></div><div class="section-title"><h2>Badge Kamu</h2></div><div class="badge-grid"><div class="badge-item ' + (memorized >= 10 ? 'unlocked' : '') + '"><div class="badge-icon">🥉</div><span class="badge-name">Hafidz Pemula</span></div><div class="badge-item ' + (memorized >= 25 ? 'unlocked' : '') + '"><div class="badge-icon">🥈</div><span class="badge-name">Hafidz Hebat</span></div><div class="badge-item ' + (memorized >= 50 ? 'unlocked' : '') + '"><div class="badge-icon">🥇</div><span class="badge-name">Hafidz Cilik</span></div><div class="badge-item ' + (memorized >= 56 ? 'unlocked' : '') + '"><div class="badge-icon">👑</div><span class="badge-name">Bintang Doa</span></div><div class="badge-item ' + (App.streak.count >= 7 ? 'unlocked' : '') + '"><div class="badge-icon">🔥</div><span class="badge-name">Streak 7 Hari</span></div><div class="badge-item ' + (App.streak.count >= 30 ? 'unlocked' : '') + '"><div class="badge-icon">⚡</div><span class="badge-name">Streak 30 Hari</span></div></div></div>';
}

// Share Progress Feature
async function shareProgress() {
  const memorized = Object.keys(App.progress).filter(id => App.progress[id] === 'memorized').length;
  const total = App.doaList.length;
  const xp = App.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const pct = Math.round((memorized / total) * 100);

  const text = '📿 Progress Belajar Doa Harian Saya:\n' +
    '⭐ Level ' + level + ' (' + xp + ' XP)\n' +
    '📚 ' + memorized + '/' + total + ' doa hafal (' + pct + '%)\n' +
    '🔥 Streak: ' + App.streak.count + ' hari\n\n' +
    'Yuk belajar doa bareng di: ' + window.location.origin;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Progress Doa Harian', text: text });
      showToast('Berhasil dibagikan!', 'success');
    } catch (err) {
      if (err.name !== 'AbortError') fallbackShare(text);
    }
  } else {
    fallbackShare(text);
  }
}

function fallbackShare(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Progress disalin ke clipboard!', 'success');
  }).catch(() => {
    showToast('Tidak bisa membagikan', 'error');
  });
}

// ================================================
// Settings Page
// ================================================
function renderSettingsPage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const currentAvatar = App.settings.avatar || 'girl';
  
  app.innerHTML = '<div class="main-content"><div class="section-title"><h2>Pengaturan</h2></div>' +
    '<div class="info-card mb-md"><div class="info-card-header">Pilih Avatar</div><div class="info-card-content"><div style="display:flex;gap:12px;margin-top:10px;">' +
    '<button onclick="setAvatar(\'girl\')" style="flex:1;padding:12px;border-radius:16px;border:2px solid ' + (currentAvatar === 'girl' ? 'var(--emerald-500)' : 'rgba(0,0,0,0.08)') + ';background:' + (currentAvatar === 'girl' ? 'var(--emerald-50)' : 'white') + ';cursor:pointer;transition:all 0.2s;"><img src="assets/characters/girl.webp" alt="Girl" style="width:70px;height:70px;margin:0 auto;"><div style="font-family:var(--font-body);font-weight:700;font-size:0.85rem;color:var(--ink-800);margin-top:6px;">Anisa</div></button>' +
    '<button onclick="setAvatar(\'boy\')" style="flex:1;padding:12px;border-radius:16px;border:2px solid ' + (currentAvatar === 'boy' ? 'var(--emerald-500)' : 'rgba(0,0,0,0.08)') + ';background:' + (currentAvatar === 'boy' ? 'var(--emerald-50)' : 'white') + ';cursor:pointer;transition:all 0.2s;"><img src="assets/characters/boy.webp" alt="Boy" style="width:70px;height:70px;margin:0 auto;"><div style="font-family:var(--font-body);font-weight:700;font-size:0.85rem;color:var(--ink-800);margin-top:6px;">Ahmad</div></button>' +
    '</div></div></div>' +
    '<div class="info-card mb-md"><div class="info-card-header">Mode Gelap</div><div class="info-card-content" style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;"><span style="color:var(--ink-500);font-size:0.85rem;">Tampilan malam yang lembut untuk mata</span><label class="switch"><input type="checkbox" id="darkModeToggle" ' + (App.settings.darkMode ? 'checked' : '') + ' onchange="toggleDarkMode()"></label></div></div>' +
    '<div style="text-align:center;margin-top:24px;"><button class="btn btn-secondary" onclick="resetProgress()">Reset Progress</button></div></div>';
}

function setAvatar(name) {
  App.settings.avatar = name;
  saveSettings();
  renderSettingsPage();
  showToast('Avatar diubah', 'success');
}

function toggleDarkMode() {
  App.settings.darkMode = document.getElementById('darkModeToggle').checked;
  saveSettings();
  document.body.classList.toggle('dark-mode', App.settings.darkMode);
}

function resetProgress() {
  if (confirm('Yakin reset semua progress?')) {
    App.progress = {};
    App.favorites = [];
    App.xp = 0;
    App.streak = { count: 0, lastDate: null };
    saveProgress();
    saveFavorites();
    saveXP();
    saveStreak();
    showToast('Progress direset', 'info');
    renderSettingsPage();
  }
}

// ================================================
// Favorites Page
// ================================================
function renderFavoritesPage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const favs = App.doaList.filter(d => App.favorites.includes(d.id));
  
  if (favs.length === 0) {
    app.innerHTML = '<div class="main-content"><div class="text-center p-xl"><div style="width:100px;height:100px;margin:20px auto;border-radius:50%;background:linear-gradient(135deg,var(--gold-100),var(--gold-300));display:flex;align-items:center;justify-content:center;font-size:2.5rem;box-shadow:var(--shadow-gold);">⭐</div><h2 style="margin-bottom:8px;">Belum Ada Favorit</h2><p class="text-secondary mb-lg">Tambahkan doa favorit dengan menekan ikon bintang di detail doa</p><button class="btn btn-primary" onclick="navigateTo(\'list\')">Lihat Semua Doa</button></div></div>';
    return;
  }
  
  let html = '<div class="main-content"><div class="section-title"><h2>Doa Favorit</h2></div>';
  favs.forEach(doa => {
    html += '<div class="doa-card" onclick="showDoaDetail(' + doa.id + ')"><div class="doa-card-thumb" style="background-image:url(\'assets/doa/' + doa.id + '.webp\');"></div><div class="doa-card-content"><h3 class="doa-card-title">' + doa.nama + '</h3><span class="doa-card-category">' + (doa.kategoriLabel || doa.kategori) + '</span></div></div>';
  });
  html += '</div>';
  
  app.innerHTML = html;
}

// ================================================
// Toast & Confetti
// ================================================
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span><span class="toast-message">' + message + '</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>';
  
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  const colors = ['#6B9DFC', '#7ED6A3', '#FFD93D', '#FFB6C1', '#B794F6'];
  
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.top = '-10px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 2 + 's';
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
    container.appendChild(piece);
  }
  
  setTimeout(() => container.remove(), 5000);
}
