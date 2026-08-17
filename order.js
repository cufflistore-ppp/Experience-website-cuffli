/* ============================================
   CUFFLI SOCIAL - Order Page Logic
   ============================================ */

let currentService = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get('service');

  const services = getServices();
  currentService = services.find(s => s.id === serviceId) || null;

  const platformSelect = document.getElementById('platform');
  const serviceSelect = document.getElementById('service-type');
  const qtyInput = document.getElementById('quantity');
  const linkInput = document.getElementById('link');
  const noteInput = document.getElementById('note');
  const unitPriceEl = document.getElementById('unit-price');
  const totalEl = document.getElementById('total-price');
  const form = document.getElementById('order-form');
  const summarySection = document.getElementById('order-summary');
  const confirmBtn = document.getElementById('btn-confirm');

  // Populate platforms
  const platforms = [...new Set(services.filter(s => s.status === 'active').map(s => s.platform))];
  platformSelect.innerHTML = '<option value="">Pilih Platform</option>' +
    platforms.map(p => `<option value="${p}">${p}</option>`).join('');

  function updateServices() {
    const platform = platformSelect.value;
    const filtered = services.filter(s => s.platform === platform && s.status === 'active');
    serviceSelect.innerHTML = '<option value="">Pilih Layanan</option>' +
      filtered.map(s => `<option value="${s.id}" data-price="${s.price}" data-min="${s.min}" data-max="${s.max}">${s.name} — ${formatRupiah(s.price)}/unit</option>`).join('');
    
    if (currentService && currentService.platform === platform) {
      serviceSelect.value = currentService.id;
    }
    updatePrice();
  }

  function updatePrice() {
    const selected = serviceSelect.options[serviceSelect.selectedIndex];
    const price = selected ? Number(selected.dataset.price || 0) : 0;
    const qty = Number(qtyInput.value) || 0;
    const total = price * qty;

    unitPriceEl.textContent = formatRupiah(price);
    totalEl.textContent = formatRupiah(total);

    // Validate min/max
    if (selected && selected.dataset.min) {
      qtyInput.min = selected.dataset.min;
      qtyInput.max = selected.dataset.max;
      const min = Number(selected.dataset.min);
      const max = Number(selected.dataset.max);
      if (qty > 0 && (qty < min || qty > max)) {
        qtyInput.style.borderColor = 'var(--danger)';
      } else {
        qtyInput.style.borderColor = '';
      }
    }
  }

  // Pre-fill if service given
  if (currentService) {
    platformSelect.value = currentService.platform;
    updateServices();
    serviceSelect.value = currentService.id;
    qtyInput.value = currentService.min;
    updatePrice();
  }

  platformSelect.addEventListener('change', updateServices);
  serviceSelect.addEventListener('change', updatePrice);
  qtyInput.addEventListener('input', updatePrice);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const platform = platformSelect.value;
    const serviceId = serviceSelect.value;
    const link = linkInput.value.trim();
    const qty = Number(qtyInput.value);
    const note = noteInput.value.trim();

    if (!platform || !serviceId || !link || !qty) {
      showToast('Lengkapi semua data wajib', 'error');
      return;
    }

    const service = services.find(s => s.id === serviceId);
    if (!service) {
      showToast('Layanan tidak ditemukan', 'error');
      return;
    }

    if (qty < service.min || qty > service.max) {
      showToast(`Jumlah harus antara ${service.min} - ${service.max}`, 'error');
      return;
    }

    // Show summary
    const total = service.price * qty;
    document.getElementById('sum-platform').textContent = platform;
    document.getElementById('sum-service').textContent = service.name;
    document.getElementById('sum-link').textContent = link;
    document.getElementById('sum-qty').textContent = qty.toLocaleString('id-ID');
    document.getElementById('sum-unit').textContent = formatRupiah(service.price);
    document.getElementById('sum-total').textContent = formatRupiah(total);
    document.getElementById('sum-note').textContent = note || '-';

    form.classList.add('hidden');
    summarySection.classList.remove('hidden');
    summarySection.scrollIntoView({ behavior: 'smooth' });

    // Store temp order data
    window._tempOrder = {
      platform,
      serviceId: service.id,
      serviceName: service.name,
      link,
      quantity: qty,
      unitPrice: service.price,
      total,
      note,
      eta: service.eta
    };
  });

  confirmBtn.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) {
      showToast('Silakan login terlebih dahulu', 'warning');
      setTimeout(() => window.location.href = 'login.html', 1200);
      return;
    }

    const data = window._tempOrder;
    if (!data) return;

    const order = {
      id: generateOrderId(),
      userId: user.id,
      username: user.username,
      platform: data.platform,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      link: data.link,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      total: data.total,
      note: data.note,
      eta: data.eta,
      status: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
      paidAt: null,
      completedAt: null
    };

    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);

    showToast('Pesanan berhasil dibuat!', 'success');
    setTimeout(() => {
      window.location.href = `pembayaran.html?id=${order.id}`;
    }, 1000);
  });

  document.getElementById('btn-edit')?.addEventListener('click', () => {
    summarySection.classList.add('hidden');
    form.classList.remove('hidden');
  });
});
