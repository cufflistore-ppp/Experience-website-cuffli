/* ELZKII JOKI — penyimpanan laporan transaksi (Firebase + fallback localStorage). */
(function () {
  "use strict";

  const LOCAL_KEY = "elzkii_laporan";
  let db = null;
  let ready = false;
  let reportsCache = [];
  const listeners = [];

  function getLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }

  function setLocal(arr) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(Array.isArray(arr) ? arr : [])); } catch (_) {}
  }

  function isAdminUser() {
    try {
      return !!(window.EJ && window.EJ.auth && window.EJ.isAdmin && window.EJ.isAdmin(window.EJ.auth.currentUser));
    } catch (_) { return false; }
  }

  function init() {
    if (ready) return true;
    try {
      db = window.EJ && window.EJ.db;
      if (!db) return false;
      ready = true;
      db.ref("reports").on("value", snap => {
        const val = snap.val() || {};
        reportsCache = Object.keys(val).map(id => ({ ...val[id], id }));
        reportsCache.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
        setLocal(reportsCache);
        listeners.forEach(fn => { try { fn(reportsCache); } catch (_) {} });
      }, err => console.warn("[ELZKII REPORTS] DB:", err));
      return true;
    } catch (e) {
      console.warn("[ELZKII REPORTS] init:", e);
      return false;
    }
  }

  function makeId() {
    return "RPT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  }

  async function addReport(report) {
    const payload = { ...report };
    payload.id = payload.id || makeId();
    payload.status = payload.status || "Menunggu";
    payload.createdAt = Number(payload.createdAt) || Date.now();
    payload.updatedAt = Date.now();

    const local = getLocal().filter(r => r.id !== payload.id);
    local.unshift(payload);
    setLocal(local);

    if (!init() || !db) return { ok: true, mode: "local", id: payload.id };
    try {
      const user = window.EJ && window.EJ.auth ? window.EJ.auth.currentUser : null;
      if (user) {
        payload.uid = user.uid;
        payload.email = user.email || "";
      }
      await db.ref("reports/" + payload.id).set(payload);
      return { ok: true, mode: "global", id: payload.id };
    } catch (e) {
      console.warn("[ELZKII REPORTS] save:", e);
      return { ok: false, mode: "local", id: payload.id, error: String(e) };
    }
  }

  async function getReports() {
    const local = getLocal();
    if (init() && db) {
      try {
        const snap = await db.ref("reports").once("value");
        const val = snap.val() || {};
        const list = Object.keys(val).map(id => ({ ...val[id], id }));
        list.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
        reportsCache = list;
        setLocal(list);
        return list;
      } catch (e) { console.warn("[ELZKII REPORTS] read:", e); }
    }
    return local.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
  }

  async function updateReport(id, patch) {
    if (!id) return { ok: false };
    const local = getLocal();
    const idx = local.findIndex(r => r.id === id);
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...patch, updatedAt: Date.now() };
      setLocal(local);
    }
    if (!init() || !db) return { ok: idx >= 0, mode: "local" };
    try {
      await db.ref("reports/" + id).update({ ...patch, updatedAt: Date.now() });
      return { ok: true, mode: "global" };
    } catch (e) {
      return { ok: idx >= 0, mode: "local", error: String(e) };
    }
  }

  async function deleteReport(id) {
    if (!id) return { ok: false };
    setLocal(getLocal().filter(r => r.id !== id));
    if (!init() || !db) return { ok: true, mode: "local" };
    try {
      await db.ref("reports/" + id).remove();
      return { ok: true, mode: "global" };
    } catch (e) {
      return { ok: false, mode: "local", error: String(e) };
    }
  }

  function onReportsChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
    init();
  }

  window.VoxyyReports = { addReport, getReports, updateReport, deleteReport, onReportsChange, isAdminUser };
})();
