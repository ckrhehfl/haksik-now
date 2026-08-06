// 실시간 혼잡도 시뮬레이션 — 담당: 팀원1
// mockData의 hourly(11~17시 기준 혼잡도 곡선)를 축으로 값을 움직입니다.
//
// 두 가지 모드:
//  - "demo": 점심 피크(12:30) 고정. 시연용으로 값이 활발히 출렁임.
//  - "real": 실제 시각 기준. 대기 줄이 "상태"로 남아서
//            1분마다 조리 속도만큼 빠져나가고, 가끔 새 주문이 들어와 늘어남.
//            우리 앱에서 실제 주문(localStorage "haksik_orders")이 생기면 그 식당 줄 +1.

import { restaurants } from "./mockData";

// 매장별 운영 특성 — 대기 인원/시간 계산에 사용
// maxQueue: 혼잡도 100일 때 줄 서는 최대 인원, minutesPerPerson: 1명당 처리 시간(분)
const PROFILES = {
  r1: { maxQueue: 35, minutesPerPerson: 0.7 }, // 비비든든: 덮밥 위주, 회전 빠름
  r2: { maxQueue: 25, minutesPerPerson: 1.0 }, // 포포420: 쌀국수, 보통
  r3: { maxQueue: 20, minutesPerPerson: 1.4 }, // 경성카츠: 튀김 조리라 느림
  r4: { maxQueue: 18, minutesPerPerson: 0.6 }, // 비비고: 비빔밥, 회전 빠름
  r5: { maxQueue: 26, minutesPerPerson: 0.9 }, // 값찌개: 찌개 국물류
};
const DEFAULT_PROFILE = { maxQueue: 25, minutesPerPerson: 1.0 };
const profileOf = (r) => PROFILES[r.id] ?? DEFAULT_PROFILE;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

// 모드("demo"|"real")를 localStorage에 저장해 새로고침·화면 이동에도 유지.
// 기본값은 "real"(실제 시간).
const MODE_KEY = "haksik_mode";
export function getSavedMode() {
  return localStorage.getItem(MODE_KEY) === "demo" ? "demo" : "real";
}
export function saveMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
}

function hourFloatOf(mode) {
  if (mode === "demo") return 12.5; // 점심 피크 고정
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

// hourly 배열(인덱스 0=11시 … 6=17시)을 현재 시각으로 선형 보간한 기준 혼잡도
function baselineOf(hourly, hourFloat) {
  const t = clamp(hourFloat, 11, 17) - 11; // 0~6
  const i = Math.min(5, Math.floor(t));
  const frac = t - i;
  return hourly[i] * (1 - frac) + hourly[i + 1] * frac;
}

// 내부 상태(_queueF: 소수점 대기 인원)를 표시용 필드로 마무리
function finish(r, congestion, queueF) {
  const p = profileOf(r);
  return {
    ...r,
    congestion: Math.round(congestion),
    _queueF: queueF,
    waitingCount: Math.max(0, Math.round(queueF)),
    waitMinutes: Math.max(0, Math.round(queueF * p.minutesPerPerson)),
  };
}

// 첫 렌더용 스냅샷: 현재 시각 기준값 ± 6, 줄은 혼잡도에 맞는 길이로 시작
export function initialSnapshot(mode) {
  const h = hourFloatOf(mode);
  return restaurants.map((r) => {
    const c = clamp(baselineOf(r.hourly, h) + rand(-6, 6), 0, 100);
    const queueF = (profileOf(r).maxQueue * c) / 100;
    return finish(r, c, queueF);
  });
}

// 틱(dtSec초)마다 호출. newOrders: { 식당id: 이번에 들어온 실제 주문 수 }
export function nextTick(prev, mode, dtSec = 3, newOrders = {}) {
  const h = hourFloatOf(mode);
  return prev.map((r) => {
    const p = profileOf(r);
    const base = baselineOf(r.hourly, h);
    // 혼잡도: 기준값 쪽으로 30% 끌려가며 ±4 노이즈 (평균 회귀)
    const c = clamp(r.congestion + (base - r.congestion) * 0.3 + rand(-4, 4), 0, 100);

    let queueF;
    if (mode === "demo") {
      // 시연용: 혼잡도에서 곧바로 계산 + ±1명 잔떨림
      queueF = (p.maxQueue * c) / 100 + rand(-1, 1);
    } else {
      // 실제 시간: 줄이 상태로 유지됨
      queueF = r._queueF ?? r.waitingCount;
      // ① 조리 속도만큼 빠져나감 (예: 1인당 1분이면 1분에 1명)
      const served = dtSec / 60 / p.minutesPerPerson;
      queueF = Math.max(0, queueF - served);
      // ② 가끔 새 손님 도착 — 혼잡도 대비 줄이 짧으면 도착 확률↑ (균형 유지)
      const target = (p.maxQueue * c) / 100;
      const arriveChance = served * clamp((2 * target - queueF) / Math.max(target, 1), 0.2, 2);
      if (Math.random() < arriveChance) queueF += Math.random() < 0.25 ? 2 : 1;
      // ③ 우리 앱에서 실제 주문이 발생하면 그만큼 줄 +
      queueF += newOrders[r.id] ?? 0;
      queueF = Math.min(queueF, p.maxQueue + 8);
    }
    return finish(r, c, queueF);
  });
}

// 특정 식당의 현재 예상 대기 (주문 화면 등에서 표시용)
// 저장된 모드 기준의 시간대 혼잡도로 계산합니다.
export function estimateWait(restaurantId) {
  const r = restaurants.find((x) => x.id === restaurantId);
  if (!r) return null;
  const p = profileOf(r);
  const c = baselineOf(r.hourly, hourFloatOf(getSavedMode()));
  const queue = (p.maxQueue * c) / 100;
  return {
    waitingCount: Math.max(0, Math.round(queue)),
    waitMinutes: Math.max(0, Math.round(queue * p.minutesPerPerson)),
  };
}

// 주문 상태 추정: 경과 시간 + 매장 조리 속도(1인분당 분) × 수량
// 접수(1분 미만) → 조리중 → 픽업 대기
export function orderStatus(order) {
  const r = restaurants.find((x) => x.id === order.restaurantId);
  const p = r ? profileOf(r) : DEFAULT_PROFILE;
  const qty = order.items?.reduce((s, i) => s + i.qty, 0) ?? 1;
  const cookMinutes = Math.max(2, qty * p.minutesPerPerson);
  const elapsedMin = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  if (elapsedMin < 1) return { label: "주문 접수", color: "#2563eb", emoji: "🧾" };
  if (elapsedMin < 1 + cookMinutes)
    return { label: "조리중", color: "#f59e0b", emoji: "🍳" };
  return { label: "픽업 대기", color: "#22c55e", emoji: "🔔" };
}

// localStorage "haksik_orders"에서 식당별 주문 개수를 세어줌
function countOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem("haksik_orders") ?? "[]");
    const counts = {};
    for (const o of orders) counts[o.restaurantId] = (counts[o.restaurantId] ?? 0) + 1;
    return counts;
  } catch {
    return {};
  }
}

// 마지막 확인 이후 새로 들어온 주문 수를 식당별로 돌려줌.
// 화면(컴포넌트)이 아니라 모듈에 기준점을 두므로,
// 주문 화면에 다녀와서 현황판이 다시 열려도 그 사이 주문을 놓치지 않습니다.
let seenOrderCounts = countOrders(); // 앱 시작 시점의 주문은 이미 반영된 것으로 간주

export function takeNewOrders() {
  const now = countOrders();
  const diff = {};
  for (const id of Object.keys(now)) {
    const d = now[id] - (seenOrderCounts[id] ?? 0);
    if (d > 0) diff[id] = d;
  }
  seenOrderCounts = now;
  return diff;
}
