/**
 * VOXY MARKET - Branding global (Firebase)
 * Logo, nama, banner, warna dari admin → tampil di SEMUA device.
 */
(function () {
  const SETTINGS_KEY = "voxyy_settings";
  const PRODUK_KEY = "voxyy_produk_admin";

  function getSettingsLocal() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function applyBranding(s) {
    s = s || getSettingsLocal();
    const nama = s.namaToko || "VOXY MARKET";
    const logo = s.logoUrl || "logo.png";
    const banner = s.bannerUrl || "banner.jpg";
    const bg = s.bgColor || localStorage.getItem("voxyy_bg_color") || "";

    if (bg) {
      document.body.style.background = bg;
      document.body.style.backgroundImage = "none";
    }

    document.querySelectorAll("img.logo, img.brand-logo, .market-brand img, header .logo").forEach((img) => {
      if (img && logo) {
        img.src = logo;
        img.onerror = function () {
          this.src = "logo.png";
        };
      }
    });

    document.querySelectorAll(".vx-badge").forEach((el) => {
      const parts = String(nama).trim().split(/\s+/);
      el.textContent =
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : String(nama).substring(0, 2).toUpperCase();
    });

    document.querySelectorAll(".market-title").forEach((el) => {
      const parts = String(nama).split(/\s+/);
      if (parts.length >= 2) {
        el.innerHTML = parts[0] + " <span>" + parts.slice(1).join(" ") + "</span>";
      } else {
        el.innerHTML = nama;
      }
    });

    document.querySelectorAll(".brand h1, .header h1").forEach((el) => {
      if (el.closest(".admin-sidebar") || el.closest(".admin-main")) return;
      const parts = String(nama).split(/\s+/);
      if (parts.length >= 2) {
        el.innerHTML =
          parts[0] + ' <span style="color:#2196f3">' + parts.slice(1).join(" ") + "</span>";
      } else {
        el.textContent = nama;
      }
    });

    document.querySelectorAll("img.banner-full, .banner img").forEach((img) => {
      if (banner) {
        img.src = banner;
        img.onerror = function () {
          this.src = "banner.jpg";
        };
      }
    });


    // QRIS image di halaman bayar
    if (s.qrisUrl) {
      document.querySelectorAll("#qrisImg, img.qris, img[alt='QRIS']").forEach((img) => {
        img.src = s.qrisUrl;
        img.style.display = "";
      });
    }

    if (s.waAdmin) {
      const wa = String(s.waAdmin).replace(/\D/g, "");
      document.querySelectorAll('a[href*="wa.me"]').forEach((a) => {
        const href = a.getAttribute("href") || "";
        if (href.includes("6285151982250") || href.includes("6285706128277") || href.includes("wa.me/")) {
          const textMatch = href.match(/[?&]text=[^&]+/);
          const q = textMatch ? textMatch[0].replace(/^&/, "?") : "";
          const q2 = q.startsWith("?") ? q : q ? "?" + q : "";
          a.setAttribute("href", "https://wa.me/" + wa + q2);
        }
      });
    }
  }

  async function loadFromCloud() {
    try {
      if (window.VoxyyOrders && typeof window.VoxyyOrders.getSettings === "function") {
        const s = await window.VoxyyOrders.getSettings();
        if (s && Object.keys(s).length) {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
          if (s.bgColor) localStorage.setItem("voxyy_bg_color", s.bgColor);
          applyBranding(s);
        }
      }
      if (window.VoxyyOrders && typeof window.VoxyyOrders.getProdukGlobal === "function") {
        const list = await window.VoxyyOrders.getProdukGlobal();
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
      console.warn("[Brand] cloud load:", e);
    }
  }

  function bindRealtime() {
    if (!window.VoxyyOrders) return;
    if (typeof window.VoxyyOrders.onSettingsChange === "function") {
      window.VoxyyOrders.onSettingsChange(function (s) {
        applyBranding(s);
      });
    }
    if (typeof window.VoxyyOrders.onProdukChange === "function") {
      window.VoxyyOrders.onProdukChange(function () {
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
    loadFromCloud,
    getProduk: function () {
      try {
        const raw = localStorage.getItem(PRODUK_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) return arr.filter((p) => p.status !== "nonaktif");
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
    // tunggu firebase script kalau belum ready
    let tries = 0;
    const tick = function () {
      tries++;
      if (window.VoxyyOrders && window.VoxyyOrders.isGlobalConfigured()) {
        window.VoxyyOrders.initFirebase && window.VoxyyOrders.initFirebase();
        loadFromCloud();
        bindRealtime();
      } else if (tries < 40) {
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
