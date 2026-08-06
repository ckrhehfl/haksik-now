// 결제 (목업) — 담당: 팀원1
// ⚠️ 실제 결제/PG 연동 아님. 결제수단 고르고 "결제하는 척"한 뒤 주문완료로 넘어가는 데모 화면.
// 주문은 이전 화면(OrderPage/CartPage)에서 이미 저장됨. 여기선 haksik_last_order 기준으로 표시.
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const METHODS = [
  { id: "card", label: "신용/체크카드", emoji: "💳" },
  { id: "kakao", label: "카카오페이", emoji: "🟡" },
  { id: "toss", label: "토스페이", emoji: "🔵" },
  { id: "bank", label: "계좌이체", emoji: "🏦" },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const orderNo = localStorage.getItem("haksik_last_order");
  const orders = JSON.parse(localStorage.getItem("haksik_orders") || "[]");
  const order = orders.find((o) => o.orderNo === orderNo);

  const [method, setMethod] = useState("card");
  const [paying, setPaying] = useState(false);

  if (!orderNo || !order) {
    return (
      <div className="card">
        <p>결제할 주문을 찾을 수 없어요.</p>
        <button onClick={() => navigate("/")}>메인으로</button>
      </div>
    );
  }

  const pay = () => {
    setPaying(true);
    // 결제하는 척 (데모) — 잠깐 뒤 주문완료로
    setTimeout(() => navigate("/order-complete"), 1200);
  };

  return (
    <div style={{ paddingBottom: 96 }}>
      <div className="card">
        <h1 style={{ margin: 0, fontSize: 22 }}>결제</h1>
        <p style={{ margin: "4px 0 0", color: "#6b7280" }}>{order.restaurantName}</p>
      </div>

      {/* 결제 금액 */}
      <div className="card">
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span style={{ color: "#6b7280" }}>결제 금액</span>
          <strong style={{ fontSize: 22, color: "#2563eb" }}>
            {order.total.toLocaleString()}원
          </strong>
        </div>
        <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0 }}>
          {order.items.map((it) => (
            <li
              key={it.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: 14,
                color: "#6b7280",
              }}
            >
              <span>
                {it.name} x {it.qty}
              </span>
              <span>{(it.price * it.qty).toLocaleString()}원</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 결제 수단 */}
      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>결제 수단</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "flex-start",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: on ? "#eff6ff" : "#fff",
                  color: "#111827",
                  border: on ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  fontWeight: on ? 700 : 500,
                }}
              >
                <span aria-hidden style={{ fontSize: 18 }}>
                  {m.emoji}
                </span>
                <span>{m.label}</span>
                <span style={{ marginLeft: "auto", color: "#2563eb" }}>
                  {on ? "●" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 12,
          margin: "4px 16px",
        }}
      >
        ⚠️ 실제 결제가 아닌 데모 화면이에요 (돈이 빠져나가지 않아요).
      </p>

      {/* 결제하기 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 480,
          margin: "0 auto",
          padding: 16,
          background: "var(--bg)",
        }}
      >
        <button
          style={{ width: "100%", opacity: paying ? 0.6 : 1 }}
          disabled={paying}
          onClick={pay}
        >
          {paying ? "결제 중…" : `${order.total.toLocaleString()}원 결제하기`}
        </button>
      </div>
    </div>
  );
}
