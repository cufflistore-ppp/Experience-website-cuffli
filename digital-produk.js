// Daftar Produk Digital (halaman digital.html + detail)
const produkDigital = [
  {
    id: 1,
    label: "POST",
    judul: "Jasa Post Akun Channel",
    deskripsi: "Jasa post akun ke semua channel & grup terkait.",
    harga: 1500,
    status: "TERSEDIA",
    img: "logo.png",
    fitur: ["Post di banyak channel + grup", "Laporan hasil post", "Proses 1x24 jam"]
  },
  {
    id: 2,
    label: "VIEWS",
    judul: "Paket Views + Kontak",
    deskripsi: "Views story + push kontak untuk interaksi akun.",
    harga: 11000,
    status: "AKTIF",
    img: "logo.png",
    fitur: ["Tambah views story", "Push kontak targeted", "Hasil terukur"]
  },
  {
    id: 3,
    label: "PREMIUM",
    judul: "Paket Premium Kontak",
    deskripsi: "Push kontak lebih agresif dan prioritas antrian.",
    harga: 33000,
    status: "TERSEDIA",
    img: "logo.png",
    fitur: ["Prioritas antrian", "Push kontak lebih banyak", "Support via WA"]
  },
  {
    id: 4,
    label: "WEB",
    judul: "Jasa Bikin Website",
    deskripsi: "Bayar via QRIS dulu. Setelah transfer, langsung hubungi admin WhatsApp untuk proses.",
    harga: 28000,
    status: "TERSEDIA",
    img: "logo.png",
    fitur: ["Website siap pakai", "Harga Rp 28.000", "Setelah TF hubungi admin WA", "Support setup dasar"]
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

  list.innerHTML = produkDigital.map(p => {
    const isWeb = p.id === 4;
    const href = isWeb ? "pesan.html?type=produk&id=4" : "detail-produk.html?id=" + p.id;
    const btn = isWeb ? "Pesan & Bayar QRIS" : "Pesan Sekarang";
    return `
    <div class="paket-card">
      <span class="paket-label">${p.label || "DIGITAL"}</span>
      <h3>${p.judul}</h3>
      <p>${p.deskripsi || ""}</p>
      <ul>
        ${(p.fitur || []).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join("")}
      </ul>
      <div class="harga">${formatRpDigital(p.harga)}</div>
      <a href="${href}" class="btn-pesan">${btn}</a>
    </div>`;
  }).join("");
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
    img: data.img || "logo.png",
    fitur: data.fitur || ["File digital", "Dikirim via WA"]
  });
  localStorage.setItem("voxyy_digital", JSON.stringify(produkDigital));
  renderDigitalList();
}

document.addEventListener("DOMContentLoaded", renderDigitalList);
