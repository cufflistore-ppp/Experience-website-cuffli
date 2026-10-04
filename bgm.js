/**
 * VOXY MARKET - musik latar (lanjut antar halaman, kecuali login/daftar)
 */
(function () {
  var path = (location.pathname || "").split("/").pop() || "";
  path = path.toLowerCase();
  if (path === "login.html" || path === "daftar.html" || path === "index.html") return;
  if (path === "admin.html") return; // admin tanpa musik

  var SRC = "bgm.mp3";
  var KEY_ON = "voxyy_bgm_on";
  var KEY_T = "voxyy_bgm_t";
  var KEY_TS = "voxyy_bgm_ts";

  function ensureUI() {
    if (document.getElementById("bgmAudio")) return;
    var audio = document.createElement("audio");
    audio.id = "bgmAudio";
    audio.src = SRC;
    audio.loop = true;
    audio.preload = "auto";
    audio.style.display = "none";
    document.body.appendChild(audio);

    // floating mini control (pojok kanan bawah di atas bottom-nav)
    var btn = document.createElement("button");
    btn.id = "btnBgmFloat";
    btn.type = "button";
    btn.title = "Musik";
    btn.setAttribute("aria-label", "Play/Pause musik");
    btn.innerHTML = '<i class="fa-solid fa-pause" id="bgmIconFloat"></i>';
    btn.style.cssText =
      "position:fixed;right:14px;bottom:72px;z-index:90;width:44px;height:44px;border-radius:50%;" +
      "border:1px solid #1e3a5f;background:#12182a;color:#64b5f6;display:flex;align-items:center;" +
      "justify-content:center;cursor:pointer;font-size:16px;box-shadow:0 4px 14px rgba(0,0,0,.35);";
    document.body.appendChild(btn);
  }

  function getAudio() {
    return document.getElementById("bgmAudio");
  }
  function setIcon(playing) {
    var icons = document.querySelectorAll("#bgmIcon, #bgmIconFloat");
    icons.forEach(function (icon) {
      if (icon) icon.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
    });
  }
  function saveTime() {
    var a = getAudio();
    if (!a) return;
    try {
      localStorage.setItem(KEY_T, String(a.currentTime || 0));
      localStorage.setItem(KEY_TS, String(Date.now()));
    } catch (e) {}
  }
  function restoreTime(a) {
    try {
      var t = parseFloat(localStorage.getItem(KEY_T) || "0") || 0;
      var ts = parseInt(localStorage.getItem(KEY_TS) || "0", 10) || 0;
      // perkiraan maju sedikit sesuai jeda pindah halaman
      var gap = Math.min(3, Math.max(0, (Date.now() - ts) / 1000));
      if (t > 0) a.currentTime = t + gap;
    } catch (e) {}
  }
  function tryPlay() {
    var a = getAudio();
    if (!a) return;
    var p = a.play();
    if (p && p.then) {
      p.then(function () {
        setIcon(true);
        try {
          localStorage.setItem(KEY_ON, "1");
        } catch (e) {}
      }).catch(function () {
        setIcon(false);
      });
    } else {
      setIcon(true);
    }
  }
  function toggle() {
    var a = getAudio();
    if (!a) return;
    if (a.paused) tryPlay();
    else {
      a.pause();
      setIcon(false);
      try {
        localStorage.setItem(KEY_ON, "0");
      } catch (e) {}
      saveTime();
    }
  }

  function boot() {
    ensureUI();
    var a = getAudio();
    a.loop = true;
    restoreTime(a);
    var btn = document.getElementById("btnBgmFloat");
    if (btn) btn.onclick = toggle;
    var homeBtn = document.getElementById("btnBgm");
    if (homeBtn) homeBtn.onclick = toggle;
    var logo = document.getElementById("homeLogo");
    if (logo) {
      logo.style.cursor = "pointer";
      logo.onclick = function () {
        toggle();
      };
    }
    setInterval(saveTime, 1000);
    window.addEventListener("pagehide", saveTime);
    window.addEventListener("beforeunload", saveTime);

    var want = true;
    try {
      want = localStorage.getItem(KEY_ON) !== "0";
    } catch (e) {}
    if (want) {
      tryPlay();
      document.addEventListener(
        "touchstart",
        function once() {
          if (a.paused && localStorage.getItem(KEY_ON) !== "0") tryPlay();
          document.removeEventListener("touchstart", once);
        },
        { passive: true }
      );
      document.addEventListener(
        "click",
        function once2() {
          if (a.paused && localStorage.getItem(KEY_ON) !== "0") tryPlay();
          document.removeEventListener("click", once2);
        },
        { passive: true }
      );
    } else setIcon(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else boot();
})();
