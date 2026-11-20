# VOXY MARKET (Flat Structure)

Semua file di root — **tanpa** folder `js/`, `css/`, `assets/`.

## Path di kode
- CSS: `style.css`
- JS: `global-orders.js`
- Gambar: `logo.png`, `banner.png`, `qris.jpg`, dll.

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


## Maintenance Mode (OFF / ON)
- Kontrol ON/OFF tersedia di Dashboard `admin.html`.
- Status global tersimpan di Realtime Database: `settings/maintenance`.
- `online: false` menampilkan halaman offline VOXY MARKET17 untuk seluruh halaman publik.
- `online: true` mengembalikan tampilan website setelah hitung mundur 3 detik.
- Halaman `admin.html`, `admin-joki-harga.html`, dan `admin-kelola.html` dikecualikan agar admin tetap dapat mengelola website.
- File `maintenance-gate.js` dipasang pada semua halaman publik.
