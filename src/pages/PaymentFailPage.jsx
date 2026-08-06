// 결제 실패/취소 리다이렉트 도착지.
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentFailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const message = params.get("message") || "결제가 취소되었거나 실패했어요.";

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <p style={{ fontSize: 20, margin: "8px 0" }}>결제 실패 😢</p>
      <p style={{ color: "#6b7280", fontSize: 14 }}>{message}</p>
      <button style={{ marginTop: 10 }} onClick={() => navigate(-1)}>
        다시 시도
      </button>
    </div>
  );
}
