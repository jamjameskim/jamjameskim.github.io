document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;

  const stage = parseInt(app.dataset.stage);
  const rows = parseInt(app.dataset.rows);
  const cols = parseInt(app.dataset.cols);
  const pairs = parseInt(app.dataset.pairs);

  const totalImages = 16;
  const images = Array.from({ length: totalImages }, (_, i) => `images/cat${i + 1}.png`);
  const selected = images.slice(0, pairs);
  const deck = shuffle([...selected, ...selected]).slice(0, rows * cols);

  let flipped = [];
  let matched = 0;
  let score;
  if (stage === 1) {
    localStorage.setItem('score', '0'); // 초기화
    score = 0;
  } else {
    score = parseInt(localStorage.getItem('score') || '0');
  }
  let canClick = false;
  let timeLeft;
  let totalTime;
  let timerInterval;

  if (stage === 4) timeLeft = 15;
  else if (stage === 3) timeLeft = 13;
  else timeLeft = 10;
  totalTime = timeLeft;

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
  grid.style.gap = '10px';
  grid.style.width = 'fit-content';
  grid.style.margin = '20px auto 0';
  grid.style.alignSelf = 'center';

  // 반응형 처리 함수
  function updateGridLayout() {
    if (window.innerWidth <= 350) {
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      grid.style.width = '100%';
      grid.style.maxWidth = '100vw';
    } else {
      grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
      grid.style.width = 'fit-content';
      grid.style.maxWidth = 'none';
      grid.style.padding = '0';
    }
  }

  // 초기 실행 및 리사이즈 이벤트 리스너
  updateGridLayout();
  window.addEventListener('resize', updateGridLayout);

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

  const countdownTexts = ['준비!', '시작!'];
  let countdown = 0;

  const countTimer = setInterval(() => {
    if (countdown < countdownTexts.length) {
      if (countdownTexts[countdown] === '시작!') {
        canClick = true;
        startTimer();
      }
      showToast(countdownTexts[countdown], 1000, 'count-toast');
      countdown++;
    } else {
      clearInterval(countTimer);
    }
  }, 1000);

  function flip(card) {
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
          clearInterval(timerInterval);
          canClick = false;
          showToast(`${stage}단계 완료!`);
          localStorage.setItem('score', score);
          localStorage.setItem('cat-game-score', score);
          setTimeout(() => {
            location.href = stage < 4 ? `stage${stage + 1}.html` : 'result_successed.html';
          }, 1500);
        }
      } else {
        score -= 1;
        const [cardA, cardB] = flipped;
        flipped = [];
        navigator.vibrate?.(100);
        setTimeout(() => {
          cardA.classList.remove('flipped');
          cardB.classList.remove('flipped');
        }, 800);
      }
    }
  }

  function startTimer() {
    updateProgress();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateProgress();

      if (timeLeft < 0) {
        clearInterval(timerInterval);
        canClick = false;
        showToast('시간 초과!');
        localStorage.setItem('score', score);
        setTimeout(() => {
          location.href = 'result_failed.html';
        }, 2000);
      }
    }, 1000);
  }

  function updateProgress() {
    const percentage = Math.max(0, (timeLeft / totalTime) * 100);
    timerBar.style.width = `${percentage}%`;

    if (timeLeft <= 3) {
      timerWrap.classList.add('warning');
    } else {
      timerWrap.classList.remove('warning');
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
