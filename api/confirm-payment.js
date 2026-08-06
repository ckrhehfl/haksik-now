// POST /api/confirm-payment — 토스페이먼츠 결제 승인 (Vercel 서버리스).
// 프론트가 성공 리다이렉트에서 받은 paymentKey/orderId/amount 를 넘기면 여기서 승인 확정.
import { confirmPayment } from "./_toss.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 지원해요." });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const payment = await confirmPayment(body);
    res.status(200).json({ ok: true, payment });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "결제 승인 실패", code: e.code });
  }
}
