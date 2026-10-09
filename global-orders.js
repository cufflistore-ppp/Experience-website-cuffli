/**
 * VOXY MARKET - Antrian & Admin Global (Firebase)
 * authDomain = firebaseapp.com (stabil). Login Google pakai GIS (tanpa redirect).
 */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAx2I5hmnMBkS04tOr21B9KG4SVaVCqyQg",
  authDomain: "voxyyjoki.firebaseapp.com",
  databaseURL: "https://voxyyjoki-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "voxyyjoki",
  storageBucket: "voxyyjoki.firebasestorage.app",
  messagingSenderId: "442340334430",
  appId: "1:442340334430:web:785c5a5f69aaf8fe8fcdcf",
  measurementId: "G-7QTGSDR351"
};

/**
 * Web Client ID dari Google Cloud (bukan apiKey).
 * Cara ambil:
 * 1. https://console.cloud.google.com/apis/credentials?project=voxyyjoki
 * 2. OAuth 2.0 Client IDs → "Web client (auto created by Google Service)"
 * 3. Copy Client ID (bentuk: 442340334430-xxxxx.apps.googleusercontent.com)
 * 4. Tempel di bawah
 *
 * JUGA di edit client itu (Google Cloud Console → OAuth client):
 * Authorized JavaScript origins → Add domain Vercel kamu, contoh:
 *   https://NAMA-SITE-KAMU.vercel.app
 * Authorized redirect URIs → Add:
 *   https://voxyyjoki.firebaseapp.com/__/auth/handler
 *   https://NAMA-SITE-KAMU.vercel.app
 *
 * Firebase Console → Authentication → Settings → Authorized domains:
 *   Tambah juga domain Vercel (xxx.vercel.app)
 */
const GOOGLE_WEB_CLIENT_ID = "442340334430-eomut78090vr388t13r4au4hkugknshj.apps.googleusercontent.com";

const LOCAL_ORDERS_KEY = "voxyy_orders";
let _db = null;
let _ready = false;
let _listeners = [];
let _lastOrders = [];

function isGlobalConfigured() {
  return !!(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.apiKey.length > 10 &&
    FIREBASE_CONFIG.databaseURL &&
    String(FIREBASE_CONFIG.databaseURL).includes("http")
  );
}

function getLocalOrders() {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function setLocalOrders(orders) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders || []));
  } catch (e) {}
}

function stripMeta(order) {
  if (!order || typeof order !== "object") return order;
  const copy = { ...order };
  delete copy._id;
  return copy;
}

function statusScore(st) {
  const s = String(st || "").toLowerCase();
  if (s.includes("sukses") || s.includes("selesai")) return 3;
  if (s.includes("proses") || s.includes("verifikasi")) return 2;
  if (s.includes("belum")) return 1;
  return 0;
}

function mergeOrders(a, b) {
  const map = new Map();
  const absorb = (o) => {
    if (!o || !o.kode) return;
    const k = String(o.kode).toUpperCase();
    const prev = map.get(k);
    if (!prev) {
      map.set(k, { ...o });
      return;
    }
    const m = { ...prev, ...o };
    if (statusScore(prev.status) > statusScore(o.status)) m.status = prev.status;
    const ca = Number(prev.createdAt) || 0;
    const cb = Number(o.createdAt) || 0;
    m.createdAt = ca && cb ? Math.min(ca, cb) : ca || cb || Date.now();
    map.set(k, m);
  };
  (a || []).forEach(absorb);
  (b || []).forEach(absorb);
  return Array.from(map.values()).sort(
    (x, y) => (Number(y.createdAt) || 0) - (Number(x.createdAt) || 0)
  );
}

function kodeKey(kode) {
  return String(kode || "")
    .trim()
    .toUpperCase()
    .replace(/[.#$\[\]]/g, "_");
}

function initFirebase() {
  if (_ready) return true;
  if (!isGlobalConfigured()) return false;
  if (typeof firebase === "undefined") return false;
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.database();
    _ready = true;
    _db.ref("orders").on(
      "value",
      (snap) => {
        const val = snap.val() || {};
        const list = Object.keys(val).map((k) => ({
          ...val[k],
          _id: k,
          kode: val[k].kode || k
        }));
        list.sort(
          (a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0)
        );
        _lastOrders = list;
        setLocalOrders(list.map(stripMeta));
        _listeners.forEach((fn) => {
          try {
            fn(list);
          } catch (e) {}
        });
      },
      (err) => console.error("[Voxyy] DB:", err)
    );
    return true;
  } catch (e) {
    console.error("[Voxyy] init:", e);
    return false;
  }
}

function onOrdersChange(fn) {
  if (typeof fn === "function") _listeners.push(fn);
  initFirebase();
  if (_lastOrders.length) {
    try {
      fn(_lastOrders);
    } catch (e) {}
  }
}

async function getOrders() {
  const local = getLocalOrders();
  if (!isGlobalConfigured()) return local;
  initFirebase();
  if (!_db) return local;
  if (_lastOrders.length) return mergeOrders(_lastOrders, local);
  try {
    const snap = await _db.ref("orders").once("value");
    const val = snap.val() || {};
    const list = Object.keys(val).map((k) => ({
      ...val[k],
      _id: k,
      kode: val[k].kode || k
    }));
    list.sort(
      (a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0)
    );
    _lastOrders = list;
    const merged = mergeOrders(list, local);
    setLocalOrders(merged.map(stripMeta));
    return merged;
  } catch (e) {
    return local;
  }
}

async function addOrder(order) {
  if (!order || !order.kode) return { ok: false, error: "kode kosong" };
  if (!order.createdAt) order.createdAt = Date.now();
  const full = stripMeta(order);
  // localStorage: jangan simpan base64 besar (quota)
  const light = { ...full };
  if (light.bukti && String(light.bukti).length > 8000) {
    light.hasBukti = true;
    light.bukti = "[stored]";
  }
  if (light.file && String(light.file).indexOf("data:") === 0 && String(light.file).length > 8000) {
    light.file = "[stored]";
  }
  const local = getLocalOrders();
  const t = String(order.kode).toUpperCase();
  const li = local.findIndex(
    (o) => String(o.kode || "").toUpperCase() === t
  );
  if (li >= 0) local[li] = { ...local[li], ...light };
  else local.unshift(light);
  try { setLocalOrders(local); } catch (e) {
    try {
      // hapus bukti dari semua lalu simpan
      setLocalOrders(local.map(function (o) {
        const x = { ...o };
        if (x.bukti && String(x.bukti).length > 500) x.bukti = "[stored]";
        return x;
      }));
    } catch (e2) {}
  }
  if (!isGlobalConfigured()) return { ok: true, mode: "local" };
  initFirebase();
  if (!_db) return { ok: true, mode: "local" };
  const key = kodeKey(order.kode);
  try {
    // Simpan foto bukti asli. Duplikasi ke order_bukti untuk cadangan.
    let payload = { ...full };
    if (payload.bukti && String(payload.bukti).indexOf("data:") === 0) {
      try {
        await _db.ref("order_bukti/" + key).set({
          bukti: payload.bukti,
          at: Date.now(),
          kode: order.kode,
        });
      } catch (e) {}
      payload = { ...payload, hasBukti: true };
      // tetap kirim data:image di orders agar admin langsung tampil
      try {
        await _db.ref("orders/" + key).set(stripMeta(payload));
        return { ok: true, mode: "global" };
      } catch (eBig) {
        // terlalu besar: order tanpa base64, foto di order_bukti
        payload = { ...payload, bukti: "", hasBukti: true };
        await _db.ref("orders/" + key).set(stripMeta(payload));
        return { ok: true, mode: "global-bukti-side" };
      }
    }
    await _db.ref("orders/" + key).set(stripMeta(payload));
    return { ok: true, mode: "global" };
  } catch (e) {
    // retry tanpa bukti
    try {
      const minimal = { ...full, hasBukti: !!full.bukti, bukti: full.bukti ? "[retry]" : "" };
      delete minimal.file;
      await _db.ref("orders/" + key).set(stripMeta(minimal));
      return { ok: true, mode: "global-minimal", warn: String(e && e.message ? e.message : e) };
    } catch (e2) {
      return { ok: false, mode: "local", error: String(e2 && e2.message ? e2.message : e2) };
    }
  }
}

async function getBuktiByKode(kode) {
  if (!kode) return "";
  const key = kodeKey(kode);
  const up = String(kode).toUpperCase();
  function ok(b) {
    return b && typeof b === "string" && (b.indexOf("data:image") === 0 || /^https?:\/\//i.test(b));
  }
  try {
    const orders = await getOrders();
    const o = (orders || []).find(function (x) {
      return String(x.kode || "").toUpperCase() === up || String(x._id || "").toUpperCase() === up;
    });
    if (o && ok(o.bukti)) return o.bukti;
    if (o && ok(o.buktiTf)) return o.buktiTf;
    if (o && ok(o.buktiURL)) return o.buktiURL;
  } catch (e) {}
  if (!isGlobalConfigured()) return "";
  initFirebase();
  if (!_db) return "";
  // order_bukti paths
  const paths = ["order_bukti/" + key, "order_bukti/" + up, "bukti/" + key];
  for (var i = 0; i < paths.length; i++) {
    try {
      const snap = await _db.ref(paths[i]).once("value");
      const v = snap.val();
      if (v && ok(v.bukti)) return v.bukti;
      if (v && ok(v.data)) return v.data;
      if (ok(v)) return v;
    } catch (e) {}
  }
  try {
    const snap2 = await _db.ref("orders/" + key).once("value");
    const o2 = snap2.val();
    if (o2 && ok(o2.bukti)) return o2.bukti;
  } catch (e) {}
  // scan all orders for kode
  try {
    const all = await _db.ref("orders").once("value");
    const val = all.val() || {};
    var found = "";
    Object.keys(val).forEach(function (k) {
      var o = val[k] || {};
      if (String(o.kode || k).toUpperCase() === up && ok(o.bukti)) found = o.bukti;
    });
    if (found) return found;
  } catch (e) {}
  return "";
}


async function getDeliveryFileByKode(kode) {
  if (!kode) return "";
  const key = kodeKey(kode);
  const up = String(kode).toUpperCase();
  function ok(f) {
    return f && typeof f === "string" && (
      f.indexOf("data:") === 0 || /^https?:\/\//i.test(f) || f.indexOf("blob:") === 0
    );
  }
  try {
    const orders = await getOrders();
    const o = (orders || []).find(function (x) {
      return String(x.kode || "").toUpperCase() === up;
    });
    if (o) {
      var f = o.file || o.download || o.fileUrl || "";
      if (ok(f)) return f;
      if (String(f).indexOf("firebase:order_files/") === 0) {
        /* fallthrough */
      }
    }
  } catch (e) {}
  if (!isGlobalConfigured()) return "";
  initFirebase();
  if (!_db) return "";
  try {
    const snap = await _db.ref("order_files/" + key).once("value");
    const v = snap.val();
    if (v && ok(v.data)) return v.data;
  } catch (e) {}
  try {
    const snap2 = await _db.ref("orders/" + key).once("value");
    const o2 = snap2.val() || {};
    var f2 = o2.file || o2.download || o2.fileUrl || "";
    if (ok(f2)) return f2;
  } catch (e) {}
  return "";
}

async function updateOrderByKode(kode, patch) {
  if (!kode) return { ok: false, error: "kode kosong" };
  const t = String(kode).trim().toUpperCase();
  const key = kodeKey(kode);
  let local = getLocalOrders();
  const li = local.findIndex(
    (o) => String(o.kode || "").toUpperCase() === t
  );
  if (li >= 0) {
    local[li] = { ...local[li], ...patch };
    setLocalOrders(local);
  }
  // update cache realtime
  if (_lastOrders && _lastOrders.length) {
    const i2 = _lastOrders.findIndex(
      (o) => String(o.kode || "").toUpperCase() === t || String(o._id || "").toUpperCase() === t
    );
    if (i2 >= 0) _lastOrders[i2] = { ..._lastOrders[i2], ...patch };
  }
  if (!isGlobalConfigured()) return { ok: li >= 0, mode: "local" };
  initFirebase();
  if (!_db) return { ok: li >= 0, mode: "local", error: "db null" };
  try {
    // cari path yang benar: key langsung, atau scan by field kode
    let ref = _db.ref("orders/" + key);
    let snap = await ref.once("value");
    if (!snap.exists()) {
      const all = await _db.ref("orders").once("value");
      const val = all.val() || {};
      let foundKey = null;
      Object.keys(val).forEach(function (k) {
        const o = val[k] || {};
        if (String(o.kode || "").toUpperCase() === t || String(k).toUpperCase() === t) {
          foundKey = k;
        }
      });
      if (foundKey) {
        ref = _db.ref("orders/" + foundKey);
        snap = await ref.once("value");
      }
    }
    async function putDeliveryFile(full) {
      var f = full.file || full.download || full.fileUrl || "";
      if (!f || String(f).indexOf("data:") !== 0) return full;
      if (String(f).length < 120000) return full; // kecil: simpan di order
      try {
        await _db.ref("order_files/" + key).set({
          data: f,
          name: full.fileName || "produk",
          at: Date.now(),
          kode: kode,
        });
        full = {
          ...full,
          file: "firebase:order_files/" + key,
          download: "firebase:order_files/" + key,
          fileUrl: "firebase:order_files/" + key,
          hasFile: true,
        };
      } catch (e) {
        console.warn("[order_files]", e);
      }
      return full;
    }

    if (!snap.exists()) {
      let src =
        li >= 0
          ? { ...local[li], ...patch, kode: kode }
          : { kode: kode, createdAt: Date.now(), ...patch };
      src = await putDeliveryFile(stripMeta(src));
      await ref.set(src);
      // local tetap pakai data asli agar admin device ok
      if (li >= 0 && patch.file) {
        local[li] = { ...local[li], ...patch };
        setLocalOrders(local);
      }
    } else {
      const cur = snap.val() || {};
      let merged = stripMeta({ ...cur, ...patch, kode: cur.kode || kode });
      if ((!patch.bukti || String(patch.bukti).indexOf("[") === 0 || patch.bukti === "") && cur.bukti && String(cur.bukti).indexOf("data:") === 0) {
        merged.bukti = cur.bukti;
      }
      if (!patch.file && cur.file) merged.file = cur.file;
      if (!patch.download && cur.download) merged.download = cur.download;
      merged = await putDeliveryFile(merged);
      await ref.set(merged);
    }
    return { ok: true, mode: "global" };
  } catch (e) {
    console.error("[Voxyy] updateOrderByKode", e);
    return { ok: li >= 0, mode: "local", error: String(e && e.message ? e.message : e) };
  }
}

async function updateOrderByIndex(index, patch) {
  const orders = await getOrders();
  if (!orders[index]) return { ok: false, error: "not_found" };
  return updateOrderByKode(orders[index].kode, patch);
}

async function deleteOrderByKode(kode) {
  if (!kode) return { ok: false };
  const t = String(kode).trim().toUpperCase();
  setLocalOrders(
    getLocalOrders().filter((o) => String(o.kode || "").toUpperCase() !== t)
  );
  if (!isGlobalConfigured()) return { ok: true, mode: "local" };
  initFirebase();
  if (!_db) return { ok: true, mode: "local" };
  try {
    await _db.ref("orders/" + kodeKey(kode)).remove();
    return { ok: true, mode: "global" };
  } catch (e) {
    return { ok: true, mode: "local", error: String(e) };
  }
}

async function deleteOrderByIndex(index) {
  const orders = await getOrders();
  if (!orders[index]) return { ok: false };
  return deleteOrderByKode(orders[index].kode);
}

async function saveOrders(orders) {
  const list = Array.isArray(orders) ? orders : [];
  setLocalOrders(list.map(stripMeta));
  for (const o of list) {
    if (o && o.kode) {
      try {
        await addOrder(o);
      } catch (e) {}
    }
  }
  return { ok: true };
}

function findOrderByKodeInList(orders, kode) {
  if (!kode) return null;
  const t = String(kode).trim().toUpperCase();
  return (
    (orders || []).find((o) => String(o.kode || "").toUpperCase() === t) ||
    null
  );
}


/* ========== SETTINGS & PRODUK GLOBAL (semua device) ========== */
const LOCAL_SETTINGS_KEY = "voxyy_settings";
const LOCAL_PRODUK_KEY = "voxyy_produk_admin";
let _lastSettings = null;
let _lastProduk = null;
let _settingsListeners = [];
let _produkListeners = [];

function getLocalSettings() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function setLocalSettings(obj) {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(obj || {}));
  } catch (e) {}
}

function getLocalProduk() {
  try {
    const arr = JSON.parse(localStorage.getItem(LOCAL_PRODUK_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function setLocalProduk(list) {
  try {
    localStorage.setItem(LOCAL_PRODUK_KEY, JSON.stringify(list || []));
  } catch (e) {}
}

async function getSettings() {
  const local = getLocalSettings();
  if (!isGlobalConfigured()) return local;
  initFirebase();
  if (!_db) return local;
  // cloud SELALU diutamakan supaya semua device sama
  try {
    if (_lastSettings && Object.keys(_lastSettings).length) {
      const merged = { ...local, ..._lastSettings };
      setLocalSettings(merged);
      return merged;
    }
    const snap = await _db.ref("settings").once("value");
    const val = snap.val() || {};
    _lastSettings = val;
    const merged = { ...local, ...val };
    setLocalSettings(merged);
    if (val.bgColor) localStorage.setItem("voxyy_bg_color", val.bgColor);
    return merged;
  } catch (e) {
    return local;
  }
}

async function saveSettingsGlobal(obj) {
  const cur = await getSettings();
  const next = { ...cur, ...obj, updatedAt: Date.now() };
  setLocalSettings(next);
  if (next.bgColor) localStorage.setItem("voxyy_bg_color", next.bgColor);
  _lastSettings = next;
  if (!isGlobalConfigured()) return { ok: true, mode: "local" };
  initFirebase();
  if (!_db) return { ok: false, mode: "local", error: "db null" };
  try {
    // logo/banner besar: simpan terpisah agar settings ringan
    const payload = { ...next };
    if (payload.logoUrl && String(payload.logoUrl).indexOf("data:") === 0 && String(payload.logoUrl).length > 80000) {
      try {
        await _db.ref("branding_assets/logo").set({ data: payload.logoUrl, at: Date.now() });
        payload.logoUrl = "firebase:branding_assets/logo";
        payload.hasLogoAsset = true;
      } catch (e) {}
    }
    if (payload.bannerUrl && String(payload.bannerUrl).indexOf("data:") === 0 && String(payload.bannerUrl).length > 80000) {
      try {
        await _db.ref("branding_assets/banner").set({ data: payload.bannerUrl, at: Date.now() });
        payload.bannerUrl = "firebase:branding_assets/banner";
        payload.hasBannerAsset = true;
      } catch (e) {}
    }
    if (payload.qrisUrl && String(payload.qrisUrl).indexOf("data:") === 0 && String(payload.qrisUrl).length > 80000) {
      try {
        await _db.ref("branding_assets/qris").set({ data: payload.qrisUrl, at: Date.now() });
        payload.qrisUrl = "firebase:branding_assets/qris";
        payload.hasQrisAsset = true;
      } catch (e) {}
    }
    await _db.ref("settings").set(payload);
    _lastSettings = payload;
    setLocalSettings({ ...next, ...payload });
    return { ok: true, mode: "global" };
  } catch (e) {
    console.error("[settings] save", e);
    return { ok: false, mode: "local", error: String(e && e.message ? e.message : e) };
  }
}

async function resolveBrandingAsset(url) {
  if (!url || typeof url !== "string") return url || "";
  if (url.indexOf("data:") === 0 || url.indexOf("http") === 0 || url.indexOf("blob:") === 0) return url;
  if (url.indexOf("firebase:branding_assets/") !== 0) return url;
  const key = url.replace("firebase:", "");
  if (!isGlobalConfigured()) return "";
  initFirebase();
  if (!_db) return "";
  try {
    const snap = await _db.ref(key).once("value");
    const v = snap.val();
    if (v && v.data) return v.data;
  } catch (e) {}
  return "";
}

async function getProdukGlobal() {
  const local = getLocalProduk();
  if (!isGlobalConfigured()) return local;
  initFirebase();
  if (!_db) return local;
  if (_lastProduk) return _lastProduk;
  try {
    const snap = await _db.ref("produk").once("value");
    const val = snap.val();
    let list = [];
    if (Array.isArray(val)) list = val;
    else if (val && typeof val === "object") {
      list = Object.keys(val).map((k) => ({ ...val[k], id: val[k].id || k }));
    }
    if (list.length) {
      _lastProduk = list;
      setLocalProduk(list);
      return list;
    }
    return local;
  } catch (e) {
    return local;
  }
}

async function saveProdukGlobal(list) {
  const arr = Array.isArray(list) ? list : [];
  setLocalProduk(arr);
  _lastProduk = arr;
  if (!isGlobalConfigured()) return { ok: true, mode: "local" };
  initFirebase();
  if (!_db) return { ok: true, mode: "local" };
  try {
    // simpan sebagai object keyed by id biar stabil
    const map = {};
    arr.forEach((p, i) => {
      const id = String(p.id || "p" + i);
      map[id] = { ...p, id };
    });
    await _db.ref("produk").set(map);
    return { ok: true, mode: "global" };
  } catch (e) {
    return { ok: true, mode: "local", error: String(e) };
  }
}

function onSettingsChange(fn) {
  if (typeof fn === "function") _settingsListeners.push(fn);
  initFirebase();
  if (!_db) return;
  _db.ref("settings").on("value", (snap) => {
    const val = snap.val() || {};
    _lastSettings = val;
    setLocalSettings({ ...getLocalSettings(), ...val });
    if (val.bgColor) localStorage.setItem("voxyy_bg_color", val.bgColor);
    _settingsListeners.forEach((f) => {
      try { f(val); } catch (e) {}
    });
  });
}

function onProdukChange(fn) {
  if (typeof fn === "function") _produkListeners.push(fn);
  initFirebase();
  if (!_db) return;
  _db.ref("produk").on("value", (snap) => {
    const val = snap.val();
    let list = [];
    if (Array.isArray(val)) list = val;
    else if (val && typeof val === "object") {
      list = Object.keys(val).map((k) => ({ ...val[k], id: val[k].id || k }));
    }
    _lastProduk = list;
    if (list.length) setLocalProduk(list);
    _produkListeners.forEach((f) => {
      try { f(list); } catch (e) {}
    });
  });
}


window.VoxyyOrders = {
  isGlobalConfigured,
  getOrders,
  saveOrders,
  addOrder,
  getBuktiByKode,
  getDeliveryFileByKode,
  updateOrderByKode,
  updateOrderByIndex,
  updateOrder: updateOrderByKode,
  deleteOrderByIndex,
  deleteOrderByKode,
  findOrderByKodeInList,
  getLocalOrders,
  setLocalOrders,
  onOrdersChange,
  initFirebase,
  getSettings,
  saveSettingsGlobal,
  resolveBrandingAsset,
  getProdukGlobal,
  saveProdukGlobal,
  onSettingsChange,
  onProdukChange,
  FIREBASE_CONFIG,
  GOOGLE_WEB_CLIENT_ID
};
