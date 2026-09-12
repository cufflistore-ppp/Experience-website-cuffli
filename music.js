/**
 * Background music di semua halaman
 * - Lanjut dari detik terakhir saat pindah halaman
 * - Loop otomatis
 */
(function () {
  const MUSIC_KEY = "voxyy_music_playing";
  const ENTERED_KEY = "voxyy_entered";
  const TIME_KEY = "voxyy_music_time";

  function getMusicEl() {
    return document.getElementById("bgMusic");
  }

  function isEntered() {
    return sessionStorage.getItem(ENTERED_KEY) === "1";
  }

  function isMusicWanted() {
    const v = sessionStorage.getItem(MUSIC_KEY);
    return v === null || v === "1";
  }

  function setMusicWanted(on) {
    sessionStorage.setItem(MUSIC_KEY, on ? "1" : "0");
  }

  function saveTime() {
    const music = getMusicEl();
    if (!music) return;
    try {
      if (!isNaN(music.currentTime) && music.currentTime > 0) {
        sessionStorage.setItem(TIME_KEY, String(music.currentTime));
      }
    } catch (e) {}
  }

  function restoreTime() {
    const music = getMusicEl();
    if (!music) return;
    try {
      const t = parseFloat(sessionStorage.getItem(TIME_KEY) || "0");
      if (t > 0 && !isNaN(t)) {
        if (music.readyState >= 1) {
          music.currentTime = t;
        } else {
          music.addEventListener("loadedmetadata", function once() {
            music.removeEventListener("loadedmetadata", once);
            try { music.currentTime = t; } catch (e) {}
          });
        }
      }
    } catch (e) {}
  }

  function updateIcon(playing) {
    const icon = document.getElementById("musicIcon");
    if (icon) {
      icon.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
    }
  }

  function tryPlay() {
    const music = getMusicEl();
    if (!music) return;
    music.volume = 0.45;
    music.loop = true;
    restoreTime();
    const p = music.play();
    if (p && p.then) {
      p.then(function () {
        setMusicWanted(true);
        updateIcon(true);
      }).catch(function () {
        updateIcon(false);
      });
    }
  }

  function tryPause() {
    const music = getMusicEl();
    if (!music) return;
    saveTime();
    music.pause();
    setMusicWanted(false);
    updateIcon(false);
  }

  function bindToggle() {
    const btn = document.getElementById("musicToggle");
    if (!btn || btn._voxyyBound) return;
    btn._voxyyBound = true;
    btn.addEventListener("click", function () {
      const music = getMusicEl();
      if (!music) return;
      if (music.paused) tryPlay();
      else tryPause();
    });
  }

  function ensureAudio() {
    if (getMusicEl()) return;
    const a = document.createElement("audio");
    a.id = "bgMusic";
    a.loop = true;
    a.preload = "auto";
    a.setAttribute("playsinline", "");
    a.innerHTML = '<source src="music.m4a" type="audio/mp4">';
    document.body.appendChild(a);
  }

  function bindSaveOnLeave() {
    function onLeave() { saveTime(); }
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    setInterval(saveTime, 2000);
  }

  window.VoxyyMusic = {
    enter: function () {
      sessionStorage.setItem(ENTERED_KEY, "1");
      setMusicWanted(true);
      sessionStorage.setItem(TIME_KEY, "0");
      tryPlay();
    },
    isEntered: isEntered,
    tryPlay: tryPlay,
    tryPause: tryPause,
    saveTime: saveTime
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensureAudio();
    bindToggle();
    bindSaveOnLeave();

    const music = getMusicEl();
    if (music) {
      music.addEventListener("ended", function () {
        music.currentTime = 0;
        sessionStorage.setItem(TIME_KEY, "0");
        if (isMusicWanted()) music.play().catch(function () {});
      });
      music.addEventListener("play", function () { updateIcon(true); });
      music.addEventListener("pause", function () { updateIcon(false); });
    }

    if (isEntered() && isMusicWanted()) {
      setTimeout(function () {
        restoreTime();
        tryPlay();
      }, 200);
      // unlock on first touch if autoplay blocked
      function unlock() {
        if (music && music.paused && isMusicWanted()) tryPlay();
      }
      document.addEventListener("touchstart", unlock, { once: true, passive: true });
      document.addEventListener("click", unlock, { once: true });
    } else {
      updateIcon(false);
    }
  });
})();
