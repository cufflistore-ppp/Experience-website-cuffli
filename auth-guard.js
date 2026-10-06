/**
 * Wajib login/daftar dulu sebelum masuk website.
 * Halaman publik: login.html, daftar.html saja.
 */
(function () {
  var PUBLIC = ["login.html", "daftar.html", "index.html"];
  var path = (location.pathname || "").split("/").pop() || "index.html";
  path = path.toLowerCase();
  if (!path || path === "/") path = "home.html";

  // Izinkan halaman auth
  if (PUBLIC.indexOf(path) >= 0) return;

  // Admin pakai gate sendiri
  if (path === "admin.html") return;

  var redirected = false;
  function goLogin() {
    if (redirected) return;
    redirected = true;
    var next = encodeURIComponent(path + (location.search || ""));
    location.replace("login.html?next=" + next);
  }

  function waitAuth(cb) {
    var n = 0;
    function tick() {
      if (window.VoxyyAuth && typeof window.VoxyyAuth.onAuthChange === "function") {
        cb();
        return;
      }
      if (++n > 80) {
        // Firebase tidak siap — tetap minta login
        goLogin();
        return;
      }
      setTimeout(tick, 100);
    }
    tick();
  }

  // Sembunyikan body dulu biar tidak flash konten
  try {
    document.documentElement.style.visibility = "hidden";
  } catch (e) {}

  waitAuth(function () {
    window.VoxyyAuth.onAuthChange(function (user) {
      if (user) {
        try {
          document.documentElement.style.visibility = "";
        } catch (e) {}
      } else {
        goLogin();
      }
    });
  });
})();
