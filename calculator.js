/**
 * VORTEX HUB - Calculator Tools
 */

const Calculator = {
  // Basic calculator state
  expression: '',
  result: '0',

  init() {
    this.bindBasic();
    this.bindPercent();
    this.bindDiscount();
    this.bindTax();
    this.bindBMI();
    this.bindAge();
    this.bindScientific();
    
    // Hash navigation
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'basic';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
    document.querySelectorAll('.calc-panel').forEach(p => {
      p.classList.toggle('hidden', p.id !== 'panel-' + hash);
    });
  },

  bindBasic() {
    document.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (val === 'C') {
          this.expression = '';
          this.result = '0';
        } else if (val === 'CE') {
          this.expression = this.expression.slice(0, -1);
        } else if (val === '=') {
          try {
            // Safe eval for basic math
            let expr = this.expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
            const res = Function('"use strict"; return (' + expr + ')')();
            this.result = Number.isFinite(res) ? String(+res.toFixed(10).replace(/\.?0+$/, '')) : 'Error';
            this.expression = this.result;
          } catch {
            this.result = 'Error';
          }
        } else {
          this.expression += val;
        }
        this.updateBasicDisplay();
      });
    });
  },

  updateBasicDisplay() {
    const exprEl = document.querySelector('#basic-expression');
    const resEl = document.querySelector('#basic-result');
    if (exprEl) exprEl.textContent = this.expression || '0';
    if (resEl) resEl.textContent = this.result;
  },

  bindPercent() {
    const btn = document.getElementById('btn-percent');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const num = parseFloat(document.getElementById('percent-num').value);
      const pct = parseFloat(document.getElementById('percent-pct').value);
      if (isNaN(num) || isNaN(pct)) {
        Toast.show('Masukkan angka valid', 'warning');
        return;
      }
      const result = (num * pct) / 100;
      document.getElementById('percent-result').textContent = result.toLocaleString('id-ID');
    });
  },

  bindDiscount() {
    const btn = document.getElementById('btn-discount');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const price = parseFloat(document.getElementById('discount-price').value);
      const disc = parseFloat(document.getElementById('discount-pct').value);
      if (isNaN(price) || isNaN(disc)) {
        Toast.show('Masukkan angka valid', 'warning');
        return;
      }
      const save = (price * disc) / 100;
      const final = price - save;
      document.getElementById('discount-save').textContent = 'Rp ' + save.toLocaleString('id-ID');
      document.getElementById('discount-final').textContent = 'Rp ' + final.toLocaleString('id-ID');
    });
  },

  bindTax() {
    const btn = document.getElementById('btn-tax');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('tax-amount').value);
      const rate = parseFloat(document.getElementById('tax-rate').value) || 11;
      if (isNaN(amount)) {
        Toast.show('Masukkan angka valid', 'warning');
        return;
      }
      const tax = (amount * rate) / 100;
      const total = amount + tax;
      document.getElementById('tax-value').textContent = 'Rp ' + tax.toLocaleString('id-ID');
      document.getElementById('tax-total').textContent = 'Rp ' + total.toLocaleString('id-ID');
    });
  },

  bindBMI() {
    const btn = document.getElementById('btn-bmi');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const weight = parseFloat(document.getElementById('bmi-weight').value);
      const height = parseFloat(document.getElementById('bmi-height').value) / 100;
      if (isNaN(weight) || isNaN(height) || height <= 0) {
        Toast.show('Masukkan data valid', 'warning');
        return;
      }
      const bmi = weight / (height * height);
      let category = '';
      if (bmi < 18.5) category = 'Kurus';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Gemuk';
      else category = 'Obesitas';
      
      document.getElementById('bmi-result').textContent = bmi.toFixed(1);
      document.getElementById('bmi-category').textContent = category;
    });
  },

  bindAge() {
    const btn = document.getElementById('btn-age');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const birth = new Date(document.getElementById('age-birth').value);
      if (isNaN(birth.getTime())) {
        Toast.show('Pilih tanggal lahir', 'warning');
        return;
      }
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();
      
      if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      
      document.getElementById('age-result').textContent = `${years} tahun, ${months} bulan, ${days} hari`;
    });
  },

  bindScientific() {
    // Simple scientific using Math
    const btns = document.querySelectorAll('.sci-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('sci-input');
        const val = parseFloat(input.value);
        const op = btn.dataset.op;
        let res = 0;
        try {
          switch (op) {
            case 'sin': res = Math.sin(val * Math.PI / 180); break;
            case 'cos': res = Math.cos(val * Math.PI / 180); break;
            case 'tan': res = Math.tan(val * Math.PI / 180); break;
            case 'sqrt': res = Math.sqrt(val); break;
            case 'log': res = Math.log10(val); break;
            case 'ln': res = Math.log(val); break;
            case 'pow2': res = Math.pow(val, 2); break;
            case 'pow3': res = Math.pow(val, 3); break;
            case 'fact': 
              res = 1;
              for (let i = 2; i <= val; i++) res *= i;
              break;
            case 'pi': input.value = Math.PI; return;
            case 'e': input.value = Math.E; return;
          }
          document.getElementById('sci-result').textContent = res;
        } catch {
          document.getElementById('sci-result').textContent = 'Error';
        }
      });
    });
  }
};

window.Calculator = Calculator;
