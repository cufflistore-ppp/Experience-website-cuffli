(function () {
  "use strict";
  var path = (location.pathname || "").toLowerCase();
  // Semua halaman admin tetap dapat diakses saat toko sedang maintenance.
  if (/\/admin(?:[-/]|\.|$)/.test(path)) return;

  document.documentElement.classList.add("vx-maintenance-checking");

  var css = `
    html.vx-maintenance-checking body { visibility:hidden !important; }
    #vxMaintenanceScreen {
      position:fixed; inset:0; z-index:2147483647; display:flex;
      align-items:center; justify-content:center; padding:26px;
      background:#070b1a; color:#fff; font-family:Segoe UI,system-ui,sans-serif;
      text-align:center; visibility:visible;
    }
    #vxMaintenanceScreen .vx-maintenance-inner { width:min(100%,560px); margin:auto; }
    #vxMaintenanceScreen .vx-count {
      font-size:clamp(42px,12vw,68px); line-height:1; font-weight:800;
      letter-spacing:2px; color:#fff; animation:vxCountPulse .72s ease-in-out infinite alternate;
    }
    #vxMaintenanceScreen .vx-count-label { margin-top:12px; color:rgba(255,255,255,.72); font-size:13px; letter-spacing:2px; }
    #vxMaintenanceScreen .vx-offline-copy { display:none; color:#fff; font-size:15px; line-height:1.85; }
    #vxMaintenanceScreen.vx-show-message .vx-count,
    #vxMaintenanceScreen.vx-show-message .vx-count-label { display:none; }
    #vxMaintenanceScreen.vx-show-message .vx-offline-copy { display:block; }
    #vxMaintenanceScreen .vx-offline-copy .vx-title {
      font-size:clamp(21px,5vw,28px); font-weight:800; letter-spacing:.3px; margin-bottom:12px;
    }
    #vxMaintenanceScreen .vx-offline-copy p { margin:0 0 12px; }
    #vxMaintenanceScreen .vx-offline-copy .vx-sign { margin-top:20px; font-weight:700; }
    @keyframes vxCountPulse { from { transform:scale(.94); opacity:.7; } to { transform:scale(1.04); opacity:1; } }
  `;
  var style = document.createElement("style");
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  function firebaseReady() {
    if (typeof firebase === "undefined" || !firebase.database) return Promise.reject(new Error("Firebase SDK belum dimuat"));
    var config = {
      apiKey: "AIzaSyAx2I5hmnMBkS04tOr21B9KG4SVaVCqyQg",
      authDomain: "voxyyjoki.firebaseapp.com",
      databaseURL: "https://voxyyjoki-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "voxyyjoki",
      storageBucket: "voxyyjoki.firebasestorage.app",
      messagingSenderId: "442340334430",
      appId: "1:442340334430:web:785c5a5f69aaf8fe8fcdcf"
    };
    if (!firebase.apps.length) firebase.initializeApp(config);
    return Promise.resolve(firebase.database());
  }

  var screen = null, timer = null, currentOnline = true, lastTransition = 0;
  function ensureScreen() {
    if (screen) return screen;
    screen = document.createElement("div");
    screen.id = "vxMaintenanceScreen";
    screen.innerHTML =
      '<div class="vx-maintenance-inner">' +
        '<div class="vx-count" id="vxMaintenanceCount">3</div>' +
        '<div class="vx-count-label">MOHON TUNGGU</div>' +
        '<div class="vx-offline-copy">' +
          '<div class="vx-title">WEBSITE SEDANG OFFLINE</div>' +
          '<p>Mohon maaf atas ketidaknyamanannya.</p>' +
          '<p>Website kami saat ini sedang offline atau mengalami gangguan sementara.</p>' +
          '<p>Silakan kembali beberapa saat lagi. Kami sedang berupaya agar website dapat diakses kembali secepat mungkin.</p>' +
          '<p>Terima kasih atas kesabaran dan pengertiannya.</p>' +
          '<p class="vx-sign">— VOXY MARKET17</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(screen);
    return screen;
  }

  function removeScreen() {
    if (timer) { clearInterval(timer); timer = null; }
    if (screen && screen.parentNode) screen.parentNode.removeChild(screen);
    screen = null;
    document.documentElement.classList.remove("vx-maintenance-checking");
    document.body.style.visibility = "";
  }

  function applyState(data) {
    data = data || {};
    var online = data.online !== false;
    var changedAt = Number(data.changedAt) || 0;
    var elapsed = changedAt ? Math.max(0, Date.now() - changedAt) : 3000;
    var remaining = Math.max(0, 3000 - elapsed);
    currentOnline = online;
    window.__VOXY_MAINTENANCE_ONLINE = online;

    // Kondisi normal: tidak ada transisi yang sedang berlangsung.
    if (online && remaining <= 0) {
      if (screen) removeScreen();
      else {
        document.documentElement.classList.remove("vx-maintenance-checking");
        document.body.style.visibility = "";
      }
      window.dispatchEvent(new CustomEvent("voxy-maintenance-ready", { detail: { online: true } }));
      return;
    }
    if (!online) window.dispatchEvent(new CustomEvent("voxy-maintenance-ready", { detail: { online: false } }));

    var overlay = ensureScreen();
    overlay.classList.remove("vx-show-message");
    if (timer) clearInterval(timer);
    var endAt = Date.now() + remaining;

    function tick() {
      var left = Math.max(0, endAt - Date.now());
      var seconds = Math.ceil(left / 1000);
      var counter = document.getElementById("vxMaintenanceCount");
      if (counter) counter.textContent = String(seconds);
      if (left <= 0) {
        clearInterval(timer); timer = null;
        if (currentOnline) {
          removeScreen();
          window.dispatchEvent(new CustomEvent("voxy-maintenance-ready", { detail: { online: true } }));
        } else {
          overlay.classList.add("vx-show-message");
          document.documentElement.classList.remove("vx-maintenance-checking");
        }
      }
    }
    tick();
    if (remaining > 0) timer = setInterval(tick, 100);
    else if (online) removeScreen();
    else {
      overlay.classList.add("vx-show-message");
      document.documentElement.classList.remove("vx-maintenance-checking");
    }
  }

  firebaseReady().then(function (db) {
    db.ref("settings/maintenance").on("value", function (snap) {
      applyState(snap.val());
    }, function () {
      // Jika status gagal dibaca, jangan mengunci pengunjung dari situs.
      removeScreen();
    });
  }).catch(function () {
    // Kegagalan koneksi Firebase tidak boleh membuat halaman terkunci.
    removeScreen();
    window.__VOXY_MAINTENANCE_ONLINE = true;
    window.dispatchEvent(new CustomEvent("voxy-maintenance-ready", { detail: { online: true } }));
  });
})();