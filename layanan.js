/* ============================================
   CUFFLI SOCIAL - Layanan Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderServices();
});

function renderServices() {
  const container = document.getElementById('services-container');
  if (!container) return;

  const services = getServices().filter(s => s.status === 'active');
  const platforms = [...new Set(services.map(s => s.platform))];

  const platformIcons = {
    'TikTok': 'fa-brands fa-tiktok',
    'Instagram': 'fa-brands fa-instagram',
    'YouTube': 'fa-brands fa-youtube',
    'Facebook': 'fa-brands fa-facebook',
    'Telegram': 'fa-brands fa-telegram',
    'X / Twitter': 'fa-brands fa-x-twitter',
    'Threads': 'fa-brands fa-threads'
  };

  let html = '';

  platforms.forEach(platform => {
    const items = services.filter(s => s.platform === platform);
    html += `
      <div class="service-platform fade-in">
        <h2><i class="${platformIcons[platform] || 'fa-solid fa-globe'}"></i> ${platform}</h2>
        <div class="service-grid">
          ${items.map(s => `
            <div class="card service-card card-glow">
              <h3>${s.name} <span class="badge badge-active">Aktif</span></h3>
              <p class="desc">${s.desc}</p>
              <div class="price-tag">${formatRupiah(s.price)} <small style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">/ unit</small></div>
              <div class="service-meta">
                <div><span>Min Order</span><strong>${s.min.toLocaleString('id-ID')}</strong></div>
                <div><span>Max Order</span><strong>${s.max.toLocaleString('id-ID')}</strong></div>
                <div><span>Estimasi</span><strong>${s.eta}</strong></div>
                <div><span>Status</span><strong style="color:var(--success)">Tersedia</strong></div>
              </div>
              <button class="btn btn-primary btn-block btn-sm" onclick="goToOrder('${s.id}')">
                <i class="fa-solid fa-cart-shopping"></i> PESAN SEKARANG
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html || '<p class="text-center text-muted">Belum ada layanan tersedia.</p>';
}

function goToOrder(serviceId) {
  window.location.href = `order.html?service=${encodeURIComponent(serviceId)}`;
}
