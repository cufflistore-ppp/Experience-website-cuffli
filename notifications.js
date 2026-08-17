/**
 * VORTEX HUB - Toast Notifications
 */

const Toast = {
  container: null,

  init() {
    if (document.querySelector('.toast-container')) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = 3000) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };

    toast.innerHTML = `
      <span style="font-size:1.2rem">${icons[type] || icons.info}</span>
      <span style="flex:1">${message}</span>
      <button style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--text-muted)" onclick="this.parentElement.remove()">×</button>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

window.Toast = Toast;
