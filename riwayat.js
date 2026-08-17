/* ============================================
   CUFFLI SOCIAL - Riwayat Pesanan
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    document.getElementById('riwayat-content').innerHTML = `
      <div class="card text-center" style="padding:40px">
        <i class="fa-solid fa-lock" style="font-size:2.5rem;color:var(--neon);margin-bottom:16px"></i>
        <h3>Login Diperlukan</h3>
        <p class="text-muted mt-1">Silakan login untuk melihat riwayat pesanan.</p>
        <a href="login.html" class="btn btn-primary mt-3">Login Sekarang</a>
      </div>
    `;
    return;
  }

  renderRiwayat(user);
});

function renderRiwayat(user) {
  const orders = getOrders().filter(o => o.userId === user.id);
  const container = document.getElementById('riwayat-content');

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="card text-center" style="padding:40px">
        <i class="fa-solid fa-box-open" style="font-size:2.5rem;color:var(--text-muted);margin-bottom:16px"></i>
        <h3>Belum Ada Pesanan</h3>
        <p class="text-muted mt-1">Mulai pesan layanan sosial media sekarang.</p>
        <a href="layanan.html" class="btn btn-primary mt-3">Lihat Layanan</a>
      </div>
    `;
    return;
  }

  const statusClass = {
    'Menunggu Pembayaran': 'status-waiting',
    'Pembayaran Diterima': 'status-success',
    'Diproses': 'status-process',
    'Selesai': 'status-success',
    'Dibatalkan': 'status-waiting'
  };

  container.innerHTML = `
    <div class="table-wrap fade-in">
      <table>
        <thead>
          <tr>
            <th>ID Pesanan</th>
            <th>Platform</th>
            <th>Layanan</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Status</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td><strong>${o.id}</strong></td>
              <td>${o.platform}</td>
              <td>${o.serviceName}</td>
              <td>${o.quantity.toLocaleString('id-ID')}</td>
              <td>${formatRupiah(o.total)}</td>
              <td><span class="status-badge ${statusClass[o.status] || ''}" style="padding:4px 10px;font-size:0.75rem">${o.status}</span></td>
              <td style="white-space:nowrap">${formatDate(o.createdAt)}</td>
              <td>
                ${o.status === 'Menunggu Pembayaran' 
                  ? `<a href="pembayaran.html?id=${o.id}" class="btn btn-primary btn-sm">Bayar</a>` 
                  : `<a href="pembayaran.html?id=${o.id}" class="btn btn-outline btn-sm">Detail</a>`}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
