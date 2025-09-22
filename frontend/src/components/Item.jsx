import React, { useContext } from 'react'
import { TbShoppingCartPlus } from 'react-icons/tb'
import { ShopContext } from '../context/ShopContext'
const Item = ({book, fromHero}) => {
  const {navigate, currency} = useContext(ShopContext)


  return book ? (
    // <div className={`overflow-hidden rounded-s-xl shadow-[0px_0px_2px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col gap-4 ${fromHero ? 'w-[250px] cursor-pointer hover:scale-105 transition-transform duration-300' : 'w-full md:w-[300px]' }`} onClick={() => navigate(`/library/${book.id}`)}>
    <div className={`overflow-hidden sm:p-4 ${fromHero ? "bg-white" : "sm:bg-white"}`}>
        {/* IMAGE */}
        <div className='overflow-hidden rounded-xl shadow-[0px_0px_2px_0px_rgba(0,_0,_0,_0.1)]'>
            <img src={book.image} alt='book.name' className="rounded-lg" />
        </div>
        {/* INFO */}
        <div className='pt-4'>
            <div className='flexBetween gap-2'>
                <h4 className='h5 line-clamp-1'>{book.name}</h4>
                <p className='text-purple-400 bold-15'>{currency}{book.offerPrice}.00 </p>
            </div>
            <div className='flex justify-between items-start gap-2 mt-1'>
                <p className='line-clamp-1'>{book.description}</p>
                <button className='cursor-pointer'>
                    <TbShoppingCartPlus className='text-xl'/>
                </button>
            </div>
        </div>
    </div>
  ) : (
    <div className='p-5 text-red-600 text-sm rounded-md'>No book found.</div>
  )
}

export default Item