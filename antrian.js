const SAVED_KODE_KEY = "voxyy_saved_kode";
const SAVED_KODES_KEY = "voxyy_saved_kodes";

function parseMoney(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && !isNaN(v)) return v;
  var n = parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getTrackedKodes() {
  const set = new Set();
  try {
    const one = localStorage.getItem(SAVED_KODE_KEY);
    if (one) set.add(String(one).trim().toUpperCase());
    const arr = JSON.parse(localStorage.getItem(SAVED_KODES_KEY) || "[]");
    (arr || []).forEach((k) => set.add(String(k).trim().toUpperCase()));
  } catch (e) {}
  return set;
}

function saveTrackedKode(kode) {
  if (!kode) return;
  const k = String(kode).trim();
  localStorage.setItem(SAVED_KODE_KEY, k);
  try {
    const arr = JSON.parse(localStorage.getItem(SAVED_KODES_KEY) || "[]");
    const up = k.toUpperCase();
    const next = [k].concat((arr || []).filter((x) => String(x).toUpperCase() !== up)).slice(0, 30);
    localStorage.setItem(SAVED_KODES_KEY, JSON.stringify(next));
  } catch (e) {}
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

function statusMeta(status, hasFile, order) {
  const s = String(status || "").toLowerCase();
  var isSuntik = false;
  try {
    var pk = String((order && (order.paket || order.judul)) || "").toLowerCase();
    isSuntik = pk.indexOf("suntik") >= 0 || !!(order && order.isJasa);
  } catch (e) {}
  // Sukses: jasa/suntik selesai tanpa file; digital selesai kalau ada file
  if (s.includes("sukses") || s.includes("selesai")) {
    if (hasFile || isSuntik) {
      return { label: "Selesai", cls: "sukses", color: "#66bb6a", bg: "#0d3d1a" };
    }
    return { label: "Sukses — menunggu file", cls: "proses", color: "#ffb74d", bg: "#3d2a0d" };
  }
  if (s.includes("tolak")) {
    return { label: "Ditolak", cls: "tolak", color: "#ef9a9a", bg: "#3d1515" };
  }
  if (s.includes("proses")) {
    return { label: "Diproses Admin", cls: "proses", color: "#ffb74d", bg: "#3d2a0d" };
  }
  if (s.includes("menunggu link")) {
    return { label: "Isi link target", cls: "proses", color: "#64b5f6", bg: "#0d2137" };
  }
  // semua status bayar / menunggu / kosong → Menunggu Verifikasi (jangan "Belum Bayar")
  if (
    s.includes("verifikasi") ||
    s.includes("menunggu") ||
    s.includes("bayar") ||
    s.includes("belum") ||
    !s
  ) {
    return { label: "Menunggu Verifikasi", cls: "proses", color: "#64b5f6", bg: "#0d2137" };
  }
  return { label: status || "Menunggu Verifikasi", cls: "proses", color: "#64b5f6", bg: "#0d2137" };
}

function filterMyOrders(orders) {
  const tracked = getTrackedKodes();
  let email = "";
  try {
    const u = window.VoxyyAuth && window.VoxyyAuth.currentUser && window.VoxyyAuth.currentUser();
    if (u && u.email) email = String(u.email).toLowerCase();
  } catch (e) {}

  return (orders || []).filter((o) => {
    // Pesanan ditolak admin → hilang dari list pembeli
    const st = String(o.status || "").toLowerCase();
    if (st.includes("tolak")) return false;
    // draft kosong saja yang disembunyikan
    if (st === "draft" || st.includes("draft suntik") && !o.bukti && !o.hasBukti) return false;
    const kode = String(o.kode || "").toUpperCase();
    if (tracked.has(kode)) return true;
    if (email && String(o.email || "").toLowerCase() === email) return true;
    if (email && String(o.userEmail || "").toLowerCase() === email) return true;
    return false;
  });
}

function renderOrderCard(o) {
  const file = o.file || o.download || o.fileUrl || "";
  const st = statusMeta(o.status, !!file, o);
  const kode = o.kode || "-";
  const paket = o.paket || o.judul || "Pesanan";
  const totalN = parseMoney(o.finalAmount != null ? o.finalAmount : o.total);
  const total = totalN > 0 ? totalN.toLocaleString("id-ID") : String(o.total || "-").replace(/^Rp\s*/i, "");
  const waktu = o.waktu || o.dikirimAt || "";
  const fileName = o.fileName || (file ? (String(file).split("/").pop() || "file").split("?")[0] : "");
  const catatan = o.catatanAdmin || o.catatan || "";
  const isData = String(file).indexOf("data:") === 0;
  const isApk = /\.apk(\?|$)/i.test(fileName) || /\.apk(\?|$)/i.test(String(file));
  const isZip = /\.(zip|rar|7z)(\?|$)/i.test(fileName) || /\.(zip|rar|7z)(\?|$)/i.test(String(file));

  let actionHtml = "";
  var stLow = String(o.status || "").toLowerCase();
  var isHttp = /^https?:\/\//i.test(String(file || ""));
  var isFbFile = String(file || "").indexOf("firebase:order_files/") === 0;
  if (!file && stLow.indexOf("menunggu link") >= 0) {
    actionHtml =
      '<a href="jasa-link.html?kode=' + encodeURIComponent(kode) + '" style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:10px 14px;background:#1565c0;color:#fff;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">' +
      '<i class="fa-solid fa-link"></i> Isi link target</a>';
  } else if (file && !isFbFile) {
    // URL http → biru Lihat; APK/ZIP/data → hijau Unduh
    if (isHttp && !isApk && !isZip) {
      actionHtml =
        '<div style="font-size:12px;color:#64b5f6;margin-bottom:6px;font-weight:600;">✓ Link produk siap</div>' +
        '<a href="' + escapeHtml(file) + '" target="_blank" rel="noopener" ' +
        'style="display:inline-flex;align-items:center;gap:6px;margin-top:4px;padding:10px 14px;background:#1565c0;color:#fff;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">' +
        '<i class="fa-solid fa-eye"></i> Lihat / Buka Link</a>';
    } else {
      const openLabel = isApk ? "Unduh / Install APK" : isZip ? "Unduh ZIP" : "Unduh file";
      actionHtml =
        '<div style="font-size:12px;color:#81c784;margin-bottom:6px;font-weight:600;">✓ Produk sudah di pesanan ini</div>' +
        '<a href="' + escapeHtml(file) + '" ' +
        (isData ? 'download="' + escapeHtml(fileName || "produk") + '"' : 'download="' + escapeHtml(fileName || "produk") + '" target="_blank" rel="noopener"') +
        ' style="display:inline-flex;align-items:center;gap:6px;margin-top:4px;padding:10px 14px;background:#2e7d32;color:#fff;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">' +
        '<i class="fa-solid fa-download"></i> ' + escapeHtml(openLabel) +
        (fileName ? " · " + escapeHtml(fileName) : "") + "</a>";
    }
  } else if (file && isFbFile) {
    actionHtml =
      '<div style="font-size:12px;color:#81c784;margin-bottom:6px;font-weight:600;">✓ Produk siap</div>' +
      '<button type="button" onclick="unduhFilePesanan(\'' + escapeHtml(kode) + '\')" ' +
      'style="display:inline-flex;align-items:center;gap:6px;margin-top:4px;padding:10px 14px;background:#2e7d32;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;">' +
      '<i class="fa-solid fa-download"></i> Unduh file</button>';
  } else if (st.cls === "sukses") {
    actionHtml =
      '<div style="font-size:12px;color:#ffb74d;margin-top:4px;">Admin sedang proses. File akan muncul di kode ini setelah admin kirim.</div>';
  } else if (st.cls === "tolak") {
    actionHtml =
      '<div style="font-size:12px;color:#ef9a9a;margin-top:4px;">Pesanan ditolak admin.</div>';
  } else {
    actionHtml =
      '<div style="font-size:12px;color:#8aa0b8;margin-top:6px;line-height:1.4;">Pesanan diproses di website. File akan muncul di sini (kode ' +
      escapeHtml(kode) +
      ") setelah admin kirim.</div>";
  }

  return (
    '<div class="order-status-card" style="background:#12182a;border:1px solid #1e2a45;border-radius:14px;padding:14px;margin-bottom:12px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px;">' +
    "<div>" +
    '<div style="font-size:12px;color:#8aa0b8;">Kode</div>' +
    '<div style="font-weight:800;color:#fff;letter-spacing:0.3px;">' +
    escapeHtml(kode) +
    "</div>" +
    "</div>" +
    '<span style="font-size:11px;font-weight:700;padding:5px 10px;border-radius:999px;background:' +
    st.bg +
    ";color:" +
    st.color +
    ';white-space:nowrap;">' +
    escapeHtml(st.label) +
    "</span>" +
    "</div>" +
    '<div style="font-size:14px;font-weight:700;color:#e3eaf2;margin-bottom:4px;">' +
    escapeHtml(paket) +
    "</div>" +
    '<div style="font-size:12px;color:#8aa0b8;margin-bottom:8px;">Total Rp ' +
    escapeHtml(String(total)) +
    (waktu ? " · " + escapeHtml(String(waktu)) : "") +
    "</div>" +
    (catatan
      ? '<div style="font-size:12px;color:#cfd8e3;background:#0a0e18;border-radius:8px;padding:8px 10px;margin-bottom:8px;">' +
        escapeHtml(catatan) +
        "</div>"
      : "") +
    actionHtml +
    "</div>"
  );
}


async function renderAntrian() {
  const list = document.getElementById("antrianList");
  if (!list) return;

  list.innerHTML = `<div style="text-align:center;color:#8aa0b8;padding:24px 12px;">Memuat pesanan...</div>`;

  let orders = [];
  try {
    orders = await fetchOrders();
  } catch (e) {
    console.warn(e);
  }

  // resolve file APK/ZIP/URL di pesanan (semua device)
  try {
    var pre = filterMyOrders(orders);
    await Promise.all((pre || []).slice(0, 15).map(async function (o) {
      if (!o || !o.kode) return;
      var f = o.file || o.download || o.fileUrl || "";
      if (f && (String(f).indexOf("data:") === 0 || /^https?:\/\//i.test(f))) return;
      if (window.VoxyyOrders && window.VoxyyOrders.getDeliveryFileByKode) {
        try {
          var real = await window.VoxyyOrders.getDeliveryFileByKode(o.kode);
          if (real) {
            o.file = real;
            o.download = real;
            o.fileUrl = real;
          }
        } catch (e) {}
      }
    }));
  } catch (eH) {}

  const mine = filterMyOrders(orders);
  // terbaru dulu
  mine.sort((a, b) => {
    const ta = Date.parse(a.createdAt || a.waktu || 0) || Number(a.dikirimTs || a.createdAt) || 0;
    const tb = Date.parse(b.createdAt || b.waktu || 0) || Number(b.dikirimTs || b.createdAt) || 0;
    return tb - ta;
  });

  if (!mine.length) {
    list.innerHTML = `
      <div style="text-align:center;padding:28px 16px;background:#12182a;border-radius:14px;border:1px solid #1e2a45;">
        <div style="font-size:28px;margin-bottom:8px;">📋</div>
        <strong style="color:#fff;">Belum ada pesanan</strong>
        <p style="font-size:13px;color:#8aa0b8;margin-top:6px;line-height:1.45;">Order produk dari Home/Produk. Status & file unduhan muncul di sini otomatis.</p>
        <a href="digital.html" style="display:inline-block;margin-top:12px;padding:10px 18px;background:#1565c0;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">Lihat Produk</a>
      </div>`;
    return;
  }

  list.innerHTML =
    `<div style="font-size:12px;color:#8aa0b8;margin-bottom:10px;">${mine.length} pesanan · status realtime</div>` +
    mine.map(renderOrderCard).join("");
}

async function cekStatus() {
  const input = document.getElementById("kodeInput");
  const kode = (input && input.value ? input.value : "").trim();
  const box = document.getElementById("detailPesanan");
  if (!kode) {
    if (box) {
      box.style.display = "block";
      box.innerHTML = `<div style="color:#ef9a9a;font-size:13px;">Masukkan kode pesanan.</div>`;
    }
    return;
  }
  saveTrackedKode(kode);
  const orders = await fetchOrders();
  const found = (orders || []).find((o) => String(o.kode || "").toUpperCase() === kode.toUpperCase());
  if (!box) return;
  box.style.display = "block";
  if (!found) {
    box.innerHTML = `<div style="color:#ffb74d;font-size:13px;">Kode <b>${escapeHtml(kode)}</b> belum ditemukan. Pastikan sudah order & bayar.</div>`;
    return;
  }
  box.innerHTML = renderOrderCard(found);
  renderAntrian();
}

window.cekStatus = cekStatus;
window.saveTrackedKode = saveTrackedKode;

async function unduhFilePesanan(kode) {
  try {
    var url = "";
    if (window.VoxyyOrders && window.VoxyyOrders.getDeliveryFileByKode) {
      url = await window.VoxyyOrders.getDeliveryFileByKode(kode);
    }
    if (!url) { alert("File belum tersedia. Coba refresh."); return; }
    if (/^https?:\/\//i.test(url)) { window.open(url, "_blank"); return; }
    var a = document.createElement("a");
    a.href = url;
    a.download = "produk-" + kode;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    alert("Gagal unduh: " + (e.message || e));
  }
}
window.unduhFilePesanan = unduhFilePesanan;

document.addEventListener("DOMContentLoaded", function () {
  renderAntrian();
  if (window.VoxyyOrders && typeof window.VoxyyOrders.onOrdersChange === "function") {
    window.VoxyyOrders.onOrdersChange(function () {
      renderAntrian();
    });
  }
  setInterval(renderAntrian, 8000);
});
