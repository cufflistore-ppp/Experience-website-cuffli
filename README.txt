========================================
   VOXYY JOKI - Website Package
   + QRIS + Biaya Admin + Expired
   + ANTRIAN GLOBAL OTOMATIS
========================================

Cara pakai:
1. Extract semua file ke folder hosting / localhost
2. Logo: logo.png
3. Banner: banner.jpg
4. QRIS: qris.png
5. Buka index.html

----------------------------------------
ANTRIAN GLOBAL (sudah aktif, tanpa setup)
----------------------------------------
Setiap ada yang order (dari HP / browser manapun),
pesanan langsung muncul di halaman Antrian untuk SEMUA orang.

- Nama di antrian disamarkan (privacy)
- Auto-refresh tiap ~20 detik
- Admin panel juga sinkron global
- Cek status by kode antrian tetap bisa

Tidak perlu daftar akun / API key apapun.

----------------------------------------
Halaman:
- index.html       → Beranda
- joki.html        → Daftar paket joki
- detail.html      → Detail paket
- pesan.html       → Form pemesanan
- pembayaran.html  → QRIS + konfirmasi bayar
- antrian.html     → Pantau antrian (GLOBAL)
- tentang.html     → Tentang
- laporan.html     → Kirim laporan
- admin.html       → Panel Admin

Alur order:
joki.html → detail.html → pesan.html → pembayaran.html

Bottom navigation:
Joki | Video FS | Home | Antrian | Tentang

Warna tema: dark blue + neon green

Ganti nomor WA di tentang.html jika perlu.
Telegram sudah terkonfigurasi (token + chat id).

Tambah paket baru:
Edit file joki-produk.js (array paketJoki)

File penting:
- global-orders.js  → penyimpanan antrian global (otomatis)

========================================
