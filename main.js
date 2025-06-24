document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;

  const stage = parseInt(app.dataset.stage);
  const rows = parseInt(app.dataset.rows);
  const cols = parseInt(app.dataset.cols);
  const pairs = parseInt(app.dataset.pairs);

  const totalImages = 16; // 최대 이미지 개수 확장
  const images = Array.from({ length: totalImages }, (_, i) => `images/cat${i + 1}.png`);
  const selected = images.slice(0, pairs);
  const deck = shuffle([...selected, ...selected]).slice(0, rows * cols);

  let flipped = [];
  let matched = 0;
  let score = parseInt(localStorage.getItem('score') || '0');
  let timeLeft = stage === 4 ? 15 : 13;
  let canClick = false;

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
  grid.style.gap = '10px';
  grid.style.width = 'fit-content';
  grid.style.margin = '20px auto 0';
  grid.style.alignSelf = 'center';
  app.appendChild(grid);

  const timerWrap = document.createElement('div');
  timerWrap.id = 'timer';
  const timerBar = document.createElement('div');
  timerWrap.appendChild(timerBar);
  app.insertBefore(timerWrap, grid);

  deck.forEach((imgSrc) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.image = imgSrc;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-front';

    const back = document.createElement('div');
    back.className = 'card-back';
    back.style.backgroundImage = `url('${imgSrc}')`;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    card.addEventListener('click', () => flip(card));
    grid.appendChild(card);
  });

  const countdownTexts = ['준비!', '2', '1'];
let countdown = 0;

const countTimer = setInterval(() => {
  if (countdown < countdownTexts.length) {
    showToast(countdownTexts[countdown], 1000, 'count-toast');
    countdown++;
  } else {
    clearInterval(countTimer);
    canClick = true;
    startTimer();
  }
}, 1000);

  function startTimer() {
    const timer = setInterval(() => {
      timeLeft--;
      timerBar.style.width = (timeLeft * 10) + '%';
      if (timeLeft <= 0) {
        clearInterval(timer);
        showToast("시간 초과!");
        localStorage.setItem('score', score);
        setTimeout(() => {
          location.href = 'result_failed.html';
        }, 1500);
      }
    }, 1000);
  }

function flip(card) {
  // 이미 맞춘 카드거나, 지금 뒤집고 있는 중이면 무시
  if (!canClick || card.classList.contains('flipped') || flipped.includes(card)) return;

  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    const [a, b] = flipped;
    const image = a.dataset.image;

    if (image === b.dataset.image) {
      let bonus = 0;
      if (image.includes('cat1')) {
        bonus = 5;
        showToast('고양이 보너스 +5점!', 1500);
      }

      score += 10 + bonus;
      flipped = [];
      matched++;

      if (matched === pairs) {
        showToast(`${stage}단계 완료!`);
        localStorage.setItem('score', score);
        setTimeout(() => {
          if (stage < 4) {
            location.href = `stage${stage + 1}.html`;
          } else {
            location.href = 'result_successed.html';
          }
        }, 1500);
      }
    } else {
      score -= 1;
      const [cardA, cardB] = flipped;
      const currentFlipped = [...flipped]; // 잠깐 저장
      flipped = []; // 다음 카드 클릭 가능하게 초기화
      navigator.vibrate?.(100);
      setTimeout(() => {
        cardA.classList.remove('flipped');
        cardB.classList.remove('flipped');
      }, 800);
    }
  }
}

  function showToast(msg, duration = 1000, customClass = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${customClass}`.trim();
  toast.innerText = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

  function shuffle(arr) {
    return arr.sort(() => 0.5 - Math.random());
  }
});
