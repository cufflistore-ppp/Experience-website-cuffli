const ADMIN_WA = '6282364307699';
const logout = document.getElementById('logoutBtn');
if (logout) logout.addEventListener('click', () => location.href = 'index.html');
document.querySelectorAll('.order-joki').forEach(btn => btn.addEventListener('click', () => {
  const pack = btn.dataset.pack;
  const format = `SV BUYER FRESH ELZKII😘\n\nSV ; NAMA STORE\nWa.me/628...\n\n#NAMBAH VIEW SW + KONTAK + BUYER + SELER`;
  const message = `Halo admin ELZKII JOKI, saya ingin memesan paket ${pack}.\n\n${format}`;
  location.href = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`;
}));
const copy = document.getElementById('copyFormat');
if (copy) copy.addEventListener('click', async () => {
  const text = document.getElementById('jokiFormat').textContent;
  try { await navigator.clipboard.writeText(text); copy.textContent = 'Berhasil disalin ✓'; }
  catch { copy.textContent = 'Salin manual dari kotak teks'; }
});
const send = document.getElementById('sendOrder');
if (send) send.addEventListener('click', () => {
  const type = document.getElementById('orderType').value;
  const name = document.getElementById('orderName').value.trim();
  const note = document.getElementById('orderNote').value.trim();
  if (!name) { alert('Isi nama paket atau produk terlebih dahulu.'); return; }
  const msg = `Halo admin, saya ingin pesan.\nJenis: ${type}\nPesanan: ${name}\nCatatan: ${note || '-'}`;
  location.href = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;
});
