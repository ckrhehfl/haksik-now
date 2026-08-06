// 주문 내역 — 담당: 팀원1
// localStorage "haksik_orders"를 읽기만 합니다 (형식은 00-공용규칙.md 3번).

import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function OrdersPage() {
  const navigate = useNavigate();

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem("haksik_orders") ?? "[]");
  } catch {
    orders = [];
  }
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

      {sorted.map((o) => (
        <div key={o.orderNo + o.createdAt} className="card">
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
        </div>
      ))}

      <BottomNav />
    </div>
  );
}
