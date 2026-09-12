========================================
   VOXYY JOKI
   Intro + App Shell (lagu TIDAK putus antar halaman)
========================================

ALUR:
1. index.html  → animasi loading → tombol MASUK (1x klik)
2. app.html    → shell: audio tetap hidup + iframe konten
3. Pindah menu (Joki/Digital/Home/...) hanya ganti iframe
   → lagu terus nyala, tidak restart

FILE PENTING:
- index.html     intro
- app.html       shell + audio permanen
- home.html      konten home (di dalam iframe)
- music.m4a      file lagu
- iframe-nav.js  link internal tetap di dalam shell

DEPLOY: upload folder ke Vercel.
