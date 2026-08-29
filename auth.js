/**
 * VOXYY - Login Google (Firebase Auth)
 * Hanya Google Sign-In.
 */
(function () {
  let _authReady = false;

  function ensureAuth() {
    if (typeof firebase === "undefined") return null;
    if (!window.VoxyyOrders || !window.VoxyyOrders.isGlobalConfigured()) return null;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG || {});
      }
      if (window.VoxyyOrders.initFirebase) window.VoxyyOrders.initFirebase();
      _authReady = true;
      return firebase.auth();
    } catch (e) {
      console.error("[Voxyy Auth]", e);
      return null;
    }
  }

  function currentUser() {
    const auth = ensureAuth();
    return auth ? auth.currentUser : null;
  }

  async function loginGoogle() {
    const auth = ensureAuth();
    if (!auth) {
      throw new Error(
        "Firebase belum di-setup. Isi FIREBASE_CONFIG di global-orders.js dan aktifkan Google Sign-In."
      );
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await auth.signInWithPopup(provider);
      return result.user;
    } catch (e) {
      // Mobile / popup diblokir → redirect
      if (
        e.code === "auth/popup-blocked" ||
        e.code === "auth/popup-closed-by-user" ||
        e.code === "auth/cancelled-popup-request" ||
        /popup/i.test(String(e.message || ""))
      ) {
        await auth.signInWithRedirect(provider);
        return null;
      }
      throw e;
    }
  }

  async function handleRedirectResult() {
    const auth = ensureAuth();
    if (!auth) return null;
    try {
      const result = await auth.getRedirectResult();
      return result && result.user ? result.user : null;
    } catch (e) {
      console.warn("[Voxyy Auth] redirect:", e);
      return null;
    }
  }

  async function logout() {
    const auth = ensureAuth();
    if (!auth) return;
    await auth.signOut();
  }

  function onAuthChange(fn) {
    const auth = ensureAuth();
    if (!auth) {
      fn(null);
      return function () {};
    }
    return auth.onAuthStateChanged(fn);
  }

  window.VoxyyAuth = {
    ensureAuth,
    currentUser,
    loginGoogle,
    logout,
    onAuthChange,
    handleRedirectResult
  };
})();
