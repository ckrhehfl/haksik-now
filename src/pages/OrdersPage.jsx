// 주문 내역 — 담당: 팀원1
// localStorage "haksik_orders"를 읽고, 사용자가 직접 주문을 취소할 수 있습니다.
// 주문 상태(접수→조리중→조리완료→완료된 주문)는 경과 시간으로 추정하며 5초마다 갱신됩니다.
// 취소는 "완료된 주문"이 되기 전까지만 가능(조리 완료 후엔 취소 불가).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { orderStatus } from "../data/liveSim";

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem("haksik_orders") ?? "[]");
  } catch {
    return [];
  }
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(readOrders);
  const [, setTick] = useState(0); // 상태 배지 주기 갱신용

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const cancelOrder = (order) => {
    if (!window.confirm(`주문번호 ${order.orderNo} 주문을 취소할까요?`)) return;
    const next = readOrders().map((o) =>
      o.orderNo === order.orderNo && o.createdAt === order.createdAt
        ? { ...o, canceled: true, canceledAt: new Date().toISOString() }
        : o
    );
    localStorage.setItem("haksik_orders", JSON.stringify(next));
    setOrders(next);
  };

  const sorted = [...orders].reverse(); // 최신 주문 먼저

  return (
    <div style={{ paddingBottom: 80 }}>
      <header style={{ padding: "8px 16px 0" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>
          주문 내역 <span aria-hidden>🧾</span>
        </h1>
      </header>

      {sorted.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "#6b7280" }}>
          <p style={{ margin: "8px 0 12px" }}>아직 주문이 없어요.</p>
          <button onClick={() => navigate("/")}>주문하러 가기</button>
        </div>
      )}

      {sorted.map((o) => {
        const canceled = !!o.canceled;
        const status = canceled
          ? { label: "주문 취소됨", color: "#ef4444", emoji: "❌" }
          : orderStatus(o);
        const cancelable = !canceled && status.label !== "완료된 주문";

        return (
          <div
            key={o.orderNo + o.createdAt}
            className="card"
            style={{ opacity: canceled ? 0.6 : 1 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>주문번호 {o.orderNo}</strong>
              <span style={{ color: "#9ca3af", fontSize: 13 }}>
                {new Date(o.createdAt).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                color: status.color,
                background: `${status.color}1a`,
              }}
            >
              {status.emoji} {status.label}
            </span>
            <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
              {o.restaurantName}
            </div>

            <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0 }}>
              {o.items.map((it) => (
                <li
                  key={it.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    fontSize: 14,
                  }}
                >
                  <span>
                    {it.name} x {it.qty}
                  </span>
                  <span>{(it.price * it.qty).toLocaleString()}원</span>
                </li>
              ))}
            </ul>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontWeight: 600,
              }}
            >
              <span>합계</span>
              <span>{o.total.toLocaleString()}원</span>
            </div>

            {cancelable && (
              <button
                onClick={() => cancelOrder(o)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  background: "#fff",
                  color: "#ef4444",
                  border: "1px solid #fecaca",
                  fontSize: 14,
                  padding: "10px 12px",
                }}
              >
                주문 취소
              </button>
            )}
          </div>
        );
      })}

      <BottomNav />
    </div>
  );
}
