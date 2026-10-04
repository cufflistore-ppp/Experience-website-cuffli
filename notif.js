/**
 * Lonceng notifikasi — merah saat admin kirim produk / update pesanan user
 */
(function () {
  var KEY_SEEN = "voxyy_notif_seen";
  var path = (location.pathname || "").split("/").pop() || "";
  path = path.toLowerCase();
  if (path === "login.html" || path === "daftar.html" || path === "index.html" || path === "admin.html") {
    return;
  }

  function getSeen() {
    try {
      return JSON.parse(localStorage.getItem(KEY_SEEN) || "{}");
    } catch (e) {
      return {};
    }
  }
  function setSeen(map) {
    try {
      localStorage.setItem(KEY_SEEN, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function notifKey(o) {
    return String(o.kode || o._id || "") + "_" + String(o.dikirimTs || o.createdAt || o.status || "");
  }

  function isMyOrder(o, email, uid) {
    if (!o) return false;
    var e = String(email || "").toLowerCase();
    var oe = String(o.email || o.userEmail || "").toLowerCase();
    if (e && oe && e === oe) return true;
    if (uid && (o.uid === uid || o.userId === uid)) return true;
    try {
      var mine = JSON.parse(localStorage.getItem("voxyy_my_orders") || "[]");
      var up = String(o.kode || "").toUpperCase();
      if (Array.isArray(mine) && mine.map(function(x){return String(x).toUpperCase();}).indexOf(up) >= 0) return true;
    } catch (e2) {}
    try {
      var kodes = JSON.parse(localStorage.getItem("voxyy_saved_kodes") || "[]");
      var up2 = String(o.kode || "").toUpperCase();
      if (Array.isArray(kodes) && kodes.map(function(x){return String(x).toUpperCase();}).indexOf(up2) >= 0) return true;
    } catch (e3) {}
    try {
      var one = localStorage.getItem("voxyy_saved_kode");
      if (one && String(one).toUpperCase() === String(o.kode || "").toUpperCase()) return true;
    } catch (e4) {}
    return !!(e && oe && e === oe);
  }

  function isDelivered(o) {
    var s = String(o.status || "").toLowerCase();
    if (s.includes("sukses") || s.includes("selesai")) return true;
    if (o.file || o.download || o.fileUrl) return true;
    if (o.dikirimTs) return true;
    return false;
  }

  function ensureUI() {
    if (document.getElementById("btnNotifBell")) return;

    var btn = document.createElement("button");
    btn.id = "btnNotifBell";
    btn.type = "button";
    btn.title = "Notifikasi";
    btn.setAttribute("aria-label", "Notifikasi");
    btn.innerHTML =
      '<i class="fa-solid fa-bell" style="font-size:16px;"></i>' +
      '<span id="notifBadge" style="display:none;position:absolute;top:-2px;right:-2px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#e53935;color:#fff;font-size:10px;font-weight:800;line-height:16px;text-align:center;border:2px solid #0a0e18;">0</span>';
    btn.style.cssText =
      "position:relative;width:40px;height:40px;border-radius:50%;border:1px solid #1e3a5f;background:#12182a;color:#90caf9;" +
      "display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;";

    // panel
    var panel = document.createElement("div");
    panel.id = "notifPanel";
    panel.style.cssText =
      "display:none;position:fixed;top:58px;right:10px;width:min(320px,92vw);max-height:70vh;overflow:auto;z-index:500;" +
      "background:#12182a;border:1px solid #1e2a45;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.45);";
    panel.innerHTML =
      '<div style="padding:12px 14px;border-bottom:1px solid #1e2a45;display:flex;justify-content:space-between;align-items:center;">' +
      '<strong style="color:#fff;font-size:13px;"><i class="fa-solid fa-bell" style="color:#64b5f6;"></i> Notifikasi</strong>' +
      '<button type="button" id="notifMarkAll" style="background:transparent;border:none;color:#64b5f6;font-size:11px;cursor:pointer;">Tandai dibaca</button>' +
      "</div>" +
      '<div id="notifList" style="padding:8px;"></div>';

    // place bell: try next to profile / market-user
    var host =
      document.querySelector(".header > div:last-child") ||
      document.querySelector(".market-header") ||
      document.querySelector("header");
    if (host && host.classList && host.classList.contains("market-header")) {
      var wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;align-items:center;gap:8px;";
      var user = host.querySelector(".market-user");
      if (user) {
        host.insertBefore(wrap, user);
        wrap.appendChild(btn);
        wrap.appendChild(user);
      } else {
        host.appendChild(btn);
      }
    } else if (host) {
      host.appendChild(btn);
    } else {
      btn.style.position = "fixed";
      btn.style.top = "12px";
      btn.style.right = "12px";
      btn.style.zIndex = "200";
      document.body.appendChild(btn);
    }
    document.body.appendChild(panel);

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = panel.style.display === "block";
      panel.style.display = open ? "none" : "block";
      if (!open) {
        markAllSeen();
        renderList();
      }
    });
    document.addEventListener("click", function (e) {
      if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        panel.style.display = "none";
      }
    });
    var markBtn = document.getElementById("notifMarkAll");
    if (markBtn) {
      markBtn.onclick = function () {
        markAllSeen();
        renderList();
        updateBadge();
      };
    }
  }

  var _items = [];

  function markAllSeen() {
    var seen = getSeen();
    _items.forEach(function (it) {
      seen[it.key] = 1;
    });
    setSeen(seen);
    updateBadge();
  }

  function updateBadge() {
    var badge = document.getElementById("notifBadge");
    if (!badge) return;
    var seen = getSeen();
    var n = 0;
    _items.forEach(function (it) {
      if (!seen[it.key]) n++;
    });
    if (n > 0) {
      badge.style.display = "block";
      badge.textContent = n > 9 ? "9+" : String(n);
    } else {
      badge.style.display = "none";
    }
  }

  function renderList() {
    var list = document.getElementById("notifList");
    if (!list) return;
    if (!_items.length) {
      list.innerHTML =
        '<p style="color:#6a7a90;font-size:12px;padding:16px 8px;text-align:center;">Belum ada notifikasi.</p>';
      return;
    }
    var seen = getSeen();
    list.innerHTML = _items
      .map(function (it) {
        var unread = !seen[it.key];
        return (
          '<a href="antrian.html" style="display:block;text-decoration:none;padding:10px;border-radius:10px;margin-bottom:6px;background:' +
          (unread ? "rgba(229,57,53,.12)" : "#0d1220") +
          ';border:1px solid #1e2a45;">' +
          '<div style="display:flex;gap:8px;align-items:flex-start;">' +
          '<div style="width:8px;height:8px;border-radius:50%;margin-top:5px;background:' +
          (unread ? "#e53935" : "transparent") +
          ';"></div>' +
          '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:12px;font-weight:700;color:#e3eaf2;">' +
          (it.title || "Pesanan") +
          "</div>" +
          '<div style="font-size:11px;color:#8aa0b8;margin-top:2px;line-height:1.35;">' +
          (it.body || "") +
          "</div>" +
          '<div style="font-size:10px;color:#6a7a90;margin-top:4px;">' +
          (it.time || "") +
          "</div>" +
          "</div></div></a>"
        );
      })
      .join("");
  }

  function buildItems(orders, email, uid) {
    var list = (orders || []).filter(function (o) {
      return isMyOrder(o, email, uid) && isDelivered(o);
    });
    list.sort(function (a, b) {
      return (Number(b.dikirimTs || b.createdAt) || 0) - (Number(a.dikirimTs || a.createdAt) || 0);
    });
    list = list.slice(0, 20);
    _items = list.map(function (o) {
      var file = o.file || o.download || o.fileUrl;
      return {
        key: notifKey(o),
        title: "Produk dikirim · " + (o.kode || ""),
        body:
          (o.paket || "Pesanan") +
          (file ? " — siap diunduh di menu Pesanan" : " — status diperbarui admin"),
        time: o.dikirimAt || o.waktu || "",
        kode: o.kode,
      };
    });
    updateBadge();
    if (document.getElementById("notifPanel") && document.getElementById("notifPanel").style.display === "block") {
      renderList();
    }
  }

  function boot() {
    ensureUI();
    var email = "";
    var uid = "";
    function pull() {
      try {
        var u = window.VoxyyAuth && window.VoxyyAuth.currentUser && window.VoxyyAuth.currentUser();
        if (u) {
          email = u.email || "";
          uid = u.uid || "";
        }
      } catch (e) {}
      if (window.VoxyyOrders && window.VoxyyOrders.getOrders) {
        window.VoxyyOrders.getOrders().then(function (orders) {
          buildItems(orders, email, uid);
        });
      }
      if (window.VoxyyOrders && window.VoxyyOrders.onOrdersChange) {
        window.VoxyyOrders.onOrdersChange(function (orders) {
          buildItems(orders, email, uid);
        });
      }
    }
    var n = 0;
    var t = setInterval(function () {
      if (window.VoxyyOrders || ++n > 40) {
        clearInterval(t);
        pull();
      }
    }, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
