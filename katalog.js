/**
 * Katalog produk terpusat (dari admin + fallback default)
 */
const DEFAULT_PRODUK = [
  { id: "d1", judul: "APK Auto SV Kontak", kategori: "apk", label: "APK", deskripsi: "Produk digital berkualitas.", harga: 2000, stok: 25, img: "", status: "aktif", file: "" },
  { id: "d2", judul: "APK Logo Prem/Mod", kategori: "apk", label: "APK", deskripsi: "Produk premium siap digunakan.", harga: 3000, stok: 18, img: "", status: "aktif", file: "" },
  { id: "d3", judul: "Script Bot Jaga", kategori: "digital", label: "SCRIPT", deskripsi: "Script siap pakai.", harga: 7000, stok: 12, img: "", status: "aktif", file: "" },
  { id: "d4", judul: "Nokos WA Indonesia", kategori: "digital", label: "NOKOS", deskripsi: "Nokos WA Indonesia.", harga: 6000, stok: 30, img: "", status: "aktif", file: "" },
  { id: "d5", judul: "Jasa Logo Teks", kategori: "jasa", label: "JASA", deskripsi: "Jasa desain logo teks.", harga: 2000, stok: -1, img: "", status: "aktif", file: "" },
  { id: "d7", judul: "Jasa Suntik Media", kategori: "jasa", label: "JASA", deskripsi: "Suntik followers/view/like media sosial. Setelah bayar, isi link target.", harga: 5000, stok: -1, img: "", status: "aktif", file: "" },
  { id: "d6", judul: "Murid Logo", kategori: "lainnya", label: "MURID", deskripsi: "Paket murid logo.", harga: 5000, stok: 10, img: "", status: "aktif", file: "" },
];

let _filter = "all";
let _search = "";
let _gridId = "homeGrid";
let _mode = "home";

function getCatalog() {
  let list = null;
  if (window.VoxyyBrand && typeof window.VoxyyBrand.getProduk === "function") {
    list = window.VoxyyBrand.getProduk();
  }
  if (!list || !list.length) {
    try {
      const raw = localStorage.getItem("voxyy_produk_admin");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) list = arr.filter((p) => p.status !== "nonaktif");
      }
    } catch (e) {}
  }
  if (!list || !list.length) list = DEFAULT_PRODUK.slice();
  return list.map((p) => ({
    id: p.id,
    judul: p.judul || p.nama || "Produk",
    kategori: (p.kategori || p.label || "digital").toLowerCase(),
    label: p.label || (p.kategori || "DIGITAL").toUpperCase(),
    deskripsi: p.deskripsi || "Produk digital berkualitas.",
    harga: Number(p.harga) || 0,
    stok: p.stok === undefined || p.stok === null ? -1 : Number(p.stok),
    img: p.img || p.foto || "",
    file: p.file || "",
    status: p.status || "aktif",
  }));
}

function formatRpK(n) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

function iconFor(p) {
  const k = (p.kategori || p.label || "").toLowerCase();
  if (k.includes("apk") || k.includes("aplikasi")) return "fa-mobile-screen";
  if (k.includes("script") || k.includes("digital")) return "fa-code";
  if (k.includes("nokos")) return "fa-sim-card";
  if (k.includes("jasa")) return "fa-pen-ruler";
  if (k.includes("game")) return "fa-gamepad";
  if (k.includes("murid")) return "fa-graduation-cap";
  return "fa-box";
}

function matchCat(p, cat) {
  if (cat === "all") return true;
  const k = (p.kategori + " " + p.label).toLowerCase();
  if (cat === "apk") return k.includes("apk") || k.includes("aplikasi");
  if (cat === "digital") return k.includes("digital") || k.includes("script") || k.includes("nokos");
  if (cat === "jasa") return k.includes("jasa");
  if (cat === "lainnya") return !k.includes("apk") && !k.includes("digital") && !k.includes("script") && !k.includes("nokos") && !k.includes("jasa");
  return k.includes(cat);
}

function filteredList() {
  let list = getCatalog();
  if (_filter !== "all") list = list.filter((p) => matchCat(p, _filter));
  if (_search) {
    list = list.filter((p) => {
      const t = (p.judul + " " + p.deskripsi + " " + p.label + " " + p.kategori).toLowerCase();
      return t.includes(_search);
    });
  }
  return list;
}

function renderKatalog(gridId, mode) {
  if (gridId) _gridId = gridId;
  if (mode) _mode = mode;
  const box = document.getElementById(_gridId);
  if (!box) return;
  const list = filteredList();
  if (!list.length) {
    box.innerHTML = '<div class="market-empty"><i class="fa-solid fa-box-open" style="font-size:32px;display:block;margin-bottom:8px;"></i>Tidak ada produk ditemukan.</div>';
    return;
  }
  box.innerHTML = list
    .map((p) => {
      const buyHref =
        "pembayaran.html?paket=" +
        encodeURIComponent(p.judul) +
        "&total=" +
        encodeURIComponent(String(Number(String(p.harga || "0").replace(/[^\d]/g, "")) || 0)) +
        "&pid=" +
        encodeURIComponent(p.id || "") +
        "&kat=" +
        encodeURIComponent(p.kategori || p.label || "");
      const detailHref =
        "detail-produk.html?id=" +
        encodeURIComponent(p.id || "") +
        "&paket=" +
        encodeURIComponent(p.judul || "");
      const stok = p.stok < 0 ? "∞" : p.stok;
      const icon = iconFor(p);
      const imgHtml = p.img
        ? `<img src="${p.img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
           <i class="fa-solid ${icon}" style="display:none"></i>`
        : `<i class="fa-solid ${icon}"></i>`;
      return `<div class="m-card">
        <a href="${detailHref}" style="text-decoration:none;color:inherit;display:block;">
          <div class="m-card-icon">${imgHtml}</div>
          <div class="m-card-title">${escapeK(p.judul)}</div>
          <div class="m-card-desc">${escapeK(p.deskripsi)}</div>
          <div class="m-card-meta">
            <span class="stok">Stok ${stok}</span>
            <span class="harga">${formatRpK(p.harga)}</span>
          </div>
        </a>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <a href="${detailHref}" class="m-card-btn" style="flex:1;background:#1e2a45;text-align:center;">Detail</a>
          <a href="${buyHref}" class="m-card-btn" style="flex:1;text-align:center;">Pesan</a>
        </div>
      </div>`;
    })
    .join("");
}

function escapeK(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function filterHome(cat) {
  _filter = cat;
  document.querySelectorAll("#homeCats .cat-chip, #digitalCats .cat-chip").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-cat") === cat);
  });
  renderKatalog();
}

function filterDigital(cat) {
  filterHome(cat);
}

function onSearchHome() {
  const inp = document.getElementById("searchHome") || document.getElementById("searchDigital");
  _search = (inp ? inp.value : "").trim().toLowerCase();
  renderKatalog();
}

function onSearchDigital() {
  onSearchHome();
}

// aliases used by older pages
window.filterPaket = filterHome;
window.onSearchProduk = onSearchHome;
window.renderPaketJoki = function () {
  renderKatalog("paketList", "joki");
};
window.renderDigitalList = function () {
  renderKatalog("digitalList", "digital");
};
window.renderKatalog = renderKatalog;


async function syncKatalogFromCloud() {
  try {
    if (!window.VoxyyOrders) return;
    if (window.VoxyyOrders.initFirebase) try { window.VoxyyOrders.initFirebase(); } catch (e) {}
    if (window.VoxyyOrders.getProdukGlobal) {
      var list = await window.VoxyyOrders.getProdukGlobal();
      if (list && list.length) {
        try { localStorage.setItem("voxyy_produk_admin", JSON.stringify(list)); } catch (e) {}
        if (typeof renderKatalog === "function") renderKatalog();
      }
    }
    if (window.VoxyyOrders.onProdukChange) {
      window.VoxyyOrders.onProdukChange(function (list) {
        if (list && list.length) {
          try { localStorage.setItem("voxyy_produk_admin", JSON.stringify(list)); } catch (e) {}
          if (typeof renderKatalog === "function") renderKatalog();
        }
      });
    }
  } catch (e) {}
}
window.syncKatalogFromCloud = syncKatalogFromCloud;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () { syncKatalogFromCloud(); });
} else {
  syncKatalogFromCloud();
}
