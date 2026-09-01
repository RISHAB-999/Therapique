import React, { useContext, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import Item from '../components/Item'
import { ShopContext } from '../context/ShopContext'
import { SlidersHorizontal, ArrowUpDown, X, Check, ChevronDown } from 'lucide-react'
import TypewriterSearchInput from '../components/TypewriterSearchInput'
import PaginationControls from '../components/PaginationControls'

const bookPlaceholders = [
  'Search books, authors...',
  'Search "Emotional Intelligence"...',
  'Search "Man\'s Search For Meaning"...',
  'Search "The Happiness Trap"...',
  'Search CBT, Trauma, Self-Help...',
]

const Shop = () => {
  const { books, searchQuery, setSearchQuery } = useContext(ShopContext)
  const navigate = useNavigate()

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('default') // 'default' | 'in-stock' | 'price-low' | 'price-high' | 'title-asc' | 'title-desc'
  const [currPage, setCurrPage] = useState(1)
  const [showSearch, setShowSearch] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Mobile Bottom Drawers
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [showSortDrawer, setShowSortDrawer] = useState(false)

  // Desktop Sidebar Accordions (Categories open by default, Sort closed by default)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Extract unique categories dynamically from books or defaults
  const categoriesList = useMemo(() => {
    const defaultCats = [
      'Self-Help & Counseling',
      'CBT & Psychology',
      'Mental Health',
      'Children & Parenting',
      'Relationships & Family',
      'Trauma Recovery',
      'Addiction Recovery',
      'Creative Therapy'
    ]
    const extracted = new Set()
    books.forEach(b => {
      if (b.category && b.category.trim()) {
        extracted.add(b.category.trim())
      }
    })
    defaultCats.forEach(c => extracted.add(c))
    return Array.from(extracted)
  }, [books])

  const sortOptions = [
    { id: 'default', label: 'Default / Featured' },
    { id: 'in-stock', label: 'In Stock Books First' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'title-asc', label: 'Title: A to Z' },
    { id: 'title-desc', label: 'Title: Z to A' },
  ]

  // Filter and Sort Books
  const displayedBooks = useMemo(() => {
    let list = books ? [...books] : []

    // 1. Search Query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(book =>
        (book.name || book.title || '').toLowerCase().includes(q) ||
        (book.author || '').toLowerCase().includes(q) ||
        (book.description || '').toLowerCase().includes(q) ||
        (book.category || '').toLowerCase().includes(q)
      )
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(book => 
        (book.category || '').toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // 3. Sorting
    if (sortBy === 'in-stock') {
      list.sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0))
    } else if (sortBy === 'price-low') {
      list.sort((a, b) => (Number(a.offerPrice || a.price) || 0) - (Number(b.offerPrice || b.price) || 0))
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (Number(b.offerPrice || b.price) || 0) - (Number(a.offerPrice || a.price) || 0))
    } else if (sortBy === 'title-asc') {
      list.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''))
    } else if (sortBy === 'title-desc') {
      list.sort((a, b) => (b.name || b.title || '').localeCompare(a.name || a.title || ''))
    }

    return list
  }, [books, searchQuery, selectedCategory, sortBy])

  // Reset page to 1 and scroll smoothly to top when filters change
  useEffect(() => {
    setCurrPage(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchQuery, selectedCategory, sortBy, itemsPerPage])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currPage])

  const totalPages = Math.ceil(displayedBooks.length / itemsPerPage)

  const paginatedBooks = useMemo(() => {
    return displayedBooks.slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage)
  }, [displayedBooks, currPage, itemsPerPage])

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setShowFilterDrawer(false)
  }

  const handleSortSelect = (sortId) => {
    setSortBy(sortId)
    setShowSortDrawer(false)
  }

  return (
    <div className='max-padd-container py-12 pt-6 md:pt-10 lg:pt-12 relative'>
      {/* Header with Title and Search Bar */}
      <div className='flex items-center justify-between flex-wrap gap-4 mb-8'>
        <Title
          title1={"All"}
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
          placeholders={bookPlaceholders}
          isMorphing={true}
          isOpen={showSearch}
          onToggleOpen={() => setShowSearch(prev => !prev)}
          autoFocus={true}
        />
      </div>

      <div className='flex flex-col sm:flex-row items-start gap-6'>
        {/* Desktop Sidebar Filters */}
        <div className='hidden sm:flex flex-col gap-3 w-64 shrink-0 text-sm text-gray-600'>
          
          {/* CATEGORIES DROPDOWN SECTION */}
          <div className="w-full">
            <div 
              onClick={() => setIsCategoriesOpen(prev => !prev)}
              className="flex items-center justify-between py-1.5 cursor-pointer select-none group"
            >
              <span className="font-bold text-xs uppercase tracking-wider text-[#1E1138] flex items-center gap-1.5 group-hover:text-purple-900 transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-700" />
                Categories
              </span>
              <div className="flex items-center gap-2">
                {selectedCategory !== 'All' && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setSelectedCategory('All'); }} 
                    className="text-xs text-[#7C3AED] font-bold cursor-pointer hover:underline"
                  >
                    Reset
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Collapsible Categories Pills */}
            <div className={`flex flex-col gap-2 transition-all duration-300 overflow-hidden ${isCategoriesOpen ? 'max-h-[600px] mt-2.5 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
              <p
                onClick={() => setSelectedCategory('All')}
                className={`pl-3.5 py-2.5 pr-4 border rounded-2xl transition-all cursor-pointer text-xs font-medium flex items-center justify-between ${
                  selectedCategory === 'All'
                    ? 'bg-black text-white border-black font-bold shadow-xs' 
                    : 'border-[#EADBCE] bg-[#FAF5EE] text-gray-700 hover:bg-[#F3E8DE]'
                }`}
              >
                <span>All Books (Show All)</span>
                {selectedCategory === 'All' && <Check className="w-3.5 h-3.5 text-white" />}
              </p>

              {categoriesList.map((item, idx) => (
                <p
                  key={idx}
                  onClick={() => setSelectedCategory(selectedCategory === item ? 'All' : item)}
                  className={`pl-3.5 py-2.5 pr-4 border rounded-2xl transition-all cursor-pointer text-xs font-medium flex items-center justify-between ${
                    selectedCategory === item 
                      ? 'bg-black text-white border-black font-bold shadow-xs' 
                      : 'border-[#EADBCE] bg-[#FAF5EE] text-gray-700 hover:bg-[#F3E8DE]'
                  }`}
                >
                  <span className="truncate pr-1">{item}</span>
                  {selectedCategory === item && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </p>
              ))}
            </div>
          </div>

          {/* SORT BOOKS DROPDOWN SECTION */}
          <div className="w-full mt-3">
            <div 
              onClick={() => setIsSortOpen(prev => !prev)}
              className="flex items-center justify-between py-1.5 cursor-pointer select-none group"
            >
              <span className="font-bold text-xs uppercase tracking-wider text-[#1E1138] flex items-center gap-1.5 group-hover:text-purple-900 transition-colors">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-700" />
                Sort Books
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Collapsible Sort Options Pills */}
            <div className={`flex flex-col gap-2 transition-all duration-300 overflow-hidden ${isSortOpen ? 'max-h-[500px] mt-2.5 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
              {sortOptions.map((opt) => (
                <p
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`pl-3.5 py-2.5 pr-4 border rounded-2xl transition-all cursor-pointer text-xs font-medium flex items-center justify-between ${
                    sortBy === opt.id
                      ? 'bg-black text-white border-black font-bold shadow-xs' 
                      : 'border-[#EADBCE] bg-[#FAF5EE] text-gray-700 hover:bg-[#F3E8DE]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Books Cards Grid Area */}
        <div className='flex-1 w-full'>
          {displayedBooks.length === 0 ? (
            <div className='min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-[#FAF5EE] rounded-3xl border border-[#EADBCE]'>
              <p className='text-gray-700 font-serif font-bold text-lg'>No books found</p>
              <p className='text-gray-500 text-xs mt-1'>Try adjusting your search query or category filter.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSortBy('default'); setSearchQuery(''); }}
                className='mt-4 bg-black text-white px-5 py-2 rounded-full text-xs font-bold shadow-sm active:scale-95 cursor-pointer'
              >
                Clear All Filters & Search
              </button>
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Grid (sm and up) */}
              <div className='hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                {paginatedBooks.map((book, index) => (
                  <Item key={book._id || index} book={book} index={index} />
                ))}
              </div>

              {/* Mobile Stacking Card Layout (sm:hidden — matching Doctor page sticky card stack animation) */}
              <div className='flex sm:hidden flex-col w-full pb-28' style={{ gap: '2rem' }}>
                {paginatedBooks.map((book, index) => (
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

              {/* Pagination Controls */}
              <PaginationControls
                currentPage={currPage}
                totalPages={totalPages}
                totalItems={displayedBooks.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(pg) => {
                  setCurrPage(pg)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val)
                  setCurrPage(1)
                }}
                rowsOptions={[6, 12, 24, 48]}
                itemLabel="books"
                className="mt-10 mb-16 sm:mb-0"
              />
            </>
          )}
        </div>
      </div>

      {/* ================= FLOATING MOBILE BOTTOM ACTION BAR ================= */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[340px] sm:hidden bg-white/95 backdrop-blur-xl border border-[#EADBCE] rounded-full shadow-2xl p-1.5 flex items-center justify-between">
        {/* Filters Button */}
        <button 
          onClick={() => setShowFilterDrawer(true)} 
          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-900 active:scale-95 transition-transform cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-gray-800" />
          <span>Filters {selectedCategory !== 'All' ? `(1)` : ''}</span>
        </button>

        {/* Subtle Center Divider */}
        <div className="w-px h-5 bg-[#EADBCE]" />

        {/* Sort by Button */}
        <button 
          onClick={() => setShowSortDrawer(true)} 
          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-900 active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowUpDown className="w-4 h-4 text-gray-800" />
          <span>Sort by</span>
        </button>
      </div>

      {/* ================= MOBILE FILTERS DRAWER (BOTTOM SHEET) ================= */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:hidden anim-fade-scale">
          <div className="w-full bg-[#FAF5EE] rounded-t-3xl border-t border-[#EADBCE] p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-black" />
                <h3 className="font-therapique text-lg font-bold text-gray-900">Filter by Category</h3>
              </div>
              <button 
                onClick={() => setShowFilterDrawer(false)}
                className="w-8 h-8 rounded-full bg-[#F3E8DE] flex items-center justify-center text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleCategorySelect('All')}
                className={`p-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-800 border border-[#EADBCE]'
                }`}
              >
                <span>All Books (Show All)</span>
                {selectedCategory === 'All' && <Check className="w-4 h-4 text-white" />}
              </button>

              {categoriesList.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCategorySelect(item)}
                  className={`p-3 rounded-2xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    selectedCategory === item
                      ? 'bg-black text-white font-bold'
                      : 'bg-white text-gray-800 border border-[#EADBCE] font-medium'
                  }`}
                >
                  <span>{item}</span>
                  {selectedCategory === item && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE SORT BY DRAWER (BOTTOM SHEET) ================= */}
      {showSortDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:hidden anim-fade-scale">
          <div className="w-full bg-[#FAF5EE] rounded-t-3xl border-t border-[#EADBCE] p-6 max-h-[75vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-black" />
                <h3 className="font-therapique text-lg font-bold text-gray-900">Sort Books</h3>
              </div>
              <button 
                onClick={() => setShowSortDrawer(false)}
                className="w-8 h-8 rounded-full bg-[#F3E8DE] flex items-center justify-center text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSortSelect(opt.id)}
                  className={`p-3.5 rounded-2xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    sortBy === opt.id
                      ? 'bg-black text-white font-bold shadow-xs'
                      : 'bg-white text-gray-800 border border-[#EADBCE] font-medium'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop
