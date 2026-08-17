/* ============================================
   CUFFLI SOCIAL - Core App Logic
   ============================================ */

const STORAGE_KEYS = {
  users: 'cuffli_users',
  currentUser: 'cuffli_current_user',
  orders: 'cuffli_orders',
  services: 'cuffli_services',
  notifications: 'cuffli_notifications'
};

// ========== DEFAULT SERVICES DATA ==========
const DEFAULT_SERVICES = [
  // TikTok
  { id: 'tt-like', platform: 'TikTok', name: 'Like', desc: 'Tingkatkan like video TikTok secara cepat dan aman.', price: 15, min: 50, max: 100000, eta: '1-6 jam', status: 'active', icon: 'fa-brands fa-tiktok' },
  { id: 'tt-view', platform: 'TikTok', name: 'View', desc: 'Tingkatkan views video TikTok untuk jangkauan lebih luas.', price: 5, min: 100, max: 500000, eta: '1-12 jam', status: 'active', icon: 'fa-brands fa-tiktok' },
  { id: 'tt-follower', platform: 'TikTok', name: 'Follower', desc: 'Tambah follower TikTok berkualitas.', price: 40, min: 50, max: 50000, eta: '6-24 jam', status: 'active', icon: 'fa-brands fa-tiktok' },
  { id: 'tt-share', platform: 'TikTok', name: 'Share', desc: 'Tingkatkan share video TikTok.', price: 25, min: 20, max: 20000, eta: '2-12 jam', status: 'active', icon: 'fa-brands fa-tiktok' },

  // Instagram
  { id: 'ig-like', platform: 'Instagram', name: 'Like', desc: 'Like postingan Instagram real engagement.', price: 20, min: 50, max: 100000, eta: '1-6 jam', status: 'active', icon: 'fa-brands fa-instagram' },
  { id: 'ig-follower', platform: 'Instagram', name: 'Follower', desc: 'Follower Instagram aktif dan berkualitas.', price: 50, min: 50, max: 30000, eta: '12-48 jam', status: 'active', icon: 'fa-brands fa-instagram' },
  { id: 'ig-view', platform: 'Instagram', name: 'View', desc: 'Views untuk Reels / Story Instagram.', price: 8, min: 100, max: 500000, eta: '1-12 jam', status: 'active', icon: 'fa-brands fa-instagram' },
  { id: 'ig-engagement', platform: 'Instagram', name: 'Engagement', desc: 'Paket engagement (like + comment).', price: 80, min: 20, max: 5000, eta: '6-24 jam', status: 'active', icon: 'fa-brands fa-instagram' },

  // YouTube
  { id: 'yt-view', platform: 'YouTube', name: 'View', desc: 'Views video YouTube berkualitas tinggi.', price: 25, min: 100, max: 200000, eta: '12-48 jam', status: 'active', icon: 'fa-brands fa-youtube' },
  { id: 'yt-like', platform: 'YouTube', name: 'Like', desc: 'Like video YouTube.', price: 30, min: 20, max: 50000, eta: '6-24 jam', status: 'active', icon: 'fa-brands fa-youtube' },
  { id: 'yt-sub', platform: 'YouTube', name: 'Subscriber', desc: 'Subscriber YouTube aktif.', price: 120, min: 10, max: 10000, eta: '24-72 jam', status: 'active', icon: 'fa-brands fa-youtube' },

  // Facebook
  { id: 'fb-like', platform: 'Facebook', name: 'Like', desc: 'Like halaman / postingan Facebook.', price: 18, min: 50, max: 50000, eta: '6-24 jam', status: 'active', icon: 'fa-brands fa-facebook' },
  { id: 'fb-follower', platform: 'Facebook', name: 'Follower', desc: 'Follower halaman Facebook.', price: 45, min: 50, max: 20000, eta: '12-48 jam', status: 'active', icon: 'fa-brands fa-facebook' },
  { id: 'fb-reaction', platform: 'Facebook', name: 'Reaction', desc: 'Reaction (Love, Care, dll) postingan.', price: 22, min: 20, max: 30000, eta: '2-12 jam', status: 'active', icon: 'fa-brands fa-facebook' },
  { id: 'fb-view', platform: 'Facebook', name: 'View', desc: 'Views video Facebook.', price: 10, min: 100, max: 300000, eta: '6-24 jam', status: 'active', icon: 'fa-brands fa-facebook' },

  // Telegram
  { id: 'tg-member', platform: 'Telegram', name: 'Member', desc: 'Member channel / group Telegram.', price: 60, min: 50, max: 20000, eta: '12-48 jam', status: 'active', icon: 'fa-brands fa-telegram' },
  { id: 'tg-view', platform: 'Telegram', name: 'View', desc: 'Views post channel Telegram.', price: 8, min: 100, max: 100000, eta: '1-12 jam', status: 'active', icon: 'fa-brands fa-telegram' },

  // X / Twitter
  { id: 'x-like', platform: 'X / Twitter', name: 'Like', desc: 'Like postingan X (Twitter).', price: 25, min: 20, max: 50000, eta: '1-12 jam', status: 'active', icon: 'fa-brands fa-x-twitter' },
  { id: 'x-view', platform: 'X / Twitter', name: 'View', desc: 'Views postingan X.', price: 6, min: 100, max: 500000, eta: '1-12 jam', status: 'active', icon: 'fa-brands fa-x-twitter' },
  { id: 'x-follower', platform: 'X / Twitter', name: 'Follower', desc: 'Follower akun X berkualitas.', price: 55, min: 50, max: 20000, eta: '12-48 jam', status: 'active', icon: 'fa-brands fa-x-twitter' },

  // Threads
  { id: 'th-like', platform: 'Threads', name: 'Like', desc: 'Like postingan Threads.', price: 20, min: 20, max: 30000, eta: '2-12 jam', status: 'active', icon: 'fa-brands fa-threads' },
  { id: 'th-view', platform: 'Threads', name: 'View', desc: 'Views postingan Threads.', price: 7, min: 50, max: 200000, eta: '1-12 jam', status: 'active', icon: 'fa-brands fa-threads' },
  { id: 'th-follower', platform: 'Threads', name: 'Follower', desc: 'Follower akun Threads.', price: 50, min: 30, max: 15000, eta: '12-48 jam', status: 'active', icon: 'fa-brands fa-threads' }
];

// ========== INIT STORAGE ==========
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.services)) {
    localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(DEFAULT_SERVICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    // Default admin + demo user
    const users = [
      {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@cuffli.social',
        password: 'admin123',
        name: 'Admin Cuffli',
        role: 'admin',
        balance: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-1',
        username: 'demo',
        email: 'demo@cuffli.social',
        password: 'demo123',
        name: 'Demo User',
        role: 'user',
        balance: 50000,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify([]));
  }
}

// ========== HELPERS ==========
function getServices() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.services) || '[]');
}

function saveServices(services) {
  localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services));
}

function getOrders() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

function generateOrderId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CS${date}${rand}`;
}

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ========== TOAST ==========
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-xmark',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}"></i>
    <div class="toast-msg">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ========== AUTH ==========
function requireLogin(redirect = 'login.html') {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = redirect;
    return null;
  }
  return user;
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = '../login.html';
    return null;
  }
  return user;
}

function logout() {
  setCurrentUser(null);
  showToast('Berhasil logout', 'success');
  setTimeout(() => {
    const isAdmin = window.location.pathname.includes('/admin/');
    window.location.href = isAdmin ? '../index.html' : 'index.html';
  }, 800);
}

// ========== LOADING SCREEN ==========
function initLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  const textEl = screen.querySelector('.loading-text');
  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    if (textEl) textEl.textContent = 'Loading' + '.'.repeat(dots);
  }, 400);

  window.addEventListener('load', () => {
    setTimeout(() => {
      clearInterval(interval);
      screen.classList.add('hide');
      setTimeout(() => screen.remove(), 600);
    }, 900);
  });
}

// ========== FAQ TOGGLE ==========
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      item.classList.toggle('open');
    });
  });
}

// ========== NAV ACTIVE STATE ==========
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .bottom-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ========== UPDATE NAV BASED ON LOGIN ==========
function updateNavAuth() {
  const user = getCurrentUser();
  const loginBtn = document.getElementById('nav-login');
  const profileBtn = document.getElementById('nav-profile');
  if (loginBtn && profileBtn) {
    if (user) {
      loginBtn.classList.add('hidden');
      profileBtn.classList.remove('hidden');
      profileBtn.textContent = user.name || user.username;
    } else {
      loginBtn.classList.remove('hidden');
      profileBtn.classList.add('hidden');
    }
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initLoading();
  setActiveNav();
  updateNavAuth();
  initFAQ();
});
