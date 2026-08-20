/**
 * Canonical order-total rules.
 *
 * The cart uses these to preview a total; the checkout API uses them to compute
 * the amount actually charged. Keeping one definition means the figure the
 * customer is shown and the figure Stripe bills cannot drift apart.
 *
 * The server never trusts a client-supplied total -- see app/api/checkout.
 */

export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 100;
export const FLAT_SHIPPING_RATE = 10;

/** Rounds to whole cents, avoiding the float drift of naive multiplication. */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export function calculateTotals(subtotal: number, discount = 0): OrderTotals {
  const safeSubtotal = roundMoney(Math.max(0, subtotal));

  // Discount applies to goods before tax and shipping, and can never exceed
  // the subtotal -- otherwise a large fixed-amount code yields a negative
  // charge, which Stripe rejects at the API boundary rather than gracefully.
  const safeDiscount = roundMoney(Math.min(Math.max(0, discount), safeSubtotal));
  const taxable = roundMoney(safeSubtotal - safeDiscount);

  const tax = roundMoney(taxable * TAX_RATE);
  const shipping = taxable > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const total = roundMoney(taxable + tax + shipping);

  return {
    subtotal: safeSubtotal,
    tax,
    shipping,
    discount: safeDiscount,
    total,
  };
}
