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
  let catatan = (typeof formatPushKontak === "function") ? formatPushKontak(nama, wa) : (document.getElementById("catatan")?.value || "");

  // Validasi field wajib untuk Joki Kontak
  if (!nama || !wa) {
    showSiteModal("Lengkapi field wajib: Nama (Store/JB) dan Nomor WhatsApp.", "warning");
    return;
  }
  if (wa.replace(/\D/g, "").length < 10) {
    showSiteModal("Nomor WhatsApp tidak valid. Masukkan minimal 10 digit.", "warning");
    return;
  }

  const total = document.getElementById("totalHarga")?.textContent || "Rp 5.000";
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = String(Date.now()).slice(-3);
  const kode = `EJ-2026-${rand}${timePart}`;

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
async function compressLaporanImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
    reader.readAsDataURL(file);
  });
}

async function kirimLaporan() {
  const noPesanan = document.getElementById("noPesanan")?.value.trim() || "-";
  const judul = document.getElementById("judulLaporan")?.value.trim() || "-";
  const deskripsi = document.getElementById("deskripsiLaporan")?.value.trim() || "-";
  const fileInput = document.getElementById("fotoLaporan");
  const files = fileInput ? Array.from(fileInput.files).slice(0, 3) : [];

  if (noPesanan === "-" || judul === "-" || deskripsi === "-") {
    showSiteModal("Nomor pesanan, judul, dan deskripsi wajib diisi.", "warning");
    return;
  }
  if (files.some(f => f.size > 5 * 1024 * 1024)) {
    showSiteModal("Ukuran setiap foto maksimal 5 MB.", "warning");
    return;
  }
  if (!window.VoxyyReports || typeof window.VoxyyReports.addReport !== "function") {
    showSiteModal("Fitur laporan belum siap. Silakan muat ulang halaman.", "warning");
    return;
  }

  const btn = document.querySelector("#formLaporan .btn-kirim");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...'; }

  try {
    const photos = [];
    for (const file of files) {
      const dataUrl = await compressLaporanImage(file);
      if (dataUrl) photos.push({ name: file.name, type: "image/jpeg", data: dataUrl });
    }

    const user = window.EJ && window.EJ.auth ? window.EJ.auth.currentUser : null;
    const result = await window.VoxyyReports.addReport({
      noPesanan,
      judul,
      deskripsi,
      photos,
      status: "Menunggu",
      uid: user ? user.uid : "",
      email: user ? (user.email || "") : "",
      createdAt: Date.now()
    });

    if (!result || !result.ok) throw new Error(result && result.error ? result.error : "Gagal menyimpan laporan");
    localStorage.setItem("elzkii_last_report_id", result.id || "");
    showSiteModal("Laporan berhasil dikirim. Admin sekarang dapat melihatnya di Panel Admin.", "success");
    document.getElementById("formLaporan")?.reset?.();
  } catch (e) {
    console.error("Gagal kirim laporan:", e);
    showSiteModal("Laporan gagal dikirim. Coba lagi beberapa saat.", "warning");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Laporan'; }
  }
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
