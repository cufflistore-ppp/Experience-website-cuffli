/**
 * VORTEX HUB - Developer Tools
 */

const Developer = {
  init() {
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
    this.bindAll();
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'json';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
    document.querySelectorAll('.dev-panel').forEach(p => {
      p.classList.toggle('hidden', p.id !== 'panel-' + hash);
    });
  },

  bindAll() {
    // JSON
    document.getElementById('btn-json-format')?.addEventListener('click', () => {
      try {
        const obj = JSON.parse(document.getElementById('json-input').value);
        document.getElementById('json-output').value = JSON.stringify(obj, null, 2);
        Toast.show('JSON valid & diformat', 'success');
      } catch (e) {
        Toast.show('JSON tidak valid: ' + e.message, 'error');
      }
    });

    document.getElementById('btn-json-minify')?.addEventListener('click', () => {
      try {
        const obj = JSON.parse(document.getElementById('json-input').value);
        document.getElementById('json-output').value = JSON.stringify(obj);
      } catch (e) {
        Toast.show('JSON tidak valid', 'error');
      }
    });

    // Base64
    document.getElementById('btn-b64-encode')?.addEventListener('click', () => {
      document.getElementById('b64-output').value = btoa(unescape(encodeURIComponent(document.getElementById('b64-input').value)));
    });
    document.getElementById('btn-b64-decode')?.addEventListener('click', () => {
      try {
        document.getElementById('b64-output').value = decodeURIComponent(escape(atob(document.getElementById('b64-input').value)));
      } catch {
        Toast.show('Base64 tidak valid', 'error');
      }
    });

    // URL
    document.getElementById('btn-url-encode')?.addEventListener('click', () => {
      document.getElementById('url-output').value = encodeURIComponent(document.getElementById('url-input').value);
    });
    document.getElementById('btn-url-decode')?.addEventListener('click', () => {
      document.getElementById('url-output').value = decodeURIComponent(document.getElementById('url-input').value);
    });

    // UUID
    document.getElementById('btn-uuid')?.addEventListener('click', () => {
      document.getElementById('uuid-output').value = crypto.randomUUID();
    });

    // Timestamp
    document.getElementById('btn-ts-now')?.addEventListener('click', () => {
      const now = Math.floor(Date.now() / 1000);
      document.getElementById('ts-input').value = now;
      document.getElementById('ts-output').value = new Date(now * 1000).toLocaleString('id-ID');
    });
    document.getElementById('btn-ts-convert')?.addEventListener('click', () => {
      const ts = parseInt(document.getElementById('ts-input').value);
      if (isNaN(ts)) return Toast.show('Timestamp tidak valid', 'warning');
      document.getElementById('ts-output').value = new Date(ts * 1000).toLocaleString('id-ID');
    });

    // Hash (simple demo using SubtleCrypto for SHA)
    document.getElementById('btn-hash')?.addEventListener('click', async () => {
      const text = document.getElementById('hash-input').value;
      const algo = document.getElementById('hash-algo').value;
      const enc = new TextEncoder().encode(text);
      try {
        if (algo === 'SHA-256' || algo === 'SHA-1') {
          const buf = await crypto.subtle.digest(algo, enc);
          document.getElementById('hash-output').value = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        } else {
          // Simple hash for demo
          let h = 0;
          for (let i = 0; i < text.length; i++) h = ((h << 5) - h) + text.charCodeAt(i) | 0;
          document.getElementById('hash-output').value = (h >>> 0).toString(16);
        }
      } catch (e) {
        Toast.show('Error hashing', 'error');
      }
    });

    // Regex
    document.getElementById('btn-regex')?.addEventListener('click', () => {
      try {
        const pattern = document.getElementById('regex-pattern').value;
        const flags = document.getElementById('regex-flags').value;
        const text = document.getElementById('regex-text').value;
        const re = new RegExp(pattern, flags);
        const matches = text.match(re);
        document.getElementById('regex-output').value = matches ? matches.join('\n') : 'Tidak ada match';
      } catch (e) {
        Toast.show('Regex error: ' + e.message, 'error');
      }
    });

    // Color
    document.getElementById('btn-color')?.addEventListener('click', () => {
      const hex = document.getElementById('color-hex').value.replace('#', '');
      if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return Toast.show('HEX tidak valid', 'warning');
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      document.getElementById('color-rgb').value = `rgb(${r}, ${g}, ${b})`;
      document.getElementById('color-preview').style.background = `#${hex}`;
    });
  }
};

window.Developer = Developer;
