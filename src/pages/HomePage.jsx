// 화면1: 실시간 혼잡도 현황판 — 담당: 팀원1
// 시간대 곡선(hourly) 기반 시뮬레이션(liveSim.js)으로 3초마다 값이 자연스럽게 출렁입니다.
// 현재 시각 기준으로 대기 줄이 1분 단위로 천천히 움직입니다.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { congestionLevel } from "../data/mockData";
import { initialSnapshot, nextTick, takeNewOrders } from "../data/liveSim";
import BottomNav from "../components/BottomNav";
import AiRecommend from "../components/AiRecommend";

export default function HomePage() {
  const navigate = useNavigate();
  const [list, setList] = useState(initialSnapshot);

  useEffect(() => {
    const timer = setInterval(() => {
      // 우리 앱에서 새로 들어온 실제 주문 감지 → 해당 식당 줄 +1
      setList((prev) => nextTick(prev, 3, takeNewOrders()));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: "8px 4px 80px" }}>
      <header style={{ padding: "20px 16px 4px" }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>
          학식 나우 <span aria-hidden>🍚</span>
        </h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
          지금 어느 식당이 한가할까요? 실시간 혼잡도를 확인하세요.
        </p>
      </header>

      <AiRecommend list={list} />

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

      <BottomNav />
    </div>
  );
}
