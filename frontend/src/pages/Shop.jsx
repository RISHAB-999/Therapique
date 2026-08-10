import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import Item from '../components/Item'
import { ShopContext } from '../context/ShopContext'
import { FiSearch } from 'react-icons/fi'


const Shop = () => {
  const { books, searchQuery, setSearchQuery } = useContext(ShopContext)
  const [filteredBooks, setFilteredBooks] = useState([])
  const [currPage, setCurrPage] = useState(1)
  const [showSearch, setShowSearch] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredBooks(
        books.filter((book) =>
          book.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredBooks(books)
    }
  }, [books, searchQuery])

  useEffect(() => {
    setCurrPage(1)
  }, [searchQuery])

  useEffect(() => {
    window.scrollTo({top: 0, behavior: "smooth"})
  }, [currPage])

  const totalPages = Math.ceil(
    filteredBooks.filter(b => b.inStock).length / itemsPerPage
  )

  return (
    <div className='max-padd-container py-16 pt-8 md:pt-12 lg:pt-16'>
      <div className='flex items-center justify-between flex-wrap gap-4 mb-6'>
        <Title
          title1={"All"}
          title2={"Books"}
          titleStyles="space-y-2"
          title1Styles="pb-"
          paraStyles="mt-0"
        />

        {/* Morphing Search */}
        <div
          className={`flex items-center transition-all duration-500 ease-in-out overflow-hidden ${showSearch ? 'w-64 px-4 py-2' : 'w-10 h-10 justify-center'
            } bg-white border border-gray-300 rounded-full shadow-sm`}
          style={{ minHeight: '40px' }}
        >
          <FiSearch
            className='text-gray-600 cursor-pointer'
            size={20}
            onClick={() => setShowSearch(prev => !prev)}
          />
          {showSearch && (
            <input
              type='text'
              placeholder='Search book...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='ml-2 w-full outline-none text-sm text-gray-700 bg-transparent'
            />
          )}
        </div>
      </div>

      <div className='mt-4 md:mt-6 lg:mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-8'>
        {filteredBooks.length > 0 ? (
          filteredBooks
            .filter((book) => book.inStock)
            .slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage)
            .map((book) => (
              <Item key={book._id} book={book} />
            ))
        ) : (
          <h4 className="h4">Oops! Nothing matched your search</h4>
        )}
      </div>
      {/* Pagination */}
      <div className='flex items-center justify-center gap-3 mt-10 flex-wrap'>
        <button disabled={currPage === 1} onClick={() => setCurrPage(prev => prev - 1)} className={`${currPage === 1 && "opacity-50 cursor-not-allowed"} btn-dark !py-1 !px-3`}>Previous</button>
        {Array.from({ length: totalPages }, (_, index) => (<button key={index + 1} onClick={() => setCurrPage(index + 1)} className={`${currPage === index + 1 && "bg-green-300 !text-white"} btn-light !py-1 !px-3`}>{index + 1}</button>))}
        <button disabled={currPage === totalPages} onClick={() => setCurrPage(prev => prev + 1)} className={`${currPage === totalPages && "opacity-50 cursor-not-allowed"} btn-white bg-[#856C5B] !py-1 !px-3`}>Next</button>
      </div>
    </div>
  )
}

export default Shop
