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
      align-items:center; justify-content:center; overflow:hidden;
      padding:24px 18px; color:#fff; text-align:center;
      font-family:Segoe UI,system-ui,-apple-system,sans-serif; visibility:visible;
      background:
        radial-gradient(ellipse at 50% -12%,rgba(59,130,246,.48) 0%,transparent 48%),
        radial-gradient(ellipse at 0% 100%,rgba(37,99,235,.22) 0%,transparent 42%),
        linear-gradient(145deg,#101e46 0%,#080f25 48%,#060a18 100%);
      isolation:isolate;
    }
    #vxMaintenanceScreen::before,
    #vxMaintenanceScreen::after {
      content:""; position:absolute; z-index:-1; pointer-events:none;
      border-radius:50%; filter:blur(2px); opacity:.55;
    }
    #vxMaintenanceScreen::before {
      width:310px;height:310px;top:-145px;right:-100px;
      border:1px solid rgba(96,165,250,.28);
      box-shadow:0 0 0 28px rgba(59,130,246,.035),0 0 0 58px rgba(59,130,246,.025);
      animation:vxOrbit 18s linear infinite;
    }
    #vxMaintenanceScreen::after {
      width:250px;height:250px;bottom:-140px;left:-90px;
      border:1px solid rgba(96,165,250,.24);
      box-shadow:0 0 0 25px rgba(59,130,246,.035),0 0 0 52px rgba(59,130,246,.025);
      animation:vxOrbit 22s linear infinite reverse;
    }
    #vxMaintenanceScreen .vx-bg-grid {
      position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.14;
      background-image:linear-gradient(rgba(147,197,253,.12) 1px,transparent 1px),
        linear-gradient(90deg,rgba(147,197,253,.12) 1px,transparent 1px);
      background-size:42px 42px;
      mask-image:radial-gradient(ellipse at center,#000 10%,transparent 78%);
    }
    #vxMaintenanceScreen .vx-maintenance-inner {
      width:min(100%,540px); margin:auto; position:relative;
      animation:vxCardEnter .8s cubic-bezier(.2,.75,.25,1) both;
    }
    #vxMaintenanceScreen .vx-offline-card {
      position:relative; overflow:hidden; padding:clamp(25px,6vw,42px) clamp(20px,6vw,42px);
      border-radius:26px; border:1px solid rgba(147,197,253,.2);
      background:linear-gradient(155deg,rgba(22,39,79,.88),rgba(10,19,43,.88));
      box-shadow:0 24px 80px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.07);
      backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
    }
    #vxMaintenanceScreen .vx-offline-card::before {
      content:"";position:absolute;left:12%;right:12%;top:0;height:1px;
      background:linear-gradient(90deg,transparent,rgba(147,197,253,.8),transparent);
    }
    #vxMaintenanceScreen .vx-count-wrap {
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
      min-height:240px;
    }
    #vxMaintenanceScreen .vx-count {
      font-size:clamp(58px,16vw,88px);line-height:1;font-weight:850;
      letter-spacing:2px;color:#fff;text-shadow:0 0 35px rgba(59,130,246,.55);
      animation:vxCountPulse .72s ease-in-out infinite alternate;
    }
    #vxMaintenanceScreen .vx-count-label {
      color:rgba(219,234,254,.8);font-size:11px;font-weight:750;
      letter-spacing:3px;text-transform:uppercase;
    }
    #vxMaintenanceScreen .vx-count-ring {
      width:116px;height:116px;border-radius:50%;display:grid;place-items:center;
      border:1px solid rgba(96,165,250,.36);
      background:radial-gradient(circle,rgba(59,130,246,.2),rgba(30,64,175,.05) 68%);
      box-shadow:0 0 0 9px rgba(59,130,246,.045),0 0 38px rgba(37,99,235,.2);
      animation:vxRing 2.4s ease-in-out infinite;
    }
    #vxMaintenanceScreen .vx-offline-copy { display:none;color:#fff;font-size:14px;line-height:1.8; }
    #vxMaintenanceScreen.vx-show-message .vx-count-wrap { display:none; }
    #vxMaintenanceScreen.vx-show-message .vx-offline-copy {
      display:block;animation:vxMessageEnter .75s cubic-bezier(.2,.75,.25,1) both;
    }
    #vxMaintenanceScreen .vx-status-pill {
      display:inline-flex;align-items:center;gap:8px;padding:7px 12px;margin-bottom:20px;
      border-radius:999px;border:1px solid rgba(96,165,250,.28);
      background:rgba(37,99,235,.13);color:#bfdbfe;font-size:10px;
      font-weight:800;letter-spacing:1.7px;
    }
    #vxMaintenanceScreen .vx-status-dot {
      width:7px;height:7px;border-radius:50%;background:#60a5fa;
      box-shadow:0 0 0 4px rgba(96,165,250,.13),0 0 12px rgba(96,165,250,.9);
      animation:vxDot 1.5s ease-in-out infinite;
    }
    #vxMaintenanceScreen .vx-maintenance-symbol {
      width:82px;height:82px;margin:0 auto 19px;border-radius:24px;
      display:grid;place-items:center;color:#bfdbfe;
      border:1px solid rgba(96,165,250,.3);
      background:linear-gradient(145deg,rgba(59,130,246,.25),rgba(30,64,175,.12));
      box-shadow:0 12px 32px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.08);
      animation:vxSymbolFloat 3.2s ease-in-out infinite;
    }
    #vxMaintenanceScreen .vx-maintenance-symbol svg { width:43px;height:43px; }
    #vxMaintenanceScreen .vx-offline-copy .vx-title {
      font-size:clamp(22px,5.5vw,30px);line-height:1.25;font-weight:850;
      letter-spacing:.2px;margin:0 0 13px;color:#fff;
      text-shadow:0 3px 24px rgba(59,130,246,.28);
    }
    #vxMaintenanceScreen .vx-title-line {
      width:54px;height:3px;margin:0 auto 19px;border-radius:99px;
      background:linear-gradient(90deg,#2563eb,#7dd3fc);
      box-shadow:0 0 16px rgba(96,165,250,.55);
    }
    #vxMaintenanceScreen .vx-offline-copy p { margin:0 0 11px;color:rgba(235,243,255,.83); }
    #vxMaintenanceScreen .vx-offline-copy p:nth-of-type(2) { color:#fff;font-weight:550; }
    #vxMaintenanceScreen .vx-offline-copy .vx-sign {
      display:inline-block;margin:13px 0 0;padding:9px 15px;
      border-radius:999px;border:1px solid rgba(96,165,250,.25);
      background:rgba(37,99,235,.12);color:#dbeafe;font-weight:800;
      letter-spacing:.8px;font-size:12px;
    }
    @keyframes vxCountPulse { from { transform:scale(.94);opacity:.72; } to { transform:scale(1.05);opacity:1; } }
    @keyframes vxOrbit { to { transform:rotate(360deg); } }
    @keyframes vxRing { 0%,100% { transform:scale(.96);box-shadow:0 0 0 9px rgba(59,130,246,.045),0 0 38px rgba(37,99,235,.2); } 50% { transform:scale(1.04);box-shadow:0 0 0 15px rgba(59,130,246,.025),0 0 48px rgba(37,99,235,.3); } }
    @keyframes vxDot { 0%,100% { opacity:1;transform:scale(1); } 50% { opacity:.45;transform:scale(.78); } }
    @keyframes vxSymbolFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
    @keyframes vxCardEnter { from { opacity:0;transform:translateY(18px) scale(.985); } to { opacity:1;transform:translateY(0) scale(1); } }
    @keyframes vxMessageEnter { from { opacity:0;transform:translateY(14px); } to { opacity:1;transform:translateY(0); } }
    @media(max-width:420px) {
      #vxMaintenanceScreen { padding:16px 13px; }
      #vxMaintenanceScreen .vx-offline-card { border-radius:22px;padding:26px 19px; }
      #vxMaintenanceScreen .vx-offline-copy { font-size:13px;line-height:1.75; }
      #vxMaintenanceScreen .vx-maintenance-symbol { width:72px;height:72px;border-radius:21px; }
    }
    @media(prefers-reduced-motion:reduce) {
      #vxMaintenanceScreen *,#vxMaintenanceScreen *::before,#vxMaintenanceScreen *::after {
        animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;
      }
    }
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
      '<div class="vx-bg-grid" aria-hidden="true"></div>' +
      '<div class="vx-maintenance-inner">' +
        '<div class="vx-offline-card">' +
          '<div class="vx-count-wrap">' +
            '<div class="vx-count-ring"><div class="vx-count" id="vxMaintenanceCount">3</div></div>' +
            '<div class="vx-count-label">MOHON TUNGGU</div>' +
          '</div>' +
          '<div class="vx-offline-copy">' +
            '<div class="vx-status-pill"><span class="vx-status-dot"></span> MAINTENANCE MODE</div>' +
            '<div class="vx-maintenance-symbol" aria-hidden="true">' +
              '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M14.5 32.5h19a8 8 0 0 0 .8-16 11.5 11.5 0 0 0-22.2 2.2 7 7 0 0 0 2.4 13.8Z" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<path d="m19 21 10 10m0-10L19 31" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>' +
              '</svg>' +
            '</div>' +
            '<div class="vx-title">WEBSITE SEDANG OFFLINE</div>' +
            '<div class="vx-title-line"></div>' +
            '<p>Mohon maaf atas ketidaknyamanannya.</p>' +
            '<p>Website kami saat ini sedang offline atau mengalami gangguan sementara.</p>' +
            '<p>Silakan kembali beberapa saat lagi. Kami sedang berupaya agar website dapat diakses kembali secepat mungkin.</p>' +
            '<p>Terima kasih atas kesabaran dan pengertiannya.</p>' +
            '<p class="vx-sign">— VOXY MARKET17</p>' +
          '</div>' +
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