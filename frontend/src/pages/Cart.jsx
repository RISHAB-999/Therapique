import React, { useContext, useState, useRef, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { FaMinus, FaPlus, FaTrashCan, FaChevronDown, FaBagShopping } from "react-icons/fa6"
import CartTotal from '../components/CartTotal'

const ALL_FORMAT_DEFINITIONS = [
  { key: 'Standard Paperback', label: 'Standard Paperback', desc: '5.5" x 8.5" Paperback' },
  { key: 'Deluxe Hardcover', label: 'Deluxe Hardcover', desc: '6.0" x 9.0" Hardcover' },
  { key: 'E-Book', label: 'E-Book', desc: 'Digital PDF / EPUB' },
  { key: 'Audiobook', label: 'Audiobook', desc: 'MP3 Audio Stream' },
  { key: 'Pocket / Travel Edition', label: 'Pocket Edition', desc: '4.25" x 6.8" Pocket' }
]

// Custom sleek format dropdown selector with clean text styling (no emoji icons)
const FormatDropdown = ({ book, cartKey, currentFormat, updateCartFormat, getBookPriceWithFormat, currency }) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Dynamically resolve available formats for the book (all 5 formats or matching book.sizes)
  const availableSizes = Array.isArray(book?.sizes) && book.sizes.length > 0 
    ? book.sizes 
    : ALL_FORMAT_DEFINITIONS.map(f => f.key)

  const options = ALL_FORMAT_DEFINITIONS.filter(f => availableSizes.includes(f.key) || availableSizes.includes(f.label)).map(f => {
    const price = getBookPriceWithFormat ? getBookPriceWithFormat(book, f.key) : (book?.offerPrice || 999)
    const isOutOfStock = book?.inStock === false || (book?.outOfStockSizes && book.outOfStockSizes.some(s => s && s.trim().toLowerCase() === f.key.trim().toLowerCase()))
    return {
      ...f,
      price,
      isOutOfStock
    }
  })

  // Fallback if options list is somehow empty
  const renderedOptions = options.length > 0 ? options : ALL_FORMAT_DEFINITIONS.map(f => ({
    ...f,
    price: getBookPriceWithFormat ? getBookPriceWithFormat(book, f.key) : (book?.offerPrice || 999),
    isOutOfStock: false
  }))

  const selectedOption = renderedOptions.find(o => o.key === currentFormat || o.label === currentFormat) || renderedOptions[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className='relative inline-block text-left max-w-full pt-0.5'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='flex items-center gap-1.5 sm:gap-2 bg-[#F3E8DE] hover:bg-[#EADBCE] text-gray-800 border border-[#EADBCE] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-2xs max-w-full truncate'
      >
        <span className='truncate'>{selectedOption.label}</span>
        <span className='font-mono font-extrabold text-purple-900 shrink-0'>({currency}{selectedOption.price})</span>
        <FaChevronDown className={`text-[10px] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='absolute left-0 mt-1.5 w-64 sm:w-72 rounded-2xl bg-[#FAF5EE] border border-[#EADBCE] shadow-2xl z-50 p-2 animate-fadeIn'>
          <div className='text-[10px] font-extrabold text-gray-500 uppercase tracking-wider px-2 py-1 border-b border-[#EADBCE] mb-1.5 flex items-center justify-between'>
            <span>Select Format Edition:</span>
            <span className='text-purple-700 font-bold'>({renderedOptions.length} Formats)</span>
          </div>
          <div className='space-y-1 max-h-64 overflow-y-auto pr-0.5'>
            {renderedOptions.map((opt) => (
              <div
                key={opt.key}
                onClick={() => {
                  if (opt.isOutOfStock) return
                  updateCartFormat(cartKey, opt.key)
                  setOpen(false)
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  opt.isOutOfStock
                    ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                    : currentFormat === opt.key
                    ? 'bg-black text-white shadow-sm cursor-pointer'
                    : 'text-gray-800 hover:bg-[#F3E8DE] cursor-pointer'
                }`}
              >
                <div className='truncate pr-2'>
                  <span className='truncate block leading-tight'>{opt.label}</span>
                  <span className={`text-[9px] font-medium block mt-0.5 ${currentFormat === opt.key ? 'text-gray-300' : 'text-gray-500'}`}>{opt.desc}</span>
                </div>
                <div className='flex items-center gap-1.5 shrink-0'>
                  {opt.isOutOfStock ? (
                    <span className='text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md'>
                      Out of Stock
                    </span>
                  ) : (
                    <span className={`font-mono text-[11px] ${currentFormat === opt.key ? 'text-gray-200' : 'text-purple-700 font-black'}`}>
                      {currency}{opt.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const Cart = () => {
  const { navigate, books = [], currency, cartItems = {}, updateCartFormat, getBookPriceWithFormat, updateQuantity, getCartCount } = useContext(ShopContext)

  const validCartEntries = Object.entries(cartItems || {}).filter(([_, qty]) => Number(qty) > 0)
  const cartCount = getCartCount ? getCartCount() : 0

  // 1. If cart is completely empty
  if (validCartEntries.length === 0) {
    return (
      <div className='max-padd-container py-16 pt-28 text-center min-h-[70vh] flex flex-col items-center justify-center gap-4'>
        <div className='w-20 h-20 bg-[#F3E8DE] text-gray-700 rounded-full flexCenter text-3xl shadow-inner border border-[#EADBCE]'>
          <FaBagShopping />
        </div>
        <h3 className='text-2xl font-bold text-gray-900'>Your Cart is Currently Empty</h3>
        <p className='text-gray-600 text-sm max-w-md'>Explore our curated collection of books and add your favorite reads to your cart!</p>
        <button
          onClick={() => navigate('/shop')}
          className='bg-black hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-2xl text-sm transition cursor-pointer shadow-md mt-2'
        >
          Explore Shop
        </button>
      </div>
    )
  }

  // 2. If books data is still fetching from backend
  if (!books || books.length === 0) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center gap-4 py-16 text-center max-padd-container'>
        <div className='w-10 h-10 border-4 border-[#81C784] border-t-transparent rounded-full animate-spin' />
        <p className='text-gray-600 font-semibold text-xs sm:text-sm'>Loading your cart items...</p>
      </div>
    )
  }

  return (
    <div className='py-8 pt-18 max-padd-container min-h-[75vh]'>
      <div className='flex flex-col xl:flex-row gap-8 xl:gap-16'>
        {/* Left Side */}
        <div className='flex flex-[2] flex-col gap-4'>
          <Title
            title1={"Cart"}
            title2={"Overview"}
            title1Styles={"pb-2"} />

          <div className='flex items-center justify-between text-xs sm:text-sm font-bold bg-[#F3E8DE] p-3 sm:p-3.5 rounded-2xl border border-[#EADBCE] text-gray-900'>
            <h5 className="text-left font-extrabold">Product & Format Details</h5>
            <div className='hidden md:flex items-center gap-16 font-extrabold pr-6'>
              <h5>Subtotal</h5>
              <h5>Action</h5>
            </div>
          </div>

          {validCartEntries.map(([cartKey, quantity]) => {
            const [itemId, currentFormat] = cartKey.split('___')
            // Fallback matching by _id, id, or title
            const book = books.find(b => String(b._id) === String(itemId) || String(b.id) === String(itemId)) || {
              _id: itemId,
              name: 'Selected Book',
              offerPrice: 999,
              sizes: ALL_FORMAT_DEFINITIONS.map(f => f.key),
              image: []
            }

            const unitPrice = getBookPriceWithFormat ? getBookPriceWithFormat(book, currentFormat) : (book.offerPrice || 999)
            const itemImg = Array.isArray(book.image) && book.image.length > 0 ? book.image[0] : (typeof book.image === 'string' ? book.image : '')

            return (
              <div key={cartKey} className='flex flex-col md:grid md:grid-cols-[5fr_2fr_1fr] md:items-center gap-3.5 text-sm font-medium bg-[#FAF5EE] p-3.5 sm:p-4 rounded-3xl border border-[#EADBCE] shadow-[0_4px_20px_rgba(70,56,48,0.03)] hover:shadow-md transition-all duration-300 relative'>
                {/* Product Info Group */}
                <div className='flex items-start sm:items-center gap-3 sm:gap-4 pr-8 md:pr-0'>
                  <div className='w-14 sm:w-16 h-18 sm:h-20 bg-[#FDF7F3] rounded-xl overflow-hidden p-1 border border-[#EADBCE] shrink-0 flexCenter'>
                    {itemImg ? (
                      <img src={itemImg} alt={book.name || book.title} className='w-full h-full object-contain' />
                    ) : (
                      <span className='text-2xl'>📖</span>
                    )}
                  </div>
                  
                  <div className='space-y-1.5 min-w-0 flex-1'>
                    <h5 className='font-bold text-gray-900 text-sm sm:text-base truncate pr-2'>
                      {book.name || book.title || 'Therapique Book'}
                    </h5>

                    {/* Custom Sleek Format Dropdown Selector without emoji icons */}
                    <FormatDropdown
                      book={book}
                      cartKey={cartKey}
                      currentFormat={currentFormat || 'Standard Paperback'}
                      updateCartFormat={updateCartFormat}
                      getBookPriceWithFormat={getBookPriceWithFormat}
                      currency={currency}
                    />

                    {/* Quantity Controls */}
                    <div className='flex items-center gap-2 pt-1'>
                      <div className='flex items-center border border-[#EADBCE] p-0.5 rounded-xl bg-[#FDF7F3]'>
                        <button onClick={() => updateQuantity(cartKey, Number(quantity) - 1)} className='p-1 bg-[#FAF5EE] hover:bg-[#F3E8DE] rounded-lg cursor-pointer transition'>
                          <FaMinus className='text-[10px] text-gray-700' />
                        </button>
                        <span className='px-2.5 sm:px-3 text-xs font-bold text-gray-900'>{quantity}</span>
                        <button onClick={() => updateQuantity(cartKey, Number(quantity) + 1)} className='p-1 bg-[#FAF5EE] hover:bg-[#F3E8DE] rounded-lg cursor-pointer transition'>
                          <FaPlus className='text-[10px] text-gray-700' />
                        </button>
                      </div>
                      <span className='text-[11px] sm:text-xs text-gray-500 font-mono'>({currency}{unitPrice} each)</span>
                    </div>
                  </div>
                </div>

                {/* Subtotal Bar on Mobile / Column on Desktop */}
                <div className='flex items-center justify-between border-t border-[#EADBCE] pt-2.5 md:border-t-0 md:pt-0 md:justify-center'>
                  <span className='md:hidden text-xs font-bold text-gray-500'>Item Subtotal:</span>
                  <p className='font-extrabold text-purple-700 md:text-gray-900 text-base md:text-center'>
                    {currency}{unitPrice * Number(quantity)}
                  </p>
                </div>

                {/* Mobile Delete Button (Top-Right) */}
                <button 
                  onClick={() => updateQuantity(cartKey, 0)} 
                  className='md:hidden absolute top-3 right-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all'
                  title='Remove item'
                >
                  <FaTrashCan className='text-sm' />
                </button>

                {/* Desktop Delete Button */}
                <button 
                  onClick={() => updateQuantity(cartKey, 0)} 
                  className='hidden md:block cursor-pointer mx-auto p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all'
                  title='Remove item'
                >
                  <FaTrashCan className='text-base' />
                </button>
              </div>
            )
          })}
        </div>

        {/* Right Side Order Details */}
        <div className='flex flex-1 flex-col'>
          <div className='w-full bg-[#FAF5EE] p-4 sm:p-6 rounded-3xl shadow-[0_4px_20px_rgba(70,56,48,0.04)] border border-[#EADBCE]'>
            <CartTotal />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart