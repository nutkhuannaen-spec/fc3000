let ALL_WORDS = [];

const board = document.getElementById('board');
const shuffleBtn = document.getElementById('shuffleBtn');

async function loadWords() {
  try {
    const res = await fetch('words.json');
    ALL_WORDS = await res.json();
    renderRandomFive();
  } catch (err) {
    board.innerHTML = '<p style="color:#8a8a8a">Could not load words.json. Make sure it is in the same folder.</p>';
    console.error(err);
  }
}

function getRandomFive() {
  const pool = [...ALL_WORDS];
  const picked = [];
  const count = Math.min(5, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

function renderRandomFive() {
  const words = getRandomFive();
  board.innerHTML = '';
  words.forEach(w => board.appendChild(buildCard(w)));
}

function buildCard(w) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <span class="level">${w.level}</span>
        <div class="word">${w.word}</div>
        <div class="pos">${w.pos}</div>
      </div>
      <div class="card-face card-back">
        <div class="thai">${w.th}</div>
        <div class="example">${w.ex}</div>
      </div>
    </div>
  `;

  card.addEventListener('click', () => card.classList.toggle('flipped'));
  return card;
}

shuffleBtn.addEventListener('click', renderRandomFive);

loadWords();
