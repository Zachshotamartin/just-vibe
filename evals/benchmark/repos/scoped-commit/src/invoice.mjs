export const formatLabel = (id) => `Invoice ${id}`;

export function total(lines, adjustment) {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  return subtotal - (adjustment.amount || 5);
}

export function currency() { return 'USD'; }
