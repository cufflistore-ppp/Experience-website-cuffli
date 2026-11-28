/* Admin Panel - Doxy Joki */
const ADMIN_WA = "6285190843300";
const MAINTENANCE_KEY = "voxyy_maintenance";
const PRODUK_HOME_KEY = "voxyy_produk";
const PRODUK_DIGITAL_KEY = "voxyy_produk_digital";

let currentProdukCat = "home";
let editingProdukId = null;

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");
}

/* ========== MAINTENANCE / ONLINE-OFFLINE ========== */
function getMaintenance() {
  try {
    return localStorage.getItem(MAINTENANCE_KEY) === "1";
  } catch (e) {
    return false;
  }
}

async function setMaintenance(on) {
  try {
    localStorage.setItem(MAINTENANCE_KEY, on ? "1" : "0");
  } catch (e) {}
  // Broadcast ke tab lain (storage event tidak fire di tab yang sama)
  try {
    localStorage.setItem("voxyy_maintenance_ping", String(Date.now()) + (on ? "-1" : "-0"));
  } catch (e) {}
  try {
    if (window.VoxyyOrders && window.VoxyyOrders.initFirebase) {
      window.VoxyyOrders.initFirebase();
    }
    if (typeof firebase !== "undefined") {
      if (!firebase.apps.length && window.VoxyyOrders && window.VoxyyOrders.FIREBASE_CONFIG) {
        try { firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG); } catch (e) {}
      }
      if (firebase.apps.length) {
        await firebase.database().ref("settings/maintenance").set(!!on);
      }
    }
  } catch (e) {
    console.warn("Gagal simpan maintenance ke Firebase:", e);
  }
  updateStatusUI();
}

function updateStatusUI() {
  const offline = getMaintenance();
  const toggle = document.getElementById("statusToggle");
  const label = document.getElementById("statusLabel");
  const hint = document.getElementById("statusHint");
  if (!toggle) return;
  if (offline) {
    toggle.classList.remove("online");
    toggle.classList.add("offline");
    if (label) label.textContent = "OFFLINE";
    if (hint) hint.textContent = "(Maintenance ON)";
  } else {
    toggle.classList.remove("offline");
    toggle.classList.add("online");
    if (label) label.textContent = "ONLINE";
    if (hint) hint.textContent = "(Maintenance OFF)";
  }
}

async function toggleMaintenance() {
  const next = !getMaintenance();
  await setMaintenance(next);
  // Status UI sudah update; pengunjung sinkron via Firebase realtime
  try {
    if (typeof showSiteModal === "function") {
      showSiteModal(next ? "Situs OFFLINE — pengunjung melihat halaman maintenance." : "Situs ONLINE kembali.", next ? "warning" : "success");
    }
  } catch (e) {}
}

async function loadMaintenanceFromFirebase() {
  try {
    if (window.VoxyyOrders && window.VoxyyOrders.initFirebase) {
      window.VoxyyOrders.initFirebase();
    }
    if (typeof firebase !== "undefined" && firebase.apps && firebase.apps.length) {
      const snap = await firebase.database().ref("settings/maintenance").once("value");
      if (snap.exists()) {
        localStorage.setItem(MAINTENANCE_KEY, snap.val() ? "1" : "0");
      }
    }
  } catch (e) {}
  updateStatusUI();
}

/* ========== ORDERS ========== */
async function loadOrders() {
  const list = document.getElementById("listOrders");
  if (!list) return;

  const prevScroll = list.scrollTop;
  const wasEmpty = !list.dataset.loaded;

  if (wasEmpty) {
    list.innerHTML = "<p style='color:#aaa;text-align:center;padding:20px;'>Memuat pesanan...</p>";
  }

  let orders = [];
  try {
    if (window.VoxyyOrders && typeof window.VoxyyOrders.getOrders === "function") {
      orders = await window.VoxyyOrders.getOrders();
    }
  } catch (e) {
    console.warn("Gagal memuat dari VoxyyOrders:", e);
  }

  if (!orders || orders.length === 0) {
    try {
      orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
    } catch (e) {
      orders = [];
    }
  }

  list.dataset.loaded = "1";

  const modeHint =
    '<p style="color:#66bb6a;font-size:12px;margin-bottom:10px;"><i class="fa-solid fa-clipboard-list"></i> Panel Admin - Menampilkan seluruh data pesanan & bukti TF</p>';

  if (!orders || orders.length === 0) {
    list.innerHTML =
      modeHint +
      "<p style='color:#aaa;text-align:center;padding:20px;'>Belum ada pesanan</p>";
    return;
  }

  list.innerHTML =
    modeHint +
    orders
      .map((o) => {
        let borderClass = "";
        if (o.status === "Sudah Bayar" || o.status === "Sukses") borderClass = "paid";
        else if (o.status === "Proses" || o.status === "Menunggu Verifikasi")
          borderClass = "proses";

        const st = o.status || "Belum Bayar";
        const bg =
          st === "Sukses" || st === "Sudah Bayar"
            ? "#004400"
            : st === "Proses" || st === "Menunggu Verifikasi"
            ? "#443300"
            : "#440000";

        const kodeSafe = String(o.kode || "").replace(/'/g, "\\'");
        const formatVal = o.formatJoki || o.catatan || "-";
        const buktiVal =
          o.buktiTF || o.buktiTf || o.bukti || o.buktiTransfer || o.paymentProof || o.image || o.foto || "";

        let buktiHTML =
          "<span style='color:#aaa;font-size:12px;'><i class='fa-solid fa-xmark'></i> Tidak ada bukti TF</span>";
        if (buktiVal) {
          buktiHTML = `
            <div style="margin-top:8px; background:rgba(0,0,0,0.25); padding:8px; border-radius:6px; border:1px solid #444;">
              <span style="font-size:12px;color:#2196f3;display:block;margin-bottom:4px;font-weight:bold;"><i class="fa-solid fa-receipt"></i> Bukti Transfer / Pembayaran:</span>
              <a href="${escapeHtmlAttr(buktiVal)}" target="_blank" title="Klik untuk memperbesar gambar">
                <img src="${escapeHtmlAttr(buktiVal)}" alt="Bukti TF" style="max-width:140px;max-height:140px;border-radius:4px;border:1px solid #555;object-fit:cover;display:block;margin-bottom:4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              </a>
              <a href="${escapeHtmlAttr(buktiVal)}" target="_blank" style="display:none;color:#64b5f6;font-size:12px;word-break:break-all;text-decoration:underline;"><i class="fa-solid fa-link"></i> Buka Link Bukti</a>
            </div>
          `;
        }

        return `
    <div class="order-card ${borderClass}" data-kode="${escapeHtmlAttr(o.kode || "")}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong style="color:#2196f3;">${escapeHtml(o.kode || "-")}</strong>
        <span style="font-size:12px;padding:3px 8px;border-radius:6px;background:${bg};">
          ${escapeHtml(st)}
        </span>
      </div>
      <div style="font-size:13px;line-height:1.6;">
        <i class="fa-solid fa-user"></i> <b>${escapeHtml(o.nama || "-")}</b><br>
        <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(o.wa || o.whatsapp || "-")}<br>
        <i class="fa-solid fa-money-bill"></i> ${escapeHtml(o.total || "-")}<br>
        <i class="fa-solid fa-box"></i> ${escapeHtml(o.paket || "Joki Kontak")}<br>
        
        <div style="margin-top:8px;background:rgba(255,255,255,0.05);padding:8px;border-radius:6px;border-left:3px solid #2196f3;">
          <span style="font-size:12px;color:#aaa;"><i class="fa-solid fa-file-lines"></i> Format / Detail Joki:</span><br>
          <pre style="white-space:pre-wrap;font-family:inherit;margin:4px 0 6px 0;font-size:13px;color:#fff;">${escapeHtml(formatVal)}</pre>
          <button type="button" onclick="salinFormatJokiDariElement(this)" data-format="${escapeHtmlAttr(formatVal)}" style="background:#2196f3;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;">
            <i class="fa-solid fa-copy"></i> Salin Format
          </button>
        </div>

        <div style="margin-top:8px;">
          ${buktiHTML}
        </div>

        <div style="margin-top:8px;">
          <i class="fa-solid fa-clock"></i> <small style="color:#888;">${escapeHtml(o.waktu || "-")}</small>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;">
        <button class="status-btn btn-proses" onclick="ubahStatusByKode('${kodeSafe}', 'Proses')">Proses</button>
        <button class="status-btn btn-paid" onclick="ubahStatusByKode('${kodeSafe}', 'Sukses')">Sukses</button>
        <button class="status-btn btn-unpaid" onclick="ubahStatusByKode('${kodeSafe}', 'Belum Bayar')">Belum Bayar</button>
        <button class="status-btn btn-delete" onclick="hapusOrderByKode('${kodeSafe}')">Hapus</button>
      </div>
    </div>
  `;
      })
      .join("");

  try {
    list.scrollTop = prevScroll;
  } catch (e) {}
}

function salinFormatJoki(text) {
  if (!text || text === "-") {
    alert("Tidak ada format joki untuk disalin.");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Format joki berhasil disalin!");
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function salinFormatJokiDariElement(btn) {
  const text = btn.getAttribute("data-format") || "";
  salinFormatJoki(text);
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand("copy");
    if (successful) alert("Format joki berhasil disalin!");
    else alert("Gagal menyalin teks.");
  } catch (err) {
    alert("Gagal menyalin teks.");
  }
  document.body.removeChild(textArea);
}

async function tambahOrderAdmin() {
  const kodeEl = document.getElementById("admKode");
  const namaEl = document.getElementById("admNama");
  const waEl = document.getElementById("admWA");
  const totalEl = document.getElementById("admTotal");
  const statusEl = document.getElementById("admStatus");

  const kode =
    (kodeEl ? kodeEl.value.trim() : "") ||
    "DJ-2026-" + Math.floor(1000 + Math.random() * 9000) + String(Date.now()).slice(-3);
  const nama = (namaEl ? namaEl.value.trim() : "") || "Manual";
  const wa = (waEl ? waEl.value.trim() : "") || "-";
  const total = (totalEl ? totalEl.value.trim() : "") || "Rp 0";
  const status = statusEl ? statusEl.value : "Belum Bayar";

  const order = {
    kode,
    nama,
    wa,
    total,
    status,
    catatan: "Ditambahkan manual oleh admin",
    paket: "Manual",
    waktu: new Date().toLocaleString("id-ID"),
    createdAt: Date.now()
  };

  try {
    let orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("voxyy_orders", JSON.stringify(orders));
  } catch (e) {
    console.error("Gagal simpan ke localStorage:", e);
  }

  try {
    if (window.VoxyyOrders && typeof window.VoxyyOrders.addOrder === "function") {
      await window.VoxyyOrders.addOrder(order);
    }
  } catch (e) {
    console.warn("Gagal sinkron ke VoxyyOrders:", e);
  }

  alert("Pesanan berhasil ditambahkan!");
  loadOrders();

  if (kodeEl) kodeEl.value = "";
  if (namaEl) namaEl.value = "";
  if (waEl) waEl.value = "";
  if (totalEl) totalEl.value = "";
}

async function ubahStatusByKode(kode, status) {
  if (!kode) return;
  try {
    let orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
    const idx = orders.findIndex(
      (o) => String(o.kode || "").toUpperCase() === String(kode).toUpperCase()
    );
    if (idx >= 0) {
      orders[idx].status = status;
      localStorage.setItem("voxyy_orders", JSON.stringify(orders));
    }
    if (window.VoxyyOrders && typeof window.VoxyyOrders.updateOrderByKode === "function") {
      await window.VoxyyOrders.updateOrderByKode(kode, { status });
    }
  } catch (e) {
    console.error(e);
  }
  await loadOrders();
}

async function hapusOrderByKode(kode) {
  if (!kode) return;
  if (!confirm("Hapus pesanan " + kode + "?")) return;
  try {
    let orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
    orders = orders.filter(
      (o) => String(o.kode || "").toUpperCase() !== String(kode).toUpperCase()
    );
    localStorage.setItem("voxyy_orders", JSON.stringify(orders));
    if (window.VoxyyOrders && typeof window.VoxyyOrders.deleteOrderByKode === "function") {
      await window.VoxyyOrders.deleteOrderByKode(kode);
    }
  } catch (e) {
    console.error(e);
  }
  await loadOrders();
}

/* ========== PRODUK CRUD ========== */
function getProdukList(cat) {
  const key = cat === "digital" ? PRODUK_DIGITAL_KEY : PRODUK_HOME_KEY;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {}
  if (cat === "digital" && typeof produkDigital !== "undefined") {
    return JSON.parse(JSON.stringify(produkDigital));
  }
  if (typeof produk !== "undefined") {
    return JSON.parse(JSON.stringify(produk));
  }
  return [];
}

function saveProdukList(cat, list) {
  const key = cat === "digital" ? PRODUK_DIGITAL_KEY : PRODUK_HOME_KEY;
  localStorage.setItem(key, JSON.stringify(list || []));
  if (cat === "digital") {
    try { localStorage.setItem("voxyy_digital", JSON.stringify(list || [])); } catch (e) {}
  } else {
    try { localStorage.setItem("voxyy_produk", JSON.stringify(list || [])); } catch (e) {}
  }
  try {
    if (typeof firebase !== "undefined" && firebase.apps && firebase.apps.length) {
      firebase.database().ref("settings/products/" + cat).set(list || []);
    }
  } catch (e) {}
}

function renderProdukAdmin() {
  const box = document.getElementById("listProdukAdmin");
  if (!box) return;
  const list = getProdukList(currentProdukCat);
  if (!list.length) {
    box.innerHTML = "<p style='color:#aaa;text-align:center;padding:16px;'>Belum ada produk di kategori ini.</p>";
    return;
  }
  box.innerHTML = list
    .map((p) => {
      const id = p.id;
      return `
      <div class="produk-admin-card">
        <div style="display:flex;justify-content:space-between;gap:10px;">
          <div>
            <strong style="color:#2196f3;">${escapeHtml(p.judul || "-")}</strong><br>
            <span style="font-size:13px;color:#90caf9;">Rp ${Number(p.harga || 0).toLocaleString("id-ID")}</span>
            <span style="font-size:11px;margin-left:8px;padding:2px 6px;border-radius:4px;background:#1a2740;">${escapeHtml(p.status || "TERSEDIA")}</span>
            <div style="font-size:12px;color:#888;margin-top:4px;">${escapeHtml(p.deskripsi || "")}</div>
          </div>
        </div>
        <div class="produk-admin-actions">
          <button type="button" class="btn-edit" onclick="bukaEditProduk('${currentProdukCat}', ${id})"><i class="fa-solid fa-pen"></i> Edit</button>
          <button type="button" class="btn-del" onclick="hapusProduk('${currentProdukCat}', ${id})"><i class="fa-solid fa-trash"></i> Hapus</button>
        </div>
      </div>`;
    })
    .join("");
}

function bukaEditProduk(cat, id) {
  const list = getProdukList(cat);
  const p = list.find((x) => Number(x.id) === Number(id));
  if (!p) return;
  editingProdukId = id;
  currentProdukCat = cat;
  document.getElementById("editProdukId").value = id;
  document.getElementById("editProdukCat").value = cat;
  document.getElementById("editJudul").value = p.judul || "";
  document.getElementById("editHarga").value = p.harga || 0;
  document.getElementById("editStatus").value = p.status || "TERSEDIA";
  document.getElementById("editLokasi").value = cat;
  document.getElementById("editDeskripsi").value = p.deskripsi || "";
  document.getElementById("editImg").value = p.img || "";
  document.getElementById("formProdukEdit").classList.add("show");
  document.getElementById("formProdukEdit").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function bukaTambahProduk() {
  editingProdukId = null;
  document.getElementById("editProdukId").value = "";
  document.getElementById("editProdukCat").value = currentProdukCat;
  document.getElementById("editJudul").value = "";
  document.getElementById("editHarga").value = "";
  document.getElementById("editStatus").value = "TERSEDIA";
  document.getElementById("editLokasi").value = currentProdukCat;
  document.getElementById("editDeskripsi").value = "";
  document.getElementById("editImg").value = currentProdukCat === "digital" ? "logo.png" : "logo-produk.jpg";
  document.getElementById("formProdukEdit").classList.add("show");
}

function tutupFormProduk() {
  document.getElementById("formProdukEdit").classList.remove("show");
  editingProdukId = null;
}

function simpanProduk() {
  const judul = (document.getElementById("editJudul").value || "").trim();
  const harga = Number(document.getElementById("editHarga").value) || 0;
  const status = document.getElementById("editStatus").value || "TERSEDIA";
  const lokasi = document.getElementById("editLokasi").value || "home";
  const deskripsi = (document.getElementById("editDeskripsi").value || "").trim();
  const img = (document.getElementById("editImg").value || "").trim() || (lokasi === "digital" ? "logo.png" : "logo-produk.jpg");
  const oldCat = document.getElementById("editProdukCat").value || currentProdukCat;
  const idRaw = document.getElementById("editProdukId").value;

  if (!judul) {
    alert("Judul produk wajib diisi.");
    return;
  }

  // Hapus dari kategori lama jika pindah lokasi
  if (idRaw && oldCat !== lokasi) {
    let oldList = getProdukList(oldCat).filter((x) => Number(x.id) !== Number(idRaw));
    saveProdukList(oldCat, oldList);
  }

  let list = getProdukList(lokasi);
  if (idRaw) {
    const idx = list.findIndex((x) => Number(x.id) === Number(idRaw));
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        judul,
        harga,
        status,
        deskripsi,
        img,
        fitur: list[idx].fitur || ["Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
      };
    } else {
      // pindah dari cat lain
      const newId = list.length ? Math.max(...list.map((p) => Number(p.id) || 0)) + 1 : 1;
      list.push({
        id: newId,
        judul,
        harga,
        status,
        deskripsi,
        img,
        fitur: ["Bayar langsung QRIS", "Konfirmasi via WhatsApp"],
        directPay: true,
        label: "JASA"
      });
    }
  } else {
    const newId = list.length ? Math.max(...list.map((p) => Number(p.id) || 0)) + 1 : 1;
    list.push({
      id: newId,
      judul,
      harga,
      status,
      deskripsi,
      img,
      fitur: ["Bayar langsung QRIS", "Konfirmasi via WhatsApp"],
      directPay: true,
      label: "JASA",
      slug: judul.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    });
  }

  saveProdukList(lokasi, list);
  currentProdukCat = lokasi;
  document.querySelectorAll(".admin-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.cat === lokasi);
  });
  tutupFormProduk();
  renderProdukAdmin();
  alert("Produk berhasil disimpan!");
}

function hapusProduk(cat, id) {
  if (!confirm("Hapus produk ini?")) return;
  let list = getProdukList(cat).filter((x) => Number(x.id) !== Number(id));
  saveProdukList(cat, list);
  renderProdukAdmin();
}

/* ========== MENU & INIT ========== */
function showSection(name) {
  const pesanan = document.getElementById("sectionPesanan");
  const produk = document.getElementById("sectionProduk");
  if (name === "produk") {
    if (pesanan) pesanan.style.display = "none";
    if (produk) produk.style.display = "block";
    renderProdukAdmin();
  } else {
    // Transaksi / tampilan utama panel admin
    if (pesanan) pesanan.style.display = "block";
    if (produk) produk.style.display = "none";
    if (typeof loadOrders === "function") loadOrders();
  }
  const panel = document.getElementById("adminMenuPanel");
  if (panel) panel.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", async () => {
  // Hamburger
  const ham = document.getElementById("adminHamburger");
  const panel = document.getElementById("adminMenuPanel");
  if (ham && panel) {
    ham.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("open");
    });
    document.addEventListener("click", () => panel.classList.remove("open"));
    panel.addEventListener("click", (e) => e.stopPropagation());
  }

  const menuTransaksi = document.getElementById("menuTransaksi");
  if (menuTransaksi) menuTransaksi.addEventListener("click", () => {
    // Sudah di halaman transaksi utama
    const panel = document.getElementById("adminMenuPanel");
    if (panel) panel.classList.remove("open");
    if (typeof loadOrders === "function") loadOrders();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Status toggle
  const statusToggle = document.getElementById("statusToggle");
  if (statusToggle) {
    statusToggle.addEventListener("click", toggleMaintenance);
    statusToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMaintenance();
      }
    });
  }

  // Produk tabs
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentProdukCat = tab.dataset.cat || "home";
      tutupFormProduk();
      renderProdukAdmin();
    });
  });

  const btnTambah = document.getElementById("btnTambahProduk");
  if (btnTambah) btnTambah.addEventListener("click", bukaTambahProduk);
  const btnSimpan = document.getElementById("btnSimpanProduk");
  if (btnSimpan) btnSimpan.addEventListener("click", simpanProduk);
  const btnBatal = document.getElementById("btnBatalProduk");
  if (btnBatal) btnBatal.addEventListener("click", tutupFormProduk);

  await loadMaintenanceFromFirebase();
  updateStatusUI();
  loadOrders();

  // Auto refresh orders
  setInterval(loadOrders, 15000);
  if (window.VoxyyOrders && typeof window.VoxyyOrders.onOrdersChange === "function") {
    window.VoxyyOrders.onOrdersChange(() => loadOrders());
  }
});

window.loadOrders = loadOrders;
window.tambahOrderAdmin = tambahOrderAdmin;
window.ubahStatusByKode = ubahStatusByKode;
window.hapusOrderByKode = hapusOrderByKode;
window.salinFormatJokiDariElement = salinFormatJokiDariElement;
window.bukaEditProduk = bukaEditProduk;
window.hapusProduk = hapusProduk;
