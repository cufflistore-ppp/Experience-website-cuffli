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
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch (e) {}
  try {
    if (window.VoxyyOrders && window.VoxyyOrders._lastProduk && window.VoxyyOrders._lastProduk.length) {
      return window.VoxyyOrders._lastProduk.slice();
    }
  } catch (e) {}
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
  document.querySelectorAll(".admin-nav a, .adm-drawer a[data-panel]").forEach((el) => el.classList.remove("active"));
  const panel = document.getElementById("panel-" + name);
  if (panel) panel.classList.add("active");
  document.querySelectorAll(`[data-panel="${name}"]`).forEach((link) => link.classList.add("active"));
  const titles = { dashboard:"Dashboard", produk:"Produk", pesanan:"Pesanan", pembayaran:"Pembayaran", keuntungan:"Keuntungan", tampilan:"Tampilan", kirim:"Kirim File", pengaturan:"Pengaturan", laporan:"Laporan" };
  const top = document.getElementById("admTopTitle");
  if (top) top.textContent = titles[name] || name;

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
    try {
      var st = getSettings();
      if (window.VoxyyBranding && window.VoxyyBranding.apply) window.VoxyyBranding.apply(st);
      var logo = st.logoUrl || st.logo || "logo.png";
      var nama = st.namaToko || "VOXY MARKET";
      var elL = document.getElementById("adminBrandLogo");
      if (elL) elL.src = logo;
      var elT = document.getElementById("adminBrandTitle");
      if (elT) {
        var base = String(nama).replace(/\s*MARKET\s*$/i, "").trim() || "VOXY";
        elT.innerHTML = base + ' ADMIN <i class="fa-solid fa-circle-check verified" style="color:#2196f3;font-size:12px;"></i>';
      }
      if (st.bgColor) {
        document.body.style.background = st.bgColor;
        document.body.style.backgroundImage = "none";
      }
    } catch (e) {}
  })();
  if (name === "produk") loadProdukAdm();
  if (name === "pesanan") loadPesanan();
  if (name === "pembayaran") loadPembayaran();
  if (name === "keuntungan") loadKeuntungan();
  if (name === "tampilan") loadTampilan();
  if (name === "kirim") loadKirim();
  if (name === "pengaturan") loadPengaturan();
  if (name === "laporan") loadLaporanAdm();
}

/* ========== DASHBOARD ========== */
function showAdmToast(msg) {
  const el = document.getElementById("admToast");
  const tx = document.getElementById("admToastText");
  if (tx) tx.textContent = msg || "Berhasil";
  if (!el) { alert(msg || "Berhasil"); return; }
  el.classList.add("show");
  clearTimeout(window._admToastT);
  window._admToastT = setTimeout(function () { el.classList.remove("show"); }, 2200);
}
window.showAdmToast = showAdmToast;

function showKirimSukses(kode, fileName) {
  const ov = document.getElementById("kirimSuksesOverlay");
  const tx = document.getElementById("kirimSuksesText");
  if (tx) {
    tx.textContent = "Kode " + (kode || "-") +
      (fileName ? " · " + fileName : "") +
      " — pembeli bisa unduh di Pesanan Saya.";
  }
  if (ov) {
    ov.classList.add("show");
    clearTimeout(window._kirimSuksesT);
    window._kirimSuksesT = setTimeout(function () {
      ov.classList.remove("show");
    }, 2800);
  }
  showAdmToast("✓ Produk telah dikirim ke " + (kode || "pembeli"));
}
window.showKirimSukses = showKirimSukses;


function drawLineChart(canvas, values, color) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 300;
  const h = canvas.getAttribute("height") || 140;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const data = values && values.length ? values : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max.apply(null, data.concat([1]));
  const pad = 12;
  const chartW = w - pad * 2;
  const chartH = h - pad * 2;
  // grid
  ctx.strokeStyle = "#1e2a45";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = pad + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
  }
  // line
  ctx.strokeStyle = color || "#42a5f5";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  data.forEach(function (v, i) {
    const x = pad + (chartW * i) / Math.max(data.length - 1, 1);
    const y = pad + chartH - (v / max) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  // fill
  const lastX = pad + chartW;
  const firstX = pad;
  ctx.lineTo(lastX, pad + chartH);
  ctx.lineTo(firstX, pad + chartH);
  ctx.closePath();
  ctx.fillStyle = (color || "#42a5f5") + "33";
  ctx.fill();
  // dots
  data.forEach(function (v, i) {
    const x = pad + (chartW * i) / Math.max(data.length - 1, 1);
    const y = pad + chartH - (v / max) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color || "#42a5f5";
    ctx.fill();
  });
}

function drawPieChart(canvas, items, legendEl) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 280;
  const h = Number(canvas.getAttribute("height") || 140);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const colors = ["#42a5f5", "#66bb6a", "#ffb74d", "#ab47bc", "#ef5350", "#26c6da", "#ec407a"];
  const total = items.reduce(function (s, x) { return s + x.v; }, 0) || 1;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 8;
  let ang = -Math.PI / 2;
  items.forEach(function (it, i) {
    const slice = (it.v / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, ang, ang + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ang += slice;
  });
  // hole
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "#12182a";
  ctx.fill();
  if (legendEl) {
    legendEl.innerHTML = items
      .map(function (it, i) {
        const pct = Math.round((it.v / total) * 100);
        return (
          '<div style="display:flex;align-items:center;gap:6px;margin:3px 0;">' +
          '<span style="width:10px;height:10px;border-radius:3px;background:' +
          colors[i % colors.length] +
          ';display:inline-block;"></span>' +
          '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          escapeHtml(it.n) +
          '</span><b style="color:#cfd8e3;">' +
          pct +
          '%</b></div>'
        );
      })
      .join("");
  }
}

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

  const elSaldo = document.getElementById("statSaldo");
  const elJual = document.getElementById("statPenjualan");
  const elPend = document.getElementById("statPending");
  const elSuk = document.getElementById("statSukses");
  if (elSaldo) elSaldo.textContent = formatRp(profit);
  if (elJual) elJual.textContent = orders.length;
  if (elPend) elPend.textContent = pending;
  if (elSuk) elSuk.textContent = sukses;

  // Tren omzet 7 bucket
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  const now = Date.now();
  const day = 86400000;
  orders.forEach(function (o) {
    const st = String(o.status || "").toLowerCase();
    if (st.includes("tolak") || st.includes("draft")) return;
    const t = Number(o.createdAt) || Date.parse(o.waktu || "") || now;
    const diff = Math.floor((now - t) / day);
    const idx = 6 - Math.min(6, Math.max(0, diff));
    buckets[idx] += parseRp(o.total) || 1;
  });
  drawLineChart(document.getElementById("chartOmzet"), buckets, "#42a5f5");

  // Produk terlaris (pie) — semua order aktif (pending/proses/sukses) agar bergerak saat ada order baru
  const map = {};
  orders.forEach(function (o) {
    const st = String(o.status || "").toLowerCase();
    if (st.includes("tolak") || st.includes("draft")) return;
    const n = o.paket || "Lainnya";
    const amt = parseRp(o.total) || 1;
    map[n] = (map[n] || 0) + amt;
  });
  let items = Object.keys(map).map(function (k) { return { n: k, v: map[k] }; });
  items.sort(function (a, b) { return b.v - a.v; });
  items = items.slice(0, 6);
  if (!items.length) items = [{ n: "Belum ada data", v: 1 }];
  drawPieChart(document.getElementById("chartPie"), items, document.getElementById("chartPieLegend"));

  const box = document.getElementById("dashboardOrders");
  if (!box) return;
  const recent = orders.slice().sort(function (a, b) {
    return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
  }).slice(0, 8);
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

async function loadProdukAdm() {
  let list = getProdukAdmin();
  try {
    if (window.VoxyyOrders && window.VoxyyOrders.getProdukGlobal) {
      const remote = await window.VoxyyOrders.getProdukGlobal();
      if (remote && remote.length) {
        list = remote;
        localStorage.setItem(PRODUK_KEY, JSON.stringify(list));
      }
    }
  } catch (e) {}
  const box = document.getElementById("listProdukAdm");
  if (!box) return;
  if (!list.length) {
    box.innerHTML = '<p style="color:#888;">Belum ada produk. Klik Tambah Produk.</p>';
    return;
  }
  box.innerHTML = list
    .map(
      (p, i) => {
        const pid = String(p.id || i).replace(/'/g, "");
        return `
    <div class="produk-card-adm">
      <div class="row">
        <div style="flex:1;min-width:0;">
          ${p.img ? '<img src="'+escapeHtml(p.img)+'" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;margin-bottom:6px;border:1px solid #1e2a45;" onerror="this.style.display=\'none\'">' : ""}
          <strong>${escapeHtml(p.judul)}</strong>
          <span class="badge-st ${p.status === "aktif" ? "sukses" : "tolak"}">${escapeHtml(p.status || "")}</span>
          <br><small style="color:#888;">${escapeHtml(p.kategori)} · ${formatRp(p.harga)} · Stok: ${p.stok == -1 ? "∞" : p.stok}</small>
          <br><small style="color:#666;">${escapeHtml(p.deskripsi || "").substring(0, 80)}</small>
        </div>
        <div style="display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;flex-shrink:0;margin-top:10px;width:100%;">
          <button type="button" class="btn-adm outline" style="margin:0;padding:10px 14px;min-height:44px;font-size:13px;font-weight:700;cursor:pointer;pointer-events:auto;z-index:2;flex:1;" onclick="event.stopPropagation();editProdukById('${pid}')"><i class="fa-solid fa-pen"></i> Edit produk</button>
          <button type="button" class="btn-adm danger" style="margin:0;padding:10px 14px;min-height:44px;font-size:13px;font-weight:700;cursor:pointer;pointer-events:auto;z-index:2;flex:1;" onclick="event.stopPropagation();hapusProdukById('${pid}')"><i class="fa-solid fa-trash"></i> Hapus</button>
        </div>
      </div>
    </div>`;
      }
    )
    .join("");
}

async function simpanProduk() {
  const id = document.getElementById("produkId").value;
  let imgVal = (document.getElementById("produkImg").value || "").trim();
  const fotoFile = document.getElementById("produkFotoFile");
  const f = fotoFile && fotoFile.files && fotoFile.files[0];
  if (f) {
    try {
      if (f.size > 900000 && !f.type.startsWith("image/")) {
        alert("File terlalu besar. Kompres atau pakai URL.");
        return;
      }
      if (f.type.startsWith("image/")) {
        imgVal = await compressImageFile(f, 800, 220);
      } else {
        try {
          const up = await uploadDeliveryFile("produk", f);
          imgVal = up.url;
        } catch (e) {
          imgVal = await new Promise(function (res, rej) {
            const r = new FileReader();
            r.onload = function () { res(r.result); };
            r.onerror = rej;
            r.readAsDataURL(f);
          });
        }
      }
    } catch (e) {
      alert("Gagal baca foto: " + (e.message || e));
      return;
    }
  }
  if (!imgVal) imgVal = "logo.png";

  const item = {
    id: id || "p" + Date.now(),
    judul: document.getElementById("produkJudul").value.trim(),
    kategori: document.getElementById("produkKategori").value,
    label: (document.getElementById("produkKategori").value || "digital").toUpperCase(),
    harga: Number(document.getElementById("produkHarga").value) || 0,
    modal: Number(document.getElementById("produkModal").value) || 0,
    stok: Number(document.getElementById("produkStok").value),
    deskripsi: document.getElementById("produkDeskripsi").value.trim(),
    img: imgVal,
    file: document.getElementById("produkFile").value.trim(),
    status: document.getElementById("produkStatus").value || "aktif",
  };
  if (!item.judul) {
    alert("Judul wajib diisi");
    return;
  }
  if (isNaN(item.stok)) item.stok = -1;

  let list = getProdukAdmin();
  // merge dari firebase kalau local kosong
  try {
    if (window.VoxyyOrders && window.VoxyyOrders.getProdukGlobal) {
      const remote = await window.VoxyyOrders.getProdukGlobal();
      if (remote && remote.length) {
        // merge by id: remote base, local overrides
        var map = {};
        remote.forEach(function (p) { if (p && p.id) map[String(p.id)] = p; });
        list.forEach(function (p) { if (p && p.id) map[String(p.id)] = p; });
        list = Object.keys(map).map(function (k) { return map[k]; });
      }
    }
  } catch (e) {}

  if (id) {
    const idx = list.findIndex((p) => String(p.id) === String(id));
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], item);
    else list.push(item);
  } else {
    list.push(item);
  }
  saveProdukAdmin(list);
  try {
    localStorage.setItem("voxyy_joki_catalog", JSON.stringify(list.filter((p) => p.status === "aktif")));
  } catch (e) {}
  if (window.VoxyyOrders && window.VoxyyOrders.saveProdukGlobal) {
    try {
      await window.VoxyyOrders.saveProdukGlobal(list);
    } catch (e) {
      console.warn(e);
    }
  }
  resetFormProduk();
  document.getElementById("formProduk").style.display = "none";
  await loadProdukAdm();
  if (window.showAdmToast) showAdmToast("Produk disimpan — muncul di semua device");
  else alert("Produk disimpan!");
}



function editProduk(i) {
  editProdukById(null, i);
}
function editProdukById(id, index) {
  const list = getProdukAdmin();
  let p = null;
  if (id != null && id !== "") {
    p = list.find(function (x) { return String(x.id) === String(id); });
  }
  if (!p && index != null && list[index]) p = list[index];
  if (!p) {
    alert("Produk tidak ditemukan. Refresh halaman admin.");
    return;
  }
  document.getElementById("produkId").value = p.id || "";
  document.getElementById("produkJudul").value = p.judul || "";
  var kat = p.kategori || "digital";
  var sel = document.getElementById("produkKategori");
  if (sel) {
    var ok = false;
    for (var oi = 0; oi < sel.options.length; oi++) {
      if (sel.options[oi].value === kat) { ok = true; break; }
    }
    sel.value = ok ? kat : "digital";
  }
  document.getElementById("produkHarga").value = p.harga || 0;
  document.getElementById("produkModal").value = p.modal || 0;
  document.getElementById("produkStok").value = p.stok != null ? p.stok : -1;
  document.getElementById("produkDeskripsi").value = p.deskripsi || "";
  document.getElementById("produkImg").value = (p.img && !String(p.img).startsWith("data:")) ? p.img : (p.img || "");
  if (p.img && String(p.img).startsWith("data:")) {
    document.getElementById("produkImg").value = p.img;
  }
  document.getElementById("produkFile").value = p.file || "";
  document.getElementById("produkStatus").value = p.status || "aktif";
  var ff = document.getElementById("produkFotoFile");
  if (ff) ff.value = "";
  var form = document.getElementById("formProduk");
  if (form) {
    form.style.display = "block";
    try { form.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
  }
  if (window.showAdmToast) showAdmToast("Edit: " + (p.judul || "produk"));
}

function hapusProduk(i) {
  hapusProdukById(null, i);
}
async function hapusProdukById(id, index) {
  if (!confirm("Hapus produk ini?")) return;
  let list = getProdukAdmin();
  if (id != null && id !== "") {
    list = list.filter(function (x) { return String(x.id) !== String(id); });
  } else if (index != null) {
    list.splice(index, 1);
  }
  localStorage.setItem(PRODUK_KEY, JSON.stringify(list));
  try {
    if (window.VoxyyOrders && window.VoxyyOrders.saveProdukGlobal) {
      await window.VoxyyOrders.saveProdukGlobal(list);
    }
  } catch (e) {
    console.warn(e);
  }
  // sync catalog keys
  try {
    localStorage.setItem("voxyy_joki_catalog", JSON.stringify(list));
    localStorage.setItem("voxyy_digital", JSON.stringify(list));
  } catch (e) {}
  if (window.showAdmToast) showAdmToast("Produk dihapus");
  await loadProdukAdm();
}
window.editProduk = editProduk;
window.editProdukById = editProdukById;
window.hapusProduk = hapusProduk;
window.hapusProdukById = hapusProdukById;


/* ========== PESANAN ========== */
window._arsipPage = 0;
const ARSIP_PER_PAGE = 10;

function toggleFormOrder() {
  const f = document.getElementById("formOrder");
  f.style.display = f.style.display === "none" ? "block" : "none";
}


async function loadPesanan(force) {
  // Jangan re-render list kalau admin lagi pilih file / ketik URL / lagi kirim
  // (re-render = file input hilang → keluar-masuk kesal)
  if (!force && isPesananFormDirty()) {
    console.log("[pesanan] skip refresh — form sedang diisi");
    return;
  }
  const orders = await fetchOrders();
  const filter = (document.getElementById("filterStatus") || {}).value || "aktif";
  let filtered = orders.slice();

  function isDone(o) {
    // Aktif list: Proses & Menunggu TETAP tampil. Sukses & Tolak HILANG.
    const s = String(o.status || "").toLowerCase();
    if (s.includes("tolak")) return true;
    if (s.includes("sukses") || s.includes("selesai")) return true;
    return false; // Proses / Menunggu / dll tetap di list
  }

  if (filter === "aktif") {
    filtered = filtered.filter((o) => !isDone(o));
  } else if (filter === "sukses") {
    filtered = filtered.filter((o) => {
      const s = String(o.status || "").toLowerCase();
      return s.includes("sukses") || s.includes("selesai");
    });
  } else if (filter === "tolak") {
    filtered = filtered.filter((o) => String(o.status || "").toLowerCase().includes("tolak"));
  } else if (filter !== "all") {
    filtered = filtered.filter((o) =>
      String(o.status || "").toLowerCase().includes(String(filter).toLowerCase())
    );
  }

  // terbaru dulu
  filtered.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));

  const box = document.getElementById("listOrders");
  if (!box) return;
  if (!filtered.length) {
    box.innerHTML =
      filter === "aktif"
        ? '<p style="color:#8aa0b8;">Tidak ada pesanan aktif. Order baru muncul di sini otomatis.</p>'
        : '<p style="color:#8aa0b8;">Tidak ada pesanan di filter ini.</p>';
    return;
  }

  box.innerHTML = filtered
    .map((o) => {
      const cls = statusClass(o.status);
      const kode = escapeHtml(o.kode || "");
      const st = String(o.status || "").toLowerCase();
      const isNew =
        st.includes("belum") ||
        st.includes("verifikasi") ||
        st.includes("menunggu") ||
        !st;
      const total = o.total != null ? o.total : o.finalAmount != null ? "Rp " + Number(o.finalAmount).toLocaleString("id-ID") : "-";
      const border = isNew
        ? "border-color:#2196f3;box-shadow:0 0 0 1px rgba(33,150,243,0.35);"
        : "";
      return `<div class="order-card" style="${border}">
        <div class="row">
          <div style="flex:1;min-width:0;">
            ${isNew ? '<span style="background:#1565c0;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;margin-right:6px;">BARU</span>' : ""}
            <strong>${kode}</strong> · ${escapeHtml(o.nama || "Customer")}
            <br><small style="color:#cfd8e3;font-weight:600;">${escapeHtml(o.paket || "-")}</small>
            <br><small style="color:#90caf9;">Harga: ${escapeHtml(String(total))}</small>
            <br><small style="color:#6a7a90;">${escapeHtml(String(o.waktu || ""))}</small>
            ${o.bukti ? `<div style="margin-top:8px;"><div style="font-size:11px;color:#90caf9;font-weight:700;margin-bottom:4px;">📷 Bukti TF</div><a href="${escapeHtml(o.bukti)}" target="_blank"><img src="${escapeHtml(o.bukti)}" alt="Bukti TF" style="max-width:100%;max-height:160px;border-radius:8px;border:1px solid #1e2a45;display:block;"></a></div>` : `<div style="margin-top:6px;font-size:11px;color:#ef9a9a;">Belum ada bukti TF</div>`}
            ${(o.targetLink || o.linkTarget || o.linkJasa) ? `<div style="margin-top:10px;padding:10px;background:#0a0e18;border-radius:10px;border:1px solid #1e2a45;"><div style="font-size:11px;color:#90caf9;font-weight:700;margin-bottom:4px;">🔗 Link target jasa</div><div style="font-size:12px;color:#e3eaf2;word-break:break-all;margin-bottom:8px;">${escapeHtml(o.targetLink || o.linkTarget || o.linkJasa)}</div><button type="button" class="btn-adm outline" style="margin:0;padding:8px 12px;font-size:12px;" onclick="navigator.clipboard.writeText('${escapeHtml(String(o.targetLink || o.linkTarget || o.linkJasa).replace(/'/g, ""))}').then(function(){if(window.showAdmToast)showAdmToast('Link disalin');else alert('Link disalin');})"><i class="fa-solid fa-copy"></i> Salin link</button></div>` : (isOrderJasa(o) ? `<div style="margin-top:8px;font-size:11px;color:#ffb74d;">Menunggu pembeli isi link target…</div>` : "")}
          </div>
          <div style="text-align:right;">
            <span class="badge-st ${cls}">${escapeHtml(o.status || "Belum Bayar")}</span>
          </div>
        </div>

        ${isOrderJasa(o) ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #1e2a45;">
          <div style="font-size:11px;color:#90caf9;margin-bottom:8px;font-weight:700;">Jasa suntik — salin link & ubah status saja</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
            <select id="st_${kode}" style="flex:1;min-width:140px;padding:8px 10px;border-radius:8px;background:#0d1220;border:1px solid #1e2a45;color:#fff;font-size:12px;" onchange="gantiStatusSelect('${kode}', this.value)">
              <option value="Menunggu Verifikasi" ${!(String(o.status||'').toLowerCase().includes('sukses')||String(o.status||'').toLowerCase().includes('selesai')||String(o.status||'').toLowerCase().includes('tolak')||String(o.status||'').toLowerCase().includes('proses'))?'selected':''}>Menunggu Verifikasi</option>
              <option value="Proses" ${String(o.status||'').toLowerCase().includes('proses')?'selected':''}>Proses</option>
              <option value="Sukses" ${(String(o.status||'').toLowerCase().includes('sukses')||String(o.status||'').toLowerCase().includes('selesai'))?'selected':''}>Sukses</option>
              <option value="Ditolak" ${String(o.status||'').toLowerCase().includes('tolak')?'selected':''}>Ditolak</option>
            </select>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
            <button type="button" class="btn-adm" style="margin:0;padding:8px 12px;font-size:12px;background:#1565c0;" onclick="gantiStatusSelect('${kode}','Proses')">Proses</button>
            <button type="button" class="btn-adm success" style="margin:0;padding:8px 12px;font-size:12px;" onclick="gantiStatusSelect('${kode}','Sukses')">Sukses</button>
            <button type="button" class="btn-adm danger" style="margin:0;padding:8px 12px;font-size:12px;" onclick="gantiStatusSelect('${kode}','Ditolak')">Tolak</button>
          </div>
          <p style="font-size:10px;color:#6a7a90;margin:6px 0 0;">Proses = tetap di list · Sukses/Tolak = hilang dari list aktif</p>
        </div>
        ` : `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #1e2a45;">
          <div style="font-size:11px;color:#8aa0b8;margin-bottom:6px;font-weight:600;">1. Pilih status (digital: kirim file dulu baru Sukses)</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
            <select id="st_${kode}" style="flex:1;min-width:140px;padding:8px 10px;border-radius:8px;background:#0d1220;border:1px solid #1e2a45;color:#fff;font-size:12px;" onchange="gantiStatusSelect('${kode}', this.value)">
              <option value="Menunggu Verifikasi" ${!(String(o.status||'').toLowerCase().includes('sukses')||String(o.status||'').toLowerCase().includes('selesai')||String(o.status||'').toLowerCase().includes('tolak')||String(o.status||'').toLowerCase().includes('proses'))?'selected':''}>Menunggu Verifikasi</option>
              <option value="Proses" ${String(o.status||'').toLowerCase().includes('proses')?'selected':''}>Proses</option>
              <option value="Sukses" ${(String(o.status||'').toLowerCase().includes('sukses')||String(o.status||'').toLowerCase().includes('selesai'))?'selected':''}>Sukses</option>
              <option value="Ditolak" ${String(o.status||'').toLowerCase().includes('tolak')?'selected':''}>Ditolak</option>
            </select>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
            <button type="button" class="btn-adm" style="margin:0;padding:8px 12px;font-size:12px;background:#1565c0;" onclick="gantiStatusSelect('${kode}','Proses')">Proses</button>
            <button type="button" class="btn-adm success" style="margin:0;padding:8px 12px;font-size:12px;" onclick="gantiStatusSelect('${kode}','Sukses')">Sukses</button>
            <button type="button" class="btn-adm danger" style="margin:0;padding:8px 12px;font-size:12px;" onclick="gantiStatusSelect('${kode}','Ditolak')">Tolak</button>
          </div>
          <div style="font-size:11px;color:#8aa0b8;margin-bottom:6px;font-weight:600;">2. Kirim produk (file ATAU URL — salah satu)</div>
          <div style="display:flex;gap:6px;margin-bottom:10px;">
            <button type="button" id="modeFile_${kode}" class="btn-adm" style="margin:0;flex:1;padding:8px;font-size:12px;background:#1565c0;" onclick="setOrderKirimMode('${kode}','file')">📁 File saja</button>
            <button type="button" id="modeUrl_${kode}" class="btn-adm outline" style="margin:0;flex:1;padding:8px;font-size:12px;" onclick="setOrderKirimMode('${kode}','url')">🔗 URL saja</button>
          </div>
          <div id="boxFile_${kode}">
            <label style="font-size:11px;color:#8aa0b8;">Pilih file dari HP (APK / ZIP / foto / dll)</label>
            <input type="file" id="file_${kode}" style="font-size:12px;color:#ccc;width:100%;margin:4px 0 8px;" onchange="onOrderFilePicked('${kode}')">
            <div id="fileNameHint_${kode}" style="font-size:11px;color:#64b5f6;margin-bottom:8px;display:none;"></div>
          </div>
          <div id="boxUrl_${kode}" style="display:none;">
            <label style="font-size:11px;color:#8aa0b8;">Tempel link download saja</label>
            <input type="text" id="url_${kode}" placeholder="Tempel link di sini (contoh: https://drive.google.com/...)" value="" style="width:100%;margin:4px 0 8px;" onfocus="window._lockPesananForm=true;window._kirimModeMap=window._kirimModeMap||{};window._kirimModeMap['${kode}']='url';" oninput="window._lockPesananForm=true;">
          </div>
          <input type="text" id="note_${kode}" placeholder="Catatan untuk pembeli (opsional)" style="width:100%;margin:0 0 8px;">
          <button type="button" class="btn-adm success" id="btnKirim_${kode}" style="margin:0;width:100%;" onclick="kirimLangsung('${kode}')">
            <i class="fa-solid fa-paper-plane"></i> Kirim ke Pembeli & Selesai
          </button>
          <p style="font-size:10px;color:#6a7a90;margin:6px 0 0;">File mode = cukup pilih file. URL mode = cukup tempel link. Tidak perlu dua-duanya.</p>
        </div>
        `}
      </div>`;
    })
    .join("");

  // arsip bukti (sukses/tolak) selalu di-render di bawah
  renderArsipBukti(orders);
}

function parseMoneyAdm(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && !isNaN(v)) return v;
  var n = parseInt(String(v).replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function renderArsipBukti(allOrders) {
  const grid = document.getElementById("arsipBuktiGrid");
  const pager = document.getElementById("arsipPager");
  const info = document.getElementById("arsipInfo");
  if (!grid) return;

  const done = (allOrders || []).filter(function (o) {
    const s = String(o.status || "").toLowerCase();
    return s.includes("sukses") || s.includes("selesai") || s.includes("tolak");
  });
  // yang punya bukti dulu, lalu tanpa bukti
  done.sort(function (a, b) {
    const ta = Number(a.dikirimTs || a.createdAt) || 0;
    const tb = Number(b.dikirimTs || b.createdAt) || 0;
    return tb - ta;
  });

  const total = done.length;
  const pages = Math.max(1, Math.ceil(total / ARSIP_PER_PAGE));
  if (window._arsipPage >= pages) window._arsipPage = pages - 1;
  if (window._arsipPage < 0) window._arsipPage = 0;
  const start = window._arsipPage * ARSIP_PER_PAGE;
  const slice = done.slice(start, start + ARSIP_PER_PAGE);

  if (info) {
    info.textContent = total
      ? total + " arsip · halaman " + (window._arsipPage + 1) + "/" + pages
      : "Belum ada arsip";
  }

  if (!slice.length) {
    grid.innerHTML =
      '<p style="color:#6a7a90;grid-column:1/-1;font-size:12px;">Belum ada pesanan selesai. Setelah Sukses/Tolak, kode + harga + produk + bukti TF tetap di sini.</p>';
    if (pager) pager.innerHTML = "";
    return;
  }

  grid.innerHTML = slice
    .map(function (o) {
      const kode = escapeHtml(o.kode || "-");
      const paket = escapeHtml(o.paket || o.judul || "-");
      const hargaN = parseMoneyAdm(o.finalAmount != null ? o.finalAmount : o.total);
      const harga =
        hargaN > 0
          ? "Rp " + hargaN.toLocaleString("id-ID")
          : escapeHtml(String(o.total || "-"));
      const st = escapeHtml(o.status || "");
      const bukti = o.bukti || o.buktiTf || o.buktiURL || "";
      const img = bukti
        ? '<a href="' +
          escapeHtml(bukti) +
          '" target="_blank"><img src="' +
          escapeHtml(bukti) +
          '" alt="Bukti" style="width:100%;height:110px;object-fit:cover;border-radius:8px;border:1px solid #1e2a45;display:block;background:#0a0e18;"/></a>'
        : '<div style="width:100%;height:110px;border-radius:8px;background:#0a0e18;border:1px dashed #1e2a45;display:flex;align-items:center;justify-content:center;font-size:11px;color:#6a7a90;">Tanpa foto</div>';
      const cls = statusClass(o.status);
      return (
        '<div style="background:#12182a;border:1px solid #1e2a45;border-radius:12px;padding:10px;">' +
        img +
        '<div style="margin-top:8px;font-size:11px;font-weight:700;color:#90caf9;word-break:break-all;">' +
        kode +
        "</div>" +
        '<div style="font-size:12px;color:#e3eaf2;margin-top:2px;line-height:1.3;">' +
        paket +
        "</div>" +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;gap:4px;">' +
        '<span style="font-size:12px;color:#64b5f6;font-weight:700;">' +
        harga +
        "</span>" +
        '<span class="badge-st ' +
        cls +
        '" style="font-size:10px;">' +
        st +
        "</span>" +
        "</div>" +
        '<div style="font-size:10px;color:#6a7a90;margin-top:4px;">' +
        escapeHtml(String(o.nama || "")) +
        (o.waktu ? " · " + escapeHtml(String(o.waktu)) : "") +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  if (pager) {
    if (pages <= 1) {
      pager.innerHTML = "";
    } else {
      pager.innerHTML =
        '<button type="button" class="btn-adm outline" style="margin:0;padding:8px 12px;" onclick="arsipPrev()" ' +
        (window._arsipPage <= 0 ? "disabled" : "") +
        '><i class="fa-solid fa-chevron-left"></i> Sebelumnya</button>' +
        '<span style="font-size:12px;color:#8aa0b8;">' +
        (window._arsipPage + 1) +
        " / " +
        pages +
        "</span>" +
        '<button type="button" class="btn-adm outline" style="margin:0;padding:8px 12px;" onclick="arsipNext(' +
        pages +
        ')" ' +
        (window._arsipPage >= pages - 1 ? "disabled" : "") +
        '>Berikutnya <i class="fa-solid fa-chevron-right"></i></button>';
    }
  }
}

async function arsipPrev() {
  window._arsipPage = Math.max(0, (window._arsipPage || 0) - 1);
  const orders = await fetchOrders();
  renderArsipBukti(orders);
}
async function arsipNext(pages) {
  window._arsipPage = Math.min((pages || 1) - 1, (window._arsipPage || 0) + 1);
  const orders = await fetchOrders();
  renderArsipBukti(orders);
}
window.renderArsipBukti = renderArsipBukti;
window.arsipPrev = arsipPrev;
window.arsipNext = arsipNext;


async function tandaiSukses(kode) {
  alert("Untuk menyelesaikan pesanan, pilih File atau URL lalu tekan «Kirim ke Pembeli & Selesai».\nStatus Sukses otomatis setelah produk terkirim.");
}
window.tandaiSukses = tandaiSukses;

function isOrderJasa(o) {
  // UI khusus (link + status, tanpa file) HANYA untuk suntik
  if (!o) return false;
  var p = String(o.paket || o.judul || "").toLowerCase();
  return p.indexOf("suntik") >= 0;
}


async function gantiStatusSelect(kode, status) {
  if (!kode || !status) return;
  const s = String(status).toLowerCase();
  var orderObj = null;
  try {
    var all = await fetchOrders();
    orderObj = (all || []).find(function (o) {
      return String(o.kode || "").toUpperCase() === String(kode).toUpperCase();
    });
  } catch (e) {}
  var jasa = typeof isOrderJasa === "function" && isOrderJasa(orderObj);
  // Digital: Sukses sebaiknya setelah ada file — tapi jangan blok total jika admin yakin
  if ((s.includes("sukses") || s.includes("selesai")) && !jasa && orderObj) {
    var hasFile = !!(orderObj.file || orderObj.download || orderObj.fileUrl || orderObj.dikirimTs);
    if (!hasFile) {
      var ok = confirm("Belum ada file/URL terkirim untuk order ini.\nTetap set Sukses?");
      if (!ok) {
        // kembalikan select
        try {
          var sel = document.getElementById("st_" + kode);
          if (sel) sel.value = orderObj.status || "Menunggu Verifikasi";
        } catch (e) {}
        return;
      }
    }
  }
  try {
    await updateOrder(kode, { status: status, updatedAt: Date.now() });
    showAdmToast("Status: " + status);
    // Reload list — Sukses/Tolak hilang dari Aktif, Proses tetap
    await loadPesanan(true);
  } catch (e) {
    alert("Gagal ubah status: " + (e.message || e));
  }
}

async function ubahStatusKode(kode, status) {
  if (!kode) return;
  try {
    if (window.VoxyyOrders && window.VoxyyOrders.updateOrderByKode) {
      await window.VoxyyOrders.updateOrderByKode(kode, { status: status });
    }
  } catch (e) {
    alert("Gagal ubah status: " + (e.message || e));
    return;
  }
  loadPesanan();
  loadDashboard();
}

async function tolakOrder(kode) {
  if (!confirm("Tolak pesanan " + kode + "? Akan hilang dari daftar aktif.")) return;
  await ubahStatusKode(kode, "Ditolak");
}



window._pickedFiles = window._pickedFiles || {};
window._lockPesananForm = false;

function isPesananFormDirty() {
  if (window._kirimBusy) return true;
  if (window._lockPesananForm) return true;
  try {
    var files = document.querySelectorAll('[id^="file_"]');
    for (var i = 0; i < files.length; i++) {
      if (files[i].files && files[i].files.length > 0) return true;
    }
    var urls = document.querySelectorAll('[id^="url_"]');
    for (var j = 0; j < urls.length; j++) {
      var v = (urls[j].value || "").trim();
      if (v && v !== "https://" && v !== "http://" && v.indexOf("drive.google.com/...") < 0) return true;
    }
    var notes = document.querySelectorAll('[id^="note_"]');
    for (var k = 0; k < notes.length; k++) {
      if ((notes[k].value || "").trim()) return true;
    }
    // ada file tersimpan di memori
    if (window._pickedFiles) {
      for (var key in window._pickedFiles) {
        if (window._pickedFiles[key]) return true;
      }
    }
  } catch (e) {}
  return false;
}
window.isPesananFormDirty = isPesananFormDirty;

window._kirimModeMap = window._kirimModeMap || {};
function setOrderKirimMode(kode, mode) {
  window._kirimModeMap[kode] = mode === "url" ? "url" : "file";
  window._lockPesananForm = true;
  var boxF = document.getElementById("boxFile_" + kode);
  var boxU = document.getElementById("boxUrl_" + kode);
  var btnF = document.getElementById("modeFile_" + kode);
  var btnU = document.getElementById("modeUrl_" + kode);
  if (mode === "url") {
    if (boxF) boxF.style.display = "none";
    if (boxU) boxU.style.display = "block";
    if (btnF) { btnF.className = "btn-adm outline"; btnF.style.background = ""; }
    if (btnU) { btnU.className = "btn-adm"; btnU.style.background = "#1565c0"; }
    // JANGAN hapus file input / memory — user bisa balik ke File
    var h = document.getElementById("fileNameHint_" + kode);
    if (h && !window._pickedFiles[kode]) { h.style.display = "none"; h.textContent = ""; }
  } else {
    if (boxF) boxF.style.display = "block";
    if (boxU) boxU.style.display = "none";
    if (btnF) { btnF.className = "btn-adm"; btnF.style.background = "#1565c0"; }
    if (btnU) { btnU.className = "btn-adm outline"; btnU.style.background = ""; }
    // restore hint jika ada file di memori
    var h2 = document.getElementById("fileNameHint_" + kode);
    var mem = window._pickedFiles && window._pickedFiles[kode];
    if (mem && h2) {
      h2.style.display = "block";
      h2.textContent = "✓ File siap: " + mem.name + " (" + Math.round(mem.size / 1024) + " KB) — tekan Kirim";
    }
  }
}
function onOrderFilePicked(kode) {
  window._kirimModeMap[kode] = "file";
  window._lockPesananForm = true;
  // Jangan panggil setOrderKirimMode penuh (bisa reset) — cukup pastikan box file tampil
  var boxF = document.getElementById("boxFile_" + kode);
  var boxU = document.getElementById("boxUrl_" + kode);
  var btnF = document.getElementById("modeFile_" + kode);
  var btnU = document.getElementById("modeUrl_" + kode);
  if (boxF) boxF.style.display = "block";
  if (boxU) boxU.style.display = "none";
  if (btnF) { btnF.className = "btn-adm"; btnF.style.background = "#1565c0"; }
  if (btnU) { btnU.className = "btn-adm outline"; btnU.style.background = ""; }
  var fi = document.getElementById("file_" + kode);
  var h = document.getElementById("fileNameHint_" + kode);
  var f = fi && fi.files && fi.files[0];
  if (f) {
    window._pickedFiles[kode] = f;
    if (h) {
      h.style.display = "block";
      h.textContent = "✓ File siap: " + f.name + " (" + Math.round(f.size / 1024) + " KB) — tekan Kirim, jangan pindah tab";
    }
  } else if (h) {
    h.style.display = "none";
    h.textContent = "";
  }
}
window.setOrderKirimMode = setOrderKirimMode;
window.onOrderFilePicked = onOrderFilePicked;

async function kirimLangsung(kode) {
  if (!kode) { alert("Kode kosong"); return; }
  if (window._kirimBusy) { alert("Masih proses kirim, tunggu sebentar..."); return; }

  const mode = (window._kirimModeMap && window._kirimModeMap[kode]) || "file";
  const fileInp = document.getElementById("file_" + kode);
  const urlInp = document.getElementById("url_" + kode);
  const noteInp = document.getElementById("note_" + kode);
  const btn = document.getElementById("btnKirim_" + kode);
  let file = fileInp && fileInp.files && fileInp.files[0];
  if (!file && window._pickedFiles && window._pickedFiles[kode]) {
    file = window._pickedFiles[kode];
  }
  let fileUrl = (urlInp && urlInp.value ? urlInp.value : "").trim();
  if (fileUrl === "https://" || fileUrl === "http://" || fileUrl === "https://..." || fileUrl === "https://") fileUrl = "";
  let fileName = "";
  const catatan = (noteInp && noteInp.value ? noteInp.value : "").trim();

  if (mode === "file") {
    if (!file) {
      alert("Mode File: pilih file dulu, lalu tekan Kirim.\nTidak perlu isi URL.");
      return;
    }
    fileUrl = "";
  } else {
    if (!fileUrl) {
      alert("Mode URL: tempel link dulu, lalu tekan Kirim.\nTidak perlu pilih file.");
      return;
    }
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Kirim ke ' + kode + '...';
  }
  window._kirimBusy = true;
  window._lockPesananForm = true;

  try {
    if (file) {
      // CEPAT: file kecil (<=1.5MB) langsung dataURL — tanpa tunggu Storage
      // Storage hanya untuk file besar (APK/ZIP besar)
      fileName = file.name || "file";
      if (file.size <= 1500000) {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Proses file...';
        fileUrl = await readFileAsDataURL(file);
      } else {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Upload...';
        try {
          const upPromise = uploadDeliveryFile(kode, file);
          const timeoutPromise = new Promise(function (_, rej) {
            setTimeout(function () { rej(new Error("Upload timeout 10 detik")); }, 10000);
          });
          const up = await Promise.race([upPromise, timeoutPromise]);
          if (up && up.url) {
            fileUrl = up.url;
            fileName = up.name || file.name;
          } else {
            throw new Error("Storage tidak mengembalikan URL");
          }
        } catch (upErr) {
          console.warn("[kirim] storage:", upErr);
          throw new Error(
            "Upload file besar gagal / lama.\n" +
            (upErr && upErr.message ? upErr.message : "") +
            "\n\nSolusi cepat: upload ke Google Drive, lalu mode URL saja."
          );
        }
      }
      if (!fileUrl) throw new Error("Gagal mendapatkan link file.");
    } else {
      fileName = (fileUrl.split("/").pop() || "download").split("?")[0];
    }

    if (!window.VoxyyOrders || !window.VoxyyOrders.updateOrderByKode) {
      throw new Error("Sistem order belum siap. Refresh halaman admin, login ulang.");
    }

    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Simpan database...';

    const payload = {
      status: "Sukses",
      file: fileUrl,
      download: fileUrl,
      fileUrl: fileUrl,
      fileName: fileName || "produk",
      catatanAdmin: catatan,
      dikirimAt: new Date().toLocaleString("id-ID"),
      dikirimTs: Date.now(),
      kirimVia: file ? "upload" : "url",
    };

    const res = await window.VoxyyOrders.updateOrderByKode(kode, payload);
    console.log("[kirim] update result", res);
    if (!res || res.ok === false) {
      throw new Error((res && res.error) ? res.error : "Gagal simpan database. Cek koneksi / rules Firebase.");
    }

        // Verifikasi cepat: pastikan file ada di order (local + cloud)
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ke kode order...';
    let verified = false;
    let foundFile = "";
    // local sudah di-update oleh updateOrderByKode — cek local dulu (cepat)
    try {
      const localRaw = localStorage.getItem("voxyy_orders");
      const localList = localRaw ? JSON.parse(localRaw) : [];
      const loc = (localList || []).find(function (o) {
        return String(o.kode || "").toUpperCase() === String(kode).toUpperCase();
      });
      if (loc) {
        foundFile = loc.file || loc.download || loc.fileUrl || "";
        if (foundFile) verified = true;
      }
    } catch (e) {}
    if (!verified) {
      for (var attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) await new Promise(function (r) { setTimeout(r, 250); });
        try {
          const orders = await window.VoxyyOrders.getOrders();
          const found = (orders || []).find(function (o) {
            return String(o.kode || "").toUpperCase() === String(kode).toUpperCase();
          });
          if (!found) continue;
          foundFile = found.file || found.download || found.fileUrl || "";
          if (!foundFile) {
            await window.VoxyyOrders.updateOrderByKode(kode, {
              status: "Sukses",
              file: fileUrl,
              download: fileUrl,
              fileUrl: fileUrl,
              fileName: fileName || "produk",
              dikirimTs: Date.now(),
            });
            continue;
          }
          verified = true;
          break;
        } catch (verErr) {
          console.warn("[kirim] verify", attempt, verErr);
        }
      }
    }
    // Kalau payload kita punya fileUrl, anggap OK (local sudah diisi)
    if (!verified && fileUrl) {
      foundFile = fileUrl;
      verified = true;
    }

    if (!verified || !foundFile) {
      throw new Error(
        "File BELUM masuk ke kode pesanan.\n\n" +
        "Coba mode URL, atau refresh lalu kirim lagi."
      );
    }

    // SUKSES NYATA
    window._kirimBusy = false;
    window._lockPesananForm = false;
    if (window._pickedFiles) delete window._pickedFiles[kode];
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Terkirim';
      btn.style.background = "#2e7d32";
    }
    if (typeof showKirimSukses === "function") showKirimSukses(kode, fileName || "file");
    else if (typeof showAdmToast === "function") showAdmToast("✓ Produk telah dikirim!");
    else alert("Produk telah dikirim!\nKode: " + kode);

    await loadPesanan(true);
    try { await loadDashboard(); } catch (e) {}
  } catch (e) {
    window._kirimBusy = false;
    console.error("[kirim]", e);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim ke Pembeli & Selesai';
      btn.style.background = "";
    }
    alert("GAGAL kirim (produk BELUM ke pembeli):\n\n" + (e && e.message ? e.message : String(e)));
  }
}

window.kirimLangsung = kirimLangsung;

window.ubahStatusKode = ubahStatusKode;
window.tolakOrder = tolakOrder;
window.kirimLangsung = kirimLangsung;

async function ubahStatus(id, status) {
  // kompatibilitas tombol lama → pakai kode
  await ubahStatusKode(id, status);
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

async function onQrisFilePicked(input) {
  const f = input && input.files && input.files[0];
  if (!f) return;
  try {
    let dataUrl;
    if (typeof compressImageFile === "function" && f.type.startsWith("image/")) {
      dataUrl = await compressImageFile(f, 900, 280);
    } else {
      dataUrl = await new Promise(function (res, rej) {
        const r = new FileReader();
        r.onload = function () { res(r.result); };
        r.onerror = rej;
        r.readAsDataURL(f);
      });
    }
    document.getElementById("qrisUrl").value = dataUrl;
    document.getElementById("previewQris").src = dataUrl;
    if (window.showAdmToast) showAdmToast("Foto QRIS dari galeri siap — tekan Simpan");
  } catch (e) {
    alert("Gagal baca foto QRIS: " + (e.message || e));
  }
}
window.onQrisFilePicked = onQrisFilePicked;

async function simpanPembayaran() {
  const qrisEl = document.getElementById("qrisUrl");
  const qris = (qrisEl && qrisEl.value ? qrisEl.value : "").trim() || "qris.png";
  const payload = {
    qrisUrl: qris,
    rekeningInfo: (document.getElementById("rekeningInfo") || {}).value || "",
    catatanBayar: (document.getElementById("catatanBayar") || {}).value || "",
  };
  payload.rekeningInfo = String(payload.rekeningInfo).trim();
  payload.catatanBayar = String(payload.catatanBayar).trim();
  saveSettings(payload);
  var prev = document.getElementById("previewQris");
  if (prev) prev.src = qris;
  try {
    if (window.VoxyyOrders && window.VoxyyOrders.saveSettingsGlobal) {
      await window.VoxyyOrders.saveSettingsGlobal(payload);
    }
  } catch (e) {
    console.warn(e);
  }
  if (window.showAdmToast) showAdmToast("QRIS dari galeri tersimpan — semua device ikut");
  else alert("QRIS & pembayaran disimpan!");
}
window.simpanPembayaran = simpanPembayaran;


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

function compressImageFile(file, maxW, maxKB) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        let q = 0.75, data = c.toDataURL("image/jpeg", q);
        while (data.length > maxKB * 1024 && q > 0.35) {
          q -= 0.1;
          data = c.toDataURL("image/jpeg", q);
        }
        resolve(data);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
  // Langsung terapkan di admin + simpan sementara
  document.body.style.background = c;
  document.body.style.backgroundImage = "none";
  localStorage.setItem("voxyy_bg_color", c);
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
  if (window.VoxyyBranding && window.VoxyyBranding.apply) {
    window.VoxyyBranding.apply(getSettings());
  } else if (window.applyBranding) {
    window.applyBranding(getSettings());
  }
  // update admin header sekarang
  try {
    var s2 = getSettings();
    var logo2 = s2.logoUrl || s2.logo || "logo.png";
    var nama2 = s2.namaToko || "VOXY MARKET";
    var el = document.getElementById("adminBrandLogo");
    if (el) el.src = logo2;
    document.querySelectorAll(".adm-topnav .brand img").forEach(function (im) {
      im.src = logo2;
    });
    var t = document.getElementById("adminBrandTitle");
    if (t) {
      var base = String(nama2).replace(/\s*MARKET\s*$/i, "").trim() || "VOXY";
      t.innerHTML = base + ' <span style="color:#64b5f6">ADMIN</span> <i class="fa-solid fa-circle-check verified" style="color:#2196f3;font-size:12px;"></i>';
    }
    if (s2.bgColor) {
      document.body.style.background = s2.bgColor;
    }
  } catch (e) {}
}

/* ========== PENGATURAN ========== */
function loadPengaturan() {
  const s = getSettings();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set("namaToko", s.namaToko || "VOXY MARKET");
  set("waAdmin", s.waAdmin || "6285151982250");
  set("waBackup", s.waBackup || "6285706128277");
  set("linkChannel", s.linkChannel || "");
  set("linkCs", s.linkCs || "");
  set("linkTelegram", s.linkTelegram || "");
  set("linkIg", s.linkIg || "");
}

function simpanPengaturan() {
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  };
  const data = {
    namaToko: val("namaToko") || "VOXY MARKET",
    waAdmin: val("waAdmin").replace(/\D/g, ""),
    waBackup: val("waBackup").replace(/\D/g, ""),
    linkChannel: val("linkChannel"),
    linkCs: val("linkCs"),
    linkTelegram: val("linkTelegram"),
    linkIg: val("linkIg"),
  };
  saveSettings(data);
  alert("Pengaturan disimpan. Nama & link aktif di semua halaman termasuk admin.");
  if (window.VoxyyBranding && window.VoxyyBranding.apply) {
    window.VoxyyBranding.apply(getSettings());
  }
  try {
    var s = getSettings();
    var nama = s.namaToko || "VOXY MARKET";
    var t = document.getElementById("adminBrandTitle");
    if (t) {
      var base = String(nama).replace(/\s*MARKET\s*$/i, "").trim() || "VOXY";
      t.innerHTML = base + ' ADMIN <i class="fa-solid fa-circle-check verified" style="color:#2196f3;font-size:12px;"></i>';
    }
  } catch (e) {}
}


/* ========== KIRIM PRODUK ========== */
let _kirimMode = "file";
let _kirimLocalFile = null;

function setKirimMode(mode) {
  _kirimMode = mode === "url" ? "url" : "file";
  const f = document.getElementById("kirimModeFile");
  const u = document.getElementById("kirimModeUrl");
  const bf = document.getElementById("tabKirimFile");
  const bu = document.getElementById("tabKirimUrl");
  if (f) f.style.display = _kirimMode === "file" ? "block" : "none";
  if (u) u.style.display = _kirimMode === "url" ? "block" : "none";
  if (bf) {
    bf.style.background = _kirimMode === "file" ? "#2196f3" : "transparent";
    bf.style.color = _kirimMode === "file" ? "#fff" : "#2196f3";
  }
  if (bu) {
    bu.style.background = _kirimMode === "url" ? "#2196f3" : "transparent";
    bu.style.color = _kirimMode === "url" ? "#fff" : "#2196f3";
  }
}
window.setKirimMode = setKirimMode;

function loadKirim() {
  document.getElementById("kirimKode").value = "";
  document.getElementById("kirimInfo").innerHTML = "";
  document.getElementById("kirimPaket").value = "";
  const urlInp = document.getElementById("kirimFile");
  if (urlInp) urlInp.value = "";
  document.getElementById("kirimCatatan").value = "";
  _kirimLocalFile = null;
  const fi = document.getElementById("kirimFileInput");
  if (fi) fi.value = "";
  const fn = document.getElementById("kirimFileName");
  if (fn) fn.textContent = "";
  const prog = document.getElementById("kirimProgress");
  if (prog) { prog.style.display = "none"; prog.textContent = ""; }
  setKirimMode("file");
  if (fi && !fi._bound) {
    fi._bound = true;
    fi.addEventListener("change", function () {
      _kirimLocalFile = (fi.files && fi.files[0]) || null;
      if (fn) {
        fn.textContent = _kirimLocalFile
          ? ("📎 " + _kirimLocalFile.name + " (" + Math.round(_kirimLocalFile.size / 1024) + " KB)")
          : "";
      }
    });
  }
}

async function uploadDeliveryFile(kode, file) {
  if (!file) throw new Error("Tidak ada file");
  if (window.VoxyyOrders && window.VoxyyOrders.initFirebase) {
    try { window.VoxyyOrders.initFirebase(); } catch (e) {}
  }
  // Pastikan app firebase ada
  if (typeof firebase === "undefined") {
    throw new Error("Firebase belum termuat. Refresh halaman admin.");
  }
  if (!firebase.apps || !firebase.apps.length) {
    throw new Error("Firebase app belum init. Refresh halaman.");
  }
  if (!firebase.storage) {
    throw new Error("Firebase Storage script belum termuat.");
  }
  const safeName = String(file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = "deliveries/" + String(kode || "x").replace(/[.#$\[\]]/g, "_") + "/" + Date.now() + "_" + safeName;
  const ref = firebase.storage().ref().child(path);
  const snap = await ref.put(file, {
    contentType: file.type || "application/octet-stream",
    customMetadata: { kode: String(kode || ""), originalName: file.name || safeName },
  });
  const url = await snap.ref.getDownloadURL();
  return { url: url, name: file.name || safeName, path: path, size: file.size };
}

/** Baca file jadi dataURL (untuk fallback kecil) */
function readFileAsDataURL(file) {
  return new Promise(function (resolve, reject) {
    const r = new FileReader();
    r.onload = function () { resolve(r.result); };
    r.onerror = function () { reject(new Error("Gagal baca file")); };
    r.readAsDataURL(file);
  });
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
  const jenis = document.getElementById("kirimJenis").value;
  const catatan = (document.getElementById("kirimCatatan").value || "").trim();
  const paket = (document.getElementById("kirimPaket").value || "").trim();
  if (!kode) { alert("Isi kode order"); return; }

  let fileUrl = "";
  let fileName = "";
  const prog = document.getElementById("kirimProgress");
  const btn = document.getElementById("btnKirimProduk");

  if (_kirimMode === "file") {
    if (!_kirimLocalFile) {
      alert("Pilih file dulu, atau ganti ke mode Link URL.");
      return;
    }
    try {
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengupload...'; }
      if (prog) { prog.style.display = "block"; prog.textContent = "Upload " + _kirimLocalFile.name + "..."; }
      const up = await uploadDeliveryFile(kode, _kirimLocalFile);
      fileUrl = up.url;
      fileName = up.name;
      if (prog) prog.textContent = "Upload berhasil. Menyimpan order...";
    } catch (e) {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim & Tandai Sukses'; }
      alert("Gagal upload file: " + (e && e.message ? e.message : String(e)) + "\n\nCoba mode Link URL, atau cek Firebase Storage rules.");
      return;
    }
  } else {
    fileUrl = (document.getElementById("kirimFile").value || "").trim();
    if (!fileUrl) {
      alert("Isi link URL, atau ganti ke mode Upload File.");
      return;
    }
    fileName = fileUrl.split("/").pop() || "download";
  }

  const orders = await fetchOrders();
  const found = orders.find(o => String(o.kode || "").toUpperCase() === kode.toUpperCase() || String(o._id || "") === kode);
  if (!found) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim & Tandai Sukses'; }
    alert("Order tidak ditemukan. Cari dulu.");
    return;
  }

  const orderKode = found.kode || kode;
  const patch = {
    status: "Sukses",
    file: fileUrl,
    download: fileUrl,
    fileName: fileName,
    jenisFile: jenis,
    catatanAdmin: catatan,
    paket: paket || found.paket,
    dikirimAt: new Date().toLocaleString("id-ID"),
    dikirimTs: Date.now(),
    kirimVia: _kirimMode === "file" ? "upload" : "url",
    // pastikan data pembeli tetap ada
    email: found.email || found.userEmail || "",
    userEmail: found.userEmail || found.email || "",
    nama: found.nama || "",
    wa: found.wa || found.whatsapp || "",
  };

  try {
    let ok = false;
    if (window.VoxyyOrders && typeof window.VoxyyOrders.updateOrderByKode === "function") {
      const res = await window.VoxyyOrders.updateOrderByKode(orderKode, patch);
      ok = !!(res && res.ok);
    } else if (window.VoxyyOrders && typeof window.VoxyyOrders.updateOrder === "function") {
      const res = await window.VoxyyOrders.updateOrder(orderKode, patch);
      ok = !!(res && res.ok !== false);
    } else {
      const idx = orders.findIndex(o => String(o.kode || "").toUpperCase() === String(orderKode).toUpperCase());
      if (idx >= 0) {
        Object.assign(orders[idx], patch);
        localStorage.setItem("voxyy_orders", JSON.stringify(orders));
        ok = true;
      }
    }
    if (!ok) throw new Error("Gagal menulis ke database. Cek koneksi Firebase.");
  } catch (e) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim & Tandai Sukses'; }
    alert("Gagal kirim ke akun pembeli: " + (e && e.message ? e.message : String(e)));
    return;
  }

  const settings = getSettings();
  const profit = parseRp(found.total) - (Number(found.modal) || Math.round(parseRp(found.total) * 0.3));
  settings.totalProfit = (Number(settings.totalProfit) || 0) + profit;
  saveSettings(settings);

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim & Tandai Sukses'; }
  if (window.showAdmToast) showAdmToast("Berhasil dikirim!"); else alert("Produk dikirim!");
  loadKirim();
  loadPesanan();
  loadDashboard();
}




function seedProdukIfEmpty() {
  let list = getProdukAdmin() || [];
  // Pastikan Jasa Suntik Media selalu ada
  if (!list.some(function (p) { return String(p.judul || "").toLowerCase().includes("suntik"); })) {
    list.push({ id: "d7", judul: "Jasa Suntik Media", kategori: "jasa", harga: 5000, modal: 1000, stok: -1, deskripsi: "Suntik followers/view/like media. Setelah bayar, isi link target.", img: "", file: "", status: "aktif" });
    saveProdukAdmin(list);
  }
  if (list && list.length > 1) return; // sudah ada produk lain
  if (list.length === 1 && String(list[0].judul || "").includes("Suntik")) {
    // only suntik — seed full catalog too
  } else if (list.length) return;
  list = [
    { id: "d1", judul: "APK Auto SV Kontak", kategori: "apk", harga: 2000, modal: 500, stok: 25, deskripsi: "Produk digital berkualitas.", img: "", file: "", status: "aktif" },
    { id: "d2", judul: "APK Logo Prem/Mod", kategori: "apk", harga: 3000, modal: 800, stok: 18, deskripsi: "Produk premium siap digunakan.", img: "", file: "", status: "aktif" },
    { id: "d3", judul: "Script Bot Jaga", kategori: "digital", harga: 7000, modal: 2000, stok: 12, deskripsi: "Script siap pakai.", img: "", file: "", status: "aktif" },
    { id: "d4", judul: "Nokos WA Indonesia", kategori: "digital", harga: 6000, modal: 3000, stok: 30, deskripsi: "Nokos WA Indonesia.", img: "", file: "", status: "aktif" },
    { id: "d5", judul: "Jasa Logo Teks", kategori: "jasa", harga: 2000, modal: 500, stok: -1, deskripsi: "Jasa desain logo teks.", img: "", file: "", status: "aktif" },
    { id: "d7", judul: "Jasa Suntik Media", kategori: "jasa", harga: 5000, modal: 1000, stok: -1, deskripsi: "Suntik followers/view/like. Setelah bayar isi link target.", img: "", file: "", status: "aktif" },
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
    try {
      var st = getSettings();
      if (window.VoxyyBranding && window.VoxyyBranding.apply) window.VoxyyBranding.apply(st);
      var logo = st.logoUrl || st.logo || "logo.png";
      var nama = st.namaToko || "VOXY MARKET";
      var elL = document.getElementById("adminBrandLogo");
      if (elL) elL.src = logo;
      var elT = document.getElementById("adminBrandTitle");
      if (elT) {
        var base = String(nama).replace(/\s*MARKET\s*$/i, "").trim() || "VOXY";
        elT.innerHTML = base + ' ADMIN <i class="fa-solid fa-circle-check verified" style="color:#2196f3;font-size:12px;"></i>';
      }
      if (st.bgColor) {
        document.body.style.background = st.bgColor;
        document.body.style.backgroundImage = "none";
      }
    } catch (e) {}
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
      if (active && active.id === "panel-pesanan") {
        if (!isPesananFormDirty()) loadPesanan();
      }
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
    if (active && active.id === "panel-pesanan") {
      if (!isPesananFormDirty()) loadPesanan();
    }
  }, 20000);
}

document.addEventListener("DOMContentLoaded", function () {
  const bg = localStorage.getItem("voxyy_bg_color");
  if (bg) document.body.style.background = bg;

  showAdminGate();

  try {
    if (window.VoxyyOrders) window.VoxyyOrders.initFirebase && window.VoxyyOrders.initFirebase();
  } catch (e) {}

  if (window.VoxyyAuth && typeof window.VoxyyAuth.onAuthChange === "function") {
    window.VoxyyAuth.onAuthChange(function (user) {
      const email = user && user.email ? user.email.toLowerCase() : "";
      if (user && isAdminEmail(email)) {
        localStorage.setItem("voxyy_admin_email", email);
        showAdminApp();
        bootAdminData();
      } else if (user && !isAdminEmail(email)) {
        showAdminGate("Akses ditolak untuk " + email + ". Kembali ke website.");
      } else {
        showAdminGate();
      }
    });
  } else {
    // Auth script belum ready — tunggu sebentar
    let tries = 0;
    const wait = setInterval(function () {
      tries++;
      if (window.VoxyyAuth && window.VoxyyAuth.onAuthChange) {
        clearInterval(wait);
        window.VoxyyAuth.onAuthChange(function (user) {
          const email = user && user.email ? user.email.toLowerCase() : "";
          if (user && isAdminEmail(email)) {
            showAdminApp();
            bootAdminData();
          } else {
            showAdminGate(user ? ("Akses ditolak untuk " + email + ". Bukan akun admin.") : "");
          }
        });
      } else if (tries > 30) {
        clearInterval(wait);
        showAdminGate("Auth belum termuat. Refresh halaman.");
      }
    }, 200);
  }
});


async function adminLogout() {
  try {
    if (window.VoxyyAuth && window.VoxyyAuth.logout) await window.VoxyyAuth.logout();
  } catch (e) {}
  try {
    localStorage.removeItem("voxyy_admin_email");
  } catch (e) {}
  location.replace("login.html");
}
window.adminLogout = adminLogout;


async function loadLaporanAdm() {
  const box = document.getElementById("listLaporanAdm");
  if (!box) return;
  box.innerHTML = '<p style="color:#8aa0b8;">Memuat laporan...</p>';
  let list = [];
  try {
    if (window.VoxyyOrders && window.VoxyyOrders.getLaporan) {
      list = await window.VoxyyOrders.getLaporan();
    } else if (window.VoxyyOrders && window.VoxyyOrders._db) {
      // fallback
    }
  } catch (e) {
    console.warn(e);
  }
  // also try direct
  try {
    if ((!list || !list.length) && window.VoxyyOrders) {
      window.VoxyyOrders.initFirebase && window.VoxyyOrders.initFirebase();
      if (typeof firebase !== "undefined" && firebase.database) {
        const snap = await firebase.database().ref("laporan").once("value");
        const val = snap.val() || {};
        list = Object.keys(val).map(function (k) {
          return Object.assign({ id: k }, val[k]);
        });
      }
    }
  } catch (e) {
    console.warn(e);
  }
  try {
    const local = JSON.parse(localStorage.getItem("voxyy_laporan") || "[]");
    if (local.length) {
      const ids = {};
      (list || []).forEach(function (x) { ids[x.id || x.createdAt] = 1; });
      local.forEach(function (x) {
        if (!ids[x.id || x.createdAt]) list.push(x);
      });
    }
  } catch (e) {}

  list = (list || []).slice().sort(function (a, b) {
    return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
  });

  if (!list.length) {
    box.innerHTML = '<p style="color:#8aa0b8;">Belum ada laporan dari user.</p>';
    return;
  }

  box.innerHTML = list
    .map(function (L) {
      const fotos = L.fotos || L.photos || (L.foto ? [L.foto] : []);
      const imgs = (fotos || [])
        .map(function (src) {
          return '<a href="' + escapeHtml(src) + '" target="_blank"><img src="' + escapeHtml(src) + '" style="max-width:100%;max-height:120px;border-radius:8px;margin:4px 4px 0 0;border:1px solid #1e2a45;"/></a>';
        })
        .join("");
      return (
        '<div class="order-card">' +
        '<div style="font-size:12px;color:#90caf9;font-weight:700;">' +
        escapeHtml(L.email || L.nama || "User") +
        "</div>" +
        '<div style="font-size:11px;color:#6a7a90;margin:2px 0 8px;">' +
        escapeHtml(String(L.waktu || L.createdAt || "")) +
        "</div>" +
        '<div style="font-size:13px;color:#e3eaf2;white-space:pre-wrap;line-height:1.45;">' +
        escapeHtml(L.pesan || L.isi || L.message || "-") +
        "</div>" +
        (imgs ? '<div style="margin-top:8px;">' + imgs + "</div>" : '<div style="margin-top:6px;font-size:11px;color:#ef9a9a;">Tanpa foto</div>') +
        "</div>"
      );
    })
    .join("");
}
window.loadLaporanAdm = loadLaporanAdm;

window.simpanProduk = simpanProduk;
window.toggleFormProduk = toggleFormProduk;
window.loadProdukAdm = loadProdukAdm;
