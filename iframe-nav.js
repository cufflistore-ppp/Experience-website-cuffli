/**
 * Saat halaman dibuka di dalam app.html (iframe):
 * - Sembunyikan bottom-nav & music controls (punya parent)
 * - Link internal dikirim ke parent agar audio tidak putus
 */
(function () {
  if (window.self === window.top) return; // bukan di iframe

  document.documentElement.classList.add("in-iframe");

  function isInternal(href) {
    if (!href) return false;
    if (href.startsWith("#")) return false;
    if (href.startsWith("javascript:")) return false;
    if (href.startsWith("mailto:")) return false;
    if (href.startsWith("tel:")) return false;
    if (href.indexOf("wa.me") !== -1) return false;
    if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) {
      // external
      try {
        return new URL(href).origin === window.location.origin;
      } catch (e) {
        return false;
      }
    }
    return true; // relative path
  }

  document.addEventListener("click", function (e) {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!isInternal(href)) return;
    e.preventDefault();
    e.stopPropagation();
    // Resolve relative
    let path = href;
    try {
      path = new URL(href, window.location.href).pathname.split("/").pop();
      if (href.indexOf("?") !== -1) {
        path += href.substring(href.indexOf("?"));
      } else if (new URL(href, window.location.href).search) {
        path += new URL(href, window.location.href).search;
      }
    } catch (err) {}
    window.parent.postMessage({ type: "voxyy-nav", href: path || href }, "*");
  }, true);
})();
