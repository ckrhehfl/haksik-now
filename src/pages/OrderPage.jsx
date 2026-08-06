// 화면3: 메뉴 담기 + '지금 주문' — 담당: 팀원2

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restaurants } from "../data/mockData";
import { estimateWait } from "../data/liveSim";

export default function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = restaurants.find((r) => r.id === id);
  const [qty, setQty] = useState({});

  if (!restaurant) {
    return (
      <div className="card">
        <p>식당을 찾을 수 없어요.</p>
      </div>
    );
  }

  const changeQty = (menu, delta) => {
    if (menu.soldOut) return;
    setQty((prev) => {
      const next = Math.max((prev[menu.id] || 0) + delta, 0);
      return { ...prev, [menu.id]: next };
    });
  };

  const items = restaurant.menus
    .filter((menu) => (qty[menu.id] || 0) > 0)
    .map((menu) => ({
      id: menu.id,
      name: menu.name,
      price: menu.price,
      qty: qty[menu.id],
    }));

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrder = () => {
    if (items.length === 0) return;

    const orderNo = "A" + Date.now().toString().slice(-4);
    const order = {
      orderNo,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items,
      total,
      createdAt: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem("haksik_orders") || "[]");
    orders.push(order);
    localStorage.setItem("haksik_orders", JSON.stringify(orders));
    localStorage.setItem("haksik_last_order", orderNo);

    navigate("/order-complete");
  };

  return (
    <div style={{ paddingBottom: 96 }}>
      <div className="card">
        <h1 style={{ margin: 0, fontSize: 22 }}>{restaurant.name}</h1>
        <p style={{ margin: "4px 0 0", color: "#6b7280" }}>지금 주문</p>
      </div>

      <div className="card">
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {restaurant.menus.map((menu) => (
            <li
              key={menu.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
                color: menu.soldOut ? "#9ca3af" : "#111827",
              }}
            >
              <span>
                {menu.name}
                {menu.soldOut && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      background: "#e5e7eb",
                      color: "#6b7280",
                      borderRadius: 6,
                      padding: "2px 6px",
                    }}
                  >
                    품절
                  </span>
                )}
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {menu.price.toLocaleString()}원
                </div>
              </span>

              {menu.soldOut ? (
                <span style={{ fontSize: 13 }}>담기 불가</span>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    style={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      background: "#e5e7eb",
                      color: "#111827",
                    }}
                    onClick={() => changeQty(menu, -1)}
                  >
                    -
                  </button>
                  <span style={{ minWidth: 16, textAlign: "center" }}>
                    {qty[menu.id] || 0}
                  </span>
                  <button
                    style={{ width: 32, height: 32, padding: 0 }}
                    onClick={() => changeQty(menu, 1)}
                  >
                    +
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

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
        {(() => {
          const wait = estimateWait(restaurant.id);
          return (
            wait && (
              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  marginBottom: 6,
                  textAlign: "right",
                }}
              >
                지금 주문하면 예상 대기 약 {wait.waitMinutes}분 (앞에{" "}
                {wait.waitingCount}명)
              </div>
            )
          );
        })()}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          <span>합계</span>
          <span>{total.toLocaleString()}원</span>
        </div>
        <button
          style={{
            width: "100%",
            opacity: items.length === 0 ? 0.5 : 1,
            cursor: items.length === 0 ? "not-allowed" : "pointer",
          }}
          disabled={items.length === 0}
          onClick={placeOrder}
        >
          지금 주문
        </button>
      </div>
    </div>
  );
}
