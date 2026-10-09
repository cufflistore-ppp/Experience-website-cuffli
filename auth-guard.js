/**
 * Wajib login sebelum masuk website (kecuali login/daftar/index + jasa-link mid-checkout).
 * Sesi Firebase LOCAL — jangan minta login lagi kalau masih login.
 */
(function () {
  function baseName(p) {
    p = String(p || "").split("?")[0].split("#")[0];
    var parts = p.split("/").filter(Boolean);
    var last = (parts.length ? parts[parts.length - 1] : "index").toLowerCase();
    if (!last || last === "/") last = "index";
    if (last.endsWith(".html")) last = last.slice(0, -5);
    return last;
  }

  var path = baseName(location.pathname || "");
  // jasa-link: lanjut isi link setelah bayar — jangan paksa login lagi
  var PUBLIC = ["login", "daftar", "index", "jasa-link"];

  if (PUBLIC.indexOf(path) >= 0) {
    try { document.documentElement.style.visibility = ""; } catch (e) {}
    return;
  }
  if (path === "admin") return;

  var redirected = false;
  function goLogin() {
    if (redirected) return;
    redirected = true;
    var rawPath = (location.pathname || "/").replace(/^\//, "") || "home";
    var next = encodeURIComponent(rawPath + (location.search || ""));
    location.replace("login.html?next=" + next);
  }

  function showBody() {
    try { document.documentElement.style.visibility = ""; } catch (e) {}
  }

  try { document.documentElement.style.visibility = "hidden"; } catch (e) {}

  var settled = false;
  function allow(user) {
    if (settled) return;
    settled = true;
    showBody();
  }
  function deny() {
    if (settled) return;
    // Kalau flag lokal bilang masih login, JANGAN tendang — sesi Firebase mungkin belum restore
    try {
      if (localStorage.getItem("voxyy_logged_in") === "1") {
        settled = true;
        showBody();
        // coba restore di background
        return;
      }
    } catch (e) {}
    settled = true;
    goLogin();
  }

  var tries = 0;
  function tick() {
    tries++;
    var auth = null;
    try {
      if (window.VoxyyAuth && window.VoxyyAuth.ensureAuth) {
        auth = window.VoxyyAuth.ensureAuth();
      }
    } catch (e) {}
    try {
      if (!auth && typeof firebase !== "undefined" && firebase.auth) {
        if (window.VoxyyOrders && window.VoxyyOrders.initFirebase) {
          try { window.VoxyyOrders.initFirebase(); } catch (e) {}
        }
        if (!firebase.apps || !firebase.apps.length) {
          if (window.VoxyyOrders && window.VoxyyOrders.FIREBASE_CONFIG) {
            try { firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG); } catch (e) {}
          }
        }
        auth = firebase.auth();
        try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
      }
    } catch (e) {}

    if (auth) {
      if (auth.currentUser) {
        allow(auth.currentUser);
        return;
      }
      var done = false;
      var unsub = auth.onAuthStateChanged(function (user) {
        if (done) return;
        done = true;
        try { unsub && unsub(); } catch (e) {}
        if (user) allow(user);
        else {
          // beri waktu sedikit lagi untuk restore
          setTimeout(function () {
            if (settled) return;
            if (auth.currentUser) allow(auth.currentUser);
            else deny();
          }, 1500);
        }
      });
      setTimeout(function () {
        if (done || settled) return;
        if (auth.currentUser) allow(auth.currentUser);
        else deny();
      }, 5000);
      return;
    }

    if (tries < 100) setTimeout(tick, 100);
    else deny();
  }
  tick();
})();
