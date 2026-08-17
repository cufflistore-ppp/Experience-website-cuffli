/**
 * VORTEX HUB - Navbar & Navigation
 */

const Navbar = {
  init() {
    this.renderUserMenu();
    this.setActiveLinks();
    this.bindDropdowns();
  },

  renderUserMenu() {
    const user = Storage.getUser();
    const userArea = document.querySelector('#nav-user-area');
    if (!userArea) return;

    if (user) {
      const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
      userArea.innerHTML = `
        <div class="dropdown">
          <div class="user-avatar" id="user-menu-btn" title="${user.name || user.email}">${initial}</div>
          <div class="dropdown-menu" id="user-dropdown">
            <a href="profile.html">👤 Profil</a>
            <a href="dashboard.html">📊 Dashboard</a>
            <a href="settings.html">⚙️ Pengaturan</a>
            ${user.role === 'admin' ? '<a href="admin.html">🛡️ Admin Panel</a>' : ''}
            <button onclick="Auth.logout()">🚪 Logout</button>
          </div>
        </div>
      `;
    } else {
      userArea.innerHTML = `
        <a href="login.html" class="btn btn-sm btn-secondary">Masuk</a>
        <a href="register.html" class="btn btn-sm btn-primary">Daftar</a>
      `;
    }
  },

  setActiveLinks() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .bottom-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  },

  bindDropdowns() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#user-menu-btn');
      const dropdown = document.querySelector('#user-dropdown');
      
      if (btn && dropdown) {
        dropdown.classList.toggle('show');
        return;
      }
      
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
      }
    });
  }
};

window.Navbar = Navbar;
