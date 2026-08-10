import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link, useParams } from 'react-router-dom'
import { TbHeart, TbShoppingBagPlus, TbStarFilled, TbStarHalfFilled } from 'react-icons/tb'
import { FaTruckFast } from 'react-icons/fa6'
import ProductDescription from '../components/ProductDescription'
import ProductFeatures from '../components/ProductFeatures'
import RelatedBooks from '../components/RelatedBooks'

const ProductDetail = () => {
  const { books, currency, addToCart, cartItems } = useContext(ShopContext)
  const { id } = useParams()
  const book = books.find((b) => String(b._id) === String(id) || String(b.id) === String(id))
  const [image, setImage] = useState(null)

  const formatMetadata = {
    'Standard Paperback': { priceDiff: 0, desc: '5.5" x 8.5" (14 x 21.5 cm)' },
    'Paperback': { priceDiff: 0, desc: '5.5" x 8.5" (14 x 21.5 cm)' },
    'Deluxe Hardcover': { priceDiff: 400, desc: '6.0" x 9.0" (15.2 x 22.8 cm)' },
    'Hardcover': { priceDiff: 400, desc: '6.0" x 9.0" (15.2 x 22.8 cm)' },
    'E-Book': { priceDiff: -300, desc: 'Instant PDF / EPUB Download' },
    'Audiobook': { priceDiff: -100, desc: 'MP3 Audio Stream (Unabridged)' },
    'Pocket / Travel Edition': { priceDiff: -200, desc: '4.25" x 6.8" (10.8 x 17.2 cm)' }
  }

  const rawSizes = book?.sizes && book.sizes.length > 0 ? book.sizes : ['Standard Paperback']

  const formats = rawSizes.map(sz => {
    const meta = formatMetadata[sz] || { priceDiff: 0, desc: 'Standard Format Edition' }
    return {
      name: sz,
      priceDiff: meta.priceDiff,
      desc: meta.desc
    }
  })

  const [selectedFormat, setSelectedFormat] = useState(rawSizes[0] || 'Standard Paperback')
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false)

  useEffect(() => {
    if (rawSizes.length > 0 && (!selectedFormat || !rawSizes.includes(selectedFormat))) {
      setSelectedFormat(rawSizes[0])
    }
  }, [book])

  useEffect(() => {
    if (book && book.image) {
      setImage(Array.isArray(book.image) ? book.image[0] : book.image)
    }
  }, [book])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const currentFmt = formats.find(f => f.name === selectedFormat) || formats[0]
  const displayedOfferPrice = Math.max(100, (book?.offerPrice || 0) + currentFmt.priceDiff)
  const displayedPrice = Math.max(100, (book?.price || 0) + currentFmt.priceDiff)

  const isFmtOutOfStock = (fmtName) => {
    if (!book) return false
    if (book.inStock === false) return true
    if (!book.outOfStockSizes || !Array.isArray(book.outOfStockSizes) || book.outOfStockSizes.length === 0) return false

    return book.outOfStockSizes.some(s => {
      if (!s || typeof s !== 'string' || !s.trim()) return false
      return s.trim().toLowerCase() === fmtName.trim().toLowerCase()
    })
  }

  return (
    book && (
      <div className='max-padd-container py-12 pt-18'>
        <p>
          <Link to="/" className='text-gray-500 hover:underline hover:text-green-500'>Home</Link> /
          <Link to="/shop" className='text-gray-500 hover:underline hover:text-green-500'>Shop</Link> /
          <Link to={`/shop/${book.category}`} className='text-gray-500 hover:underline hover:text-green-500'>{book.category}</Link> /
          <span className='medium-14 text-black'>{book.name}</span>
        </p>

        <div className='flex gap-10 flex-col xl:flex-row my-6'>
          <div className='flex gap-x-2 max-w-[433px] rounded-xl'>
            <div className='flex-1 flexCenter flex-col gap-[7px] flex-wrap'>
              {book.image.map((item, index) => (
                <div key={item || index}>
                  <img onClick={() => setImage(item)} src={item} alt="booking" className='rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition' />
                </div>
              ))}
            </div>
            <div className='flex flex-[4] relative'>
              <img src={image} alt="bookImg" className={`rounded-lg overflow-hidden ${book.inStock === false ? 'opacity-75 grayscale-[25%]' : ''}`} />
              {book.inStock === false && (
                <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className='px-5 py-3 w-full bg-green-100 rounded-xl pt-8'>
            <div className='flex items-center gap-3'>
              <h3 className="h3 leading-none">{book.name}</h3>
              {book.inStock === false && (
                <span className="bg-rose-100 text-rose-700 border border-rose-300 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Out of Stock
                </span>
              )}
            </div>
            <div className='flex items-center gap-x-2 pt-2'>
              <div className='flex gap-x-2 text-yellow-400'>
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
                <TbStarHalfFilled />
              </div>
              <p className='medium-12'>(22)</p>
            </div>

            <div className='h4 flex items-baseline gap-4 my-2'>
              <h3 className='h3 line-through text-purple-500'>{currency}{displayedPrice}.00</h3>
              <h4 className='h4'>{currency}{displayedOfferPrice}.00</h4>
            </div>

            <p className='max-w-[555px] text-sm text-gray-700 leading-relaxed'>{book.description}</p>

            {/* Select Format Edition Compact Dropdown matching Pic 2 */}
            <div className='my-4 space-y-1.5 relative inline-block'>
              <label className='text-xs font-extrabold text-gray-700 uppercase tracking-wider block'>
                Select Book Format Edition:
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                  className="flex items-center justify-between gap-3 bg-white hover:bg-slate-50 text-gray-800 border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs transition-all duration-200 cursor-pointer min-w-[260px] text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-extrabold">Format:</span>
                    <span className="font-extrabold text-gray-900">{selectedFormat}</span>
                    {isFmtOutOfStock(selectedFormat) && (
                      <span className="text-[9px] font-black text-rose-600 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded-md">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs transition-transform duration-200">
                    {isFormatDropdownOpen ? '▴' : '▾'}
                  </span>
                </button>

                {isFormatDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsFormatDropdownOpen(false)} 
                    />

                    {/* Popover Dropdown Menu */}
                    <div className="absolute left-0 top-full mt-2 w-76 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                      {formats.map((fmt) => {
                        const fmtOut = isFmtOutOfStock(fmt.name)
                        const isSelected = selectedFormat === fmt.name

                        return (
                          <div
                            key={fmt.name}
                            onClick={() => {
                              setSelectedFormat(fmt.name)
                              setIsFormatDropdownOpen(false)
                            }}
                            className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'hover:bg-purple-50 text-gray-800'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {fmt.name}
                              </span>
                              <span className={`text-[10px] ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                                {fmt.desc}
                              </span>
                            </div>

                            {fmtOut && (
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}>
                                Out of Stock
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className='flex items-center gap-x-4 mt-6'>
              {isFmtOutOfStock(selectedFormat) ? (
                <button 
                  disabled
                  className='bg-rose-500/90 text-white font-black px-6 py-3.5 sm:w-1/2 flexCenter gap-x-2 rounded-md cursor-not-allowed shadow-none'
                >
                  Out of Stock 🚫
                </button>
              ) : (
                <button 
                  onClick={() => addToCart(book._id, selectedFormat)} 
                  className='btn-dark hover:bg-black sm:w-1/2 flexCenter gap-x-2 capitalize !rounded-md cursor-pointer'
                >
                  Add {selectedFormat} to cart <TbShoppingBagPlus />
                </button>
              )}
              <button className='bg-[#b2805f] px-7 py-3 rounded-full transition cursor-pointer hover:bg-[#856C5B] text-white'>
                <TbHeart className='text-xl' />
              </button>
            </div>

            <div className='flex items-center gap-x-2 mt-4'>
              <FaTruckFast className='text-lg' />
              <span className='medium-14'>Free Delivery on order over 500{import.meta.env.VITE_CURRENCY}</span>
            </div>
            <hr className='my-3 w-2/3' />
            <div className='mt-2 flex flex-col gap-1 text-gray-30 text-[14px]'>
              <p>Authenticity You Can Trust</p>
              <p>Enjoy Cash On Delivery For Your Convenience</p>
              <p>Easy Returns and Exchanges Within 7 Days</p>
            </div>
          </div>
        </div>

        <ProductDescription book={book} />
        <ProductFeatures />
        <RelatedBooks book={book} id={id} />
      </div>
    )
  )
}

export default ProductDetail
