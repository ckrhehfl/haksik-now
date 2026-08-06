// 화면2: 식당 상세 / 오늘 메뉴 / 시간대별 혼잡 그래프 — 담당: 팀원2

import { useParams, useNavigate } from "react-router-dom";
import { restaurants, congestionLevel } from "../data/mockData";

const HOURS = ["11시", "12시", "13시", "14시", "15시", "16시", "17시"];

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

  const level = congestionLevel(restaurant.congestion);
  const maxHourly = Math.max(...restaurant.hourly);

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
              <span>{menu.price.toLocaleString()}원</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>시간대별 혼잡도</h2>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            height: 120,
          }}
        >
          {restaurant.hourly.map((value, i) => {
            const barLevel = congestionLevel(value);
            const height = Math.max((value / maxHourly) * 100, 6);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${height}%`,
                      background: barLevel.color,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  {HOURS[i]}
                </span>
              </div>
            );
          })}
        </div>
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
