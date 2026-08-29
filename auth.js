/**
 * VOXYY - Login Google (Firebase Auth)
 * authDomain HARUS domain website (experience-website-cuffli.vercel.app)
 * + vercel.json proxy /__/auth/*
 */
(function () {
  function ensureAuth() {
    if (typeof firebase === "undefined") return null;
    if (!window.VoxyyOrders || !window.VoxyyOrders.isGlobalConfigured()) return null;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG || {});
      }
      if (window.VoxyyOrders.initFirebase) window.VoxyyOrders.initFirebase();
      const auth = firebase.auth();
      try {
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      } catch (e) {}
      return auth;
    } catch (e) {
      console.error("[Voxyy Auth]", e);
      return null;
    }
  }

  function currentUser() {
    const auth = ensureAuth();
    return auth ? auth.currentUser : null;
  }

  function makeProvider() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    provider.addScope("profile");
    provider.addScope("email");
    return provider;
  }

  async function loginGoogle() {
    const auth = ensureAuth();
    if (!auth) {
      throw new Error(
        "Firebase belum siap. Upload global-orders.js terbaru + aktifkan Google Sign-In."
      );
    }
    const provider = makeProvider();

    // Selalu redirect (satu tab) — lebih stabil di HP Android
    // Jangan pakai popup (sering about:blank / keluar-masuk)
    await auth.signInWithRedirect(provider);
    return null;
  }

  async function handleRedirectResult() {
    const auth = ensureAuth();
    if (!auth) return null;
    try {
      const result = await auth.getRedirectResult();
      if (result && result.user) {
        try {
          sessionStorage.removeItem("voxyy_auth_err");
        } catch (e) {}
        return result.user;
      }
      return null;
    } catch (e) {
      console.warn("[Voxyy Auth] redirect:", e);
      try {
        sessionStorage.setItem(
          "voxyy_auth_err",
          (e && e.message) || String(e)
        );
      } catch (x) {}
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
