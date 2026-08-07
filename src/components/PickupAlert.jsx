// 조리완료(픽업) 알림 팝업 — 담당: 팀원1
// 어느 화면에 있든, 내 주문이 "조리완료" 상태가 되는 순간 1회 팝업을 띄웁니다.
// 이미 알린 주문은 localStorage에 기록해 새로고침해도 다시 뜨지 않습니다.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderStatus } from "../data/liveSim";

const NOTIFIED_KEY = "haksik_pickup_notified";

function readNotified() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function PickupAlert() {
  const navigate = useNavigate();
  const [readyOrder, setReadyOrder] = useState(null);

  useEffect(() => {
    const check = () => {
      let orders = [];
      try {
        orders = JSON.parse(localStorage.getItem("haksik_orders") ?? "[]");
      } catch {
        return;
      }
      const notified = readNotified();
      const ready = orders.find(
        (o) =>
          !o.canceled &&
          !notified.includes(o.orderNo + o.createdAt) &&
          orderStatus(o).label === "조리완료"
      );
      if (ready) {
        localStorage.setItem(
          NOTIFIED_KEY,
          JSON.stringify([...notified, ready.orderNo + ready.createdAt].slice(-30))
        );
        setReadyOrder(ready);
      }
    };
    check();
    const timer = setInterval(check, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!readyOrder) return null;

  return (
    <div
      onClick={() => setReadyOrder(null)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 200,
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
          🔔
        </div>
        <p style={{ margin: "10px 0 4px", fontSize: 18, fontWeight: 700 }}>
          조리가 완료됐어요!
        </p>
        <p style={{ margin: "0 0 18px", color: "#6b7280", fontSize: 14 }}>
          <strong style={{ color: "#2563eb" }}>{readyOrder.restaurantName}</strong>{" "}
          주문번호{" "}
          <strong style={{ color: "#2563eb" }}>{readyOrder.orderNo}</strong>
          <br />
          카운터에서 QR을 보여주고 픽업하세요.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setReadyOrder(null)}
            style={{ flex: 1, background: "#f3f4f6", color: "#111827" }}
          >
            닫기
          </button>
          <button
            onClick={() => {
              setReadyOrder(null);
              navigate("/orders");
            }}
            style={{ flex: 1 }}
          >
            주문내역 보기
          </button>
        </div>
      </div>
    </div>
  );
}
