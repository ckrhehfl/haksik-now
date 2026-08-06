// 실시간 혼잡도 시뮬레이션 — 담당: 팀원1
// mockData의 hourly(11~17시 기준 혼잡도 곡선)를 축으로 값을 움직입니다.
//
// 실제 시각 기준으로 동작: 대기 줄이 "상태"로 남아서
// 1분마다 조리 속도만큼 빠져나가고, 가끔 새 주문이 들어와 늘어남.
// 우리 앱에서 실제 주문(localStorage "haksik_orders")이 생기면 그 식당 줄 +1.

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

// 운영시간(11~17시) 밖에서는 점심 피크 시각으로 간주합니다.
// 그러지 않으면 저녁·새벽 시연 때 모든 식당이 '여유'로만 보여 혼잡 화면을 못 보여줍니다.
const OPEN_HOUR = 11;
const CLOSE_HOUR = 17;
const DEMO_HOUR = 12.5; // 12:30 점심 피크

// 현재 시각을 소수 시(예: 12.5 = 12:30)로 반환
function hourFloat() {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= OPEN_HOUR && h <= CLOSE_HOUR ? h : DEMO_HOUR;
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

// 최신 스냅샷을 모듈에 보관 — 현황판과 상세 화면이 같은 값을 보도록 하기 위함.
// (화면마다 따로 계산하면 같은 식당이 한쪽은 '여유', 한쪽은 '혼잡'으로 갈립니다)
let liveList = null;

// 첫 렌더용 스냅샷: 현재 시각 기준값 ± 6, 줄은 혼잡도에 맞는 길이로 시작
export function initialSnapshot() {
  const h = hourFloat();
  liveList = restaurants.map((r) => {
    const c = clamp(baselineOf(r.hourly, h) + rand(-6, 6), 0, 100);
    const queueF = (profileOf(r).maxQueue * c) / 100;
    return finish(r, c, queueF);
  });
  return liveList;
}

// 특정 식당의 현재 실시간 값. 현황판을 거치지 않고 URL로 바로 들어와도 동작합니다.
export function liveRestaurant(id) {
  if (!liveList) initialSnapshot();
  return liveList.find((r) => r.id === id) ?? null;
}

// 틱(dtSec초)마다 호출. newOrders: { 식당id: 이번에 들어온 실제 주문 수 }
export function nextTick(prev, dtSec = 3, newOrders = {}) {
  const h = hourFloat();
  liveList = prev.map((r) => {
    const p = profileOf(r);
    const base = baselineOf(r.hourly, h);
    // 혼잡도: 기준값 쪽으로 30% 끌려가며 ±4 노이즈 (평균 회귀)
    const c = clamp(r.congestion + (base - r.congestion) * 0.3 + rand(-4, 4), 0, 100);

    // 대기 줄은 상태로 유지됨
    let queueF = r._queueF ?? r.waitingCount;
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

    return finish(r, c, queueF);
  });
  return liveList;
}

// 특정 식당의 현재 예상 대기 (주문 화면 등에서 표시용)
// 현재 시각의 시간대 혼잡도로 계산합니다.
export function estimateWait(restaurantId) {
  // 현황판이 보여주는 값과 어긋나지 않도록 실시간 스냅샷을 우선 사용합니다.
  const live = liveList?.find((x) => x.id === restaurantId);
  if (live) {
    return { waitingCount: live.waitingCount, waitMinutes: live.waitMinutes };
  }
  const r = restaurants.find((x) => x.id === restaurantId);
  if (!r) return null;
  const p = profileOf(r);
  const c = baselineOf(r.hourly, hourFloat());
  const queue = (p.maxQueue * c) / 100;
  return {
    waitingCount: Math.max(0, Math.round(queue)),
    waitMinutes: Math.max(0, Math.round(queue * p.minutesPerPerson)),
  };
}

// 시간대별(11~17시) 대기 인원·예상 대기시간 — 상세 화면 그래프용.
// hourly(혼잡도 0~100)를 매장 프로필(maxQueue, minutesPerPerson)로 인원/분으로 환산.
const HOURS = ["11시", "12시", "13시", "14시", "15시", "16시", "17시"];
// 점심 피크(12시·13시 = hourly 인덱스 1·2)는 항상 '혼잡'(🔴)으로 표시.
// congestionLevel 기준 '혼잡'은 혼잡도 ≥ 70 이므로 그 이상으로 끌어올림.
const LUNCH_HOURS = [1, 2];
const LUNCH_MIN_CONGESTION = 75;
export function hourlyLoad(restaurantId) {
  const r = restaurants.find((x) => x.id === restaurantId);
  if (!r) return null;
  const p = profileOf(r);
  const points = r.hourly.map((raw, i) => {
    // 점심시간엔 혼잡도 하한을 적용해 항상 붐비게(🔴) 보이도록 함
    const c = LUNCH_HOURS.includes(i) ? Math.max(raw, LUNCH_MIN_CONGESTION) : raw;
    const people = Math.round((p.maxQueue * c) / 100);
    return {
      hour: HOURS[i],
      congestion: c,
      people,
      minutes: Math.round(people * p.minutesPerPerson),
    };
  });
  // 대기 인원이 가장 많은 시간대(피크)
  let peakIndex = 0;
  points.forEach((pt, i) => {
    if (pt.people > points[peakIndex].people) peakIndex = i;
  });
  return { points, peakIndex };
}

// 주문 상태 추정 (시연용 타임라인, 경과 시간 기준)
// 접수(~30초) → 조리중(1분) → 조리완료(30초) → 완료된 주문
export function orderStatus(order) {
  const elapsedSec = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
  if (elapsedSec < 30) return { label: "주문 접수", color: "#2563eb", emoji: "🧾" };
  if (elapsedSec < 90) return { label: "조리중", color: "#f59e0b", emoji: "🍳" };
  if (elapsedSec < 120) return { label: "조리완료", color: "#22c55e", emoji: "🔔" };
  return { label: "완료된 주문", color: "#6b7280", emoji: "✅" };
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
