# VORTEX HUB — All-in-One Digital Platform

Website all-in-one dengan puluhan tools praktis.

## Cara Menjalankan

Cukup buka file `index.html` di browser (double-click atau drag ke browser).

Tidak perlu server / install apapun. Semua berjalan sepenuhnya di browser.

## Fitur Utama

- **Kalkulator**: Biasa, Persentase, Diskon, Pajak, BMI, Umur, Scientific
- **Converter**: Panjang, Berat, Suhu, Kecepatan, Data, Mata Uang, Waktu
- **Text Tools**: Counter, Case Converter, Slug, Lorem, Password, Reverse, Sort, Remove Duplicate
- **Image Tools**: Resize, Rotate, Compress, Download (client-side)
- **AI Tools**: Chat, Writer, Summarizer, Translator, Idea Generator, Code Assistant, Prompt Generator (mode demo)
- **Developer Tools**: JSON Formatter, Base64, URL Encode, UUID, Timestamp, Hash, Regex, Color
- **Finance**: Currency, Discount, Profit, Loan, Saving, Investment
- **Education**: Quiz, Flashcard, Study Timer, Notes
- **Mini Games**: Tic Tac Toe, Rock Paper Scissors, Number Guessing, Reaction Test, Memory, Snake
- **User System**: Register, Login, Profile, Dashboard, Favorites, Recent (LocalStorage)
- **Admin Panel**: Stats, User list, Activity log (login sebagai admin@vortexhub.com / admin123)
- **Dark / Light Mode**, Responsive, Search realtime, Toast notification

## Struktur

```
vortex-hub/
├── index.html
├── tools.html, calculator.html, converter.html, ...
├── style.css          (satu file CSS utama)
├── js/
│   ├── app.js, storage.js, theme.js, auth.js, ...
│   └── ... (modular per fitur)
└── README.md
```

## Akun Demo Admin

- Email: `admin@vortexhub.com`
- Password: `admin123`

## Catatan

- AI Tools berjalan dalam mode demo lokal. Untuk hasil lebih baik, bisa menambahkan API key di halaman Pengaturan.
- Image processing sepenuhnya client-side (tidak ada upload ke server).
- Data user disimpan di LocalStorage browser.
