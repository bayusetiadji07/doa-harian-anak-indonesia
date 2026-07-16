# Doa Harian Anak Indonesia — PRD

## Original Problem Statement
User request: "cek folder aplikasi di folder github" — GitHub repo: https://github.com/bayusetiadji07/doa-harian-anak-indonesia
Live: https://doa-harian-anak-indonesia.vercel.app/

Setelah pengecekan, user meminta "oke semuanya" (fix all identified issues + improvements).

## Application Type
Progressive Web App (PWA) — vanilla HTML/CSS/JavaScript. Islamic educational app for Indonesian children age 5-12 to memorize daily prayers.

## Architecture
- **Frontend**: Vanilla JS (ES6+), HTML5, CSS3 (custom variables)
- **Storage**: LocalStorage (favorites, progress, XP, settings, streak)
- **PWA**: Service Worker, manifest.json, offline support
- **Audio**: Web Speech API (TTS Arabic + Indonesian)
- **Hosting**: Vercel (production) / Python `serve` on port 3000 (preview pod)
- **NO backend business logic** — client-only app. Backend supervisor only serves health endpoint.

## User Personas
- 👧 Anak usia 5-12 tahun (primary user)
- 👨‍👩‍👧 Orang tua (parent oversight)
- 👩‍🏫 Guru TK/SD/Madrasah / TPA-TPQ pendidik

## Core Requirements
- 56 doa dengan Arab, Latin, Terjemahan, Hikmah, Kapan Dibaca, Sumber HR
- Quiz interaktif dengan skor & confetti
- Memory Card game
- Progress tracking (XP, Level, Badge)
- PWA offline-first
- Kids-friendly UI with emoji icons

## What's Been Implemented (Jan 2026 session)

### ✅ Bug Fixes
- **service-worker.js**: Fixed broken cache path `/script.js` → `/script_main.js`, updated icon paths to `.svg`, bumped cache to `v2`
- **doa.json**: Cleaned 24 doa yang punya karakter Mandarin nyasar (模拟, 教导, 交通工具, 提醒) → diganti kata Indonesia yang tepat
- **manifest.json icons**: Generated 8 missing PNG icons (72, 96, 128, 144, 152, 192, 384, 512) dari SVG via cairosvg

### ✅ Cleanup
- Removed `script_main.js.backup` & `style.css.backup`
- Removed unused large assets (`tokoh.png` 2MB, `environment.png` 2.2MB) → replaced with WebP versions (150KB & 185KB, saved 93%)
- Total repo size: **4.4 MB → 680 KB (85% smaller)**

### ✅ New Features
- **🔥 Streak counter**: Track consecutive days of app usage, shown on home + progress page
- **📤 Share Progress**: Web Share API (fallback to clipboard) — share Level, XP, memorized count, streak with friends
- **🌙 Dark Mode**: Full dark theme applied to all pages (was placeholder toggle only)
- **🏆 New Badges**: "Streak 7 Hari" & "Streak 30 Hari"
- **Reset now clears streak too**

### ✅ Infrastructure
- Set up `/app/frontend/package.json` with `serve` to run static PWA on port 3000
- Minimal FastAPI `/app/backend/server.py` for `/api/health`
- All supervisor services running properly

## Verified Testing (Playwright end-to-end)
- ✅ Home page: hero + 3 stats + 20 menu cards + streak badge visible
- ✅ Progress page: Level + share button + 6 badges rendered
- ✅ List page: 56 doa cards loaded
- ✅ Dark mode: full theme applied cross-page
- ✅ 0 JavaScript errors

## Prioritized Backlog

### P1 (High)
- Puzzle & "Tebak Doa" games (currently "Coming soon" placeholders)
- Font size setting implementation (setting exists but unused)
- Better audio: prerecorded Arabic audio (Web Speech API pronunciation is imperfect)

### P2 (Medium)
- Multi-user (parent creates profile per child)
- Daily reminder notifications (PWA push)
- Leaderboard (would require backend)
- Export progress as PDF/image (for parents/teachers)
- Ilustrasi custom per doa (currently uses category emoji)

### P3 (Nice-to-have)
- Multi-language (English translations)
- Print doa as flashcards
- Voice recognition — anak baca, app cek pronunciation

## File Structure
```
/app/
├── index.html              # Entry point + inline QUIZ_QUESTIONS
├── style.css               # Main stylesheet + dark mode
├── script_main.js          # App logic
├── manifest.json           # PWA config
├── service-worker.js       # Offline cache (v2)
├── data/doa.json           # 56 prayers (cleaned)
├── quiz_data.json          # 20 quiz questions (redundant, but kept)
├── assets/
│   ├── icons/              # 8 PNG (generated) + 3 SVG
│   ├── tokoh.webp          # Compressed
│   └── environment.webp    # Compressed
├── backend/server.py       # Minimal health API
└── frontend/package.json   # Static serve on port 3000
```
