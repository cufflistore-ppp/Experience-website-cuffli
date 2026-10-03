/**
 * Telegram dinonaktifkan — semua order hanya lewat panel Admin (Firebase).
 * Fungsi tetap ada biar tidak error jika dipanggil dari halaman lama.
 */
async function kirimTelegram() {
  return { ok: true, skipped: true };
}
async function kirimFotoTelegram() {
  return { ok: true, skipped: true };
}
async function kirimOrderKeTelegram() {
  return { ok: true, skipped: true };
}
