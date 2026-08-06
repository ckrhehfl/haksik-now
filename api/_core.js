// AI 학식 추천 로직 (공통) — Vercel 서버리스 함수 + 로컬 dev 서버가 함께 사용.
// Claude API로 지금 혼잡도·대기·메뉴를 보고 한 곳/메뉴를 추천받습니다.
import Anthropic from "@anthropic-ai/sdk";

// restaurants: [{ name, congestion, waitingCount, waitMinutes, menus:[{name, price}] }]
// preference: 사용자 요청(선택) 예) "매운 거", "저렴한 거"
export async function getRecommendation({ restaurants = [], preference = "" }, apiKey) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    const e = new Error("서버에 ANTHROPIC_API_KEY가 설정되지 않았어요.");
    e.status = 500;
    throw e;
  }
  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    const e = new Error("식당 데이터가 비어 있어요.");
    e.status = 400;
    throw e;
  }

  const client = new Anthropic({ apiKey: key });

  const lines = restaurants
    .map(
      (r) =>
        `- ${r.name}: 혼잡도 ${r.congestion}/100, 대기 ${r.waitingCount}명·약 ${r.waitMinutes}분, 메뉴: ${(r.menus || [])
          .map((m) => `${m.name}(${m.price.toLocaleString()}원)`)
          .join(", ")}`
    )
    .join("\n");

  const system =
    "너는 대학교 학생식당 추천 도우미야. 지금 각 식당의 실시간 혼잡도·대기시간·메뉴를 보고, " +
    "학생에게 딱 한 곳과 메뉴 하나를 추천해줘. 규칙: 한국어 2~3문장, 친근한 반말, " +
    "붐비는 곳은 피하고 한가한 곳을 우선하되 학생 요청도 반영. 이모지는 한두 개까지. " +
    "마크다운·목록 없이 자연스러운 문장으로.";

  const user =
    `지금 식당 현황:\n${lines}\n\n` +
    `학생 요청: ${preference || "특별한 요청 없음"}\n\n` +
    "어디서 뭘 먹으면 좋을지 추천해줘.";

  const resp = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 400,
    system,
    messages: [{ role: "user", content: user }],
  });

  return resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
