import React, { useContext, useState, useRef, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { FaMinus, FaPlus, FaTrashCan, FaChevronDown, FaBagShopping } from "react-icons/fa6"
import CartTotal from '../components/CartTotal'

// Custom sleek format dropdown selector
const FormatDropdown = ({ book, cartKey, currentFormat, updateCartFormat, currency }) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const options = [
    { key: 'Standard Paperback', label: 'Standard Paperback', price: book.offerPrice, icon: '📖' },
    { key: 'Deluxe Hardcover', label: 'Deluxe Hardcover', price: book.offerPrice + 400, icon: '📘' },
    { key: 'Pocket / Travel Edition', label: 'Pocket Edition', price: Math.max(100, book.offerPrice - 200), icon: '📙' }
  ]

  const selectedOption = options.find(o => o.key === currentFormat) || options[0]

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
        className='flex items-center gap-1.5 sm:gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-2xs max-w-full truncate'
      >
        <span className='truncate'>{selectedOption.icon} {selectedOption.label}</span>
        <span className='font-mono font-extrabold text-purple-900 shrink-0'>({currency}{selectedOption.price})</span>
        <FaChevronDown className={`text-[10px] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='absolute left-0 mt-1.5 w-60 sm:w-64 rounded-xl bg-white border border-purple-100 shadow-xl z-50 p-1.5 animate-fadeIn'>
          <div className='text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 border-b border-gray-100 mb-1'>
            Select Book Format:
          </div>
          {options.map((opt) => (
            <div
              key={opt.key}
              onClick={() => {
                updateCartFormat(cartKey, opt.key)
                setOpen(false)
              }}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 ${
                currentFormat === opt.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <span className='flex items-center gap-1.5 truncate pr-2'>
                <span>{opt.icon}</span>
                <span className='truncate'>{opt.label}</span>
              </span>
              <span className={`font-mono text-[11px] shrink-0 ${currentFormat === opt.key ? 'text-purple-100' : 'text-purple-600 font-extrabold'}`}>
                {currency}{opt.price}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Cart = () => {
  const { navigate, books = [], currency, cartItems = {}, updateCartFormat, getBookPriceWithFormat, updateQuantity, getCartCount } = useContext(ShopContext)

  const cartCount = getCartCount ? getCartCount() : 0

  if (!books || books.length === 0) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center gap-4 py-16 text-center max-padd-container'>
        <div className='w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin' />
        <p className='text-gray-600 font-semibold text-sm'>Loading cart details...</p>
      </div>
    )
  }

  if (cartCount === 0) {
    return (
      <div className='max-padd-container py-16 pt-28 text-center min-h-[70vh] flex flex-col items-center justify-center gap-4'>
        <div className='w-20 h-20 bg-purple-50 text-purple-600 rounded-full flexCenter text-3xl shadow-inner'>
          <FaBagShopping />
        </div>
        <h3 className='text-2xl font-bold text-gray-800'>Your Cart is Currently Empty</h3>
        <p className='text-gray-500 text-sm max-w-md'>Explore our curated collection of books and add your favorite reads to your cart!</p>
        <button
          onClick={() => navigate('/shop')}
          className='bg-purple-600 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-purple-700 transition cursor-pointer shadow-md mt-2'
        >
          Explore Shop
        </button>
      </div>
    )
  }

  return (
    <div className='py-8 pt-18 max-padd-container'>
      <div className='flex flex-col xl:flex-row gap-8 xl:gap-16'>
        {/* Left Side */}
        <div className='flex flex-[2] flex-col gap-4'>
          <Title
            title1={"Cart"}
            title2={"Overview"}
            title1Styles={"pb-2"} />

          <div className='flex items-center justify-between text-xs sm:text-sm font-bold bg-purple-50/80 p-3 sm:p-3.5 rounded-xl border border-purple-100 text-purple-900'>
            <h5 className="text-left font-extrabold">Product & Format Details</h5>
            <div className='hidden md:flex items-center gap-16 font-extrabold pr-6'>
              <h5>Subtotal</h5>
              <h5>Action</h5>
            </div>
          </div>

          {Object.entries(cartItems).map(([cartKey, quantity]) => {
            if (quantity <= 0) return null
            const [itemId, currentFormat] = cartKey.split('___')
            const book = books.find(b => b._id === itemId)
            if (!book) return null

            const unitPrice = getBookPriceWithFormat ? getBookPriceWithFormat(book, currentFormat) : book.offerPrice
            const itemImg = book.image?.[0] || book.image

            return (
              <div key={cartKey} className='flex flex-col md:grid md:grid-cols-[5fr_2fr_1fr] md:items-center gap-3.5 text-sm font-medium bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative'>
                {/* Product Info Group */}
                <div className='flex items-start sm:items-center gap-3 sm:gap-4 pr-8 md:pr-0'>
                  <div className='w-14 sm:w-16 h-18 sm:h-20 bg-slate-50 rounded-lg overflow-hidden p-1 border border-slate-100 shrink-0 flexCenter'>
                    <img src={itemImg} alt={book.name} className='w-full h-full object-contain' />
                  </div>
                  
                  <div className='space-y-1.5 min-w-0 flex-1'>
                    <h5 className='font-bold text-gray-800 text-sm sm:text-base truncate pr-2'>
                      {book.name}
                    </h5>

                    {/* Custom Sleek Format Dropdown Selector */}
                    <FormatDropdown
                      book={book}
                      cartKey={cartKey}
                      currentFormat={currentFormat || 'Standard Paperback'}
                      updateCartFormat={updateCartFormat}
                      currency={currency}
                    />

                    {/* Quantity Controls */}
                    <div className='flex items-center gap-2 pt-1'>
                      <div className='flex items-center ring-1 ring-slate-200 p-0.5 rounded-lg bg-slate-50'>
                        <button onClick={() => updateQuantity(cartKey, quantity - 1)} className='p-1 bg-white hover:bg-slate-200 rounded-md cursor-pointer transition'>
                          <FaMinus className='text-[10px] text-gray-600' />
                        </button>
                        <span className='px-2.5 sm:px-3 text-xs font-bold text-gray-800'>{quantity}</span>
                        <button onClick={() => updateQuantity(cartKey, quantity + 1)} className='p-1 bg-white hover:bg-slate-200 rounded-md cursor-pointer transition'>
                          <FaPlus className='text-[10px] text-gray-600' />
                        </button>
                      </div>
                      <span className='text-[11px] sm:text-xs text-gray-400 font-mono'>({currency}{unitPrice} each)</span>
                    </div>
                  </div>
                </div>

                {/* Subtotal Bar on Mobile / Column on Desktop */}
                <div className='flex items-center justify-between border-t border-slate-100 pt-2.5 md:border-t-0 md:pt-0 md:justify-center'>
                  <span className='md:hidden text-xs font-bold text-gray-400'>Item Subtotal:</span>
                  <p className='font-extrabold text-purple-700 md:text-gray-800 text-base md:text-center'>
                    {currency}{unitPrice * quantity}
                  </p>
                </div>

                {/* Mobile Delete Button (Top-Right) */}
                <button 
                  onClick={() => updateQuantity(cartKey, 0)} 
                  className='md:hidden absolute top-3 right-3 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all'
                  title='Remove item'
                >
                  <FaTrashCan className='text-sm' />
                </button>

                {/* Desktop Delete Button */}
                <button 
                  onClick={() => updateQuantity(cartKey, 0)} 
                  className='hidden md:block cursor-pointer mx-auto p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all'
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
          <div className='w-full bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100'>
            <CartTotal />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart