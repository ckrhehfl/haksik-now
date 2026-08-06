// AI 학식 추천 로직 (공통) — FactChat 게이트웨이(OpenAI 호환) 사용.
// Vercel 서버리스 함수 + 로컬 dev 서버가 함께 사용합니다.
// base URL은 비밀이 아니라 코드에 두고, 키는 환경변수 FACTCHAT_API_KEY 에서만 읽습니다.

const BASE_URL = "https://factchat-cloud.mindlogic.ai/v1/gateway";
const MODEL = "claude-sonnet-4-6"; // 모델 목록: GET /v1/gateway/models

// 이 엔드포인트는 배포되면 누구나 호출할 수 있으므로 입력 크기를 제한합니다.
// (제한이 없으면 남이 우리 API 키로 긴 요청을 마음껏 보낼 수 있습니다)
const MAX_RESTAURANTS = 10;
const MAX_MENUS = 10;
const MAX_NAME = 40;
const MAX_PREFERENCE = 100;

const str = (v, max) => String(v ?? "").slice(0, max);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// restaurants: [{ name, congestion, waitingCount, waitMinutes, menus:[{name, price}] }]
// preference: 사용자 요청(선택) 예) "매운 거", "저렴한 거"
export async function getRecommendation({ restaurants = [], preference = "" }, apiKey) {
  const key = apiKey || process.env.FACTCHAT_API_KEY;
  if (!key) {
    const e = new Error("서버에 FACTCHAT_API_KEY가 설정되지 않았어요.");
    e.status = 500;
    throw e;
  }
  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    const e = new Error("식당 데이터가 비어 있어요.");
    e.status = 400;
    throw e;
  }

  const lines = restaurants
    .slice(0, MAX_RESTAURANTS)
    .map(
      (r) =>
        `- ${str(r.name, MAX_NAME)}: 혼잡도 ${num(r.congestion)}/100, 대기 ${num(
          r.waitingCount
        )}명·약 ${num(r.waitMinutes)}분, 메뉴: ${(Array.isArray(r.menus) ? r.menus : [])
          .slice(0, MAX_MENUS)
          .map((m) => `${str(m.name, MAX_NAME)}(${num(m.price).toLocaleString()}원)`)
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
    `학생 요청: ${str(preference, MAX_PREFERENCE) || "특별한 요청 없음"}\n\n` +
    "어디서 뭘 먹으면 좋을지 추천해줘.";

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const e = new Error(`FactChat 오류 (${res.status}) ${detail.slice(0, 200)}`);
    e.status = res.status === 401 ? 500 : 502;
    throw e;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    const e = new Error("추천 응답이 비어 있어요.");
    e.status = 502;
    throw e;
  }
  return text;
}
