// Daftar Produk Digital - terpisah dari paket Joki
const produkDigital = [
  {
    id: 1,
    label: "POST",
    judul: "Jasa Post Akun Channel",
    deskripsi: "Jasa post akun ke semua channel & grup terkait. Tingkatkan reach akun kamu.",
    harga: 1500,
    status: "TERSEDIA",
    fitur: [
      "Post di banyak channel + grup",
      "Post di channel aktif",
      "Laporan hasil post",
      "Proses 1x24 jam"
    ]
  },
  {
    id: 2,
    label: "VIEWS",
    judul: "Paket Views + Kontak",
    deskripsi: "Paket gabungan views story + push kontak untuk meningkatkan interaksi akun.",
    harga: 11000,
    status: "AKTIF",
    fitur: [
      "Tambah views story",
      "Push kontak targeted",
      "Cocok untuk seller",
      "Hasil terukur"
    ]
  },
  {
    id: 3,
    label: "PREMIUM",
    judul: "Paket Premium Kontak",
    deskripsi: "Paket premium untuk push kontak lebih agresif dan prioritas antrian.",
    harga: 33000,
    status: "TERSEDIA",
    fitur: [
      "Prioritas antrian",
      "Push kontak lebih banyak",
      "Support via WA",
      "Garansi proses"
    ]
  },
  {
    id: 4,
    label: "WEB",
    judul: "Jasa Bikin Website",
    deskripsi: "Jasa pembuatan website siap pakai. Setelah transfer, hubungi admin via WhatsApp.",
    harga: 28000,
    status: "TERSEDIA",
    fitur: [
      "Website custom / template",
      "Harga Rp 28.000",
      "Setelah TF hubungi admin WA",
      "Support setup dasar"
    ]
  }
];

function formatRpDigital(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function loadProdukDigital() {
  try {
    const saved = localStorage.getItem("voxyy_digital");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Pakai storage hanya jika jumlah item >= default (biar produk baru dari kode tetap muncul)
      if (Array.isArray(parsed) && parsed.length >= produkDigital.length) {
        produkDigital.length = 0;
        parsed.forEach(p => produkDigital.push(p));
      }
    }
  } catch (e) {}
}

function renderDigitalList() {
  const list = document.getElementById("digitalList");
  if (!list) return;
  loadProdukDigital();

  list.innerHTML = produkDigital.map(p => `
    <div class="paket-card">
      <span class="paket-label">${p.label || "DIGITAL"}</span>
      <h3>${p.judul}</h3>
      <p>${p.deskripsi || ""}</p>
      <ul>
        ${(p.fitur || []).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join("")}
      </ul>
      <div class="harga">${formatRpDigital(p.harga)}</div>
      <a href="detail-produk.html?id=${p.id}" class="btn-pesan">Pesan Sekarang</a>
    </div>
  `).join("");
}

function tambahProdukDigital(data) {
  const id = produkDigital.length ? Math.max(...produkDigital.map(p => p.id)) + 1 : 1;
  produkDigital.push({
    id,
    label: data.label || "DIGITAL",
    judul: data.judul || "Produk Baru",
    deskripsi: data.deskripsi || "",
    harga: data.harga || 10000,
    status: data.status || "TERSEDIA",
    fitur: data.fitur || ["File digital", "Dikirim via WA"]
  });
  localStorage.setItem("voxyy_digital", JSON.stringify(produkDigital));
  renderDigitalList();
}

document.addEventListener("DOMContentLoaded", renderDigitalList);
