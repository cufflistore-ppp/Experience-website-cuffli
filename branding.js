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
    // resolve async assets (logo/banner besar di Firebase)
    try {
      if (window.VoxyyOrders && window.VoxyyOrders.resolveBrandingAsset) {
        if (String(logo).indexOf("firebase:") === 0) {
          window.VoxyyOrders.resolveBrandingAsset(logo).then(function (real) {
            if (real) {
              s.logoUrl = real;
              applyBrandingCore(Object.assign({}, s, { logoUrl: real, bannerUrl: banner, _resolved: true }));
            }
          });
        }
        if (String(banner).indexOf("firebase:") === 0) {
          window.VoxyyOrders.resolveBrandingAsset(banner).then(function (real) {
            if (real) {
              applyBrandingCore(Object.assign({}, s, { bannerUrl: real, _resolved: true }));
            }
          });
        }
        if (s.qrisUrl && String(s.qrisUrl).indexOf("firebase:") === 0) {
          window.VoxyyOrders.resolveBrandingAsset(s.qrisUrl).then(function (real) {
            if (real) {
              applyBrandingCore(Object.assign({}, s, { qrisUrl: real, _resolved: true }));
            }
          });
        }
      }
    } catch (e) {}
    applyBrandingCore(s);
  }

  function applyBrandingCore(s) {
    s = s || getSettingsLocal() || {};
    var nama = s.namaToko || s.nama || "VOXY MARKET";
    var logo = s.logoUrl || s.logo || "logo.png";
    var banner = s.bannerUrl || s.banner || "banner.jpg";
    var bg = s.bgColor || localStorage.getItem("voxyy_bg_color") || "";
    if (String(logo).indexOf("firebase:") === 0) logo = "logo.png";
    if (String(banner).indexOf("firebase:") === 0) banner = "banner.jpg";
    // cache bust supaya tidak nempel logo lama
    var bust = s.updatedAt ? ("?v=" + s.updatedAt) : "";
    if (logo && logo.indexOf("data:") !== 0 && logo.indexOf("blob:") !== 0 && bust) {
      logo = logo.split("?")[0] + bust;
    }
    if (banner && banner.indexOf("data:") !== 0 && banner.indexOf("blob:") !== 0 && bust) {
      banner = banner.split("?")[0] + bust;
    }
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

    
    // ADMIN panel logo + title
    var adminLogo = document.getElementById("adminBrandLogo");
    if (adminLogo) {
      adminLogo.src = logo;
      adminLogo.alt = nama;
      adminLogo.onerror = function () { this.src = "logo.png"; };
    }
    document.querySelectorAll(".adm-topnav img, .admin-header img, .adm-drawer img.logo").forEach(function (img) {
      if (!img || img.id === "previewLogo" || img.id === "previewBanner") return;
      img.src = logo;
      img.onerror = function () { this.src = "logo.png"; };
    });
    var adminTitle = document.getElementById("adminBrandTitle");
    if (adminTitle) {
      var base = String(nama).replace(/\s*MARKET\s*$/i, "").trim() || "VOXY";
      adminTitle.innerHTML =
        base +
        ' <span style="color:#64b5f6">ADMIN</span> <i class="fa-solid fa-circle-check verified" style="color:#2196f3;font-size:12px;"></i>';
    }
    document.querySelectorAll(".adm-topnav .brand img").forEach(function (img) {
      if (img.id === "previewLogo") return;
      img.src = logo;
      img.onerror = function () { this.src = "logo.png"; };
    });
    // warna aksen card admin
    if (bg) {
      try {
        document.documentElement.style.setProperty("--adm-bg", bg);
      } catch (e) {}
    }

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
          if (typeof window.renderDigitalList === "function") {
            try {
              window.renderDigitalList();
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
        if (typeof window.renderDigitalList === "function") {
          try {
            window.renderDigitalList();
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
        // reload lagi biar logo/banner cloud pasti nempel
        setTimeout(loadFromCloud, 300);
      } else if (tries < 50) {
        setTimeout(tick, 50);
      }
    };
    tick();
  }

  window.VoxyyBranding = { apply: applyBranding, loadFromCloud: loadFromCloud };
  window.applyBranding = applyBranding;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
