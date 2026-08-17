/* ============================================
   CUFFLI SOCIAL - Pembayaran Page Logic
   ============================================ */

let countdownInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('id');

  if (!orderId) {
    document.getElementById('payment-content').innerHTML = `
      <div class="card payment-card">
        <p class="text-muted">ID pesanan tidak ditemukan.</p>
        <a href="layanan.html" class="btn btn-primary mt-2">Kembali ke Layanan</a>
      </div>
    `;
    return;
  }

  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    document.getElementById('payment-content').innerHTML = `
      <div class="card payment-card">
        <p class="text-muted">Pesanan tidak ditemukan.</p>
        <a href="riwayat.html" class="btn btn-primary mt-2">Lihat Riwayat</a>
      </div>
    `;
    return;
  }

  renderPayment(order);
});

function renderPayment(order) {
  const container = document.getElementById('payment-content');
  const isPaid = order.status !== 'Menunggu Pembayaran';

  if (isPaid) {
    container.innerHTML = `
      <div class="card payment-card fade-in">
        <div class="status-badge status-success"><i class="fa-solid fa-circle-check"></i> PEMBAYARAN DITERIMA</div>
        <h2 style="margin:16px 0 8px">${order.id}</h2>
        <p class="text-muted">${order.platform} — ${order.serviceName}</p>
        <div class="summary-box text-left" style="text-align:left;margin-top:24px">
          <div class="summary-row"><span>Jumlah</span><span>${order.quantity.toLocaleString('id-ID')}</span></div>
          <div class="summary-row"><span>Total</span><span>${formatRupiah(order.total)}</span></div>
          <div class="summary-row"><span>Status</span><span>${order.status}</span></div>
        </div>
        <div class="status-badge status-process mt-2"><i class="fa-solid fa-spinner fa-spin"></i> PESANAN SEDANG DIPROSES</div>
        <p class="text-muted mt-2" style="font-size:0.9rem">Estimasi: ${order.eta || '1-24 jam'}</p>
        <div class="d-flex gap-2 justify-between mt-3" style="flex-wrap:wrap">
          <a href="riwayat.html" class="btn btn-outline">Lihat Riwayat</a>
          <a href="https://wa.me/6281234567890?text=Halo%20Admin%20Cuffli%2C%20saya%20ingin%20pesanan%20${order.id}" target="_blank" class="btn btn-primary">
            <i class="fa-brands fa-whatsapp"></i> Hubungi Admin
          </a>
        </div>
      </div>
    `;
    return;
  }

  // Waiting payment
  container.innerHTML = `
    <div class="card payment-card fade-in">
      <h2 style="margin-bottom:4px">Pembayaran</h2>
      <p class="text-muted" style="font-size:0.9rem">ID: <strong>${order.id}</strong></p>
      
      <div class="summary-box text-left" style="text-align:left;margin:20px 0">
        <div class="summary-row"><span>Layanan</span><span>${order.platform} — ${order.serviceName}</span></div>
        <div class="summary-row"><span>Jumlah</span><span>${order.quantity.toLocaleString('id-ID')}</span></div>
        <div class="summary-row"><span>Total Pembayaran</span><span style="color:var(--neon);font-weight:700">${formatRupiah(order.total)}</span></div>
      </div>

      <div class="status-badge status-waiting"><i class="fa-solid fa-clock"></i> Menunggu Pembayaran</div>
      
      <p class="text-muted" style="font-size:0.85rem;margin-top:8px">Selesaikan pembayaran dalam:</p>
      <div class="countdown" id="countdown">14:59</div>

      <div class="qris-box">
        <div class="qris-placeholder" id="qris-area">
          <div>
            <i class="fa-solid fa-qrcode" style="font-size:3rem;color:#333;margin-bottom:8px"></i><br>
            QRIS Demo<br>
            <small>Scan untuk bayar ${formatRupiah(order.total)}</small>
          </div>
        </div>
      </div>

      <p class="text-muted" style="font-size:0.82rem;margin-bottom:20px">
        Transfer sesuai nominal. Setelah transfer, klik tombol di bawah.
      </p>

      <button class="btn btn-primary btn-block" id="btn-paid" onclick="confirmPayment('${order.id}')">
        <i class="fa-solid fa-check"></i> SAYA SUDAH BAYAR
      </button>
      <a href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20mau%20konfirmasi%20pembayaran%20${order.id}" 
         target="_blank" class="btn btn-outline btn-block mt-2">
        <i class="fa-brands fa-whatsapp"></i> HUBUNGI ADMIN
      </a>
    </div>
  `;

  startCountdown(15 * 60); // 15 minutes
}

function startCountdown(seconds) {
  const el = document.getElementById('countdown');
  if (!el) return;

  let remaining = seconds;
  if (countdownInterval) clearInterval(countdownInterval);

  function tick() {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      el.textContent = '00:00';
      el.style.color = 'var(--danger)';
      showToast('Waktu pembayaran habis. Silakan buat pesanan baru.', 'warning');
      return;
    }
    remaining--;
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

function confirmPayment(orderId) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return;

  orders[idx].status = 'Pembayaran Diterima';
  orders[idx].paidAt = new Date().toISOString();
  saveOrders(orders);

  // Simulate processing after short delay
  setTimeout(() => {
    const orders2 = getOrders();
    const i = orders2.findIndex(o => o.id === orderId);
    if (i !== -1 && orders2[i].status === 'Pembayaran Diterima') {
      orders2[i].status = 'Diproses';
      saveOrders(orders2);
    }
  }, 3000);

  showToast('Pembayaran berhasil dikonfirmasi!', 'success');
  if (countdownInterval) clearInterval(countdownInterval);

  // Re-render
  renderPayment(orders[idx]);
}
