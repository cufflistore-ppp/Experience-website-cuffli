// Halaman Produk Digital memakai katalog Firebase yang SAMA dengan Home.
function formatRpDigital(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function escDigital(v) {
  return String(v ?? "").replace(/[&<>\"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[s]));
}

function payUrl(judul, harga) {
  return "pembayaran-digital.html?paket=" + encodeURIComponent(judul) + "&total=" + encodeURIComponent(String(harga));
}

function renderDigitalList(items) {
  const list = document.getElementById("digitalList");
  if (!list) return;
  if (!items.length) {
    list.innerHTML = '<div style="text-align:center;padding:24px 10px;color:#aaa;font-size:12px;">Belum ada produk.</div>';
    return;
  }
  list.innerHTML = items.map(p => {
    const judul = escDigital(p.judul || p.nama || "Produk");
    const desc = escDigital(p.delivery || p.deskripsi || "");
    const img = escDigital(p.img || "logo.jpg");
    return `<article class="paket-card" data-ej-product="${escDigital(p.id)}">
      <img src="${img}" alt="${judul}" onerror="this.src='logo.jpg'" style="width:100%;max-height:180px;object-fit:cover;border-radius:10px;margin-bottom:8px">
      <span class="paket-label">PRODUK</span>
      <h3>${judul}</h3>
      ${desc ? `<p>${desc}</p>` : ""}
      <div class="harga">${formatRpDigital(p.harga)}</div>
      <a class="btn-pesan" href="${payUrl(p.judul || p.nama || "Produk", p.harga)}">Pesan via WhatsApp</a>
    </article>`;
  }).join("");
}

async function ejLoadSharedDigitalProducts() {
  const list = document.getElementById("digitalList");
  if (!list || !window.EJ?.db) return;
  try {
    const snap = await EJ.db.ref("products").once("value");
    const v = snap.val() || {};
    // Sama persis dengan Home: semua produk katalog versi baru tampil di sini juga.
    const products = Object.entries(v)
      .filter(([id, p]) => p && p.schemaVersion === 2 && p.placement !== "hidden")
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderDigitalList(products);
  } catch (e) {
    console.warn("Produk digital Firebase belum dapat dimuat", e);
    renderDigitalList([]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderDigitalList([]);
  setTimeout(ejLoadSharedDigitalProducts, 800);
});
