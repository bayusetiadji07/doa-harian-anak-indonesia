# Doa Harian Anak Indonesia — PRD

## Original Problem Statement
User meminta pengecekan repo GitHub `bayusetiadji07/doa-harian-anak-indonesia` — sebuah Progressive Web App (PWA) edukasi Islam untuk anak usia 5–12 tahun, kemudian melanjutkan dengan implementasi 2 fitur:
1. **Tebak Doa** — game pilihan ganda (terjemahan → tebak nama doa). Merupakan satu-satunya game yang masih berstatus "Segera hadir".
2. **Prerecorded Arabic Audio** — audio Arab hasil generate OpenAI TTS untuk semua 56 doa.

## Tech Stack
- Frontend static: HTML5 + Vanilla JS (ES6+) + Modern CSS + PWA (service-worker)
- Storage: LocalStorage (tidak ada backend)
- Audio: HTMLAudioElement (MP3 prerecorded) + Web Speech API fallback
- Generator: `scripts/generate_audio.py` → `emergentintegrations.llm.openai.OpenAITextToSpeech`

## What's Been Implemented (2026-01-15)

### A. Tebak Doa Game
- Kartu "Tebak Doa" di Game page aktif (sebelumnya "Segera hadir")
- 10 soal pilihan ganda per sesi
- Terjemahan Indonesia + label kategori → 4 pilihan nama doa (1 benar, 3 distractor acak)
- Feedback: opsi benar hijau, salah merah + jawaban benar tetap tampil
- Reward: **+15 XP per jawaban benar**, confetti bila skor ≥ 60%
- Result screen: persentase, tombol Main Lagi / Kembali
- Data-testid lengkap untuk semua elemen interaktif

### B. Prerecorded Arabic Audio (56/56 doa)
- Script `/app/scripts/generate_audio.py` — pakai `emergentintegrations` + EMERGENT_LLM_KEY
- Model: `tts-1-hd`, voice: `shimmer`, speed 0.9x
- Output: `/app/assets/audio/1.mp3` … `56.mp3` (total ~9.5 MB)
- Player logic:
  - Priority: MP3 (Arab) → setelah selesai chain ke TTS Latin + Terjemahan
  - Auto-fallback ke Web Speech API bila MP3 gagal
  - Speed 0.5x–1.5x berlaku untuk MP3 (`playbackRate`) dan TTS (`rate`)
- Service Worker v3 → **v4** + `AUDIO_CACHE` terpisah, cache-first untuk `/assets/audio/*`

## Testing Status (all ✅)
- Home render, Game page 3 kartu aktif, Tebak Doa flow (round 1 → 2 → ...)
- Detail doa: MP3 mode aktif, readyState=4, play menjalankan audio
- 56/56 MP3 tersedia (81 KB – 785 KB, avg 170 KB, total 9.5 MB)

## File Changes This Session
- `script_main.js` — audio player rewrite + Tebak Doa (+170 LOC)
- `service-worker.js` — v4 + audio cache
- `scripts/generate_audio.py` — new (script one-off)
- `assets/audio/*.mp3` — new (56 files)
- `backend/.env` — EMERGENT_LLM_KEY (untuk generator saja)

## Backlog / P1
- Best score tracking khusus Tebak Doa
- Highlight kata Arab saat MP3 dimainkan (perlu timestamp)
- Regenerate audio dengan model lebih baru (gpt-4o-mini-tts) untuk pronunciation Arab yang lebih native
- Polish dark mode di halaman result

## Next Actions (User Manual)
1. Review perubahan di `/app`
2. **"Save to GitHub"** untuk push ke `bayusetiadji07/doa-harian-anak-indonesia`
3. Vercel akan auto-deploy commit baru; audio ter-serve sebagai static assets
