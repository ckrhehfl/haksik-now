// 화면2: 식당 상세 / 오늘 메뉴 / 시간대별 혼잡 그래프 — 담당: 팀원2

import { useParams, useNavigate } from "react-router-dom";
import { restaurants, congestionLevel } from "../data/mockData";
import { hourlyLoad, liveRestaurant } from "../data/liveSim";

// 시간대별 대기 현황 꺾은선 그래프 (SVG) — 캐치테이블 스타일
// - 파란 선 + 아래 영역 그라데이션(위쪽 연한 파랑 → 아래 투명)
// - 점심(12·13시)만 빨간 점(🔴), 나머지는 파란 점
// - 피크(가장 높은 점) 위에 '평균 N팀 | M분' 말풍선 + 점선 연결
// - viewBox 기반 모바일 반응형
function HourlyChart({ points, peakIndex }) {
  const W = 320;
  const H = 150;
  const ML = 30; // 왼쪽 여백(눈금)
  const MR = 12;
  const MT = 30; // 위 여백(피크 라벨)
  const MB = 22; // 아래 여백(시간 라벨)
  const plotW = W - ML - MR;
  const plotH = H - MT - MB;

  const peak = points[peakIndex];
  const yMax = Math.max(10, Math.ceil(peak.people / 10) * 10);
  const x = (i) => ML + (i / (points.length - 1)) * plotW;
  const y = (v) => MT + (1 - v / yMax) * plotH;
  const isLunch = (i) => i === 1 || i === 2; // 12시·13시

  const gridVals = [0, yMax / 2, yMax];
  const last = points.length - 1;
  const baseline = y(0);
  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.people)}`)
    .join(" ");
  const areaD = `${lineD} L ${x(last)} ${baseline} L ${x(0)} ${baseline} Z`;

  const peakX = x(peakIndex);
  const peakY = y(peak.people);
  const labelText = `평균 ${peak.people}팀 | ${peak.minutes}분`;
  const labelW = labelText.length * 8.5 + 14;
  const labelX = Math.max(ML, Math.min(peakX - labelW / 2, W - MR - labelW));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
        {/* 피크 라벨 테두리 그라데이션 (주황 → 빨강, 따뜻한 톤 통일) */}
        <linearGradient id="labelBorder" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        {/* 토스풍 부드러운 그림자 */}
        <filter id="labelShadow" x="-30%" y="-30%" width="160%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* 가로 눈금선 + 숫자(팀) 라벨 */}
      {gridVals.map((v) => (
        <g key={v}>
          <line x1={ML} y1={y(v)} x2={W - MR} y2={y(v)} stroke="#e5e7eb" strokeWidth="1" />
          <text x={ML - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#9ca3af">
            {v}
          </text>
        </g>
      ))}
      <text x={ML - 6} y={MT - 12} textAnchor="end" fontSize="10" fill="#9ca3af">
        팀
      </text>

      {/* 아래 영역 그라데이션 채움 */}
      <path d={areaD} fill="url(#areaFill)" stroke="none" />

      {/* 파란 꺾은선 */}
      <path
        d={lineD}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 점: 점심(12·13시)은 빨강(혼잡), 나머지는 파랑 */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(p.people)}
          r={i === peakIndex ? 5 : 3.5}
          fill={isLunch(i) ? congestionLevel(p.congestion).color : "#2563eb"}
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}

      {/* 피크 라벨: 평균 N팀 | M분 (흰 배경 + 그라데이션 테두리, 토스풍) */}
      <line
        x1={peakX}
        y1={MT - 6}
        x2={peakX}
        y2={peakY - 6}
        stroke="#d1d5db"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <rect
        x={labelX}
        y={1}
        width={labelW}
        height={22}
        rx={8}
        fill="#fff"
        stroke="url(#labelBorder)"
        strokeWidth="1.5"
        filter="url(#labelShadow)"
      />
      <text
        x={labelX + labelW / 2}
        y={16}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
      >
        <tspan fill="#111827">평균 </tspan>
        <tspan fill="#f59e0b">{peak.people}팀 | {peak.minutes}분</tspan>
      </text>

      {/* 시간 라벨 */}
      {points.map((p, i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#6b7280">
          {p.hour}
        </text>
      ))}
    </svg>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <div className="card">
        <p>식당을 찾을 수 없어요.</p>
      </div>
    );
  }

  // 현황판이 보여주는 실시간 값을 그대로 사용합니다.
  // (mockData의 고정 초기값을 쓰면 현황판은 '여유'인데 여기선 '혼잡'으로 갈립니다)
  const live = liveRestaurant(restaurant.id) ?? restaurant;
  const level = congestionLevel(live.congestion);
  const load = hourlyLoad(restaurant.id);

  return (
    <div style={{ paddingBottom: 96 }}>
      <div className="card">
        <h1 style={{ margin: 0, fontSize: 22 }}>{restaurant.name}</h1>
        <div
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background: `${level.color}1a`,
            color: level.color,
            fontWeight: 600,
          }}
        >
          <span>{level.emoji}</span>
          <span>{level.label}</span>
        </div>
        <div style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
          대기 {live.waitingCount}명 · 약 {live.waitMinutes}분
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>오늘의 메뉴</h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {restaurant.menus.map((menu) => (
            <li
              key={menu.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
                color: menu.soldOut ? "#9ca3af" : "#111827",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                    filter: menu.soldOut ? "grayscale(1)" : "none",
                  }}
                >
                  {menu.emoji ?? "🍽️"}
                </span>
                <span>
                  {menu.name}
                  {menu.soldOut && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 12,
                        background: "#e5e7eb",
                        color: "#6b7280",
                        borderRadius: 6,
                        padding: "2px 6px",
                      }}
                    >
                      품절
                    </span>
                  )}
                </span>
              </span>
              <span>{menu.price.toLocaleString()}원</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>시간대별 대기 현황</h2>
        <HourlyChart points={load.points} peakIndex={load.peakIndex} />
      </div>

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
        }}
      >
        <button
          style={{ width: "100%" }}
          onClick={() => navigate(`/order/${restaurant.id}`)}
        >
          주문하기
        </button>
      </div>
    </div>
  );
}
