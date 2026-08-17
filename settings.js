/**
 * VORTEX HUB - Settings
 */

const SettingsPage = {
  init() {
    const settings = Storage.getSettings();
    
    const apiInput = document.getElementById('setting-apikey');
    if (apiInput) apiInput.value = settings.apiKey || '';

    const notifCheck = document.getElementById('setting-notif');
    if (notifCheck) notifCheck.checked = settings.notifications !== false;

    document.getElementById('btn-save-settings')?.addEventListener('click', () => {
      const newSettings = {
        apiKey: document.getElementById('setting-apikey')?.value || '',
        notifications: document.getElementById('setting-notif')?.checked ?? true,
        language: 'id'
      };
      Storage.setSettings(newSettings);
      Toast.show('Pengaturan disimpan', 'success');
    });

    document.getElementById('btn-clear-data')?.addEventListener('click', () => {
      if (confirm('Hapus semua data lokal (favorites, recent, notes)? Akun tetap aman.')) {
        Storage.remove('vortex_favorites');
        Storage.remove('vortex_recent');
        Storage.remove('vortex_notes');
        Storage.remove('vortex_activity');
        Toast.show('Data lokal dibersihkan', 'success');
      }
    });
  }
};

window.SettingsPage = SettingsPage;
