(function () {
  "use strict";

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escAttr(v) { return esc(v); }

  function statusStyle(status) {
    const s = String(status || "Menunggu").toLowerCase();
    if (s.includes("selesai")) return "background:#e9f8ef;color:#177245";
    if (s.includes("proses")) return "background:#fff5dd;color:#996b00";
    return "background:#fff0f7;color:#a52c68";
  }

  function renderReports(reports) {
    const list = document.getElementById("adminReportsList");
    const count = document.getElementById("adminReportsCount");
    const filter = document.getElementById("adminReportFilter");
    if (!list) return;

    const all = Array.isArray(reports) ? reports : [];
    const selected = filter ? filter.value : "all";
    const filtered = all.filter(r => selected === "all" || String(r.status || "Menunggu") === selected);
    if (count) count.textContent = `${filtered.length} laporan`;

    if (!filtered.length) {
      list.innerHTML = '<div class="empty-history" style="min-height:220px;font-size:18px;">Belum ada laporan.</div>';
      return;
    }

    list.innerHTML = filtered.map(r => {
      const status = r.status || "Menunggu";
      const photos = Array.isArray(r.photos) ? r.photos.filter(p => p && p.data) : [];
      const photoHtml = photos.length ? `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
          ${photos.map((p, i) => `<a href="${escAttr(p.data)}" target="_blank" rel="noopener" title="Foto ${i + 1}"><img src="${escAttr(p.data)}" alt="Foto laporan ${i + 1}" style="width:78px;height:78px;object-fit:cover;border-radius:9px;border:1px solid #ead9e1;"></a>`).join("")}
        </div>` : "";
      const safeId = escAttr(r.id || "");
      return `<article class="admin-report-card" data-report-id="${safeId}">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:9px;">
          <div><strong style="color:#a52c68;font-size:14px;">${esc(r.judul || "Laporan")}</strong><div style="font-size:11px;color:#9b9199;margin-top:3px;">${esc(r.id || "-")}</div></div>
          <span style="font-size:11px;padding:5px 8px;border-radius:8px;white-space:nowrap;${statusStyle(status)}">${esc(status)}</span>
        </div>
        <div style="font-size:13px;line-height:1.65;color:#68616a;">
          <div>🧾 <b>Pesanan:</b> ${esc(r.noPesanan || "-")}</div>
          ${r.email ? `<div>✉️ <b>Email:</b> ${esc(r.email)}</div>` : ""}
          <div>🕒 <b>Dikirim:</b> ${esc(r.createdAt ? new Date(r.createdAt).toLocaleString("id-ID") : "-")}</div>
          <div style="margin-top:8px;background:#fff8fb;border:1px solid #f0d5e2;border-radius:9px;padding:9px;white-space:pre-wrap;">${esc(r.deskripsi || "-")}</div>
          ${photoHtml}
        </div>
        <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px;">
          <button type="button" class="status-btn btn-proses" onclick="ubahStatusLaporan('${safeId}','Proses')">Proses</button>
          <button type="button" class="status-btn btn-paid" onclick="ubahStatusLaporan('${safeId}','Selesai')">Selesai</button>
          <button type="button" class="status-btn btn-delete" onclick="hapusLaporanAdmin('${safeId}')">Hapus</button>
        </div>
      </article>`;
    }).join("");
  }

  async function loadReports() {
    const list = document.getElementById("adminReportsList");
    if (!list) return;
    list.innerHTML = '<p style="color:#aaa;text-align:center;padding:20px;">Memuat laporan...</p>';
    try {
      const reports = await window.VoxyyReports.getReports();
      window._elzkiiReportsCache = reports;
      renderReports(reports);
    } catch (e) {
      console.error("Gagal memuat laporan:", e);
      list.innerHTML = '<p style="color:#b54a55;text-align:center;padding:20px;">Gagal memuat laporan.</p>';
    }
  }

  window.ubahStatusLaporan = async function (id, status) {
    if (!id || !window.VoxyyReports) return;
    try {
      await window.VoxyyReports.updateReport(id, { status });
      await loadReports();
    } catch (e) { alert("Gagal mengubah status laporan."); }
  };

  window.hapusLaporanAdmin = async function (id) {
    if (!id || !window.VoxyyReports) return;
    if (!confirm("Hapus laporan ini dari Panel Admin?")) return;
    try {
      await window.VoxyyReports.deleteReport(id);
      await loadReports();
    } catch (e) { alert("Gagal menghapus laporan."); }
  };

  window.ejLoadReports = loadReports;

  document.addEventListener("DOMContentLoaded", () => {
    const filter = document.getElementById("adminReportFilter");
    if (filter) filter.addEventListener("change", () => renderReports(window._elzkiiReportsCache || []));
    if (window.VoxyyReports && typeof window.VoxyyReports.onReportsChange === "function") {
      window.VoxyyReports.onReportsChange(reports => {
        window._elzkiiReportsCache = reports;
        if (!document.getElementById("view-reports")?.hidden) renderReports(reports);
      });
    }
  });
})();
