/**
 * VOXY ADMIN - Full Panel
 * Dashboard | Produk | Pesanan | Pembayaran | Keuntungan | Tampilan | Pengaturan
 */

const SETTINGS_KEY = "voxyy_settings";
const PRODUK_KEY = "voxyy_produk_admin";
const ADMIN_PASS_KEY = "voxyy_admin_pass";

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function saveSettings(obj) {
  const cur = getSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...cur, ...obj }));
}

function getProdukAdmin() {
  try {
    const raw = localStorage.getItem(PRODUK_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // default dari joki-produk jika ada
  return [];
}

function saveProdukAdmin(list) {
  localStorage.setItem(PRODUK_KEY, JSON.stringify(list || []));
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRp(n) {
  const num = Number(String(n).replace(/[^\d]/g, "")) || 0;
  return "Rp " + num.toLocaleString("id-ID");
}

function parseRp(str) {
  return Number(String(str || "").replace(/[^\d]/g, "")) || 0;
}

/* ========== PANEL SWITCH ========== */
function showPanel(name) {
  document.querySelectorAll(".panel-section").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".admin-nav a").forEach((el) => el.classList.remove("active"));
  const panel = document.getElementById("panel-" + name);
  if (panel) panel.classList.add("active");
  const link = document.querySelector(`.admin-nav a[data-panel="${name}"]`);
  if (link) link.classList.add("active");

  if (name === "dashboard") loadDashboard();
  if (name === "produk") loadProdukAdm();
  if (name === "pesanan") loadPesanan();
  if (name === "pembayaran") loadPembayaran();
  if (name === "keuntungan") loadKeuntungan();
  if (name === "tampilan") loadTampilan();
  if (name === "pengaturan") loadPengaturan();
}

/* ========== DASHBOARD ========== */
async function loadDashboard() {
  const orders = await fetchOrders();
  let pending = 0, sukses = 0, omzet = 0;
  orders.forEach((o) => {
    const st = (o.status || "").toLowerCase();
    if (st.includes("sukses") || st.includes("selesai")) {
      sukses++;
      omzet += parseRp(o.total);
    } else if (!st.includes("tolak")) {
      pending++;
    }
  });
  const settings = getSettings();
  const profit = Number(settings.totalProfit || 0) || Math.round(omzet * 0.4);

  document.getElementById("statSaldo").textContent = formatRp(profit);
  document.getElementById("statPenjualan").textContent = orders.length;
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statSukses").textContent = sukses;

  const box = document.getElementById("dashboardOrders");
  const recent = orders.slice().reverse().slice(0, 8);
  if (!recent.length) {
    box.innerHTML = '<p style="color:#888;">Belum ada transaksi.</p>';
    return;
  }
  box.innerHTML = recent
    .map((o) => {
      const cls = statusClass(o.status);
      return `<div class="order-card">
        <div class="row">
          <div>
            <strong>${escapeHtml(o.kode || "-")}</strong> · ${escapeHtml(o.nama || "Anonim")}
            <br><small style="color:#888;">${escapeHtml(o.paket || "-")} · ${escapeHtml(o.total || "-")}</small>
          </div>
          <span class="badge-st ${cls}">${escapeHtml(o.status || "Belum Bayar")}</span>
        </div>
      </div>`;
    })
    .join("");
}

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("sukses") || s.includes("selesai")) return "sukses";
  if (s.includes("proses") || s.includes("verifikasi")) return "proses";
  if (s.includes("tolak")) return "tolak";
  return "belum";
}

async function fetchOrders() {
  if (window.VoxyyOrders && typeof window.VoxyyOrders.getOrders === "function") {
    return await window.VoxyyOrders.getOrders();
  }
  try {
    return JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
  } catch (e) {
    return [];
  }
}

/* ========== PRODUK ========== */
function toggleFormProduk() {
  const f = document.getElementById("formProduk");
  f.style.display = f.style.display === "none" ? "block" : "none";
  if (f.style.display === "none") resetFormProduk();
}

function resetFormProduk() {
  document.getElementById("produkId").value = "";
  document.getElementById("produkJudul").value = "";
  document.getElementById("produkKategori").value = "joki";
  document.getElementById("produkHarga").value = "";
  document.getElementById("produkModal").value = "";
  document.getElementById("produkStok").value = "-1";
  document.getElementById("produkDeskripsi").value = "";
  document.getElementById("produkImg").value = "";
  document.getElementById("produkFile").value = "";
  document.getElementById("produkStatus").value = "aktif";
}

function loadProdukAdm() {
  const list = getProdukAdmin();
  const box = document.getElementById("listProdukAdm");
  if (!list.length) {
    box.innerHTML = '<p style="color:#888;">Belum ada produk. Klik Tambah Produk.</p>';
    return;
  }
  box.innerHTML = list
    .map(
      (p, i) => `
    <div class="produk-card-adm">
      <div class="row">
        <div>
          <strong>${escapeHtml(p.judul)}</strong>
          <span class="badge-st ${p.status === "aktif" ? "sukses" : "tolak"}">${p.status}</span>
          <br><small style="color:#888;">${escapeHtml(p.kategori)} · ${formatRp(p.harga)} · Stok: ${p.stok == -1 ? "∞" : p.stok}</small>
          <br><small style="color:#666;">${escapeHtml(p.deskripsi || "").substring(0, 80)}</small>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn-adm outline" style="margin:0;padding:6px 10px;" onclick="editProduk(${i})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-adm danger" style="margin:0;padding:6px 10px;" onclick="hapusProduk(${i})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>`
    )
    .join("");
}

function simpanProduk() {
  const id = document.getElementById("produkId").value;
  const item = {
    id: id || "p" + Date.now(),
    judul: document.getElementById("produkJudul").value.trim(),
    kategori: document.getElementById("produkKategori").value,
    harga: Number(document.getElementById("produkHarga").value) || 0,
    modal: Number(document.getElementById("produkModal").value) || 0,
    stok: Number(document.getElementById("produkStok").value),
    deskripsi: document.getElementById("produkDeskripsi").value.trim(),
    img: document.getElementById("produkImg").value.trim() || "logo.png",
    file: document.getElementById("produkFile").value.trim(),
    status: document.getElementById("produkStatus").value,
  };
  if (!item.judul) {
    alert("Judul wajib diisi");
    return;
  }
  let list = getProdukAdmin();
  if (id) {
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
  } else {
    list.push(item);
  }
  saveProdukAdmin(list);
  // sync ke joki catalog jika window ada
  try {
    localStorage.setItem("voxyy_joki_catalog", JSON.stringify(list.filter((p) => p.status === "aktif")));
  } catch (e) {}
  toggleFormProduk();
  loadProdukAdm();
  alert("Produk disimpan!");
}

function editProduk(i) {
  const list = getProdukAdmin();
  const p = list[i];
  if (!p) return;
  document.getElementById("produkId").value = p.id;
  document.getElementById("produkJudul").value = p.judul || "";
  document.getElementById("produkKategori").value = p.kategori || "joki";
  document.getElementById("produkHarga").value = p.harga || 0;
  document.getElementById("produkModal").value = p.modal || 0;
  document.getElementById("produkStok").value = p.stok ?? -1;
  document.getElementById("produkDeskripsi").value = p.deskripsi || "";
  document.getElementById("produkImg").value = p.img || "";
  document.getElementById("produkFile").value = p.file || "";
  document.getElementById("produkStatus").value = p.status || "aktif";
  document.getElementById("formProduk").style.display = "block";
}

function hapusProduk(i) {
  if (!confirm("Hapus produk ini?")) return;
  let list = getProdukAdmin();
  list.splice(i, 1);
  saveProdukAdmin(list);
  loadProdukAdm();
}

/* ========== PESANAN ========== */
function toggleFormOrder() {
  const f = document.getElementById("formOrder");
  f.style.display = f.style.display === "none" ? "block" : "none";
}

async function loadPesanan() {
  const orders = await fetchOrders();
  const filter = (document.getElementById("filterStatus") || {}).value || "all";
  let filtered = orders;
  if (filter !== "all") {
    filtered = orders.filter((o) => (o.status || "").toLowerCase().includes(filter.toLowerCase().split(" ")[0]));
  }
  const box = document.getElementById("listOrders");
  if (!filtered.length) {
    box.innerHTML = '<p style="color:#888;">Tidak ada pesanan.</p>';
    return;
  }
  box.innerHTML = filtered
    .slice()
    .reverse()
    .map((o) => {
      const cls = statusClass(o.status);
      const id = o._id || o.kode || "";
      return `<div class="order-card">
        <div class="row">
          <div>
            <strong>${escapeHtml(o.kode || "-")}</strong> · ${escapeHtml(o.nama || "Anonim")}
            <br><small style="color:#888;">WA: ${escapeHtml(o.wa || o.whatsapp || "-")} · ${escapeHtml(o.paket || "-")}</small>
            <br><small style="color:#aaa;">${escapeHtml(o.total || "-")} · ${escapeHtml(o.waktu || o.createdAt || "")}</small>
            ${o.bukti ? `<br><a href="${escapeHtml(o.bukti)}" target="_blank" style="color:#2196f3;font-size:12px;">Lihat Bukti Bayar</a>` : ""}
          </div>
          <div style="text-align:right;">
            <span class="badge-st ${cls}">${escapeHtml(o.status || "Belum Bayar")}</span>
            <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
              <button class="btn-adm success" style="margin:0;padding:5px 8px;font-size:11px;" onclick="ubahStatus('${escapeHtml(id)}','Sukses')">ACC</button>
              <button class="btn-adm" style="margin:0;padding:5px 8px;font-size:11px;background:#1565c0;" onclick="ubahStatus('${escapeHtml(id)}','Proses')">Proses</button>
              <button class="btn-adm danger" style="margin:0;padding:5px 8px;font-size:11px;" onclick="ubahStatus('${escapeHtml(id)}','Ditolak')">Tolak</button>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

async function ubahStatus(id, status) {
  if (!id) return;
  if (window.VoxyyOrders && typeof window.VoxyyOrders.updateOrder === "function") {
    await window.VoxyyOrders.updateOrder(id, { status });
  } else {
    let orders = await fetchOrders();
    const idx = orders.findIndex((o) => (o._id || o.kode) === id);
    if (idx >= 0) {
      orders[idx].status = status;
      localStorage.setItem("voxyy_orders", JSON.stringify(orders));
    }
  }
  // hitung profit jika sukses
  if (status === "Sukses") {
    const orders = await fetchOrders();
    const o = orders.find((x) => (x._id || x.kode) === id);
    if (o) {
      const settings = getSettings();
      const profit = parseRp(o.total) - (Number(o.modal) || Math.round(parseRp(o.total) * 0.3));
      settings.totalProfit = (Number(settings.totalProfit) || 0) + profit;
      saveSettings(settings);
    }
  }
  loadPesanan();
  loadDashboard();
}

async function tambahOrderAdmin() {
  const kode =
    document.getElementById("admKode").value.trim() ||
    "VJ-" + new Date().getFullYear() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const order = {
    kode,
    nama: document.getElementById("admNama").value.trim() || "Anonim",
    wa: document.getElementById("admWA").value.trim(),
    paket: document.getElementById("admPaket").value.trim() || "Manual",
    total: document.getElementById("admTotal").value.trim() || "Rp 0",
    status: document.getElementById("admStatus").value,
    waktu: new Date().toLocaleString("id-ID"),
    createdAt: Date.now(),
  };
  if (window.VoxyyOrders && typeof window.VoxyyOrders.addOrder === "function") {
    await window.VoxyyOrders.addOrder(order);
  } else {
    let orders = await fetchOrders();
    orders.push(order);
    localStorage.setItem("voxyy_orders", JSON.stringify(orders));
  }
  toggleFormOrder();
  loadPesanan();
  loadDashboard();
  alert("Pesanan ditambahkan: " + kode);
}

/* ========== PEMBAYARAN ========== */
function loadPembayaran() {
  const s = getSettings();
  document.getElementById("qrisUrl").value = s.qrisUrl || "qris.png";
  document.getElementById("rekeningInfo").value = s.rekeningInfo || "";
  document.getElementById("catatanBayar").value = s.catatanBayar || "";
  document.getElementById("previewQris").src = s.qrisUrl || "qris.png";
}

function simpanPembayaran() {
  const qris = document.getElementById("qrisUrl").value.trim() || "qris.png";
  saveSettings({
    qrisUrl: qris,
    rekeningInfo: document.getElementById("rekeningInfo").value.trim(),
    catatanBayar: document.getElementById("catatanBayar").value.trim(),
  });
  document.getElementById("previewQris").src = qris;
  alert("Pengaturan pembayaran disimpan!");
}

/* ========== KEUNTUNGAN ========== */
async function loadKeuntungan() {
  const orders = await fetchOrders();
  const produk = getProdukAdmin();
  let omzet = 0,
    modal = 0,
    profit = 0;
  const items = [];
  orders.forEach((o) => {
    const st = (o.status || "").toLowerCase();
    if (!(st.includes("sukses") || st.includes("selesai"))) return;
    const total = parseRp(o.total);
    const mod = Number(o.modal) || (() => {
      const p = produk.find((x) => (x.judul || "").toLowerCase() === (o.paket || "").toLowerCase());
      return p ? p.modal : Math.round(total * 0.3);
    })();
    const pr = total - mod;
    omzet += total;
    modal += mod;
    profit += pr;
    items.push({ ...o, modal: mod, profit: pr });
  });
  document.getElementById("keuntunganTotal").textContent = formatRp(profit);
  document.getElementById("keuntunganModal").textContent = formatRp(modal);
  document.getElementById("keuntunganOmzet").textContent = formatRp(omzet);
  saveSettings({ totalProfit: profit });

  const box = document.getElementById("listProfit");
  if (!items.length) {
    box.innerHTML = '<p style="color:#888;">Belum ada transaksi sukses.</p>';
    return;
  }
  box.innerHTML = items
    .reverse()
    .map(
      (o) => `
    <div class="order-card">
      <div class="row">
        <div>
          <strong>${escapeHtml(o.kode)}</strong> · ${escapeHtml(o.paket || "-")}
          <br><small style="color:#888;">Jual: ${formatRp(parseRp(o.total))} · Modal: ${formatRp(o.modal)}</small>
        </div>
        <div style="color:#43a047;font-weight:700;">+${formatRp(o.profit)}</div>
      </div>
    </div>`
    )
    .join("");
}

/* ========== TAMPILAN ========== */
function loadTampilan() {
  const s = getSettings();
  document.getElementById("logoUrl").value = s.logoUrl || "logo.png";
  document.getElementById("bannerUrl").value = s.bannerUrl || "banner.jpg";
  document.getElementById("bgColorHex").value = s.bgColor || "#0a0e18";
  document.getElementById("bgColorCustom").value = s.bgColor || "#0a0e18";
}

function pilihWarna(el) {
  document.querySelectorAll(".color-swatch").forEach((e) => e.classList.remove("active"));
  el.classList.add("active");
  const c = el.getAttribute("data-color");
  document.getElementById("bgColorHex").value = c;
  document.getElementById("bgColorCustom").value = c;
}

function simpanTampilan() {
  const bg = document.getElementById("bgColorHex").value.trim() || "#0a0e18";
  saveSettings({
    logoUrl: document.getElementById("logoUrl").value.trim() || "logo.png",
    bannerUrl: document.getElementById("bannerUrl").value.trim() || "banner.jpg",
    bgColor: bg,
  });
  // apply immediately
  document.body.style.background = bg;
  localStorage.setItem("voxyy_bg_color", bg);
  alert("Tampilan disimpan! Background akan diterapkan di website.");
}

/* ========== PENGATURAN ========== */
function loadPengaturan() {
  const s = getSettings();
  document.getElementById("namaToko").value = s.namaToko || "Voxyy";
  document.getElementById("waAdmin").value = s.waAdmin || "6285151982250";
  document.getElementById("waBackup").value = s.waBackup || "6285706128277";
}

function simpanPengaturan() {
  const pass = document.getElementById("adminPass").value.trim();
  const data = {
    namaToko: document.getElementById("namaToko").value.trim() || "Voxyy",
    waAdmin: document.getElementById("waAdmin").value.trim(),
    waBackup: document.getElementById("waBackup").value.trim(),
  };
  if (pass) {
    localStorage.setItem(ADMIN_PASS_KEY, pass);
  }
  saveSettings(data);
  alert("Pengaturan disimpan!");
}

/* ========== INIT ========== */
document.addEventListener("DOMContentLoaded", () => {
  // simple password gate
  const savedPass = localStorage.getItem(ADMIN_PASS_KEY);
  if (savedPass) {
    const input = prompt("Password Admin:");
    if (input !== savedPass) {
      alert("Password salah!");
      window.location.href = "index.html";
      return;
    }
  }
  // apply saved bg
  const bg = localStorage.getItem("voxyy_bg_color");
  if (bg) document.body.style.background = bg;

  loadDashboard();

  // realtime refresh if firebase
  if (window.VoxyyOrders && typeof window.VoxyyOrders.onOrdersChange === "function") {
    window.VoxyyOrders.onOrdersChange(() => {
      const active = document.querySelector(".panel-section.active");
      if (active && active.id === "panel-dashboard") loadDashboard();
      if (active && active.id === "panel-pesanan") loadPesanan();
      if (active && active.id === "panel-keuntungan") loadKeuntungan();
    });
  }
});
