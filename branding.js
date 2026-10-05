/**
 * VOXY MARKET - Branding global (Firebase)
 * Logo, nama, banner, warna dari admin → tampil di SEMUA halaman & device.
 */
(function () {
  var SETTINGS_KEY = "voxyy_settings";
  var PRODUK_KEY = "voxyy_produk_admin";

  function getSettingsLocal() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function applyBranding(s) {
    s = s || getSettingsLocal() || {};
    var nama = s.namaToko || s.nama || "VOXY MARKET";
    var logo = s.logoUrl || s.logo || "logo.png";
    var banner = s.bannerUrl || s.banner || "banner.jpg";
    var bg = s.bgColor || localStorage.getItem("voxyy_bg_color") || "";
    var check =
      ' <i class="fa-solid fa-circle-check verified" style="color:#2196f3;font-size:12px;"></i>';

    try {
      document.title = String(document.title || "").replace(
        /VOXY\s*MARKET/gi,
        nama
      );
    } catch (e) {}

    if (bg) {
      document.body.style.background = bg;
      document.body.style.backgroundImage = "none";
    }

    // LOGO — semua halaman
    document
      .querySelectorAll(
        "img.logo, img.brand-logo, img.auth-logo, .market-brand img, header .logo, #homeLogo, #authLogo"
      )
      .forEach(function (img) {
        if (!img) return;
        img.src = logo;
        img.alt = nama;
        img.onerror = function () {
          this.src = "logo.png";
        };
      });

    // NAMA — market-title
    document.querySelectorAll(".market-title").forEach(function (el) {
      var parts = String(nama).trim().split(/\s+/);
      if (parts.length >= 2) {
        el.innerHTML =
          parts[0] + " <span>" + parts.slice(1).join(" ") + "</span>" + check;
      } else {
        el.innerHTML = nama + check;
      }
    });

    // NAMA — brand/header h1 (bukan admin)
    document
      .querySelectorAll(".brand h1, .header h1, header .brand h1")
      .forEach(function (el) {
        if (
          el.closest(".admin-sidebar") ||
          el.closest(".admin-main") ||
          el.closest("#adminApp")
        )
          return;
        var parts = String(nama).trim().split(/\s+/);
        if (parts.length >= 2) {
          el.innerHTML =
            parts[0] +
            ' <span style="color:#1565c0">' +
            parts.slice(1).join(" ") +
            "</span>" +
            check;
        } else {
          el.innerHTML = nama + check;
        }
      });

    // login / daftar
    document.querySelectorAll(".auth-brand").forEach(function (el) {
      var parts = String(nama).trim().split(/\s+/);
      if (parts.length >= 2) {
        el.innerHTML =
          parts[0] +
          ' <span class="market-blue">' +
          parts.slice(1).join(" ") +
          "</span>";
      } else {
        el.textContent = nama;
      }
    });

    // tentang
    document.querySelectorAll("#aboutNama, #aboutCopy").forEach(function (el) {
      if (el) el.textContent = nama;
    });

    // BANNER
    document
      .querySelectorAll("img.banner-full, .banner img, #homeBanner")
      .forEach(function (img) {
        if (!img || !banner) return;
        img.src = banner;
        img.alt = "Selamat Datang di " + nama;
        img.onerror = function () {
          this.src = "banner.jpg";
        };
      });

    // QRIS (halaman bayar)
    if (s.qrisUrl) {
      document
        .querySelectorAll("#qrisImg, img.qris, img[alt='QRIS']")
        .forEach(function (img) {
          if (img) img.src = s.qrisUrl;
        });
    }

    // market-brand: pastikan ada logo
    document.querySelectorAll(".market-brand").forEach(function (brand) {
      var img = brand.querySelector("img.logo, img.brand-logo");
      if (!img) {
        img = document.createElement("img");
        img.className = "logo brand-logo";
        img.alt = nama;
        brand.insertBefore(img, brand.firstChild);
      }
      img.src = logo;
      img.onerror = function () {
        this.src = "logo.png";
      };
      var badge = brand.querySelector(".vx-badge");
      if (badge) badge.style.display = "none";
    });
  }

  async function loadFromCloud() {
    try {
      if (!window.VoxyyOrders) return;
      if (window.VoxyyOrders.getSettings) {
        var s = await window.VoxyyOrders.getSettings();
        if (s && typeof s === "object") {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
          applyBranding(s);
        }
      }
      if (window.VoxyyOrders.getProdukGlobal) {
        var list = await window.VoxyyOrders.getProdukGlobal();
        if (list && list.length) {
          localStorage.setItem(PRODUK_KEY, JSON.stringify(list));
          if (typeof window.renderKatalog === "function") {
            try {
              window.renderKatalog();
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn("[branding] loadFromCloud", e);
    }
  }

  function bindRealtime() {
    if (!window.VoxyyOrders) return;
    if (typeof window.VoxyyOrders.onSettingsChange === "function") {
      window.VoxyyOrders.onSettingsChange(function (s) {
        if (s) {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
          applyBranding(s);
        }
      });
    }
    if (typeof window.VoxyyOrders.onProdukChange === "function") {
      window.VoxyyOrders.onProdukChange(function (list) {
        if (list && list.length) {
          localStorage.setItem(PRODUK_KEY, JSON.stringify(list));
        }
        if (typeof window.renderKatalog === "function") {
          try {
            window.renderKatalog();
          } catch (e) {}
        }
      });
    }
  }

  window.VoxyyBrand = {
    getSettings: getSettingsLocal,
    apply: applyBranding,
    loadFromCloud: loadFromCloud,
    getProduk: function () {
      try {
        var raw = localStorage.getItem(PRODUK_KEY);
        if (raw) {
          var arr = JSON.parse(raw);
          if (Array.isArray(arr))
            return arr.filter(function (p) {
              return p.status !== "nonaktif";
            });
        }
      } catch (e) {}
      return null;
    },
    getAllProduk: function () {
      try {
        return JSON.parse(localStorage.getItem(PRODUK_KEY) || "[]");
      } catch (e) {
        return [];
      }
    },
  };

  function boot() {
    applyBranding();
    var tries = 0;
    var tick = function () {
      tries++;
      if (window.VoxyyOrders && window.VoxyyOrders.isGlobalConfigured) {
        try {
          if (window.VoxyyOrders.initFirebase) window.VoxyyOrders.initFirebase();
        } catch (e) {}
        loadFromCloud();
        bindRealtime();
      } else if (tries < 50) {
        setTimeout(tick, 150);
      }
    };
    tick();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
