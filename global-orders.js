/* ============================================
   VOXY MARKET - Firebase + Chat (flat, no folders)
   ============================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAx2I5hmnMBkS04tOr21B9KG4SVaVCqyQg",
  authDomain: "voxyyjoki.firebaseapp.com",
  databaseURL: "https://voxyyjoki-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "voxyyjoki",
  storageBucket: "voxyyjoki.firebasestorage.app",
  messagingSenderId: "442340334430",
  appId: "1:442340334430:web:785c5a5f69aaf8fe8fcdcf"
};

const GOOGLE_WEB_CLIENT_ID = "442340334430-eomut78090vr388t13r4au4hkugknshj.apps.googleusercontent.com";

const ADMIN_EMAILS = [
  "emailwebvixy@gmail.com",
  "voxymarket98@gmail.com"
];

if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

const auth = typeof firebase !== "undefined" ? firebase.auth() : null;
const db = typeof firebase !== "undefined" ? firebase.database() : null;

function isAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.map(function (e) { return e.toLowerCase(); }).indexOf(email.toLowerCase()) !== -1;
}

function generateKode() {
  return "VM-" + Math.floor(100000 + Math.random() * 900000);
}

function formatRp(n) {
  return "Rp" + Number(n || 0).toLocaleString("id-ID");
}

function formatTanggal(ts) {
  if (!ts) return "-";
  var d = new Date(ts);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function get30DayStart() {
  return Date.now() - 30 * 24 * 60 * 60 * 1000;
}

function daftarUser(email, password) {
  if (!auth) return Promise.reject(new Error("Firebase belum siap"));
  return auth.createUserWithEmailAndPassword(email, password);
}

function loginUser(email, password) {
  if (!auth) return Promise.reject(new Error("Firebase belum siap"));
  return auth.signInWithEmailAndPassword(email, password);
}

function logoutUser() {
  if (!auth) return Promise.resolve();
  return auth.signOut();
}

function getCurrentUser() {
  return auth ? auth.currentUser : null;
}

function requireAuth(redirect) {
  redirect = redirect || "login.html";
  return new Promise(function (resolve, reject) {
    if (!auth) {
      window.location.href = redirect;
      reject();
      return;
    }
    auth.onAuthStateChanged(function (user) {
      if (user) resolve(user);
      else {
        window.location.href = redirect;
        reject();
      }
    });
  });
}

function requireAdmin(redirect) {
  redirect = redirect || "home.html";
  return requireAuth("login.html").then(function (user) {
    if (!isAdmin(user.email)) {
      alert("Akses ditolak. Hanya admin.");
      window.location.href = redirect;
      return Promise.reject();
    }
    return user;
  });
}

/* ---------- Orders ---------- */
function simpanOrder(orderData) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  var kode = orderData.kode || generateKode();
  return db.ref("orders/" + kode).set(Object.assign({}, orderData, {
    kode: kode,
    createdAt: Date.now(),
    updatedAt: Date.now()
  })).then(function () { return kode; });
}

function updateOrder(kode, data) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  return db.ref("orders/" + kode).update(Object.assign({}, data, { updatedAt: Date.now() }));
}

function getOrder(kode) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  return db.ref("orders/" + kode).once("value").then(function (s) { return s.val(); });
}

function getAllOrders() {
  if (!db) return Promise.resolve([]);
  return db.ref("orders").once("value").then(function (snap) {
    var val = snap.val() || {};
    return Object.keys(val).map(function (k) {
      return Object.assign({}, val[k], { kode: k });
    });
  });
}

function listenOrders(callback) {
  if (!db) return function () {};
  var ref = db.ref("orders");
  var handler = function (snap) {
    var val = snap.val() || {};
    callback(Object.keys(val).map(function (k) {
      return Object.assign({}, val[k], { kode: k });
    }));
  };
  ref.on("value", handler);
  return function () { ref.off("value", handler); };
}

function simpanBukti(kode, dataUrl) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  return db.ref("order_bukti/" + kode).set({ data: dataUrl, at: Date.now() });
}

function getBukti(kode) {
  if (!db) return Promise.resolve(null);
  return db.ref("order_bukti/" + kode).once("value").then(function (s) {
    return (s.val() || {}).data || null;
  });
}

function simpanOrderFile(kode, dataUrl, nama) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  return db.ref("order_files/" + kode).set({ data: dataUrl, nama: nama || "file", at: Date.now() });
}

function getOrderFile(kode) {
  if (!db) return Promise.resolve(null);
  return db.ref("order_files/" + kode).once("value").then(function (s) { return s.val(); });
}

/* Hasil pesanan: link URL + file + catatan untuk user */
function simpanHasilPesanan(kode, opts) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  opts = opts || {};
  var updates = {
    updatedAt: Date.now()
  };
  if (opts.url !== undefined) updates.hasilUrl = opts.url || "";
  if (opts.teks !== undefined) updates.hasilTeks = opts.teks || "";
  if (opts.catatan !== undefined) updates.hasilCatatan = opts.catatan || "";
  if (opts.status) updates.status = opts.status;
  var p = db.ref("orders/" + kode).update(updates);
  if (opts.fileData) {
    p = p.then(function () {
      return db.ref("order_files/" + kode).set({
        data: opts.fileData,
        nama: opts.fileNama || "file",
        at: Date.now()
      });
    });
  }
  return p;
}

function getHasilPesanan(kode) {
  if (!db) return Promise.resolve({});
  return Promise.all([
    db.ref("orders/" + kode).once("value"),
    db.ref("order_files/" + kode).once("value")
  ]).then(function (arr) {
    var o = arr[0].val() || {};
    var f = arr[1].val() || null;
    return {
      url: o.hasilUrl || "",
      teks: o.hasilTeks || "",
      catatan: o.hasilCatatan || "",
      file: f,
      status: o.status || ""
    };
  });
}

/* ---------- Produk ---------- */
function getProdukList() {
  if (!db) return Promise.resolve([]);
  return db.ref("produk").once("value").then(function (snap) {
    var val = snap.val() || {};
    return Object.keys(val).map(function (id) {
      return Object.assign({ id: id }, val[id]);
    });
  });
}

function listenProduk(callback) {
  if (!db) return function () {};
  var ref = db.ref("produk");
  var handler = function (snap) {
    var val = snap.val() || {};
    callback(Object.keys(val).map(function (id) {
      return Object.assign({ id: id }, val[id]);
    }));
  };
  ref.on("value", handler);
  return function () { ref.off("value", handler); };
}

function simpanProduk(id, data) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  var key = id || db.ref("produk").push().key;
  return db.ref("produk/" + key).set(Object.assign({}, data, { updatedAt: Date.now() })).then(function () { return key; });
}

function hapusProduk(id) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  return db.ref("produk/" + id).remove();
}

/* ---------- Settings ---------- */
function getSettings() {
  if (!db) return Promise.resolve({});
  return db.ref("settings").once("value").then(function (s) { return s.val() || {}; });
}

function simpanSettings(data) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  return db.ref("settings").update(Object.assign({}, data, { updatedAt: Date.now() }));
}

/* ---------- Chat / Laporan ---------- */
/* Path: chat/{uid}/messages/{msgId}, chat/{uid}/meta */
function chatPath(uid) {
  return "chat/" + uid;
}

function kirimPesanUser(uid, email, text) {
  if (!db || !uid) return Promise.reject(new Error("Database belum siap"));
  var msgRef = db.ref(chatPath(uid) + "/messages").push();
  var msg = {
    from: "user",
    email: email || "",
    text: text,
    at: Date.now(),
    readByAdmin: false
  };
  return msgRef.set(msg).then(function () {
    return db.ref(chatPath(uid) + "/meta").update({
      email: email || "",
      lastMessage: text,
      lastAt: Date.now(),
      lastFrom: "user",
      unreadAdmin: true,
      unreadUser: false
    });
  });
}

function kirimPesanAdmin(uid, text) {
  if (!db || !uid) return Promise.reject(new Error("Database belum siap"));
  var msgRef = db.ref(chatPath(uid) + "/messages").push();
  var msg = {
    from: "admin",
    text: text,
    at: Date.now(),
    readByUser: false
  };
  return msgRef.set(msg).then(function () {
    return db.ref(chatPath(uid) + "/meta").update({
      lastMessage: text,
      lastAt: Date.now(),
      lastFrom: "admin",
      unreadAdmin: false,
      unreadUser: true
    });
  });
}

function listenChatMessages(uid, callback) {
  if (!db || !uid) return function () {};
  var ref = db.ref(chatPath(uid) + "/messages");
  var handler = function (snap) {
    var val = snap.val() || {};
    var list = Object.keys(val).map(function (id) {
      return Object.assign({ id: id }, val[id]);
    });
    list.sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
    callback(list);
  };
  ref.on("value", handler);
  return function () { ref.off("value", handler); };
}

function listenAllChats(callback) {
  if (!db) return function () {};
  var ref = db.ref("chat");
  var handler = function (snap) {
    var val = snap.val() || {};
    var list = Object.keys(val).map(function (uid) {
      var meta = val[uid].meta || {};
      return {
        uid: uid,
        email: meta.email || uid,
        lastMessage: meta.lastMessage || "",
        lastAt: meta.lastAt || 0,
        lastFrom: meta.lastFrom || "",
        unreadAdmin: !!meta.unreadAdmin
      };
    });
    list.sort(function (a, b) { return (b.lastAt || 0) - (a.lastAt || 0); });
    callback(list);
  };
  ref.on("value", handler);
  return function () { ref.off("value", handler); };
}

function markChatReadByAdmin(uid) {
  if (!db || !uid) return Promise.resolve();
  return db.ref(chatPath(uid) + "/meta").update({ unreadAdmin: false });
}

function markChatReadByUser(uid) {
  if (!db || !uid) return Promise.resolve();
  return db.ref(chatPath(uid) + "/meta").update({ unreadUser: false });
}

function listenUserUnread(uid, callback) {
  if (!db || !uid) return function () {};
  var ref = db.ref(chatPath(uid) + "/meta/unreadUser");
  var handler = function (snap) {
    callback(!!snap.val());
  };
  ref.on("value", handler);
  return function () { ref.off("value", handler); };
}

function hitungPendapatan30Hari(orders) {
  var start = get30DayStart();
  var total = 0;
  var count = 0;
  (orders || []).forEach(function (o) {
    var t = o.createdAt || o.updatedAt || 0;
    var status = (o.status || "").toLowerCase();
    if (t >= start && (status === "selesai" || status === "completed" || status === "done")) {
      total += Number(o.harga || 0);
      count++;
    }
  });
  return { total: total, count: count, mulai: start, sampai: Date.now() };
}

function fileToDataURL(file) {
  return new Promise(function (resolve, reject) {
    if (!file) return reject(new Error("File kosong"));
    var reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error("Gagal baca file")); };
    reader.readAsDataURL(file);
  });
}

/* WhatsApp helper */
function bukaWhatsApp(nomor, pesan) {
  var n = (nomor || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (!n) n = "6281234567890";
  var url = "https://wa.me/" + n + "?text=" + encodeURIComponent(pesan || "Halo admin VOXY MARKET");
  window.open(url, "_blank");
}


/* ---------- Branding (logo, banner x3, qris) ---------- */
function getBranding() {
  if (!db) return Promise.resolve({});
  return db.ref("branding_assets").once("value").then(function (s) { return s.val() || {}; });
}

function simpanBranding(data) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  return db.ref("branding_assets").update(Object.assign({}, data, { updatedAt: Date.now() }));
}

function applyBrandingToPage() {
  return getBranding().then(function (b) {
    if (!b) return b;
    document.querySelectorAll("img[data-brand=logo], .logo-area img, .auth-card img, .admin-sidebar .profile img").forEach(function (img) {
      if (b.logo) img.src = b.logo;
    });
    var track = document.getElementById("bannerTrack");
    if (track) {
      var imgs = track.querySelectorAll("img");
      if (imgs[0] && b.banner1) imgs[0].src = b.banner1;
      if (imgs[1] && b.banner2) imgs[1].src = b.banner2;
      if (imgs[2] && b.banner3) imgs[2].src = b.banner3;
    }
    var q = document.getElementById("qrisImg");
    if (q && b.qris) q.src = b.qris;
    return b;
  }).catch(function () { return {}; });
}

function showToast(msg, ms) {
  ms = ms || 2500;
  var el = document.getElementById("voxyToast");
  if (!el) {
    el = document.createElement("div");
    el.id = "voxyToast";
    el.className = "toast-ok";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(function () { el.classList.remove("show"); }, ms);
}

window.VOXY = {
  FIREBASE_CONFIG: FIREBASE_CONFIG,
  GOOGLE_WEB_CLIENT_ID: GOOGLE_WEB_CLIENT_ID,
  ADMIN_EMAILS: ADMIN_EMAILS,
  auth: auth,
  db: db,
  isAdmin: isAdmin,
  generateKode: generateKode,
  formatRp: formatRp,
  formatTanggal: formatTanggal,
  get30DayStart: get30DayStart,
  daftarUser: daftarUser,
  loginUser: loginUser,
  logoutUser: logoutUser,
  getCurrentUser: getCurrentUser,
  requireAuth: requireAuth,
  requireAdmin: requireAdmin,
  simpanOrder: simpanOrder,
  updateOrder: updateOrder,
  getOrder: getOrder,
  getAllOrders: getAllOrders,
  listenOrders: listenOrders,
  simpanBukti: simpanBukti,
  getBukti: getBukti,
  simpanOrderFile: simpanOrderFile,
  getOrderFile: getOrderFile,
  simpanHasilPesanan: simpanHasilPesanan,
  getHasilPesanan: getHasilPesanan,
  getBranding: getBranding,
  simpanBranding: simpanBranding,
  applyBrandingToPage: applyBrandingToPage,
  showToast: showToast,
  getProdukList: getProdukList,
  listenProduk: listenProduk,
  simpanProduk: simpanProduk,
  hapusProduk: hapusProduk,
  getSettings: getSettings,
  simpanSettings: simpanSettings,
  kirimPesanUser: kirimPesanUser,
  kirimPesanAdmin: kirimPesanAdmin,
  listenChatMessages: listenChatMessages,
  listenAllChats: listenAllChats,
  markChatReadByAdmin: markChatReadByAdmin,
  markChatReadByUser: markChatReadByUser,
  listenUserUnread: listenUserUnread,
  hitungPendapatan30Hari: hitungPendapatan30Hari,
  fileToDataURL: fileToDataURL,
  bukaWhatsApp: bukaWhatsApp
};
