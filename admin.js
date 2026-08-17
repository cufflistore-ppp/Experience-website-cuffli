/**
 * VORTEX HUB - Admin Panel
 */

const Admin = {
  init() {
    if (!Auth.isAdmin()) {
      Toast.show('Akses ditolak', 'error');
      setTimeout(() => window.location.href = 'index.html', 1000);
      return;
    }

    this.renderStats();
    this.renderUsers();
    this.renderActivity();
  },

  renderStats() {
    const users = Storage.getUsers();
    document.getElementById('admin-users').textContent = users.length;
    document.getElementById('admin-tools').textContent = ToolsRegistry.length;
    document.getElementById('admin-activity').textContent = Storage.getActivity().length;
  },

  renderUsers() {
    const users = Storage.getUsers();
    const tbody = document.getElementById('admin-users-table');
    if (!tbody) return;
    
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Belum ada user</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span class="badge">${u.role || 'user'}</span></td>
        <td>${new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
      </tr>
    `).join('');
  },

  renderActivity() {
    const logs = Storage.getActivity().slice(0, 20);
    const container = document.getElementById('admin-activity-list');
    if (!container) return;
    
    if (logs.length === 0) {
      container.innerHTML = '<p class="text-muted">Belum ada aktivitas</p>';
      return;
    }

    container.innerHTML = logs.map(l => `
      <div style="padding:0.6rem 0;border-bottom:1px solid var(--border);font-size:0.9rem">
        <strong>${l.user}</strong> — ${l.action}
        <div class="text-muted" style="font-size:0.8rem">${new Date(l.time).toLocaleString('id-ID')}</div>
      </div>
    `).join('');
  }
};

window.Admin = Admin;
