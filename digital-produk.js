const DIGITAL_CATALOG_VER = "5";

const produkDigital = [
  {
    id: 1,
    slug: "apk-auto-sv",
    label: "APK",
    judul: "APK Auto SV Kontak",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 2.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 2,
    slug: "apk-logo-prem-mod",
    label: "APK",
    judul: "APK Logo Prem/Mod",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 3.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 3,
    slug: "script-bot-jaga-gbxjpm",
    label: "SCRIPT",
    judul: "Script Bot Jaga GBXJPM",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 7000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 7.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 4,
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
    id: 5,
    slug: "murid-nokos",
    label: "MURID",
    judul: "Murid Nokos",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 7000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 7.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 6,
    slug: "nokos-wa-indonesia",
    label: "NOKOS",
    judul: "Nokos WA Indonesia",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 6000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 6.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 7,
    slug: "nokos-shopee",
    label: "NOKOS",
    judul: "Nokos Shopee",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2500,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 2.500", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 8,
    slug: "nokos-lazada",
    label: "NOKOS",
    judul: "Nokos Lazada",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2500,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 2.500", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 9,
    slug: "jasa-logo-teks",
    label: "JASA",
    judul: "Jasa Logo Teks",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 2.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 10,
    slug: "jasa-logo-udah-jadi",
    label: "JASA",
    judul: "Jasa Logo Yang Udah Jadi",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 3.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 11,
    slug: "jasa-bikin-poster",
    label: "JASA",
    judul: "Jasa Bikin Poster",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 7000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 7.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  },
  {
    id: 12,
    slug: "jasa-logo-muka",
    label: "JASA",
    judul: "Jasa Bikin Logo Pake Muka Lu Sendiri",
    deskripsi: "Langsung bayar QRIS, setelah transfer konfirmasi via WhatsApp.",
    harga: 8000,
    status: "TERSEDIA",
    img: "logo.png",
    directPay: true,
    fitur: ["Harga Rp 8.000", "Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
  }
];

function formatRpDigital(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function payUrl(judul, harga) {
  return "pembayaran.html?paket=" + encodeURIComponent(judul) + "&total=" + encodeURIComponent(String(harga));
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
