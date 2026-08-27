// Produk tampil di Home (grid 2 kolom, foto 4:5)
const produk = [
  {
    id: 1,
    judul: "Jasa Post Akun Channel",
    harga: 1500,
    status: "TERSEDIA",
    img: "logo.png",
    deskripsi: "Jasa post akun ke channel & grup terkait.",
    fitur: ["Post banyak channel", "Laporan hasil", "Proses 1x24 jam"]
  },
  {
    id: 2,
    judul: "Paket Views + Kontak",
    harga: 11000,
    status: "AKTIF",
    img: "logo.png",
    deskripsi: "Views story + push kontak.",
    fitur: ["Views story", "Push kontak", "Hasil terukur"]
  },
  {
    id: 3,
    judul: "Paket Premium Kontak",
    harga: 33000,
    status: "TERSEDIA",
    img: "logo.png",
    deskripsi: "Push kontak prioritas.",
    fitur: ["Prioritas antrian", "Push lebih banyak", "Support WA"]
  },
  {
    id: 4,
    judul: "Jasa Bikin Website",
    harga: 28000,
    status: "TERSEDIA",
    img: "logo.png",
    deskripsi: "Bayar QRIS dulu, setelah TF hubungi admin WhatsApp.",
    fitur: ["Website siap pakai", "Rp 28.000", "Setelah bayar hubungi admin WA"]
  }
];

function formatRpProduk(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function renderProduk() {
  const grid = document.getElementById("produkGrid");
  if (!grid) return;

  try {
    const saved = localStorage.getItem("voxyy_produk");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= produk.length) {
        produk.length = 0;
        parsed.forEach(p => produk.push(p));
      }
    }
  } catch (e) {}

  grid.innerHTML = produk.map(p => {
    // Website: langsung ke form order sederhana → pembayaran
    const href = p.id === 4
      ? "pesan.html?type=produk&id=4"
      : (p.judul && p.judul.toLowerCase().includes("jasa post")
          ? "pesan.html?type=jaspost"
          : "detail-produk.html?id=" + p.id);
    const btnText = p.id === 4 ? "Pesan & Bayar" : "Lihat Detail";
    return `
    <div class="produk-card">
      <img src="${p.img || "logo.png"}" alt="${p.judul}" onerror="this.src='logo.png'">
      <div class="produk-info">
        <small style="color:#0d47a1;font-size:10px;">${p.status || "TERSEDIA"}</small>
        <h4>${p.judul}</h4>
        <div class="harga">${formatRpProduk(p.harga)}</div>
        <a href="${href}" class="btn">${btnText}</a>
      </div>
    </div>`;
  }).join("");
}

function tambahProduk(data) {
  const id = produk.length ? Math.max(...produk.map(p => p.id)) + 1 : 1;
  produk.push({
    id,
    judul: data.judul || "Produk Baru",
    harga: data.harga || 10000,
    status: data.status || "TERSEDIA",
    img: data.img || "logo.png",
    deskripsi: data.deskripsi || "",
    fitur: data.fitur || ["File digital"]
  });
  localStorage.setItem("voxyy_produk", JSON.stringify(produk));
  renderProduk();
}

document.addEventListener("DOMContentLoaded", renderProduk);
