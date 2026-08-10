import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import { TbShoppingBagPlus } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import FeaturedBooksImg from '../assets/featured-books.png'

const FeaturedBooks = () => {
  const { books, currency, addToCart } = useContext(ShopContext)

  // Pick first available featured book
  const featuredBook = books.find(b => b.popular) || books[0] || {}

  // Pick 6 random/other books for grid
  const otherBooks = books.slice(1, 7)

  const featuredImg = Array.isArray(featuredBook?.image)
    ? featuredBook?.image[0]
    : (typeof featuredBook?.image === 'string' ? featuredBook?.image : FeaturedBooksImg)

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

          <div className='mt-6 bg-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row gap-6 border border-slate-100'>
            <div className='w-full sm:w-44 h-64 shrink-0 rounded-xl overflow-hidden bg-purple-50/50 flexCenter p-2 shadow-2xs'>
              <img
                src={featuredImg || FeaturedBooksImg}
                alt={featuredBook?.name || featuredBook?.title || 'Featured Book'}
                className='h-full w-full object-contain rounded-lg transition-transform duration-300 hover:scale-[1.03]'
              />
            </div>

            <div className='flex flex-col justify-between flex-1'>
              <div className='space-y-1'>
                <h3 className='text-base sm:text-lg font-semibold text-gray-800 line-clamp-1'>{featuredBook?.name}</h3>
                <p className='text-sm text-gray-500'>{featuredBook?.category}</p>
              </div>

              <div className='flex items-center gap-3 sm:mt-2'>
                <h4 className='text-base sm:text-lg font-bold text-purple-500'>
                  {currency}{featuredBook?.offerPrice}.00
                </h4>
                <p className='text-sm line-through text-gray-400'>
                  {currency}{featuredBook?.price}.00
                </p>
                <span className='hidden sm:inline-block bg-green-100 text-xs font-semibold px-2 py-1 rounded-full'>
                  Save 5
                </span>
              </div>

              <div className='grid grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4 text-sm text-gray-600'>
                <p><span className='font-medium text-gray-700'>Published:</span> 2025</p>
                <p><span className='font-medium text-gray-700'>Pages:</span> 300</p>
                <p><span className='font-medium text-gray-700'>Language:</span> English</p>
                <p><span className='font-medium text-gray-700'>Stock:</span> In Stock</p>
              </div>

              <p className='mt-2 sm:mt-4 text-sm text-gray-700 line-clamp-3'>{featuredBook?.description}</p>

              <button
                onClick={() => addToCart(featuredBook._id)}
                className='bg-purple-500 hover:bg-purple-600 text-white rounded-md shadow-md text-xs sm:text-sm mt-3 sm:mt-5 w-full sm:w-fit px-4 sm:px-5 py-2 flex items-center gap-2 font-medium'
              >
                <TbShoppingBagPlus className='text-base sm:text-lg' />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Grid of Random Books */}
        <div className='flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4'>
          {otherBooks.map((book, index) => {
            const cardImg = Array.isArray(book?.image) ? book.image[0] : book?.image
            return (
              <Link to={`/Shop/${book.category}/${book._id}`} key={index}>
                <div className='bg-white rounded-xl shadow-sm p-3 flex flex-col items-center text-center group transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl cursor-pointer h-full justify-between'>
                  <div className='w-full h-40 overflow-hidden rounded-lg mb-3 shrink-0'>
                    <img
                      src={cardImg}
                      alt={book?.name || book?.title}
                      className='h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105'
                    />
                  </div>
                  <div className='w-full flex-1 flex flex-col justify-between'>
                    <h4 className='text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-purple-600 transition-colors duration-300'>{book?.name}</h4>
                    <p className='text-xs text-gray-500 line-clamp-1'>{book?.category}</p>
                    <p className='text-sm font-bold text-purple-500 mt-1'>
                      {currency}{book?.offerPrice}.00
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturedBooks
