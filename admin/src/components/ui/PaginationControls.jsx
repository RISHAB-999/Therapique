import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react'

/**
 * PaginationControls - Unified Premium Pagination Component
 * Features:
 * - Premium custom Rows dropdown with smooth popover & checkmarks
 * - Clean page number pills with ellipsis
 * - Prev/Next icon buttons with disabled states
 * - Fully responsive with subtle shadows & purple accents
 */
const PaginationControls = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'records',
  rowsOptions = [10, 25, 50],
  rowsDirection = 'up',
  className = '',
}) => {
  const [isRowsOpen, setIsRowsOpen] = useState(false)
  const rowsDropdownRef = useRef(null)

  // Dismiss Rows dropdown on outside click or ESC
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
      className={`px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs ${className}`}
    >
      {/* Left: Showing info & Custom Rows dropdown */}
      <div className="flex items-center gap-3 text-gray-500 font-medium">
        <span>
          Showing <strong className="text-gray-800 font-bold">{startIndex + 1}</strong>–
          <strong className="text-gray-800 font-bold">{endIndex}</strong> of{' '}
          <strong className="text-gray-800 font-bold">{totalItems}</strong> {itemLabel}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-[11px] text-gray-400 font-semibold">Rows:</span>
            <div ref={rowsDropdownRef} className="relative inline-block">
              {/* Custom Rows Trigger Button */}
              <button
                type="button"
                onClick={() => setIsRowsOpen((prev) => !prev)}
                className={`h-8 px-2.5 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-1.5 select-none cursor-pointer ${
                  isRowsOpen
                    ? 'bg-white border-purple-500 ring-2 ring-purple-500/20 text-purple-900 shadow-xs'
                    : 'bg-white border-slate-200 text-gray-700 hover:border-purple-300 hover:bg-slate-50 shadow-2xs'
                }`}
                title="Select rows per page"
              >
                <span className="font-extrabold">{itemsPerPage}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isRowsOpen ? 'rotate-180 text-purple-600' : 'text-gray-400'
                  }`}
                />
              </button>

              {/* Floating Menu (opens upward by default so it never clips at table/card bottom) */}
              {isRowsOpen && (
                <div
                  className={`absolute ${
                    rowsDirection === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                  } left-0 min-w-[76px] bg-white border border-slate-200/90 rounded-xl shadow-xl p-1 z-50 space-y-0.5 select-none animate-fadeIn`}
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
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 text-purple-900 border border-purple-200/70 shadow-2xs'
                            : 'text-gray-700 hover:bg-purple-50/70 hover:text-purple-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                            {isSelected ? (
                              <Check className="w-3 h-3 text-purple-600 stroke-[2.5]" />
                            ) : (
                              <span className="w-3 h-3" />
                            )}
                          </div>
                          <span>{opt}</span>
                        </div>
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
          className="p-1.5 rounded-xl border border-slate-200 bg-white text-gray-600 hover:bg-slate-50 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
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
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-gray-700 hover:bg-slate-50 hover:border-purple-300'
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
          className="p-1.5 rounded-xl border border-slate-200 bg-white text-gray-600 hover:bg-slate-50 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PaginationControls
