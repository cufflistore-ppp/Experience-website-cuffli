# CUFFLI STORE

Top up game multi-halaman + **Firebase Auth (Google)** + **Realtime Database**.

## Setup Firebase (wajib)

1. **Authentication**
   - Firebase Console → Authentication → Sign-in method
   - Aktifkan **Google**
   - Authorized domains: tambahkan domain hosting / `localhost`

2. **Realtime Database Rules** (sementara untuk development):

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "orders": {
      ".read": true,
      ".write": true
    }
  }
}
```

> Untuk produksi, kunci rules agar user hanya baca order miliknya, dan admin pakai custom claims / backend.

3. Config sudah ada di `common.js` (apiKey, projectId, databaseURL, dll).

## Halaman
- index, produk, order, pembayaran, riwayat, login, tentang, kontak, admin

## Alur
Login Google → pilih game/nominal → isi data → bayar → **Konfirmasi**  
→ order masuk **Firebase** + **Telegram** → muncul di **riwayat** (per UID)  
→ **admin.html** ubah status (Menunggu/Diproses/Selesai/Gagal)

## Warna & ukuran
Semua di `style.css` (`:root` variables). Ubah di sana saja.

## Tambah produk
Edit `common.js` — lihat komentar di bagian product data.
