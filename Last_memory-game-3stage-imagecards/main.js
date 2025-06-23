
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;

  const stage = parseInt(app.dataset.stage);
  const rows = parseInt(app.dataset.rows);
  const cols = parseInt(app.dataset.cols);
  const pairs = parseInt(app.dataset.pairs);
  const images = Array.from({ length: 6 }, (_, i) => `images/cat${i + 1}.png`);

  const selected = images.slice(0, pairs);
  const deck = shuffle([...selected, ...selected]).slice(0, rows * cols);
  let flipped = [];
  let matched = 0;
  let score = 0;
  let timeLeft = stage === 3 ? 10 : 10; // ✅ 여기로 변경
  let canClick = false;

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
  grid.style.gap = '10px 10px'; // 세로/가로 간격 통합
  grid.style.justifyContent = 'center';
  grid.style.margin = '0 auto';
  grid.style.width = '100%'; // 전체 너비
  grid.style.maxWidth = `${cols * 80 + (cols - 1) * 10}px`; // 카드 개수 기준 최대 폭
  grid.style.marginTop = '20px'; // ✅ 화면 상단과 약간의 간격 추가 (선택)
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

  let countdown = 3;
  const countEl = document.createElement('h1');
  countEl.innerText = countdown;
  app.insertBefore(countEl, timerWrap);

  const countTimer = setInterval(() => {
    countdown--;
    countEl.innerText = countdown;
    if (countdown < 0) {
      clearInterval(countTimer);
      countEl.remove();
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
        localStorage.setItem('score', score);  // ✅ 점수 저장 추가
        setTimeout(() => {
          location.href = 'result_failed.html';
        }, 1500);
      }
    }, 1000);
  }

  function flip(card) {
  if (!canClick) return;
  if (card.classList.contains('flipped') || flipped.length === 2) return;

  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    const [a, b] = flipped;
    if (a.dataset.image === b.dataset.image) {
      score += 10;  // ✅ 성공 시 +10점
      flipped = [];
      matched++;
      if (matched === pairs) {
        showToast(stage + "단계 완료!");
        localStorage.setItem('score', score);  // ✅ 점수 저장
        setTimeout(() => {
          location.href = stage < 3 ? `stage${stage + 1}.html` : 'result_successed.html';
        }, 1500);
      }
    } else {
      score -= 1;  // ✅ 실패 시 -1점
      navigator.vibrate?.(100);
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flipped = [];
      }, 800);
    }
  }
}

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1000);
  }

  function shuffle(arr) {
    return arr.sort(() => 0.5 - Math.random());
  }
});
