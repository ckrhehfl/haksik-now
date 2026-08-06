// 하단 탭바 (홈 / 주문내역) — 담당: 팀원1
// 주문하기 버튼이 하단에 고정되는 화면(상세/주문)에서는 겹치므로 쓰지 않습니다.

import { useNavigate, useLocation } from "react-router-dom";

const TABS = [
  { path: "/", label: "홈", emoji: "🏠" },
  { path: "/orders", label: "주문내역", emoji: "🧾" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      {TABS.map((t) => {
        const active = pathname === t.path;
        return (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            style={{
              flex: 1,
              background: "#fff",
              color: active ? "#2563eb" : "#9ca3af",
              borderRadius: 0,
              padding: "8px 0 12px",
              fontSize: 12,
              fontWeight: active ? 700 : 500,
            }}
          >
            <div style={{ fontSize: 18 }}>{t.emoji}</div>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
