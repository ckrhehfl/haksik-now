// 결제 — 담당: 팀원1
// 토스페이먼츠 "결제위젯"으로 실제 테스트 결제. 위젯이 결제수단 UI를 직접 렌더링함.
// 키(VITE_TOSS_CLIENT_KEY)가 없으면 목업(바로 주문완료)으로 폴백해 앱은 계속 동작.
// 주문은 이전 화면에서 이미 저장됨 → haksik_last_order 기준으로 표시/결제.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { getPendingOrder, commitPendingOrder } from "../data/orders";
import { clearCart } from "../data/cart";

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

export default function PaymentPage() {
  const navigate = useNavigate();
  // 아직 확정되지 않은 '결제 대기' 주문을 결제합니다.
  const order = getPendingOrder();

  const [paying, setPaying] = useState(false);
  const [ready, setReady] = useState(false);
  const widgetsRef = useRef(null);
  const inited = useRef(false);

  // 결제위젯 렌더링 (키 있을 때만)
  useEffect(() => {
    if (!CLIENT_KEY || !order || inited.current) return;
    inited.current = true;
    (async () => {
      const toss = await loadTossPayments(CLIENT_KEY);
      const widgets = toss.widgets({ customerKey: ANONYMOUS });
      await widgets.setAmount({ currency: "KRW", value: order.total });
      await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#toss-payment-methods",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#toss-agreement",
          variantKey: "AGREEMENT",
        }),
      ]);
      widgetsRef.current = widgets;
      setReady(true);
    })().catch((e) => {
      console.error("토스 위젯 로드 실패:", e);
    });
  }, [order]);

  if (!order) {
    return (
      <div className="card">
        <p>결제할 주문을 찾을 수 없어요.</p>
        <button onClick={() => navigate("/")}>메인으로</button>
      </div>
    );
  }

  const orderName =
    order.items.length > 1
      ? `${order.items[0].name} 외 ${order.items.length - 1}건`
      : order.items[0].name;

  // 실제 토스 결제
  const payToss = async () => {
    setPaying(true);
    try {
      const tossOrderId = `haksik_${order.orderNo}_${Date.now().toString().slice(-6)}`;
      await widgetsRef.current.requestPayment({
        orderId: tossOrderId,
        orderName,
        customerName: "학식러",
        successUrl: `${window.location.origin}/pay/success`,
        failUrl: `${window.location.origin}/pay/fail`,
      });
      // 여기 아래는 토스 결제창으로 이동하므로 보통 실행되지 않음
    } catch (e) {
      setPaying(false);
      if (e?.code !== "USER_CANCEL") {
        alert("결제를 시작하지 못했어요: " + (e?.message || e));
      }
    }
  };

  // 키 없을 때 목업 — 결제 성공으로 보고 주문을 확정합니다.
  const payMock = () => {
    setPaying(true);
    setTimeout(() => {
      commitPendingOrder();
      clearCart();
      navigate("/order-complete", { replace: true });
    }, 1200);
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

      {CLIENT_KEY ? (
        <>
          {/* 토스 결제위젯이 여기에 결제수단/약관 UI를 렌더링 */}
          <div className="card">
            <div id="toss-payment-methods" />
            <div id="toss-agreement" />
          </div>
          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 12,
              margin: "4px 16px",
            }}
          >
            ⚠️ 토스페이먼츠 테스트 결제예요 — 실제 돈은 빠져나가지 않아요.
          </p>
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
              boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.06)",
            }}
          >
            <button
              style={{ width: "100%", opacity: !ready || paying ? 0.6 : 1 }}
              disabled={!ready || paying}
              onClick={payToss}
            >
              {paying ? "결제 중…" : `${order.total.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </>
      ) : (
        <>
          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 12,
              margin: "4px 16px",
            }}
          >
            ⚠️ 결제 키 미설정 — 데모 결제로 진행돼요 (실제 돈 안 빠짐).
          </p>
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
              boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.06)",
            }}
          >
            <button
              style={{ width: "100%", opacity: paying ? 0.6 : 1 }}
              disabled={paying}
              onClick={payMock}
            >
              {paying ? "결제 중…" : `${order.total.toLocaleString()}원 결제하기 (데모)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
