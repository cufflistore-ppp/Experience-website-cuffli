// Katalog ELZKII JOKI sekarang 100% berasal dari Firebase.
// Tidak ada lagi produk bawaan/static di halaman Home.

function formatRpProduk(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function escProduk(v) {
  return String(v ?? "").replace(/[&<>\"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[s]));
}

function renderProdukList(items) {
  const grid = document.getElementById("produkGrid");
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px 10px;color:#aaa;font-size:12px;">Belum ada produk.</div>';
    return;
  }
  grid.innerHTML = items.map(p => {
    const judul = escProduk(p.judul || p.nama || "Produk");
    const href = "pembayaran-digital.html?paket=" + encodeURIComponent(p.judul || p.nama || "Produk") + "&total=" + encodeURIComponent(String(p.harga || 0));
    return `<div class="produk-card" data-ej-product="${escProduk(p.id)}">
      <img src="${escProduk(p.img || "logo.jpg")}" alt="${judul}" onerror="this.src='logo.jpg'">
      <div class="produk-info">
        <small style="color:#b91568;font-size:10px;">${escProduk(p.status || "TERSEDIA")}</small>
        <h4>${judul}</h4>
        <div class="harga">${formatRpProduk(p.harga)}</div>
        <a href="${href}" class="btn">Pesan via WhatsApp</a>
      </div>
    </div>`;
  }).join("");
}

async function ejLoadSharedHomeProducts() {
  const grid = document.getElementById("produkGrid");
  if (!grid || !window.EJ?.db) return;
  try {
    const snap = await EJ.db.ref("products").once("value");
    const v = snap.val() || {};
    // Hanya produk yang dibuat melalui katalog versi baru.
    // Produk lama/static tidak akan tampil lagi.
    const products = Object.entries(v)
      .filter(([id, p]) => p && p.schemaVersion === 2 && p.placement !== "hidden")
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderProdukList(products);
  } catch (e) {
    console.warn("Katalog Firebase belum dapat dimuat", e);
    renderProdukList([]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProdukList([]);
  setTimeout(ejLoadSharedHomeProducts, 800);
});
