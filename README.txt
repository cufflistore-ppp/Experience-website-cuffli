========================================
   VOXYY JOKI
   Firebase Global + Login Google + Menu Akun
   + Intro Animation (tema biru) + Background Music + TTS Welcome
   Siap deploy ke Vercel / Netlify
========================================

FITUR BARU:
1. Intro splash screen tema biru (logo + progress + "Klik untuk masuk")
2. Suara AI cowok (Web Speech API) membaca:
   "Selamat datang di website Voxyy Joki. Di sini kami menyiapkan berbagai jasa."
3. Background music (music.m4a) - loop otomatis
4. Tombol Pause / Play lagu di header kanan atas (hanya di Home)
5. Chip profil user muncul di samping tombol lagu jika sudah login Google

MENU BAWAH:
Joki | Digital | Home | Antrian | Tentang | Akun

LOGIN AKUN:
- Hanya Google (Firebase Authentication)
- Halaman: akun.html

ANTRIAN & ADMIN GLOBAL:
- Data order di Firebase Realtime Database
- Semua HP melihat antrian yang sama
- Admin ubah status → semua HP ikut berubah (realtime)

----------------------------------------
DEPLOY KE VERCEL (disarankan)
----------------------------------------
1. Install Vercel CLI atau pakai dashboard vercel.com
2. Upload folder website_voxyy (atau git push)
3. Domain custom tinggal setting di Vercel
4. Pastikan file music.m4a ikut ter-upload

Atau drag-drop folder ke https://vercel.com/new

----------------------------------------
SETUP FIREBASE (GRATIS, 1x ~5 menit)
----------------------------------------
1. https://console.firebase.google.com → Create project
2. Build → Realtime Database → Create Database → Start in test mode
3. Tab Rules → Publish:
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
4. Build → Authentication → Get started
   → Sign-in method → Google → Enable → Save
5. Project Settings (gerigi) → Your apps → Web </>
   → Register app → copy firebaseConfig
6. Buka global-orders.js → tempel ke FIREBASE_CONFIG
7. Authentication → Settings → Authorized domains
   → Add domain Vercel kamu (contoh: xxx.vercel.app)
8. Hard refresh di HP

GANTI LAGU:
Ganti file music.m4a dengan lagu favorit (format m4a/mp3/ogg).
Pastikan file tidak terlalu besar (< 3MB biar loading cepat).

SELESAI.
========================================
