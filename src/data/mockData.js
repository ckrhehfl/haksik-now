// 공용 목업 데이터 — 팀 전체가 이 파일을 import 해서 씁니다.
// ⚠️ 필드 이름(congestion, waitingCount, menus, price, soldOut 등)은 바꾸지 마세요.
//    식당/메뉴를 추가하는 건 OK (형식만 지키면).

export const restaurants = [
  {
    id: "r1",
    name: "학생식당",
    congestion: 35, // 혼잡도 0~100 (클수록 붐빔)
    waitingCount: 8, // 현재 대기 인원(명)
    waitMinutes: 5, // 예상 대기 시간(분)
    hourly: [10, 25, 45, 85, 70, 40, 20], // 11시~17시 시간대별 혼잡도
    menus: [
      { id: "m1", name: "제육덮밥", price: 4500, soldOut: false },
      { id: "m2", name: "김치찌개", price: 4000, soldOut: false },
      { id: "m3", name: "돈까스", price: 5000, soldOut: true },
    ],
  },
  {
    id: "r2",
    name: "교직원식당",
    congestion: 72,
    waitingCount: 20,
    waitMinutes: 15,
    hourly: [20, 40, 70, 90, 80, 50, 30],
    menus: [
      { id: "m4", name: "비빔밥", price: 5500, soldOut: false },
      { id: "m5", name: "된장찌개", price: 4500, soldOut: false },
    ],
  },
  {
    id: "r3",
    name: "기숙사식당",
    congestion: 18,
    waitingCount: 3,
    waitMinutes: 2,
    hourly: [30, 20, 25, 40, 35, 30, 25],
    menus: [
      { id: "m6", name: "라면", price: 3000, soldOut: false },
      { id: "m7", name: "치킨마요덮밥", price: 4800, soldOut: false },
    ],
  },
];

// 혼잡도 숫자 → 등급/색/이모지 로 바꿔주는 공용 함수 (모두 이걸 씁니다)
export function congestionLevel(c) {
  if (c < 40) return { label: "여유", color: "#22c55e", emoji: "🟢" };
  if (c < 70) return { label: "보통", color: "#f59e0b", emoji: "🟡" };
  return { label: "혼잡", color: "#ef4444", emoji: "🔴" };
}
