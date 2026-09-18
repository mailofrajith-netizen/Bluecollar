/**
 * Compute the shipping charge for a given cart subtotal.
 *
 * Thresholds are read from Vite env vars (set at build time):
 *   VITE_SHIPPING_FREE_THRESHOLD — subtotal at/above which shipping is free
 *   VITE_SHIPPING_FLAT_CHARGE   — flat rate charged when below threshold
 *
 * Returns 0 (free shipping) or the flat charge amount.
 */
export function computeShipping(subtotal) {
  const threshold = Number(import.meta.env.VITE_SHIPPING_FREE_THRESHOLD ?? 1999);
  const flatCharge = Number(import.meta.env.VITE_SHIPPING_FLAT_CHARGE ?? 99);

  return subtotal >= threshold ? 0 : flatCharge;
}
