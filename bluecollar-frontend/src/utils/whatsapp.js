/**
 * Build a WhatsApp deep-link for order sharing.
 *
 * @param {string} orderNumber  The order number (e.g. "BC-20260517-0001")
 * @param {string} trackUrl     Absolute URL to the track-order page
 * @returns {string}            wa.me deep-link with pre-filled message
 */
export function buildWhatsAppURL(orderNumber, trackUrl) {
  const message = `Hi! I placed an order on Bluecollar.\n\nOrder #: ${orderNumber}\nTrack: ${trackUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
