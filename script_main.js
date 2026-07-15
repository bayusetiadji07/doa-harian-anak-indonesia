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
  XP: 'doa_harian_xp'
};

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
}

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
  
  app.innerHTML = '<div class="main-content"><div class="hero-section animate-fade-in"><div class="hero-illustration">👦👧</div><h1 class="hero-title">Doa Harian Anak Indonesia</h1><p class="hero-subtitle">Ayo Belajar Doa Setiap Hari</p></div><div class="stats-bar"><div class="stat-item"><div class="stat-value">' + memorized + '</div><div class="stat-label">Sudah Hafal</div></div><div class="stat-item"><div class="stat-value">' + total + '</div><div class="stat-label">Total Doa</div></div><div class="stat-item"><div class="stat-value">' + (App.favorites?.length || 0) + '</div><div class="stat-label">Favorit</div></div></div><div class="section-title"><h2>Pilih Kategori</h2></div><div class="grid-container" id="menuGrid"></div></div>';
  
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
  
  app.innerHTML = '<div class="main-content"><div class="search-container"><span class="search-icon">🔍</span><input type="text" class="search-input" id="searchInput" placeholder="Cari doa..."><button class="search-clear" id="searchClear">✕</button></div><div class="filter-container" id="filterContainer"></div><div id="doaList"></div></div>';
  
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
    return '<button class="filter-chip ' + (active ? 'active' : '') + '" data-category="' + cat.id + '">' + cat.icon + ' ' + cat.label + '</button>';
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
    let statusIcon = status === 'memorized' ? '✓' : status === 'learning' ? '◐' : '';
    
    return '<div class="doa-card" data-id="' + doa.id + '"><div class="doa-card-icon">' + getCategoryIcon(doa.kategori) + '</div><div class="doa-card-content"><h3 class="doa-card-title">' + doa.nama + '</h3><span class="doa-card-category">' + (doa.kategoriLabel || doa.kategori) + '</span></div><div class="doa-card-actions"><span class="doa-card-status ' + statusClass + '">' + statusIcon + '</span></div></div>';
  }).join('');
  
  list.querySelectorAll('.doa-card').forEach(card => {
    card.addEventListener('click', () => {
      showDoaDetail(parseInt(card.dataset.id));
    });
  });
}

// ================================================
// Audio Player
// ================================================
let audioState = {
  isPlaying: false,
  speed: 1,
  utterance: null
};

function initAudio(arabic, latin) {
  if (!('speechSynthesis' in window)) {
    console.log('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  audioState.utterance = new SpeechSynthesisUtterance(arabic + '. ' + latin);
  audioState.utterance.lang = 'ar-SA';
  audioState.utterance.rate = audioState.speed;

  // Try to find Arabic voice
  const voices = speechSynthesis.getVoices();
  const arabicVoice = voices.find(v => v.lang.includes('ar'));
  if (arabicVoice) {
    audioState.utterance.voice = arabicVoice;
  }

  audioState.utterance.onend = () => {
    audioState.isPlaying = false;
    updateAudioUI();
  };

  audioState.utterance.onerror = () => {
    audioState.isPlaying = false;
    updateAudioUI();
  };
}

function togglePlay(arabic, latin) {
  if (!('speechSynthesis' in window)) {
    showToast('Browser tidak mendukung audio', 'error');
    return;
  }

  if (audioState.isPlaying) {
    speechSynthesis.pause();
    audioState.isPlaying = false;
  } else {
    if (!audioState.utterance) {
      initAudio(arabic, latin);
    }
    speechSynthesis.speak(audioState.utterance);
    audioState.isPlaying = true;
  }
  updateAudioUI();
}

function stopAudio() {
  speechSynthesis.cancel();
  audioState.isPlaying = false;
  audioState.utterance = null;
  updateAudioUI();
}

function changeSpeed() {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5];
  const currentIndex = speeds.indexOf(audioState.speed);
  audioState.speed = speeds[(currentIndex + 1) % speeds.length];

  if (audioState.utterance) {
    audioState.utterance.rate = audioState.speed;
  }

  updateAudioUI();
}

function updateAudioUI() {
  const playBtn = document.getElementById('playAudioBtn');
  const speedBtn = document.getElementById('speedBtn');

  if (playBtn) {
    playBtn.innerHTML = audioState.isPlaying ? '⏸️' : '▶️';
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

  app.innerHTML = '<div class="doa-detail"><div class="doa-detail-header"><button class="doa-detail-back" onclick="navigateTo(\'list\')">←</button><button class="favorite-btn ' + (isFav ? 'active' : '') + '" onclick="toggleFavorite(' + doa.id + ')">⭐</button><div class="doa-detail-illustration">' + getCategoryIcon(doa.kategori) + '</div><h1 class="doa-detail-title">' + doa.nama + '</h1><span class="doa-detail-category">' + (doa.kategoriLabel || doa.kategori) + '</span></div><div class="doa-content"><div class="doa-arab-section"><div class="doa-arab">' + doa.arab + '</div><div class="doa-latin"><em>' + doa.latin + '</em></div></div><div class="audio-player-section"><div class="audio-controls"><button class="audio-btn" id="playAudioBtn" onclick="togglePlay(\'' + escapeForJS(doa.arab) + '\', \'' + escapeForJS(doa.latin) + '\')">▶️</button><button class="audio-btn-small" onclick="changeSpeed()" id="speedBtn">1x</button><button class="audio-btn-small" onclick="stopAudio()">⏹️</button></div></div><div class="doa-translation"><h4>📜 Terjemahan</h4><p>' + doa.terjemahan + '</p></div><div class="doa-info"><div class="info-card"><div class="info-card-header">💡 Hikmah</div><div class="info-card-content">' + (doa.hikmah || '-') + '</div></div><div class="info-card"><div class="info-card-header">⏰ Kapan Dibaca</div><div class="info-card-content">' + (doa.kapanDibaca || '-') + '</div></div><div class="info-card"><div class="info-card-header">📚 Sumber</div><div class="info-card-content">' + (doa.sumber || '-') + '</div></div></div><div class="status-buttons"><button class="status-btn ' + (status === 'learning' ? 'active' : '') + '" onclick="setDoaStatus(' + doa.id + ', \'learning\')"><span class="status-icon">📖</span><span class="status-label">Sedang Dipelajari</span></button><button class="status-btn ' + (status === 'memorized' ? 'active' : '') + '" onclick="setDoaStatus(' + doa.id + ', \'memorized\')"><span class="status-icon">🎯</span><span class="status-label">Sudah Hafal</span></button></div></div></div>';

  // Initialize audio with this doa
  initAudio(doa.arab, doa.latin);
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
    app.innerHTML = '<div class="quiz-container"><div class="quiz-start"><div class="text-3xl mb-md">📝</div><h2>Quiz Doa Harian</h2><p class="text-secondary mb-xl">Uji kemampuanmu menghafal doa!</p><button class="btn btn-primary" onclick="startQuiz()">Mulai Quiz</button></div></div>';
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
  
  app.innerHTML = '<div class="main-content"><h2 class="mb-lg">🎮 Game Edukasi</h2><div class="games-grid"><div class="game-card" onclick="startMemoryGame()"><div class="game-card-icon">🧠</div><h3 class="game-card-title">Memory Card</h3><p class="game-card-desc">Pasangkan kartu</p></div><div class="game-card"><div class="game-card-icon">🧩</div><h3 class="game-card-title">Puzzle</h3><p class="game-card-desc">Coming soon</p></div><div class="game-card"><div class="game-card-icon">🎯</div><h3 class="game-card-title">Tebak Doa</h3><p class="game-card-desc">Coming soon</p></div></div></div>';
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
  
  app.innerHTML = '<div class="main-content"><div class="progress-header"><div class="progress-avatar">👦</div><div class="progress-level">Level ' + level + '</div><div class="progress-xp">' + xp + ' XP</div></div><div class="progress-stats"><div class="progress-stat-card"><div class="progress-stat-value">' + memorized + '</div><div class="progress-stat-label">Sudah Hafal</div></div><div class="progress-stat-card"><div class="progress-stat-value">' + total + '</div><div class="progress-stat-label">Total Doa</div></div><div class="progress-stat-card"><div class="progress-stat-value">' + pct + '%</div><div class="progress-stat-label">Progress</div></div></div><h3 class="mb-md">🏆 Badge</h3><div class="badge-grid"><div class="badge-item ' + (memorized >= 10 ? 'unlocked' : '') + '"><div class="badge-icon">🥉</div><span class="badge-name">Hafidz Pemula</span></div><div class="badge-item ' + (memorized >= 25 ? 'unlocked' : '') + '"><div class="badge-icon">🥈</div><span class="badge-name">Hafidz Hebat</span></div><div class="badge-item ' + (memorized >= 50 ? 'unlocked' : '') + '"><div class="badge-icon">🥇</div><span class="badge-name">Hafidz Cilik</span></div><div class="badge-item ' + (memorized >= 56 ? 'unlocked' : '') + '"><div class="badge-icon">👑</div><span class="badge-name">Bintang Doa</span></div></div></div>';
}

// ================================================
// Settings Page
// ================================================
function renderSettingsPage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = '<div class="main-content"><h2 class="mb-lg">⚙️ Pengaturan</h2><div class="info-card mb-md"><div class="info-card-header">🌙 Mode Gelap</div><div class="info-card-content"><label class="switch"><input type="checkbox" id="darkModeToggle" ' + (App.settings.darkMode ? 'checked' : '') + ' onchange="toggleDarkMode()"></label></div></div><button class="btn btn-secondary" onclick="resetProgress()">🔄 Reset Progress</button></div>';
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
    saveProgress();
    saveFavorites();
    saveXP();
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
    app.innerHTML = '<div class="main-content"><div class="text-center p-xl"><div class="text-3xl mb-md">⭐</div><h2>Belum Ada Favorit</h2><p class="text-secondary mb-lg">Tambahkan doa favorit dengan menekan bintang</p><button class="btn btn-primary" onclick="navigateTo(\'list\')">Lihat Doa</button></div></div>';
    return;
  }
  
  let html = '<div class="main-content"><h2 class="mb-lg">⭐ Favorit</h2>';
  favs.forEach(doa => {
    html += '<div class="doa-card" onclick="showDoaDetail(' + doa.id + ')"><div class="doa-card-icon">' + getCategoryIcon(doa.kategori) + '</div><div class="doa-card-content"><h3 class="doa-card-title">' + doa.nama + '</h3><span class="doa-card-category">' + (doa.kategoriLabel || doa.kategori) + '</span></div></div>';
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
