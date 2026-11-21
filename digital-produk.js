const DIGITAL_CATALOG_VER = "6";

const produkDigital = [
  {
    id: 1,
    slug: "jasa-buk-pernomor",
    label: "JASA",
    judul: "Jasa Buk Pernomor",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 1000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 1.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 2,
    slug: "logo-mascot",
    label: "LOGO",
    judul: "Logo Mascot",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 3.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 3,
    slug: "logo-muka",
    label: "LOGO",
    judul: "Logo Muka",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 4000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 4.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 4,
    slug: "logo-faktor-ff",
    label: "LOGO",
    judul: "Logo Faktor FF",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 2.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 5,
    slug: "jasa-web-no-antrian",
    label: "JASA",
    judul: "Jasa Buat Web No Antrian",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 6,
    slug: "jasa-web-ada-antrian",
    label: "JASA",
    judul: "Jasa Buat Web Ada Antrian",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 10000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 10.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 7,
    slug: "jasa-buat-fs",
    label: "JASA",
    judul: "Jasa Buat FS",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Pilih paket sesuai kebutuhan", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"],
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
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 2.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 9,
    slug: "apk-auto-sv",
    label: "APK",
    judul: "APK Auto SV",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 1000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 1.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 10,
    slug: "apk-pixellab",
    label: "APK",
    judul: "APK PixelLab",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 2.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 11,
    slug: "web-suntik-all-sosmed",
    label: "WEB",
    judul: "Web Suntik All Sosmed",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 3.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 12,
    slug: "all-nokos-fresh",
    label: "NOKOS",
    judul: "All Nokos Fresh",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 13,
    slug: "suntik-saluran",
    label: "SUNTIK",
    judul: "Suntik Saluran",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 1000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Pilih jumlah P sesuai kebutuhan", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"],
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
    judul: "JPM by ELZKII JOKI",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 2000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Pilih paket Grup / Saluran", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"],
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
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 16,
    slug: "murid-logo",
    label: "MURID",
    judul: "Murid Logo",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 17,
    slug: "murid-nokos",
    label: "MURID",
    judul: "Murid Nokos",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 18,
    slug: "mursun-ful-tutor",
    label: "MURID",
    judul: "Mursun Ful Tutor",
    deskripsi: "Order melalui WhatsApp admin terlebih dahulu.",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.jpg",
    directPay: true,
    fitur: ["Harga Rp 3.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
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
      : `<a href="${payUrl(p.judul, p.harga)}" class="btn-pesan">Pesan via WhatsApp</a>`;

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
    fitur: data.fitur || ["Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  });

  localStorage.setItem("voxyy_digital", JSON.stringify(produkDigital));
  renderDigitalList();
}

async function ejLoadSharedDigitalProducts(){
 const list=document.getElementById('digitalList');if(!list||!window.EJ?.db)return;
 try{const snap=await EJ.db.ref('products').once('value'),v=snap.val()||{},managed=(await EJ.db.ref('settings/catalogsImportedV1').once('value')).val();
 const extras=Object.entries(v).filter(([id,p])=>['digital','both'].includes(p.placement)).map(([id,p])=>({id,nama:p.nama||p.judul,harga:Number(p.harga||0),img:p.img||'logo.jpg',delivery:p.delivery||'',fitur:p.fitur||[]}));
 if(managed)list.innerHTML='';
 if(!extras.length)return;
 const html=extras.map(p=>`<article class="paket-card"><img src="${p.img}" alt="${String(p.nama).replace(/[<>]/g,'')}" style="width:100%;max-height:150px;object-fit:cover;border-radius:10px"><span class="paket-label">DIGITAL</span><h3>${String(p.nama).replace(/[<>]/g,'')}</h3><p>${String(p.delivery).replace(/[<>]/g,'')}</p><div class="harga">${formatRpDigital(p.harga)}</div><a class="btn-pesan" href="${payUrl(p.nama,p.harga)}">Pesan via WhatsApp</a></article>`).join('');
 list.insertAdjacentHTML('beforeend',html);
 }catch(e){console.warn('Produk digital admin belum dapat dimuat',e)}
}
document.addEventListener("DOMContentLoaded",()=>{renderDigitalList();setTimeout(ejLoadSharedDigitalProducts,650)});