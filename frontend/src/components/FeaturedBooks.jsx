import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import { TbShoppingBagPlus } from 'react-icons/tb'
import FeaturedBooksImg from '../assets/featured-books.png'

const FeaturedBooks = () => {
  const { books, currency } = useContext(ShopContext)
  const book = books[21] // get the 21st book

  return (
    <section className='px-4 sm:px-6 lg:px-8 max-sm:bg-white'>
      {/* CONTAINER */}
      <div className='flex flex-col xl:flex-row sm:bg-white py-10 sm:py-16 rounded-2xl sm:px-10'>
        {/* LEFT SIDE */}
        <div className='flex-1'>
          <Title
            title1={"Featured"}
            title2={"Books"}
            title1Styles={"pb-6 sm:pb-8"}
            para={"Browse featured books carefully selected for quality, imagination, storytelling, and unique characters"}
          />

          {/* Book Card */}
          <div className='flex flex-col sm:flex-row gap-4 sm:gap-8 sm:bg-white sm:p-4 rounded-2xl'>
            {/* Book Image */}
            <div className='w-full sm:min-w-[160px] sm:w-auto'>
              <img
                src={book?.image}
                alt={book?.name}
                className='h-64 w-full sm:w-44 object-cover rounded-xl shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)]'
              />
            </div>

            {/* Book Details */}
            <div className='flex flex-col justify-between flex-1'>
              <div className='space-y-1'>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-800 line-clamp-1'>{book?.name}</h3>
                <p className='text-sm'>{book?.category}</p>
              </div>

              <div className='flex items-center gap-3 sm:mt-2'>
                <h4 className='text-base sm:text-lg font-bold text-purple-400'>
                  {currency}{book?.offerPrice}.00
                </h4>
                <p className='text-sm line-through'>
                  {currency}{book?.price}.00
                </p>
                <span className='hidden sm:flex bg-green-100 text-xs font-semibold px-2 py-1 rounded-full'>
                  Save 5
                </span>
              </div>

              <div className='grid grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4 text-sm text-gray-600'>
                <p><span className='font-medium text-gray-700'>Published:</span> 2025</p>
                <p><span className='font-medium text-gray-700'>Pages:</span> 300</p>
                <p><span className='font-medium text-gray-700'>Language:</span> English</p>
                <p><span className='font-medium text-gray-700'>Stock:</span> In Stock</p>
              </div>

              <p className='mt-2 sm:mt-4 text-sm line-clamp-3'>{book?.description}</p>

              <button className='bg-purple-400 hover:bg-purple-500 text-white rounded-md shadow-md text-xs sm:text-sm mt-2 sm:mt-5 w-full sm:w-fit px-4 sm:px-5 py-2 flex items-center gap-2 font-medium'>
                <TbShoppingBagPlus className='text-base sm:text-lg' />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div
          className='hidden xl:flex flex-1 bg-center bg-cover bg-no-repeat'
          style={{ backgroundImage: `url(${FeaturedBooksImg})` }}
        />
      </div>
    </section>
  )
}

export default FeaturedBooks
