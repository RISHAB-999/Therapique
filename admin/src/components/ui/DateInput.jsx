import React, { useRef } from 'react'
import { Calendar, X, ChevronDown } from 'lucide-react'

const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * DateInput - Unified Premium Responsive Date Filter Component
 * 
 * Features:
 * - Shows an explicit placeholder suggestion ("Date: All Dates") when unselected,
 *   resolving the blank empty box issue on mobile devices.
 * - Formats chosen dates legibly as "DD-MM-YYYY" (e.g. "01-09-2026") so text
 *   is never truncated/clipped to "01/0".
 * - Fully transparent overlaid native date input ensures tapping anywhere
 *   triggers the OS native calendar modal on iOS/Android and desktop browsers.
 * - Clear button (X) on the right for instant reset.
 * - Matches CustomDropdown in height (h-10), rounded-xl, and theme.
 */
const DateInput = ({
  value,
  onChange,
  onClear,
  labelPrefix = 'Date:',
  placeholder = 'dd-mm-yyyy',
  className = '',
  disabled = false,
  min,
  max,
}) => {
  const inputRef = useRef(null)

  // Format YYYY-MM-DD value into clean "DD-MM-YYYY"
  const getDisplayText = () => {
    if (!value) return null
    const parts = String(value).split('-')
    if (parts.length === 3) {
      const year = parts[0]
      const monthNum = parseInt(parts[1], 10)
      const monthPad = parts[1].padStart(2, '0')
      const day = parts[2].padStart(2, '0')
      const monthStr = months[monthNum] || monthPad
      return `${day}-${monthPad}-${year}`
    }
    return value
  }

  const displayText = getDisplayText()

  const handleContainerClick = () => {
    if (disabled) return
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker()
        } catch {
          inputRef.current.focus()
        }
      } else {
        inputRef.current.focus()
      }
    }
  }

  return (
    <div
      onClick={handleContainerClick}
      className={`relative h-10 px-3.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between gap-2 select-none cursor-pointer bg-slate-50/80 border-slate-200 text-gray-700 hover:bg-white hover:border-purple-300 hover:shadow-2xs min-w-full sm:min-w-[175px] ${
        disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
      } ${className}`}
    >
      {/* Transparent native date input overlay handles native click/tap and accessibility */}
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label={labelPrefix ? `${labelPrefix} filter` : 'Filter by Date'}
      />

      {/* Visible styled layer */}
      <div className="flex items-center gap-2 min-w-0 truncate pointer-events-none">
        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        {labelPrefix && (
          <span className="font-extrabold text-purple-700 shrink-0">{labelPrefix}</span>
        )}
        {displayText ? (
          <span className="font-bold text-gray-800 truncate">{displayText}</span>
        ) : (
          <span className="font-semibold text-gray-400 truncate">{placeholder}</span>
        )}
      </div>

      {/* Clear button (z-20 so clicks don't re-trigger date picker) or Chevron */}
      <div className="flex items-center gap-1 shrink-0 ml-1 z-20">
        {value && onClear ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        )}
      </div>
    </div>
  )
}

export default DateInput
