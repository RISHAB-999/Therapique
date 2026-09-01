import React, { useState, useEffect, useRef } from 'react'

const TypewriterSearchInput = ({
  value = '',
  onChange,
  onClear,
  onSubmit,
  placeholders = ['Search...'],
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
      className={`relative flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:border-purple-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-100 ${className}`}
    >
      <div className="pl-3.5 flex items-center pointer-events-none text-slate-500 shrink-0">
        <svg className="w-4 h-4 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      <div className="relative flex-1 min-w-0 px-2.5 py-2 flex items-center">
        {/* Animated Typewriter Placeholder: Strict conditional rendering only when input has 0 text */}
        {isInputEmpty && (
          <div className="absolute inset-0 pl-2.5 flex items-center pointer-events-none text-xs sm:text-sm text-slate-400 font-semibold select-none overflow-hidden whitespace-nowrap">
            <span>{displayText}</span>
            <span className="w-1 h-3.5 bg-slate-400 ml-0.5 animate-pulse inline-block align-middle" />
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
          className={`w-full outline-none text-xs sm:text-sm font-semibold text-gray-800 bg-transparent relative z-10 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden ${inputClassName}`}
        />
      </div>

      {value && value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="pr-3.5 flex items-center text-gray-400 hover:text-gray-700 font-bold text-xs cursor-pointer relative z-20"
        >
          ✕
        </button>
      )}
    </form>
  )
}

export default TypewriterSearchInput
