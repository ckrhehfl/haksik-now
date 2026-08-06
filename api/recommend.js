// POST /api/recommend — 프로덕션(Vercel) 서버리스 함수.
// 키는 Vercel 환경변수 ANTHROPIC_API_KEY에서 읽습니다(코드에 넣지 않음).
import { getRecommendation } from "./_core.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 지원해요." });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const text = await getRecommendation(body);
    res.status(200).json({ text });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "AI 추천에 실패했어요." });
  }
}
