// 공용 목업 데이터 — 팀 전체가 이 파일을 import 해서 씁니다.
// ⚠️ 필드 이름(congestion, waitingCount, menus, price, soldOut 등)은 바꾸지 마세요.
//    메뉴는 실제 학식 메뉴(5개 점포 × 3개). 혼잡도/대기 값은 데모용 목업입니다.

export const restaurants = [
  {
    id: "r1",
    name: "비비든든",
    congestion: 35, // 혼잡도 0~100 (클수록 붐빔)
    waitingCount: 8, // 현재 대기 인원(명)
    waitMinutes: 5, // 예상 대기 시간(분)
    hourly: [10, 25, 45, 85, 70, 40, 20], // 11시~17시 시간대별 혼잡도
    menus: [
      { id: "m1", name: "고기든든", price: 3900, soldOut: false },
      { id: "m2", name: "제육덮밥", price: 3900, soldOut: false },
      { id: "m3", name: "치킨마요", price: 3900, soldOut: false },
    ],
  },
  {
    id: "r2",
    name: "포포420",
    congestion: 72,
    waitingCount: 20,
    waitMinutes: 15,
    hourly: [20, 40, 70, 90, 80, 50, 30],
    menus: [
      { id: "m4", name: "포포쌀국수", price: 4500, soldOut: false },
      { id: "m5", name: "우삼겹쌀국수", price: 5900, soldOut: false },
      { id: "m6", name: "마라우삼겹쌀국수", price: 7400, soldOut: false },
    ],
  },
  {
    id: "r3",
    name: "경성카츠",
    congestion: 55,
    waitingCount: 14,
    waitMinutes: 10,
    hourly: [15, 35, 60, 80, 65, 45, 25],
    menus: [
      { id: "m7", name: "등김돈까스(L)", price: 6900, soldOut: false },
      { id: "m8", name: "경성치킨카레라이스", price: 6500, soldOut: false },
      { id: "m9", name: "고구마돈까스", price: 7900, soldOut: false },
    ],
  },
  {
    id: "r4",
    name: "비비고",
    congestion: 18,
    waitingCount: 3,
    waitMinutes: 2,
    hourly: [30, 20, 25, 40, 35, 30, 25],
    menus: [
      { id: "m10", name: "육회비빔밥", price: 5900, soldOut: false },
      { id: "m11", name: "연어비빔밥", price: 6900, soldOut: false },
      { id: "m12", name: "오색비빔밥", price: 5700, soldOut: false },
    ],
  },
  {
    id: "r5",
    name: "값찌개",
    congestion: 88,
    waitingCount: 25,
    waitMinutes: 20,
    hourly: [25, 50, 80, 95, 85, 60, 35],
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
