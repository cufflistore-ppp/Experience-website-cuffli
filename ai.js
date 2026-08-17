/**
 * VORTEX HUB - AI Tools (Demo / Local Mock)
 */

const AI = {
  responses: {
    greetings: [
      "Halo! Saya asisten AI VORTEX HUB. Ada yang bisa saya bantu hari ini?",
      "Hai! Siap membantu kamu. Mau tanya apa?",
      "Selamat datang! Saya di sini untuk membantu."
    ],
    default: [
      "Terima kasih atas pertanyaannya! Sebagai AI demo, saya memberikan jawaban sederhana. Untuk hasil lebih akurat, tambahkan API key di Pengaturan.",
      "Itu topik menarik! Dalam mode demo, saya bisa memberikan informasi umum. Coba tanyakan sesuatu yang lebih spesifik.",
      "Saya paham maksudmu. Berikut penjelasan singkat berdasarkan pengetahuan umum saya."
    ]
  },

  init() {
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
    this.bindChat();
    this.bindTools();
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'chat';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
    document.querySelectorAll('.ai-panel').forEach(p => {
      p.classList.toggle('hidden', p.id !== 'panel-' + hash);
    });
  },

  async mockReply(prompt) {
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    const lower = prompt.toLowerCase();
    
    if (lower.match(/halo|hai|hello|hi|selamat/)) {
      return this.responses.greetings[Math.floor(Math.random() * this.responses.greetings.length)];
    }
    if (lower.includes('siapa kamu') || lower.includes('siapa anda')) {
      return "Saya adalah asisten AI dari VORTEX HUB. Saya membantu pengguna dengan berbagai kebutuhan digital.";
    }
    if (lower.includes('kode') || lower.includes('code') || lower.includes('javascript')) {
      return "Berikut contoh sederhana:\n\nfunction hello(name) {\n  return `Halo, ${name}!`;\n}\nconsole.log(hello('VORTEX'));\n\nIni contoh demo.";
    }
    
    return this.responses.default[Math.floor(Math.random() * this.responses.default.length)] + 
      "\n\n(Mengenai: \"" + prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '') + "\")";
  },

  bindChat() {
    const form = document.getElementById('chat-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const msg = input.value.trim();
      if (!msg) return;
      
      this.addMessage(msg, 'user');
      input.value = '';
      
      const typing = this.addMessage('Mengetik...', 'ai');
      const reply = await this.mockReply(msg);
      typing.remove();
      this.addMessage(reply, 'ai');
    });
  },

  addMessage(text, type) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  },

  bindTools() {
    document.getElementById('btn-writer')?.addEventListener('click', async () => {
      const topic = document.getElementById('writer-topic').value.trim();
      if (!topic) return Toast.show('Masukkan topik', 'warning');
      document.getElementById('writer-output').value = 'Menulis...';
      await new Promise(r => setTimeout(r, 1000));
      document.getElementById('writer-output').value = 
`Judul: ${topic}

Pengenalan
${topic} merupakan topik yang menarik. Perhatian terhadap topik ini semakin meningkat.

Isi Utama
Ada beberapa aspek penting terkait ${topic}. Pemahaman dasar sangat diperlukan, dan penerapan praktis membawa banyak manfaat.

Kesimpulan
Secara keseluruhan, ${topic} memiliki peran penting. Dengan pemahaman yang baik, kita dapat memanfaatkannya secara optimal.

---
*Konten demo VORTEX HUB AI.`;
    });

    document.getElementById('btn-summarize')?.addEventListener('click', async () => {
      const text = document.getElementById('sum-input').value.trim();
      if (!text) return Toast.show('Masukkan teks', 'warning');
      document.getElementById('sum-output').value = 'Meringkas...';
      await new Promise(r => setTimeout(r, 800));
      const sentences = text.split(/[.!?]+/).filter(s => s.trim()).slice(0, 3);
      document.getElementById('sum-output').value = sentences.map(s => s.trim()).join('. ') + '.';
    });

    document.getElementById('btn-translate')?.addEventListener('click', async () => {
      const text = document.getElementById('trans-input').value.trim();
      if (!text) return Toast.show('Masukkan teks', 'warning');
      document.getElementById('trans-output').value = 'Menerjemahkan...';
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('trans-output').value = `[Demo Translation]\n${text}\n\n*Mode demo: hubungkan API key di Pengaturan untuk terjemahan akurat.`;
    });

    document.getElementById('btn-idea')?.addEventListener('click', async () => {
      const topic = document.getElementById('idea-topic').value.trim() || 'umum';
      document.getElementById('idea-output').value = 'Menghasilkan ide...';
      await new Promise(r => setTimeout(r, 900));
      document.getElementById('idea-output').value = [
        `1. Buat konten edukatif tentang ${topic}`,
        `2. Kembangkan mini project terkait ${topic}`,
        `3. Adakan diskusi komunitas seputar ${topic}`,
        `4. Buat infografis menarik tentang ${topic}`,
        `5. Tulis seri artikel mendalam mengenai ${topic}`
      ].join('\n');
    });

    document.getElementById('btn-code')?.addEventListener('click', async () => {
      const prompt = document.getElementById('code-prompt').value.trim();
      if (!prompt) return Toast.show('Jelaskan kebutuhan kode', 'warning');
      document.getElementById('code-output').value = 'Menulis kode...';
      await new Promise(r => setTimeout(r, 1000));
      document.getElementById('code-output').value = `// Demo untuk: ${prompt}\n\nfunction example() {\n  console.log("Hello from VORTEX HUB!");\n  return true;\n}\n\nexample();`;
    });

    document.getElementById('btn-prompt')?.addEventListener('click', async () => {
      const goal = document.getElementById('prompt-goal').value.trim();
      if (!goal) return Toast.show('Masukkan tujuan', 'warning');
      document.getElementById('prompt-output').value = 'Membuat prompt...';
      await new Promise(r => setTimeout(r, 700));
      document.getElementById('prompt-output').value = 
`Kamu adalah asisten ahli. Tugasmu adalah membantu pengguna untuk: ${goal}.

Instruksi:
1. Berikan jawaban yang jelas dan terstruktur.
2. Gunakan contoh praktis jika relevan.
3. Jawab dalam bahasa Indonesia yang baik.

Sekarang, bantu saya dengan: ${goal}`;
    });
  }
};

window.AI = AI;
