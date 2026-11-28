/* Kelola Produk - halaman terpisah */
const PRODUK_HOME_KEY = "voxyy_produk";
const PRODUK_DIGITAL_KEY = "voxyy_produk_digital";

let currentProdukCat = "home";
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
let selectedVideoFile = null;
let videoObjectUrl = "";

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


function compressImageFile(file, maxSide, quality) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Bukan file gambar"));
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const scale = Math.min(1, (maxSide || 800) / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality || 0.75));
      };
      img.onerror = function () { reject(new Error("Gagal baca gambar")); };
      img.src = e.target.result;
    };
    reader.onerror = function () { reject(new Error("Gagal baca file")); };
    reader.readAsDataURL(file);
  });
}

function showImgPreview(dataUrl) {
  const wrap = document.getElementById("editImgPreviewWrap");
  const img = document.getElementById("editImgPreview");
  if (!wrap || !img) return;
  if (dataUrl) {
    img.src = dataUrl;
    wrap.style.display = "block";
  } else {
    img.src = "";
    wrap.style.display = "none";
  }
}

function formatFileSize(bytes) {
  return bytes >= 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(1) + " MB" : Math.ceil(bytes / 1024) + " KB";
}
function showVideoPreview(url, info) {
  const wrap = document.getElementById("editVideoPreviewWrap");
  const video = document.getElementById("editVideoPreview");
  const label = document.getElementById("editVideoInfo");
  if (!wrap || !video) return;
  if (url) { video.src = url; wrap.style.display = "block"; if (label) label.textContent = info || "Video produk terpasang"; }
  else { video.pause(); video.removeAttribute("src"); video.load(); wrap.style.display = "none"; if (label) label.textContent = ""; }
}
function setVideoUploadStatus(message, show = true) {
  const el = document.getElementById("videoUploadStatus"); if (!el) return;
  el.textContent = message || ""; el.style.display = show ? "block" : "none";
}
function getFirebaseStorage() {
  if (typeof firebase === "undefined") throw new Error("Firebase belum dimuat.");
  if (!firebase.apps.length && window.VoxyyOrders && window.VoxyyOrders.FIREBASE_CONFIG) firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG);
  if (!firebase.apps.length || typeof firebase.storage !== "function") throw new Error("Firebase Storage belum aktif.");
  return firebase.storage();
}
function uploadProductVideo(file, cat, productId) {
  return new Promise(async (resolve, reject) => {
    try {
      const storage = getFirebaseStorage();
      const safeName = String(file.name || "video.mp4").replace(/[^a-zA-Z0-9._-]/g, "_");
      const ref = storage.ref(`product-videos/${cat}/${productId}_${Date.now()}_${safeName}`);
      const task = ref.put(file, { contentType: file.type || "video/mp4" });
      task.on("state_changed", snapshot => {
        const pct = snapshot.totalBytes ? Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100) : 0;
        setVideoUploadStatus(`Mengunggah video: ${pct}% (${formatFileSize(snapshot.bytesTransferred)} / ${formatFileSize(snapshot.totalBytes)})`);
      }, reject, async () => {
        try { resolve(await task.snapshot.ref.getDownloadURL()); } catch (err) { reject(err); }
      });
    } catch (err) { reject(err); }
  });
}

function getProdukList(cat) {
  const key = cat === "digital" ? PRODUK_DIGITAL_KEY : PRODUK_HOME_KEY;
  try {
    const saved = localStorage.getItem(key) || (cat === "digital" ? localStorage.getItem("voxyy_digital") : null);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {}
  if (cat === "digital" && typeof produkDigital !== "undefined") {
    return JSON.parse(JSON.stringify(produkDigital));
  }
  if (typeof produk !== "undefined") {
    return JSON.parse(JSON.stringify(produk));
  }
  return [];
}

async function saveProdukList(cat, list) {
  const key = cat === "digital" ? PRODUK_DIGITAL_KEY : PRODUK_HOME_KEY;
  localStorage.setItem(key, JSON.stringify(list || []));
  if (cat === "digital") {
    try { localStorage.setItem("voxyy_digital", JSON.stringify(list || [])); } catch (e) {}
  } else {
    try { localStorage.setItem("voxyy_produk", JSON.stringify(list || [])); } catch (e) {}
  }
  try {
    if (typeof firebase === "undefined") throw new Error("Firebase SDK belum dimuat.");
    if (typeof firebase !== "undefined") {
      if (!firebase.apps.length && window.VoxyyOrders && window.VoxyyOrders.FIREBASE_CONFIG) {
        firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG);
      }
      if (firebase.apps.length) {
        await firebase.database().ref("settings/products/" + cat).set(list || []);
      } else {
        throw new Error("Firebase belum terinisialisasi.");
      }
    }
  } catch (e) {
    console.error("Gagal menyimpan katalog ke Firebase:", e);
    throw e;
  }
}

function renderProdukAdmin() {
  const box = document.getElementById("listProdukAdmin");
  if (!box) return;
  const list = getProdukList(currentProdukCat);
  if (!list.length) {
    box.innerHTML = "<p style='color:#aaa;text-align:center;padding:16px;'>Belum ada produk di kategori ini.</p>";
    return;
  }
  box.innerHTML = list
    .map((p) => {
      const id = p.id;
      return `
      <div class="produk-admin-card">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <img src="${escapeHtml(p.img || "logo-produk.jpg")}" alt="" style="width:56px;height:56px;border-radius:8px;object-fit:cover;border:1px solid #1a2740;flex-shrink:0;" onerror="this.src='logo-produk.jpg'">
          <div style="min-width:0;flex:1;">
            <strong style="color:#2196f3;">${escapeHtml(p.judul || "-")}</strong><br>
            <span style="font-size:13px;color:#90caf9;">Rp ${Number(p.harga || 0).toLocaleString("id-ID")}</span>
            <span style="font-size:11px;margin-left:8px;padding:2px 6px;border-radius:4px;background:#1a2740;">${escapeHtml(p.status || "TERSEDIA")}</span>
            <div style="font-size:12px;color:#888;margin-top:4px;">${escapeHtml(p.deskripsi || "")}</div>
          </div>
        </div>
        <div class="produk-admin-actions">
          <button type="button" class="btn-edit" onclick="bukaEditProduk('${currentProdukCat}', ${id})"><i class="fa-solid fa-pen"></i> Edit</button>
          <button type="button" class="btn-del" onclick="hapusProduk('${currentProdukCat}', ${id})"><i class="fa-solid fa-trash"></i> Hapus</button>
        </div>
      </div>`;
    })
    .join("");
}

function bukaEditProduk(cat, id) {
  const list = getProdukList(cat);
  const p = list.find((x) => Number(x.id) === Number(id));
  if (!p) return;
  currentProdukCat = cat;
  document.getElementById("editProdukId").value = id;
  document.getElementById("editProdukCat").value = cat;
  document.getElementById("editJudul").value = p.judul || "";
  document.getElementById("editHarga").value = p.harga || 0;
  document.getElementById("editStatus").value = p.status || "TERSEDIA";
  document.getElementById("editLokasi").value = cat;
  document.getElementById("editDeskripsi").value = p.deskripsi || "";
  document.getElementById("editImg").value = p.img || "";
  const fileInput = document.getElementById("editImgFile");
  if (fileInput) fileInput.value = "";
  showImgPreview(p.img && String(p.img).startsWith("data:") ? p.img : (p.img || ""));
  document.getElementById("editVideo").value = p.video || "";
  selectedVideoFile = null;
  document.getElementById("editVideoFile").value = "";
  document.getElementById("editHapusVideo").checked = false;
  showVideoPreview(p.video || "", p.video ? "Video produk saat ini" : "");
  setVideoUploadStatus("", false);
  document.getElementById("formProdukEdit").classList.add("show");
  document.getElementById("formProdukEdit").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function bukaTambahProduk() {
  document.getElementById("editProdukId").value = "";
  document.getElementById("editProdukCat").value = currentProdukCat;
  document.getElementById("editJudul").value = "";
  document.getElementById("editHarga").value = "";
  document.getElementById("editStatus").value = "TERSEDIA";
  document.getElementById("editLokasi").value = currentProdukCat;
  document.getElementById("editDeskripsi").value = "";
  document.getElementById("editImg").value = "";
  const fileInput = document.getElementById("editImgFile");
  if (fileInput) fileInput.value = "";
  showImgPreview("");
  document.getElementById("editVideo").value = "";
  selectedVideoFile = null;
  document.getElementById("editVideoFile").value = "";
  document.getElementById("editHapusVideo").checked = false;
  showVideoPreview("");
  setVideoUploadStatus("", false);
  document.getElementById("formProdukEdit").classList.add("show");
}

function tutupFormProduk() {
  document.getElementById("formProdukEdit").classList.remove("show");
}

async function simpanProduk() {
  const judul = (document.getElementById("editJudul").value || "").trim();
  const harga = Number(document.getElementById("editHarga").value) || 0;
  const status = document.getElementById("editStatus").value || "TERSEDIA";
  const lokasi = document.getElementById("editLokasi").value || "home";
  const deskripsi = (document.getElementById("editDeskripsi").value || "").trim();
  let img = (document.getElementById("editImg").value || "").trim();
  if (!img) img = lokasi === "digital" ? "logo.png" : "logo-produk.jpg";
  const oldCat = document.getElementById("editProdukCat").value || currentProdukCat;
  const idRaw = document.getElementById("editProdukId").value;
  const removeVideo = document.getElementById("editHapusVideo").checked;
  let video = removeVideo ? "" : (document.getElementById("editVideo").value || "").trim();

  if (!judul) {
    alert("Judul produk wajib diisi.");
    return;
  }

  if (selectedVideoFile && (selectedVideoFile.size > MAX_VIDEO_BYTES || !selectedVideoFile.type.startsWith("video/"))) {
    alert(selectedVideoFile.size > MAX_VIDEO_BYTES ? "Video ditolak. Maksimal ukuran video adalah 100 MB." : "File harus berupa video.");
    return;
  }

  if (idRaw && oldCat !== lokasi) {
    let oldList = getProdukList(oldCat).filter((x) => Number(x.id) !== Number(idRaw));
    await saveProdukList(oldCat, oldList);
  }

  let list = getProdukList(lokasi);
  const targetId = idRaw ? Number(idRaw) : (list.length ? Math.max(...list.map(p => Number(p.id) || 0)) + 1 : 1);
  if (selectedVideoFile) {
    const btn = document.getElementById("btnSimpanProduk");
    if (btn) { btn.disabled = true; btn.textContent = "Mengupload video..."; }
    try {
      setVideoUploadStatus("Menyiapkan upload video...");
      video = await uploadProductVideo(selectedVideoFile, lokasi, targetId);
      document.getElementById("editVideo").value = video;
      setVideoUploadStatus("Video berhasil di-upload. Menyimpan produk...");
    } catch (err) {
      console.error(err);
      alert("Upload video gagal. Pastikan Firebase Storage aktif dan rules sudah dipasang. " + (err.message || ""));
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-save"></i> Simpan'; }
      setVideoUploadStatus("Upload gagal. Produk belum disimpan.");
      return;
    }
  }
  if (idRaw) {
    const idx = list.findIndex((x) => Number(x.id) === Number(idRaw));
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        judul,
        harga,
        status,
        deskripsi,
        img,
        video,
        fitur: list[idx].fitur || ["Bayar langsung QRIS", "Konfirmasi via WhatsApp"]
      };
    } else {
      const newId = list.length ? Math.max(...list.map((p) => Number(p.id) || 0)) + 1 : 1;
      list.push({
        id: newId,
        judul,
        harga,
        status,
        deskripsi,
        img,
        video,
        fitur: ["Bayar langsung QRIS", "Konfirmasi via WhatsApp"],
        directPay: true,
        label: "JASA"
      });
    }
  } else {
    const newId = list.length ? Math.max(...list.map((p) => Number(p.id) || 0)) + 1 : 1;
    list.push({
      id: newId,
      judul,
      harga,
      status,
      deskripsi,
      img,
      video,
      fitur: ["Bayar langsung QRIS", "Konfirmasi via WhatsApp"],
      directPay: true,
      label: "JASA",
      slug: judul.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    });
  }

  try {
    await saveProdukList(lokasi, list);
  } catch (err) {
    alert("Produk gagal disimpan ke Firebase. Periksa koneksi dan Database Rules. " + (err.message || ""));
    const saveBtn = document.getElementById("btnSimpanProduk");
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Simpan'; }
    return;
  }
  currentProdukCat = lokasi;
  document.querySelectorAll(".admin-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.cat === lokasi);
  });
  tutupFormProduk();
  renderProdukAdmin();
  selectedVideoFile = null;
  setVideoUploadStatus("", false);
  const saveBtn = document.getElementById("btnSimpanProduk");
  if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Simpan'; }
  alert("Produk berhasil disimpan!");
}

function hapusProduk(cat, id) {
  if (!confirm("Hapus produk ini?")) return;
  let list = getProdukList(cat).filter((x) => Number(x.id) !== Number(id));
  saveProdukList(cat, list);
  renderProdukAdmin();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentProdukCat = tab.dataset.cat || "home";
      tutupFormProduk();
      renderProdukAdmin();
    });
  });

  const btnTambah = document.getElementById("btnTambahProduk");
  if (btnTambah) btnTambah.addEventListener("click", bukaTambahProduk);
  const btnSimpan = document.getElementById("btnSimpanProduk");
  if (btnSimpan) btnSimpan.addEventListener("click", simpanProduk);
  const btnBatal = document.getElementById("btnBatalProduk");
  if (btnBatal) btnBatal.addEventListener("click", tutupFormProduk);

  const fileInput = document.getElementById("editImgFile");
  if (fileInput) {
    fileInput.addEventListener("change", async function () {
      const file = this.files && this.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Hanya file gambar (JPG/PNG/WEBP) yang didukung. Video tidak bisa diupload di sini.");
        this.value = "";
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Pilih gambar di bawah 8 MB.");
        this.value = "";
        return;
      }
      try {
        const dataUrl = await compressImageFile(file, 600, 0.65);
        document.getElementById("editImg").value = dataUrl;
        showImgPreview(dataUrl);
      } catch (e) {
        alert("Gagal memuat gambar. Pilih file gambar lain.");
        this.value = "";
      }
    });
  }

  const videoInput = document.getElementById("editVideoFile");
  if (videoInput) videoInput.addEventListener("change", function () {
    const file = this.files && this.files[0]; if (!file) return;
    if (!file.type.startsWith("video/")) { alert("Pilih file video yang valid."); this.value = ""; return; }
    if (file.size > MAX_VIDEO_BYTES) { alert(`Video ${formatFileSize(file.size)} ditolak. Maksimal 100 MB.`); this.value = ""; selectedVideoFile = null; return; }
    selectedVideoFile = file;
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    videoObjectUrl = URL.createObjectURL(file);
    showVideoPreview(videoObjectUrl, `${file.name} · ${formatFileSize(file.size)} · siap di-upload`);
    document.getElementById("editHapusVideo").checked = false;
    setVideoUploadStatus("Video siap. Klik Simpan untuk meng-upload.");
  });
  const removeVideoInput = document.getElementById("editHapusVideo");
  if (removeVideoInput) removeVideoInput.addEventListener("change", function () {
    if (this.checked) { selectedVideoFile = null; document.getElementById("editVideo").value = ""; showVideoPreview(""); }
  });
  renderProdukAdmin();
});

window.bukaEditProduk = bukaEditProduk;
window.hapusProduk = hapusProduk;
