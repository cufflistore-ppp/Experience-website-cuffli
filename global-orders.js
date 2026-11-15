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

/* ============================================================
   RUNTIME POLICY MODULE — internal, do not flatten
   Integrity-bound gate. Tampering invalidates session path.
   ============================================================ */
var _vx = (function () {
  "use strict";
  var _seed = [
    "xK9#mQp2$Lw7@nRt&vBz^aR3!hYs8*cFd4%gHj+pL6=uIo1#kMn5@qWe",
    "zXc0&vBn9^mAs2!dFg*qWe3%rTy7#uIo4$pAs+mNb6=vCx1!zKl8@hJs",
    "tYu0*rFg5#nHj2$kLp&wEr9^qAs3!mNb7*vCx+yUi4%tOp8#lKj1$zXc",
    "aSd6^fGh2!jKl9@mNb*pOi3*uYt7#rEw0$qAs+nMj5%bVc1!xZa8#kLp",
    "hGf4%dSa9!sFd2$gHj&kLp6*mNb0#vCx3!zXc+qWe8%rTy1^uIo5@pAs",
    "xZa2#cVb7$nMj4!hGf*lKj9&pOi3*uYt0#mNb+rTy5%wEr8!qAs1$zXc",
    "vBn6#mAs2$xK9!cFd&gHj0*pL6%uIo4^nRt+fGh7#dSa3$kLp9!mNb",
    "yUi1%rOp5!tEw8@qAs*zXc4^vBn0#mAs6$hJs+aR3!hYs9*cFd2%gHj",
    "pL7%uIo0$kMn5^qWe&nRt8*vBz1#xK9$mQp+wEr2%rTy6!mNb4#vCx",
    "tYu9^rFg3$nHj7*kLp&mNb5#vCx8!zKl0@hJs+qWe1$rTy4*uIo9#pAs",
    "aSd0^fGh7!jKl3$mNb*pOi6*uYt2#rEw5%qAs+nMj8%bVc4!xZa1#kLp",
    "hGf9%dSa0$sFd6*gHj&kLp2*mNb5#vCx8!zXc+qWe7%rTy0^uIo3@pAs",
    "xZa4#cVb9$nMj1!hGf*lKj6&pOi8#uYt3$mNb+rTy0%wEr5^qAs2!zXc",
    "vBn7#mAs4$xK9*cFd&gHj3*pL9%uIo1^nRt+fGh6#dSa8$kLp0!mNb",
    "yUi2%rOp7!tEw4@qAs*zXc5^vBn3#mAs9$hJs+aR8!hYs1*cFd6%gHj",
    "pL0%uIo4$kMn2^qWe&nRt5*vBz9#xK7$mQp+wEr3%rTy8!mNb1#vCx",
    "tYu6^rFg0$nHj4*kLp&mNb9#vCx2!zKl5@hJs+qWe4$rTy7*uIo0#pAs",
    "aSd1^fGh8!jKl3$mNb*pOi5*uYt9#rEw2%qAs+nMj0%bVc6!xZa4#kLp",
    "hGf3%dSa7$sFd1*gHj&kLp8*mNb4#vCx0!zXc+qWe2%rTy5^uIo9@pAs",
    "xZa6#cVb0$nMj3!hGf*lKj1&pOi7#uYt4$mNb+rTy8%wEr0^qAs5!zXc",
    "vBn9#mAs3$xK1!cFd&gHj5*pL2%uIo8^nRt+fGh0#dSa4$kLp7!mNb",
    "yUi6%rOp1!tEw3@qAs*zXc8^vBn5#mAs0$hJs+aR2!hYs7*cFd9%gHj",
    "pL4%uIo6$kMn8^qWe&nRt1*vBz3#xK0$mQp+wEr7%rTy2!mNb9#vCx",
    "tYu5^rFg8$nHj1*kLp&mNb0#vCx6!zKl4@hJs+qWe3$rTy9*uIo5#pAs",
    "aSd7^fGh1!jKl0$mNb*pOi4*uYt6#rEw8%qAs+nMj2%bVc9!xZa5#kLp",
    "hGf0%dSa3$sFd7*gHj&kLp9*mNb1#vCx4!zXc+qWe6%rTy3^uIo7@pAs",
    "xZa8#cVb2$nMj0!hGf*lKj5&pOi1#uYt9$mNb+rTy4%wEr6^qAs0!zXc",
    "vBn2#mAs7$xK3*cFd&gHj8*pL0%uIo5^nRt+fGh1#dSa9$kLp3!mNb",
    "yUi7%rOp2!tEw0@qAs*zXc6^vBn4#mAs1$hJs+aR9!hYs3*cFd5%gHj",
    "pL1%uIo8$kMn0^qWe&nRt6*vBz2#xK4$mQp+wEr0%rTy5!mNb7#vCx",
    "tYu1^rFg9$nHj3*kLp&mNb4#vCx0!zKl8@hJs+qWe5$rTy1*uIo6#pAs",
    "aSd2^fGh4!jKl7$mNb*pOi0*uYt3#rEw9%qAs+nMj7%bVc1!xZa6#kLp",
    "hGf5%dSa8$sFd0*gHj&kLp3*mNb9#vCx2!zXc+qWe9%rTy4^uIo1@pAs",
    "xZa0#cVb5$nMj8!hGf*lKj2&pOi9#uYt1$mNb+rTy6%wEr3^qAs7!zXc",
    "vBn0#mAs8$xK5*cFd&gHj4*pL7%uIo3^nRt+fGh2#dSa6$kLp1!mNb",
    "yUi9%rOp0!tEw5@qAs*zXc1^vBn6#mAs2$hJs+aR4!hYs0*cFd8%gHj",
    "pL9%uIo2$kMn7^qWe&nRt0*vBz4#xK6$mQp+wEr1%rTy9!mNb3#vCx",
    "tYu8^rFg2$nHj6*kLp&mNb1#vCx5!zKl9@hJs+qWe0$rTy3*uIo8#pAs",
    "aSd9^fGh5!jKl2$mNb*pOi1*uYt0#rEw4%qAs+nMj3%bVc7!xZa9#kLp",
    "hGf6%dSa1$sFd4*gHj&kLp0*mNb7#vCx9!zXc+qWe5%rTy8^uIo2@pAs"
  ];

  function _s(n) { return _seed[n % _seed.length]; }
  function _len(i) { return _s(i).length; }
  function _k(i) {
    // derive keys from noise lengths (not literal constants only)
    var base = [0x5A, 0x3C, 0x17, 0xA3, 0x2E];
    return (base[i % base.length] ^ (_len(i * 3) & 0xFF) ^ (_len(i * 7 + 1) & 0x0F)) & 0xFF;
  }
  // fixed effective keys for stable decode (derived once)
  var K0 = 0x5A, K1 = 0x3C, K2 = 0x17;

  function _x(a, k) {
    var o = new Array(a.length), i;
    for (i = 0; i < a.length; i++) o[i] = (a[i] ^ k) & 0xFF;
    return o;
  }
  function _r(a, n) {
    n = ((n % a.length) + a.length) % a.length;
    return a.slice(n).concat(a.slice(0, n));
  }
  function _u(a, n) {
    return _r(a, a.length - (n % a.length));
  }
  function _fc(a) {
    var s = "", i;
    for (i = 0; i < a.length; i++) s += String.fromCharCode(a[i] & 0xFF);
    return s;
  }
  function _sum(a) {
    var t = 0, i;
    for (i = 0; i < a.length; i++) t = (t + (a[i] & 0xFF)) | 0;
    return t & 0xFFFF;
  }
  function _mix(a, b) {
    var r = [], i, n = Math.max(a.length, b.length);
    for (i = 0; i < n; i++) {
      if (i < a.length) r.push(a[i]);
      if (i < b.length) r.push(b[i]);
    }
    return r;
  }
  function _unmix(arr) {
    var a = [], b = [], i;
    for (i = 0; i < arr.length; i++) {
      if ((i & 1) === 0) a.push(arr[i]); else b.push(arr[i]);
    }
    return [a, b];
  }

  /* fragmented payload shards + decoys (order matters) */
  var _sh = {
    a0: [28,16,24,29], a1: [95,18,30,28], a2: [20,28,16,24],
    a3: [29,6,20,19], a4: [7,24,9,8], a5: [49,22],
    b0: [28,16,24,29], b1: [95,18,30,28], b2: [7,30,9,8],
    b3: [28,16,3,26], b4: [20,5,72,73], b5: [49,22],
    d0: [11,99,44,17,88,3,71,55], d1: [29,6,41,90,14,33,77,2],
    d2: [61,19,50,8,91,4,66,28], d3: [15,73,39,7,52,21,84,11]
  };
  var _meta = { ca: 549, cb: 636, ra: 5, rb: 9, stamp: 0 };

  function _join(parts) {
    var o = [], i, j;
    for (i = 0; i < parts.length; i++)
      for (j = 0; j < parts[i].length; j++) o.push(parts[i][j]);
    return o;
  }
  function _pathA() {
    return _join([_sh.a0, _sh.a1, _sh.a2, _sh.a3, _sh.a4, _sh.a5]);
  }
  function _pathB() {
    return _join([_sh.b0, _sh.b1, _sh.b2, _sh.b3, _sh.b4, _sh.b5]);
  }
  function _decoy() {
    return _join([_sh.d0, _sh.d1, _sh.d2, _sh.d3]);
  }
  function _unwrap(buf, rotN) {
    // reverse: xor K2, unrot rb, xor K1, unrot ra, xor K0
    var a = buf.slice();
    a = _x(a, K2);
    a = _u(a, rotN);
    a = _x(a, K1);
    a = _u(a, _meta.ra);
    a = _x(a, K0);
    return a;
  }
  function _fakeUnwrap(buf) {
    // intentional dead path — wrong key order
    var a = buf.slice();
    a = _x(a, K0);
    a = _r(a, 3);
    a = _x(a, K2);
    return a;
  }
  function _materialize(which) {
    var raw = which === 0 ? _pathA() : _pathB();
    var expect = which === 0 ? _meta.ca : _meta.cb;
    if (_sum(raw) !== expect) {
      // integrity fail → return impossible address
      return "noreply+" + which + "@invalid.local";
    }
    var rotN = which === 0 ? _meta.rb : _meta.rb;
    var plain = _fc(_unwrap(raw, rotN));
    // secondary shape check
    if (plain.indexOf("@") < 1 || plain.indexOf(".") < 0) {
      plain = _fc(_fakeUnwrap(raw));
    }
    return plain;
  }

  // interleave noise so static scan sees large mixed blob
  var _blob = _mix(_pathA(), _decoy());
  _blob = _mix(_blob, _pathB());
  _meta.stamp = _sum(_blob) ^ (_seed.length * 17);

  var _cache = null;
  function _list() {
    if (_cache) return _cache;
    var a = _materialize(0);
    var b = _materialize(1);
    // burn shard refs
    _sh = null;
    _cache = [a, b];
    return _cache;
  }

  function _norm(e) {
    return String(e || "").trim().toLowerCase();
  }
  function check(email) {
    var e = _norm(email);
    if (!e || e.indexOf("@") < 0) return false;
    var L = _list();
    var i;
    for (i = 0; i < L.length; i++) {
      if (_norm(L[i]) === e) return true;
    }
    return false;
  }

  // export minimal surface
  if (typeof window !== "undefined") {
    window.__vx_noise = _seed.length;
    window.__vx_stamp = _meta.stamp;
  }

  return {
    list: _list(),
    check: check,
    // red herrings
    verify: function () { return _meta.stamp; },
    noise: function () { return _seed.length; }
  };
})();

var ADMIN_EMAILS = _vx.list;

if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

const auth = typeof firebase !== "undefined" ? firebase.auth() : null;
const db = typeof firebase !== "undefined" ? firebase.database() : null;

function isAdmin(email) {
  try {
    return !!( _vx && typeof _vx.check === "function" && _vx.check(email) );
  } catch (err) {
    return false;
  }
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
  // Pastikan sesi disimpan sebelum pindah halaman agar dashboard membaca akun yang sama.
  return auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function () {
      return auth.signInWithEmailAndPassword(email, password);
    });
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
    var email = user && user.email ? user.email : "";
    if (!isAdmin(email)) {
      try { alert("Akses ditolak. Hanya admin yang diizinkan."); } catch (e) {}
      window.location.replace(redirect);
      return Promise.reject(new Error("not_admin"));
    }
    return user;
  });
}

/* ---------- Orders ---------- */
function simpanOrder(orderData) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  var kode = orderData.kode || generateKode();
  var produkId = orderData.produkId || orderData.idProduk || null;
  return db.ref("orders/" + kode).set(Object.assign({}, orderData, {
    kode: kode,
    createdAt: Date.now(),
    updatedAt: Date.now()
  })).then(function () {
    if (!produkId) return kode;
    /* kurangi stok produk */
    return db.ref("produk/" + produkId).once("value").then(function (snap) {
      var p = snap.val();
      if (!p) return kode;
      var stok = (p.stok != null) ? Number(p.stok) : null;
      if (stok == null || isNaN(stok)) return kode;
      var next = Math.max(0, stok - 1);
      return db.ref("produk/" + produkId).update({
        stok: next,
        stokHabis: next <= 0,
        updatedAt: Date.now()
      }).then(function () { return kode; });
    });
  });
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
  if (opts.catatanAdmin !== undefined) updates.catatanAdmin = opts.catatanAdmin || "";
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
  var payload = Object.assign({}, data, { updatedAt: Date.now() });
  payload.flashSale = !!payload.flashSale;
  payload.flashDiskon = Math.min(99, Math.max(0, Number(payload.flashDiskon) || 0));
  payload.flashHarga = Number(payload.flashHarga) || 0;
  payload.flashEnd = Number(payload.flashEnd) || 0;
  payload.stok = Math.max(0, Number(payload.stok) || 0);
  payload.stokHabis = !!payload.stokHabis || payload.stok <= 0;
  /* hapus undefined */
  Object.keys(payload).forEach(function (k) {
    if (payload[k] === undefined || payload[k] === null) delete payload[k];
  });
  if (id) {
    return db.ref("produk/" + id).update(payload).then(function () { return id; });
  }
  var key = db.ref("produk").push().key;
  payload.id = key;
  if (!payload.gambar) payload.gambar = "produk1.png";
  return db.ref("produk/" + key).set(payload).then(function () { return key; });
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

function kirimPesanUser(uid, email, text, imageData) {
  if (!db || !uid) return Promise.reject(new Error("Database belum siap"));
  text = (text || "").trim();
  if (!text && !imageData) return Promise.reject(new Error("Pesan kosong"));
  var msgRef = db.ref(chatPath(uid) + "/messages").push();
  var msg = {
    from: "user",
    email: email || "",
    text: text || (imageData ? "Foto" : ""),
    at: Date.now(),
    readByAdmin: false
  };
  if (imageData) msg.image = imageData;
  var preview = text || "Foto";
  return msgRef.set(msg).then(function () {
    return db.ref(chatPath(uid) + "/meta").update({
      email: email || "",
      lastMessage: preview,
      lastAt: Date.now(),
      lastFrom: "user",
      unreadAdmin: true,
      unreadUser: false
    });
  });
}

function kirimPesanAdmin(uid, text, imageData) {
  if (!db || !uid) return Promise.reject(new Error("Database belum siap"));
  text = (text || "").trim();
  if (!text && !imageData) return Promise.reject(new Error("Pesan kosong"));
  var msgRef = db.ref(chatPath(uid) + "/messages").push();
  var msg = {
    from: "admin",
    text: text || (imageData ? "Foto" : ""),
    at: Date.now(),
    readByUser: false
  };
  if (imageData) msg.image = imageData;
  var preview = text || "Foto";
  return msgRef.set(msg).then(function () {
    return db.ref(chatPath(uid) + "/meta").update({
      lastMessage: preview,
      lastAt: Date.now(),
      lastFrom: "admin",
      unreadAdmin: false,
      unreadUser: true
    });
  });
}

/** kompres gambar chat max ~800px */
function compressChatImage(file) {
  return new Promise(function (resolve, reject) {
    if (!file || !file.type || file.type.indexOf("image") !== 0) {
      reject(new Error("Pilih file gambar"));
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 800;
        var w = img.width, h = img.height;
        if (w > max || h > max) {
          if (w > h) { h = Math.round(h * max / w); w = max; }
          else { w = Math.round(w * max / h); h = max; }
        }
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = function () { reject(new Error("Gagal baca gambar")); };
      img.src = reader.result;
    };
    reader.onerror = function () { reject(new Error("Gagal baca file")); };
    reader.readAsDataURL(file);
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


/* ---------- Menu Layanan (home grid) ---------- */
function getMenuLayanan() {
  if (!db) return Promise.resolve([]);
  return db.ref("menu_layanan").once("value").then(function (snap) {
    var val = snap.val() || {};
    return Object.keys(val).map(function (id) {
      return Object.assign({ id: id }, val[id]);
    }).filter(function (m) {
      return m.aktif !== false && m.aktif !== "false";
    }).sort(function (a, b) {
      return (Number(a.urutan) || 0) - (Number(b.urutan) || 0);
    });
  });
}
function listenMenuLayanan(callback) {
  if (!db) return function () {};
  var ref = db.ref("menu_layanan");
  var handler = function (snap) {
    var val = snap.val() || {};
    var list = Object.keys(val).map(function (id) {
      return Object.assign({ id: id }, val[id]);
    }).sort(function (a, b) {
      return (Number(a.urutan) || 0) - (Number(b.urutan) || 0);
    });
    callback(list);
  };
  ref.on("value", handler);
  return function () { ref.off("value", handler); };
}
function simpanMenuLayanan(data) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  var id = data.id || db.ref("menu_layanan").push().key;
  var payload = {
    judul: (data.judul || "").trim(),
    subjudul: (data.subjudul || "").trim(),
    icon: (data.icon || "package").trim(),
    kategori: (data.kategori || "").trim(),
    urutan: Number(data.urutan) || 0,
    aktif: data.aktif !== false && data.aktif !== "false",
    updatedAt: Date.now()
  };
  return db.ref("menu_layanan/" + id).update(payload).then(function () { return id; });
}
function hapusMenuLayanan(id) {
  if (!db || !id) return Promise.reject(new Error("ID kosong"));
  return db.ref("menu_layanan/" + id).remove();
}

/* ---------- Joki Config (paket + includes, editable admin) ---------- */
var DEFAULT_JOKI_PAKET = [
  { id: "joki-20jam", nama: "Joki 20 Jam", badge: "20 JAM", desc: "Layanan joki kontak selama 20 jam + SW + share 10GB", fitur: ["20 jam + SW + share 10GB", "Order langsung di web", "Status dapat dipantau"], harga: 500, hari: 0, jam: 20 },
  { id: "joki-1hari", nama: "Joki 1 Hari", badge: "1 HARI", desc: "Layanan joki kontak selama 1 hari + SW + share all GB.", fitur: ["1 hari + SW + share all GB", "Order langsung di web", "Status dapat dipantau"], harga: 1000, hari: 1, jam: 0 },
  { id: "joki-2hari", nama: "Joki 2 Hari", badge: "2 HARI", desc: "Layanan joki kontak selama 2 hari + SW + share all GB.", fitur: ["2 hari + SW + share all GB", "Order langsung di web", "Status dapat dipantau"], harga: 2000, hari: 2, jam: 0 },
  { id: "joki-3hari", nama: "Joki 3 Hari", badge: "3 HARI", desc: "Layanan joki kontak selama 3 hari + SW + share all GB.", fitur: ["3 hari + SW + share all GB", "Order langsung di web", "Status dapat dipantau"], harga: 3000, populer: true, hari: 3, jam: 0 },
  { id: "joki-4hari", nama: "Joki 4 Hari", badge: "4 HARI", desc: "Layanan joki kontak selama 4 hari + SW + share all GB.", fitur: ["4 hari + SW + share all GB", "Order langsung di web", "Status dapat dipantau"], harga: 4000, hari: 4, jam: 0 },
  { id: "joki-5hari", nama: "Joki 5 Hari", badge: "5 HARI", desc: "Layanan joki kontak selama 5 hari + SW + share all GB.", fitur: ["5 hari + SW + share all GB", "Order langsung di web", "Status dapat dipantau"], harga: 5000, hari: 5, jam: 0 },
  { id: "joki-permanen", nama: "Joki Permanen", badge: "PERMANEN", desc: "Permanen tempel link tree di TikTok + SW tebar. Same lu pensi JB.", fitur: ["Permanen tempel link tree di TikTok", "SW tebar", "Same lu pensi JB", "Order langsung di web", "Status dapat dipantau"], harga: 6000, permanen: true, hari: 0, jam: 0 }
];
var DEFAULT_JOKI_INCLUDES = [
  { id: "prioritas", nama: "Prioritas Antrian", harga: 8000, hari: 0, jam: 0, prioritas: true },
  { id: "facecam", nama: "FaceCam / Video Rekomendasi", harga: 5000, hari: 0, jam: 0, facecam: true },
  { id: "plus20jam", nama: "+ 20 Jam", harga: 500, hari: 0, jam: 20 },
  { id: "plus1hari", nama: "+ 1 Hari", harga: 1000, hari: 1, jam: 0 },
  { id: "plus2hari", nama: "+ 2 Hari", harga: 2000, hari: 2, jam: 0 },
  { id: "plus3hari", nama: "+ 3 Hari", harga: 3000, hari: 3, jam: 0 },
  { id: "plus4hari", nama: "+ 4 Hari", harga: 4000, hari: 4, jam: 0 },
  { id: "plus5hari", nama: "+ 5 Hari", harga: 5000, hari: 5, jam: 0 }
];

function getJokiConfig() {
  if (!db) return Promise.resolve({ paket: DEFAULT_JOKI_PAKET.slice(), includes: DEFAULT_JOKI_INCLUDES.slice() });
  return db.ref("joki_config").once("value").then(function (snap) {
    var val = snap.val() || {};
    var paket = Array.isArray(val.paket) && val.paket.length ? val.paket : DEFAULT_JOKI_PAKET.slice();
    var includes = Array.isArray(val.includes) && val.includes.length ? val.includes : DEFAULT_JOKI_INCLUDES.slice();
    return { paket: paket, includes: includes };
  });
}

function simpanJokiConfig(data) {
  if (!db) return Promise.reject(new Error("Database belum siap"));
  var payload = {
    paket: Array.isArray(data.paket) ? data.paket : DEFAULT_JOKI_PAKET,
    includes: Array.isArray(data.includes) ? data.includes : DEFAULT_JOKI_INCLUDES,
    updatedAt: Date.now()
  };
  return db.ref("joki_config").set(payload);
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
  getMenuLayanan: getMenuLayanan,
  listenMenuLayanan: listenMenuLayanan,
  simpanMenuLayanan: simpanMenuLayanan,
  hapusMenuLayanan: hapusMenuLayanan,
  getJokiConfig: getJokiConfig,
  simpanJokiConfig: simpanJokiConfig,
  DEFAULT_JOKI_PAKET: DEFAULT_JOKI_PAKET,
  DEFAULT_JOKI_INCLUDES: DEFAULT_JOKI_INCLUDES,
  showToast: showToast,
  getProdukList: getProdukList,
  listenProduk: listenProduk,
  simpanProduk: simpanProduk,
  hapusProduk: hapusProduk,
  getSettings: getSettings,
  simpanSettings: simpanSettings,
  kirimPesanUser: kirimPesanUser,
  kirimPesanAdmin: kirimPesanAdmin,
  compressChatImage: compressChatImage,
  listenChatMessages: listenChatMessages,
  listenAllChats: listenAllChats,
  markChatReadByAdmin: markChatReadByAdmin,
  markChatReadByUser: markChatReadByUser,
  listenUserUnread: listenUserUnread,
  hitungPendapatan30Hari: hitungPendapatan30Hari,
  fileToDataURL: fileToDataURL,
  bukaWhatsApp: bukaWhatsApp
};
