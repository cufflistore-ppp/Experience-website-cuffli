/**
 * Shared background music for all pages
 * - Continues across pages via sessionStorage
 * - Controls in header (if present)
 */
(function () {
  const MUSIC_KEY = "voxyy_music_playing";
  const ENTERED_KEY = "voxyy_entered";

  function getMusicEl() {
    return document.getElementById("bgMusic");
  }

  function isEntered() {
    return sessionStorage.getItem(ENTERED_KEY) === "1";
  }

  function setEntered() {
    sessionStorage.setItem(ENTERED_KEY, "1");
  }

  function isMusicWanted() {
    // default on after enter
    const v = sessionStorage.getItem(MUSIC_KEY);
    return v === null || v === "1";
  }

  function setMusicWanted(on) {
    sessionStorage.setItem(MUSIC_KEY, on ? "1" : "0");
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
    music.pause();
    setMusicWanted(false);
    updateIcon(false);
  }

  function bindToggle() {
    const btn = document.getElementById("musicToggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const music = getMusicEl();
      if (!music) return;
      if (music.paused) {
        tryPlay();
      } else {
        tryPause();
      }
    });
  }

  function ensureAudio() {
    if (getMusicEl()) return;
    const a = document.createElement("audio");
    a.id = "bgMusic";
    a.loop = true;
    a.preload = "auto";
    a.innerHTML = '<source src="music.m4a" type="audio/mp4">';
    document.body.appendChild(a);
  }

  // Public API
  window.VoxyyMusic = {
    enter: function () {
      setEntered();
      setMusicWanted(true);
      tryPlay();
    },
    isEntered: isEntered,
    tryPlay: tryPlay,
    tryPause: tryPause
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensureAudio();
    bindToggle();

    // On other pages: if already entered and music wanted, try resume
    if (isEntered() && isMusicWanted()) {
      // slight delay helps some mobile browsers
      setTimeout(tryPlay, 300);
    } else {
      updateIcon(false);
    }

    const music = getMusicEl();
    if (music) {
      music.addEventListener("ended", function () {
        music.currentTime = 0;
        if (isMusicWanted()) music.play().catch(function () {});
      });
      music.addEventListener("play", function () { updateIcon(true); });
      music.addEventListener("pause", function () { updateIcon(false); });
    }
  });
})();
