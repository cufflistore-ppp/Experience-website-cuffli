/* ============================================
   CUFFLI SOCIAL - Admin Dashboard Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAdmin();
  if (!user) return;

  const page = document.body.dataset.page || 'dashboard';

  if (page === 'dashboard' || page === 'statistik') {
    renderStats();
    renderCharts();
  }
  if (page === 'pesanan') {
    renderAdminOrders();
  }
  if (page === 'layanan') {
    renderAdminServices();
  }
  if (page === 'pengguna') {
    renderAdminUsers();
  }
});

function renderStats() {
  const orders = getOrders();
  const today = new Date().toDateString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekAgo);
  const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthAgo);

  const paidStatuses = ['Pembayaran Diterima', 'Diproses', 'Selesai'];
  const revenue = orders
    .filter(o => paidStatuses.includes(o.status))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const active = orders.filter(o => o.status === 'Diproses' || o.status === 'Pembayaran Diterima').length;
  const done = orders.filter(o => o.status === 'Selesai').length;

  // Platform popularity
  const platformCount = {};
  orders.forEach(o => {
    platformCount[o.platform] = (platformCount[o.platform] || 0) + 1;
  });
  const topPlatform = Object.entries(platformCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Service popularity
  const serviceCount = {};
  orders.forEach(o => {
    const key = `${o.platform} ${o.serviceName}`;
    serviceCount[key] = (serviceCount[key] || 0) + 1;
  });
  const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('stat-today', todayOrders.length);
  set('stat-week', weekOrders.length);
  set('stat-month', monthOrders.length);
  set('stat-revenue', formatRupiah(revenue));
  set('stat-active', active);
  set('stat-done', done);
  set('stat-total', orders.length);
  set('stat-top-platform', topPlatform);
  set('stat-top-service', topService);
}

function renderCharts() {
  const orders = getOrders();
  const days = [];
  const counts = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const label = d.toLocaleDateString('id-ID', { weekday: 'short' });
    days.push(label);
    const count = orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString()).length;
    counts.push(count);
  }

  const max = Math.max(...counts, 1);
  const chartEl = document.getElementById('chart-orders');
  if (chartEl) {
    chartEl.innerHTML = counts.map((c, i) => {
      const h = Math.max(8, (c / max) * 160);
      return `<div class="chart-bar" style="height:${h}px"><span>${days[i]}</span></div>`;
    }).join('');
  }

  // Platform chart
  const platformCount = {};
  orders.forEach(o => {
    platformCount[o.platform] = (platformCount[o.platform] || 0) + 1;
  });
  const platforms = Object.entries(platformCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxP = Math.max(...platforms.map(p => p[1]), 1);
  const chartP = document.getElementById('chart-platform');
  if (chartP) {
    chartP.innerHTML = platforms.length ? platforms.map(([name, c]) => {
      const h = Math.max(8, (c / maxP) * 160);
      const short = name.split(' ')[0].substring(0, 6);
      return `<div class="chart-bar" style="height:${h}px"><span>${short}</span></div>`;
    }).join('') : '<p class="text-muted">Belum ada data</p>';
  }
}

function renderAdminOrders() {
  const orders = getOrders();
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Belum ada pesanan</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.username || '-'}</td>
      <td>${o.platform}</td>
      <td>${o.serviceName}</td>
      <td>${o.quantity.toLocaleString('id-ID')}</td>
      <td>${formatRupiah(o.total)}</td>
      <td>
        <select class="form-control" style="padding:6px 10px;font-size:0.8rem;width:auto" onchange="updateOrderStatus('${o.id}', this.value)">
          ${['Menunggu Pembayaran','Pembayaran Diterima','Diproses','Selesai','Dibatalkan'].map(s => 
            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </td>
      <td style="white-space:nowrap;font-size:0.8rem">${formatDate(o.createdAt)}</td>
    </tr>
  `).join('');
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return;
  orders[idx].status = status;
  if (status === 'Selesai') orders[idx].completedAt = new Date().toISOString();
  if (status === 'Pembayaran Diterima' && !orders[idx].paidAt) {
    orders[idx].paidAt = new Date().toISOString();
  }
  saveOrders(orders);
  showToast(`Status pesanan ${orderId} diubah ke "${status}"`, 'success');
}

function renderAdminServices() {
  const services = getServices();
  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;

  tbody.innerHTML = services.map(s => `
    <tr>
      <td>${s.platform}</td>
      <td>${s.name}</td>
      <td>${formatRupiah(s.price)}</td>
      <td>${s.min}</td>
      <td>${s.max}</td>
      <td>${s.eta}</td>
      <td>
        <span class="badge ${s.status === 'active' ? 'badge-active' : 'badge-inactive'}">
          ${s.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editService('${s.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-outline btn-sm" onclick="toggleService('${s.id}')" style="margin-left:4px">
          <i class="fa-solid fa-power-off"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function toggleService(id) {
  const services = getServices();
  const idx = services.findIndex(s => s.id === id);
  if (idx === -1) return;
  services[idx].status = services[idx].status === 'active' ? 'inactive' : 'active';
  saveServices(services);
  showToast(`Layanan ${services[idx].name} ${services[idx].status === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
  renderAdminServices();
}

function editService(id) {
  const services = getServices();
  const s = services.find(x => x.id === id);
  if (!s) return;

  const price = prompt('Harga baru (angka):', s.price);
  if (price === null) return;
  const min = prompt('Minimal order:', s.min);
  if (min === null) return;
  const max = prompt('Maksimal order:', s.max);
  if (max === null) return;

  s.price = Number(price) || s.price;
  s.min = Number(min) || s.min;
  s.max = Number(max) || s.max;
  saveServices(services);
  showToast('Layanan berhasil diperbarui', 'success');
  renderAdminServices();
}

function addService() {
  const platform = prompt('Platform (TikTok, Instagram, dll):');
  if (!platform) return;
  const name = prompt('Nama layanan (Like, View, dll):');
  if (!name) return;
  const price = Number(prompt('Harga per unit:', '20'));
  const min = Number(prompt('Min order:', '50'));
  const max = Number(prompt('Max order:', '10000'));

  const services = getServices();
  const id = platform.toLowerCase().replace(/[^a-z]/g, '').substring(0, 3) + '-' + name.toLowerCase().replace(/[^a-z]/g, '') + '-' + Date.now().toString(36);
  services.push({
    id,
    platform,
    name,
    desc: `Layanan ${name} untuk ${platform}`,
    price: price || 20,
    min: min || 50,
    max: max || 10000,
    eta: '1-24 jam',
    status: 'active',
    icon: 'fa-solid fa-globe'
  });
  saveServices(services);
  showToast('Layanan baru ditambahkan', 'success');
  renderAdminServices();
}

function renderAdminUsers() {
  const users = getUsers().filter(u => u.role !== 'admin');
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Belum ada pengguna</td></tr>`;
    return;
  }

  const orders = getOrders();
  tbody.innerHTML = users.map(u => {
    const userOrders = orders.filter(o => o.userId === u.id).length;
    return `
      <tr>
        <td>${u.name || u.username}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${formatRupiah(u.balance || 0)}</td>
        <td>${userOrders}</td>
        <td style="font-size:0.8rem">${formatDate(u.createdAt)}</td>
      </tr>
    `;
  }).join('');
}
