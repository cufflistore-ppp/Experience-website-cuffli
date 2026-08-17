/**
 * VORTEX HUB - Theme Manager
 */

const Theme = {
  init() {
    const saved = Storage.getTheme();
    this.apply(saved);
    this.bindToggle();
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Storage.setTheme(theme);
    this.updateIcons(theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    this.apply(next);
    if (window.Toast) {
      Toast.show(`Tema ${next === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`, 'info');
    }
  },

  updateIcons(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
    });
  },

  bindToggle() {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  }
};

window.Theme = Theme;
