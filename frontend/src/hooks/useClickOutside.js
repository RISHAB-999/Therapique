import { useEffect } from 'react'

/**
 * Reusable hook to handle clicks outside a referenced element and optional Escape key dismissal.
 * @param {React.RefObject} ref - Reference to the target container DOM element
 * @param {Function} callback - Function invoked when click outside occurs
 * @param {boolean|Object} [options=true] - Active boolean flag or options object { active: boolean, onEscape?: Function }
 */
export const useClickOutside = (ref, callback, options = true) => {
  const active = typeof options === 'boolean' ? options : (options.active ?? true)
  const onEscape = typeof options === 'object' && options ? options.onEscape : null

  useEffect(() => {
    if (!active) return

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        if (callback) callback(event)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape(event)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    if (onEscape) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (onEscape) {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [ref, callback, active, onEscape])
}

export default useClickOutside
