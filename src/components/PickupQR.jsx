// 픽업용 QR — 담당: 팀원1 (주문완료 화면·주문내역 상세에서 공용)
// QR에는 실제 주문 정보가 인코딩됩니다 (폰으로 스캔하면 주문번호가 보여요).
// 실서비스에서는 식당 태블릿이 이 QR을 스캔해 픽업을 확인하는 구조.

import { QRCodeSVG } from "qrcode.react";

export default function PickupQR({ order }) {
  const payload = `학식나우 주문 ${order.orderNo} · ${order.restaurantName} · ${order.total.toLocaleString()}원`;
  return (
    <div
      style={{
        width: 140,
        height: 140,
        padding: 10,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        margin: "0 auto",
      }}
    >
      <QRCodeSVG value={payload} size={118} level="M" />
    </div>
  );
}
