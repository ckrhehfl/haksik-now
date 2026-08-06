// 결제 성공 리다이렉트 도착지 — 토스에서 받은 값으로 서버 승인 후 주문완료로 이동.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { commitPendingOrder } from "../data/orders";
import { clearCart } from "../data/cart";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("confirming"); // confirming | error
  const [msg, setMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode 중복 호출 방지
    ran.current = true;

    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");

    (async () => {
      try {
        const res = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "결제 승인 실패");
        // 승인된 뒤에만 주문을 확정합니다.
        commitPendingOrder();
        clearCart();
        navigate("/order-complete", { replace: true });
      } catch (e) {
        setStatus("error");
        setMsg(e.message);
      }
    })();
  }, [navigate, params]);

  if (status === "confirming") {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p style={{ fontSize: 16, margin: "12px 0" }}>결제 승인 중이에요… 잠시만요 ⏳</p>
      </div>
    );
  }
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <p style={{ fontSize: 18, margin: "8px 0" }}>결제 승인 실패 😢</p>
      <p style={{ color: "#6b7280", fontSize: 14 }}>{msg}</p>
      <button style={{ marginTop: 10 }} onClick={() => navigate("/")}>
        메인으로
      </button>
    </div>
  );
}
