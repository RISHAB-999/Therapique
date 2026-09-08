import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Title from '../components/Title'
import Item from '../components/Item'
import { ShopContext } from '../context/ShopContext'
import TypewriterSearchInput from '../components/TypewriterSearchInput'
import PaginationControls from '../components/PaginationControls'

const categoryPlaceholders = [
  'Search in this category...',
  'Search title or author...',
  'Search topics & keywords...',
]

const CategoryShop = () => {
  const { books, searchQuery, setSearchQuery } = useContext(ShopContext)
  const [filteredBooks, setFilteredBooks] = useState([])
  const [currPage, setCurrPage] = useState(1)
  const [showSearch, setShowSearch] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { category } = useParams();


  useEffect(() => {
    let result = books;

    if (category) {
        result = result.filter((book)=>book.category.toLowerCase() === category.toLocaleLowerCase());
    }

    if (searchQuery.length > 0) {
      result = result.filter((book) =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredBooks(result);
  }, [books, searchQuery, category])

  useEffect(() => {
    setCurrPage(1)
  }, [searchQuery, category, itemsPerPage])

  useEffect(() => {
    window.scrollTo({top: 0, behavior: "smooth"})
  }, [currPage])

  const totalPages = Math.ceil(
    filteredBooks.length / itemsPerPage
  )

  return (
    <div className='max-padd-container py-12 pt-6 md:pt-10 lg:pt-12'>
      <div className='flex items-center justify-between flex-wrap gap-4 mb-6'>
        <Title
          title1={category}
          title2={"Books"}
          titleStyles="space-y-2"
          title1Styles="pb-"
          paraStyles="mt-0"
        />

        {/* Morphing Typewriter Search */}
        <TypewriterSearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholders={categoryPlaceholders}
          isMorphing={true}
          isOpen={showSearch}
          onToggleOpen={() => setShowSearch(prev => !prev)}
          autoFocus={true}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <div className='min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-[#FAF5EE] rounded-3xl border border-[#EADBCE] mt-4'>
          <p className='text-gray-700 font-serif font-bold text-lg'>No books found</p>
          <p className='text-gray-500 text-xs mt-1'>Try adjusting your search query.</p>
        </div>
      ) : (
        <>
          {/* Desktop / Tablet Grid (sm and up) */}
          <div className='hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 md:mt-6'>
            {filteredBooks
              .slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage)
              .map((book, index) => (
                <Item key={book._id || index} book={book} index={index} />
              ))}
          </div>

          {/* Mobile Stacking Card Layout (sm:hidden — matching All Books page sticky card stack animation) */}
          <div className='flex sm:hidden flex-col w-full pb-28 mt-4' style={{ gap: '2rem' }}>
            {filteredBooks
              .slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage)
              .map((book, index) => (
                <div
                  key={book._id || index}
                  className='sticky w-full max-w-[380px] mx-auto'
                  style={{
                    top: `${80 + index * 6}px`,
                    zIndex: index + 10,
                  }}
                >
                  <Item book={book} index={index} isStacked={true} />
                </div>
              ))}
          </div>
        </>
      )}
      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currPage}
        totalPages={totalPages}
        totalItems={filteredBooks.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(pg) => {
          setCurrPage(pg)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val)
          setCurrPage(1)
        }}
        rowsOptions={[5, 10, 20]}
        itemLabel="books"
        className="mt-10 mb-12"
      />
    </div>
  )
}

export default CategoryShop
