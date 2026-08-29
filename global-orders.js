/**
 * VOXYY JOKI - Antrian Global (otomatis, tanpa setup)
 * Semua order dari HP/browser manapun muncul di antrian bersama.
 * Penyimpanan: ExtendsClass JSON Storage (gratis, CORS OK)
 */
const GLOBAL_BIN_URL = "https://extendsclass.com/api/json-storage/bin/ffeecbb";
const LOCAL_ORDERS_KEY = "voxyy_orders";

function isGlobalConfigured() {
  return true; // selalu global
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
    console.warn("Gagal simpan local orders:", e);
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

/** Ambil semua pesanan global */
async function getOrders() {
  try {
    const res = await fetch(GLOBAL_BIN_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    if (!res.ok) {
      console.warn("Global fetch gagal:", res.status);
      return getLocalOrders();
    }
    const raw = await res.json();
    const orders = normalizeOrders(raw);
    setLocalOrders(orders);
    return orders;
  } catch (e) {
    console.warn("Global orders error, pakai local:", e);
    return getLocalOrders();
  }
}

/** Simpan list pesanan ke global + local */
async function saveOrders(orders) {
  const list = Array.isArray(orders) ? orders : [];
  setLocalOrders(list);

  try {
    const res = await fetch(GLOBAL_BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(list)
    });
    if (!res.ok) {
      console.error("Gagal simpan global:", res.status);
      return { ok: false, mode: "local", error: res.status };
    }
    return { ok: true, mode: "global" };
  } catch (e) {
    console.error("Gagal simpan global:", e);
    return { ok: false, mode: "local", error: String(e) };
  }
}

/** Tambah 1 pesanan */
async function addOrder(order) {
  if (!order || !order.kode) return { ok: false };
  const orders = await getOrders();
  const target = String(order.kode).toUpperCase();
  const exists = orders.findIndex(
    (o) => String(o.kode || "").toUpperCase() === target
  );
  if (exists >= 0) {
    orders[exists] = { ...orders[exists], ...order };
  } else {
    orders.unshift(order);
  }
  if (orders.length > 300) orders.length = 300;
  return saveOrders(orders);
}

/** Update by kode */
async function updateOrderByKode(kode, patch) {
  if (!kode) return { ok: false };
  const target = String(kode).trim().toUpperCase();
  const orders = await getOrders();
  const idx = orders.findIndex(
    (o) => String(o.kode || "").toUpperCase() === target
  );
  if (idx < 0) return { ok: false, error: "not_found" };
  orders[idx] = { ...orders[idx], ...patch };
  return saveOrders(orders);
}

/** Update by index */
async function updateOrderByIndex(index, patch) {
  const orders = await getOrders();
  if (!orders[index]) return { ok: false, error: "not_found" };
  orders[index] = { ...orders[index], ...patch };
  return saveOrders(orders);
}

/** Hapus by index */
async function deleteOrderByIndex(index) {
  const orders = await getOrders();
  if (!orders[index]) return { ok: false };
  orders.splice(index, 1);
  return saveOrders(orders);
}

/** Hapus by kode */
async function deleteOrderByKode(kode) {
  if (!kode) return { ok: false };
  const target = String(kode).trim().toUpperCase();
  const orders = await getOrders();
  const idx = orders.findIndex(
    (o) => String(o.kode || "").toUpperCase() === target
  );
  if (idx < 0) return { ok: false, error: "not_found" };
  orders.splice(idx, 1);
  return saveOrders(orders);
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
