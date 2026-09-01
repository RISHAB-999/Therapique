import React, { useEffect, useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import TypewriterSearchInput from '../../components/TypewriterSearchInput'
import CustomDropdown from '../../components/ui/CustomDropdown'
import PaginationControls from '../../components/ui/PaginationControls'

const adminBookPlaceholders = [
  'Search by book title...',
  'Search by author name...',
  'Search by category...',
]

const BookList = () => {
  const { aToken } = useContext(AdminContext)
  const { backendUrl, currency } = useContext(AppContext)

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [stockFilter, setStockFilter] = useState('All')
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fetchBooks = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/book/list')
      if (data.success) {
        setBooks(data.books)
      } else if (!isSilent) {
        toast.error(data.message)
      }
    } catch (error) {
      if (!isSilent) {
        toast.error(error.message)
        console.log(error)
      }
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  const handleToggleStock = async (id) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/book/toggle-stock',
        { id },
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchBooks()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleFormatStock = async (id, format) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/book/toggle-format-stock',
        { id, format },
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchBooks()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRemoveBook = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete '${title}' from the library?`)) return

    try {
      const { data } = await axios.post(
        backendUrl + '/api/book/remove',
        { id },
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchBooks()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (aToken) {
      fetchBooks()
      const interval = setInterval(() => {
        fetchBooks(true)
      }, 3000)

      const handleFocus = () => fetchBooks(true)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchBooks(true)
        }
      }

      window.addEventListener('focus', handleFocus)
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(interval)
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [aToken])

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, stockFilter])

  // Filtered Books Calculation
  const filteredBooks = books.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' || item.category?.toLowerCase() === selectedCategory.toLowerCase()

    const matchesStock =
      stockFilter === 'All' ||
      (stockFilter === 'InStock' && item.inStock) ||
      (stockFilter === 'OutOfStock' && !item.inStock)

    return matchesSearch && matchesCategory && matchesStock
  })

  // Pagination Calculations on Filtered Results (20 books per page)
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className='space-y-6 w-full max-w-[1400px] mx-auto'>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
        <div>
          <h1 className='text-xl sm:text-2xl font-black text-gray-800 tracking-tight'>Library Book List</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Showing 20 items per page | Manage stock availability, pricing & listings</p>
        </div>
        <span className="self-start sm:self-auto text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-3.5 py-1.5 rounded-full">
          Total Books: {filteredBooks.length} / {books.length}
        </span>
      </div>

      {/* Search & Category Filter Controls Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Top Controls Row: Search Input + Category Select Dropdown + Stock Select Dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar Input with Typewriter Animation */}
          <div className="flex-1 min-w-[260px]">
            <TypewriterSearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholders={adminBookPlaceholders}
            />
          </div>

          {/* Filters Group: Clean Compact Custom Selects & Reset */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Category Dropdown */}
            <CustomDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              labelPrefix="Category:"
              options={[
                { value: 'All', label: 'All Categories', count: books.length },
                ...[
                  'Mental Health',
                  'Self-Help & Counseling',
                  'Children & Parenting',
                  'Relationships & Family',
                  'Trauma Recovery',
                  'Addiction Recovery',
                  'CBT & Psychology',
                  'Creative Therapy'
                ].map((catName) => ({
                  value: catName,
                  label: catName,
                  count: books.filter(b => b.category?.toLowerCase() === catName.toLowerCase()).length
                }))
              ]}
              minWidth="min-w-[170px]"
            />

            {/* Stock Filter Dropdown */}
            <CustomDropdown
              value={stockFilter}
              onChange={setStockFilter}
              labelPrefix="Stock:"
              options={[
                { value: 'All', label: 'All Stock Status', count: books.length },
                { value: 'InStock', label: 'In Stock Only', count: books.filter(b => b.inStock).length },
                { value: 'OutOfStock', label: 'Out of Stock Only', count: books.filter(b => !b.inStock).length }
              ]}
              minWidth="min-w-[150px]"
            />

            {/* Reset Filters Button */}
            {(searchQuery || selectedCategory !== 'All' || stockFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                  setStockFilter('All')
                }}
                className="text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Reset ↺
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className='min-h-[40vh] flex flex-col items-center justify-center gap-3 p-8'>
          <div className='w-9 h-9 border-4 border-purple-600 border-t-transparent rounded-full animate-spin' />
          <p className='text-xs text-gray-500 font-semibold'>Loading library catalog...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className='bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3'>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flexCenter mx-auto text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Matching Books Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">No books in the library catalog match your search query or selected category filters.</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
              setStockFilter('All')
            }}
            className="text-xs font-extrabold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded-xl transition-colors cursor-pointer inline-block mt-2"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 w-full'>
            {displayedBooks.map((item) => (
              <div
                key={item._id}
                className='bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group'
              >
                {/* Cover Image Container */}
                <div className='w-full h-56 overflow-hidden relative shadow-2xs'>
                  <img
                    src={Array.isArray(item.image) ? item.image[0] : item.image}
                    alt={item.title || item.name}
                    className='w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300'
                  />
                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs ${
                    item.inStock
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Content Body */}
                <div className='p-4 space-y-3 flex-1 flex flex-col justify-between'>
                  <div className='space-y-1'>
                    <span className='text-[10px] font-bold text-purple-700 uppercase tracking-wider block'>
                      {item.category}
                    </span>
                    <h3 className='text-sm font-extrabold text-gray-900 line-clamp-1 group-hover:text-purple-700 transition-colors'>
                      {item.title}
                    </h3>
                    <p className='text-xs text-gray-500 font-medium line-clamp-1'>
                      by {item.author}
                    </p>
                  </div>

                  {/* Formats / Sizes Badges with Interactive Stock Toggle */}
                  <div className='flex flex-wrap gap-1 pt-1'>
                    {item.sizes && item.sizes.map((sz, idx) => {
                      const isFormatOut = item.outOfStockSizes && item.outOfStockSizes.includes(sz)
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleFormatStock(item._id, sz)}
                          title={`Click to toggle '${sz}' format stock status`}
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                            isFormatOut
                              ? 'bg-rose-100 text-rose-700 border-rose-300 line-through hover:bg-rose-200 shadow-2xs'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <span>{isFormatOut ? '✕' : '✓'}</span>
                          <span>{sz}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Footer Bar: Price & Controls */}
                  <div className='pt-3 border-t border-slate-100 flex items-center justify-between gap-2'>
                    <span className='text-base font-black text-gray-900'>
                      {currency} {item.price}
                    </span>

                    <div className='flex items-center gap-1.5'>
                      {/* Stock Toggle Button */}
                      <button
                        onClick={() => handleToggleStock(item._id)}
                        title="Toggle Stock Status"
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                          item.inStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {item.inStock ? '✓ Stock' : '✕ Stock'}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveBook(item._id, item.title)}
                        title="Delete Book"
                        className='p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer flexCenter'
                      >
                        <img className='w-4 h-4 object-contain' src={assets.delete_icon} alt="Delete" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredBooks.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(pg) => {
              setCurrentPage(pg)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val)
              setCurrentPage(1)
            }}
            rowsOptions={[10, 20, 50]}
            itemLabel="books"
            className="mt-8 rounded-2xl border shadow-xs"
          />
        </div>
      )}
    </div>
  )
}

export default BookList
