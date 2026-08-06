// 주문 저장 — 담당: 팀원1
// 결제가 끝나기 전까지는 "대기 주문"으로만 들고 있다가, 결제 성공 시점에 주문 내역으로 확정합니다.
// 그래야 결제 화면에서 뒤로 가기를 눌렀을 때 주문하지 않은 건이 내역에 남지 않습니다.
//
// localStorage 키
//   "haksik_orders"        : 확정된 주문 배열 (00-공용규칙.md 3번 형식)
//   "haksik_last_order"    : 방금 확정된 주문번호(문자열)
//   "haksik_pending_order" : 결제 대기 중인 주문 1건 (결제 성공/이탈 시 사라짐)

const ORDERS_KEY = "haksik_orders";
const LAST_KEY = "haksik_last_order";
const PENDING_KEY = "haksik_pending_order";

export function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// 주문 객체 생성 (아직 저장하지 않음)
export function makeOrder({ restaurantId, restaurantName, items, total }) {
  return {
    orderNo: "A" + Date.now().toString().slice(-4),
    restaurantId,
    restaurantName,
    items,
    total,
    createdAt: new Date().toISOString(),
  };
}

export function setPendingOrder(order) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(order));
}

export function getPendingOrder() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function clearPendingOrder() {
  localStorage.removeItem(PENDING_KEY);
}

// 결제 성공 시에만 호출 — 대기 주문을 주문 내역으로 확정합니다.
export function commitPendingOrder() {
  const pending = getPendingOrder();
  if (!pending) return null;

  const orders = readOrders();
  orders.push(pending);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.setItem(LAST_KEY, pending.orderNo);
  clearPendingOrder();
  return pending;
}
