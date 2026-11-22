/* ELZKII JOKI — satu sumber autentikasi Firebase untuk seluruh halaman.
   Memerlukan Firebase compat app + auth + database SDK sebelum file ini. */
(function () {
  "use strict";
  const ADMINS = ["cufflistore@gmail.com", "hengkipratamaahmad@gmail.com"];
  const CONFIG = {
    apiKey: "AIzaSyB4b_vR90K80f5UcpWWS_m3euHn_X3xT7w",
    authDomain: "elzikiijoki.firebaseapp.com",
    databaseURL: "https://elzikiijoki-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "elzikiijoki",
    storageBucket: "elzikiijoki.firebasestorage.app",
    messagingSenderId: "226591865660",
    appId: "1:226591865660:web:08f67a832338500a237c39",
    measurementId: "G-VL9RXPECJR"
  };
  const GOOGLE_CLIENT_ID = "728120154992-eji5q980k5dbn6ucqri7op334uv7cj01.apps.googleusercontent.com";

  if (typeof firebase === "undefined") {
    console.error("[ELZKII AUTH] Firebase SDK belum dimuat.");
    return;
  }
  if (!firebase.apps.length) firebase.initializeApp(CONFIG);
  const app = firebase.app();
  const auth = firebase.auth();
  const db = firebase.database();
  // Firebase Web Auth defaults to LOCAL persistence. Avoid setting it on every
  // page load: storage initialization can hang in some mobile browser contexts.
  const persistenceReady = Promise.resolve();

  const isAdminEmail = email =>
    ADMINS.includes(String(email || "").trim().toLowerCase());
  // Admin access is controlled by the explicit Google-email allowlist.
  // Do not hide/deny an allowlisted admin because Firebase reports emailVerified differently.
  const isAdmin = user => !!user && isAdminEmail(user.email);

  async function loginGoogle() {
    await persistenceReady;
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await auth.signInWithPopup(provider);
      return result.user;
    } catch (err) {
      // Android/in-app browsers sometimes block popups; use Firebase redirect fallback.
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment",
           "auth/web-storage-unsupported"].includes(err && err.code)) {
        await auth.signInWithRedirect(provider);
        return null;
      }
      throw err;
    }
  }

  async function handleRedirectResult() {
    await persistenceReady;
    const result = await auth.getRedirectResult();
    return result && result.user ? result.user : auth.currentUser;
  }

  const api = {
    app, auth, db, ADMINS, CONFIG, GOOGLE_CLIENT_ID, isAdmin, isAdminEmail,
    loginGoogle,
    // Alias required by the login page's Google button.
    signInGoogle: loginGoogle,
    logout: () => auth.signOut(),
    handleRedirectResult,
    onAuthChange: callback => auth.onAuthStateChanged(callback),
    getCurrentUser: () => auth.currentUser,
    signInEmail: (email, password) => auth.signInWithEmailAndPassword(email, password),
    registerEmail: (email, password) => auth.createUserWithEmailAndPassword(email, password)
  };
  window.ELZKIIAuth = api;
  // Legacy global used by the existing order scripts; keep only ELZKII naming for auth.
  api.whenReady = function(timeout=5000){
    return new Promise(resolve=>{
      if (auth.currentUser) return resolve(auth.currentUser);
      let done=false;
      const finish=u=>{if(done)return;done=true;try{unsub&&unsub();}catch(e){}resolve(u||null)};
      const unsub=auth.onAuthStateChanged(u=>finish(u));
      setTimeout(()=>finish(auth.currentUser), timeout);
    });
  };
  window.EJ = api;

  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const publicPages = ["index.html", ""];
  if (publicPages.includes(page)) {
    handleRedirectResult().then(user => {
      if (user && user.emailVerified) location.replace("home.html");
    }).catch(err => {
      console.error("[ELZKII AUTH] Redirect result:", err);
      try { sessionStorage.setItem("elzkii_auth_err", err.message || String(err)); } catch (_) {}
    });
    return;
  }

  auth.onAuthStateChanged(user => {
    if (!user) {
      location.replace("index.html");
      return;
    }
    try {
      const key = btoa(String(user.email || "").toLowerCase()).replace(/[.#$\[\]/]/g, "_");
      db.ref("userIndex/" + key).set({
        uid: user.uid,
        email: String(user.email || ""),
        displayName: user.displayName || "",
        photoURL: user.photoURL || ""
      });
    } catch (e) { console.warn("[ELZKII AUTH] userIndex:", e); }
    if (page === "admin.html" && !isAdmin(user)) {
      alert("Akses panel admin hanya untuk admin resmi ELZKII JOKI.");
      location.replace("home.html");
      return;
    }
    document.documentElement.classList.add("ej-authenticated");
  });
})();