// 장바구니 — 담당: 팀원1
// localStorage 키 "haksik_cart": { restaurantId, restaurantName, items:[{id,name,price,qty}] } 또는 null
// 실제 배달앱처럼 장바구니에는 한 번에 한 식당만 담을 수 있습니다.

const CART_KEY = "haksik_cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function setCart(cart) {
  if (!cart || cart.items.length === 0) localStorage.removeItem(CART_KEY);
  else localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function cartItemCount() {
  const cart = getCart();
  return cart ? cart.items.reduce((s, i) => s + i.qty, 0) : 0;
}

// 담기. 다른 식당 것이 이미 담겨 있으면 false 반환(호출한 쪽에서 확인 후 replace)
export function addToCart(restaurant, items, { replace = false } = {}) {
  const cart = getCart();
  if (cart && cart.restaurantId !== restaurant.id && !replace) return false;

  const base =
    cart && cart.restaurantId === restaurant.id && !replace
      ? cart
      : { restaurantId: restaurant.id, restaurantName: restaurant.name, items: [] };

  for (const item of items) {
    const found = base.items.find((i) => i.id === item.id);
    if (found) found.qty += item.qty;
    else base.items.push({ ...item });
  }
  setCart(base);
  return true;
}
