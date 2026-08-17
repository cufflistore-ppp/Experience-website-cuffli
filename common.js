/* ===== CUFFLI STORE — shared + Firebase ===== */

const firebaseConfig = {
  apiKey: "AIzaSyAuyTsK1jECXksJPjOZuTdKwB3_Y4_tkXI",
  authDomain: "cufflistore-adf41.firebaseapp.com",
  databaseURL: "https://cufflistore-adf41-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cufflistore-adf41",
  storageBucket: "cufflistore-adf41.firebasestorage.app",
  messagingSenderId: "136744932448",
  appId: "1:136744932448:web:4f8a53171bfa726c061f05",
  measurementId: "G-QZ3QRK3MV7"
};

// Telegram
const TELEGRAM_TOKEN = "8957651122:AAEMVVIzLNj7pvlIeNVxTuDk0AsBwaFgTks";
const TELEGRAM_CHAT_ID = "7701533150";

// Admin password (halaman admin.html)
const ADMIN_PASSWORD = "cuffliadmin";

const adminAccounts = {
  DANA:  { number: "087722626689", name: "a.n MIMI" },
  GOPAY: { number: "085771305771", name: "a.n CUFFLI ALL GEME" },
  QRIS:  { number: "Scan QRIS Utama", name: "a.n TOKO CUFFLI" }
};

/* ---------- Firebase init ---------- */
let fbApp = null;
let fbAuth = null;
let fbDb = null;
let currentUser = null;
let authReadyResolve;
const authReady = new Promise((r) => { authReadyResolve = r; });

function initFirebase() {
  if (typeof firebase === "undefined") {
    console.warn("Firebase SDK belum dimuat");
    authReadyResolve(null);
    return;
  }
  if (!firebase.apps.length) {
    fbApp = firebase.initializeApp(firebaseConfig);
  } else {
    fbApp = firebase.app();
  }
  fbAuth = firebase.auth();
  fbDb = firebase.database();

  fbAuth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        username: (user.email || user.uid).split("@")[0],
        picture: user.photoURL || "",
        provider: "google"
      };
      // simpan profil ringan ke DB
      try {
        await fbDb.ref("users/" + user.uid).update({
          email: currentUser.email,
          name: currentUser.name,
          username: currentUser.username,
          picture: currentUser.picture,
          lastLogin: Date.now()
        });
      } catch (e) { console.warn("user profile sync", e); }
    } else {
      currentUser = null;
    }
    authReadyResolve(currentUser);
    // update nav jika sudah ada
    if (document.getElementById("side-drawer")) {
      // re-inject sederhana: refresh label
      const sub = document.querySelector(".drawer-user-label");
      if (sub) sub.textContent = currentUser ? (currentUser.username || currentUser.email) : "Belum login";
    }
  });
}

function getUser() {
  return currentUser;
}

function requireLogin(next) {
  // dipanggil setelah authReady
  if (!currentUser) {
    location.href = "login.html?next=" + encodeURIComponent(next || "index.html");
    return false;
  }
  return true;
}

async function logoutUser() {
  try {
    if (fbAuth) await fbAuth.signOut();
  } catch (e) {}
  currentUser = null;
  location.href = "index.html";
}

async function loginWithGoogle() {
  if (!fbAuth) throw new Error("Firebase belum siap");
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await fbAuth.signInWithPopup(provider);
  return result.user;
}

/* ---------- Orders (Realtime Database) ---------- */
function genOrderId() {
  return "CS" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function addOrder(order) {
  if (!fbDb) throw new Error("Database belum siap");
  await fbDb.ref("orders/" + order.orderId).set(order);
  return order;
}

async function getUserOrders(uid) {
  if (!fbDb) return [];
  const snap = await fbDb.ref("orders").orderByChild("userId").equalTo(uid).once("value");
  const val = snap.val() || {};
  return Object.values(val).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function getAllOrders() {
  if (!fbDb) return [];
  const snap = await fbDb.ref("orders").once("value");
  const val = snap.val() || {};
  return Object.values(val).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function updateOrderStatus(orderId, status) {
  if (!fbDb) return null;
  await fbDb.ref("orders/" + orderId).update({
    status,
    updatedAt: Date.now()
  });
  return true;
}

/* ---------- Pending order (session) ---------- */
function setPendingOrder(data) {
  sessionStorage.setItem("cuffli_pending", JSON.stringify(data));
}
function getPendingOrder() {
  try { return JSON.parse(sessionStorage.getItem("cuffli_pending") || "null"); } catch { return null; }
}
function clearPendingOrder() {
  sessionStorage.removeItem("cuffli_pending");
}

/* ---------- Telegram ---------- */
async function sendToTelegram(pesan) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: pesan, parse_mode: "Markdown" })
  });
  return res.ok;
}

/* ---------- Product data ---------- */
/*
  CARA MENAMBAH PRODUK:
  1) Nominal lama: tambah {d:"...", p:"..."} di array game (ffData, mlData, ...)
  2) Game baru:
     - taruh gambar .jpg
     - tambah di gamesMeta
     - buat array data
     - masukkan ke dataMap
*/

const gamesMeta = [
  { key: "ff",   name: "Free Fire",         img: "ff.jpg",   icon: "fa-solid fa-gem" },
  { key: "ml",   name: "Mobile Legends",    img: "ml.jpg",   icon: "fa-solid fa-gem" },
  { key: "bs",   name: "Blood Strike",      img: "bs.jpg",   icon: "fa-solid fa-coins" },
  { key: "pubg", name: "PUBG Mobile",       img: "pubg.jpg", icon: "fa-solid fa-gun" },
  { key: "vlo",  name: "Valorant",          img: "vlo.jpg",  icon: "fa-solid fa-crosshairs" },
  { key: "cod",  name: "Call Of Duty",      img: "cod.jpg",  icon: "fa-solid fa-skull" },
  { key: "kc",   name: "King's Chalce",     img: "kc.jpg",   icon: "fa-solid fa-gem" },
  { key: "hok",  name: "Honor Of Kings",    img: "hok.jpg",  icon: "fa-solid fa-shield-halved" },
  { key: "fc",   name: "FC Mobile",         img: "fc.jpg",   icon: "fa-solid fa-futbol" },
  { key: "gi",   name: "Genshin Impact",    img: "gi.jpg",   icon: "fa-solid fa-dragon" },
  { key: "mc",   name: "Minecraft",         img: "mc.jpg",   icon: "fa-solid fa-cube" },
  { key: "rb",   name: "Roblox",            img: "rb.jpg",   icon: "fa-solid fa-cubes" },
  { key: "sps",  name: "Super Sus",         img: "sps.jpg",  icon: "fa-solid fa-ghost" },
  { key: "mcg",  name: "Magic Chess Go Go", img: "mcg.jpg",  icon: "fa-solid fa-chess" },
  { key: "zp",   name: "Zepeto Zems",       img: "zp.jpg",   icon: "fa-solid fa-user" },
];

const ffData = [
  {d:"5 Diamonds", p:"Rp1.500"}, {d:"10 Diamonds", p:"Rp2.000"}, {d:"12 Diamonds", p:"Rp2.200"},
  {d:"15 Diamonds", p:"Rp3.000"}, {d:"20 Diamonds", p:"Rp4.000"}, {d:"25 Diamonds", p:"Rp5.000"},
  {d:"50 Diamonds", p:"Rp8.000"}, {d:"70 Diamonds", p:"Rp10.000"}, {d:"140 Diamonds", p:"Rp19.000"},
  {d:"355 Diamonds", p:"Rp49.000"}, {d:"720 Diamonds", p:"Rp99.000"}, {d:"1450 Diamonds", p:"Rp197.000"},
  {d:"level up pas -level 6", p:"Rp9.900"}, {d:"level up pas -level 10", p:"Rp13.900"},
  {d:"level up pas -level 15", p:"Rp14.900"}, {d:"level up pas -level 20", p:"Rp16.600"},
  {d:"level up pas -level 25", p:"Rp18.900"}, {d:"levelnup pas -level 30", p:"Rp20.000"},
  {d:"Mingguan Lite", p:"Rp25.000"}, {d:"Membership Mingguan", p:"Rp35.000"},
  {d:"Booyah Pas card", p:"Rp48.900"}, {d:"Membership Bulanan", p:"Rp92.000"}
];
const mlData = [
  {d:"2 Diamonds", p:"Rp2.000"}, {d:"5 Diamonds", p:"Rp3.000"}, {d:"12 Diamonds", p:"Rp4.000"},
  {d:"19 Diamonds", p:"Rp5.500"}, {d:"28 Diamonds", p:"Rp8.000"}, {d:"59 Diamonds", p:"Rp16.000"},
  {d:"112 Diamonds", p:"Rp30.000"}, {d:"172 Diamonds", p:"Rp46.000"}, {d:"381 Diamonds", p:"Rp105.000"},
  {d:"429 Diamonds", p:"Rp115.000"}, {d:"1136 Diamonds", p:"Rp294.000"},
  {d:"wdp", p:"Rp35.000"}, {d:"wdp ×2", p:"Rp70.000"}, {d:"wdp ×3", p:"Rp100.000"},
  {d:"wdp ×4", p:"Rp135.000"}, {d:"wdp ×5", p:"Rp160.000"},
  {d:"stalight membership (300 diamonds)", p:"Rp95.000"},
  {d:"stalight membership plus (750 diamonds)", p:"Rp120.000"}
];
const bsData = [
  {d:"100 + 5 Golds", p:"Rp11.000"}, {d:"300 + 20 Golds", p:"Rp35.000"}, {d:"500 + 40 Golds", p:"Rp58.000"},
  {d:"600 + 45 Golds", p:"Rp70.000"}, {d:"800 + 60 Golds", p:"Rp93.000"}, {d:"1000 + 100 Golds", p:"Rp117.000"},
  {d:"1200 + 110 Golds", p:"Rp140.000"}, {d:"1500 + 140 Golds", p:"Rp175.000"},
  {d:"2000 + 260 Golds", p:"Rp234.000"}, {d:"2500 + 300 Golds", p:"Rp292.000"}
];
const pubgData = [
  {d:"60 UC global", p:"Rp20.000"}, {d:"120 uc global", p:"Rp35.000"}, {d:"300 + 25 uc global", p:"Rp82.000"},
  {d:"325 + UC global", p:"Rp98.000"}, {d:"600 + 60 uc global", p:"Rp160.000"},
  {d:"660 + 120 uc global", p:"Rp190.000"}, {d:"1.500 + 300 uc global", p:"Rp390.000"},
  {d:"2.100 + 360 uc global", p:"Rp557.000"}, {d:"3.000 + 850 uc global", p:"Rp778.000"},
  {d:"6.000 + 2.100 uc global", p:"Rp1.563.000"}
];
const vloData = [
  {d:"472 vp", p:"Rp51.000"}, {d:"1.000 vp", p:"Rp101.000"}, {d:"1.475 vp", p:"Rp150.000"},
  {d:"2.050 vp", p:"Rp200.000"}, {d:"2.525 vp", p:"Rp249.000"}, {d:"3.050 vp", p:"Rp300.000"},
  {d:"3.650 vp", p:"Rp345.000"}, {d:"4.125 vp", p:"Rp395.000"}, {d:"4.650 vp", p:"Rp445.000"},
  {d:"5.350 vp", p:"Rp496.000"}, {d:"5.700 vp", p:"Rp544.000"}, {d:"5.825 vp", p:"Rp550.000"},
  {d:"6.350 vp", p:"Rp599.000"}, {d:"7.400 vp", p:"Rp694.000"}, {d:"9.000 vp", p:"Rp840.000"},
  {d:"11.000 vp", p:"Rp974.000"}, {d:"11.475 vp", p:"Rp1.023.000"}
];
const codData = [
  {d:"31 cp", p:"Rp10.000"}, {d:"63 cp", p:"Rp13.000"}, {d:"128 cp", p:"Rp25.000"},
  {d:"321 cp", p:"Rp60.000"}, {d:"645 cp", p:"Rp105.000"}, {d:"800 cp", p:"Rp125.000"},
  {d:"1.373 cp", p:"Rp220.000"}, {d:"2.060 cp", p:"Rp320.000"}, {d:"2.750 cp", p:"Rp370.000"},
  {d:"3.564 cp", p:"Rp520.000"}, {d:"5.618 cp", p:"Rp720.000"}, {d:"7.656 cp", p:"Rp1.000.000"}
];
const kcData = [
  {d:"4 + 6 Diamonds", p:"Rp 9.000"}, {d:"10 + 16 Diamonds", p:"Rp 19.000"}, {d:"10 + 16 Diamonds x3", p:"Rp 56.000"},
  {d:"50 + 82 Diamonds", p:"Rp 85.000"}, {d:"100 + 168 Diamonds", p:"Rp 166.000"}, {d:"50 + 82 Diamonds x3", p:"Rp 249.000"},
  {d:"300 + 510 Diamonds", p:"Rp 486.000"}, {d:"100 + 168 Diamonds x3", p:"Rp 492.000"}, {d:"500 + 860 Diamonds", p:"Rp 804.000"},
  {d:"300 + 510 Diamonds x3", p:"Rp 1.452.000"}, {d:"1000 + 1750 Diamonds", p:"Rp 1.603.000"},
  {d:"500 + 860 Diamonds x3", p:"Rp 2.422.000"}, {d:"1000 + 1750 Diamonds x3", p:"Rp 4.811.000"},
  {d:"Weekly Card", p:"Rp 9.000"}, {d:"Monthly Card", p:"Rp 36.000"}, {d:"Diamonds Weekly Card", p:"Rp 36.000"},
  {d:"Yearly Card", p:"Rp 310.000"}, {d:"Lunar Blessing", p:"Rp 136.000"}
];
const hokData = [
  {d:"16 Tokens", p:"Rp5.000"}, {d:"80 Tokens", p:"Rp18.000"}, {d:"240 Tokens", p:"Rp48.000"},
  {d:"400 Tokens", p:"Rp79.000"}, {d:"560 Tokens", p:"Rp109.000"}, {d:"800 + 30 Tokens", p:"Rp152.000"},
  {d:"1.200 + 45 Tokens", p:"Rp225.000"}, {d:"2.400 + 108 Tokens", p:"Rp448.000"},
  {d:"4000 + 180 Tokens", p:"Rp744.000"}, {d:"8000 + 360 Tokens", p:"Rp1.477.000"},
  {d:"weekly card", p:"Rp19.000"}, {d:"weekly card plus", p:"Rp52.000"}
];
const fcData = [
  {d:"40 FC Points", p:"Rp 8.000"}, {d:"100 FC Points", p:"Rp 18.000"}, {d:"520 FC Points", p:"Rp 77.000"},
  {d:"1070 FC Points", p:"Rp 151.000"}, {d:"2200 FC Points", p:"Rp 308.000"}, {d:"5750 FC Points", p:"Rp 738.000"},
  {d:"12000 FC Points", p:"Rp 1.470.000"}, {d:"39 Silver", p:"Rp 8.000"}, {d:"99 Silver", p:"Rp 18.000"},
  {d:"499 Silver", p:"Rp 77.000"}, {d:"999 Silver", p:"Rp 151.000"}, {d:"1999 Silver", p:"Rp 308.000"},
  {d:"4999 Silver", p:"Rp 738.000"}, {d:"9999 Silver", p:"Rp 1.470.000"}
];
const giData = [
  {d:"60 crystals", p:"Rp20.000"}, {d:"300 +30 crystals", p:"Rp100.000"}, {d:"980 + 110 crystals", p:"Rp280.000"},
  {d:"1.980 + 260 crystals", p:"Rp520.000"}, {d:"3.280 + 600 crystals", p:"Rp850.000"},
  {d:"6.480 + 1.600 crystals", p:"Rp1.700.000"}, {d:"belessing welkin moon", p:"Rp110.000"}
];
const mcData = [
  {d:"Minecraft 1720 Minecoins", p:"Rp170.000"}, {d:"Minecraft 3500 Minecoins", p:"Rp299.000"}
];
const rbData = [
  {d:"1 robux [5 hari]", p:"Rp2.500"}, {d:"5 robux [5 hari]", p:"Rp3.500"}, {d:"10 robux [5 hari]", p:"Rp4.500"},
  {d:"15 [5 hari]", p:"Rp5.000"}, {d:"20 robux [5 hari]", p:"Rp6.000"}, {d:"25 robux [5 hari]", p:"Rp6.500"},
  {d:"50 robux [5 hari]", p:"Rp11.000"}, {d:"100 robux [5 hari]", p:"Rp18.000"}, {d:"200 robux [5 hari]", p:"Rp34.000"},
  {d:"300 robux [5 hari]", p:"Rp49.000"}, {d:"400 robux [5 hari]", p:"Rp60.000"}, {d:"500 robux [5 hari]", p:"Rp79.000"},
  {d:"600 robux [5 hari]", p:"Rp85.000"}, {d:"700 robux [5 hari]", p:"Rp111.000"}, {d:"800 robux [5 hari]", p:"Rp140.000"},
  {d:"900 robux[5 hari]", p:"Rp150.000"}, {d:"1.000 robux [5 hari]", p:"Rp180.000"}
];
const spsData = [
  {d:"100 Golds star", p:"Rp13.000"}, {d:"128 Golds star", p:"Rp25.000"}, {d:"200 Golds star", p:"Rp27.000"},
  {d:"310 Golds star", p:"Rp36.000"}, {d:"395 Golds star", p:"Rp39.000"}, {d:"400 Golds star", p:"Rp48.000"},
  {d:"520 Golds star", p:"Rp55.000"}, {d:"670 Golds star", p:"Rp70.000"}, {d:"810 Golds star", p:"Rp88.000"},
  {d:"900 Golds star", p:"Rp96.000"}, {d:"1060 Golds star", p:"Rp100.000"}, {d:"weekly card", p:"Rp15.000"},
  {d:"super pass", p:"Rp68.000"}, {d:"super pass bundle", p:"Rp135.000"}, {d:"Monthly card", p:"Rp145.000"},
  {d:"super card", p:"Rp162.000"}
];
const mcgData = [
  {d:"5 diamonds", p:"Rp4.000"}, {d:"11 diamond", p:"Rp6.000"}, {d:"12 diamonds", p:"Rp8.000"},
  {d:"17 diamonds", p:"Rp9.500"}, {d:"25 diamonds", p:"Rp11.500"}, {d:"40 diamonds", p:"Rp14.500"},
  {d:"50 diamonds", p:"Rp18.000"}, {d:"53 diamonds", p:"Rp19.187"}, {d:"77 diamonds", p:"Rp25.000"},
  {d:"150 diamonds", p:"Rp45.000"}, {d:"153 diamonds", p:"Rp46.000"}, {d:"217 diamonds", p:"Rp64.000"},
  {d:"250 diamonds", p:"Rp75.000"}, {d:"256 diamonds", p:"Rp77.000"}, {d:"367 diamonds", p:"Rp108.187"},
  {d:"500 diamonds", p:"Rp142.246"}, {d:"503 diamonds", p:"Rp144.000"}, {d:"774 diamonds", p:"Rp217.367"},
  {d:"1.708 diamonds", p:"Rp471.000"}, {d:"4.003 diamonds", p:"Rp1.110.100"},
  {d:"10.000 diamonds", p:"Rp2.200.278"}, {d:"15.000 diamonds", p:"Rp4.120.000"}, {d:"weekly card", p:"Rp35.000"}
];
const zpData = [
  {d:"14 zems", p:"Rp17.000"}, {d:"28 zems", p:"Rp30.000"}, {d:"58 zems", p:"Rp57.000"},
  {d:"128 zems", p:"Rp124.000"}, {d:"323 zems", p:"Rp311.000"}, {d:"1000 zems", p:"Rp910.000"},
  {d:"4680 coins", p:"Rp20.000"}, {d:"9700 coins", p:"Rp35.000"}, {d:"25200 coins", p:"Rp75.000"},
  {d:"40700 coins", p:"Rp120.000"}, {d:"110000 coins", p:"Rp293.000"}, {d:"300000 coins", p:"Rp798.000"}
];

const dataMap = {
  ff: ffData, ml: mlData, bs: bsData, pubg: pubgData, vlo: vloData,
  cod: codData, kc: kcData, hok: hokData, fc: fcData, gi: giData,
  mc: mcData, rb: rbData, sps: spsData, mcg: mcgData, zp: zpData
};

function getGameMeta(key) {
  return gamesMeta.find(g => g.key === key) || null;
}

/* ---------- UI helpers ---------- */
function showAlert(title, message, isSuccess = true) {
  let modal = document.getElementById("custom-alert-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "custom-alert-modal";
    modal.innerHTML = `
      <div class="alert-box">
        <div id="alert-icon" class="alert-icon ok"></div>
        <h4 id="alert-title" style="font-size:var(--text-lg);font-weight:900;margin:0;"></h4>
        <p id="alert-message" class="text-muted" style="font-size:var(--text-base);margin:8px 0 0;line-height:1.5;"></p>
        <button class="btn btn-ghost mt-5" style="height:44px;font-size:var(--text-sm);" onclick="closeAlert()">Mengerti</button>
      </div>`;
    document.body.appendChild(modal);
  }
  document.getElementById("alert-title").textContent = title;
  document.getElementById("alert-message").textContent = message;
  const icon = document.getElementById("alert-icon");
  icon.className = "alert-icon " + (isSuccess ? "ok" : "err");
  icon.innerHTML = isSuccess
    ? '<i class="fa-solid fa-circle-check"></i>'
    : '<i class="fa-solid fa-circle-exclamation"></i>';
  modal.classList.add("show");
}
function closeAlert() {
  document.getElementById("custom-alert-modal")?.classList.remove("show");
}

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "selesai") return "status-selesai";
  if (s === "diproses") return "status-diproses";
  if (s === "gagal") return "status-gagal";
  return "status-menunggu";
}

/* ---------- Nav ---------- */
function injectNav() {
  if (document.getElementById("app-header")) return;
  const user = getUser();

  const header = document.createElement("header");
  header.id = "app-header";
  header.innerHTML = `
    <div class="header-inner">
      <button id="hamburger-btn" class="hamburger-btn" aria-label="Menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      <a href="index.html" class="header-inner" style="flex:1;min-width:0;padding:0;gap:10px;text-decoration:none;color:inherit;">
        <img src="logo.png" alt="Logo" class="header-logo">
        <span class="header-brand">CUFFLI <span>STORE</span></span>
      </a>
      <div class="online-badge">
        <span class="online-dot"></span>
        <span class="online-text">ONLINE</span>
      </div>
    </div>`;
  document.body.prepend(header);

  const overlay = document.createElement("div");
  overlay.id = "drawer-overlay";
  overlay.onclick = closeDrawer;
  document.body.appendChild(overlay);

  const drawer = document.createElement("aside");
  drawer.id = "side-drawer";
  drawer.innerHTML = `
    <div class="drawer-head">
      <div style="display:flex;align-items:center;gap:12px;">
        <img src="logo.png" alt="Logo" class="drawer-logo">
        <div>
          <p style="font-weight:900;font-size:var(--text-base);margin:0;">CUFFLI STORE</p>
          <p class="drawer-user-label text-muted" style="font-size:var(--text-xs);margin:2px 0 0;">${user ? (user.username || user.email) : "Belum login"}</p>
        </div>
      </div>
      <button onclick="closeDrawer()" class="hamburger-btn" style="background:var(--accent-soft);"><i class="fa-solid fa-xmark" style="color:var(--accent);"></i></button>
    </div>
    <nav class="drawer-nav">
      <a href="index.html" class="drawer-link">
        <span class="drawer-icon sky"><i class="fa-solid fa-house"></i></span>
        <div><p class="drawer-link-title">Beranda</p><p class="drawer-link-sub">Pilih game top up</p></div>
      </a>
      <a href="login.html" class="drawer-link">
        <span class="drawer-icon sky"><i class="fa-solid fa-right-to-bracket"></i></span>
        <div><p class="drawer-link-title">${user ? "Akun Saya" : "Login Google"}</p><p class="drawer-link-sub">${user ? "Info akun" : "Masuk dengan Google"}</p></div>
      </a>
      <a href="riwayat.html" class="drawer-link">
        <span class="drawer-icon amber"><i class="fa-solid fa-clock-rotate-left"></i></span>
        <div><p class="drawer-link-title">Riwayat</p><p class="drawer-link-sub">Pesanan akun kamu</p></div>
      </a>
      <a href="tentang.html" class="drawer-link">
        <span class="drawer-icon violet"><i class="fa-solid fa-circle-info"></i></span>
        <div><p class="drawer-link-title">Tentang</p><p class="drawer-link-sub">Info toko</p></div>
      </a>
      <a href="kontak.html" class="drawer-link">
        <span class="drawer-icon emerald"><i class="fa-solid fa-headset"></i></span>
        <div><p class="drawer-link-title">Kontak Admin</p><p class="drawer-link-sub">Hubungi kami</p></div>
      </a>
      ${user ? `<button type="button" onclick="logoutUser()" class="drawer-link">
        <span class="drawer-icon red"><i class="fa-solid fa-right-from-bracket"></i></span>
        <div><p class="drawer-link-title">Logout</p><p class="drawer-link-sub">Keluar akun</p></div>
      </button>` : ""}
    </nav>
    <div class="drawer-foot">&copy; 2026 CUFFLI STORE</div>`;
  document.body.appendChild(drawer);

  document.getElementById("hamburger-btn").addEventListener("click", () => {
    if (document.getElementById("side-drawer").classList.contains("open")) closeDrawer();
    else openDrawer();
  });
}
function openDrawer() {
  document.getElementById("side-drawer")?.classList.add("open");
  document.getElementById("drawer-overlay")?.classList.add("show");
  document.getElementById("hamburger-btn")?.classList.add("active");
}
function closeDrawer() {
  document.getElementById("side-drawer")?.classList.remove("open");
  document.getElementById("drawer-overlay")?.classList.remove("show");
  document.getElementById("hamburger-btn")?.classList.remove("active");
}

/* Load Firebase SDK then init */
(function loadFirebase() {
  function done() {
    initFirebase();
    document.addEventListener("DOMContentLoaded", () => {
      if (document.body.dataset.nav !== "off") {
        // nav setelah auth state pertama (atau timeout singkat)
        authReady.then(() => injectNav()).catch(() => injectNav());
        // fallback jika auth lambat
        setTimeout(() => { if (!document.getElementById("app-header")) injectNav(); }, 800);
      }
    });
  }
  if (typeof firebase !== "undefined") { done(); return; }
  const s1 = document.createElement("script");
  s1.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
  s1.onload = () => {
    const s2 = document.createElement("script");
    s2.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";
    s2.onload = () => {
      const s3 = document.createElement("script");
      s3.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js";
      s3.onload = done;
      document.head.appendChild(s3);
    };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
})();
