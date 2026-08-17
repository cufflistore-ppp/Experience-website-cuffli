/**
 * VORTEX HUB - Converter Tools
 */

const Converter = {
  rates: { // Demo rates (approx)
    USD: 1, IDR: 16200, EUR: 0.92, GBP: 0.79, JPY: 150, SGD: 1.34, MYR: 4.7, CNY: 7.2
  },

  units: {
    length: { m: 1, km: 0.001, cm: 100, mm: 1000, inch: 39.3701, ft: 3.28084, mi: 0.000621371, yd: 1.09361 },
    weight: { kg: 1, g: 1000, mg: 1e6, lb: 2.20462, oz: 35.274, ton: 0.001 },
    temp: null, // special
    speed: { 'km/h': 1, 'm/s': 0.277778, mph: 0.621371, knot: 0.539957 },
    data: { B: 1, KB: 1/1024, MB: 1/1048576, GB: 1/1073741824, TB: 1/1099511627776 },
    time: { s: 1, min: 1/60, h: 1/3600, day: 1/86400, week: 1/604800 },
    area: { 'm²': 1, 'km²': 1e-6, 'cm²': 10000, ha: 0.0001, acre: 0.000247105 },
    volume: { 'm³': 1, L: 1000, mL: 1e6, gal: 264.172, 'ft³': 35.3147 }
  },

  init() {
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
    this.bindAll();
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'length';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
    document.querySelectorAll('.conv-panel').forEach(p => {
      p.classList.toggle('hidden', p.id !== 'panel-' + hash);
    });
  },

  convert(type, value, from, to) {
    if (type === 'temp') {
      let celsius;
      if (from === 'C') celsius = value;
      else if (from === 'F') celsius = (value - 32) * 5/9;
      else if (from === 'K') celsius = value - 273.15;
      
      if (to === 'C') return celsius;
      if (to === 'F') return celsius * 9/5 + 32;
      if (to === 'K') return celsius + 273.15;
    }
    
    if (type === 'currency') {
      const inUSD = value / this.rates[from];
      return inUSD * this.rates[to];
    }

    const table = this.units[type];
    if (!table) return value;
    const base = value / table[from];
    return base * table[to];
  },

  bindAll() {
    document.querySelectorAll('[data-convert]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.convert;
        const val = parseFloat(document.getElementById(type + '-val').value);
        const from = document.getElementById(type + '-from').value;
        const to = document.getElementById(type + '-to').value;
        if (isNaN(val)) {
          Toast.show('Masukkan angka valid', 'warning');
          return;
        }
        const result = this.convert(type, val, from, to);
        document.getElementById(type + '-result').textContent = 
          Number.isInteger(result) ? result : result.toFixed(6).replace(/\.?0+$/, '');
      });
    });
  }
};

window.Converter = Converter;
