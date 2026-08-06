// 주문 내역 — 담당: 팀원1
// localStorage "haksik_orders"를 읽고, 사용자가 직접 주문을 취소할 수 있습니다.
// 주문 상태(접수→조리중→조리완료→완료된 주문)는 경과 시간으로 추정하며 5초마다 갱신됩니다.
// 취소는 "주문 접수" 단계에서만 가능(조리 시작되면 취소 불가). 확인은 앱 자체 모달(학식나우).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { orderStatus, estimateWait } from "../data/liveSim";

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
  const [confirmOrder, setConfirmOrder] = useState(null); // 취소 확인 모달 대상
  const [, setTick] = useState(0); // 상태 배지 주기 갱신용

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const doCancel = () => {
    const target = confirmOrder;
    if (!target) return;
    const next = readOrders().map((o) =>
      o.orderNo === target.orderNo && o.createdAt === target.createdAt
        ? { ...o, canceled: true, canceledAt: new Date().toISOString() }
        : o
    );
    localStorage.setItem("haksik_orders", JSON.stringify(next));
    setOrders(next);
    setConfirmOrder(null);
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
        const cancelable = !canceled && status.label === "주문 접수";
        const active = !canceled && status.label !== "완료된 주문";
        const wait = active ? estimateWait(o.restaurantId) : null;

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
            {wait && (
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                ⏱ 예상 대기 약 {wait.waitMinutes}분 (앞에 {wait.waitingCount}명)
              </div>
            )}

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
                onClick={() => setConfirmOrder(o)}
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

      {/* 취소 확인 모달 (학식나우 자체 UI — 브라우저 기본창 대신) */}
      {confirmOrder && (
        <div
          onClick={() => setConfirmOrder(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              maxWidth: 320,
            }}
          >
            <div style={{ fontWeight: 800, color: "#2563eb", marginBottom: 10 }}>
              학식나우 <span aria-hidden>🍚</span>
            </div>
            <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.5 }}>
              주문번호 <strong>{confirmOrder.orderNo}</strong> 주문을
              <br />
              정말 취소할까요?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmOrder(null)}
                style={{ flex: 1, background: "#f3f4f6", color: "#111827" }}
              >
                아니요
              </button>
              <button
                onClick={doCancel}
                style={{ flex: 1, background: "#ef4444" }}
              >
                주문 취소
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
