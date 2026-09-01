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
    <div className='max-padd-container py-16 pt-8 md:pt-12 lg:pt-16'>
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

      <div className='mt-4 md:mt-6 lg:mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-8'>
        {filteredBooks.length > 0 ? (
          filteredBooks
            .slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage)
            .map((book) => (
              <Item key={book._id} book={book} />
            ))
        ) : (
          <h4 className="h4">Oops! Nothing matched your search</h4>
        )}
      </div>
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
