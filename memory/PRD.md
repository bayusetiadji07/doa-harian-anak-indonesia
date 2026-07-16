# Doa Harian Anak Indonesia — PRD

## Original Problem Statement
GitHub: https://github.com/bayusetiadji07/doa-harian-anak-indonesia
Live: https://doa-harian-anak-indonesia.vercel.app/

Session tasks (2026-01-16):
1. Cek repo & fix identified issues
2. Full UI redesign with attached custom assets (elegant Islamic aesthetic)
3. Custom AI-generated illustrations per doa + implement Puzzle game

## Application Type
Progressive Web App (PWA) — vanilla HTML/CSS/JavaScript. Islamic educational app for Indonesian children age 5-12.

## Design System (v3 — Elegant Islamic)
- **Palette**: Emerald + Gold + Cream (from masjid asset & Islamic calligraphy)
- **Typography**: Fraunces (italic serif) + Plus Jakarta Sans (body) + Amiri Quran (Arabic)
- **Illustrations**: 3D-render cartoon style, generated with Gemini Nano Banana

## Assets Bank
- `assets/characters/boy.webp` (22KB) — Ahmad
- `assets/characters/girl.webp` (19KB) — Anisa
- `assets/scenes/{night-village,masjid,study-room}.webp`
- `assets/doa/{1..56}.webp` — **AI-generated illustrations per doa** (3.2MB total, avg 57KB each)

## What's Been Implemented

### Bug Fixes
- service-worker cache path: `/script.js` → `/script_main.js`
- 8 missing PNG icons generated from SVG
- Cleaned 24 doa with Chinese CJK glyphs
- Removed backup files & unused large assets

### Core Features
- 🔥 Streak counter (consecutive days)
- 📤 Share Progress via Web Share API
- 🌙 Full Dark Mode theme
- 🏆 6 badges (4 progress + 2 streak-based)
- Avatar selection (Ahmad/Anisa) in settings

### Custom Illustrations (56 doa)
- Generated via Gemini 3.1 Flash Image Preview (Nano Banana) using Emergent LLM Key
- Consistent art direction: Pixar × Ghibli warm cartoon, matching character asset style
- Character-appropriate: boy uses white kopiah + blue outfit, girl uses pink hijab
- Contextual per doa: bedtime scene for tidur, market for pasar, mosque for masjid, etc.
- Compressed to WebP (avg 57KB) — total 3.2MB for all 56
- Used as: card thumbnails in list + full illustration in detail page hero

### Games
- **Memory Card** (existing) — flip pairs
- **Puzzle Doa** (NEW) — arrange Latin words in correct order
  - 5 rounds per session
  - Picks doa with 3-10 words for playability
  - Tap-to-pick / tap-to-remove word chips
  - +15 XP per correct answer
  - Confetti animation + toast feedback
  - Shows correct answer on failure
- **Tebak Doa** — planned (P1)

## Verified Testing (Playwright E2E)
- ✅ 56 custom illustrations rendering (list thumbnails + detail hero)
- ✅ Puzzle game full flow: pick → check → next round → results
- ✅ Correct answer: toast + confetti + +15 XP + auto-advance
- ✅ Wrong answer: shows correct sequence + auto-advance
- ✅ Reset button works
- ✅ Dark mode preserved across puzzle
- ✅ 0 JavaScript errors

## Prioritized Backlog

### P1
- **Tebak Doa** game (multiple choice: given terjemahan → pick doa name)
- Prerecorded Arabic audio (Web Speech API pronunciation limited)
- Font size setting implementation
- Push perubahan ke GitHub via "Save to Github" untuk Vercel auto-deploy

### P2
- Daily reminder notifications (PWA push)
- QR code printable card (parent/teacher shareable)
- Puzzle difficulty levels (easy/medium/hard by word count)

### P3
- Multi-language (English translations)
- Voice recognition — anak baca, app cek pronunciation
- Leaderboard (needs backend + auth)

## Environment
- `EMERGENT_LLM_KEY` in `/app/backend/.env` for Gemini Nano Banana
- Backend: minimal FastAPI at `/api/health` only
- Frontend: static PWA served via `serve` on port 3000

## File Structure
```
/app/
├── index.html
├── style.css                   # v3 elegant Islamic + puzzle styles
├── script_main.js              # + Puzzle game + custom illustrations
├── manifest.json
├── service-worker.js           # v3 cache
├── data/doa.json               # 56 doa
├── quiz_data.json
├── scripts/generate_illustrations.py  # Batch generator (one-time)
├── assets/
│   ├── characters/             # boy.webp, girl.webp
│   ├── scenes/                 # (legacy) 3 category scenes
│   ├── doa/                    # 56 AI-generated per-doa illustrations
│   └── icons/                  # PWA icons (PNG + SVG)
├── backend/server.py
├── memory/PRD.md
└── frontend/package.json       # static server
```

## AI Generation Note
Illustrations generated via `emergentintegrations` library. Regenerate a single doa:
```bash
cd /app && python3 -c "import asyncio; from scripts.generate_illustrations import generate_one, DOA_PROMPTS; asyncio.run(generate_one(DOA_ID, 'Name', DOA_PROMPTS[DOA_ID]))"
```
