/* VOXY MARKET persistent music player
   - Status on/off disimpan di localStorage → berlaku di SEMUA halaman
   - Posisi lagu disimpan & dipulihkan saat pindah halaman (tidak restart dari awal)
   - Saat lagu habis → langsung ulang dari awal (loop)
   - Tombol play/pause hanya ada di halaman yang punya #btnMusic
*/
(function () {
  'use strict';

  var SRC = 'music-login.m4a';
  var ENABLE_KEY = 'voxy_home_music_enabled';
  var TIME_KEY = 'voxy_music_current_time';
  var VOLUME = 0.7;

  // Baca status: default ON kecuali user pernah matikan
  var enabled = localStorage.getItem(ENABLE_KEY) !== 'off';

  // Hindari double-init jika script ter-load dua kali
  if (window.__voxyMusicReady) return;
  window.__voxyMusicReady = true;

  var audio = document.createElement('audio');
  audio.id = 'voxyPersistentMusic';
  audio.src = SRC;
  audio.preload = 'auto';
  audio.loop = true;           // native loop
  audio.volume = VOLUME;
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.style.display = 'none';
  document.body.appendChild(audio);

  var button = document.getElementById('btnMusic');
  var positionRestored = false;
  var saveTimer = null;

  function getSavedTime() {
    var t = Number(localStorage.getItem(TIME_KEY) || 0);
    return isFinite(t) && t > 0 ? t : 0;
  }

  function savePosition() {
    try {
      if (!audio || !isFinite(audio.currentTime) || audio.currentTime < 0) return;
      // Jangan simpan 0 jika sedang di awal setelah loop
      localStorage.setItem(TIME_KEY, String(audio.currentTime));
    } catch (_) {}
  }

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(savePosition, 400);
  }

  function paint() {
    if (!button) return;
    var playing = enabled && !audio.paused && !audio.ended;
    button.innerHTML = '<i data-lucide="' + (playing ? 'pause' : 'play') + '"></i>';
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
    button.setAttribute('aria-label', playing ? 'Matikan musik' : 'Putar musik');
    button.title = playing ? 'Matikan musik' : 'Putar musik';
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function restorePosition() {
    if (positionRestored) return;
    var saved = getSavedTime();
    if (!saved) {
      positionRestored = true;
      return;
    }
    // Tunggu metadata supaya duration tersedia
    function apply() {
      if (positionRestored) return;
      positionRestored = true;
      try {
        if (isFinite(audio.duration) && audio.duration > 0 && saved < audio.duration - 0.3) {
          audio.currentTime = saved;
        }
      } catch (_) {}
    }
    if (audio.readyState >= 1) apply();
    else audio.addEventListener('loadedmetadata', apply, { once: true });
  }

  function tryPlay() {
    if (!enabled) {
      paint();
      return;
    }
    restorePosition();
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(paint).catch(function () {
        // Autoplay diblokir browser — tunggu interaksi user
        paint();
      });
    } else {
      paint();
    }
  }

  function stopMusic() {
    enabled = false;
    try { localStorage.setItem(ENABLE_KEY, 'off'); } catch (_) {}
    savePosition();
    audio.pause();
    paint();
  }

  function startMusic() {
    enabled = true;
    try { localStorage.setItem(ENABLE_KEY, 'on'); } catch (_) {}
    tryPlay();
  }

  // Event listeners
  audio.addEventListener('timeupdate', scheduleSave);
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', function () {
    savePosition();
    paint();
  });

  // Fallback loop (beberapa browser kadang tidak hormati audio.loop)
  audio.addEventListener('ended', function () {
    try { audio.currentTime = 0; } catch (_) {}
    if (enabled) {
      audio.play().catch(function () {});
    }
    paint();
  });

  // Simpan posisi saat keluar halaman / tab disembunyikan
  window.addEventListener('pagehide', savePosition);
  window.addEventListener('beforeunload', savePosition);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') savePosition();
  });

  // Tombol di header (jika ada)
  if (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (audio.paused || !enabled) {
        startMusic();
      } else {
        stopMusic();
      }
    });
  }

  // Inisialisasi
  paint();
  if (enabled) {
    // Sedikit delay biar DOM & network siap, mengurangi stutter
    if (document.readyState === 'complete') {
      tryPlay();
    } else {
      window.addEventListener('load', tryPlay, { once: true });
      // Fallback jika load event sudah lewat
      setTimeout(tryPlay, 300);
    }
  }

  // Expose kecil untuk debug / integrasi
  window.VOXY_MUSIC = {
    enable: startMusic,
    disable: stopMusic,
    isEnabled: function () { return enabled; },
    audio: audio
  };
})();
