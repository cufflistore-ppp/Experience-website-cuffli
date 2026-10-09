/**
 * Wajib login (kecuali login/daftar/index/jasa-link).
 * Cepat restore sesi — jangan delay / jangan blank lama.
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
  var PUBLIC = ["login", "daftar", "index", "jasa-link"];
  if (PUBLIC.indexOf(path) >= 0) return;
  if (path === "admin") return;

  var redirected = false;
  function goLogin() {
    if (redirected) return;
    redirected = true;
    var rawPath = (location.pathname || "/").replace(/^\//, "") || "home";
    location.replace("login.html?next=" + encodeURIComponent(rawPath + (location.search || "")));
  }

  function showBody() {
    try { document.documentElement.style.visibility = ""; } catch (e) {}
  }

  // Tampilkan segera kalau flag login ada (hindari blank di device lambat)
  var softOk = false;
  try {
    if (localStorage.getItem("voxyy_logged_in") === "1") {
      softOk = true;
      showBody();
    } else {
      try { document.documentElement.style.visibility = "hidden"; } catch (e) {}
    }
  } catch (e) {
    showBody();
  }

  var settled = false;
  function allow() {
    if (settled) return;
    settled = true;
    showBody();
  }
  function deny() {
    if (settled) return;
    if (softOk) {
      // tetap biarkan browsing; Firebase restore di background
      settled = true;
      showBody();
      return;
    }
    settled = true;
    goLogin();
  }

  var tries = 0;
  function tick() {
    tries++;
    var auth = null;
    try {
      if (window.VoxyyAuth && window.VoxyyAuth.ensureAuth) auth = window.VoxyyAuth.ensureAuth();
    } catch (e) {}
    try {
      if (!auth && typeof firebase !== "undefined" && firebase.auth) {
        if (window.VoxyyOrders && window.VoxyyOrders.initFirebase) {
          try { window.VoxyyOrders.initFirebase(); } catch (e) {}
        }
        if ((!firebase.apps || !firebase.apps.length) && window.VoxyyOrders && window.VoxyyOrders.FIREBASE_CONFIG) {
          try { firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG); } catch (e) {}
        }
        auth = firebase.auth();
        try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
      }
    } catch (e) {}

    if (auth) {
      if (auth.currentUser) { allow(); return; }
      var done = false;
      var unsub = auth.onAuthStateChanged(function (user) {
        if (done) return;
        done = true;
        try { unsub && unsub(); } catch (e) {}
        if (user) allow();
        else deny();
      });
      // max tunggu 2 detik (bukan 5)
      setTimeout(function () {
        if (done || settled) return;
        if (auth.currentUser) allow();
        else deny();
      }, 2000);
      return;
    }
    if (tries < 40) setTimeout(tick, 50);
    else deny();
  }
  tick();
})();
