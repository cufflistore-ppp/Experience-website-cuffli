========================================
   VOXYY MARKET
   Firebase Global + Login Google + Admin Panel
   Deploy khusus: VERCEL
========================================

DEPLOY VERCEL (disarankan)
---------------------------------
1. Install Vercel CLI (opsional):
   npm i -g vercel

2. Di folder project:
   vercel
   atau drag-drop folder ke https://vercel.com/new

3. Setelah deploy, catat domain kamu:
   contoh: https://voxyy-market.vercel.app
   atau custom domain: https://domainkamu.com

4. Firebase Console → Authentication → Settings → Authorized domains
   → Add domain Vercel:
     - voxyy-market.vercel.app
     - (dan custom domain jika ada)

5. Google Cloud Console → APIs & Credentials → OAuth 2.0 Client
   Authorized JavaScript origins:
     https://voxyy-market.vercel.app
   Authorized redirect URIs:
     https://voxyyjoki.firebaseapp.com/__/auth/handler
     https://voxyy-market.vercel.app

6. Hard refresh di HP / browser

SELESAI.

SETUP FIREBASE (jika belum)
---------------------------------
1. https://console.firebase.google.com → project voxyyjoki
2. Realtime Database → test mode
3. Authentication → Google enable
4. Config ada di global-orders.js (sudah terisi)

MENU BAWAH:
Produk | Kategori | Home | Pesanan | Akun

ADMIN: /admin.html
(Opsional set password di Pengaturan)

File penting:
- vercel.json           → config deploy Vercel + proxy Firebase Auth
- admin.html + admin.js → panel admin
- joki.html             → Jelajahi Produk (VOXY MARKET UI)
- digital.html          → Produk Digital
- antrian.html          → Riwayat Pesanan
- global-orders.js      → Firebase
========================================
