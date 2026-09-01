import React from 'react'
import { Search, X } from 'lucide-react'

/**
 * SearchInput - Unified Premium Search Bar Component
 * Features:
 * - Matching height (h-10) and rounded-xl styling
 * - Aligned search icon & instant clear button
 * - Smooth purple focus border & glow
 */
const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  disabled = false,
  autoFocus = false,
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-purple-600" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all duration-200"
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-0.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-slate-200/60 transition-colors"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
