/**
 * Shared Image Sanitization and Helper Utilities for Therapique
 */

/**
 * Sanitizes image URL to replace local development host with active tunnel/backend URL.
 * Safely handles undefined/null values, arrays, and string formats.
 * @param {string|string[]} img - Image URL or array of URLs
 * @param {string} [backendUrl=''] - Optional backend URL override
 * @returns {string} Sanitized image URL
 */
export const sanitizeImageUrl = (img, backendUrl = '') => {
  if (!img) return ''
  const url = Array.isArray(img) ? img[0] : img
  if (typeof url !== 'string') return ''

  if (backendUrl && (url.startsWith('http://localhost:4000') || url.startsWith('http://127.0.0.1:4000'))) {
    return url.replace(/^http:\/\/(localhost|127\.0\.0\.1):4000/, backendUrl)
  }
  return url
}

export default sanitizeImageUrl
