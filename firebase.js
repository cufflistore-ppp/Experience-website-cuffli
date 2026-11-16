// Firebase belum diaktifkan pada template ini.
// Isi konfigurasi project Firebase milikmu di bawah, lalu aktifkan Authentication,
// Realtime Database, dan Storage sesuai Rules yang sudah disiapkan.
export const firebaseConfig = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_AUTH_DOMAIN",
  databaseURL: "ISI_DATABASE_URL",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_STORAGE_BUCKET",
  messagingSenderId: "ISI_MESSAGING_SENDER_ID",
  appId: "ISI_APP_ID"
};
export const firebaseReady = !Object.values(firebaseConfig).some(v => String(v).startsWith("ISI_"));
