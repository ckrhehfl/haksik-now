// 화면1: 실시간 혼잡도 현황판 — 담당: 팀원1
// 공용 데이터(mockData.js)를 복사해 들고, 3초마다 혼잡도를 흔들어 실시간 느낌을 냅니다.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { restaurants, congestionLevel } from "../data/mockData";

// congestion(0~100)에 비례해 대기 인원/시간을 대략적으로 계산
function deriveWait(congestion) {
  return {
    waitingCount: Math.max(0, Math.round(congestion / 3.5)),
    waitMinutes: Math.max(0, Math.round(congestion / 5)),
  };
}

export default function HomePage() {
  const navigate = useNavigate();
  const [list, setList] = useState(restaurants);

  useEffect(() => {
    const timer = setInterval(() => {
      setList((prev) =>
        prev.map((r) => {
          const delta = Math.floor(Math.random() * 17) - 8; // -8 ~ +8
          const congestion = Math.min(100, Math.max(0, r.congestion + delta));
          return { ...r, congestion, ...deriveWait(congestion) };
        })
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: "8px 4px 24px" }}>
      <header style={{ padding: "20px 16px 4px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>
          학식 나우 <span aria-hidden>🍚</span>
        </h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
          지금 어느 식당이 한가할까요? 실시간 혼잡도를 확인하세요.
        </p>
      </header>

      {list.map((r) => {
        const level = congestionLevel(r.congestion);
        return (
          <div
            key={r.id}
            className="card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/restaurant/${r.id}`)}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/restaurant/${r.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: 18 }}>{r.name}</strong>
              <span style={{ color: level.color, fontWeight: 700, fontSize: 15 }}>
                {level.emoji} {level.label}
              </span>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#6b7280", fontSize: 14 }}>
                대기 {r.waitingCount}명 · 약 {r.waitMinutes}분
              </span>
              <span style={{ color: "#9ca3af", fontSize: 13 }}>
                혼잡도 {r.congestion} ›
              </span>
            </div>

            {/* 혼잡도 게이지 바 */}
            <div
              style={{
                marginTop: 10,
                height: 6,
                borderRadius: 3,
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${r.congestion}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: level.color,
                  transition: "width 0.6s ease, background 0.6s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
