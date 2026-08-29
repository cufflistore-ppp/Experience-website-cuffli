/**
 * VOXYY JOKI - Antrian Global (stabil)
 * - Order lokal TIDAK pernah dihapus oleh server kosong
 * - Local + remote selalu di-merge
 * - Backend: crudcrud.com
 */
const CRUD_BASE =
  "https://crudcrud.com/api/bbf20bab779843cdbd4e72618f9d6d75/orders";
const LOCAL_ORDERS_KEY = "voxyy_orders";

function isGlobalConfigured() {
  return true;
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

function stripId(order) {
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

/** Merge by kode — status lebih maju / createdAt lebih baru menang */
function mergeOrders(listA, listB) {
  const map = new Map();
  const absorb = (o) => {
    if (!o || !o.kode) return;
    const k = String(o.kode).toUpperCase();
    const prev = map.get(k);
    if (!prev) {
      map.set(k, { ...o });
      return;
    }
    const merged = { ...prev, ...o };
    // status: ambil yang lebih maju
    if (statusScore(prev.status) > statusScore(o.status)) {
      merged.status = prev.status;
    }
    // createdAt: ambil yang lebih tua (asli) kalau ada
    const ca = Number(prev.createdAt) || 0;
    const cb = Number(o.createdAt) || 0;
    if (ca && cb) merged.createdAt = Math.min(ca, cb);
    else merged.createdAt = ca || cb || Date.now();
    // _id dari remote kalau ada
    if (prev._id && !merged._id) merged._id = prev._id;
    if (o._id) merged._id = o._id;
    map.set(k, merged);
  };
  (listA || []).forEach(absorb);
  (listB || []).forEach(absorb);
  return Array.from(map.values()).sort(
    (a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0)
  );
}

async function fetchRemoteOrders() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(CRUD_BASE + "?_=" + Date.now(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error("GET " + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/**
 * Ambil orders = MERGE(remote, local)
 * JANGAN pernah timpa local dengan [] dari server.
 */
async function getOrders() {
  const local = getLocalOrders();
  try {
    const remote = await fetchRemoteOrders();
    const merged = mergeOrders(remote, local);
    // simpan hasil merge (bukan remote mentah)
    setLocalOrders(merged.map(stripId));
    // push local-only items ke remote (background, jangan blok)
    syncLocalOnlyToRemote(remote, merged).catch(() => {});
    return merged;
  } catch (e) {
    console.warn("[Voxyy] Global GET gagal, tampilkan local:", e);
    return local;
  }
}

/** Order yang hanya ada di local → POST ke remote */
async function syncLocalOnlyToRemote(remote, merged) {
  const remoteKeys = new Set(
    (remote || []).map((o) => String(o.kode || "").toUpperCase())
  );
  for (const o of merged || []) {
    if (!o || !o.kode) continue;
    const k = String(o.kode).toUpperCase();
    if (remoteKeys.has(k)) continue;
    try {
      await fetch(CRUD_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(stripId(o))
      });
    } catch (e) {}
  }
}

async function addOrder(order) {
  if (!order || !order.kode) return { ok: false };
  if (!order.createdAt) order.createdAt = Date.now();

  // 1) SELALU simpan local dulu
  const local = getLocalOrders();
  const t = String(order.kode).toUpperCase();
  const li = local.findIndex(
    (o) => String(o.kode || "").toUpperCase() === t
  );
  if (li >= 0) local[li] = { ...local[li], ...stripId(order) };
  else local.unshift(stripId(order));
  setLocalOrders(local);

  // 2) push remote
  try {
    let remote = [];
    try {
      remote = await fetchRemoteOrders();
    } catch (e) {
      remote = [];
    }
    const existing = remote.find(
      (o) => String(o.kode || "").toUpperCase() === t
    );
    if (existing && existing._id) {
      const body = stripId({ ...existing, ...order });
      const res = await fetch(CRUD_BASE + "/" + existing._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("PUT " + res.status);
      return { ok: true, mode: "global", action: "update" };
    }
    const res = await fetch(CRUD_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(stripId(order))
    });
    if (!res.ok) throw new Error("POST " + res.status);
    // verifikasi tersimpan
    try {
      const check = await fetchRemoteOrders();
      const found = check.find(
        (o) => String(o.kode || "").toUpperCase() === t
      );
      if (!found) console.warn("[Voxyy] POST ok tapi belum terlihat di GET");
    } catch (e) {}
    return { ok: true, mode: "global", action: "create" };
  } catch (e) {
    console.error("[Voxyy] addOrder remote gagal (local aman):", e);
    return { ok: false, mode: "local", error: String(e) };
  }
}

async function updateOrderByKode(kode, patch) {
  if (!kode) return { ok: false };
  const t = String(kode).trim().toUpperCase();

  let local = getLocalOrders();
  const li = local.findIndex(
    (o) => String(o.kode || "").toUpperCase() === t
  );
  if (li >= 0) {
    local[li] = { ...local[li], ...patch };
    setLocalOrders(local);
  }

  try {
    const remote = await fetchRemoteOrders();
    const existing = remote.find(
      (o) => String(o.kode || "").toUpperCase() === t
    );
    if (!existing || !existing._id) {
      const src = li >= 0 ? local[li] : { kode, ...patch, createdAt: Date.now() };
      const res = await fetch(CRUD_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stripId(src))
      });
      if (!res.ok) throw new Error("POST " + res.status);
      return { ok: true, mode: "global", action: "create" };
    }
    const body = stripId({ ...existing, ...patch });
    const res = await fetch(CRUD_BASE + "/" + existing._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("PUT " + res.status);
    return { ok: true, mode: "global" };
  } catch (e) {
    console.error("[Voxyy] update remote gagal:", e);
    return { ok: li >= 0, mode: "local", error: String(e) };
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

  try {
    const remote = await fetchRemoteOrders();
    const existing = remote.find(
      (o) => String(o.kode || "").toUpperCase() === t
    );
    if (!existing || !existing._id) return { ok: true };
    const res = await fetch(CRUD_BASE + "/" + existing._id, { method: "DELETE" });
    if (!res.ok && res.status !== 404) throw new Error("DELETE " + res.status);
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
  setLocalOrders(list.map(stripId));
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
    (orders || []).find((o) => String(o.kode || "").toUpperCase() === t) || null
  );
}

window.VoxyyOrders = {
  isGlobalConfigured,
  getOrders,
  saveOrders,
  addOrder,
  updateOrderByKode,
  updateOrderByIndex,
  deleteOrderByIndex,
  deleteOrderByKode,
  findOrderByKodeInList,
  getLocalOrders,
  setLocalOrders
};
