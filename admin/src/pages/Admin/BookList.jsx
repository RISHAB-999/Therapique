import React, { useEffect, useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'

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
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false)
  const itemsPerPage = 20

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/book/list')
      if (data.success) {
        setBooks(data.books)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    } finally {
      setLoading(false)
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
          {/* Search Bar Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-700">
              <svg className="w-4 h-4 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by book title, author name, or category..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters Group: Clean Compact Custom Selects & Reset */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Category Dropdown Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCatDropdownOpen(!isCatDropdownOpen)
                  setIsStockDropdownOpen(false)
                }}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-gray-700 py-2.5 px-3.5 rounded-xl hover:border-purple-300 hover:bg-slate-100/80 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="font-extrabold text-purple-700">Category:</span>
                <span>{selectedCategory === 'All' ? 'All Categories' : selectedCategory}</span>
                <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full">
                  {selectedCategory === 'All' ? books.length : books.filter(b => b.category?.toLowerCase() === selectedCategory.toLowerCase()).length}
                </span>
                <span className={`text-gray-400 text-[9px] transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isCatDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsCatDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    {[
                      { name: 'All', label: 'All Categories' },
                      { name: 'Mental Health', label: 'Mental Health' },
                      { name: 'Self-Help & Counseling', label: 'Self-Help & Counseling' },
                      { name: 'Children & Parenting', label: 'Children & Parenting' },
                      { name: 'Relationships & Family', label: 'Relationships & Family' },
                      { name: 'Trauma Recovery', label: 'Trauma Recovery' },
                      { name: 'Addiction Recovery', label: 'Addiction Recovery' },
                      { name: 'CBT & Psychology', label: 'CBT & Psychology' },
                      { name: 'Creative Therapy', label: 'Creative Therapy' }
                    ].map((cat) => {
                      const count = cat.name === 'All' ? books.length : books.filter(b => b.category?.toLowerCase() === cat.name.toLowerCase()).length
                      const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      return (
                        <div
                          key={cat.name}
                          onClick={() => {
                            setSelectedCategory(cat.name)
                            setIsCatDropdownOpen(false)
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-600 text-white font-extrabold shadow-2xs'
                              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-gray-500'}`}>
                            ({count})
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Stock Filter Dropdown Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsStockDropdownOpen(!isStockDropdownOpen)
                  setIsCatDropdownOpen(false)
                }}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-gray-700 py-2.5 px-3.5 rounded-xl hover:border-purple-300 hover:bg-slate-100/80 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="font-extrabold text-gray-800">Stock:</span>
                <span>{stockFilter === 'All' ? 'All Stock' : stockFilter === 'InStock' ? 'In Stock Only' : 'Out of Stock Only'}</span>
                <span className={`text-gray-400 text-[9px] transition-transform duration-200 ${isStockDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isStockDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsStockDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    {[
                      { value: 'All', label: 'All Stock Status', count: books.length },
                      { value: 'InStock', label: 'In Stock Only', count: books.filter(b => b.inStock).length },
                      { value: 'OutOfStock', label: 'Out of Stock Only', count: books.filter(b => !b.inStock).length }
                    ].map((st) => {
                      const isSelected = stockFilter === st.value
                      return (
                        <div
                          key={st.value}
                          onClick={() => {
                            setStockFilter(st.value)
                            setIsStockDropdownOpen(false)
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-600 text-white font-extrabold shadow-2xs'
                              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                          }`}
                        >
                          <span>{st.label}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-gray-500'}`}>
                            ({st.count})
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

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

          {/* Pagination Bar (20 Books Per Page) */}
          {totalPages > 1 && (
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs mt-8'>
              <p className='text-xs font-bold text-gray-500'>
                Showing <span className='text-gray-900 font-extrabold'>{startIndex + 1}</span> to <span className='text-gray-900 font-extrabold'>{Math.min(startIndex + itemsPerPage, books.length)}</span> of <span className='text-purple-700 font-extrabold'>{books.length}</span> books
              </p>

              <div className='flex items-center gap-2'>
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className='px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer'
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => {
                      setCurrentPage(pg)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      currentPage === pg
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className='px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer'
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BookList
