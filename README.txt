========================================
   VOXYY JOKI
   Intro terpisah + Music di semua halaman + TTS
   Siap deploy Vercel / Netlify
========================================

STRUKTUR:
- index.html     → Halaman intro/splash (animasi biru + AI voice)
- home.html      → Halaman Home utama (setelah masuk)
- music.js       → Lagu background di SEMUA halaman
- music.m4a      → File lagu (ganti sesuai selera)

ALUR:
1. User buka link → index.html (intro)
2. Progress → KLIK UNTUK MASUK
3. Muncul teks "Selamat datang..." + AI cowok bicara
4. Lagu mulai + pindah ke home.html
5. Klik Home lagi / pindah halaman → intro TIDAK muncul lagi (1x per sesi browser)
6. Tombol Pause/Play lagu ada di header hampir semua halaman

DEPLOY VERCEL:
1. Upload folder website_voxyy ke vercel.com
2. Atau: vercel --prod
3. Tambah domain Vercel di Firebase Authorized domains

GANTI LAGU:
Ganti music.m4a (m4a/mp3, <3MB)

FIREBASE: lihat setup di README lama / global-orders.js
========================================
