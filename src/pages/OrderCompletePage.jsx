// 주문 완료: 주문번호 + 픽업용 QR — 담당: 팀원2
// QR은 공용 컴포넌트(components/PickupQR.jsx)를 사용합니다.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PickupQR from "../components/PickupQR";

export default function OrderCompletePage() {
  const navigate = useNavigate();
  const orderNo = localStorage.getItem("haksik_last_order");
  const orders = JSON.parse(localStorage.getItem("haksik_orders") || "[]");
  const order = orders.find((o) => o.orderNo === orderNo);
  const [showPopup, setShowPopup] = useState(true); // 도착 시 완료 팝업

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
      {/* 주문 완료 팝업 (도착 시 1회 표시) */}
      {showPopup && (
        <div
          onClick={() => setShowPopup(false)}
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
              padding: 24,
              width: "100%",
              maxWidth: 320,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44 }} aria-hidden>
              🎉
            </div>
            <p style={{ margin: "10px 0 4px", fontSize: 18, fontWeight: 700 }}>
              주문이 완료됐어요!
            </p>
            <p style={{ margin: "0 0 18px", color: "#6b7280", fontSize: 14 }}>
              주문번호 <strong style={{ color: "#2563eb" }}>{order.orderNo}</strong>
              <br />
              결제시간{" "}
              {new Date(order.createdAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              <br />
              픽업할 때 아래 QR을 보여주세요.
            </p>
            <button style={{ width: "100%" }} onClick={() => setShowPopup(false)}>
              확인
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <p style={{ margin: 0, color: "#6b7280" }}>주문이 완료됐어요</p>
        <h1 style={{ margin: "8px 0", fontSize: 28 }}>주문번호 {order.orderNo}</h1>
        <PickupQR order={order} />
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
