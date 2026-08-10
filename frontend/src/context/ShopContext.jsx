import React, { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export const ShopContext = createContext()

const ShopContextProvider = ({ children }) => {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const [cartItems, setCartItems] = useState({})
  const [method, setMethod] = useState("COD")
  const delivery_charges = 100

  // Load cart from localStorage with automatic migration for composite keys (itemId___format)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cartItems")
      if (storedCart) {
        const parsed = JSON.parse(storedCart)
        const migrated = {}
        Object.entries(parsed).forEach(([key, qty]) => {
          if (qty > 0) {
            if (key.includes('___')) {
              migrated[key] = qty
            } else {
              // Migration for legacy simple keys
              migrated[`${key}___Standard Paperback`] = qty
            }
          }
        })
        setCartItems(migrated)
      }
    } catch (e) {
      console.log('Error reading cart state:', e)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems))
  }, [cartItems])

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  // Fetch books dynamically from backend API
  const getBooksData = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/book/list`)
      const data = await response.json()
      if (data.success && data.books && data.books.length > 0) {
        // Deduplicate books by title so no duplicate cards appear
        const uniqueBooksMap = new Map()
        data.books.forEach(b => {
          if (!uniqueBooksMap.has(b.title)) {
            uniqueBooksMap.set(b.title, {
              _id: b._id,
              id: b._id,
              name: b.title,
              title: b.title,
              author: b.author,
              description: b.description,
              price: b.price,
              offerPrice: b.price,
              category: b.category,
              sizes: b.sizes || ["Paperback"],
              outOfStockSizes: b.outOfStockSizes || [],
              image: Array.isArray(b.image) ? b.image : [b.image],
              inStock: b.inStock
            })
          }
        })
        const newBooks = Array.from(uniqueBooksMap.values())
        setBooks(prev => {
          if (JSON.stringify(prev) === JSON.stringify(newBooks)) {
            return prev
          }
          return newBooks
        })
      } else {
        setBooks([])
      }
    } catch (error) {
      console.log('Error fetching books from backend:', error)
      setBooks([])
    }
  }

  useEffect(() => {
    getBooksData()
    const interval = setInterval(() => {
      getBooksData()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Helper to calculate exact price based on book and chosen edition format
  const getBookPriceWithFormat = (book, format = 'Standard Paperback') => {
    if (!book) return 0
    if (format === 'Deluxe Hardcover' || format === 'Hardcover') return book.offerPrice + 400
    if (format === 'Pocket / Travel Edition') return Math.max(100, book.offerPrice - 200)
    if (format === 'E-Book') return Math.max(100, book.offerPrice - 300)
    if (format === 'Audiobook') return Math.max(100, book.offerPrice - 100)
    return book.offerPrice
  }

  // Add item with specific format to cart
  const addToCart = (itemId, selectedFormat = 'Standard Paperback') => {
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
      const updated = { ...prev }
      updated[cartKey] = (updated[cartKey] || 0) + 1
      return updated
    })
    toast.success('Added to cart!')
  }

  // Update format edition of an existing item entry in cart
  const updateCartFormat = (oldKey, newFormat) => {
    const parts = oldKey.split('___')
    const itemId = parts[0]
    const newKey = `${itemId}___${newFormat}`

    if (oldKey === newKey) return

    setCartItems(prev => {
      const updated = { ...prev }
      const qty = updated[oldKey] || 1
      delete updated[oldKey]
      updated[newKey] = (updated[newKey] || 0) + qty
      return updated
    })
  }

  // Update quantity of a specific cart item entry
  const updateQuantity = (cartKey, quantity) => {
    setCartItems(prev => {
      const updated = { ...prev }
      if (quantity <= 0) {
        delete updated[cartKey]
      } else {
        updated[cartKey] = quantity
      }
      return updated
    })
  }

  // Total count of all items in cart
  const getCartCount = () => {
    if (!cartItems) return 0
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0)
  }

  // Total monetary amount of cart
  const getCartAmount = () => {
    if (!cartItems || books.length === 0) return 0
    return Object.entries(cartItems).reduce((total, [cartKey, qty]) => {
      const [itemId, format] = cartKey.split('___')
      const book = books.find(b => b._id === itemId)
      if (!book) return total
      const price = getBookPriceWithFormat(book, format || 'Standard Paperback')
      return total + price * qty
    }, 0)
  }

  const value = {
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
    backendUrl
  }

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider
