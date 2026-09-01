import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * CustomDropdown - Unified Premium Dropdown Component
 * Features:
 * - Clean rounded-xl trigger with soft border & subtle slate-50/80 background
 * - Purple glow on focus/open
 * - Floating rounded-2xl panel with subtle shadow & high z-index (z-[100])
 * - Subtle purple background & clean checkmark on selected option
 * - Aligned options with clear hover transition
 * - Outside click & ESC dismissal
 */
const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  labelPrefix = '',
  icon: Icon,
  className = '',
  align = 'left',
  minWidth = 'min-w-[160px]',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Normalize options to uniform { value, label, count } shape
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.name || opt.label,
        label: opt.label || opt.name || String(opt.value),
        count: opt.count !== undefined ? opt.count : null,
      }
    }
    return {
      value: opt,
      label: String(opt),
      count: null,
    }
  })

  // Find currently selected item
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value).toLowerCase() === String(value).toLowerCase()
  )

  const displayLabel = selectedOption ? selectedOption.label : placeholder

  // Dismiss dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (optValue) => {
    if (disabled) return
    onChange(optValue)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${minWidth} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between gap-2 select-none cursor-pointer ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-gray-400 cursor-not-allowed opacity-60'
            : isOpen
            ? 'bg-white border-purple-500 ring-2 ring-purple-500/20 text-purple-900 shadow-sm'
            : 'bg-slate-50/80 border-slate-200 text-gray-700 hover:bg-white hover:border-purple-300 hover:shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
          {labelPrefix && (
            <span className="font-extrabold text-purple-700 shrink-0">{labelPrefix}</span>
          )}
          <span className="truncate font-semibold">{displayLabel}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedOption && selectedOption.count !== null && (
            <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full">
              {selectedOption.count}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-purple-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-full min-w-[200px] max-w-xs bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-[100] space-y-0.5 max-h-80 overflow-y-auto animate-fadeIn select-none`}
        >
          {normalizedOptions.length > 0 ? (
            normalizedOptions.map((opt) => {
              const isSelected =
                String(opt.value).toLowerCase() === String(value).toLowerCase()

              return (
                <div
                  key={String(opt.value)}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200/70 shadow-2xs'
                      : 'text-gray-700 hover:bg-purple-50/70 hover:text-purple-700 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
                      ) : (
                        <span className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {opt.count !== null && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                        isSelected ? 'bg-purple-200/80 text-purple-800' : 'bg-slate-100 text-gray-500'
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                </div>
              )
            })
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400 text-center">No options available</div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomDropdown
