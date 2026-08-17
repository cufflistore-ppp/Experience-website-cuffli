/**
 * VORTEX HUB - Global Search
 */

const Search = {
  init() {
    // Desktop search
    const desktopInput = document.querySelector('.search-box input');
    if (desktopInput) {
      desktopInput.addEventListener('input', (e) => this.handleSearch(e.target.value, '.search-results'));
      desktopInput.addEventListener('focus', (e) => {
        if (e.target.value.trim()) this.handleSearch(e.target.value, '.search-results');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
          document.querySelectorAll('.search-results').forEach(el => el.classList.remove('show'));
        }
      });
    }

    // Hero search
    const heroInput = document.querySelector('.hero-search input');
    if (heroInput) {
      heroInput.addEventListener('input', (e) => this.handleSearch(e.target.value, '#hero-search-results'));
      heroInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const results = searchTools(e.target.value);
          if (results.length > 0) {
            window.location.href = results[0].page;
          }
        }
      });
    }

    // Mobile search
    const mobileInput = document.querySelector('.mobile-search-overlay input');
    if (mobileInput) {
      mobileInput.addEventListener('input', (e) => this.handleSearch(e.target.value, '#mobile-search-results'));
    }
  },

  handleSearch(query, resultsSelector) {
    const container = document.querySelector(resultsSelector);
    if (!container) return;

    if (!query || query.trim().length < 1) {
      container.classList.remove('show');
      container.innerHTML = '';
      return;
    }

    const results = searchTools(query).slice(0, 8);
    
    if (results.length === 0) {
      container.innerHTML = `<div class="search-result-item" style="justify-content:center;color:var(--text-muted)">Tidak ditemukan</div>`;
      container.classList.add('show');
      return;
    }

    container.innerHTML = results.map(t => `
      <a href="${t.page}" class="search-result-item" onclick="Storage.addRecent('${t.id}')">
        <div class="icon">${t.icon}</div>
        <div>
          <div style="font-weight:600;color:var(--text-primary)">${t.name}</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">${t.desc}</div>
        </div>
      </a>
    `).join('');
    container.classList.add('show');
  },

  openMobile() {
    const overlay = document.querySelector('.mobile-search-overlay');
    if (overlay) {
      overlay.classList.add('show');
      const input = overlay.querySelector('input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  },

  closeMobile() {
    const overlay = document.querySelector('.mobile-search-overlay');
    if (overlay) {
      overlay.classList.remove('show');
      const input = overlay.querySelector('input');
      if (input) input.value = '';
      const results = document.querySelector('#mobile-search-results');
      if (results) results.innerHTML = '';
    }
  }
};

window.Search = Search;
