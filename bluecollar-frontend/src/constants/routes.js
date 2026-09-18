/**
 * Centralised route path constants.
 * Import this object instead of hard-coding paths in components.
 */
export const ROUTES = {
  // Customer-facing
  HOME:               '/',
  PRODUCTS:           '/products',
  PRODUCT_DETAIL:     '/products/:slug',
  CART:               '/cart',
  CHECKOUT:           '/checkout',
  ORDER_CONFIRMATION: '/order-confirmation/:orderNumber',
  TRACK_ORDER:        '/track-order',
  LOGIN:              '/login',
  REGISTER:           '/register',
  ACCOUNT:            '/account',

  // Admin
  ADMIN_LOGIN:        '/admin/login',
  ADMIN_DASHBOARD:    '/admin',
  ADMIN_PRODUCTS:     '/admin/products',
  ADMIN_ORDERS:       '/admin/orders',
  ADMIN_ORDER_DETAIL: '/admin/orders/:id',
  ADMIN_USERS:        '/admin/users',
  ADMIN_INVOICES:     '/admin/invoices',
  ADMIN_SETTINGS:     '/admin/settings',
};

/**
 * Helper to build concrete paths from route templates.
 *
 * @example
 *   buildPath(ROUTES.PRODUCT_DETAIL, { slug: 'classic-white' })
 *   // => '/products/classic-white'
 *
 * @param {string} route  A ROUTES constant (may contain :param placeholders)
 * @param {Record<string, string|number>} params
 * @returns {string}
 */
export function buildPath(route, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, String(value)),
    route,
  );
}
