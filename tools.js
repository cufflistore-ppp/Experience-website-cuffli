/**
 * VORTEX HUB - Tools Registry
 * Central list of all tools for search, categories, favorites
 */

const ToolsRegistry = [
  // Calculators
  { id: 'calc-basic', name: 'Kalkulator Biasa', desc: 'Kalkulator standar untuk operasi aritmatika', category: 'calculator', icon: '🔢', page: 'calculator.html', tags: ['hitung', 'math'] },
  { id: 'calc-percent', name: 'Kalkulator Persentase', desc: 'Hitung persentase dengan mudah', category: 'calculator', icon: '📊', page: 'calculator.html#percent', tags: ['persen', '%'] },
  { id: 'calc-discount', name: 'Kalkulator Diskon', desc: 'Hitung harga setelah diskon', category: 'calculator', icon: '🏷️', page: 'calculator.html#discount', tags: ['diskon', 'harga'] },
  { id: 'calc-tax', name: 'Kalkulator Pajak', desc: 'Hitung pajak dan harga termasuk pajak', category: 'calculator', icon: '🧾', page: 'calculator.html#tax', tags: ['pajak', 'ppn'] },
  { id: 'calc-bmi', name: 'Kalkulator BMI', desc: 'Hitung Body Mass Index', category: 'calculator', icon: '⚖️', page: 'calculator.html#bmi', tags: ['bmi', 'kesehatan'] },
  { id: 'calc-age', name: 'Kalkulator Umur', desc: 'Hitung usia dari tanggal lahir', category: 'calculator', icon: '🎂', page: 'calculator.html#age', tags: ['umur', 'usia'] },
  { id: 'calc-scientific', name: 'Scientific Calculator', desc: 'Kalkulator ilmiah lengkap', category: 'calculator', icon: '🔬', page: 'calculator.html#scientific', tags: ['scientific', 'sin', 'cos'] },

  // Converters
  { id: 'conv-length', name: 'Konverter Panjang', desc: 'Konversi meter, km, inch, feet dll', category: 'converter', icon: '📏', page: 'converter.html#length', tags: ['panjang', 'meter'] },
  { id: 'conv-weight', name: 'Konverter Berat', desc: 'Konversi kg, gram, pound, ounce', category: 'converter', icon: '🏋️', page: 'converter.html#weight', tags: ['berat', 'kg'] },
  { id: 'conv-temp', name: 'Konverter Suhu', desc: 'Celsius, Fahrenheit, Kelvin', category: 'converter', icon: '🌡️', page: 'converter.html#temp', tags: ['suhu', 'celsius'] },
  { id: 'conv-speed', name: 'Konverter Kecepatan', desc: 'km/h, mph, m/s', category: 'converter', icon: '🚀', page: 'converter.html#speed', tags: ['kecepatan'] },
  { id: 'conv-data', name: 'Konverter Data', desc: 'Byte, KB, MB, GB, TB', category: 'converter', icon: '💾', page: 'converter.html#data', tags: ['data', 'storage'] },
  { id: 'conv-currency', name: 'Konverter Mata Uang', desc: 'Konversi mata uang (demo rates)', category: 'converter', icon: '💱', page: 'converter.html#currency', tags: ['uang', 'rupiah', 'dollar'] },
  { id: 'conv-time', name: 'Konverter Waktu', desc: 'Detik, menit, jam, hari', category: 'converter', icon: '⏱️', page: 'converter.html#time', tags: ['waktu'] },

  // Text Tools
  { id: 'text-counter', name: 'Word & Character Counter', desc: 'Hitung kata dan karakter', category: 'text', icon: '📝', page: 'text-tools.html#counter', tags: ['kata', 'karakter'] },
  { id: 'text-case', name: 'Case Converter', desc: 'UPPER, lower, Title, camelCase', category: 'text', icon: '🔤', page: 'text-tools.html#case', tags: ['huruf', 'case'] },
  { id: 'text-slug', name: 'Slug Generator', desc: 'Buat slug URL-friendly', category: 'text', icon: '🔗', page: 'text-tools.html#slug', tags: ['slug', 'url'] },
  { id: 'text-lorem', name: 'Lorem Ipsum Generator', desc: 'Generate dummy text', category: 'text', icon: '📄', page: 'text-tools.html#lorem', tags: ['lorem', 'dummy'] },
  { id: 'text-password', name: 'Password Generator', desc: 'Buat password kuat & aman', category: 'text', icon: '🔐', page: 'text-tools.html#password', tags: ['password', 'sandi'] },
  { id: 'text-reverse', name: 'Reverse Text', desc: 'Balik urutan teks', category: 'text', icon: '↩️', page: 'text-tools.html#reverse', tags: ['reverse'] },
  { id: 'text-sort', name: 'Sort Text Lines', desc: 'Urutkan baris teks', category: 'text', icon: '🔃', page: 'text-tools.html#sort', tags: ['sort', 'urut'] },
  { id: 'text-duplicate', name: 'Remove Duplicate Lines', desc: 'Hapus baris duplikat', category: 'text', icon: '🧹', page: 'text-tools.html#duplicate', tags: ['duplikat'] },

  // Image Tools
  { id: 'img-resize', name: 'Resize Image', desc: 'Ubah ukuran gambar', category: 'image', icon: '🖼️', page: 'image-tools.html#resize', tags: ['resize', 'ukuran'] },
  { id: 'img-compress', name: 'Compress Image', desc: 'Kompres ukuran file gambar', category: 'image', icon: '📦', page: 'image-tools.html#compress', tags: ['kompres'] },
  { id: 'img-rotate', name: 'Rotate Image', desc: 'Putar gambar 90/180/270', category: 'image', icon: '🔄', page: 'image-tools.html#rotate', tags: ['putar'] },
  { id: 'img-info', name: 'Image Info', desc: 'Lihat informasi gambar', category: 'image', icon: 'ℹ️', page: 'image-tools.html#info', tags: ['info'] },

  // AI Tools
  { id: 'ai-chat', name: 'AI Chat', desc: 'Ngobrol dengan AI assistant', category: 'ai', icon: '🤖', page: 'ai.html#chat', tags: ['chat', 'asisten'] },
  { id: 'ai-writer', name: 'AI Writer', desc: 'Bantu tulis konten & artikel', category: 'ai', icon: '✍️', page: 'ai.html#writer', tags: ['tulis', 'konten'] },
  { id: 'ai-summarizer', name: 'AI Summarizer', desc: 'Ringkas teks panjang', category: 'ai', icon: '📋', page: 'ai.html#summarizer', tags: ['ringkas'] },
  { id: 'ai-translator', name: 'AI Translator', desc: 'Terjemahkan antar bahasa', category: 'ai', icon: '🌐', page: 'ai.html#translator', tags: ['terjemah'] },
  { id: 'ai-idea', name: 'AI Idea Generator', desc: 'Generate ide kreatif', category: 'ai', icon: '💡', page: 'ai.html#idea', tags: ['ide'] },
  { id: 'ai-code', name: 'AI Code Assistant', desc: 'Bantuan kode programming', category: 'ai', icon: '💻', page: 'ai.html#code', tags: ['kode', 'code'] },
  { id: 'ai-prompt', name: 'AI Prompt Generator', desc: 'Buat prompt AI yang bagus', category: 'ai', icon: '🎯', page: 'ai.html#prompt', tags: ['prompt'] },

  // Developer
  { id: 'dev-json', name: 'JSON Formatter', desc: 'Format & validate JSON', category: 'developer', icon: '{ }', page: 'developer.html#json', tags: ['json'] },
  { id: 'dev-base64', name: 'Base64 Encoder/Decoder', desc: 'Encode & decode Base64', category: 'developer', icon: '🔡', page: 'developer.html#base64', tags: ['base64'] },
  { id: 'dev-url', name: 'URL Encoder/Decoder', desc: 'Encode & decode URL', category: 'developer', icon: '🔗', page: 'developer.html#url', tags: ['url'] },
  { id: 'dev-uuid', name: 'UUID Generator', desc: 'Generate UUID v4', category: 'developer', icon: '🆔', page: 'developer.html#uuid', tags: ['uuid'] },
  { id: 'dev-hash', name: 'Hash Generator', desc: 'MD5, SHA-1, SHA-256 (demo)', category: 'developer', icon: '#️⃣', page: 'developer.html#hash', tags: ['hash', 'md5'] },
  { id: 'dev-regex', name: 'Regex Tester', desc: 'Uji ekspresi regular', category: 'developer', icon: '🔍', page: 'developer.html#regex', tags: ['regex'] },
  { id: 'dev-timestamp', name: 'Timestamp Converter', desc: 'Unix timestamp converter', category: 'developer', icon: '🕒', page: 'developer.html#timestamp', tags: ['timestamp'] },
  { id: 'dev-color', name: 'Color Converter', desc: 'HEX, RGB, HSL converter', category: 'developer', icon: '🎨', page: 'developer.html#color', tags: ['warna', 'color'] },

  // Finance
  { id: 'fin-currency', name: 'Currency Converter', desc: 'Konversi mata uang', category: 'finance', icon: '💰', page: 'finance.html#currency', tags: ['mata uang'] },
  { id: 'fin-discount', name: 'Discount Calculator', desc: 'Hitung diskon & hemat', category: 'finance', icon: '🏷️', page: 'finance.html#discount', tags: ['diskon'] },
  { id: 'fin-profit', name: 'Profit Calculator', desc: 'Hitung profit & margin', category: 'finance', icon: '📈', page: 'finance.html#profit', tags: ['profit', 'laba'] },
  { id: 'fin-loan', name: 'Loan Calculator', desc: 'Hitung cicilan pinjaman', category: 'finance', icon: '🏦', page: 'finance.html#loan', tags: ['pinjaman', 'cicilan'] },
  { id: 'fin-saving', name: 'Saving Calculator', desc: 'Hitung target tabungan', category: 'finance', icon: '🐷', page: 'finance.html#saving', tags: ['tabungan'] },
  { id: 'fin-invest', name: 'Investment Calculator', desc: 'Proyeksi investasi', category: 'finance', icon: '📊', page: 'finance.html#invest', tags: ['investasi'] },

  // Education
  { id: 'edu-quiz', name: 'Quiz', desc: 'Kuis pengetahuan umum', category: 'education', icon: '❓', page: 'education.html#quiz', tags: ['kuis'] },
  { id: 'edu-flashcard', name: 'Flashcard', desc: 'Belajar dengan flashcard', category: 'education', icon: '🃏', page: 'education.html#flashcard', tags: ['flashcard'] },
  { id: 'edu-timer', name: 'Study Timer', desc: 'Pomodoro & study timer', category: 'education', icon: '⏲️', page: 'education.html#timer', tags: ['timer', 'pomodoro'] },
  { id: 'edu-notes', name: 'Notes', desc: 'Catatan cepat', category: 'education', icon: '📓', page: 'education.html#notes', tags: ['catatan'] },

  // Games
  { id: 'game-tictactoe', name: 'Tic Tac Toe', desc: 'Main X dan O klasik', category: 'games', icon: '⭕', page: 'games.html#tictactoe', tags: ['tictactoe', 'xo'] },
  { id: 'game-memory', name: 'Memory Game', desc: 'Uji daya ingat', category: 'games', icon: '🧠', page: 'games.html#memory', tags: ['memory'] },
  { id: 'game-rps', name: 'Batu Gunting Kertas', desc: 'Rock Paper Scissors', category: 'games', icon: '✊', page: 'games.html#rps', tags: ['suit', 'rps'] },
  { id: 'game-guess', name: 'Number Guessing', desc: 'Tebak angka', category: 'games', icon: '🎲', page: 'games.html#guess', tags: ['tebak'] },
  { id: 'game-reaction', name: 'Reaction Test', desc: 'Uji kecepatan reaksi', category: 'games', icon: '⚡', page: 'games.html#reaction', tags: ['reaksi'] },
  { id: 'game-snake', name: 'Snake', desc: 'Game ular klasik', category: 'games', icon: '🐍', page: 'games.html#snake', tags: ['snake', 'ular'] }
];

window.ToolsRegistry = ToolsRegistry;

function getToolsByCategory(cat) {
  return ToolsRegistry.filter(t => t.category === cat);
}

function getToolById(id) {
  return ToolsRegistry.find(t => t.id === id);
}

function searchTools(query) {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  return ToolsRegistry.filter(t => 
    t.name.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q)) ||
    t.category.includes(q)
  );
}

window.getToolsByCategory = getToolsByCategory;
window.getToolById = getToolById;
window.searchTools = searchTools;
