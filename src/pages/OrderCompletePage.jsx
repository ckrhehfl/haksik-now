// 주문 완료: 주문번호 + 가짜 QR — 담당: 팀원2

import { useNavigate } from "react-router-dom";

function FakeQR() {
  const cells = Array.from({ length: 49 }, (_, i) => {
    // 항상 같은 패턴이 나오도록 인덱스 기반 가짜 규칙 사용
    const on = (i * 7 + Math.floor(i / 7) * 3) % 5 < 2;
    return on;
  });

  return (
    <div
      style={{
        width: 140,
        height: 140,
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gridTemplateRows: "repeat(7, 1fr)",
        gap: 2,
        padding: 12,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        margin: "0 auto",
      }}
    >
      {cells.map((on, i) => (
        <div
          key={i}
          style={{ background: on ? "#111827" : "transparent" }}
        />
      ))}
    </div>
  );
}

export default function OrderCompletePage() {
  const navigate = useNavigate();
  const orderNo = localStorage.getItem("haksik_last_order");
  const orders = JSON.parse(localStorage.getItem("haksik_orders") || "[]");
  const order = orders.find((o) => o.orderNo === orderNo);

  if (!orderNo || !order) {
    return (
      <div className="card">
        <p>주문 정보를 찾을 수 없어요.</p>
        <button onClick={() => navigate("/")}>메인으로</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 0", textAlign: "center" }}>
      <div className="card">
        <p style={{ margin: 0, color: "#6b7280" }}>주문이 완료됐어요</p>
        <h1 style={{ margin: "8px 0", fontSize: 28 }}>주문번호 {order.orderNo}</h1>
        <FakeQR />
      </div>

      <div className="card" style={{ textAlign: "left" }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>{order.restaurantName}</h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {order.items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span>
                {item.name} x {item.qty}
              </span>
              <span>{(item.price * item.qty).toLocaleString()}원</span>
            </li>
          ))}
        </ul>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            fontWeight: 600,
          }}
        >
          <span>합계</span>
          <span>{order.total.toLocaleString()}원</span>
        </div>
      </div>

      <div style={{ padding: "0 12px" }}>
        <button style={{ width: "100%" }} onClick={() => navigate("/")}>
          새 주문하기
        </button>
      </div>
    </div>
  );
}
