/**
 * VOXYY JOKI - Antrian Global (otomatis)
 * Fix: cache-bust + merge local/global agar order tidak hilang
 */
const GLOBAL_BIN_URL = "https://extendsclass.com/api/json-storage/bin/afbadde";
const LOCAL_ORDERS_KEY = "voxyy_orders";

function isGlobalConfigured() {
  return true;
}

function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function setLocalOrders(orders) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders || []));
  } catch (e) {
    console.warn("Gagal simpan local:", e);
  }
}

function normalizeOrders(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (typeof data.data === "string") {
      try {
        const parsed = JSON.parse(data.data);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (Array.isArray(data.record)) return data.record;
  }
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
}

/** Gabung 2 list by kode (yang lebih baru / lebih lengkap menang) */
function mergeOrders(primary, secondary) {
  const map = new Map();
  const put = (o) => {
    if (!o || !o.kode) return;
    const k = String(o.kode).toUpperCase();
    const prev = map.get(k);
    if (!prev) {
      map.set(k, o);
      return;
    }
    // prioritaskan yang punya createdAt lebih besar, atau status lebih "maju"
    const score = (x) => {
      let s = Number(x.createdAt) || 0;
      const st = String(x.status || "").toLowerCase();
      if (st.includes("sukses") || st.includes("selesai")) s += 1e15;
      else if (st.includes("proses") || st.includes("verifikasi")) s += 1e14;
      return s;
    };
    if (score(o) >= score(prev)) map.set(k, { ...prev, ...o });
  };
  (primary || []).forEach(put);
  (secondary || []).forEach(put);
  const list = Array.from(map.values());
  list.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
  return list;
}

async function fetchGlobalRaw() {
  const url = GLOBAL_BIN_URL + "?_=" + Date.now();
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store",
      Pragma: "no-cache"
    },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("GET " + res.status);
  const text = await res.text();
  try {
    return normalizeOrders(JSON.parse(text));
  } catch (e) {
    return normalizeOrders(text);
  }
}

async function pushGlobal(list) {
  const res = await fetch(GLOBAL_BIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(list),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("PUT " + res.status);
  // beberapa response ExtendsClass stringified
  try {
    await res.text();
  } catch (e) {}
  return true;
}

/** Ambil orders: merge global + local (jangan hapus local kalau global kosong/gagal) */
async function getOrders() {
  const local = getLocalOrders();
  try {
    const remote = await fetchGlobalRaw();
    const merged = mergeOrders(remote, local);
    setLocalOrders(merged);
    return merged;
  } catch (e) {
    console.warn("Global fetch gagal, pakai local:", e);
    return local;
  }
}

/** Simpan ke local dulu, lalu push global */
async function saveOrders(orders) {
  const list = Array.isArray(orders) ? orders : [];
  if (list.length > 300) list.length = 300;
  setLocalOrders(list);

  try {
    await pushGlobal(list);
    return { ok: true, mode: "global" };
  } catch (e) {
    console.error("Gagal push global:", e);
    // coba sekali lagi
    try {
      await new Promise((r) => setTimeout(r, 400));
      await pushGlobal(list);
      return { ok: true, mode: "global" };
    } catch (e2) {
      console.error("Retry gagal:", e2);
      return { ok: false, mode: "local", error: String(e2) };
    }
  }
}

async function addOrder(order) {
  if (!order || !order.kode) return { ok: false };

  // 1) langsung taruh di local dulu biar tidak hilang
  const localNow = getLocalOrders();
  const target = String(order.kode).toUpperCase();
  const li = localNow.findIndex(
    (o) => String(o.kode || "").toUpperCase() === target
  );
  if (li >= 0) localNow[li] = { ...localNow[li], ...order };
  else localNow.unshift(order);
  setLocalOrders(localNow);

  // 2) ambil remote + merge + push
  try {
    const remote = await fetchGlobalRaw();
    const merged = mergeOrders(remote, localNow);
    // pastikan order ini ada
    const mi = merged.findIndex(
      (o) => String(o.kode || "").toUpperCase() === target
    );
    if (mi >= 0) merged[mi] = { ...merged[mi], ...order };
    else merged.unshift(order);

    return await saveOrders(merged);
  } catch (e) {
    console.warn("addOrder remote gagal, local tetap aman:", e);
    // tetap coba push local saja
    try {
      await pushGlobal(localNow);
      return { ok: true, mode: "global" };
    } catch (e2) {
      return { ok: false, mode: "local", error: String(e2) };
    }
  }
}

async function updateOrderByKode(kode, patch) {
  if (!kode) return { ok: false };
  const target = String(kode).trim().toUpperCase();

  // update local dulu
  let local = getLocalOrders();
  let idx = local.findIndex(
    (o) => String(o.kode || "").toUpperCase() === target
  );
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...patch };
    setLocalOrders(local);
  }

  try {
    const remote = await fetchGlobalRaw();
    const merged = mergeOrders(remote, local);
    const mi = merged.findIndex(
      (o) => String(o.kode || "").toUpperCase() === target
    );
    if (mi < 0) {
      // order hanya ada di local
      if (idx >= 0) {
        return await saveOrders(merged.length ? mergeOrders(merged, local) : local);
      }
      return { ok: false, error: "not_found" };
    }
    merged[mi] = { ...merged[mi], ...patch };
    return await saveOrders(merged);
  } catch (e) {
    console.warn("update remote gagal:", e);
    if (idx >= 0) return { ok: false, mode: "local", error: String(e) };
    return { ok: false, error: "not_found" };
  }
}

async function updateOrderByIndex(index, patch) {
  const orders = await getOrders();
  if (!orders[index]) return { ok: false, error: "not_found" };
  return updateOrderByKode(orders[index].kode, patch);
}

async function deleteOrderByIndex(index) {
  const orders = await getOrders();
  if (!orders[index]) return { ok: false };
  return deleteOrderByKode(orders[index].kode);
}

async function deleteOrderByKode(kode) {
  if (!kode) return { ok: false };
  const target = String(kode).trim().toUpperCase();

  let local = getLocalOrders().filter(
    (o) => String(o.kode || "").toUpperCase() !== target
  );
  setLocalOrders(local);

  try {
    const remote = await fetchGlobalRaw();
    const merged = mergeOrders(remote, local).filter(
      (o) => String(o.kode || "").toUpperCase() !== target
    );
    return await saveOrders(merged);
  } catch (e) {
    try {
      await pushGlobal(local);
    } catch (e2) {}
    return { ok: false, mode: "local", error: String(e) };
  }
}

function findOrderByKodeInList(orders, kode) {
  if (!kode) return null;
  const target = String(kode).trim().toUpperCase();
  return (
    (orders || []).find(
      (o) => String(o.kode || "").toUpperCase() === target
    ) || null
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
