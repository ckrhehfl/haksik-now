import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import OrderPage from "./pages/OrderPage";
import OrderCompletePage from "./pages/OrderCompletePage";

// 주소(라우팅)는 00-공용규칙.md 4번 항목과 동일하게 고정되어 있습니다.
// 화면 내용은 각 pages/ 파일에서 담당 팀원이 채웁니다.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/restaurant/:id" element={<RestaurantPage />} />
      <Route path="/order/:id" element={<OrderPage />} />
      <Route path="/order-complete" element={<OrderCompletePage />} />
    </Routes>
  );
}
