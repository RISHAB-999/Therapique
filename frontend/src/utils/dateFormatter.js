/**
 * Shared Date Formatting Utilities for Therapique
 */

export const MONTH_NAMES = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
]

export const FULL_MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

/**
 * Formats a slotDate string formatted as DD_MM_YYYY (e.g. "20_08_2026") into "20 Aug 2026".
 * @param {string} slotDate - Slot date string in format "DD_MM_YYYY"
 * @returns {string} Formatted human-readable date
 */
export const formatSlotDate = (slotDate) => {
  if (!slotDate) return ''
  const dateArray = String(slotDate).split('_')
  if (dateArray.length < 3) return String(slotDate)
  const monthIdx = Number(dateArray[1])
  const monthStr = MONTH_NAMES[monthIdx] || dateArray[1]
  return `${dateArray[0]} ${monthStr} ${dateArray[2]}`
}

// Convenient alias for backwards compatibility
export const slotDateFormat = formatSlotDate

/**
 * Formats a timestamp or date into a standard short date string.
 * @param {Date|number|string} dateInput
 * @returns {string}
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth() + 1]} ${d.getFullYear()}`
}
