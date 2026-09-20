export function total(items, coupon) { return items.reduce((s, x) => s + x.price * x.quantity, 0) - (coupon?.amount ?? 0); }
