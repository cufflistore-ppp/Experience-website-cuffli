/**
 * Dipakai di halaman konten yang dibuka di dalam iframe shell[span_1](start_span)[span_1](end_span).
 * - Sembunyikan nav & music ganda[span_2](start_span)[span_2](end_span)
 * - Intercept link internal → parent shell[span_3](start_span)[span_3](end_span)
 * - Jangan redirect ke intro saat di iframe[span_4](start_span)[span_4](end_span)
 */
(function () {
  var inFrame = false;
  try {
    inFrame = window.self !== window.top;
  } catch (e) {
    inFrame = true;
  }

  if (!inFrame) {
    if (!/index\.html$/i.test(location.pathname) && location.pathname !== "/") {
      // biarkan; user bisa buka home.html langsung
    }
    return;
  }

  document.documentElement.classList.add("in-iframe");

  // Sembunyikan chrome ganda secepat mungkin[span_5](start_span)[span_5](end_span)
  var style = document.createElement("style");
  style.textContent = [
    "html.in-iframe .bottom-nav,",
    "html.in-iframe .music-controls,",
    "html.in-iframe #musicControls,",
    "html.in-iframe .music-fab,",
    "html.in-iframe audio#bgMusic {",
    "  display: none !important;",
    "  visibility: hidden !important;",
    "}",
    "html.in-iframe body { padding-bottom: 12px !important; }",
    "html.in-iframe .page-content { padding-bottom: 20px !important; }"
  ].join("\n");
  document.documentElement.appendChild(style);

  // Pause audio lokal di halaman konten (kalau ada) biar tidak dobel[span_6](start_span)[span_6](end_span)
  function muteLocalAudio() {
    var a = document.getElementById("bgMusic");
    if (a) {
      try { a.pause(); a.muted = true; a.volume = 0; } catch (e) {}
    }
  }
  muteLocalAudio();
  document.addEventListener("DOMContentLoaded", muteLocalAudio);

  // Intercept klik link internal tanpa mematikan event listener tombol persegi[span_7](start_span)[span_7](end_span)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    
    var href = a.getAttribute("href");
    if (!href || href === "#" || href.indexOf("javascript:") === 0) return;

    // WhatsApp: keluar dari iframe agar redirect ke aplikasi/browser WhatsApp tidak terjebak di frame.
    if (/wa\.me|api\.whatsapp/i.test(href)) {
      e.preventDefault();
      try {
        window.top.location.href = href;
      } catch (err) {
        window.open(href, "_blank", "noopener");
      }
      return;
    }

    // External / Tel / email
    if (/^(https?:|mailto:|tel:)/i.test(href) || href.indexOf("//") === 0) {
      if (/^https?:/i.test(href) && href.indexOf(location.host) === -1) {
        e.preventDefault();
        window.open(href, "_blank", "noopener");
        return;
      }
    }

    // Internal page[span_9](start_span)[span_9](end_span)
    if (/\.html(\?|$)/i.test(href) || href.indexOf("?") === 0) {
      try {
        if (window.parent && window.parent !== window) {
          e.preventDefault();
          window.parent.postMessage({ type: "voxyy-nav", href: href }, "*");
        }
      } catch (err) {
        location.href = href;
      }
    }
  }, false); // Diubah dari true ke false agar tidak mencegat bubbling event lain
})();
