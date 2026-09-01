import React, { useContext, useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import DoctorItemCard from '../components/DoctorItemCard'
import { SlidersHorizontal, ArrowUpDown, X, Check, ChevronDown } from 'lucide-react'
import TypewriterSearchInput from '../components/TypewriterSearchInput'
import PaginationControls from '../components/PaginationControls'

const doctorPlaceholders = [
  'Search therapist or specialty...',
  'Search Clinical Psychologist...',
  'Search Trauma Therapist...',
  'Search Cognitive Behavioral (CBT)...',
  'Search Marriage & Family...',
  'Search Child & Adolescent...',
]

const Doctors = () => {
  const { speciality: urlSpeciality } = useParams()
  const { doctors, getDoctorData } = useContext(AppContext)

  // In-place local speciality state so filtering NEVER triggers full-page router transitions
  const [currentSpeciality, setCurrentSpeciality] = useState(urlSpeciality || 'All')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)

  // Sync if route URL param changes externally (e.g. from Home or Navbar direct navigation)
  useEffect(() => {
    setCurrentSpeciality(urlSpeciality || 'All')
  }, [urlSpeciality])

  useEffect(() => {
    if (getDoctorData) {
      getDoctorData(true)
    }
  }, [])

  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [showSortDrawer, setShowSortDrawer] = useState(false)
  const [sortBy, setSortBy] = useState('default') // 'default' | 'available' | 'experience' | 'fee-low' | 'fee-high'
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Reset page when filters, sort, search, or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentSpeciality, sortBy, searchQuery, itemsPerPage])

  // Collapsible dropdown state for sidebar sections (Sort Doctors closed by default)
  const [isSpecialitiesOpen, setIsSpecialitiesOpen] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const specialities = [
    'Clinical Psychologist',
    'Counseling Psychologist',
    'Child & Adolescent Therapist',
    'Marriage & Family Therapist',
    'Trauma Therapist',
    'Addiction Counselor',
    'Cognitive Behavioral Therapist (CBT)',
    'Art & Music Therapist',
  ]

  const sortOptions = [
    { id: 'default', label: 'Default / Recommended' },
    { id: 'available', label: 'Available Therapists First' },
    { id: 'experience', label: 'Experience: High to Low' },
    { id: 'fee-low', label: 'Consultation Fee: Low to High' },
    { id: 'fee-high', label: 'Consultation Fee: High to Low' },
  ]

  // Filter and sort doctor cards
  const displayedDoctors = useMemo(() => {
    let list = doctors ? [...doctors] : []

    // 1. Search Query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(doc => 
        doc.name?.toLowerCase().includes(q) ||
        doc.speciality?.toLowerCase().includes(q) ||
        doc.about?.toLowerCase().includes(q) ||
        doc.degree?.toLowerCase().includes(q)
      )
    }

    // 2. Specialty Filter
    if (currentSpeciality && currentSpeciality !== 'All') {
      list = list.filter(doc => doc.speciality?.toLowerCase() === currentSpeciality.toLowerCase())
    }

    // 3. Sorting
    if (sortBy === 'available') {
      list.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0))
    } else if (sortBy === 'experience') {
      list.sort((a, b) => (parseInt(b.experience) || 0) - (parseInt(a.experience) || 0))
    } else if (sortBy === 'fee-low') {
      list.sort((a, b) => (a.fees || 0) - (b.fees || 0))
    } else if (sortBy === 'fee-high') {
      list.sort((a, b) => (b.fees || 0) - (a.fees || 0))
    }

    return list
  }, [doctors, currentSpeciality, sortBy, searchQuery])

  const totalPages = Math.max(1, Math.ceil(displayedDoctors.length / itemsPerPage))

  const paginatedDoctors = useMemo(() => {
    return displayedDoctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [displayedDoctors, currentPage, itemsPerPage])

  const handleSpecialitySelect = (spec) => {
    const nextSpec = currentSpeciality === spec ? 'All' : spec
    setCurrentSpeciality(nextSpec)
    if (nextSpec === 'All') {
      window.history.replaceState(null, '', '/doctors')
    } else {
      window.history.replaceState(null, '', `/doctors/${encodeURIComponent(nextSpec)}`)
    }
    setShowFilterDrawer(false)
  }

  const handleSortSelect = (sortId) => {
    setSortBy(sortId)
    setShowSortDrawer(false)
  }

  return (
    <div className='my-8 sm:my-10 relative'>
      {/* Header with Title and Search Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-600 leading-tight">
            Browse through the <br />
            <span className="font-therapique font-bold text-[#1E1138] text-2xl sm:text-3xl md:text-4xl">
              doctor specialist.
            </span>
          </h1>
        </div>

        {/* Morphing Typewriter Search Bar */}
        <TypewriterSearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholders={doctorPlaceholders}
          isMorphing={true}
          isOpen={showSearch}
          onToggleOpen={() => setShowSearch(prev => !prev)}
          autoFocus={true}
        />
      </div>

      <div className='flex flex-col sm:flex-row items-start gap-6'>
        {/* Desktop Sidebar Filters */}
        <div className='hidden sm:flex flex-col gap-2 w-64 shrink-0 text-sm text-gray-600'>
          
          {/* SPECIALITIES DROPDOWN SECTION */}
          <div className="w-full">
            <div 
              onClick={() => setIsSpecialitiesOpen(prev => !prev)}
              className="flex items-center justify-between py-1.5 cursor-pointer select-none group"
            >
              <span className="font-bold text-xs uppercase tracking-wider text-[#1E1138] flex items-center gap-1.5 group-hover:text-purple-900 transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-700" />
                Specialities
              </span>
              <div className="flex items-center gap-2">
                {currentSpeciality !== 'All' && (
                  <span 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setCurrentSpeciality('All'); 
                      window.history.replaceState(null, '', '/doctors');
                    }} 
                    className="text-xs text-[#7C3AED] font-bold cursor-pointer hover:underline"
                  >
                    Reset
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isSpecialitiesOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Collapsible Specialities Pills */}
            <div className={`flex flex-col gap-2 transition-all duration-300 overflow-hidden ${isSpecialitiesOpen ? 'max-h-[500px] mt-2.5 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
              <p
                onClick={() => {
                  setCurrentSpeciality('All');
                  window.history.replaceState(null, '', '/doctors');
                }}
                className={`pl-3.5 py-2.5 pr-4 border rounded-2xl transition-all cursor-pointer text-xs font-medium flex items-center justify-between ${
                  currentSpeciality === 'All'
                    ? 'bg-black text-white border-black font-bold shadow-xs' 
                    : 'border-[#EADBCE] bg-[#FAF5EE] text-gray-700 hover:bg-[#F3E8DE]'
                }`}
              >
                <span>All Specialities (Show All)</span>
                {currentSpeciality === 'All' && <Check className="w-3.5 h-3.5 text-white" />}
              </p>

              {specialities.map((item, idx) => (
                <p
                  key={idx}
                  onClick={() => handleSpecialitySelect(item)}
                  className={`pl-3.5 py-2.5 pr-4 border rounded-2xl transition-all cursor-pointer text-xs font-medium flex items-center justify-between ${
                    currentSpeciality === item 
                      ? 'bg-black text-white border-black font-bold shadow-xs' 
                      : 'border-[#EADBCE] bg-[#FAF5EE] text-gray-700 hover:bg-[#F3E8DE]'
                  }`}
                >
                  <span>{item}</span>
                  {currentSpeciality === item && <Check className="w-3.5 h-3.5 text-white" />}
                </p>
              ))}
            </div>
          </div>

          {/* SORT DOCTORS DROPDOWN SECTION */}
          <div className="w-full mt-3">
            <div 
              onClick={() => setIsSortOpen(prev => !prev)}
              className="flex items-center justify-between py-1.5 cursor-pointer select-none group"
            >
              <span className="font-bold text-xs uppercase tracking-wider text-[#1E1138] flex items-center gap-1.5 group-hover:text-purple-900 transition-colors">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-700" />
                Sort Doctors
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

        {/* Doctor Cards Area */}
        <div className='flex-1 w-full'>
          {displayedDoctors.length === 0 ? (
            <div className='min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-[#FAF5EE] rounded-3xl border border-[#EADBCE]'>
              <p className='text-gray-700 font-serif font-bold text-lg'>No therapists found</p>
              <p className='text-gray-500 text-xs mt-1'>Try adjusting your search or clearing your filters.</p>
              <button
                onClick={() => { setCurrentSpeciality('All'); window.history.replaceState(null, '', '/doctors'); setSortBy('default'); setSearchQuery(''); }}
                className='mt-4 bg-black text-white px-5 py-2 rounded-full text-xs font-bold shadow-sm active:scale-95 cursor-pointer'
              >
                Clear All Filters & Search
              </button>
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Grid (sm and up) */}
              <div className='hidden sm:grid w-full grid-cols-auto gap-5 gap-y-7'>
                {paginatedDoctors.map((item, index) => (
                  <DoctorItemCard key={item._id || index} item={item} index={index} />
                ))}
              </div>

              {/* Mobile Stacking Card Layout (sm:hidden — EXACT PRESERVED STACKING ANIMATION) */}
              <div className='flex sm:hidden flex-col w-full pb-28' style={{ gap: '2rem' }}>
                {paginatedDoctors.map((item, index) => (
                  <div
                    key={item._id || index}
                    className='sticky w-full max-w-[400px] mx-auto'
                    style={{
                      top: `${80 + index * 6}px`,
                      zIndex: index + 10,
                    }}
                  >
                    <DoctorItemCard item={item} index={index} isStacked={true} />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={displayedDoctors.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(pg) => {
                  setCurrentPage(pg)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val)
                  setCurrentPage(1)
                }}
                rowsOptions={[4, 8, 12, 24]}
                itemLabel="doctors"
                className="mt-10"
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
          <span>Filters {currentSpeciality !== 'All' ? `(1)` : ''}</span>
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
                <h3 className="font-therapique text-lg font-bold text-gray-900">Filter by Speciality</h3>
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
                onClick={() => {
                  setCurrentSpeciality('All');
                  window.history.replaceState(null, '', '/doctors');
                  setShowFilterDrawer(false);
                }}
                className={`p-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  currentSpeciality === 'All'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-800 border border-[#EADBCE]'
                }`}
              >
                <span>All Specialities (Show All)</span>
                {currentSpeciality === 'All' && <Check className="w-4 h-4 text-white" />}
              </button>

              {specialities.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSpecialitySelect(item)}
                  className={`p-3 rounded-2xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    currentSpeciality === item
                      ? 'bg-black text-white font-bold'
                      : 'bg-white text-gray-800 border border-[#EADBCE] font-medium'
                  }`}
                >
                  <span>{item}</span>
                  {currentSpeciality === item && <Check className="w-4 h-4 text-white" />}
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
                <h3 className="font-therapique text-lg font-bold text-gray-900">Sort Doctors</h3>
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

export default Doctors