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
  return "pembayaran.html?paket=" + encodeURIComponent(judul) + "&total=" + encodeURIComponent(String(Number(String(harga||"0").replace(/[^\d]/g,""))||0));
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

let digitalFilter = "all";
let digitalSearch = "";

function filterDigital(cat) {
  digitalFilter = cat;
  document.querySelectorAll("#digitalCats .cat-chip").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-cat") === cat);
  });
  renderDigitalList();
}

function onSearchDigital() {
  const inp = document.getElementById("searchDigital");
  digitalSearch = (inp ? inp.value : "").trim().toLowerCase();
  renderDigitalList();
}

function iconForDigital(p) {
  const k = (p.label || "").toUpperCase();
  if (k === "APK") return "fa-mobile-screen";
  if (k === "SCRIPT") return "fa-code";
  if (k === "NOKOS") return "fa-sim-card";
  if (k === "MURID") return "fa-graduation-cap";
  if (k === "JASA") return "fa-pen-ruler";
  if (k.includes("GAME")) return "fa-gamepad";
  return "fa-box";
}

function renderDigitalList() {
  const list = document.getElementById("digitalList");
  if (!list) return;
  loadProdukDigital();

  let items = produkDigital.slice();
  if (digitalFilter !== "all") {
    items = items.filter(p => (p.label || "").toUpperCase() === digitalFilter.toUpperCase());
  }
  if (digitalSearch) {
    items = items.filter(p => {
      const t = ((p.judul || "") + " " + (p.deskripsi || "") + " " + (p.label || "")).toLowerCase();
      return t.includes(digitalSearch);
    });
  }

  if (!items.length) {
    list.innerHTML = '<div class="market-empty"><i class="fa-solid fa-box-open" style="font-size:32px;margin-bottom:8px;display:block;"></i>Tidak ada produk ditemukan.</div>';
    return;
  }

  list.innerHTML = items.map(p => {
    const href = payUrl(p.judul, p.harga);
    const stok = p.stok !== undefined && p.stok !== -1 ? p.stok : Math.floor(15 + Math.random() * 20);
    const icon = iconForDigital(p);
    const desc = (p.deskripsi || "Produk digital berkualitas.").substring(0, 55);
    return `
    <div class="m-card">
      <div class="m-card-icon"><i class="fa-solid ${icon}"></i></div>
      <div class="m-card-title">${p.judul}</div>
      <div class="m-card-desc">${desc}</div>
      <div class="m-card-meta">
        <span class="stok">Stok ${stok}</span>
        <span class="harga">${formatRpDigital(p.harga).replace(" ","")}</span>
      </div>
      <a href="${href}" class="m-card-btn">Beli Sekarang</a>
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
