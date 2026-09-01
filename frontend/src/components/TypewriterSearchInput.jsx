import React, { useState, useEffect, useRef } from 'react'
import { FiSearch } from 'react-icons/fi'
import { X } from 'lucide-react'

const TypewriterSearchInput = ({
  value = '',
  onChange,
  onClear,
  onSubmit,
  placeholders = ['Search...'],
  isMorphing = false,
  isOpen = false,
  onToggleOpen,
  className = '',
  inputClassName = '',
  autoFocus = false,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDelay = 1800,
}) => {
  const [displayText, setDisplayText] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const inputRef = useRef(null)

  const isInputEmpty = !value || value.length === 0

  // Typewriter effect only runs when input is strictly empty
  useEffect(() => {
    if (!isInputEmpty) {
      setDisplayText('')
      return
    }

    const currentFullText = placeholders[placeholderIndex % placeholders.length] || ''
    let timer

    if (isDeleting) {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length - 1))
        }, deletingSpeed)
      } else {
        setIsDeleting(false)
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
      }
    } else {
      if (displayText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length + 1))
        }, typingSpeed)
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, pauseDelay)
      }
    }

    return () => clearTimeout(timer)
  }, [displayText, isDeleting, placeholderIndex, placeholders, isInputEmpty, typingSpeed, deletingSpeed, pauseDelay])

  // Form submission handler (works for Desktop Enter + Mobile Keyboard Search/Go/Done button)
  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (inputRef.current) {
      inputRef.current.blur() // dismiss mobile virtual keyboard
    }
    if (onSubmit) {
      onSubmit(value)
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    if (onClear) {
      onClear()
    } else if (onChange) {
      onChange({ target: { value: '' } })
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <form
      action="javascript:void(0);"
      onSubmit={handleFormSubmit}
      onClick={isMorphing && !isOpen ? onToggleOpen : undefined}
      className={`flex items-center transition-all duration-500 ease-in-out overflow-hidden bg-[#FAF5EE] border border-[#EADBCE] rounded-full shadow-xs hover:border-[#D4C3B3] relative ${
        isMorphing
          ? isOpen
            ? 'w-64 sm:w-80 px-3.5 py-2'
            : 'w-10 h-10 justify-center p-0 hover:bg-[#F3E8DE] cursor-pointer'
          : 'w-full px-3.5 py-2'
      } ${className}`}
      style={{ minHeight: '40px' }}
    >
      <button
        type="button"
        onClick={(e) => {
          if (isMorphing) {
            e.stopPropagation()
            if (onToggleOpen) onToggleOpen()
          }
        }}
        aria-label={isMorphing && isOpen ? "Close search" : "Search"}
        className={`text-gray-800 cursor-pointer shrink-0 hover:text-black transition-colors focus:outline-none flex items-center justify-center p-0 m-0 bg-transparent border-0 ${
          isMorphing && !isOpen ? 'pointer-events-none' : ''
        }`}
      >
        <FiSearch size={18} />
      </button>

      {/* Only render content when open or non-morphing, while parent smoothly morphs width */}
      {(!isMorphing || isOpen) && (
        <>
          <div className="relative flex-1 min-w-0 ml-2.5 flex items-center">
            {/* Animated Typewriter Placeholder: Strict conditional rendering only when input has 0 text */}
            {isInputEmpty && (
              <div className="absolute inset-0 flex items-center pointer-events-none text-xs sm:text-sm text-gray-400 font-medium select-none overflow-hidden whitespace-nowrap">
                <span>{displayText}</span>
                <span className="w-1 h-3.5 bg-gray-400/70 ml-0.5 animate-pulse inline-block align-middle" />
              </div>
            )}

            <input
              ref={inputRef}
              type="search"
              name="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={value}
              onChange={onChange}
              autoFocus={autoFocus}
              className={`w-full outline-none text-xs sm:text-sm text-gray-900 bg-transparent font-medium relative z-10 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden ${inputClassName}`}
            />
          </div>

          {value && value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="text-gray-500 hover:text-gray-900 p-1 shrink-0 cursor-pointer transition-colors relative z-20"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </form>
  )
}

export default TypewriterSearchInput
