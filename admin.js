async function loadOrders() {
  const list = document.getElementById("listOrders");
  if (!list) return;

  const prevScroll = list.scrollTop;
  const wasEmpty = !list.dataset.loaded;

  if (wasEmpty) {
    list.innerHTML = "<p style='color:#aaa;text-align:center;padding:20px;'>Memuat pesanan...</p>";
  }

  let orders = [];
  
  // 1. Ambil dari VoxyyOrders (Firebase) jika ada
  try {
    if (window.VoxyyOrders && typeof window.VoxyyOrders.getOrders === "function") {
      orders = await window.VoxyyOrders.getOrders();
    }
  } catch (e) {
    console.warn("Gagal memuat dari VoxyyOrders:", e);
  }

  // 2. Jika kosong atau error, ambil dari localStorage
  if (!orders || orders.length === 0) {
    try {
      orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
    } catch (e) {
      orders = [];
    }
  }

  list.dataset.loaded = "1";

  const modeHint = '<p style="color:#66bb6a;font-size:12px;margin-bottom:10px;">📋 Panel Admin - Menampilkan seluruh data pesanan & bukti TF</p>';

  if (!orders || orders.length === 0) {
    list.innerHTML =
      modeHint +
      "<p style='color:#aaa;text-align:center;padding:20px;'>Belum ada pesanan</p>";
    return;
  }

  list.innerHTML =
    modeHint +
    orders
      .map((o, i) => {
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
        
        // Ambil format joki / catatan
        const formatVal = o.formatJoki || o.catatan || "-";
        
        // Deteksi bukti TF dari berbagai kemungkinan nama properti (termasuk Base64 dari pembayaran.html)
        const buktiVal = o.buktiTF || o.buktiTf || o.bukti || o.buktiTransfer || o.paymentProof || o.image || o.foto || "";

        let buktiHTML = "<span style='color:#aaa;font-size:12px;'>❌ Tidak ada bukti TF</span>";
        if (buktiVal) {
          buktiHTML = `
            <div style="margin-top:8px; background:rgba(0,0,0,0.25); padding:8px; border-radius:6px; border:1px solid #444;">
              <span style="font-size:12px;color:#2196f3;display:block;margin-bottom:4px;font-weight:bold;">📸 Bukti Transfer / Pembayaran:</span>
              <a href="${escapeHtmlAttr(buktiVal)}" target="_blank" title="Klik untuk memperbesar gambar">
                <img src="${escapeHtmlAttr(buktiVal)}" alt="Bukti TF" style="max-width:140px;max-height:140px;border-radius:4px;border:1px solid #555;object-fit:cover;display:block;margin-bottom:4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              </a>
              <a href="${escapeHtmlAttr(buktiVal)}" target="_blank" style="display:none;color:#64b5f6;font-size:12px;word-break:break-all;text-decoration:underline;">🔗 Buka Link Bukti</a>
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
        👤 <b>${escapeHtml(o.nama || "-")}</b><br>
        📱 ${escapeHtml(o.wa || o.whatsapp || "-")}<br>
        💰 ${escapeHtml(o.total || "-")}<br>
        📦 ${escapeHtml(o.paket || "Joki Kontak")}<br>
        
        <!-- Format Joki dengan Tombol Salin -->
        <div style="margin-top:8px;background:rgba(255,255,255,0.05);padding:8px;border-radius:6px;border-left:3px solid #2196f3;">
          <span style="font-size:12px;color:#aaa;">📝 Format / Detail Joki:</span><br>
          <pre style="white-space:pre-wrap;font-family:inherit;margin:4px 0 6px 0;font-size:13px;color:#fff;">${escapeHtml(formatVal)}</pre>
          <button type="button" onclick="salinFormatJokiDariElement(this)" data-format="${escapeHtmlAttr(formatVal)}" style="background:#2196f3;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;">
            <i class="fa-solid fa-copy"></i> Salin Format
          </button>
        </div>

        <!-- Bukti Transfer -->
        <div style="margin-top:8px;">
          ${buktiHTML}
        </div>

        <div style="margin-top:8px;">
          ⏰ <small style="color:#888;">${escapeHtml(o.waktu || "-")}</small>
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

/** Fungsi untuk menyalin format joki */
function salinFormatJoki(text) {
  if (!text || text === "-") {
    alert("Tidak ada format joki untuk disalin.");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert("✅ Format joki berhasil disalin!");
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
    const successful = document.execCommand('copy');
    if (successful) {
      alert("✅ Format joki berhasil disalin!");
    } else {
      alert("Gagal menyalin teks.");
    }
  } catch (err) {
    alert("Gagal menyalin teks.");
  }
  document.body.removeChild(textArea);
}

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

async function tambahOrderAdmin() {
  const kodeEl = document.getElementById("admKode");
  const namaEl = document.getElementById("admNama");
  const waEl = document.getElementById("admWA");
  const totalEl = document.getElementById("admTotal");
  const formatJokiEl = document.getElementById("admFormatJoki");
  const buktiTFEl = document.getElementById("admBuktiTF");
  const statusEl = document.getElementById("admStatus");

  const kode = (kodeEl ? kodeEl.value.trim() : "") ||
    "DJ-2026-" + Math.floor(1000 + Math.random() * 9000) + String(Date.now()).slice(-3);
  const nama = (namaEl ? namaEl.value.trim() : "") || "Manual";
  const wa = (waEl ? waEl.value.trim() : "") || "-";
  const total = (totalEl ? totalEl.value.trim() : "") || "Rp 0";
  const formatJoki = formatJokiEl ? formatJokiEl.value.trim() : "";
  const buktiTF = buktiTFEl ? buktiTFEl.value.trim() : "";
  const status = statusEl ? statusEl.value : "Belum Bayar";

  const order = {
    kode,
    nama,
    wa,
    total,
    formatJoki,
    buktiTF,
    buktiTf: buktiTF,
    status,
    catatan: formatJoki || "Ditambahkan manual oleh admin",
    paket: "Manual",
    waktu: new Date().toLocaleString("id-ID"),
    createdAt: Date.now()
  };

  // 1. Simpan ke localStorage
  try {
    let orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("voxyy_orders", JSON.stringify(orders));
  } catch (e) {
    console.error("Gagal simpan ke localStorage:", e);
  }

  // 2. Simpan ke VoxyyOrders (Firebase) jika tersedia
  try {
    if (window.VoxyyOrders && typeof window.VoxyyOrders.addOrder === "function") {
      await window.VoxyyOrders.addOrder(order);
    }
  } catch (e) {
    console.warn("Gagal sinkron ke VoxyyOrders:", e);
  }

  alert("✅ Pesanan berhasil ditambahkan dan masuk ke Panel Admin!");
  loadOrders();

  // Reset form
  if (kodeEl) kodeEl.value = "";
  if (namaEl) namaEl.value = "";
  if (waEl) waEl.value = "";
  if (totalEl) totalEl.value = "";
  if (formatJokiEl) formatJokiEl.value = "";
  if (buktiTFEl) buktiTFEl.value = "";
}

/** Ubah status by kode */
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

async function ubahStatus(index, status) {
  let orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
  if (!orders[index]) return;
  await ubahStatusByKode(orders[index].kode, status);
}

async function hapusOrderByKode(kode) {
  if (!kode) return;
  if (!confirm("Hapus pesanan " + kode + " dari daftar?")) return;

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

async function hapusOrder(index) {
  let orders = JSON.parse(localStorage.getItem("voxyy_orders") || "[]");
  if (!orders[index]) return;
  await hapusOrderByKode(orders[index].kode);
}

document.addEventListener("DOMContentLoaded", function () {
  loadOrders();
  if (window.VoxyyOrders && typeof window.VoxyyOrders.onOrdersChange === "function") {
    window.VoxyyOrders.onOrdersChange(function () {
      loadOrders();
    });
  } else {
    setInterval(loadOrders, 10000);
  }
});
