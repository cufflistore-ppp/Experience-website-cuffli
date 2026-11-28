// ========== TOP NOTIF (hanya muncul jika ada order real) ==========
function formatRupiah(n) {
  if (typeof n === "string" && n.includes("Rp")) return n;
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function isNotifHidden() {
  return localStorage.getItem("voxyy_notif_hidden") === "1";
}

function hideAllNotif() {
  localStorage.setItem("voxyy_notif_hidden", "1");
  const el = document.getElementById("topNotif");
  if (el) {
    el.style.display = "none";
    el.innerHTML = "";
  }
}

function getRecentOrdersForNotif() {
  const orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
  // Hanya order real (punya kode NJ)
  return orders.filter(o => o && o.kode && String(o.kode).startsWith("DJ-")).slice(0, 5);
}

function generateNotifFromOrder(order) {
  if (!order) return "";
  const shortName = (order.nama || "A").substring(0, 1) + "****";
  const price = order.total || order.finalAmount || "Rp 5.000";
  const priceText = typeof price === "number" ? formatRupiah(price) : price;
  const svc = order.paket || "Joki Kontak";
  let timeText = "baru saja";
  try {
    if (order.createdAt) {
      const diffMin = Math.floor((Date.now() - order.createdAt) / 60000);
      if (diffMin < 1) timeText = "baru saja";
      else if (diffMin < 60) timeText = diffMin + " mnt lalu";
      else timeText = Math.floor(diffMin / 60) + " jam lalu";
    }
  } catch(e) {}
  return `<div class="notif-item">
    <span class="notif-icon">🛒</span>
    <span class="notif-text"><b>Beli</b> · ${shortName}. · <b>${priceText}</b> · ${svc} · <span class="time">${timeText}</span></span>
    <button type="button" class="notif-close" onclick="hideAllNotif()" title="Tutup notifikasi">×</button>
  </div>`;
}

function updateTopNotif() {
  const el = document.getElementById("topNotif");
  if (!el) return;

  // Kalau user sudah tutup notif, jangan tampilkan lagi
  if (isNotifHidden()) {
    el.style.display = "none";
    el.innerHTML = "";
    return;
  }

  const recent = getRecentOrdersForNotif();
  if (recent.length === 0) {
    // Tidak ada order real → sembunyikan notif
    el.style.display = "none";
    el.innerHTML = "";
    return;
  }

  el.style.display = "block";
  // Tampilkan order terbaru, berganti setiap beberapa detik
  const idx = Math.floor(Date.now() / 8000) % recent.length;
  el.innerHTML = generateNotifFromOrder(recent[idx]);
}

// Jalankan saat load & setiap 8 detik
document.addEventListener("DOMContentLoaded", function() {
  updateTopNotif();
  setInterval(updateTopNotif, 8000);
});

// ========== ORDER FORM ==========
// ========== ORDER FORM ==========
let baseHarga = 5000;
let addonTotal = 0;

function openOrder(hari) {
  baseHarga = hari === 1 ? 5000 : 10000;
  const form = document.getElementById("orderForm");
  if (form) {
    form.classList.remove("hidden");
    const hargaEl = document.getElementById("hargaPaket");
    if (hargaEl) hargaEl.textContent = formatRupiah(baseHarga);
    updateTotal();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function toggleAddon(el, price) {
  el.classList.toggle("selected");
  if (el.classList.contains("selected")) {
    addonTotal += price;
    el.querySelector(".btn-pilih").textContent = "Dipilih";
  } else {
    addonTotal -= price;
    el.querySelector(".btn-pilih").textContent = "Pilih";
  }
  updateTotal();
}

function updateTotal() {
  const total = baseHarga + addonTotal;
  const el = document.getElementById("totalHarga");
  if (el) el.textContent = formatRupiah(total);
}

async function buatPesanan() {
  const nama = document.getElementById("nama")?.value?.trim() || "";
  const wa = document.getElementById("wa")?.value?.trim() || "";
  let catatan = document.getElementById("catatan")?.value || "";

  // Validasi field wajib untuk Joki Kontak
  if (!nama || !wa) {
    showSiteModal("Lengkapi field wajib: Nama (Store/JB) dan Nomor WhatsApp.", "warning");
    return;
  }
  if (wa.replace(/\D/g, "").length < 10) {
    showSiteModal("Nomor WhatsApp tidak valid. Masukkan minimal 10 digit.", "warning");
    return;
  }

  // Auto replace placeholder
  if (catatan.includes("NAMA STORE")) {
    catatan = catatan.replace(/NAMA STORE/g, nama);
  }
  if (catatan.includes("628…") || catatan.includes("628...")) {
    let nomor = wa.replace(/^0/, "62").replace(/\D/g, "");
    if (nomor.length < 10) nomor = "628xxxxxxxxxx";
    catatan = catatan.replace(/628…|628\.\.\./g, nomor);
  }

  const total = document.getElementById("totalHarga")?.textContent || "Rp 5.000";
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = String(Date.now()).slice(-3);
  const kode = `DJ-2026-${rand}${timePart}`;

  const isJokiOrder = String(window.orderType || "").toLowerCase().includes("joki");
  let order = {
    kode,
    nama,
    wa,
    catatan,
    formatJoki: catatan,
    total,
    paket: (window.orderPaketName || window.orderType || "Joki Kontak"),
    // Semua pesanan wajib melewati pembayaran dan upload bukti TF terlebih dahulu.
    status: "Belum Bayar",
    jenisOrder: isJokiOrder ? "Joki Kontak" : (window.orderType || "Produk"),
    waktu: new Date().toLocaleString("id-ID")
  };

  // Simpan waktu order
  order.createdAt = Date.now();
  order.finalAmount = Number(String(total).replace(/[^\d]/g, "")) || 0;

  // Simpan ke global (jika setup) + localStorage
  if (window.VoxyyOrders && typeof window.VoxyyOrders.addOrder === "function") {
    await window.VoxyyOrders.addOrder(order);
  } else {
    let orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("voxyy_orders", JSON.stringify(orders));
  }
  if (kode) localStorage.setItem("voxyy_saved_kode", kode);

  // Reset form fields setelah data pesanan berhasil disimpan.
  const namaEl = document.getElementById("nama");
  const waEl = document.getElementById("wa");
  if (namaEl) namaEl.value = "";
  if (waEl) waEl.value = "";

  // Semua jenis pesanan menuju pembayaran; belum tampil di antrian sebelum bukti TF dikonfirmasi.
  window.location.href = `pembayaran.html?kode=${encodeURIComponent(kode)}&total=${encodeURIComponent(total)}`;
}

// ========== LAPORAN ==========
async function kirimLaporan() {
  const noPesanan = document.getElementById("noPesanan")?.value || "-";
  const judul = document.getElementById("judulLaporan")?.value || "-";
  const deskripsi = document.getElementById("deskripsiLaporan")?.value || "-";
  const fileInput = document.getElementById("fotoLaporan");

  if (!judul || judul === "-" || !deskripsi || deskripsi === "-") {
    if (typeof showSiteModal === "function") {
      showSiteModal("Isi judul dan deskripsi laporan terlebih dahulu.", "warning");
    } else {
      alert("Isi judul dan deskripsi laporan terlebih dahulu.");
    }
    return;
  }

  const data = { noPesanan, judul, deskripsi };
  const files = fileInput ? Array.from(fileInput.files).slice(0, 3) : [];

  // Tetap coba kirim ke Telegram jika ada
  if (typeof kirimLaporanKeTelegram === "function") {
    try { await kirimLaporanKeTelegram(data, files); } catch (e) {}
  }

  // Langsung buka WhatsApp admin dengan isi laporan
  const adminWA = "6285190843300";
  const pesan =
    `*LAPORAN TRANSAKSI - DOXY JOKI*\n\n` +
    `Nomor Pesanan: ${noPesanan}\n` +
    `Judul: ${judul}\n` +
    `Deskripsi:\n${deskripsi}\n\n` +
    (files.length ? `(Ada ${files.length} foto pendukung - kirim manual jika perlu)\n` : "") +
    `Dikirim dari website Doxy Joki.`;
  const url = `https://wa.me/${adminWA}?text=${encodeURIComponent(pesan)}`;
  if (window.top) window.top.location.href = url;
  else window.location.href = url;
}

// ========== Custom Animated Modal ==========
function showSiteModal(message, type = "warning") {
  // Hapus modal lama jika ada
  const old = document.querySelector(".site-modal-overlay");
  if (old) old.remove();

  const icons = {
    warning: '<i class="fa-solid fa-exclamation"></i>',
    success: '<i class="fa-solid fa-check"></i>',
    info: '<i class="fa-solid fa-info"></i>'
  };
  const titles = {
    warning: "Perhatian",
    success: "Berhasil",
    info: "Informasi"
  };

  const overlay = document.createElement("div");
  overlay.className = "site-modal-overlay";
  overlay.innerHTML = `
    <div class="site-modal">
      <div class="site-modal-icon ${type}">${icons[type] || icons.warning}</div>
      <div class="site-modal-title">${titles[type] || "Perhatian"}</div>
      <div class="site-modal-msg">${message}</div>
      <button type="button" class="site-modal-btn ${type === "warning" ? "danger" : ""}">Oke</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger animation
  requestAnimationFrame(() => {
    overlay.classList.add("show");
  });

  const close = () => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 280);
  };

  overlay.querySelector(".site-modal-btn").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}

// Alias biar kompatibel dengan kode lama
window.showSiteModal = showSiteModal;
window.showNiceAlert = function(msg) {
  showSiteModal(msg, "warning");
};


/* ========== MAINTENANCE MODE ========== */
const DOXY_ADMIN_WA = "6285190843300";
const MAINT_KEY = "voxyy_maintenance";
let _maintListening = false;
let _maintCurrent = null; // null | true | false

function isAdminPage() {
  try {
    const path = (location.pathname || "").toLowerCase();
    const page = (location.href || "").toLowerCase();
    return path.includes("admin.html") || page.includes("admin.html") || path.includes("edit-produk");
  } catch (e) {
    return false;
  }
}

function readMaintLocal() {
  try {
    return localStorage.getItem(MAINT_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function writeMaintLocal(on) {
  try {
    localStorage.setItem(MAINT_KEY, on ? "1" : "0");
  } catch (e) {}
}

function buildMaintOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "maintenanceOverlay";
  overlay.setAttribute("aria-live", "polite");
  overlay.innerHTML = `
    <div class="maint-wrap">
      <div class="maint-card">
        <img class="maint-logo" src="logo.jpg" alt="Doxy Joki" onerror="this.onerror=null;this.src='logo-produk.jpg'">
        <div class="maint-badge"><i class="fa-solid fa-shield-halved"></i></div>
        <div class="maint-label">Maintenance</div>
        <h2 class="maint-title">Doxy sedang<br>maintenance</h2>
        <p class="maint-sub">Mohon maaf atas ketidaknyamanan anda</p>
        <p class="maint-thanks">Terima kasih telah menunggu, kami akan segera online.</p>
      </div>
    </div>
  `;
  return overlay;
}

function showMaintenance(animated) {
  if (isAdminPage()) return;
  document.documentElement.classList.add("is-maintenance");
  document.body.classList.add("is-maintenance");

  let overlay = document.getElementById("maintenanceOverlay");
  if (!overlay) {
    overlay = buildMaintOverlay();
    document.body.appendChild(overlay);
    // force reflow then show
    void overlay.offsetWidth;
  }
  // always clean enter
  overlay.classList.remove("maint-out");
  if (animated !== false) {
    overlay.classList.add("maint-in");
  } else {
    overlay.classList.add("maint-show");
  }
  // Hide underlying UI
  try {
    document.body.style.overflow = "hidden";
  } catch (e) {}
}

function hideMaintenance(animated) {
  document.documentElement.classList.remove("is-maintenance");
  document.body.classList.remove("is-maintenance");
  const overlay = document.getElementById("maintenanceOverlay");
  if (!overlay) {
    try { document.body.style.overflow = ""; } catch (e) {}
    return;
  }
  if (animated === false) {
    overlay.remove();
    try { document.body.style.overflow = ""; } catch (e) {}
    return;
  }
  overlay.classList.remove("maint-in", "maint-show");
  overlay.classList.add("maint-out");
  setTimeout(() => {
    const el = document.getElementById("maintenanceOverlay");
    if (el) el.remove();
    try { document.body.style.overflow = ""; } catch (e) {}
  }, 380);
}

function applyMaintenance(on, animated) {
  const next = !!on;
  if (_maintCurrent === next) {
    // ensure overlay exists if needed
    if (next && !document.getElementById("maintenanceOverlay") && !isAdminPage()) {
      showMaintenance(false);
    }
    return;
  }
  _maintCurrent = next;
  writeMaintLocal(next);
  if (next) showMaintenance(animated !== false);
  else hideMaintenance(animated !== false);
}

async function fetchMaintFromFirebase() {
  try {
    if (typeof firebase === "undefined") return null;
    if (!firebase.apps || !firebase.apps.length) {
      if (window.VoxyyOrders && window.VoxyyOrders.FIREBASE_CONFIG) {
        try { firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG); } catch (e) {}
      }
    }
    if (!firebase.apps || !firebase.apps.length) return null;
    const snap = await firebase.database().ref("settings/maintenance").once("value");
    if (!snap.exists()) return null;
    return !!snap.val();
  } catch (e) {
    return null;
  }
}

function startMaintRealtime() {
  if (_maintListening || isAdminPage()) return;
  _maintListening = true;

  // localStorage cross-tab
  window.addEventListener("storage", (e) => {
    if (e.key === MAINT_KEY) {
      applyMaintenance(e.newValue === "1", true);
    }
  });

  // Firebase realtime
  try {
    if (typeof firebase === "undefined") return;
    if (!firebase.apps || !firebase.apps.length) {
      if (window.VoxyyOrders && window.VoxyyOrders.FIREBASE_CONFIG) {
        try { firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG); } catch (e) {}
      }
    }
    if (!firebase.apps || !firebase.apps.length) return;
    firebase.database().ref("settings/maintenance").on("value", (snap) => {
      const on = snap.exists() ? !!snap.val() : false;
      applyMaintenance(on, true);
    }, (err) => {
      console.warn("[maint] firebase listen:", err);
    });
  } catch (e) {
    console.warn("[maint] realtime:", e);
  }
}

async function checkSiteMaintenance() {
  if (isAdminPage()) return;
  // immediate local
  applyMaintenance(readMaintLocal(), false);
  // then firebase
  const remote = await fetchMaintFromFirebase();
  if (remote !== null) applyMaintenance(remote, true);
  startMaintRealtime();
}

// boot
(function bootMaintenance() {
  const run = () => {
    try { checkSiteMaintenance(); } catch (e) {}
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  // fallback poll (slow) if firebase listener fails
  setInterval(async () => {
    if (isAdminPage()) return;
    const remote = await fetchMaintFromFirebase();
    if (remote !== null) applyMaintenance(remote, true);
  }, 30000);
})();

window.applyMaintenance = applyMaintenance;
window.checkSiteMaintenance = checkSiteMaintenance;
