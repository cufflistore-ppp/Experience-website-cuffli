/**
 * VORTEX HUB - Finance Tools
 */

const Finance = {
  init() {
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
    this.bindAll();
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'currency';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
    document.querySelectorAll('.fin-panel').forEach(p => {
      p.classList.toggle('hidden', p.id !== 'panel-' + hash);
    });
  },

  bindAll() {
    // Currency (reuse similar rates)
    document.getElementById('btn-fin-currency')?.addEventListener('click', () => {
      const rates = { USD: 1, IDR: 16200, EUR: 0.92, GBP: 0.79, SGD: 1.34 };
      const val = parseFloat(document.getElementById('fin-cur-val').value);
      const from = document.getElementById('fin-cur-from').value;
      const to = document.getElementById('fin-cur-to').value;
      if (isNaN(val)) return Toast.show('Masukkan angka', 'warning');
      const result = (val / rates[from]) * rates[to];
      document.getElementById('fin-cur-result').textContent = result.toLocaleString('id-ID', {maximumFractionDigits: 2});
    });

    // Discount
    document.getElementById('btn-fin-discount')?.addEventListener('click', () => {
      const price = parseFloat(document.getElementById('fin-disc-price').value);
      const pct = parseFloat(document.getElementById('fin-disc-pct').value);
      if (isNaN(price) || isNaN(pct)) return Toast.show('Masukkan angka valid', 'warning');
      const save = price * pct / 100;
      document.getElementById('fin-disc-save').textContent = 'Rp ' + save.toLocaleString('id-ID');
      document.getElementById('fin-disc-final').textContent = 'Rp ' + (price - save).toLocaleString('id-ID');
    });

    // Profit
    document.getElementById('btn-fin-profit')?.addEventListener('click', () => {
      const cost = parseFloat(document.getElementById('fin-profit-cost').value);
      const sell = parseFloat(document.getElementById('fin-profit-sell').value);
      if (isNaN(cost) || isNaN(sell)) return Toast.show('Masukkan angka valid', 'warning');
      const profit = sell - cost;
      const margin = cost > 0 ? (profit / cost * 100) : 0;
      document.getElementById('fin-profit-val').textContent = 'Rp ' + profit.toLocaleString('id-ID');
      document.getElementById('fin-profit-margin').textContent = margin.toFixed(1) + '%';
    });

    // Loan
    document.getElementById('btn-fin-loan')?.addEventListener('click', () => {
      const principal = parseFloat(document.getElementById('fin-loan-amount').value);
      const annualRate = parseFloat(document.getElementById('fin-loan-rate').value) / 100;
      const years = parseFloat(document.getElementById('fin-loan-years').value);
      if (isNaN(principal) || isNaN(annualRate) || isNaN(years)) return Toast.show('Masukkan data valid', 'warning');
      const months = years * 12;
      const monthlyRate = annualRate / 12;
      let payment;
      if (monthlyRate === 0) payment = principal / months;
      else payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
      const total = payment * months;
      document.getElementById('fin-loan-payment').textContent = 'Rp ' + payment.toLocaleString('id-ID', {maximumFractionDigits: 0});
      document.getElementById('fin-loan-total').textContent = 'Rp ' + total.toLocaleString('id-ID', {maximumFractionDigits: 0});
    });

    // Saving
    document.getElementById('btn-fin-saving')?.addEventListener('click', () => {
      const target = parseFloat(document.getElementById('fin-save-target').value);
      const monthly = parseFloat(document.getElementById('fin-save-monthly').value);
      if (isNaN(target) || isNaN(monthly) || monthly <= 0) return Toast.show('Masukkan data valid', 'warning');
      const months = Math.ceil(target / monthly);
      document.getElementById('fin-save-result').textContent = `${months} bulan (${(months / 12).toFixed(1)} tahun)`;
    });

    // Investment
    document.getElementById('btn-fin-invest')?.addEventListener('click', () => {
      const initial = parseFloat(document.getElementById('fin-inv-initial').value) || 0;
      const monthly = parseFloat(document.getElementById('fin-inv-monthly').value) || 0;
      const rate = parseFloat(document.getElementById('fin-inv-rate').value) / 100;
      const years = parseFloat(document.getElementById('fin-inv-years').value);
      if (isNaN(years) || years <= 0) return Toast.show('Masukkan data valid', 'warning');
      const months = years * 12;
      const monthlyRate = rate / 12;
      let future = initial * Math.pow(1 + monthlyRate, months);
      if (monthlyRate > 0) {
        future += monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
      } else {
        future += monthly * months;
      }
      document.getElementById('fin-inv-result').textContent = 'Rp ' + future.toLocaleString('id-ID', {maximumFractionDigits: 0});
    });
  }
};

window.Finance = Finance;
