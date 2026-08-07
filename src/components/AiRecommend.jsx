// AI 학식 추천 카드 — 현재 실시간 혼잡도/메뉴를 Claude API로 보내 추천을 받습니다.
// 서버(/api/recommend)가 실제 AI 호출을 하고, 여기선 결과만 보여줍니다.
import { useState } from "react";

// AI 호출이 실패했을 때 쓰는 규칙 기반 추천: 제일 한가한 곳 + 첫 판매중 메뉴
function ruleBasedPick(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const best = [...list].sort((a, b) => a.congestion - b.congestion)[0];
  const menu = best.menus.find((m) => !m.soldOut) ?? best.menus[0];
  if (!menu) return null;
  return (
    `지금 제일 한가한 ${best.name} 어때? 대기 ${best.waitingCount}명, ` +
    `약 ${best.waitMinutes}분이면 먹을 수 있어. ${menu.name}(${menu.price.toLocaleString()}원) 추천! 🍽️\n` +
    `(AI 연결이 잠시 불안정해서 혼잡도 기준으로 골랐어요)`
  );
}

export default function AiRecommend({ list }) {
  const [preference, setPreference] = useState("");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const ask = async () => {
    setLoading(true);
    setError("");
    setText("");
    try {
      const restaurants = list.map((r) => ({
        name: r.name,
        congestion: r.congestion,
        waitingCount: r.waitingCount,
        waitMinutes: r.waitMinutes,
        menus: r.menus.map((m) => ({ name: m.name, price: m.price })),
      }));
      // 이 기기의 과거 주문 메뉴(최근 5종)를 함께 보내 취향을 반영
      let pastMenus = [];
      try {
        const orders = JSON.parse(localStorage.getItem("haksik_orders") ?? "[]");
        pastMenus = [
          ...new Set(
            orders
              .filter((o) => !o.canceled)
              .flatMap((o) => o.items.map((i) => i.name))
          ),
        ].slice(-5);
      } catch {
        pastMenus = [];
      }
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ restaurants, preference, pastMenus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "추천을 받지 못했어요.");
      setText(data.text);
    } catch (e) {
      // AI 서버가 안 될 때도 화면이 죽지 않게 규칙 기반으로 대신 골라줍니다.
      const fallback = ruleBasedPick(list);
      if (fallback) setText(fallback);
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#2563eb" }}>
        <span aria-hidden>🤖</span> AI 학식 추천
      </div>
      <p style={{ margin: "6px 0 10px", color: "#6b7280", fontSize: 13 }}>
        지금 혼잡도랑 메뉴를 보고 AI가 골라줘요.
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && ask()}
          placeholder="예: 매운 거, 저렴한 거 (선택)"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            fontSize: 14,
            minWidth: 0,
          }}
        />
        <button onClick={ask} disabled={loading} style={{ whiteSpace: "nowrap" }}>
          {loading ? "고르는 중…" : "추천받기"}
        </button>
      </div>

      {error && (
        <p style={{ marginTop: 10, color: "#ef4444", fontSize: 13 }}>⚠️ {error}</p>
      )}
      {text && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fff",
            borderRadius: 10,
            lineHeight: 1.6,
            fontSize: 15,
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
