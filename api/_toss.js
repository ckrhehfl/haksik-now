// 토스페이먼츠 결제 승인(confirm) 공통 로직 — Vercel 함수 + 로컬 dev 서버 공유.
// ⚠️ 시크릿 키는 서버에서만 사용. 브라우저(프론트)에 절대 노출 금지.
export async function confirmPayment({ paymentKey, orderId, amount }, secretKey) {
  const key = secretKey || process.env.TOSS_SECRET_KEY;
  if (!key) {
    const e = new Error("서버에 TOSS_SECRET_KEY가 설정되지 않았어요.");
    e.status = 500;
    throw e;
  }
  if (!paymentKey || !orderId || amount == null) {
    const e = new Error("결제 정보(paymentKey/orderId/amount)가 부족해요.");
    e.status = 400;
    throw e;
  }

  // 시크릿 키 뒤에 ':' 를 붙여 base64 (Basic 인증)
  const auth = Buffer.from(`${key}:`).toString("base64");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
  });

  const data = await res.json();
  if (!res.ok) {
    const e = new Error(data.message || "결제 승인에 실패했어요.");
    e.status = res.status;
    e.code = data.code;
    throw e;
  }
  return data;
}
