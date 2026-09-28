const missions = [
  { title: "선물상자 1회 참여", meta: "약 30초 · 즉시 적립", reward: "10원", count: 1 },
  { title: "포인트 광고 2개 완료", meta: "가입 없음 · 즉시 적립", reward: "30원", count: 2 },
  { title: "인기 광고 3개 완료", meta: "완료율 높은 광고", reward: "50원", count: 3 },
  { title: "추천 광고 4개 완료", meta: "이번 주 추천 미션", reward: "100원", count: 4 }
];
const offerPool = [
  { icon: "🎮", title: "퍼즐 게임 1회 플레이", meta: "약 1분 · 가입 없음", reward: "12원" },
  { icon: "🧩", title: "블록 맞추기 챌린지", meta: "약 30초 · 즉시 적립", reward: "10원" },
  { icon: "🎡", title: "오늘의 룰렛 참여", meta: "약 20초 · 가입 없음", reward: "8원" },
  { icon: "🗺️", title: "지도에서 장소 찾기", meta: "약 1분 · 즉시 적립", reward: "11원" },
  { icon: "🪜", title: "황금 사다리 타기", meta: "약 30초 · 즉시 적립", reward: "10원" }
];

let missionProgress = [0, 0, 0, 0];
let completedOffers = missions.map(() => new Set());
let currentView = "home";
let previousView = "home";
let activeMissionIndex = 0;
const $ = (id) => document.getElementById(id);
const completedCount = () => missionProgress.filter((value, index) => value >= missions[index].count).length;
const firstIncomplete = () => missions.findIndex((mission, index) => missionProgress[index] < mission.count);

function render() {
  const doneCount = completedCount();
  const percent = doneCount * 25;
  const recommendedIndex = firstIncomplete();
  $("navBadge").textContent = `${doneCount}/4`;
  $("weeklyCount").textContent = `${doneCount}/4 완료`;
  $("weeklyProgress").style.width = `${percent}%`;
  $("summaryMessage").textContent = doneCount === 4 ? "이번 주 미션을 모두 완료했어요" : `원하는 미션부터 참여해 ${4 - doneCount}개를 더 완료해보세요`;
  const heroProgress = $("heroProgress");

  if (doneCount === 0) {
    $("heroEyebrow").textContent = "첫 미션으로 추천해요";
    $("heroTitle").innerHTML = "선물상자 참여하고 <strong>10원 받기</strong>";
    $("heroDescription").textContent = "약 30초 · 즉시 적립 · 다른 미션도 자유롭게 선택 가능";
    $("startMissionButton").textContent = "바로 참여하기";
    heroProgress.hidden = true;
  } else if (doneCount < 4) {
    const next = missions[recommendedIndex];
    $("heroEyebrow").textContent = "추천 미션 · 순서 없이 참여 가능";
    $("heroTitle").innerHTML = `${next.title}에 도전하고 <strong>${next.reward} 받기</strong>`;
    $("heroDescription").textContent = next.count > 1 ? `대상 광고 목록에서 ${next.count}개를 골라 참여해보세요` : next.meta;
    $("startMissionButton").textContent = next.count > 1 ? "대상 광고 보기" : "추천 미션 참여하기";
    $("heroProgressText").textContent = `${doneCount}/4`;
    $("heroProgressBar").style.width = `${percent}%`;
    heroProgress.hidden = false;
  } else {
    $("heroEyebrow").textContent = "주간 미션 완료";
    $("heroTitle").innerHTML = "보너스 <strong>1,000원이 적립됐어요</strong>";
    $("heroDescription").textContent = "이번 주 모든 미션을 완료했어요";
    $("startMissionButton").textContent = "적립 내역 보기";
    $("heroProgressText").textContent = "4/4";
    $("heroProgressBar").style.width = "100%";
    heroProgress.hidden = false;
  }

  const next = missions[recommendedIndex < 0 ? 3 : recommendedIndex];
  $("nextEyebrow").textContent = doneCount === 4 ? "모든 미션 완료" : "추천 미션 · 원하는 미션부터 참여 가능";
  $("nextTitle").textContent = doneCount < 4 ? next.title : "주간 보너스 적립 완료";
  $("nextMeta").textContent = doneCount < 4 ? next.meta : "이번 주에도 참여해주셔서 감사해요";
  $("nextReward").textContent = doneCount < 4 ? next.reward : "1,000원";
  $("weeklyStartButton").textContent = doneCount < 4 ? (next.count > 1 ? "대상 광고 보기" : `참여하고 ${next.reward} 받기`) : "적립 내역 보기";

  $("missionList").innerHTML = missions.map((mission, index) => {
    const done = missionProgress[index] >= mission.count;
    const progress = missionProgress[index];
    return `<article class="mission-item ${done ? "is-done" : ""}"><span class="mission-status">${done ? "✓" : index + 1}</span><div><h3>${mission.title}</h3><p>${done ? `${mission.reward} 적립 완료` : `${progress}/${mission.count} 완료 · ${mission.meta}`}</p></div><button data-mission="${index}">${done ? "완료" : mission.count > 1 ? "목록" : "참여"}</button></article>`;
  }).join("");
  document.querySelectorAll(".state-button").forEach((button) => button.classList.toggle("is-active", Number(button.dataset.state) === doneCount));
}

function switchView(view) {
  if (view === "filtered") previousView = currentView;
  currentView = view;
  $("homeView").classList.toggle("is-active", view === "home");
  $("weeklyView").classList.toggle("is-active", view === "weekly");
  $("offerListView").classList.toggle("is-active", view === "filtered");
  $("pageTitle").textContent = view === "home" ? "무신사머니 포인트 모으기" : view === "weekly" ? "주간 미션" : "미션 대상 광고";
}

function openOfferList(index) {
  activeMissionIndex = index;
  const mission = missions[index];
  $("filteredTitle").textContent = mission.title;
  $("filteredDescription").textContent = `원하는 광고를 선택해 총 ${mission.count}개를 완료하면 미션이 달성돼요.`;
  renderOfferList();
  switchView("filtered");
}

function renderOfferList() {
  const mission = missions[activeMissionIndex];
  const progress = missionProgress[activeMissionIndex];
  $("filteredProgressText").textContent = `${progress}/${mission.count} 완료`;
  $("filteredProgressBar").style.width = `${Math.min(100, progress / mission.count * 100)}%`;
  $("filteredOfferList").innerHTML = offerPool.map((offer, index) => {
    const done = completedOffers[activeMissionIndex].has(index);
    return `<button class="filtered-offer" data-offer="${index}" ${done ? "disabled" : ""}><span class="filtered-offer-icon">${done ? "✓" : offer.icon}</span><span class="filtered-offer-copy"><b>${offer.title}</b><span>${done ? "참여 완료" : offer.meta}</span></span><span class="filtered-offer-reward"><strong>${offer.reward}</strong><small>${done ? "적립" : "받기"}</small></span></button>`;
  }).join("");
}

function openMission(index = firstIncomplete()) {
  if (index < 0) return showToast("보너스 1,000원이 적립됐어요");
  activeMissionIndex = index;
  const mission = missions[index];
  if (mission.count > 1) return openOfferList(index);
  $("modalTitle").textContent = mission.title;
  $("completeMissionButton").textContent = `${mission.reward} 받고 완료하기`;
  $("missionModal").hidden = false;
}
function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("is-visible");
  window.setTimeout(() => $("toast").classList.remove("is-visible"), 2200);
}
function setDemoState(count) {
  missionProgress = count === 0 ? [0, 0, 0, 0] : count === 2 ? [1, 2, 0, 0] : [1, 2, 3, 4];
  completedOffers = missions.map((mission, index) => new Set(offerPool.slice(0, missionProgress[index]).map((_, offerIndex) => offerIndex)));
  switchView("home");
  render();
}

$("weeklyNav").addEventListener("click", () => switchView("weekly"));
$("openWeeklyButton").addEventListener("click", () => switchView("weekly"));
$("backButton").addEventListener("click", () => switchView(currentView === "filtered" ? previousView : "home"));
$("startMissionButton").addEventListener("click", () => openMission(firstIncomplete()));
$("weeklyStartButton").addEventListener("click", () => openMission(firstIncomplete()));
$("modalClose").addEventListener("click", () => $("missionModal").hidden = true);
$("missionModal").addEventListener("click", (event) => { if (event.target === $("missionModal")) $("missionModal").hidden = true; });
$("completeMissionButton").addEventListener("click", () => {
  const mission = missions[activeMissionIndex];
  missionProgress[activeMissionIndex] = mission.count;
  $("missionModal").hidden = true;
  render();
  showToast(`${mission.reward}이 적립됐어요 · 주간 미션 ${completedCount()}/4`);
});
document.querySelectorAll(".state-button").forEach((button) => button.addEventListener("click", () => setDemoState(Number(button.dataset.state))));
$("missionList").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mission]");
  if (!button || button.textContent === "완료") return;
  openMission(Number(button.dataset.mission));
});
$("filteredOfferList").addEventListener("click", (event) => {
  const offerButton = event.target.closest("button[data-offer]");
  if (!offerButton || offerButton.disabled) return;
  const offerIndex = Number(offerButton.dataset.offer);
  const offer = offerPool[offerIndex];
  const mission = missions[activeMissionIndex];
  completedOffers[activeMissionIndex].add(offerIndex);
  missionProgress[activeMissionIndex] = Math.min(mission.count, completedOffers[activeMissionIndex].size);
  renderOfferList();
  render();
  showToast(`${offer.reward}이 적립됐어요 · ${missionProgress[activeMissionIndex]}/${mission.count} 완료`);
  if (missionProgress[activeMissionIndex] >= mission.count) {
    window.setTimeout(() => { switchView(previousView); showToast(`${mission.title} 미션을 완료했어요`); }, 900);
  }
});
render();
