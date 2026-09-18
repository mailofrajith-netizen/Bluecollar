/**
 * Application-level constants derived from Vite env vars.
 * All VITE_ vars are replaced at build time.
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Bluecollar';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const SHIPPING_FREE_THRESHOLD = Number(
  import.meta.env.VITE_SHIPPING_FREE_THRESHOLD ?? 1999,
);

export const SHIPPING_FLAT_CHARGE = Number(
  import.meta.env.VITE_SHIPPING_FLAT_CHARGE ?? 99,
);
