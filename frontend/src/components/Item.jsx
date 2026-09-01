import React, { useContext, useCallback } from 'react'
import { TbShoppingCartPlus } from 'react-icons/tb'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { ChevronRight } from 'lucide-react'

const defaultBookImg = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop"

const Item = ({ book, index, isStacked = false, fromHero = false }) => {
  const { navigate, currency, addToCart } = useContext(ShopContext)
  const token = localStorage.getItem('token')

  const handleBookClick = useCallback(() => {
    if (!token) {
      toast.info('Please log in or create an account to view and purchase books')
      navigate('/login', { state: { message: 'Please log in or create an account to view and purchase books', context: 'book' } })
    } else {
      navigate(`/shop/${book.category || 'all'}/${book._id}`)
      scrollTo(0, 0)
    }
  }, [token, navigate, book])

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation()
    if (!token) {
      toast.info('Please log in or create an account to add items to cart')
      navigate('/login', { state: { message: 'Please log in or create an account to add items to cart', context: 'book' } })
    } else {
      addToCart(book._id)
    }
  }, [token, navigate, addToCart, book])

  if (!book) {
    return <div className='p-5 text-red-600 text-sm rounded-md'>No book found.</div>
  }

  const coverImage = Array.isArray(book.image) ? (book.image[0] || defaultBookImg) : (book.image || defaultBookImg)

  return (
    <div
      onClick={handleBookClick}
      className={`flex flex-col justify-between h-full rounded-3xl cursor-pointer group border transition-all duration-400 ease-out will-change-transform ${
        fromHero
          ? 'p-3.5 bg-white border-[#EADBCE] shadow-[0_4px_16px_rgba(70,56,48,0.06)] hover:bg-[#FAF5EE] hover:border-[#D4C3B3] hover:-translate-y-3 hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_rgba(70,56,48,0.16)] relative z-10 hover:z-30'
          : isStacked
          ? 'p-4 sm:p-5 bg-white border-[#EADBCE] shadow-xl shadow-stone-900/15 active:scale-[0.98]'
          : 'p-3 sm:p-4 bg-white border-[#EADBCE] shadow-[0_2px_10px_rgba(70,56,48,0.04)] hover:-translate-y-2.5 hover:shadow-[0_16px_32px_-8px_rgba(70,56,48,0.14)] hover:bg-[#FAF5EE] hover:border-[#D4C3B3] active:scale-[0.98] relative z-10 hover:z-30'
      }`}
    >
      {/* IMAGE CONTAINER with High Quality Portrait & Badges */}
      <div className={`w-full overflow-hidden rounded-2xl bg-[#FAF5EE] border border-[#EADBCE] relative shrink-0 flex items-center justify-center ${
        isStacked ? 'h-[280px] sm:h-64' : 'h-56 sm:h-64'
      }`}>
        <img
          src={coverImage}
          alt={book.name || book.title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultBookImg;
          }}
          className={`w-full h-full object-cover object-center rounded-2xl transition-all duration-500 ease-out group-hover:scale-[1.04] ${book.inStock === false ? 'opacity-75 grayscale-[25%]' : ''}`}
        />
        {book.inStock === false && (
          <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md border border-rose-500 z-10">
            Out of Stock
          </span>
        )}
      </div>

      {/* INFO CONTAINER */}
      <div className='pt-3 flex-1 flex flex-col justify-between'>
        <div className='flex items-start justify-between gap-2'>
          <div className="flex-1 min-w-0 pr-1">
            <h4 className='font-serif font-bold text-base sm:text-lg text-gray-900 line-clamp-1 group-hover:text-purple-700 transition-colors duration-300'>
              {book.name || book.title}
            </h4>
            {book.author && (
              <p className='text-xs text-gray-500 font-medium line-clamp-1 mt-0.5'>
                by {book.author}
              </p>
            )}
          </div>
          <p className='text-purple-700 font-extrabold text-base sm:text-lg shrink-0'>{currency}{book.offerPrice || book.price}</p>
        </div>

        {isStacked && book.description && (
          <p className='line-clamp-2 text-xs text-gray-600 font-normal mt-2 leading-relaxed'>
            {book.description}
          </p>
        )}

        <div className='flex justify-between items-center gap-2 mt-3 pt-2.5 border-t border-[#F3E8DE]'>
          {!isStacked ? (
            <p className='line-clamp-1 text-xs text-gray-500'>{book.description || (book.author ? `by ${book.author}` : '')}</p>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold group-hover:underline">
              <span>View Book</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          )}

          {book.inStock === false ? (
            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md shrink-0">
              Out of Stock
            </span>
          ) : (
            <button
              onClick={handleAddToCart}
              className='cursor-pointer text-gray-700 hover:text-purple-700 hover:scale-110 transition-all duration-200 shrink-0 p-2 rounded-xl hover:bg-[#F3E8DE] bg-[#FAF5EE] border border-[#EADBCE]'
              title='Add to cart'
            >
              <TbShoppingCartPlus className='text-lg sm:text-xl text-gray-800' />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Item)