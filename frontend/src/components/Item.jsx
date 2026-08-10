import React, { useContext } from 'react'
import { TbShoppingCartPlus } from 'react-icons/tb'
import { ShopContext } from '../context/ShopContext'
const Item = ({ book, fromHero }) => {
  const { navigate, currency, addToCart } = useContext(ShopContext)


  return book ? (
    <div onClick={() => {
      navigate(`/shop/${book.category}/${book._id}`)
      scrollTo(0,0)
    }} className={`flex flex-col justify-between h-full p-3 sm:p-4 rounded-2xl cursor-pointer group bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl`}>
      {/* IMAGE CONTAINER */}
      <div className='w-full h-56 sm:h-64 overflow-hidden rounded-xl shadow-xs relative shrink-0'>
        <img 
          src={Array.isArray(book.image) ? book.image[0] : book.image} 
          alt={book.name || book.title} 
          className={`w-full h-full object-cover object-center rounded-xl transition-transform duration-500 ease-out group-hover:scale-105 ${book.inStock === false ? 'opacity-75 grayscale-[25%]' : ''}`} 
        />
        {book.inStock === false && (
          <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-rose-500">
            Out of Stock
          </span>
        )}
      </div>
      {/* INFO CONTAINER */}
      <div className='pt-3 flex-1 flex flex-col justify-between'>
        <div className='flexBetween gap-2'>
          <h4 className='h5 line-clamp-1 group-hover:text-purple-600 transition-colors duration-300'>{book.name}</h4>
          <p className='text-purple-500 bold-15 shrink-0'>{currency}{book.offerPrice}.00</p>
        </div>
        <div className='flex justify-between items-center gap-2 mt-1'>
          <p className='line-clamp-1 text-xs text-gray-500'>{book.description}</p>
          {book.inStock === false ? (
            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md shrink-0">
              Out of Stock
            </span>
          ) : (
            <button onClick={(e) => { addToCart(book._id); e.stopPropagation() }} className='cursor-pointer text-gray-600 hover:text-purple-600 hover:scale-110 transition-all duration-200 shrink-0 p-1'>
              <TbShoppingCartPlus className='text-xl' />
            </button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className='p-5 text-red-600 text-sm rounded-md'>No book found.</div>
  )
}

export default Item