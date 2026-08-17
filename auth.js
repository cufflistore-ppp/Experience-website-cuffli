/**
 * VORTEX HUB - Authentication (LocalStorage Demo)
 */

const Auth = {
  init() {
    // Protect pages if needed
    const protectedPages = ['dashboard.html', 'profile.html', 'admin.html'];
    const current = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(current) && !this.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }

    if (current === 'admin.html' && !this.isAdmin()) {
      Toast.show('Akses ditolak. Hanya admin.', 'error');
      setTimeout(() => window.location.href = 'dashboard.html', 1500);
    }
  },

  isLoggedIn() {
    return !!Storage.getUser();
  },

  isAdmin() {
    const user = Storage.getUser();
    return user && user.role === 'admin';
  },

  register(name, email, password) {
    if (!name || !email || !password) {
      return { success: false, message: 'Semua field wajib diisi' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password minimal 6 karakter' };
    }

    const users = Storage.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email sudah terdaftar' };
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: btoa(password), // simple encode for demo only
      role: email.toLowerCase() === 'admin@vortexhub.com' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      favorites: [],
      recent: []
    };

    users.push(newUser);
    Storage.saveUsers(users);
    Storage.addActivity(`User registered: ${email}`);

    // Auto login
    const { password: _, ...safeUser } = newUser;
    Storage.setUser(safeUser);
    
    return { success: true, message: 'Registrasi berhasil!' };
  },

  login(email, password) {
    if (!email || !password) {
      return { success: false, message: 'Email dan password wajib' };
    }

    const users = Storage.getUsers();
    const user = users.find(u => u.email === email.toLowerCase() && u.password === btoa(password));

    if (!user) {
      // Create default admin if none
      if (email.toLowerCase() === 'admin@vortexhub.com' && password === 'admin123') {
        const admin = {
          id: 'admin1',
          name: 'Administrator',
          email: 'admin@vortexhub.com',
          password: btoa('admin123'),
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        users.push(admin);
        Storage.saveUsers(users);
        const { password: __, ...safe } = admin;
        Storage.setUser(safe);
        Storage.addActivity('Admin logged in');
        return { success: true, message: 'Login sebagai Admin' };
      }
      return { success: false, message: 'Email atau password salah' };
    }

    const { password: _, ...safeUser } = user;
    Storage.setUser(safeUser);
    Storage.addActivity(`Login: ${email}`);
    return { success: true, message: `Selamat datang, ${user.name}!` };
  },

  logout() {
    Storage.clearUser();
    Storage.addActivity('Logout');
    Toast.show('Berhasil logout', 'success');
    setTimeout(() => window.location.href = 'index.html', 800);
  },

  updateProfile(data) {
    const user = Storage.getUser();
    if (!user) return { success: false, message: 'Belum login' };

    const users = Storage.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return { success: false, message: 'User tidak ditemukan' };

    users[idx] = { ...users[idx], ...data };
    Storage.saveUsers(users);
    
    const { password: _, ...safe } = users[idx];
    Storage.setUser(safe);
    return { success: true, message: 'Profil diperbarui' };
  }
};

window.Auth = Auth;
