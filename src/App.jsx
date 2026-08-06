import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import OrderPage from "./pages/OrderPage";
import PaymentPage from "./pages/PaymentPage";
import OrderCompletePage from "./pages/OrderCompletePage";
import OrdersPage from "./pages/OrdersPage";
import CartPage from "./pages/CartPage";

// 주소(라우팅)는 00-공용규칙.md 4번 항목 기준. (/orders는 주문내역용으로 추가됨)
// 화면 내용은 각 pages/ 파일에서 담당 팀원이 채웁니다.

// 메인이 아닌 화면에 공통 뒤로가기 버튼을 제공하는 상단 바.
// (팀원3이 components/Header.jsx를 만들면 그쪽으로 옮겨도 됩니다)
function TopBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  return (
    <div style={{ padding: "12px 12px 0" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#fff",
          color: "#111827",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: 14,
        }}
      >
        ← 뒤로
      </button>
    </div>
  );
}

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/order-complete" element={<OrderCompletePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </>
  );
}
