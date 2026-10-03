const JOKI_CATALOG_VER = "8";

// Load dari admin jika ada
function loadCatalogFromAdmin() {
  try {
    const raw = localStorage.getItem("voxyy_joki_catalog");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) {
        return arr.map((p, i) => ({
          id: p.id || i + 1,
          label: (p.kategori || "JOKI").toUpperCase(),
          judul: p.judul,
          deskripsi: p.deskripsi || "",
          harga: p.harga || 0,
          kategori: p.kategori || "joki",
          fitur: p.fitur || ["Order langsung di web", "Status dapat dipantau"],
          img: p.img,
          file: p.file,
          status: p.status || "aktif"
        }));
      }
    }
  } catch (e) {}
  return null;
}

const _adminCat = loadCatalogFromAdmin();

const paketJokiDefault = [

  {
    id: 1,
    label: "20 JAM",
    kategori: "joki",
    judul: "Joki 20 Jam",
    deskripsi: "Layanan joki kontak selama 20 jam + SW + share 10GB.",
    harga: 500,
    fitur: [
      "20 jam + SW + share 10GB",
      "Order langsung di web",
      "Status dapat dipantau"
    ]
  },
  {
    id: 2,
    label: "1 HARI",
    kategori: "joki",
    judul: "Joki 1 Hari",
    deskripsi: "Layanan joki kontak selama 1 hari + SW + share all GB.",
    harga: 1000,
    fitur: [
      "1 hari + SW + share all GB",
      "Order langsung di web",
      "Status dapat dipantau"
    ]
  },
  {
    id: 3,
    label: "2 HARI",
    kategori: "joki",
    judul: "Joki 2 Hari",
    deskripsi: "Layanan joki kontak selama 2 hari + SW + share all GB.",
    harga: 2000,
    badge: "Paling Laris",
    fitur: [
      "2 hari + SW + share all GB",
      "Order langsung di web",
      "Status dapat dipantau"
    ]
  },
  {
    id: 4,
    label: "3 HARI",
    kategori: "joki",
    judul: "Joki 3 Hari",
    deskripsi: "Layanan joki kontak selama 3 hari + SW + share all GB.",
    harga: 3000,
    fitur: [
      "3 hari + SW + share all GB",
      "Order langsung di web",
      "Status dapat dipantau"
    ]
  },
  {
    id: 5,
    label: "5 HARI",
    kategori: "joki",
    judul: "Joki 5 Hari",
    deskripsi: "Layanan joki kontak selama 5 hari + SW + share all GB.",
    harga: 5000,
    fitur: [
      "5 hari + SW + share all GB",
      "Order langsung di web",
      "Status dapat dipantau"
    ]
  },
  {
    id: 6,
    label: "7 HARI",
    kategori: "joki",
    judul: "Joki 7 Hari",
    deskripsi: "Layanan joki kontak selama 7 hari + SW + share all GB.",
    harga: 7000,
    fitur: [
      "7 hari + SW + share all GB",
      "Order langsung di web",
      "Status dapat dipantau"
    ]
  },
  {
    id: 7,
    label: "1 BULAN",
    kategori: "joki",
    judul: "Joki 1 Bulan",
    deskripsi: "Layanan joki kontak selama 1 bulan + SW + share all GB.",
    harga: 10000,
    fitur: [
      "1 bulan + SW + share all GB",
      "Order langsung di web",
      "Status dapat dipantau"
    ]
  },
  {
    id: 8,
    label: "PERMANEN",
    judul: "Joki Permanen",
    deskripsi: "Permanen tempel link tree di TikTok + SW tebar. Same lu pensi JB.",
    harga: 20000,
    fitur: [
      "Permanen tempel link tree di TikTok",
      "SW tebar",
      "Same lu pensi JB",
      "Order langsung di web",
      "Status dapat dipantau"
    ]
  }
];

const paketJoki = _adminCat || paketJokiDefault;


let currentFilter = "all";
let currentSearch = "";

function filterPaket(cat) {
  currentFilter = cat;
  document.querySelectorAll(".cat-chip").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-cat") === cat);
  });
  // fallback old class
  document.querySelectorAll(".filter-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-cat") === cat);
  });
  renderPaketJoki();
}

function onSearchProduk() {
  const inp = document.getElementById("searchProduk");
  currentSearch = (inp ? inp.value : "").trim().toLowerCase();
  renderPaketJoki();
}

function getFilteredPaket() {
  let list = paketJoki;
  if (currentFilter !== "all") {
    list = list.filter(p => (p.kategori || "joki") === currentFilter);
  }
  if (currentSearch) {
    list = list.filter(p => {
      const t = ((p.judul || "") + " " + (p.deskripsi || "") + " " + (p.label || "") + " " + (p.kategori || "")).toLowerCase();
      return t.includes(currentSearch);
    });
  }
  return list;
}

function formatRp(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

function iconForProduk(p) {
  const k = (p.kategori || p.label || "").toLowerCase();
  if (k.includes("joki")) return "fa-shield-halved";
  if (k.includes("jasa")) return "fa-handshake";
  if (k.includes("layanan")) return "fa-headset";
  if (k.includes("digital") || k.includes("apk")) return "fa-mobile-screen";
  if (k.includes("script")) return "fa-code";
  if (k.includes("nokos")) return "fa-sim-card";
  if (k.includes("game")) return "fa-gamepad";
  return "fa-box";
}

function renderPaketJoki() {
  const container = document.getElementById("paketList");
  if (!container) return;
  const list = getFilteredPaket();
  if (!list.length) {
    container.innerHTML = '<div class="market-empty"><i class="fa-solid fa-box-open" style="font-size:32px;margin-bottom:8px;display:block;"></i>Tidak ada produk ditemukan.</div>';
    return;
  }
  container.innerHTML = list.map(p => {
    const href = "pembayaran.html?paket=" + encodeURIComponent(p.judul) + "&total=" + encodeURIComponent(String(p.harga));
    const stok = (p.stok === undefined || p.stok === -1 || p.stok === null) ? "∞" : p.stok;
    const icon = iconForProduk(p);
    const desc = (p.deskripsi || "Produk berkualitas siap digunakan.").substring(0, 60);
    return `
    <div class="m-card">
      <div class="m-card-icon"><i class="fa-solid ${icon}"></i></div>
      <div class="m-card-title">${p.judul}</div>
      <div class="m-card-desc">${desc}</div>
      <div class="m-card-meta">
        <span class="stok">Stok ${stok}</span>
        <span class="harga">${formatRp(p.harga)}</span>
      </div>
      <a href="${href}" class="m-card-btn">Beli Sekarang</a>
    </div>`;
  }).join("");
}

function tambahPaket(data) {
  const id = paketJoki.length ? Math.max(...paketJoki.map(p => Number(p.id) || 0)) + 1 : 1;
  paketJoki.push({
    id,
    label: data.label || "BARU",
    kategori: data.kategori || "joki",
    judul: data.judul || "Paket Baru",
    deskripsi: data.deskripsi || "",
    harga: data.harga || 1000,
    fitur: data.fitur || ["Order langsung di web", "Status dapat dipantau"]
  });
  renderPaketJoki();
  localStorage.setItem("voxyy_paket", JSON.stringify(paketJoki));
}

function loadPaketFromStorage() {
  try {
    // Admin catalog prioritised
    if (_adminCat && _adminCat.length) return;
    if (localStorage.getItem("voxyy_paket_ver") !== JOKI_CATALOG_VER) {
      localStorage.removeItem("voxyy_paket");
      localStorage.setItem("voxyy_paket_ver", JOKI_CATALOG_VER);
    }
    const saved = localStorage.getItem("voxyy_paket");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        paketJoki.length = 0;
        parsed.forEach(p => paketJoki.push(p));
      }
    }
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", function() {
  loadPaketFromStorage();
  renderPaketJoki();
});
