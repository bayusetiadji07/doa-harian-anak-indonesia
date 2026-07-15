# Doa Harian Anak Indonesia

## Premium Islamic Kids Educational PWA

![Doa Harian](https://img.shields.io/badge/Version-1.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)
![Offline](https://img.shields.io/badge/Offline-Support-green)

Aplikasi Progressive Web App (PWA) edukasi Islam premium yang dirancang untuk membantu anak-anak usia 5-12 tahun menghafal doa sehari-hari dengan cara yang menyenangkan dan interaktif.

## Fitur Utama

### 📚 Koleksi Doa Lengkap
- **56 doa** dengan teks Arab, latin, dan terjemahan Indonesia
- Sumber hadis shahih (Bukhari, Muslim, Tirmidzi, dll)
- Ilustrasi menarik untuk setiap doa
- Hikmah dan penjelasan untuk setiap doa

### 🎮 Gamifikasi
- Sistem XP dan Level
- Sistem Badge/Achievement
- Progress Tracking
- Streak Belajar

### 📝 Quiz Interaktif
- 100+ soal pilihan ganda
- Review jawaban
- Confetti celebration untuk nilai ≥80%

### 🎲 Game Edukasi
- Memory Card
- Puzzle
- Tebak Doa
- Dan lainnya...

### 🎧 Audio Player
- Text-to-Speech menggunakan Web Speech API
- Highlight kata per kata
- Pengaturan kecepatan (0.5x - 1.25x)
- Repeat mode

### 📱 PWA Features
- Install ke Home Screen
- Offline Mode
- Fast Loading
- Splash Screen

## Kategori Doa

| Kategori | Jumlah |
|----------|--------|
| Tidur | 2 |
| Makan & Minum | 4 |
| Bersuci | 4 |
| Pakaian | 3 |
| Rumah | 2 |
| Belajar | 3 |
| Perjalanan | 2 |
| Masjid | 4 |
| Al-Quran | 2 |
| Cuaca | 3 |
| Kesehatan | 3 |
| Kehidupan | 16 |
| Dzikir | 2 |
| Surah & Doa Khusus | 6 |

## Teknologi

- HTML5
- CSS3 (Modern CSS dengan Variables)
- Vanilla JavaScript (ES6+)
- Progressive Web App (PWA)
- LocalStorage untuk persistence
- Web Speech API untuk audio

## Instalasi

### Clone Repository
```bash
git clone <repo-url>
cd doa-harian
```

### Jalankan Lokal
Cukup buka file `index.html` di browser modern, atau gunakan server lokal:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

### Deploy ke Vercel/Netlify
1. Push ke GitHub repository
2. Connect ke Vercel atau Netlify
3. Deploy automatically

## Struktur Proyek

```
doa-harian/
├── index.html          # Main HTML entry
├── style.css           # All styles
├── script_main.js      # Main application logic
├── quiz_data.json      # Quiz questions data
├── data/
│   └── doa.json        # 56 prayers data
├── assets/
│   └── icons/          # PWA icons
├── manifest.json        # PWA manifest
├── service-worker.js    # Offline functionality
└── README.md           # Documentation
```

## Target Pengguna

- 👧 Anak usia 5-12 tahun
- 👨‍👩‍👧 Orang tua
- 👩‍🏫 Guru TK/SD/Madrasah
- 📖 Pendidik TPA/TPQ

## Lisensi

© 2024 Doa Harian Anak Indonesia. Semua hak dilindungi.

---

*Made with ❤️ for Indonesian Muslim Children*
