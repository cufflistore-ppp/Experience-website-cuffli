/**
 * VORTEX HUB - Mini Games
 */

const Games = {
  init() {
    this.showFromHash();
    window.addEventListener('hashchange', () => this.showFromHash());
    this.initTicTacToe();
    this.initRPS();
    this.initGuess();
    this.initReaction();
    this.initMemory();
    this.initSnake();
  },

  showFromHash() {
    const hash = window.location.hash.slice(1) || 'tictactoe';
    document.querySelectorAll('.tool-sidebar a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
    document.querySelectorAll('.game-panel').forEach(p => {
      p.classList.toggle('hidden', p.id !== 'panel-' + hash);
    });
  },

  // Tic Tac Toe
  ttt: { board: Array(9).fill(''), turn: 'X', over: false },
  
  initTicTacToe() {
    const cells = document.querySelectorAll('.ttt-cell');
    if (!cells.length) return;
    
    cells.forEach((cell, i) => {
      cell.addEventListener('click', () => {
        if (this.ttt.board[i] || this.ttt.over) return;
        this.ttt.board[i] = this.ttt.turn;
        cell.textContent = this.ttt.turn;
        cell.style.color = this.ttt.turn === 'X' ? 'var(--accent)' : 'var(--success)';
        
        if (this.checkWin(this.ttt.board, this.ttt.turn)) {
          document.getElementById('ttt-status').textContent = `${this.ttt.turn} Menang!`;
          this.ttt.over = true;
          return;
        }
        if (this.ttt.board.every(c => c)) {
          document.getElementById('ttt-status').textContent = 'Seri!';
          this.ttt.over = true;
          return;
        }
        this.ttt.turn = this.ttt.turn === 'X' ? 'O' : 'X';
        document.getElementById('ttt-status').textContent = `Giliran: ${this.ttt.turn}`;
      });
    });

    document.getElementById('ttt-reset')?.addEventListener('click', () => {
      this.ttt = { board: Array(9).fill(''), turn: 'X', over: false };
      cells.forEach(c => { c.textContent = ''; });
      document.getElementById('ttt-status').textContent = 'Giliran: X';
    });
  },

  checkWin(board, p) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(([a,b,c]) => board[a] === p && board[b] === p && board[c] === p);
  },

  // Rock Paper Scissors
  initRPS() {
    document.querySelectorAll('.rps-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const choices = ['✊', '✋', '✌️'];
        const names = ['Batu', 'Kertas', 'Gunting'];
        const player = parseInt(btn.dataset.choice);
        const cpu = Math.floor(Math.random() * 3);
        let result = '';
        if (player === cpu) result = 'Seri!';
        else if ((player === 0 && cpu === 2) || (player === 1 && cpu === 0) || (player === 2 && cpu === 1)) result = 'Kamu Menang! 🎉';
        else result = 'CPU Menang!';
        
        document.getElementById('rps-result').innerHTML = `
          Kamu: ${choices[player]} (${names[player]})<br>
          CPU: ${choices[cpu]} (${names[cpu]})<br>
          <strong style="font-size:1.2rem">${result}</strong>
        `;
      });
    });
  },

  // Number Guessing
  guess: { target: 0, tries: 0 },
  
  initGuess() {
    this.guess.target = Math.floor(Math.random() * 100) + 1;
    document.getElementById('btn-guess')?.addEventListener('click', () => {
      const val = parseInt(document.getElementById('guess-input').value);
      if (isNaN(val)) return Toast.show('Masukkan angka', 'warning');
      this.guess.tries++;
      let msg = '';
      if (val === this.guess.target) {
        msg = `Benar! Angkanya ${this.guess.target}. Kamu butuh ${this.guess.tries} percobaan.`;
        this.guess.target = Math.floor(Math.random() * 100) + 1;
        this.guess.tries = 0;
      } else if (val < this.guess.target) msg = 'Terlalu kecil! Coba lagi.';
      else msg = 'Terlalu besar! Coba lagi.';
      document.getElementById('guess-status').textContent = msg;
    });
  },

  // Reaction Test
  reaction: { start: 0, waiting: false },
  
  initReaction() {
    const area = document.getElementById('reaction-area');
    if (!area) return;
    
    area.addEventListener('click', () => {
      if (!this.reaction.waiting) {
        area.style.background = 'var(--warning)';
        area.textContent = 'Tunggu hijau...';
        this.reaction.waiting = true;
        const delay = 1500 + Math.random() * 3000;
        setTimeout(() => {
          if (this.reaction.waiting) {
            area.style.background = 'var(--success)';
            area.textContent = 'KLIK SEKARANG!';
            this.reaction.start = Date.now();
          }
        }, delay);
      } else if (this.reaction.start) {
        const time = Date.now() - this.reaction.start;
        area.style.background = 'var(--accent)';
        area.textContent = `Waktu reaksi: ${time} ms`;
        this.reaction.waiting = false;
        this.reaction.start = 0;
      } else {
        area.style.background = 'var(--danger)';
        area.textContent = 'Terlalu cepat! Coba lagi.';
        this.reaction.waiting = false;
      }
    });
  },

  // Memory Game
  memory: { cards: [], flipped: [], locked: false, matches: 0 },
  
  initMemory() {
    const board = document.getElementById('memory-board');
    if (!board) return;
    
    const emojis = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'];
    const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    this.memory = { cards, flipped: [], locked: false, matches: 0 };
    
    board.innerHTML = cards.map((e, i) => 
      `<div class="game-cell memory-card" data-i="${i}" style="width:70px;height:70px;font-size:1.8rem">❓</div>`
    ).join('');
    
    board.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('click', () => {
        const i = parseInt(card.dataset.i);
        if (this.memory.locked || this.memory.flipped.includes(i) || card.textContent !== '❓') return;
        
        card.textContent = this.memory.cards[i];
        this.memory.flipped.push(i);
        
        if (this.memory.flipped.length === 2) {
          this.memory.locked = true;
          const [a, b] = this.memory.flipped;
          if (this.memory.cards[a] === this.memory.cards[b]) {
            this.memory.matches++;
            this.memory.flipped = [];
            this.memory.locked = false;
            if (this.memory.matches === 8) {
              document.getElementById('memory-status').textContent = 'Selesai! 🎉';
            }
          } else {
            setTimeout(() => {
              board.querySelector(`[data-i="${a}"]`).textContent = '❓';
              board.querySelector(`[data-i="${b}"]`).textContent = '❓';
              this.memory.flipped = [];
              this.memory.locked = false;
            }, 700);
          }
        }
      });
    });
  },

  // Snake (simple canvas)
  snake: null,
  
  initSnake() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 15;
    let snake = [{x: 10, y: 10}];
    let dir = {x: 1, y: 0};
    let food = {x: 15, y: 15};
    let score = 0;
    let running = false;
    let interval;

    const draw = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary').trim() || '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#10b981';
      snake.forEach(s => ctx.fillRect(s.x * size, s.y * size, size - 1, size - 1));
      
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(food.x * size, food.y * size, size - 1, size - 1);
    };

    const move = () => {
      const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) {
        clearInterval(interval);
        running = false;
        document.getElementById('snake-status').textContent = `Game Over! Skor: ${score}`;
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('snake-status').textContent = `Skor: ${score}`;
        food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
      } else {
        snake.pop();
      }
      draw();
    };

    document.getElementById('snake-start')?.addEventListener('click', () => {
      if (running) return;
      snake = [{x: 10, y: 10}];
      dir = {x: 1, y: 0};
      score = 0;
      running = true;
      document.getElementById('snake-status').textContent = 'Skor: 0';
      interval = setInterval(move, 150);
      draw();
    });

    document.addEventListener('keydown', e => {
      if (!running) return;
      if (e.key === 'ArrowUp' && dir.y === 0) dir = {x: 0, y: -1};
      if (e.key === 'ArrowDown' && dir.y === 0) dir = {x: 0, y: 1};
      if (e.key === 'ArrowLeft' && dir.x === 0) dir = {x: -1, y: 0};
      if (e.key === 'ArrowRight' && dir.x === 0) dir = {x: 1, y: 0};
    });

    // Touch controls
    document.querySelectorAll('[data-snake]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!running) return;
        const d = btn.dataset.snake;
        if (d === 'up' && dir.y === 0) dir = {x: 0, y: -1};
        if (d === 'down' && dir.y === 0) dir = {x: 0, y: 1};
        if (d === 'left' && dir.x === 0) dir = {x: -1, y: 0};
        if (d === 'right' && dir.x === 0) dir = {x: 1, y: 0};
      });
    });

    draw();
  }
};

window.Games = Games;
