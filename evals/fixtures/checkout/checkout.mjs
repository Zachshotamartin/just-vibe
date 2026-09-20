export function total(priceCents, coupon, now) {
  if (coupon && coupon.expiresAt <= now) return { error: 'EXPIRED_DISCOUNT', totalCents: null };
  return { error: null, totalCents: Math.round(priceCents * (1 - coupon.percent / 100)) };
}
