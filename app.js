const tools = [
  { name: "Terabox Downloader", desc: "Ambil file dari link share Terabox", icon: "📦", tags: ["FILE"], cat: "downloader" },
  { name: "Instagram", desc: "Download video & foto", icon: "📸", tags: ["HD"], cat: "downloader" },
  { name: "TikTok", desc: "Video, foto & audio", icon: "🎵", tags: ["MP4","MP3","JPG"], cat: "downloader" },
  { name: "YouTube", desc: "Video & audio", icon: "▶️", tags: ["MP4","MP3"], cat: "downloader" },
  { name: "Spotify Downloader", desc: "Cari lagu, preview & unduh ke MP3", icon: "🎧", tags: ["MP3"], cat: "downloader" },
  { name: "BRAT Generator", desc: "Static + animated GIF", icon: "✨", tags: ["GIF"], cat: "maker" },
  { name: "IQC Generator", desc: "Buat gambar IQC style operator", icon: "🖼️", tags: ["1 STYLE"], cat: "maker" },
  { name: "Sertifikat Tolol", desc: "Buat sertifikat parodi dari nama", icon: "📜", tags: ["API"], cat: "maker" },
  { name: "E-KTP Generator", desc: "Full form demo", icon: "🪪", tags: ["FULL"], cat: "maker" },
  { name: "Fake Dana", desc: "Generator saldo Dana palsu", icon: "💰", tags: ["CUSTOM"], cat: "maker" },
  { name: "FakeDev", desc: "Buat profil developer palsu", icon: "👨‍💻", tags: ["API"], cat: "maker" },
  { name: "Fake Lobby", desc: "FF & ML lobby palsu", icon: "🎮", tags: ["GAME"], cat: "maker" },
  { name: "Windows Quotes", desc: "Quote ala Windows style", icon: "🪟", tags: ["1 STYLE"], cat: "maker" },
  { name: "Nokia Message", desc: "Buat gambar SMS jadul Nokia", icon: "📱", tags: ["RETRO"], cat: "maker" },
  { name: "Tanya Ustadz", desc: "Meme generator", icon: "🧔", tags: ["LUCU"], cat: "maker" },
  { name: "Prompt Generator", desc: "Ubah gambar jadi prompt deskriptif", icon: "🪄", tags: ["LOCAL"], cat: "tools" },
  { name: "Fake OVO", desc: "Generator tampilan saldo OVO", icon: "💜", tags: ["CANVAS"], cat: "maker" },
  { name: "Quote Generator", desc: "Buat gambar quote monokrom", icon: "💬", tags: ["JPG"], cat: "maker" },
  { name: "CariFakta", desc: "Analisis klaim & berita dengan AI", icon: "🔍", tags: ["AI"], cat: "tools" },
  { name: "Virus Scan", desc: "Scan URL, file, hash, domain & IP", icon: "🛡️", tags: ["SECURITY"], cat: "tools" },
  { name: "Calculator", desc: "Hitung cepat", icon: "🧮", tags: ["MATH"], cat: "tools" },
  { name: "Password Gen", desc: "Password aman", icon: "🔑", tags: ["SECURE"], cat: "tools" },
  { name: "Morse Code", desc: "Konversi morse", icon: "📡", tags: ["AUDIO"], cat: "tools" },
  { name: "Remove BG", desc: "Hapus background", icon: "✂️", tags: ["AI"], cat: "tools" },
  { name: "Image Enhancer", desc: "Tingkatkan kualitas", icon: "🌟", tags: ["HD"], cat: "tools" },
  { name: "Quote TikTok Nexus", desc: "Buat fake TikTok chat", icon: "💬", tags: ["NEXUS"], cat: "maker" },
  { name: "QR Generator", desc: "Buat QR langsung di sini", icon: "▣", tags: ["QR"], cat: "tools" },
  { name: "Nexus AI", desc: "4 model gratis · 30+ model VVIP", icon: "🤖", tags: ["AI"], cat: "vvip" },
  { name: "Foto To Link", desc: "Upload & share", icon: "🔗", tags: ["UPLOAD"], cat: "tools" },
  { name: "PDF Tools", desc: "Merge, split, compress PDF", icon: "📄", tags: ["PDF"], cat: "tools" },
  { name: "Base64 Tool", desc: "Encode / decode Base64", icon: "🔤", tags: ["DEV"], cat: "tools" },
  { name: "Color Picker", desc: "Ambil warna dari gambar", icon: "🎨", tags: ["DESIGN"], cat: "tools" },
  { name: "Unit Converter", desc: "Konversi satuan cepat", icon: "📐", tags: ["MATH"], cat: "tools" },
  { name: "JSON Formatter", desc: "Beautify & validate JSON", icon: "{ }", tags: ["DEV"], cat: "tools" },
  { name: "Hash Generator", desc: "MD5, SHA1, SHA256", icon: "🔐", tags: ["CRYPTO"], cat: "tools" },
  { name: "Lorem Ipsum", desc: "Generator teks dummy", icon: "📝", tags: ["TEXT"], cat: "tools" },
  { name: "Timestamp", desc: "Unix ↔ Date converter", icon: "⏰", tags: ["TIME"], cat: "tools" },
  { name: "Regex Tester", desc: "Uji regular expression", icon: "🧪", tags: ["DEV"], cat: "tools" },
  { name: "IP Lookup", desc: "Cek info IP & lokasi", icon: "🌐", tags: ["NET"], cat: "tools" },
  { name: "Vault Notes", desc: "Catatan terenkripsi lokal", icon: "🔒", tags: ["PRIVATE"], cat: "vault" },
  { name: "External Links", desc: "Kumpulan tools luar", icon: "🔗", tags: ["EXT"], cat: "external" },
  { name: "VVIP Unlock", desc: "Akses fitur premium", icon: "👑", tags: ["VIP"], cat: "vvip" },
];

const mockFiles = [
  { name: "sample_photo_01.jpg", size: "2.4 MB", icon: "🖼️" },
  { name: "sample_photo_02.jpg", size: "1.8 MB", icon: "🖼️" },
  { name: "sample_photo_03.png", size: "3.1 MB", icon: "🖼️" },
  { name: "demo_video_short.mp4", size: "12.5 MB", icon: "🎬" },
  { name: "audio_track_demo.mp3", size: "4.2 MB", icon: "🎵" },
  { name: "document_report.pdf", size: "890 KB", icon: "📄" },
  { name: "spreadsheet_data.xlsx", size: "256 KB", icon: "📊" },
  { name: "archive_backup.zip", size: "15.7 MB", icon: "🗜️" },
  { name: "logo_nailong.svg", size: "12 KB", icon: "⚡" },
  { name: "icon_set_purple.png", size: "340 KB", icon: "🎨" },
  { name: "wallpaper_dark_grid.jpg", size: "1.2 MB", icon: "🌌" },
  { name: "mock_ktp_template.png", size: "480 KB", icon: "🪪" },
  { name: "qr_code_sample.png", size: "28 KB", icon: "▣" },
  { name: "certificate_blank.png", size: "620 KB", icon: "📜" },
  { name: "brat_style_gif.gif", size: "1.5 MB", icon: "✨" },
  { name: "notes_vault.json", size: "8 KB", icon: "🔒" },
  { name: "config_theme.json", size: "2 KB", icon: "⚙️" },
  { name: "readme_nailong.md", size: "4 KB", icon: "📘" },
  { name: "placeholder_avatar.png", size: "96 KB", icon: "👤" },
  { name: "banner_hero.webp", size: "780 KB", icon: "🖼️" },
];

function renderTools(filter = "all") {
  const grid = document.getElementById("toolsGrid");
  const filtered = filter === "all" ? tools : tools.filter(t => t.cat === filter);
  grid.innerHTML = filtered.map(t => `
    <div class="tool-card" data-name="${t.name}">
      <div class="tool-icon">${t.icon}</div>
      <div class="tool-name">${t.name}</div>
      <div class="tool-desc">${t.desc}</div>
      <div class="tool-tags">${t.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
    </div>
  `).join("");

  grid.querySelectorAll(".tool-card").forEach(card => {
    card.addEventListener("click", () => {
      alert("Tool mock: " + card.dataset.name + "\\n\\nIni hanya demo UI. Fitur download/generate tidak aktif.");
    });
  });
}

function renderFiles() {
  const list = document.getElementById("fileList");
  list.innerHTML = mockFiles.map(f => `
    <div class="file-item">
      <span class="file-icon">${f.icon}</span>
      <span class="file-name">${f.name}</span>
      <span class="file-size">${f.size}</span>
    </div>
  `).join("");
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderTools(tab.dataset.cat);
  });
});

document.getElementById("clearHist").addEventListener("click", () => {
  document.getElementById("historyList").innerHTML = '<p class="empty">Belum ada riwayat. Download berhasil akan muncul di sini.</p>';
  document.getElementById("histCount").textContent = "0";
});

renderTools();
renderFiles();
