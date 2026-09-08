import React from 'react'
import { Calendar, X } from 'lucide-react'

/**
 * DateInput - Unified Frontend Date Picker Component
 * Features:
 * - Matches h-10, rounded-xl, and #FAF5EE/#EADBCE warm styling
 * - Clean left calendar icon with purple branding (#7C3AED)
 * - Instant clear button when date is selected
 * - Smooth purple focus ring & border
 */
const DateInput = ({
  value,
  onChange,
  onClear,
  className = '',
  disabled = false,
  min,
  max,
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative flex items-center w-full">
        <Calendar className="w-3.5 h-3.5 text-[#7C3AED] absolute left-3.5 pointer-events-none shrink-0" />
        <input
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          min={min}
          max={max}
          className="w-full h-10 pl-9 pr-8 bg-[#FAF5EE] border border-[#EADBCE] rounded-xl text-xs font-semibold text-gray-800 hover:bg-white hover:border-[#7C3AED]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all duration-200 cursor-pointer shadow-2xs"
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 p-1 text-gray-400 hover:text-gray-700 hover:bg-[#F3E8DE] rounded-lg transition-colors cursor-pointer"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default DateInput
