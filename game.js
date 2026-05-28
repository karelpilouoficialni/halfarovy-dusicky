// =============================================
//  HALFAROVY DUŠIČKY – GAME.JS
// =============================================

// ── STATE ──
let difficulty = 'easy';
let progress = 0;
let combo = 1;
let score = 0;
let timerInterval = null;
let timeLeft = 60;
let challengeActive = false;
let currentAnswer = null;
let consecutiveCorrect = 0;
let menuQuoteIndex = 0;

const DIFFICULTIES = {
  easy:   { time: 90, progressPerCorrect: 14, progressDecay: 0, label: 'NOOB',   threat: 'NÍZKÁ' },
  medium: { time: 60, progressPerCorrect: 10, progressDecay: 1, label: 'HACKER', threat: 'STŘEDNÍ' },
  hard:   { time: 45, progressPerCorrect: 8,  progressDecay: 2, label: 'HALFAR', threat: 'KRITICKÁ' }
};

// ── MENU QUOTES (rotate each visit) ──
const MENU_QUOTES = [
  "Dneska schytají víc než jedničku z matiky.",
  "Bakaláři? Spíš Bakala-BYE.",
  "Wifi 0.3 kb/s? To jsem já.",
  "Ping 9999ms – klasický Halfar morning.",
  "Omlouvám se učitelům. Ne opravdu ne."
];

// ── HALFAR IN-GAME COMMENTS ──
const HALFAR_COMMENTS = {
  correct: [
    "Jo, to je ono!",
    "Server se třese!",
    "Lag roste!",
    "Výborně!",
    "Ping stoupá!",
    "Sítě hoří!",
  ],
  wrong: [
    "Blbec!",
    "Jsi pomalý!",
    "Server se směje!",
    "No tak!",
    "Tohle nestačí!",
  ],
  combo: [
    "NEUVĚŘITELNÉ!",
    "COMBO CHAIN!",
    "MEGA ÚTOK!",
    "HALFAR MODE!",
  ],
};

// ── WORD CHALLENGES ──
const TYPING_CHALLENGES = [
  "BAKALARE_DOWN",
  "SKOLNI_SIT",
  "LAG_DETECTED",
  "HALFAR_RULES",
  "CRASH_SYSTEM",
  "INTERNET_FAIL",
  "PING_9999",
  "SERVER_ERROR",
  "WIFI_DEAD",
  "ZNAMKY_PRYC",
];

// ── MATH CHALLENGES ──
function generateMath(diff) {
  if (diff === 'easy') {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const result = op === '+' ? a + b : a - b;
    return { question: `${a} ${op} ${b} = ?`, answer: String(result) };
  } else if (diff === 'medium') {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 12) + 2;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const result = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { question: `${a} ${op} ${b} = ?`, answer: String(result) };
  } else {
    const a = Math.floor(Math.random() * 15) + 5;
    const b = Math.floor(Math.random() * 15) + 5;
    const c = Math.floor(Math.random() * 10) + 1;
    const result = a * b - c;
    return { question: `${a} × ${b} − ${c} = ?`, answer: String(result) };
  }
}

// ── MCQ CHALLENGES ──
const MCQ_CHALLENGES = [
  {
    question: "Co dělá Halfar?",
    correct: "Způsobuje lág",
    options: ["Opravuje síť", "Způsobuje lág", "Hraje šachy", "Maže memy"]
  },
  {
    question: "Bakaláři server status?",
    correct: "💀 DOWN",
    options: ["✓ ONLINE", "💀 DOWN", "⚠ MAINTENANCE", "🔒 LOCKED"]
  },
  {
    question: "Ping ve škole při Dušičkách?",
    correct: "9999ms",
    options: ["5ms", "20ms", "200ms", "9999ms"]
  },
  {
    question: "Kolik % Internet zbývá?",
    correct: "0%",
    options: ["50%", "25%", "10%", "0%"]
  },
  {
    question: "Jak se jmenuje hlavní hacker?",
    correct: "Radim Halfar",
    options: ["Jan Novák", "Radim Halfar", "Petr Kovář", "Admin 404"]
  },
];

// ── SEQUENCE CHALLENGE ──
const SEQUENCES = [
  { sequence: "2, 4, 8, 16, ?",   answer: "32" },
  { sequence: "1, 1, 2, 3, 5, ?", answer: "8" },
  { sequence: "10, 8, 6, 4, ?",   answer: "2" },
  { sequence: "3, 9, 27, 81, ?",  answer: "243" },
  { sequence: "100, 50, 25, ?",   answer: "12.5" },
];

// ── PARTICLES ──
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function Particle() { this.reset(); }
  Particle.prototype.reset = function () {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.1;
    const colors = ['#00f5ff', '#00ff88', '#ff00cc'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  };
  Particle.prototype.update = function () {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
  };
  Particle.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6; ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  function init() {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  }
  function loop() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  init(); loop();
})();

// ── SCREEN MANAGEMENT ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-menu') showMenuQuote();
}

// ── MENU QUOTE ──
function showMenuQuote() {
  const el = document.getElementById('menu-quote-text');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = '"' + MENU_QUOTES[menuQuoteIndex] + '"';
    menuQuoteIndex = (menuQuoteIndex + 1) % MENU_QUOTES.length;
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '1';
  }, 250);
}

// ── DIFFICULTY ──
function setDifficulty(diff, btn) {
  difficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('threat-level').textContent = `HROZBA: ${DIFFICULTIES[diff].threat}`;
}

// ── HALFAR SPEECH (in-game only) ──
function speakHalfar(text) {
  const el = document.getElementById('halfar-speech');
  if (el) el.textContent = text;
  animateHalfar();
}

function animateHalfar() {
  const el = document.getElementById('halfar-mini');
  if (!el) return;
  el.style.filter = 'brightness(2) drop-shadow(0 0 12px #00f5ff)';
  setTimeout(() => { el.style.filter = ''; }, 400);
}

// ── START GAME ──
function startGame() {
  progress = 0;
  combo = 1;
  score = 0;
  consecutiveCorrect = 0;
  const d = DIFFICULTIES[difficulty];
  timeLeft = d.time;

  updateProgress(0);
  document.getElementById('combo-value').textContent = 'x1';
  document.getElementById('browser-crash').classList.remove('visible');
  document.getElementById('bak-loading').style.width = '10%';
  updateServerBars(0);

  showScreen('screen-game');
  speakHalfar("Útok zahájen!");
  startTimer();
  nextChallenge();
}

// ── TIMER ──
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;

    const d = DIFFICULTIES[difficulty];
    if (d.progressDecay > 0 && progress > 0) {
      progress = Math.max(0, progress - d.progressDecay * 0.05);
      updateProgress(progress);
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
    if (timeLeft <= 10) {
      document.getElementById('timer').style.color = 'var(--red)';
      document.getElementById('timer').style.textShadow = '0 0 8px var(--red)';
    }
  }, 1000);
}

// ── CHALLENGES ──
function nextChallenge() {
  challengeActive = true;
  const types = difficulty === 'easy'
    ? ['typing', 'math', 'mcq']
    : difficulty === 'medium'
    ? ['typing', 'math', 'mcq', 'sequence']
    : ['math', 'typing', 'sequence', 'mcq'];
  renderChallenge(types[Math.floor(Math.random() * types.length)]);
}

function renderChallenge(type) {
  const typeEl     = document.getElementById('challenge-type');
  const contentEl  = document.getElementById('challenge-content');
  const inputEl    = document.getElementById('challenge-input-area');
  const feedbackEl = document.getElementById('challenge-feedback');
  feedbackEl.textContent = '';
  feedbackEl.className = 'challenge-feedback';

  if (type === 'typing') {
    const word = TYPING_CHALLENGES[Math.floor(Math.random() * TYPING_CHALLENGES.length)];
    currentAnswer = word;
    typeEl.textContent = '◈ TYPING ATTACK ◈';
    contentEl.textContent = word;
    inputEl.innerHTML = `
      <input class="holo-input" id="type-input" type="text" placeholder="Napiš přesně..." autocomplete="off" spellcheck="false"/>
      <button class="holo-btn" onclick="checkTyping()">SEND</button>
    `;
    setTimeout(() => {
      const inp = document.getElementById('type-input');
      if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkTyping(); }); }
    }, 50);

  } else if (type === 'math') {
    const m = generateMath(difficulty);
    currentAnswer = m.answer;
    typeEl.textContent = '◈ MATH HACK ◈';
    contentEl.textContent = m.question;
    inputEl.innerHTML = `
      <input class="holo-input" id="math-input" type="number" placeholder="Výsledek..." />
      <button class="holo-btn" onclick="checkMath()">SEND</button>
    `;
    setTimeout(() => {
      const inp = document.getElementById('math-input');
      if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkMath(); }); }
    }, 50);

  } else if (type === 'mcq') {
    const q = MCQ_CHALLENGES[Math.floor(Math.random() * MCQ_CHALLENGES.length)];
    currentAnswer = q.correct;
    typeEl.textContent = '◈ KNOWLEDGE BREACH ◈';
    contentEl.textContent = q.question;
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    inputEl.innerHTML = shuffled.map(opt =>
      `<button class="mcq-btn" onclick="checkMCQ(this, '${opt}')">${opt}</button>`
    ).join('');

  } else if (type === 'sequence') {
    const s = SEQUENCES[Math.floor(Math.random() * SEQUENCES.length)];
    currentAnswer = s.answer;
    typeEl.textContent = '◈ SEQUENCE DECRYPT ◈';
    contentEl.textContent = s.sequence;
    inputEl.innerHTML = `
      <input class="holo-input" id="seq-input" type="text" placeholder="Další číslo..." autocomplete="off"/>
      <button class="holo-btn" onclick="checkSequence()">SEND</button>
    `;
    setTimeout(() => {
      const inp = document.getElementById('seq-input');
      if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkSequence(); }); }
    }, 50);
  }
}

// ── CHECK FUNCTIONS ──
function checkTyping() {
  const val = (document.getElementById('type-input')?.value || '').trim().toUpperCase();
  evaluate(val === currentAnswer.toUpperCase());
}
function checkMath() {
  const val = (document.getElementById('math-input')?.value || '').trim();
  evaluate(val === currentAnswer);
}
function checkMCQ(btn, answer) {
  document.querySelectorAll('.mcq-btn').forEach(b => b.disabled = true);
  if (answer === currentAnswer) {
    btn.classList.add('correct');
    evaluate(true);
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.mcq-btn').forEach(b => {
      if (b.textContent === currentAnswer) b.classList.add('correct');
    });
    evaluate(false);
  }
}
function checkSequence() {
  const val = (document.getElementById('seq-input')?.value || '').trim();
  evaluate(val === currentAnswer);
}

// ── EVALUATE ──
function evaluate(correct) {
  if (!challengeActive) return;
  challengeActive = false;

  const feedbackEl = document.getElementById('challenge-feedback');
  const d = DIFFICULTIES[difficulty];

  if (correct) {
    consecutiveCorrect++;
    if (consecutiveCorrect >= 3) combo = Math.min(combo + 1, 5);
    const gain = d.progressPerCorrect * combo;
    progress = Math.min(100, progress + gain);
    score += gain * 10;

    feedbackEl.textContent = `✓ +${gain}% PROGRESS`;
    feedbackEl.className = 'challenge-feedback feedback-correct';

    const pool = consecutiveCorrect >= 3 ? HALFAR_COMMENTS.combo : HALFAR_COMMENTS.correct;
    speakHalfar(pool[Math.floor(Math.random() * pool.length)]);

    document.getElementById('combo-value').textContent = `x${combo}`;
    document.getElementById('combo-display').style.borderColor = combo >= 3 ? 'var(--magenta)' : 'var(--border)';

  } else {
    consecutiveCorrect = 0;
    combo = 1;
    document.getElementById('combo-value').textContent = 'x1';
    document.getElementById('combo-display').style.borderColor = 'var(--border)';

    feedbackEl.textContent = '✗ FAIL – SERVER LAUGHS';
    feedbackEl.className = 'challenge-feedback feedback-wrong';

    speakHalfar(HALFAR_COMMENTS.wrong[Math.floor(Math.random() * HALFAR_COMMENTS.wrong.length)]);
  }

  updateProgress(progress);
  updateServerBars(progress);

  if (progress >= 100) {
    clearInterval(timerInterval);
    setTimeout(() => endGame(true), 600);
    return;
  }

  setTimeout(() => { if (!challengeActive) nextChallenge(); }, 1000);
}

// ── UPDATE UI ──
function updateProgress(pct) {
  const fill  = document.getElementById('attack-progress');
  const skull = document.getElementById('progress-skull');
  const pctEl = document.getElementById('progress-percent');
  const p = Math.min(100, Math.max(0, pct));
  fill.style.width = `${p}%`;
  skull.style.left = `${p}%`;
  pctEl.textContent = `${Math.round(p)}%`;

  if (p > 70) {
    fill.style.background = 'linear-gradient(90deg, var(--magenta), var(--red))';
    fill.style.boxShadow = '0 0 12px var(--red)';
  } else if (p > 40) {
    fill.style.background = 'linear-gradient(90deg, var(--cyan), var(--yellow))';
    fill.style.boxShadow = '0 0 12px var(--yellow)';
  } else {
    fill.style.background = 'linear-gradient(90deg, var(--cyan), var(--green))';
    fill.style.boxShadow = '0 0 12px var(--cyan)';
  }
}

function updateServerBars(pct) {
  const p = Math.min(100, pct);
  document.getElementById('srv-cpu').style.width = `${5 + p * 0.93}%`;
  document.getElementById('srv-ram').style.width = `${8 + p * 0.9}%`;
  document.getElementById('srv-net').style.width = `${3 + p * 0.95}%`;

  const ping = Math.round(12 + p * 98);
  const pingEl = document.getElementById('srv-ping');
  pingEl.textContent = `${ping}ms`;
  if (p > 70) {
    pingEl.style.color = 'var(--red)';
    pingEl.style.textShadow = '0 0 8px var(--red)';
  } else if (p > 40) {
    pingEl.style.color = 'var(--yellow)';
    pingEl.style.textShadow = '0 0 8px var(--yellow)';
  }

  document.getElementById('bak-loading').style.width = `${10 + p * 0.9}%`;

  if (p > 80) {
    const bc = document.getElementById('browser-content');
    bc.style.animation = 'shake 0.3s infinite';
    bc.style.filter = `blur(${(p - 80) * 0.08}px)`;
  }
}

// ── END GAME ──
function endGame(won) {
  clearInterval(timerInterval);
  challengeActive = false;

  if (won) {
    document.getElementById('browser-crash').classList.add('visible');
    setTimeout(() => {
      document.getElementById('final-score').textContent = score.toLocaleString();
      showScreen('screen-win');
      spawnSkullRain();
    }, 1200);
  } else {
    document.getElementById('final-score-lose').textContent = `${Math.round(progress)}%`;
    showScreen('screen-lose');
  }
}

// ── SKULL RAIN ──
function spawnSkullRain() {
  const rain = document.getElementById('skull-rain');
  rain.innerHTML = '';
  const emojis = ['💀', '👻', '☠️', '🕸️', '⚡'];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'skull-drop';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      el.style.animationDelay = `${Math.random() * 0.5}s`;
      el.style.fontSize = `${14 + Math.random() * 16}px`;
      rain.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 80);
  }
}

// ── BACK TO MENU ──
function confirmGoMenu() {
  if (confirm('Opravdu chceš opustit útok a vrátit se do menu?')) goMenu();
}

function goMenu() {
  clearInterval(timerInterval);
  progress = 0; combo = 1; score = 0;
  document.getElementById('timer').style.color = '';
  document.getElementById('timer').style.textShadow = '';
  document.getElementById('browser-content').style.filter = '';
  document.getElementById('browser-content').style.animation = '';
  showScreen('screen-menu');
}

// ── INIT ──
showScreen('screen-menu');

// ── MENU MOUSE PARALLAX + SPOTLIGHT ──
(function () {
  const spotlight  = document.getElementById('menu-spotlight');
  const grid       = document.getElementById('grid-overlay');
  const menuScreen = document.getElementById('screen-menu');

  let mx = window.innerWidth  / 2;
  let my = window.innerHeight / 2;
  let frame;

  function lerp(a, b, t) { return a + (b - a) * t; }

  let curX = mx, curY = my;

  function tick() {
    curX = lerp(curX, mx, 0.08);
    curY = lerp(curY, my, 0.08);

    const nx = curX / window.innerWidth;   // 0..1
    const ny = curY / window.innerHeight;  // 0..1

    // Spotlight follows cursor with smooth lag
    spotlight.style.background = `radial-gradient(
      560px circle at ${curX}px ${curY}px,
      rgba(0,245,255,0.09) 0%,
      rgba(255,0,204,0.05) 30%,
      transparent 65%
    )`;

    // Grid drifts slightly opposite to cursor (parallax)
    const shiftX = (nx - 0.5) * -18;
    const shiftY = (ny - 0.5) * -18;
    grid.style.backgroundPosition = `${shiftX}px ${shiftY}px`;

    // Hologram frame subtle 3D tilt
    const frame = document.querySelector('.hologram-frame');
    if (frame) {
      const rotY = (nx - 0.5) *  6;  // degrees
      const rotX = (ny - 0.5) * -5;
      frame.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    frame2 = requestAnimationFrame(tick);
  }

  let frame2;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  // Only run effect when on menu screen; pause otherwise
  const observer = new MutationObserver(() => {
    if (menuScreen.classList.contains('active')) {
      spotlight.style.opacity = '1';
      if (!frame2) frame2 = requestAnimationFrame(tick);
    } else {
      spotlight.style.opacity = '0';
      cancelAnimationFrame(frame2);
      frame2 = null;
      // Reset frame tilt
      const f = document.querySelector('.hologram-frame');
      if (f) f.style.transform = '';
      grid.style.backgroundPosition = '0px 0px';
    }
  });
  observer.observe(menuScreen, { attributes: true, attributeFilter: ['class'] });

  // Start immediately since menu is active on load
  spotlight.style.opacity = '1';
  frame2 = requestAnimationFrame(tick);
})();
