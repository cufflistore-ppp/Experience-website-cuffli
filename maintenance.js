(function () {
  "use strict";
  if (!window.VOXY || !VOXY.db) return;
  var ref = VOXY.db.ref("maintenance");
  var lastEnabled = null, transitionTimer = null, overlay = null;
  function ensureOverlay() {
    if (overlay) return overlay;
    var style = document.createElement("style");
    style.textContent = `
      html,body{margin:0!important;min-height:100%!important}
      #voxy-maintenance-screen{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100vw;height:100vh;min-height:100dvh;overflow:auto;padding:28px 22px;background:#070b1a;color:#fff;font-family:Arial,Helvetica,sans-serif;text-align:center}
      #voxy-maintenance-screen .vm-content{width:min(100%,680px);margin:auto}
      #voxy-maintenance-screen h1{font-size:clamp(23px,5vw,32px);line-height:1.3;font-weight:800;letter-spacing:.3px;margin:0 0 24px;color:#fff}
      #voxy-maintenance-screen p{font-size:clamp(15px,2.5vw,17px);line-height:1.85;margin:0 0 14px;color:#fff}
      #voxy-maintenance-screen .vm-sign{margin-top:25px;font-weight:700;color:#fff}
      #voxy-maintenance-screen .vm-count{font-size:clamp(58px,12vw,82px);font-weight:800;line-height:1;color:#fff;margin:0 0 20px}
    `;
    document.head.appendChild(style);
    overlay = document.createElement("div");
    overlay.id = "voxy-maintenance-screen";
    overlay.innerHTML = '<div class="vm-content"><div class="vm-count" id="vmCount">3</div><h1 id="vmTitle">WEBSITE SEDANG OFFLINE</h1><div id="vmMessage"></div><p class="vm-sign">— VOXY MARKET17</p></div>';
    document.body.appendChild(overlay);
    return overlay;
  }
  function showMaintenance() {
    var el = ensureOverlay();
    el.querySelector("#vmCount").style.display = "none";
    el.querySelector("#vmTitle").textContent = "WEBSITE SEDANG OFFLINE";
    el.querySelector("#vmMessage").innerHTML =
      '<p>Mohon maaf atas ketidaknyamanannya.</p>' +
      '<p>Website kami saat ini sedang offline atau mengalami gangguan sementara.</p>' +
      '<p>Silakan kembali beberapa saat lagi. Kami sedang berupaya agar website dapat diakses kembali secepat mungkin.</p>' +
      '<p>Terima kasih atas kesabaran dan pengertiannya.</p>';
    el.querySelector(".vm-sign").style.display = "block";
  }
  function countdown(enabled, data) {
    if (transitionTimer) clearInterval(transitionTimer);
    var el = ensureOverlay(), count = 3;
    el.querySelector("#vmCount").style.display = "block";
    el.querySelector("#vmCount").textContent = count;
    el.querySelector("#vmTitle").textContent = enabled ? "WEBSITE SEGERA AKTIF" : "WEBSITE SEDANG OFFLINE";
    el.querySelector("#vmMessage").innerHTML = "";
    el.querySelector(".vm-sign").style.display = "none";
    transitionTimer = setInterval(function () {
      count--;
      el.querySelector("#vmCount").textContent = count;
      if (count <= 0) {
        clearInterval(transitionTimer); transitionTimer = null;
        if (enabled) {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
          overlay = null;
        } else showMaintenance();
      }
    }, 1000);
  }
  ref.on("value", function (snap) {
    var data = snap.val() || {};
    var enabled = data.enabled !== false;
    if (lastEnabled === null) {
      lastEnabled = enabled;
      if (!enabled) countdown(false, data);
      return;
    }
    if (enabled !== lastEnabled) {
      lastEnabled = enabled;
      countdown(enabled, data);
    } else if (!enabled && !transitionTimer) {
      showMaintenance();
    }
  }, function () {
    // Jika Firebase gagal dibaca, jangan mengunci pengunjung di halaman maintenance.
  });
})();
