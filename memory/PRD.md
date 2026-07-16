# Doa Harian Anak Indonesia — PRD

## Original Problem Statement
GitHub: https://github.com/bayusetiadji07/doa-harian-anak-indonesia
Live: https://doa-harian-anak-indonesia.vercel.app/

Session tasks:
1. "cek folder aplikasi di folder github" — audit repo
2. "oke semuanya" — fix all identified issues + add improvements
3. "perbaiki ui sesuaikan aset yang saya lampirkan, buat tmpilan lebih elegan dan menarik" — full UI redesign with custom illustrated assets

## Application Type
Progressive Web App (PWA) — vanilla HTML/CSS/JavaScript. Islamic educational app for Indonesian children age 5-12.

## Architecture
- Vanilla JS (ES6+), HTML5, CSS3
- LocalStorage persistence
- Service Worker for offline
- Web Speech API for TTS
- Served via `serve` on port 3000 in Emergent preview
- Minimal FastAPI backend for /api/health only

## User Personas
- 👧 Anak usia 5-12 tahun (primary)
- 👨‍👩‍👧 Orang tua
- 👩‍🏫 Guru TK/SD/Madrasah, pendidik TPA/TPQ

## Design System (v3 — Islamic Elegant)
- **Palette**: Emerald green (from masjid) + Gold (from calligraphy) + Soft coral/sky (from characters)
- **Typography**: Fraunces (italic serif display) + Plus Jakarta Sans (body) + Amiri Quran (Arabic)
- **Icons**: Custom SVG (lucide-style) for nav, emoji retained for kid-friendly categories
- **Patterns**: Subtle Islamic geometric watermark on bg
- **Illustrations**: 3D-render style characters (boy/girl) + scene backgrounds

## Assets Bank
- `assets/characters/boy.webp` (22KB) — Ahmad (peci, blue outfit)
- `assets/characters/girl.webp` (19KB) — Anisa (pink hijab)
- `assets/scenes/night-village.webp` (7KB) — for kategori tidur
- `assets/scenes/masjid.webp` (11KB) — for masjid/quran/surah kategori
- `assets/scenes/study-room.webp` (11KB) — for belajar kategori
- `assets/icons/*.png` (8 sizes, generated from SVG) — PWA icons

## What's Been Implemented (session 2026-01-16)

### Session 1 — Repo Audit & Bug Fixes
- Fixed service-worker cache path: `/script.js` → `/script_main.js`
- Generated 8 missing PNG icons (72–512px) from SVG
- Cleaned 24 doa entries with Chinese CJK glyphs (模拟, 教导, 交通工具, 提醒)
- Removed `.backup` files and unused large PNG assets
- Size reduction: 4.4MB → 680KB

### Session 2 — Feature Additions
- 🔥 Streak counter (consecutive days)
- 📤 Share Progress via Web Share API + clipboard fallback
- 🌙 Dark Mode (full theme, not just toggle placeholder)
- 🏆 Streak 7 & 30 day badges

### Session 3 — Full UI Redesign (Elegant Islamic)
- Complete style.css rewrite with Emerald+Gold palette (`v3.0`)
- Hero section with real character illustrations (boy+girl) + geometric pattern overlay
- Detail page: **scene backgrounds per kategori** (night-village for tidur, masjid for masjid/quran/surah, study-room for belajar)
- Elegant typography: Fraunces italic for headings, Amiri Quran for Arabic text (with proper direction/spacing)
- Bottom nav: SVG icons instead of emoji
- Header logo: custom geometric mark (conic gradient + dot)
- Settings page: Avatar selection (Anisa/Ahmad) with character preview
- Progress avatar uses selected character image
- All buttons/CTAs: pill-shaped, elegant gradients, gold accents
- Islamic geometric watermark on body bg
- Subtle grain/pattern overlays on hero/detail headers

## Verified Testing (Playwright E2E)
- ✅ Home: characters + streak + stats + 20 category cards
- ✅ Detail (tidur): night-village scene ✓ Arabic text with Amiri font ✓
- ✅ Detail (masjid): masjid scene ✓
- ✅ Detail (belajar): study-room scene ✓
- ✅ Settings: avatar picker functional
- ✅ Dark mode: full theme applied
- ✅ Quiz start: elegant CTA
- ✅ Progress: character avatar rendered
- ✅ 0 JavaScript errors

## Prioritized Backlog

### P1
- Puzzle & "Tebak Doa" games (currently marked "Segera hadir")
- Font size setting implementation
- Better audio: prerecorded Arabic audio (Web Speech API pronunciation limited)
- Push perubahan ke GitHub via "Save to Github" agar Vercel auto-deploy

### P2
- Daily reminder notifications (PWA push)
- Leaderboard (needs backend)
- QR code printable card (parent/teacher shareable)
- Custom illustrations per doa (currently uses category emoji)

### P3
- Multi-language (English translations)
- Voice recognition — anak baca, app cek pronunciation

## File Structure
```
/app/
├── index.html              # SVG icons + character splash + Google Fonts
├── style.css               # Elegant Islamic design v3 (Emerald+Gold)
├── script_main.js          # Scene mapping, avatar selection, share, streak
├── manifest.json           # PWA config
├── service-worker.js       # Offline cache v2
├── data/doa.json           # 56 doa (CJK cleaned)
├── quiz_data.json          # 20 questions
├── assets/
│   ├── characters/         # boy.webp, girl.webp
│   ├── scenes/             # night-village, masjid, study-room .webp
│   └── icons/              # 8 PNG + 3 SVG
├── backend/server.py       # /api/health
└── frontend/package.json   # serve on port 3000
```
