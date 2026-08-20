let ALL_WORDS = [];

const board = document.getElementById('board');
const shuffleBtn = document.getElementById('shuffleBtn');
const recallBtn = document.getElementById('recallBtn');
const subtitle = document.querySelector('.subtitle');

const STORAGE_KEY = 'vocab_studied_words';
const studiedWords = loadStudied();

function loadStudied() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (err) {
    return new Set();
  }
}

function markStudied(word) {
  studiedWords.add(word.toLowerCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...studiedWords]));
  updateRecallLabel();
}

function updateRecallLabel() {
  recallBtn.textContent = `Recall words (${studiedWords.size})`;
}

async function loadWords() {
  try {
    const res = await fetch('words.json');
    ALL_WORDS = await res.json();
    updateRecallLabel();
    renderRandomFive();
  } catch (err) {
    board.innerHTML = '<p style="color:#8a8a8a">Could not load words.json. Make sure it is in the same folder.</p>';
    console.error(err);
  }
}

function getRandomN(source, n) {
  const pool = [...source];
  const picked = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

function renderRandomFive() {
  subtitle.textContent = 'Oxford 3000 — Random 5';
  const words = getRandomN(ALL_WORDS, 5);
  board.innerHTML = '';
  words.forEach(w => board.appendChild(buildCard(w)));
}

function renderRecall() {
  const pool = ALL_WORDS.filter(w => studiedWords.has(w.word.toLowerCase()));

  if (pool.length === 0) {
    subtitle.textContent = 'Recall';
    board.innerHTML = '<p style="color:#8a8a8a">You haven\'t reviewed any words yet. Flip a card to start building your recall list.</p>';
    return;
  }

  subtitle.textContent = `Recall — ${Math.min(20, pool.length)} of ${pool.length} reviewed`;
  const words = getRandomN(pool, 20);
  board.innerHTML = '';
  words.forEach(w => board.appendChild(buildCard(w)));
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  speechSynthesis.speak(utter);
}

function buildCard(w) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <span class="level">${w.level}</span>
        <button type="button" class="speak-btn" aria-label="Play pronunciation">🔊</button>
        <div class="word">${w.word}</div>
        ${w.pron ? `<div class="pron">${w.pron}</div>` : ''}
        <div class="pos">${w.pos}</div>
      </div>
      <div class="card-face card-back">
        <div class="thai">${w.th}</div>
        <div class="example">${w.ex}</div>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    if (card.classList.contains('flipped')) {
      markStudied(w.word);
    }
  });

  card.querySelector('.speak-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    speak(w.word);
  });

  return card;
}

shuffleBtn.addEventListener('click', renderRandomFive);
recallBtn.addEventListener('click', renderRecall);

loadWords();
