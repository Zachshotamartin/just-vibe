export function total(items, coupon) { const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0); return subtotal - coupon.amount; }
