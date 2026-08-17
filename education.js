/**
 * VORTEX HUB - Education Tools
 */

const Education = {
  quizData: [
    { q: 'Ibu kota Indonesia adalah?', a: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'], correct: 0 },
    { q: 'Berapa hasil 7 × 8?', a: ['54', '56', '64', '48'], correct: 1 },
    { q: 'Planet terdekat dengan Matahari?', a: ['Venus', 'Mars', 'Merkurius', 'Bumi'], correct: 2 },
    { q: 'Siapa penemu bola lampu?', a: ['Einstein', 'Newton', 'Edison', 'Tesla'], correct: 2 },
    { q: 'Air mendidih pada suhu berapa (°C)?', a: ['90', '100', '110', '80'], correct: 1 },
    { q: 'Berapa jumlah huruf dalam alfabet Inggris?', a: ['24', '25', '26', '27'], correct: 2 },
    { q: 'Hewan tercepat di darat?', a: ['Singa', 'Cheetah', 'Kuda', 'Serigala'], correct: 1 },
    { q: 'Benua terbesar di dunia?', a: ['Afrika', 'Amerika', 'Asia', 'Eropa'], correct: 2 }
  ],

  flashcards: [
    { front: 'Hello', back: 'Halo' },
    { front: 'Thank you', back: 'Terima kasih' },
    { front: 'Good morning', back: 'Selamat pagi' },
    { front: 'How are you?', back: 'Apa kabar?' },
    { front: 'Goodbye', back: 'Sampai jumpa' },
    { front: 'Yes / No', back: 'Ya / Tidak' }
  ],

  init() {
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
    this.initQuiz();
    this.initFlashcard();
    this.initTimer();
    this.initNotes();
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'quiz';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
    document.querySelectorAll('.edu-panel').forEach(p => {
      p.classList.toggle('hidden', p.id !== 'panel-' + hash);
    });
  },

  initQuiz() {
    let current = 0, score = 0;
    const data = this.quizData;

    const render = () => {
      if (current >= data.length) {
        document.getElementById('quiz-area').innerHTML = `
          <div class="text-center">
            <h3>Selesai!</h3>
            <p style="font-size:1.5rem">Skor: ${score} / ${data.length}</p>
            <button class="btn btn-primary mt-2" id="quiz-restart">Main Lagi</button>
          </div>`;
        document.getElementById('quiz-restart')?.addEventListener('click', () => {
          current = 0; score = 0; render();
        });
        return;
      }
      const item = data[current];
      document.getElementById('quiz-area').innerHTML = `
        <p class="text-muted">Soal ${current + 1} / ${data.length}</p>
        <h3 style="margin:1rem 0">${item.q}</h3>
        <div class="grid grid-2" style="gap:0.75rem">
          ${item.a.map((ans, i) => `<button class="btn btn-secondary quiz-opt" data-i="${i}">${ans}</button>`).join('')}
        </div>`;
      
      document.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          if (parseInt(btn.dataset.i) === item.correct) {
            score++;
            Toast.show('Benar! ✅', 'success');
          } else {
            Toast.show('Salah! Jawaban: ' + item.a[item.correct], 'error');
          }
          current++;
          setTimeout(render, 600);
        });
      });
    };
    render();
  },

  initFlashcard() {
    let idx = 0;
    const cards = this.flashcards;
    const cardEl = document.getElementById('flashcard');
    if (!cardEl) return;

    const show = () => {
      cardEl.textContent = cards[idx].front;
      cardEl.dataset.side = 'front';
    };
    show();

    cardEl.addEventListener('click', () => {
      if (cardEl.dataset.side === 'front') {
        cardEl.textContent = cards[idx].back;
        cardEl.dataset.side = 'back';
      } else {
        cardEl.textContent = cards[idx].front;
        cardEl.dataset.side = 'front';
      }
    });

    document.getElementById('flash-next')?.addEventListener('click', () => {
      idx = (idx + 1) % cards.length;
      show();
    });
    document.getElementById('flash-prev')?.addEventListener('click', () => {
      idx = (idx - 1 + cards.length) % cards.length;
      show();
    });
  },

  initTimer() {
    let seconds = 25 * 60;
    let interval = null;
    const display = document.getElementById('timer-display');
    if (!display) return;

    const update = () => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      display.textContent = `${m}:${s}`;
    };
    update();

    document.getElementById('timer-start')?.addEventListener('click', () => {
      if (interval) return;
      interval = setInterval(() => {
        seconds--;
        update();
        if (seconds <= 0) {
          clearInterval(interval);
          interval = null;
          Toast.show('Waktu habis! Istirahat dulu ya 🎉', 'success');
        }
      }, 1000);
    });

    document.getElementById('timer-pause')?.addEventListener('click', () => {
      clearInterval(interval);
      interval = null;
    });

    document.getElementById('timer-reset')?.addEventListener('click', () => {
      clearInterval(interval);
      interval = null;
      seconds = 25 * 60;
      update();
    });
  },

  initNotes() {
    const notes = Storage.get('vortex_notes', '');
    const area = document.getElementById('notes-area');
    if (area) {
      area.value = notes;
      area.addEventListener('input', () => {
        Storage.set('vortex_notes', area.value);
      });
    }
  }
};

window.Education = Education;
