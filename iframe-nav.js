/**
 * Dipakai di halaman konten yang dibuka di dalam iframe shell.
 * - Sembunyikan nav & music ganda
 * - Intercept link internal → parent shell
 * - Jangan redirect ke intro saat di iframe
 */
(function () {
  var inFrame = false;
  try {
    inFrame = window.self !== window.top;
  } catch (e) {
    inFrame = true;
  }

  if (!inFrame) {
    // Buka langsung halaman konten (bukan lewat shell) → arahkan ke index
    // kecuali sudah di index
    if (!/index\.html$/i.test(location.pathname) && location.pathname !== "/") {
      // biarkan; user bisa buka home.html langsung
    }
    return;
  }

  document.documentElement.classList.add("in-iframe");

  // Sembunyikan chrome ganda secepat mungkin
  var style = document.createElement("style");
  style.textContent = [
    "html.in-iframe .bottom-nav,",
    "html.in-iframe .music-controls,",
    "html.in-iframe #musicControls,",
    "html.in-iframe .music-fab,",
    "html.in-iframe audio#bgMusic {",
    "  display: none !important;",
    "  visibility: hidden !important;",
    "  pointer-events: none !important;",
    "}",
    "html.in-iframe body { padding-bottom: 12px !important; }",
    "html.in-iframe .page-content { padding-bottom: 20px !important; }"
  ].join("\n");
  document.documentElement.appendChild(style);

  // Pause audio lokal di halaman konten (kalau ada) biar tidak dobel
  function muteLocalAudio() {
    var a = document.getElementById("bgMusic");
    if (a) {
      try { a.pause(); a.muted = true; a.volume = 0; } catch (e) {}
    }
  }
  muteLocalAudio();
  document.addEventListener("DOMContentLoaded", muteLocalAudio);

  // Intercept klik link internal
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return;
    // external / wa.me / tel → biarkan
    if (/^(https?:|mailto:|tel:|wa\.me)/i.test(href) || href.indexOf("//") === 0) {
      // open external in top
      if (/^https?:/i.test(href) && href.indexOf(location.host) === -1) {
        e.preventDefault();
        window.open(href, "_blank");
        return;
      }
      if (/wa\.me|api\.whatsapp/i.test(href)) return; // let default
    }
    // internal page
    if (/\.html(\?|$)/i.test(href) || href.indexOf("?") === 0) {
      e.preventDefault();
      e.stopPropagation();
      try {
        window.parent.postMessage({ type: "voxyy-nav", href: href }, "*");
      } catch (err) {
        location.href = href;
      }
    }
  }, true);
})();
