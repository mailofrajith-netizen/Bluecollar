/**
 * Format a numeric amount as Indian Rupees using the en-IN locale.
 *
 * Examples:
 *   formatINR(1999)    => "₹1,999.00"
 *   formatINR(12500.5) => "₹12,500.50"
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
