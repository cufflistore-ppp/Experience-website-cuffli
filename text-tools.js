/**
 * VORTEX HUB - Text Tools
 */

const TextTools = {
  init() {
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
    this.bindAll();
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'counter';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
    document.querySelectorAll('.text-panel').forEach(p => {
      p.classList.toggle('hidden', p.id !== 'panel-' + hash);
    });
  },

  bindAll() {
    // Counter
    const counterInput = document.getElementById('counter-input');
    if (counterInput) {
      counterInput.addEventListener('input', () => {
        const text = counterInput.value;
        document.getElementById('char-count').textContent = text.length;
        document.getElementById('word-count').textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
        document.getElementById('line-count').textContent = text ? text.split('\n').length : 0;
      });
    }

    // Case
    document.querySelectorAll('[data-case]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('case-input');
        const type = btn.dataset.case;
        let val = input.value;
        switch (type) {
          case 'upper': val = val.toUpperCase(); break;
          case 'lower': val = val.toLowerCase(); break;
          case 'title': val = val.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()); break;
          case 'camel': val = val.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, c) => c.toUpperCase()); break;
          case 'snake': val = val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); break;
        }
        document.getElementById('case-output').value = val;
      });
    });

    // Slug
    const slugBtn = document.getElementById('btn-slug');
    if (slugBtn) {
      slugBtn.addEventListener('click', () => {
        const text = document.getElementById('slug-input').value;
        const slug = text.toLowerCase().trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        document.getElementById('slug-output').value = slug;
      });
    }

    // Lorem
    const loremBtn = document.getElementById('btn-lorem');
    if (loremBtn) {
      loremBtn.addEventListener('click', () => {
        const count = parseInt(document.getElementById('lorem-count').value) || 3;
        const para = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
        document.getElementById('lorem-output').value = Array(count).fill(para).join('\n\n');
      });
    }

    // Password
    const passBtn = document.getElementById('btn-password');
    if (passBtn) {
      passBtn.addEventListener('click', () => {
        const len = parseInt(document.getElementById('pass-len').value) || 16;
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        let pass = '';
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        for (let i = 0; i < len; i++) pass += chars[arr[i] % chars.length];
        document.getElementById('pass-output').value = pass;
      });
    }

    // Reverse
    const revBtn = document.getElementById('btn-reverse');
    if (revBtn) {
      revBtn.addEventListener('click', () => {
        document.getElementById('reverse-output').value = document.getElementById('reverse-input').value.split('').reverse().join('');
      });
    }

    // Sort
    const sortBtn = document.getElementById('btn-sort');
    if (sortBtn) {
      sortBtn.addEventListener('click', () => {
        const lines = document.getElementById('sort-input').value.split('\n').filter(l => l.trim());
        const sorted = document.getElementById('sort-desc').checked ? lines.sort().reverse() : lines.sort();
        document.getElementById('sort-output').value = sorted.join('\n');
      });
    }

    // Duplicate
    const dupBtn = document.getElementById('btn-dup');
    if (dupBtn) {
      dupBtn.addEventListener('click', () => {
        const lines = document.getElementById('dup-input').value.split('\n');
        const unique = [...new Set(lines)];
        document.getElementById('dup-output').value = unique.join('\n');
        Toast.show(`Dihapus ${lines.length - unique.length} baris duplikat`, 'success');
      });
    }
  }
};

window.TextTools = TextTools;
