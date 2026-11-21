const HOME_CATALOG_VER = "5";

const produk = [
  {
    id: 1,
    judul: "Nokos WA Indonesia",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    deskripsi: "Pesan melalui WhatsApp admin.",
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 2,
    judul: "Murid Nokos",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    deskripsi: "Pesan melalui WhatsApp admin.",
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 3,
    judul: "Murid Web ",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    deskripsi: "Pesan melalui WhatsApp admin.",
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 4,
    judul: "Murid Logo",
    harga: 5000,
    status: "TERSEDIA",
    img: "logo.jpg",
    deskripsi: "Pesan melalui WhatsApp admin.",
    fitur: ["Harga Rp 5.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 5,
    judul: "Murid Suntik",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.jpg",
    deskripsi: "Pesan melalui WhatsApp admin.",
    fitur: ["Harga Rp 3.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 6,
    judul: "Apk Auto Sv",
    harga: 1000,
    status: "TERSEDIA",
    img: "logo.jpg",
    deskripsi: "Pesan melalui WhatsApp admin.",
    fitur: ["Harga Rp 1.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  },
  {
    id: 7,
    judul: "Web Suntik All Sosmed",
    harga: 3000,
    status: "TERSEDIA",
    img: "logo.jpg",
    deskripsi: "Pesan melalui WhatsApp admin.",
    fitur: ["Harga Rp 3.000", "Order melalui WhatsApp", "Konfirmasi via WhatsApp"]
  }
];

function formatRpProduk(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function renderProduk() {
  const grid = document.getElementById("produkGrid");
  if (!grid) return;

  try {
    if (localStorage.getItem("voxyy_produk_ver") !== HOME_CATALOG_VER) {
      localStorage.removeItem("voxyy_produk");
      localStorage.setItem("voxyy_produk_ver", HOME_CATALOG_VER);
    }
    const saved = localStorage.getItem("voxyy_produk");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        produk.length = 0;
        parsed.forEach(p => produk.push(p));
      }
    }
  } catch (e) {}

  try { const extra = JSON.parse(localStorage.getItem("ej_products") || "[]"); extra.forEach(x => { if (!produk.some(p => String(p.id) === String(x.id))) produk.push(x); }); } catch(e) {}
  grid.innerHTML = produk.map(p => {
    const href = "pembayaran-digital.html?paket=" + encodeURIComponent(p.judul) + "&total=" + encodeURIComponent(String(p.harga));
    return `
    <div class="produk-card">
      <img src="${p.img || "logo.jpg"}" alt="${p.judul}" onerror="this.src='logo.jpg'">
      <div class="produk-info">
        <small style="color:#b91568;font-size:10px;">${p.status || "TERSEDIA"}</small>
        <h4>${p.judul}</h4>
        <div class="harga">${formatRpProduk(p.harga)}</div>
        <a href="${href}" class="btn">Pesan via WhatsApp</a>
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
    img: data.img || "logo.jpg",
    deskripsi: data.deskripsi || "",
    fitur: data.fitur || ["Order melalui WhatsApp"]
  });
  localStorage.setItem("voxyy_produk", JSON.stringify(produk));
  renderProduk();
}

document.addEventListener("DOMContentLoaded", renderProduk);

// Produk tambahan dari Firebase Realtime Database (katalog bersama).
async function ejLoadSharedHomeProducts(){const grid=document.getElementById('produkGrid');if(!grid||!window.EJ?.db)return;try{const snap=await EJ.db.ref('products').once('value'),v=snap.val()||{};const extras=Object.entries(v).map(([id,p])=>({id,judul:p.judul||p.nama,harga:Number(p.harga||0),img:p.img||'logo.jpg',status:p.status||'TERSEDIA'}));if(!extras.length)return;const existing=new Set(Array.from(grid.querySelectorAll('[data-ej-product]')).map(x=>x.dataset.ejProduct));grid.insertAdjacentHTML('beforeend',extras.filter(p=>!existing.has(String(p.id))).map(p=>`<div class="produk-card" data-ej-product="${String(p.id).replace(/["<>]/g,'')}"><img src="${String(p.img).replace(/["<>]/g,'')}" alt="Produk"><div class="produk-info"><small>${p.status}</small><h4>${String(p.judul).replace(/[<>]/g,'')}</h4><div class="harga">${formatRpProduk(p.harga)}</div><a class="btn" href="pembayaran-digital.html?paket=${encodeURIComponent(p.judul)}&total=${p.harga}">Pesan via WhatsApp</a></div></div>`).join(''))}catch(e){console.warn('Katalog Firebase belum dapat dimuat',e)}}
document.addEventListener('DOMContentLoaded',()=>setTimeout(ejLoadSharedHomeProducts,700));
