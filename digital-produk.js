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
    list.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px 10px;color:#aaa;font-size:12px;">Belum ada produk.</div>';
    return;
  }
  list.innerHTML = items.map(p => {
    const judul = escDigital(p.judul || p.nama || "Produk");
    const href = payUrl(p.judul || p.nama || "Produk", p.harga);
    return `<div class="produk-card" data-ej-product="${escDigital(p.id)}">
      <img src="${escDigital(p.img || "logo.jpg")}" alt="${judul}" onerror="this.src='logo.jpg'">
      <div class="produk-info">
        <small style="color:#b91568;font-size:10px;">${escDigital(p.status || "TERSEDIA")}</small>
        <h4>${judul}</h4>
        <div class="harga">${formatRpDigital(p.harga)}</div>
        <a href="${href}" class="btn">Pesan via WhatsApp</a>
      </div>
    </div>`;
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
