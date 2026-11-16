# ELZKII JOKI Website

Website multi-halaman untuk jasa joki & penjualan produk APK/tools.

## Struktur File

```
/
├── index.html          → Beranda
├── joki.html           → List harga joki + order WA (copy format)
├── produk.html         → List semua produk + order WA
├── antrian.html        → Lihat status antrian (public)
├── tentang.html        → Info admin, nomor WA, channel
├── css/style.css       → Theme pink + putih
├── js/app.js           → Utility (menu mobile dll)
├── assets/
│   ├── 1000332841.jpg  → Logo
│   └── 1000332754.jpg  → Banner
└── admin/
    ├── login.html      → Login (hanya cufflistore@gmail.com)
    ├── dashboard.html  → Panel admin (antrian, kirim produk, ubah TRX)
    └── download.html   → Halaman download produk (demo)
```

## Fitur yang sudah ada

- Theme pink & putih sesuai request
- Logo + banner dipakai
- Multi halaman (bukan single page)
- List joki sesuai harga yang dikasih
- Format order joki otomatis disalin + buka WA
- List produk lengkap
- Halaman tentang + nomor admin + channel
- Antrian (localStorage demo)
- Panel admin:
  - Login restricted ke `cufflistore@gmail.com`
  - Kelola antrian (tambah, ubah status, hapus)
  - Kirim produk (upload file → generate download demo)
  - Ubah status TRX

## Firebase (nanti)

Saat ini semua data pakai **localStorage** (demo di browser).

Nanti ganti dengan Firebase:

1. **Firebase Authentication** → login admin dengan email `cufflistore@gmail.com`
2. **Firestore / Realtime Database** → antrian & status TRX
3. **Firebase Storage** → file produk yang dikirim ke buyer

### Setup Firebase Web (referensi)

Ikuti: https://firebase.google.com/docs/web/setup#available-libraries

Contoh rules yang bisa dipakai nanti (Firestore):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /queue/{docId} {
      allow read: if true;  // public bisa lihat antrian
      allow write: if request.auth != null && request.auth.token.email == 'cufflistore@gmail.com';
    }
    match /products/{docId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'cufflistore@gmail.com';
    }
  }
}
```

Storage rules mirip (hanya admin yang boleh upload).

## Cara pakai sekarang

1. Buka `index.html` di browser (atau host ke hosting static).
2. Admin: buka `/admin/login.html` → login dengan email `cufflistore@gmail.com` (password bebas untuk demo).
3. Di dashboard bisa tambah antrian, upload produk, dll.

## Catatan

- Order joki & produk mengarah ke `wa.me/6282364307699`
- Channel resmi sudah dipasang di footer & halaman tentang
- Semua halaman beda file HTML (bukan SPA)