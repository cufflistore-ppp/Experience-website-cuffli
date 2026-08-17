/**
 * VORTEX HUB - Dashboard
 */

const Dashboard = {
  init() {
    const user = Storage.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    document.getElementById('dash-name').textContent = user.name || 'User';
    document.getElementById('dash-email').textContent = user.email || '';

    // Stats
    const recent = Storage.getRecent();
    const favs = Storage.getFavorites();
    document.getElementById('stat-recent').textContent = recent.length;
    document.getElementById('stat-favs').textContent = favs.length;
    document.getElementById('stat-tools-total').textContent = ToolsRegistry.length;

    // Recent tools
    const recentContainer = document.getElementById('recent-tools');
    if (recentContainer) {
      if (recent.length === 0) {
        recentContainer.innerHTML = '<p class="text-muted">Belum ada tools yang digunakan.</p>';
      } else {
        recentContainer.innerHTML = recent.slice(0, 8).map(id => {
          const t = getToolById(id);
          if (!t) return '';
          return `<a href="${t.page}" class="card tool-card" style="padding:1rem">
            <div class="tool-icon" style="width:36px;height:36px;font-size:1rem">${t.icon}</div>
            <h4 style="font-size:0.95rem">${t.name}</h4>
          </a>`;
        }).join('');
      }
    }

    // Favorites
    const favContainer = document.getElementById('fav-tools');
    if (favContainer) {
      if (favs.length === 0) {
        favContainer.innerHTML = '<p class="text-muted">Belum ada favorit. Tambahkan dari halaman tools!</p>';
      } else {
        favContainer.innerHTML = favs.map(id => {
          const t = getToolById(id);
          if (!t) return '';
          return `<a href="${t.page}" class="card tool-card" style="padding:1rem">
            <div class="tool-icon" style="width:36px;height:36px;font-size:1rem">${t.icon}</div>
            <h4 style="font-size:0.95rem">${t.name}</h4>
          </a>`;
        }).join('');
      }
    }
  }
};

window.Dashboard = Dashboard;
