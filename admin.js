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
  const next = { ...cur, ...obj };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  // Sync ke Firebase → semua device
  if (window.VoxyyOrders && typeof window.VoxyyOrders.saveSettingsGlobal === "function") {
    window.VoxyyOrders.saveSettingsGlobal(next).then(function (r) {
      console.log("[Admin] settings sync:", r && r.mode);
    }).catch(function () {});
  }
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
  if (window.VoxyyOrders && typeof window.VoxyyOrders.saveProdukGlobal === "function") {
    window.VoxyyOrders.saveProdukGlobal(list || []).then(function (r) {
      console.log("[Admin] produk sync:", r && r.mode);
    }).catch(function () {});
  }
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

  if (name === "dashboard")   // Ambil settings & produk dari Firebase dulu
  (async function () {
    try {
      if (window.VoxyyOrders) {
        window.VoxyyOrders.initFirebase && window.VoxyyOrders.initFirebase();
        if (window.VoxyyOrders.getSettings) {
          const s = await window.VoxyyOrders.getSettings();
          if (s) localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        }
        if (window.VoxyyOrders.getProdukGlobal) {
          const list = await window.VoxyyOrders.getProdukGlobal();
          if (list && list.length) localStorage.setItem(PRODUK_KEY, JSON.stringify(list));
        }
      }
    } catch (e) {}
    seedProdukIfEmpty();
    loadDashboard();
  })();
  if (name === "produk") loadProdukAdm();
  if (name === "pesanan") loadPesanan();
  if (name === "pembayaran") loadPembayaran();
  if (name === "keuntungan") loadKeuntungan();
  if (name === "tampilan") loadTampilan();
  if (name === "kirim") loadKirim();
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
      const st = (o.status || "").toLowerCase();
      const isNew = st.includes("belum") || st.includes("verifikasi") || st.includes("menunggu");
      const wa = (o.wa || o.whatsapp || "").replace(/\D/g, "");
      const border = isNew ? "border-color:#2196f3;box-shadow:0 0 0 1px rgba(33,150,243,0.35);" : "";
      return `<div class="order-card" style="${border}">
        <div class="row">
          <div>
            ${isNew ? '<span style="background:#1565c0;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;margin-right:6px;">BARU</span>' : ""}
            <strong>${escapeHtml(o.kode || "-")}</strong> · ${escapeHtml(o.nama || "Anonim")}
            <br><small style="color:#888;">${escapeHtml(o.paket || "-")} · ${escapeHtml(o.total || "-")}</small>
            <br><small style="color:#aaa;">${escapeHtml(String(o.waktu || o.createdAt || ""))}</small>
            ${wa ? `<br><a href="https://wa.me/${wa}" target="_blank" style="color:#25d366;font-size:12px;"><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(o.wa || o.whatsapp)}</a>` : ""}
            ${o.bukti ? `<br><a href="${escapeHtml(o.bukti)}" target="_blank" style="color:#2196f3;font-size:12px;">Lihat Bukti Bayar</a>` : ""}
            ${o.file || o.download ? `<br><small style="color:#a5d6a7;">File sudah dikirim</small>` : ""}
          </div>
          <div style="text-align:right;">
            <span class="badge-st ${cls}">${escapeHtml(o.status || "Belum Bayar")}</span>
            <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
              <button class="btn-adm success" style="margin:0;padding:5px 8px;font-size:11px;" onclick="ubahStatus('${escapeHtml(id)}','Sukses')">ACC</button>
              <button class="btn-adm" style="margin:0;padding:5px 8px;font-size:11px;background:#1565c0;" onclick="ubahStatus('${escapeHtml(id)}','Proses')">Proses</button>
              <button class="btn-adm" style="margin:0;padding:5px 8px;font-size:11px;background:#6a1b9a;" onclick="showPanel('kirim');document.getElementById('kirimKode').value='${escapeHtml(o.kode || "")}';cariOrderKirim();">Kirim File</button>
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
  alert("QRIS, rekening Pengaturan pembayaran disimpan! catatan disimpan ke Firebase — muncul di semua device!");
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
  const logo = s.logoUrl || "logo.png";
  const banner = s.bannerUrl || "banner.jpg";
  document.getElementById("logoUrl").value = logo;
  document.getElementById("bannerUrl").value = banner;
  const logoText = document.getElementById("logoUrlText");
  const bannerText = document.getElementById("bannerUrlText");
  if (logoText) logoText.value = logo.startsWith("data:") ? "" : (logo === "logo.png" ? "" : logo);
  if (bannerText) bannerText.value = banner.startsWith("data:") ? "" : (banner === "banner.jpg" ? "" : banner);
  const pl = document.getElementById("previewLogo");
  const pb = document.getElementById("previewBanner");
  if (pl) pl.src = logo;
  if (pb) pb.src = banner;
  document.getElementById("bgColorHex").value = s.bgColor || "#0a0e18";
  document.getElementById("bgColorCustom").value = s.bgColor || "#0a0e18";
}

/** Kompres foto ke JPEG base64 agar muat di Firebase */
function fileToDataUrl(file, maxW, maxKB) {
  return new Promise(function (resolve, reject) {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("File harus gambar"));
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        let w = img.width;
        let h = img.height;
        const max = maxW || 1200;
        if (w > max) {
          h = Math.round((h * max) / w);
          w = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        let quality = 0.85;
        let data = canvas.toDataURL("image/jpeg", quality);
        const limit = (maxKB || 400) * 1024;
        while (data.length > limit && quality > 0.4) {
          quality -= 0.1;
          data = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(data);
      };
      img.onerror = function () { reject(new Error("Gagal baca gambar")); };
      img.src = reader.result;
    };
    reader.onerror = function () { reject(new Error("Gagal baca file")); };
    reader.readAsDataURL(file);
  });
}

async function onPickLogo(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const data = await fileToDataUrl(file, 400, 150);
    document.getElementById("logoUrl").value = data;
    document.getElementById("previewLogo").src = data;
    const t = document.getElementById("logoUrlText");
    if (t) t.value = "";
  } catch (e) {
    alert(e.message || "Gagal upload logo");
  }
}

async function onPickBanner(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const data = await fileToDataUrl(file, 1200, 350);
    document.getElementById("bannerUrl").value = data;
    document.getElementById("previewBanner").src = data;
    const t = document.getElementById("bannerUrlText");
    if (t) t.value = "";
  } catch (e) {
    alert(e.message || "Gagal upload banner");
  }
}

function onLogoUrlText(v) {
  v = (v || "").trim();
  if (!v) return;
  document.getElementById("logoUrl").value = v;
  document.getElementById("previewLogo").src = v;
}

function onBannerUrlText(v) {
  v = (v || "").trim();
  if (!v) return;
  document.getElementById("bannerUrl").value = v;
  document.getElementById("previewBanner").src = v;
}

window.onPickLogo = onPickLogo;
window.onPickBanner = onPickBanner;
window.onLogoUrlText = onLogoUrlText;
window.onBannerUrlText = onBannerUrlText;


function pilihWarna(el) {
  document.querySelectorAll(".color-swatch").forEach((e) => e.classList.remove("active"));
  el.classList.add("active");
  const c = el.getAttribute("data-color");
  document.getElementById("bgColorHex").value = c;
  document.getElementById("bgColorCustom").value = c;
}

function simpanTampilan() {
  const bg = document.getElementById("bgColorHex").value.trim() || "#0a0e18";
  let logo = document.getElementById("logoUrl").value.trim() || "logo.png";
  let banner = document.getElementById("bannerUrl").value.trim() || "banner.jpg";
  const logoText = (document.getElementById("logoUrlText") || {}).value;
  const bannerText = (document.getElementById("bannerUrlText") || {}).value;
  if (logoText && String(logoText).trim()) logo = String(logoText).trim();
  if (bannerText && String(bannerText).trim()) banner = String(bannerText).trim();
  saveSettings({
    logoUrl: logo,
    bannerUrl: banner,
    bgColor: bg,
  });
  document.body.style.background = bg;
  localStorage.setItem("voxyy_bg_color", bg);
  const pl = document.getElementById("previewLogo");
  const pb = document.getElementById("previewBanner");
  if (pl) pl.src = logo;
  if (pb) pb.src = banner;
  alert("Foto logo & banner disimpan! Muncul di semua halaman & device.");
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
  alert("Nama toko Pengaturan disimpan! nomor WA disimpan ke Firebase — muncul di semua device!");
}


/* ========== KIRIM PRODUK ========== */
function loadKirim() {
  document.getElementById("kirimKode").value = "";
  document.getElementById("kirimInfo").innerHTML = "";
  document.getElementById("kirimPaket").value = "";
  document.getElementById("kirimFile").value = "";
  document.getElementById("kirimCatatan").value = "";
}

async function cariOrderKirim() {
  const kode = (document.getElementById("kirimKode").value || "").trim();
  if (!kode) { alert("Isi kode order"); return; }
  const orders = await fetchOrders();
  const found = orders.find(o => String(o.kode || "").toUpperCase() === kode.toUpperCase() || String(o._id || "") === kode);
  const info = document.getElementById("kirimInfo");
  if (!found) {
    info.innerHTML = '<span style="color:#ef9a9a;">Order tidak ditemukan.</span>';
    document.getElementById("kirimPaket").value = "";
    return;
  }
  window._kirimOrder = found;
  info.innerHTML = `<span style="color:#a5d6a7;">✓ Ditemukan</span><br>
    Nama: <b>${escapeHtml(found.nama || "-")}</b><br>
    WA: ${escapeHtml(found.wa || found.whatsapp || "-")}<br>
    Status: <b>${escapeHtml(found.status || "-")}</b><br>
    Total: ${escapeHtml(found.total || "-")}`;
  document.getElementById("kirimPaket").value = found.paket || found.judul || "";
  if (found.file) document.getElementById("kirimFile").value = found.file;
}

async function kirimProdukOrder() {
  const kode = (document.getElementById("kirimKode").value || "").trim();
  const file = (document.getElementById("kirimFile").value || "").trim();
  const jenis = document.getElementById("kirimJenis").value;
  const catatan = (document.getElementById("kirimCatatan").value || "").trim();
  const paket = (document.getElementById("kirimPaket").value || "").trim();
  if (!kode) { alert("Isi kode order"); return; }
  if (!file) { alert("Isi link unduhan / URL file"); return; }

  const orders = await fetchOrders();
  const found = orders.find(o => String(o.kode || "").toUpperCase() === kode.toUpperCase() || String(o._id || "") === kode);
  if (!found) { alert("Order tidak ditemukan. Cari dulu."); return; }

  const id = found._id || found.kode;
  const patch = {
    status: "Sukses",
    file: file,
    download: file,
    jenisFile: jenis,
    catatanAdmin: catatan,
    paket: paket || found.paket,
    dikirimAt: new Date().toLocaleString("id-ID"),
  };

  if (window.VoxyyOrders && typeof window.VoxyyOrders.updateOrder === "function") {
    await window.VoxyyOrders.updateOrder(id, patch);
  } else {
    const idx = orders.findIndex(o => (o._id || o.kode) === id);
    if (idx >= 0) {
      Object.assign(orders[idx], patch);
      localStorage.setItem("voxyy_orders", JSON.stringify(orders));
    }
  }

  // profit
  const settings = getSettings();
  const profit = parseRp(found.total) - (Number(found.modal) || Math.round(parseRp(found.total) * 0.3));
  settings.totalProfit = (Number(settings.totalProfit) || 0) + profit;
  saveSettings(settings);

  alert("Produk dikirim! Status order → Sukses. Pembeli bisa unduh di halaman Pesanan.");
  loadKirim();
  loadPesanan();
  loadDashboard();
}



function seedProdukIfEmpty() {
  let list = getProdukAdmin();
  if (list && list.length) return;
  list = [
    { id: "d1", judul: "APK Auto SV Kontak", kategori: "apk", harga: 2000, modal: 500, stok: 25, deskripsi: "Produk digital berkualitas.", img: "", file: "", status: "aktif" },
    { id: "d2", judul: "APK Logo Prem/Mod", kategori: "apk", harga: 3000, modal: 800, stok: 18, deskripsi: "Produk premium siap digunakan.", img: "", file: "", status: "aktif" },
    { id: "d3", judul: "Script Bot Jaga", kategori: "digital", harga: 7000, modal: 2000, stok: 12, deskripsi: "Script siap pakai.", img: "", file: "", status: "aktif" },
    { id: "d4", judul: "Nokos WA Indonesia", kategori: "digital", harga: 6000, modal: 3000, stok: 30, deskripsi: "Nokos WA Indonesia.", img: "", file: "", status: "aktif" },
    { id: "d5", judul: "Jasa Logo Teks", kategori: "jasa", harga: 2000, modal: 500, stok: -1, deskripsi: "Jasa desain logo teks.", img: "", file: "", status: "aktif" },
    { id: "d6", judul: "Murid Logo", kategori: "lainnya", harga: 5000, modal: 1500, stok: 10, deskripsi: "Paket murid logo.", img: "", file: "", status: "aktif" },
  ];
  saveProdukAdmin(list);
}

/* ========== INIT ========== */


const ADMIN_EMAILS = [
  "emailwebvixy@gmail.com",
  "voxymarket98@gmail.com"
];

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
}

function showAdminApp() {
  const gate = document.getElementById("adminLoginGate");
  const app = document.getElementById("adminApp");
  if (gate) gate.style.display = "none";
  if (app) app.style.display = "flex";
}

function showAdminGate(msg) {
  const gate = document.getElementById("adminLoginGate");
  const app = document.getElementById("adminApp");
  if (gate) gate.style.display = "flex";
  if (app) app.style.display = "none";
  const err = document.getElementById("adminLoginError");
  if (err) {
    if (msg) {
      err.style.display = "block";
      err.textContent = msg;
    } else {
      err.style.display = "none";
      err.textContent = "";
    }
  }
}

async function loginAdminGoogle() {
  const err = document.getElementById("adminLoginError");
  if (err) { err.style.display = "none"; err.textContent = ""; }
  try {
    if (!window.VoxyyAuth || typeof window.VoxyyAuth.loginGoogle !== "function") {
      showAdminGate("Auth belum siap. Refresh halaman.");
      return;
    }
    const user = await window.VoxyyAuth.loginGoogle();
    const email = (user && user.email) ? user.email.toLowerCase() : "";
    if (!isAdminEmail(email)) {
      if (window.VoxyyAuth.logout) await window.VoxyyAuth.logout();
      showAdminGate("Akses ditolak. Email " + email + " tidak diizinkan sebagai admin.");
      return;
    }
    localStorage.setItem("voxyy_admin_email", email);
    showAdminApp();
    bootAdminData();
  } catch (e) {
    showAdminGate("Gagal login: " + (e && e.message ? e.message : String(e)));
  }
}
window.loginAdminGoogle = loginAdminGoogle;

let _adminBooted = false;
function bootAdminData() {
  if (_adminBooted) {
    loadDashboard();
    return;
  }
  _adminBooted = true;

  (async function () {
    try {
      if (window.VoxyyOrders) {
        window.VoxyyOrders.initFirebase && window.VoxyyOrders.initFirebase();
        if (window.VoxyyOrders.getSettings) {
          const s = await window.VoxyyOrders.getSettings();
          if (s) localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        }
        if (window.VoxyyOrders.getProdukGlobal) {
          const list = await window.VoxyyOrders.getProdukGlobal();
          if (list && list.length) localStorage.setItem(PRODUK_KEY, JSON.stringify(list));
        }
      }
    } catch (e) {}
    seedProdukIfEmpty();
    loadDashboard();
  })();

  let _lastOrderCount = 0;
  if (window.VoxyyOrders && typeof window.VoxyyOrders.onOrdersChange === "function") {
    window.VoxyyOrders.onOrdersChange(function (list) {
      const orders = list || [];
      const pending = orders.filter(function (o) {
        const s = String(o.status || "").toLowerCase();
        return !s.includes("sukses") && !s.includes("selesai") && !s.includes("tolak");
      }).length;
      const navPesanan = document.querySelector('.admin-nav a[data-panel="pesanan"] span');
      if (navPesanan) {
        navPesanan.innerHTML = pending > 0
          ? 'Pesanan <span style="background:#e53935;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;margin-left:4px;">' + pending + "</span>"
          : "Pesanan";
      }
      if (_lastOrderCount && orders.length > _lastOrderCount) {
        const baru = orders.length - _lastOrderCount;
        document.title = "(" + baru + " order baru) VOXY ADMIN";
        try {
          if (document.hidden && Notification && Notification.permission === "granted") {
            new Notification("VOXY MARKET", { body: baru + " pesanan baru masuk", icon: "logo.png" });
          }
        } catch (e) {}
      }
      _lastOrderCount = orders.length;
      const active = document.querySelector(".panel-section.active");
      if (!active || active.id === "panel-dashboard") loadDashboard();
      if (active && active.id === "panel-pesanan") loadPesanan();
      if (active && active.id === "panel-keuntungan") loadKeuntungan();
    });
  }

  try {
    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }
  } catch (e) {}

  setInterval(function () {
    if (!_adminBooted) return;
    const active = document.querySelector(".panel-section.active");
    if (!active || active.id === "panel-dashboard") loadDashboard();
    if (active && active.id === "panel-pesanan") loadPesanan();
  }, 15000);
}

document.addEventListener("DOMContentLoaded", function () {
  const bg = localStorage.getItem("voxyy_bg_color");
  if (bg) document.body.style.background = bg;

  showAdminGate();

  try {
    if (window.VoxyyOrders) window.VoxyyOrders.initFirebase && window.VoxyyOrders.initFirebase();
  } catch (e) {}

  if (window.VoxyyAuth && typeof window.VoxyyAuth.onAuthStateChanged === "function") {
    window.VoxyyAuth.onAuthStateChanged(function (user) {
      const email = user && user.email ? user.email.toLowerCase() : "";
      if (user && isAdminEmail(email)) {
        localStorage.setItem("voxyy_admin_email", email);
        showAdminApp();
        bootAdminData();
      } else if (user && !isAdminEmail(email)) {
        if (window.VoxyyAuth.logout) window.VoxyyAuth.logout();
        showAdminGate("Akses ditolak untuk " + email);
      } else {
        showAdminGate();
      }
    });
  } else {
    // Auth script belum ready — tunggu sebentar
    let tries = 0;
    const wait = setInterval(function () {
      tries++;
      if (window.VoxyyAuth && window.VoxyyAuth.onAuthStateChanged) {
        clearInterval(wait);
        window.VoxyyAuth.onAuthStateChanged(function (user) {
          const email = user && user.email ? user.email.toLowerCase() : "";
          if (user && isAdminEmail(email)) {
            showAdminApp();
            bootAdminData();
          } else {
            showAdminGate(user ? ("Akses ditolak untuk " + email) : "");
          }
        });
      } else if (tries > 30) {
        clearInterval(wait);
        showAdminGate("Auth belum termuat. Refresh halaman.");
      }
    }, 200);
  }
});
