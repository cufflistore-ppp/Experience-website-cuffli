/* ELZKII JOKI auth bridge. ej-auth.js must load before this file. */
(function () {
  if (!window.ELZKIIAuth) {
    console.error('[ELZKII AUTH] ej-auth.js belum dimuat.');
    return;
  }
  window.ELZKIIAuthBridge = window.ELZKIIAuth;
})();
