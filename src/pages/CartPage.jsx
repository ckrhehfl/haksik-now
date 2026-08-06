// 장바구니 — 담당: 팀원1
// 수량 조절 후 "지금 주문"하면 00-공용규칙.md 3번 형식으로 주문을 생성합니다.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { getCart, setCart, clearCart } from "../data/cart";
import { estimateWait } from "../data/liveSim";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCartState] = useState(getCart);

  const changeQty = (itemId, delta) => {
    const next = {
      ...cart,
      items: cart.items
        .map((i) => (i.id === itemId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    };
    const value = next.items.length === 0 ? null : next;
    setCart(value);
    setCartState(value);
  };

  if (!cart) {
    return (
      <div style={{ paddingBottom: 80 }}>
        <header style={{ padding: "8px 16px 0" }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>
            장바구니 <span aria-hidden>🛒</span>
          </h1>
        </header>
        <div className="card" style={{ textAlign: "center", color: "#6b7280" }}>
          <p style={{ margin: "8px 0 12px" }}>장바구니가 비어 있어요.</p>
          <button onClick={() => navigate("/")}>메뉴 보러 가기</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  const wait = estimateWait(cart.restaurantId);

  const placeOrder = () => {
    const orderNo = "A" + Date.now().toString().slice(-4);
    const order = {
      orderNo,
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      items: cart.items,
      total,
      createdAt: new Date().toISOString(),
    };
    const orders = JSON.parse(localStorage.getItem("haksik_orders") || "[]");
    orders.push(order);
    localStorage.setItem("haksik_orders", JSON.stringify(orders));
    localStorage.setItem("haksik_last_order", orderNo);
    clearCart();
    navigate("/pay");
  };

  return (
    <div style={{ paddingBottom: 180 }}>
      <header style={{ padding: "8px 16px 0" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>
          장바구니 <span aria-hidden>🛒</span>
        </h1>
      </header>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>{cart.restaurantName}</h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {cart.items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span>
                {item.name}
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {item.price.toLocaleString()}원
                </div>
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    padding: 0,
                    background: "#e5e7eb",
                    color: "#111827",
                  }}
                  onClick={() => changeQty(item.id, -1)}
                >
                  -
                </button>
                <span style={{ minWidth: 16, textAlign: "center" }}>
                  {item.qty}
                </span>
                <button
                  style={{ width: 32, height: 32, padding: 0 }}
                  onClick={() => changeQty(item.id, 1)}
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            clearCart();
            setCartState(null);
          }}
          style={{
            marginTop: 12,
            background: "#fff",
            color: "#ef4444",
            border: "1px solid #fecaca",
            fontSize: 13,
            padding: "8px 12px",
          }}
        >
          장바구니 비우기
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 56,
          left: 0,
          right: 0,
          maxWidth: 480,
          margin: "0 auto",
          padding: 16,
          background: "var(--bg)",
        }}
      >
        {wait && (
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
        )}
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
        <button style={{ width: "100%" }} onClick={placeOrder}>
          지금 주문
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
