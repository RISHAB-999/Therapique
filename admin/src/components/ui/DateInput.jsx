import React from 'react'
import { Calendar, X } from 'lucide-react'

/**
 * DateInput - Unified Premium Date Picker Component
 * Features:
 * - Matches h-10, rounded-xl, and slate-50/80 styling
 * - Clean left calendar icon with purple branding
 * - Instant clear button when date is selected
 * - Smooth purple focus border & glow
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
      <div className="relative flex items-center">
        <Calendar className="w-3.5 h-3.5 text-purple-600 absolute left-3.5 pointer-events-none shrink-0" />
        <input
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          min={min}
          max={max}
          className="h-10 pl-9 pr-8 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-white hover:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all duration-200 cursor-pointer shadow-2xs"
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 p-1 text-gray-400 hover:text-gray-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
