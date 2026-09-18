/**
 * All possible order status values, in lifecycle order.
 * Must stay in sync with the orders.status ENUM in schema.sql.
 */
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

/**
 * Allowed forward transitions for each status.
 * Admin UI uses this map to offer only valid next-status options.
 *
 * Key: current status
 * Value: array of statuses the admin may transition TO
 */
export const STATUS_TRANSITIONS = {
  Pending:    ['Confirmed', 'Cancelled'],
  Confirmed:  ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped:    ['Delivered'],
  Delivered:  [],         // Terminal state
  Cancelled:  [],         // Terminal state
};

/**
 * Display label map for each status.
 */
export const STATUS_LABELS = {
  Pending:    'Pending',
  Confirmed:  'Confirmed',
  Processing: 'Processing',
  Shipped:    'Shipped',
  Delivered:  'Delivered',
  Cancelled:  'Cancelled',
};

/**
 * Tailwind colour classes for status badges.
 */
export const STATUS_BADGE_CLASSES = {
  Pending:    'bg-yellow-100 text-yellow-800',
  Confirmed:  'bg-blue-100 text-blue-800',
  Processing: 'bg-indigo-100 text-indigo-800',
  Shipped:    'bg-purple-100 text-purple-800',
  Delivered:  'bg-green-100 text-green-800',
  Cancelled:  'bg-red-100 text-red-800',
};
