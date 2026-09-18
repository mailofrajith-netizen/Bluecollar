/**
 * Returns true if the string is a valid email address.
 * Uses a broad RFC-5322 inspired pattern sufficient for user-facing validation.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

/**
 * Returns true if the string is a valid Indian mobile number.
 * Rules: exactly 10 digits, first digit must be 6, 7, 8, or 9.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidPhone(value) {
  return /^[6-9]\d{9}$/.test(String(value).trim());
}

/**
 * Returns true if the string is a valid Indian postal (PIN) code.
 * Rules: exactly 6 digits.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidPincode(value) {
  return /^\d{6}$/.test(String(value).trim());
}
