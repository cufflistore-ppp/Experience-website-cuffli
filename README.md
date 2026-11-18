# VOXY MARKET (Flat Structure)

Semua file di root — **tanpa** folder `js/`, `css/`, `assets/`.

## Optimasi Performa (update)
- Gambar di-resize & kompres (logo 128px, banner ~800px, produk 400px) → load jauh lebih cepat.
- LocalStorage cache untuk menu, produk, settings, branding, joki config.
  - Data dari cache ditampilkan dulu (hampir instan), lalu sync ke Firebase di background.
  - Hanya fetch ulang jika cache expired atau data diubah admin (invalidate otomatis).
- Cache-Control header di Vercel untuk aset statis (JS/CSS/gambar) = 1 tahun.
- Preconnect ke CDN Firebase & Lucide.

## Path di kode
- CSS: `style.css`
- JS: `global-orders.js`
- Gambar: `logo.png`, `banner.jpg`, `banner2.jpg`, `banner3.jpg`, `produk1.jpg`, dll.

## Fitur Chat / Laporan
1. Tombol bulat kanan bawah (gambar chat) → pilih **Website** atau **WhatsApp**
2. Chat via website → masuk panel admin (tab **Chat User**)
3. Admin balas → di sisi user muncul **badge merah** di logo / ikon chat

## Firebase Rules (tambah path chat)
```json
"chat": {
  "$uid": {
    ".read": "auth != null && (auth.uid == $uid || root.child('admins').child(auth.uid).exists() || auth.token.email == 'emailwebvixy@gmail.com' || auth.token.email == 'voxymarket98@gmail.com')",
    ".write": "auth != null"
  }
}
```
Atau longgarkan sementara untuk testing: `"chat": { ".read": "auth != null", ".write": "auth != null" }`

## Deploy Vercel
Upload folder ini → Static Site → Done.
