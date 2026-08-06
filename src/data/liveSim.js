// 실시간 혼잡도 시뮬레이션 — 담당: 팀원1
// mockData의 hourly(11~17시 기준 혼잡도 곡선)를 축으로,
// 현재 시각의 기준값 주변에서 자연스럽게 출렁이는 값을 만듭니다.
// (순수 랜덤이 아니라 "기준값으로 끌려가는 평균 회귀 + 소량의 노이즈")

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

// 점심시간이 아니어도 시연 화면이 살아있어 보이도록 12:30 기준으로 고정.
// 실제 시각을 따라가게 하려면 false로 바꾸세요. (오후 4시엔 대부분 '여유'가 정상)
export const FORCE_LUNCH_DEMO = true;

function currentHourFloat() {
  if (FORCE_LUNCH_DEMO) return 12.5;
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// hourly 배열(인덱스 0=11시 … 6=17시)을 현재 시각으로 선형 보간한 기준 혼잡도
function baselineOf(hourly, hourFloat) {
  const t = clamp(hourFloat, 11, 17) - 11; // 0~6
  const i = Math.min(5, Math.floor(t));
  const frac = t - i;
  return hourly[i] * (1 - frac) + hourly[i + 1] * frac;
}

// 혼잡도 → 대기 인원/시간 (매장 특성 반영, 인원은 ±1명 잔떨림)
function derive(r, congestion) {
  const p = PROFILES[r.id] ?? DEFAULT_PROFILE;
  const jitter = Math.floor(Math.random() * 3) - 1;
  const waitingCount = clamp(
    Math.round((p.maxQueue * congestion) / 100) + jitter,
    0,
    p.maxQueue + 5
  );
  const waitMinutes = Math.round(waitingCount * p.minutesPerPerson);
  return { ...r, congestion: Math.round(congestion), waitingCount, waitMinutes };
}

// 첫 렌더용 스냅샷: 현재 시각 기준값 ± 6
export function initialSnapshot() {
  const h = currentHourFloat();
  return restaurants.map((r) => {
    const c = clamp(baselineOf(r.hourly, h) + (Math.random() * 12 - 6), 0, 100);
    return derive(r, c);
  });
}

// 틱(3초)마다: 기준값 쪽으로 30% 끌려가면서 ±4 노이즈
export function nextTick(prev) {
  const h = currentHourFloat();
  return prev.map((r) => {
    const base = baselineOf(r.hourly, h);
    const pulled = r.congestion + (base - r.congestion) * 0.3;
    const c = clamp(pulled + (Math.random() * 8 - 4), 0, 100);
    return derive(r, c);
  });
}
