import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sanitizeImageUrl as sanitizeImgHelper } from '../utils/imageHelper'

export const ShopContext = createContext()

const ShopContextProvider = ({ children }) => {
  const navigate = useNavigate()
  // LAZY INITIALIZATION: Load books from sessionStorage cache synchronously on page load / refresh
  const [books, setBooks] = useState(() => {
    try {
      const cached = sessionStorage.getItem('cached_books')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.log('Error reading cached books:', e)
    }
    return []
  })
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const [method, setMethod] = useState("COD")
  const delivery_charges = 100

  const envBackendUrl = import.meta.env.VITE_BACKEND_URL
  const backendUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000'
    : (envBackendUrl || 'http://localhost:4000')

  // LAZY INITIALIZATION: Load cart from localStorage synchronously to prevent race condition erasure
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cartItems")
      if (storedCart) {
        const parsed = JSON.parse(storedCart)
        const migrated = {}
        Object.entries(parsed).forEach(([key, qty]) => {
          const quantity = Number(qty)
          if (quantity > 0) {
            if (key.includes('___')) {
              migrated[key] = quantity
            } else {
              migrated[`${key}___Standard Paperback`] = quantity
            }
          }
        })
        return migrated
      }
    } catch (e) {
      console.log('Error reading initial cart state:', e)
    }
    return {}
  })

  // Synchronize cart changes to localStorage safely
  useEffect(() => {
    try {
      if (cartItems && typeof cartItems === 'object') {
        localStorage.setItem("cartItems", JSON.stringify(cartItems))
      }
    } catch (e) {
      console.log('Error saving cart state:', e)
    }
  }, [cartItems])

  // Helper to rewrite hardcoded localhost:4000 URLs to active tunnel/backend URL
  const sanitizeImageUrl = useCallback((img) => sanitizeImgHelper(img, backendUrl), [backendUrl])

  // Fetch books dynamically from backend API
  const getBooksData = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/book/list`)
      const data = await response.json()
      if (data.success && data.books && data.books.length > 0) {
        const uniqueBooksMap = new Map()
        data.books.forEach(b => {
          if (!uniqueBooksMap.has(b.title)) {
            const rawImgs = Array.isArray(b.image) ? b.image : [b.image]
            const cleanImgs = rawImgs.map(sanitizeImageUrl)

            uniqueBooksMap.set(b.title, {
              _id: String(b._id),
              id: String(b._id),
              name: b.title,
              title: b.title,
              author: b.author,
              description: b.description,
              price: Number(b.price) || 0,
              offerPrice: Number(b.price) || 0,
              category: b.category,
              sizes: b.sizes || ["Standard Paperback"],
              outOfStockSizes: b.outOfStockSizes || [],
              image: cleanImgs,
              inStock: b.inStock !== false
            })
          }
        })
        const newBooks = Array.from(uniqueBooksMap.values())
        try {
          sessionStorage.setItem('cached_books', JSON.stringify(newBooks))
        } catch (e) { }
        setBooks(prev => {
          if (prev.length === newBooks.length && prev[0]?._id === newBooks[0]?._id && prev[prev.length - 1]?._id === newBooks[newBooks.length - 1]?._id) {
            return prev
          }
          return newBooks
        })
      }
    } catch (error) {
      console.log('Error fetching books from backend:', error)
    }
  }

  useEffect(() => {
    let lastFetchTime = Date.now()

    getBooksData()

    // Background polling every 60 seconds — book stock changes infrequently
    const interval = setInterval(() => {
      getBooksData()
      lastFetchTime = Date.now()
    }, 60000)

    // Tab focus/visibility sync — debounced to skip if fetched within 15s
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'hidden') return
      const now = Date.now()
      if (now - lastFetchTime < 15000) return
      lastFetchTime = now
      getBooksData()
    }

    window.addEventListener('focus', handleFocusOrVisibility)
    document.addEventListener('visibilitychange', handleFocusOrVisibility)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocusOrVisibility)
      document.removeEventListener('visibilitychange', handleFocusOrVisibility)
    }
  }, [backendUrl, sanitizeImageUrl])

  // Helper to calculate exact price based on book and chosen edition format
  // Pure function — no dependencies, safe to reference without useCallback
  const getBookPriceWithFormat = useCallback((book, format = 'Standard Paperback') => {
    if (!book) return 0
    const basePrice = Number(book.offerPrice) || Number(book.price) || 0
    if (format === 'Deluxe Hardcover' || format === 'Hardcover') return basePrice + 400
    if (format === 'Pocket / Travel Edition') return Math.max(100, basePrice - 200)
    if (format === 'E-Book') return Math.max(100, basePrice - 300)
    if (format === 'Audiobook') return Math.max(100, basePrice - 100)
    return basePrice
  }, [])

  // Add item with specific format to cart
  const addToCart = useCallback((itemId, selectedFormat = 'Standard Paperback') => {
    const targetBook = books.find(b => String(b._id) === String(itemId) || String(b.id) === String(itemId))
    if (targetBook) {
      const isFormatOut = targetBook.inStock === false || (targetBook.outOfStockSizes && targetBook.outOfStockSizes.some(s => s && s.trim().toLowerCase() === selectedFormat.trim().toLowerCase()))
      if (isFormatOut) {
        toast.error(`'${selectedFormat}' for this book is currently out of stock!`)
        return
      }
    }
    const cartKey = `${itemId}___${selectedFormat}`
    setCartItems(prev => {
      const updated = { ...(prev || {}) }
      updated[cartKey] = (Number(updated[cartKey]) || 0) + 1
      try {
        localStorage.setItem("cartItems", JSON.stringify(updated))
      } catch (e) { }
      return updated
    })
    toast.success('Added to cart!')
  }, [books])

  // Update format edition of an existing item entry in cart
  const updateCartFormat = useCallback((oldKey, newFormat) => {
    const parts = oldKey.split('___')
    const itemId = parts[0]
    const newKey = `${itemId}___${newFormat}`

    if (oldKey === newKey) return

    setCartItems(prev => {
      const updated = { ...(prev || {}) }
      const qty = Number(updated[oldKey]) || 1
      delete updated[oldKey]
      updated[newKey] = (Number(updated[newKey]) || 0) + qty
      try {
        localStorage.setItem("cartItems", JSON.stringify(updated))
      } catch (e) { }
      return updated
    })
  }, [])

  // Update quantity of a specific cart item entry
  const updateQuantity = useCallback((cartKey, quantity) => {
    setCartItems(prev => {
      const updated = { ...(prev || {}) }
      const numQty = Number(quantity)
      if (numQty <= 0) {
        delete updated[cartKey]
      } else {
        updated[cartKey] = numQty
      }
      try {
        localStorage.setItem("cartItems", JSON.stringify(updated))
      } catch (e) { }
      return updated
    })
  }, [])

  // Total count of all items in cart
  const getCartCount = useCallback(() => {
    if (!cartItems || typeof cartItems !== 'object') return 0
    return Object.values(cartItems).reduce((sum, qty) => sum + (Number(qty) || 0), 0)
  }, [cartItems])

  // Total monetary amount of cart
  const getCartAmount = useCallback(() => {
    if (!cartItems || typeof cartItems !== 'object' || !books || books.length === 0) return 0
    return Object.entries(cartItems).reduce((total, [cartKey, qty]) => {
      const quantity = Number(qty) || 0
      if (quantity <= 0) return total
      const [itemId, format] = cartKey.split('___')
      const book = books.find(b => String(b._id) === String(itemId) || String(b.id) === String(itemId))
      if (!book) return total
      const price = getBookPriceWithFormat(book, format || 'Standard Paperback')
      return total + price * quantity
    }, 0)
  }, [cartItems, books, getBookPriceWithFormat])

  const value = useMemo(() => ({
    books,
    navigate,
    user,
    setUser,
    currency,
    searchQuery,
    setSearchQuery,
    cartItems,
    setCartItems,
    updateCartFormat,
    getBookPriceWithFormat,
    addToCart,
    getCartAmount,
    getCartCount,
    updateQuantity,
    method,
    setMethod,
    delivery_charges,
    backendUrl,
    sanitizeImageUrl
  }), [books, navigate, user, currency, searchQuery, cartItems, updateCartFormat, addToCart, getCartAmount, getCartCount, updateQuantity, method, backendUrl, sanitizeImageUrl, getBookPriceWithFormat])

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider
