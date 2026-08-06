// 공용 목업 데이터 — 팀 전체가 이 파일을 import 해서 씁니다.
// ⚠️ 필드 이름(congestion, waitingCount, menus, price, soldOut 등)은 바꾸지 마세요.
//    메뉴는 실제 학식 메뉴(5개 점포 × 3개). 혼잡도/대기 값은 데모용 목업입니다.
//
// hourly: 11시~17시 시간대별 기준 혼잡도. 12시 점심 피크 → 오후 한산 → 17시 저녁 살짝 상승.
// congestion/waitingCount/waitMinutes 초기값은 "점심 피크(12:30) 스냅샷" 기준이며,
// 실시간 화면에서는 src/data/liveSim.js 가 이 곡선을 축으로 값을 움직입니다.

export const restaurants = [
  {
    id: "r1",
    name: "비비든든",
    congestion: 85, // 혼잡도 0~100 (클수록 붐빔)
    waitingCount: 30, // 현재 대기 인원(명)
    waitMinutes: 21, // 예상 대기 시간(분)
    hourly: [25, 92, 78, 40, 22, 18, 35], // 11시~17시 시간대별 혼잡도
    menus: [
      { id: "m1", name: "고기든든", price: 3900, soldOut: false },
      { id: "m2", name: "제육덮밥", price: 3900, soldOut: false },
      { id: "m3", name: "치킨마요", price: 3900, soldOut: false },
    ],
  },
  {
    id: "r2",
    name: "포포420",
    congestion: 64,
    waitingCount: 16,
    waitMinutes: 16,
    hourly: [18, 68, 60, 32, 18, 15, 30],
    menus: [
      { id: "m4", name: "포포쌀국수", price: 4500, soldOut: false },
      { id: "m5", name: "우삼겹쌀국수", price: 5900, soldOut: false },
      { id: "m6", name: "마라우삼겹쌀국수", price: 7400, soldOut: false },
    ],
  },
  {
    id: "r3",
    name: "경성카츠",
    congestion: 78,
    waitingCount: 16,
    waitMinutes: 22,
    hourly: [22, 85, 72, 38, 25, 20, 40],
    menus: [
      { id: "m7", name: "등김돈까스(L)", price: 6900, soldOut: false },
      { id: "m8", name: "경성치킨카레라이스", price: 6500, soldOut: false },
      { id: "m9", name: "고구마돈까스", price: 7900, soldOut: false },
    ],
  },
  {
    id: "r4",
    name: "비비고",
    congestion: 35,
    waitingCount: 6,
    waitMinutes: 4,
    hourly: [10, 38, 32, 20, 12, 10, 18],
    menus: [
      { id: "m10", name: "육회비빔밥", price: 5900, soldOut: false },
      { id: "m11", name: "연어비빔밥", price: 6900, soldOut: false },
      { id: "m12", name: "오색비빔밥", price: 5700, soldOut: false },
    ],
  },
  {
    id: "r5",
    name: "값찌개",
    congestion: 92,
    waitingCount: 24,
    waitMinutes: 22,
    hourly: [30, 95, 88, 50, 30, 22, 45],
    menus: [
      { id: "m13", name: "우삼겹 순두부찌개", price: 6500, soldOut: false },
      { id: "m14", name: "우삼겹 된장찌개", price: 6500, soldOut: false },
      { id: "m15", name: "돼지 김치찌개", price: 6500, soldOut: false },
    ],
  },
];

// 혼잡도 숫자 → 등급/색/이모지 로 바꿔주는 공용 함수 (모두 이걸 씁니다)
export function congestionLevel(c) {
  if (c < 40) return { label: "여유", color: "#22c55e", emoji: "🟢" };
  if (c < 70) return { label: "보통", color: "#f59e0b", emoji: "🟡" };
  return { label: "혼잡", color: "#ef4444", emoji: "🔴" };
}
