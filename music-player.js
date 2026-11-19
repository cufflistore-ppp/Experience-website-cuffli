/* VOXY MARKET persistent music player.
   Musik diulang otomatis dan posisi terakhir dipulihkan saat pindah halaman.
   Catatan: pada navigasi antar-HTML, browser tetap memuat ulang dokumen sehingga
   mungkin ada jeda sangat singkat; posisi lagu tidak kembali ke awal. */
(function () {
  'use strict';
  var SRC = 'music-login.m4a';
  var ENABLE_KEY = 'voxy_home_music_enabled';
  var TIME_KEY = 'voxy_music_current_time';
  var enabled = localStorage.getItem(ENABLE_KEY) !== 'off';
  var audio = document.createElement('audio');
  audio.id = 'voxyPersistentMusic';
  audio.src = SRC;
  audio.preload = 'auto';
  audio.loop = true;
  audio.setAttribute('playsinline', '');
  audio.style.display = 'none';
  document.body.appendChild(audio);

  var button = document.getElementById('btnMusic');
  var restored = false;

  function savePosition() {
    try {
      if (isFinite(audio.currentTime) && audio.currentTime >= 0) {
        localStorage.setItem(TIME_KEY, String(audio.currentTime));
      }
    } catch (_) {}
  }
  function paint() {
    if (!button) return;
    var playing = !audio.paused && !audio.ended;
    button.innerHTML = '<i data-lucide="' + (playing ? 'pause' : 'play') + '"></i>';
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
    button.setAttribute('aria-label', playing ? 'Matikan musik' : 'Putar musik');
    button.title = playing ? 'Matikan musik' : 'Putar musik';
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  function startPlayback() {
    if (!enabled) return;
    var saved = Number(localStorage.getItem(TIME_KEY) || 0);
    function resume() {
      if (restored) return;
      restored = true;
      if (isFinite(saved) && saved > 0 && isFinite(audio.duration) && saved < audio.duration) {
        try { audio.currentTime = saved; } catch (_) {}
      }
      var promise = audio.play();
      if (promise && typeof promise.then === 'function') promise.then(paint).catch(paint);
      else paint();
    }
    if (audio.readyState >= 1) resume();
    else audio.addEventListener('loadedmetadata', resume, { once: true });
  }

  audio.addEventListener('timeupdate', savePosition);
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', function () { savePosition(); paint(); });
  audio.addEventListener('ended', function () {
    /* loop=true mengulang otomatis; fallback untuk browser tertentu. */
    try { audio.currentTime = 0; } catch (_) {}
    if (enabled) audio.play().catch(function () {});
  });
  window.addEventListener('pagehide', savePosition);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') savePosition();
  });

  if (button) {
    button.addEventListener('click', function () {
      if (audio.paused) {
        enabled = true;
        localStorage.setItem(ENABLE_KEY, 'on');
        startPlayback();
      } else {
        enabled = false;
        localStorage.setItem(ENABLE_KEY, 'off');
        savePosition();
        audio.pause();
      }
      paint();
    });
  }
  paint();
  if (enabled) startPlayback();
})();
