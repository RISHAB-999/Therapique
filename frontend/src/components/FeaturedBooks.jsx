import React, { useContext, useMemo, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import { useNavigate } from 'react-router-dom'
import FeaturedBooksImg from '../assets/featured-books.png'
import { FadeUp, StaggerContainer, StaggerItem } from './ScrollReveal'
import { toast } from 'react-toastify'

const FeaturedBooks = () => {
  const { books, currency, addToCart } = useContext(ShopContext)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleBookClick = useCallback((book) => {
    if (!token) {
      toast.info('Please log in or create an account to view book details')
      navigate('/login', { state: { message: 'Please log in or create an account to view book details', context: 'book' } })
    } else {
      navigate(`/Shop/${book.category}/${book._id}`)
      scrollTo(0, 0)
    }
  }, [token, navigate])

  const handleAddToCart = useCallback((bookId) => {
    if (!token) {
      toast.info('Please log in or create an account to add items to cart')
      navigate('/login', { state: { message: 'Please log in or create an account to add items to cart', context: 'book' } })
    } else {
      addToCart(bookId)
    }
  }, [token, navigate, addToCart])

  // Pick first available featured book
  const featuredBook = useMemo(() => books.find(b => b.popular) || books[0] || {}, [books])

  // Pick 6 other books for grid
  const otherBooks = useMemo(() => books.slice(1, 7), [books])

  const featuredImg = useMemo(() => {
    return Array.isArray(featuredBook?.image)
      ? featuredBook?.image[0]
      : (typeof featuredBook?.image === 'string' ? featuredBook?.image : FeaturedBooksImg)
  }, [featuredBook])

  return (
    <section className='px-4 sm:px-6 lg:px-8 bg-white rounded-3xl'>
      <div className='flex flex-col xl:flex-row py-10 sm:py-16 gap-8'>
        {/* Left Side - Featured Book */}
        <div className='flex-1'>
          <Title
            title1="Featured"
            title2="Books"
            para="Browse featured books carefully selected for quality, imagination, storytelling, and unique characters"
          />

          <FadeUp delay={0.15} className='mt-6 bg-[#FAF5EE] border border-[#EADBCE] p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row gap-6'>
            <div
              onClick={() => handleBookClick(featuredBook)}
              className='w-full sm:w-44 h-64 shrink-0 rounded-2xl overflow-hidden bg-[#FDF7F3] border border-[#EADBCE] flexCenter p-2 shadow-2xs cursor-pointer'
            >
              <img
                src={featuredImg || FeaturedBooksImg}
                alt={featuredBook?.name || featuredBook?.title || 'Featured Book'}
                loading="lazy"
                decoding="async"
                className='h-full w-full object-contain rounded-xl transition-all duration-500 ease-out hover:scale-[1.04]'
              />
            </div>

            <div className='flex flex-col justify-between flex-1'>
              <div className='space-y-1'>
                <h3
                  onClick={() => handleBookClick(featuredBook)}
                  className='font-therapique text-lg sm:text-xl font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-purple-700 transition-colors'
                >
                  {featuredBook?.name}
                </h3>
                <p className='text-xs sm:text-sm text-gray-500 font-medium'>{featuredBook?.category}</p>
              </div>

              <div className='flex items-center gap-3 sm:mt-2'>
                <h4 className='text-base sm:text-lg font-extrabold text-purple-700'>
                  {currency}{featuredBook?.offerPrice}.00
                </h4>
                <p className='text-sm line-through text-gray-400 font-medium'>
                  {currency}{featuredBook?.price}.00
                </p>
                <span className='hidden sm:inline-block bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full'>
                  Save 5%
                </span>
              </div>

              <div className='grid grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600 font-medium'>
                <p><span className='font-bold text-gray-900'>Published:</span> 2025</p>
                <p><span className='font-bold text-gray-900'>Pages:</span> 250</p>
                <p><span className='font-bold text-gray-900'>Language:</span> English</p>
                <p className='text-green-700 font-bold'>In Stock</p>
              </div>

              <p className='mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed'>{featuredBook?.description}</p>

              <button
                onClick={() => handleAddToCart(featuredBook._id)}
                className='bg-black hover:bg-gray-800 text-white rounded-full shadow-xs text-xs sm:text-sm mt-3 sm:mt-5 w-full sm:w-fit px-5 sm:px-6 py-2.5 flex items-center justify-center gap-2 font-bold cursor-pointer transition-all active:scale-95'
              >
                Add to Cart
              </button>
            </div>
          </FadeUp>
        </div>

        {/* Right Side - Grid of Random Books with Staggered Scroll Reveal */}
        <StaggerContainer staggerDelay={0.12} delayChildren={0.15} className='flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4'>
          {otherBooks.map((book, index) => {
            const cardImg = Array.isArray(book?.image) ? book.image[0] : book?.image
            return (
              <StaggerItem key={index} duration={0.8}>
                <div
                  onClick={() => handleBookClick(book)}
                  className='bg-[#FAF5EE] border border-[#EADBCE] rounded-2xl shadow-xs p-3 flex flex-col items-center text-center group transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_16px_36px_rgba(70,56,48,0.1)] cursor-pointer h-full justify-between'
                >
                  <div className='w-full h-40 overflow-hidden rounded-xl bg-[#FDF7F3] mb-3 shrink-0 flex items-center justify-center'>
                    <img
                      src={cardImg}
                      alt={book?.name || book?.title}
                      loading="lazy"
                      decoding="async"
                      className='h-full w-full object-cover rounded-xl transition-transform duration-700 ease-out group-hover:scale-105'
                    />
                  </div>
                  <div className='w-full flex-1 flex flex-col justify-between'>
                    <h4 className='text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-purple-700 transition-colors duration-300'>{book?.name}</h4>
                    <p className='text-xs text-gray-500 font-medium line-clamp-1 mt-0.5'>{book?.category}</p>
                    <p className='text-sm font-extrabold text-purple-700 mt-1.5'>
                      {currency}{book?.offerPrice}.00
                    </p>
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}

export default React.memo(FeaturedBooks)
