const DIGITAL_CATALOG_VER = "6";

const produkDigital = [
{
  id: 19,
  slug: "jasa-edit-video-animasi-anime",
  label: "JASA",
  judul: "Jasa Edit Video Animasi Anime",
  deskripsi: "Jasa edit video animasi anime. Bayar QRIS, lalu konfirmasi pesanan via WhatsApp.",
  harga: 5000,
  status: "TERSEDIA",
  img: "logo.png",
  directPay: true,
  fitur: [
    "Harga Rp 5.000",
    "Jasa edit video animasi anime",
    "Bayar langsung QRIS",
    "Konfirmasi via WhatsApp"
  ]
},
  {
    id: 1,
    slug: "jasa-buk-pernomor",
    label: "JASA",
    judul: "Jasa Buk Pernomor",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 1000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 1.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 2,
    slug: "logo-mascot",
    label: "LOGO",
    judul: "Logo Mascot",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 3.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 3,
    slug: "logo-muka",
    label: "LOGO",
    judul: "Logo Muka",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 4000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 4.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 4,
    slug: "logo-faktor-ff",
    label: "LOGO",
    judul: "Logo Faktor FF",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 2.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 5,
    slug: "jasa-web-no-antrian",
    label: "JASA",
    judul: "Jasa Buat Web No Antrian",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 6,
    slug: "jasa-web-ada-antrian",
    label: "JASA",
    judul: "Jasa Buat Web Ada Antrian",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 10000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 10.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 7,
    slug: "jasa-buat-fs",
    label: "JASA",
    judul: "Jasa Buat FS",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Pilih paket sesuai kebutuhan", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"],
    variants: [
      { nama: "1 HP + 1 iPad", harga: 2000 },
      { nama: "1 HP + 1 iPad · Foto Live", harga: 4000 },
      { nama: "2 HP + 1 iPad", harga: 3000 },
      { nama: "2 HP + 1 iPad · Foto Live", harga: 5000 }
    ]
  },
  {
    id: 8,
    slug: "jasa-logo-testimoni",
    label: "JASA",
    judul: "Jasa Bikin Logo Testimoni",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 2.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 9,
    slug: "apk-auto-sv",
    label: "APK",
    judul: "APK Auto SV",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 1000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 1.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 10,
    slug: "apk-pixellab",
    label: "APK",
    judul: "APK PixelLab",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 2.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 11,
    slug: "web-suntik-all-sosmed",
    label: "WEB",
    judul: "Web Suntik All Sosmed",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 3.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 12,
    slug: "all-nokos-fresh",
    label: "NOKOS",
    judul: "All Nokos Fresh",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 13,
    slug: "suntik-saluran",
    label: "SUNTIK",
    judul: "Suntik Saluran",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 1000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Pilih jumlah P sesuai kebutuhan", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"],
    variants: [
      { nama: "100P", harga: 1000 },
      { nama: "200P", harga: 2000 },
      { nama: "300P", harga: 3000 },
      { nama: "400P", harga: 4000 },
      { nama: "500P", harga: 5000 },
      { nama: "600P", harga: 6000 },
      { nama: "700P", harga: 7000 },
      { nama: "800P", harga: 8000 },
      { nama: "900P", harga: 9000 },
      { nama: "1.000P", harga: 10000 }
    ]
  },
  {
    id: 14,
    slug: "jpm-by-doxy-joki",
    label: "JPM",
    judul: "JPM by Doxy Joki",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Pilih paket Grup / Saluran", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"],
    variants: [
      { nama: "Grup · 10 Member", harga: 2000 },
      { nama: "Grup · 20 Member", harga: 5000 },
      { nama: "Grup · 30 Member", harga: 7000 },
      { nama: "Grup · 45 Member", harga: 12000 },
      { nama: "Grup · 55 Member", harga: 16000 },
      { nama: "Grup · 100 Member", harga: 30000 },
      { nama: "Saluran · 10P", harga: 3000 },
      { nama: "Saluran · 15P", harga: 4000 },
      { nama: "Saluran · 25P", harga: 7000 },
      { nama: "Saluran · 35P", harga: 11000 },
      { nama: "Saluran · 45P", harga: 16000 }
    ]
  },
  {
    id: 15,
    slug: "murid-web",
    label: "MURID",
    judul: "Murid Web",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 16,
    slug: "murid-logo",
    label: "MURID",
    judul: "Murid Logo",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 17,
    slug: "murid-nokos",
    label: "MURID",
    judul: "Murid Nokos",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 18,
    slug: "mursun-ful-tutor",
    label: "MURID",
    judul: "Mursun Ful Tutor",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 3.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  }
];

function formatRpDigital(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function payUrl(judul, harga) {
  return "pembayaran-digital.html?paket=" + encodeURIComponent(judul) + "&total=" + encodeURIComponent(String(harga));
}

function loadProdukDigital() {
  try {
    if (localStorage.getItem("voxyy_digital_ver") !== DIGITAL_CATALOG_VER) {
      localStorage.removeItem("voxyy_digital");
      localStorage.setItem("voxyy_digital_ver", DIGITAL_CATALOG_VER);
    }

    const saved = localStorage.getItem("voxyy_digital");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed) && parsed.length) {
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
    const variants = Array.isArray(p.variants) && p.variants.length ? p.variants : null;

    const actions = variants
      ? `<div class="variant-grid">` + variants.map(v =>
          `<a href="${payUrl(p.judul + " · " + v.nama, v.harga)}" class="btn-pesan variant-btn">${v.nama}<small>${formatRpDigital(v.harga)}</small></a>`
        ).join("") + `</div>`
      : `<a href="${payUrl(p.judul, p.harga)}" class="btn-pesan">Bayar Sekarang</a>`;

    return `
    <div class="paket-card">
      <span class="paket-label">${p.label || "DIGITAL"}</span>
      <h3>${p.judul}</h3>
      <p>${p.deskripsi || ""}</p>
      <ul>
        ${(p.fitur || []).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join("")}
      </ul>
      <div class="harga">${variants ? "Mulai " + formatRpDigital(p.harga) : formatRpDigital(p.harga)}</div>
      ${actions}
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
    directPay: true,
    fitur: data.fitur || ["Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  });

  localStorage.setItem("voxyy_digital", JSON.stringify(produkDigital));
  renderDigitalList();
}

document.addEventListener("DOMContentLoaded", renderDigitalList);