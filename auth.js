/**
 * VOXYY - Login Google (Firebase Auth)
 * Mobile: pakai redirect (popup sering gagal → about:blank)
 * Desktop: coba popup, gagal → redirect
 */
(function () {
  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry/i.test(
      navigator.userAgent || ""
    );
  }

  function ensureAuth() {
    if (typeof firebase === "undefined") return null;
    if (!window.VoxyyOrders || !window.VoxyyOrders.isGlobalConfigured()) return null;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG || {});
      }
      if (window.VoxyyOrders.initFirebase) window.VoxyyOrders.initFirebase();
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
        "Firebase belum di-setup. Isi FIREBASE_CONFIG dan aktifkan Google Sign-In + Authorized domains."
      );
    }
    const provider = makeProvider();

    // Di HP: langsung redirect (lebih stabil)
    if (isMobile()) {
      await auth.signInWithRedirect(provider);
      return null;
    }

    try {
      const result = await auth.signInWithPopup(provider);
      return result.user;
    } catch (e) {
      const code = e && e.code ? e.code : "";
      // Popup diblokir / ditutup / gagal → redirect
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/operation-not-supported-in-this-environment" ||
        /popup|blank/i.test(String(e.message || ""))
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
      if (result && result.user) return result.user;
      return null;
    } catch (e) {
      console.warn("[Voxyy Auth] redirect result:", e);
      // Simpan error supaya UI bisa tampilkan
      try {
        sessionStorage.setItem("voxyy_auth_err", e.message || String(e));
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
    handleRedirectResult,
    isMobile
  };
})();
