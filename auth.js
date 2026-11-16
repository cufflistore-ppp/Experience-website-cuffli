import { firebaseConfig, firebaseReady } from './firebase.js';
const msg = document.getElementById('authMsg');
const login = document.getElementById('loginForm');
const register = document.getElementById('registerForm');
if (login) login.addEventListener('submit', async e => { e.preventDefault(); msg.textContent = firebaseReady ? 'Hubungkan Firebase Authentication di js/auth.js untuk mengaktifkan login.' : 'Firebase belum dikonfigurasi. Isi js/firebase.js terlebih dahulu.'; });
if (register) register.addEventListener('submit', async e => { e.preventDefault(); msg.textContent = 'Firebase belum dikonfigurasi. Isi js/firebase.js dan aktifkan Authentication terlebih dahulu.'; });
