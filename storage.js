/**
 * VORTEX HUB - Storage Utility
 * Handles localStorage operations safely
 */

const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Storage get error:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  // User session
  getUser() {
    return this.get('vortex_user');
  },

  setUser(user) {
    return this.set('vortex_user', user);
  },

  clearUser() {
    return this.remove('vortex_user');
  },

  // Favorites
  getFavorites() {
    return this.get('vortex_favorites', []);
  },

  addFavorite(toolId) {
    const favs = this.getFavorites();
    if (!favs.includes(toolId)) {
      favs.push(toolId);
      this.set('vortex_favorites', favs);
    }
  },

  removeFavorite(toolId) {
    const favs = this.getFavorites().filter(id => id !== toolId);
    this.set('vortex_favorites', favs);
  },

  isFavorite(toolId) {
    return this.getFavorites().includes(toolId);
  },

  // Recently used
  getRecent() {
    return this.get('vortex_recent', []);
  },

  addRecent(toolId) {
    let recent = this.getRecent().filter(id => id !== toolId);
    recent.unshift(toolId);
    if (recent.length > 12) recent = recent.slice(0, 12);
    this.set('vortex_recent', recent);
  },

  // Theme
  getTheme() {
    return this.get('vortex_theme', 'light');
  },

  setTheme(theme) {
    this.set('vortex_theme', theme);
  },

  // Settings
  getSettings() {
    return this.get('vortex_settings', {
      notifications: true,
      language: 'id',
      apiKey: ''
    });
  },

  setSettings(settings) {
    this.set('vortex_settings', settings);
  },

  // Users database (demo)
  getUsers() {
    return this.get('vortex_users', []);
  },

  saveUsers(users) {
    this.set('vortex_users', users);
  },

  // Activity log
  addActivity(action) {
    const logs = this.get('vortex_activity', []);
    logs.unshift({
      action,
      time: new Date().toISOString(),
      user: this.getUser()?.email || 'guest'
    });
    if (logs.length > 50) logs.length = 50;
    this.set('vortex_activity', logs);
  },

  getActivity() {
    return this.get('vortex_activity', []);
  }
};

window.Storage = Storage;
