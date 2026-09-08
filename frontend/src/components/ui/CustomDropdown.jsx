import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'

/**
 * CustomDropdown - Unified Frontend Dropdown Component
 * Features:
 * - Styled for Therapique's warm aesthetic (#FAF5EE, #EADBCE, #1E1138, #7C3AED)
 * - Clean rounded-xl trigger with soft border & consistent h-10 height
 * - Purple glow on focus/open
 * - Floating rounded-2xl panel with subtle shadow & high z-index (z-[100])
 * - Viewport bounds safety (never extends outside screen or gets clipped)
 * - Subtle purple background & left checkmark on selected option
 * - Touch-friendly padding (min 40px touch targets)
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
  const [openDirection, setOpenDirection] = useState('down')
  const [panelMaxHeight, setPanelMaxHeight] = useState(288)
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

  // Dynamically compute optimal dropdown open direction (up vs down) and maxHeight
  const calculatePosition = () => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const estimatedPanelHeight = Math.min(normalizedOptions.length * 40 + 20, 260)

    // If space below is less than required and there's more space above, flip upward
    if (spaceBelow < estimatedPanelHeight && spaceAbove > spaceBelow) {
      setOpenDirection('up')
      setPanelMaxHeight(Math.max(130, Math.min(spaceAbove - 16, 280)))
    } else {
      setOpenDirection('down')
      setPanelMaxHeight(Math.max(130, Math.min(spaceBelow - 16, 280)))
    }
  }

  // Dismiss dropdown on outside click or Escape key
  useClickOutside(containerRef, () => setIsOpen(false), {
    active: isOpen,
    onEscape: () => setIsOpen(false)
  })

  // Recalculate position on open, resize, and scroll
  useEffect(() => {
    if (isOpen) {
      calculatePosition()
      window.addEventListener('resize', calculatePosition)
      window.addEventListener('scroll', calculatePosition, true)
    }
    return () => {
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('scroll', calculatePosition, true)
    }
  }, [isOpen, normalizedOptions.length])

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
        onClick={() => {
          if (!isOpen) calculatePosition()
          setIsOpen(!isOpen)
        }}
        className={`w-full h-10 px-3.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between gap-2 select-none cursor-pointer ${
          disabled
            ? 'bg-[#F3E8DE]/50 border-[#EADBCE] text-gray-400 cursor-not-allowed opacity-60'
            : isOpen
            ? 'bg-[#FAF5EE] border-black ring-2 ring-black/10 text-black shadow-sm'
            : 'bg-[#FAF5EE] border-[#EADBCE] text-gray-800 hover:bg-white hover:border-black/30 hover:shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-black shrink-0" />}
          {labelPrefix && (
            <span className="font-extrabold text-black shrink-0">{labelPrefix}</span>
          )}
          <span className="truncate font-semibold">{displayLabel}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedOption && selectedOption.count !== null && (
            <span className="text-[10px] font-black bg-black text-white px-1.5 py-0.2 rounded-full">
              {selectedOption.count}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-black' : ''
            }`}
          />
        </div>
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            openDirection === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } w-full min-w-[180px] max-w-[calc(100vw-2rem)] bg-[#FDF7F3] border border-[#EADBCE] rounded-2xl shadow-xl p-1.5 z-[100] space-y-0.5 overflow-y-auto select-none`}
          style={{
            maxHeight: `${panelMaxHeight}px`,
            boxShadow: '0 12px 32px -4px rgba(0,0,0,0.12), 0 4px 16px -2px rgba(0,0,0,0.06)'
          }}
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
                      ? 'bg-black text-white font-bold border border-black shadow-2xs'
                      : 'text-gray-700 hover:bg-[#F3E8DE] hover:text-black font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                      ) : (
                        <span className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {opt.count !== null && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#EADBCE]/50 text-gray-600'
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
