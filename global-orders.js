/**
 * VOXYY JOKI - Antrian Global
 * Backend: crudcrud.com (CORS OK, data benar-benar tersimpan)
 * Setiap order = 1 record. Semua HP share endpoint yang sama.
 */
const CRUD_BASE =
  "https://crudcrud.com/api/bbf20bab779843cdbd4e72618f9d6d75/orders";
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
  } catch (e) {}
}

function stripId(order) {
  if (!order || typeof order !== "object") return order;
  const copy = { ...order };
  delete copy._id;
  return copy;
}

function sortOrders(list) {
  return (list || []).slice().sort((a, b) => {
    return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
  });
}

async function fetchRemoteOrders() {
  const res = await fetch(CRUD_BASE + "?_=" + Date.now(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("GET " + res.status);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Ambil semua order global */
async function getOrders() {
  try {
    const remote = await fetchRemoteOrders();
    const sorted = sortOrders(remote);
    setLocalOrders(sorted.map(stripId));
    return sorted;
  } catch (e) {
    console.warn("Global GET gagal, pakai local:", e);
    return getLocalOrders();
  }
}

/** Tambah order baru (POST). Kalau kode sudah ada → update */
async function addOrder(order) {
  if (!order || !order.kode) return { ok: false };

  // local dulu
  const local = getLocalOrders();
  const t = String(order.kode).toUpperCase();
  const li = local.findIndex(
    (o) => String(o.kode || "").toUpperCase() === t
  );
  if (li >= 0) local[li] = { ...local[li], ...stripId(order) };
  else local.unshift(stripId(order));
  setLocalOrders(local);

  try {
    const remote = await fetchRemoteOrders();
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
    return { ok: true, mode: "global", action: "create" };
  } catch (e) {
    console.error("addOrder global gagal:", e);
    return { ok: false, mode: "local", error: String(e) };
  }
}

async function updateOrderByKode(kode, patch) {
  if (!kode) return { ok: false };
  const t = String(kode).trim().toUpperCase();

  // local
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
      // belum ada di remote → create
      if (li >= 0) {
        const res = await fetch(CRUD_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stripId(local[li]))
        });
        if (!res.ok) throw new Error("POST " + res.status);
        return { ok: true, mode: "global", action: "create" };
      }
      return { ok: false, error: "not_found" };
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
    console.error("updateOrder gagal:", e);
    return { ok: false, mode: "local", error: String(e) };
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

    const res = await fetch(CRUD_BASE + "/" + existing._id, {
      method: "DELETE"
    });
    if (!res.ok && res.status !== 404) throw new Error("DELETE " + res.status);
    return { ok: true, mode: "global" };
  } catch (e) {
    console.error("deleteOrder gagal:", e);
    return { ok: false, mode: "local", error: String(e) };
  }
}

async function deleteOrderByIndex(index) {
  const orders = await getOrders();
  if (!orders[index]) return { ok: false };
  return deleteOrderByKode(orders[index].kode);
}

/** saveOrders: sync full list (jarang dipakai; push yang belum ada) */
async function saveOrders(orders) {
  const list = Array.isArray(orders) ? orders : [];
  setLocalOrders(list.map(stripId));
  try {
    const remote = await fetchRemoteOrders();
    const remoteMap = new Map(
      remote.map((o) => [String(o.kode || "").toUpperCase(), o])
    );
    for (const o of list) {
      if (!o || !o.kode) continue;
      const k = String(o.kode).toUpperCase();
      const ex = remoteMap.get(k);
      if (ex && ex._id) {
        await fetch(CRUD_BASE + "/" + ex._id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stripId({ ...ex, ...o }))
        });
      } else {
        await fetch(CRUD_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stripId(o))
        });
      }
    }
    return { ok: true, mode: "global" };
  } catch (e) {
    return { ok: false, mode: "local", error: String(e) };
  }
}

function findOrderByKodeInList(orders, kode) {
  if (!kode) return null;
  const t = String(kode).trim().toUpperCase();
  return (
    (orders || []).find((o) => String(o.kode || "").toUpperCase() === t) ||
    null
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
