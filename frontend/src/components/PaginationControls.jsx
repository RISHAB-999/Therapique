import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react'

/**
 * PaginationControls - Premium Pagination Component for Therapique Frontend
 * Features:
 * - "Showing X–Y of Z items" count summary
 * - Custom Rows-per-page dropdown with checkmark and upward popover
 * - Page number pills with ellipsis
 * - Prev/Next navigation with disabled state
 * - Styled to match Frontend's warm, elegant theme (#FAF5EE, #EADBCE, #1E1138)
 */
const PaginationControls = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'items',
  rowsOptions = [6, 12, 24, 48],
  rowsDirection = 'up',
  className = '',
}) => {
  const [isRowsOpen, setIsRowsOpen] = useState(false)
  const rowsDropdownRef = useRef(null)

  // Dismiss dropdown on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(e.target)) {
        setIsRowsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsRowsOpen(false)
    }

    if (isRowsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRowsOpen])

  if (totalItems <= 0) return null

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  return (
    <div
      className={`px-5 py-4 bg-[#FAF5EE]/90 border border-[#EADBCE] rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 select-none text-xs ${className}`}
    >
      {/* Left: Showing info & Rows selector */}
      <div className="flex items-center gap-3 text-gray-600 font-medium">
        <span>
          Showing <strong className="text-[#1E1138] font-bold">{startIndex + 1}</strong>–
          <strong className="text-[#1E1138] font-bold">{endIndex}</strong> of{' '}
          <strong className="text-[#1E1138] font-bold">{totalItems}</strong> {itemLabel}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-[#EADBCE] pl-3">
            <span className="text-[11px] text-gray-500 font-semibold">Rows:</span>
            <div ref={rowsDropdownRef} className="relative inline-block">
              {/* Rows Button */}
              <button
                type="button"
                onClick={() => setIsRowsOpen((prev) => !prev)}
                className={`h-8 px-2.5 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-1.5 select-none cursor-pointer ${
                  isRowsOpen
                    ? 'bg-white border-[#1E1138] ring-2 ring-[#1E1138]/20 text-[#1E1138] shadow-xs'
                    : 'bg-white border-[#EADBCE] text-gray-800 hover:border-[#856C5B] hover:bg-[#FAF5EE] shadow-2xs'
                }`}
                title="Select items per page"
              >
                <span className="font-extrabold">{itemsPerPage}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isRowsOpen ? 'rotate-180 text-[#1E1138]' : 'text-gray-400'
                  }`}
                />
              </button>

              {/* Floating Menu */}
              {isRowsOpen && (
                <div
                  className={`absolute ${
                    rowsDirection === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                  } left-0 min-w-[76px] bg-white border border-[#EADBCE] rounded-xl shadow-xl p-1 z-50 space-y-0.5 select-none animate-fadeIn`}
                >
                  {rowsOptions.map((opt) => {
                    const isSelected = Number(opt) === Number(itemsPerPage)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          onItemsPerPageChange(Number(opt))
                          setIsRowsOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E1138] text-white shadow-2xs font-extrabold'
                            : 'text-gray-700 hover:bg-[#FAF5EE] hover:text-[#1E1138]'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-xl border border-[#EADBCE] bg-white text-gray-700 hover:bg-[#FAF5EE] hover:border-[#856C5B] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Pills */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
            })
            .map((p, idx, arr) => {
              const prevP = arr[idx - 1]
              const showEllipsis = prevP && p - prevP > 1

              return (
                <React.Fragment key={p}>
                  {showEllipsis && (
                    <span className="px-1 text-xs text-gray-400 font-bold">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                      currentPage === p
                        ? 'bg-[#1E1138] text-white shadow-xs'
                        : 'bg-white border border-[#EADBCE] text-gray-700 hover:bg-[#FAF5EE] hover:border-[#856C5B]'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              )
            })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-xl border border-[#EADBCE] bg-white text-gray-700 hover:bg-[#FAF5EE] hover:border-[#856C5B] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PaginationControls
