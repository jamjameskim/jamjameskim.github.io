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
  let score = parseInt(localStorage.getItem('score') || '0');
  let canClick = false;
  let timeLeft;
  let totalTime;
  let timerInterval;  // 전역 타이머 변수 선언

  // 스테이지별 제한 시간 설정
  if (stage === 4) {
    timeLeft = 15;
  } else if (stage === 3) {
    timeLeft = 13;
  } else {
    timeLeft = 10;
  }
  totalTime = timeLeft;

  // 카드판(Grid) 생성
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
  grid.style.gap = '10px';
  grid.style.width = 'fit-content';
  grid.style.margin = '20px auto 0';
  grid.style.alignSelf = 'center';
  app.appendChild(grid);

  // 타이머 바 생성
  const timerWrap = document.createElement('div');
  timerWrap.id = 'timer';
  const timerBar = document.createElement('div');
  timerWrap.appendChild(timerBar);
  app.insertBefore(timerWrap, grid);

  // 카드 생성 및 배치
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

 // 카운트다운 ("준비!" → "시작!")
const countdownTexts = ['준비!', '시작!'];
let countdown = 0;

const countTimer = setInterval(() => {
  if (countdown < countdownTexts.length) {
    // 시작!이 뜨는 순간에 클릭 허용 + 타이머 시작
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

  // 카드 클릭 처리
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

        // 게임 성공 시 타이머 정지
        if (matched === pairs) {
          clearInterval(timerInterval);  // 타이머 중지
          showToast(`${stage}단계 완료!`);
          localStorage.setItem('score', score);
          setTimeout(() => {
            location.href = stage < 4 ? `stage${stage + 1}.html` : 'result_successed.html';
          }, 1500);
        }
      } else {
        score -= 1;
        const [cardA, cardB] = flipped;
        flipped = []; // 다음 카드 선택 허용
        navigator.vibrate?.(100);
        setTimeout(() => {
          cardA.classList.remove('flipped');
          cardB.classList.remove('flipped');
        }, 800);
      }
    }
  }

  // 타이머 시작
  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      const percentage = (timeLeft / totalTime) * 100;
      timerBar.style.width = `${percentage}%`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showToast("시간 초과!");
        localStorage.setItem('score', score);
        setTimeout(() => {
          location.href = 'result_failed.html';
        }, 1500);
      }
    }, 1000);
  }

  // 토스트 메시지 표시
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

  // 카드 섞기
  function shuffle(arr) {
    return arr.sort(() => 0.5 - Math.random());
  }
});
