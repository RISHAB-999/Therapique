import React, { useContext, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { AdminContext } from '../../context/AdminContext'
import { Mail, Edit2, X, Check, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
import TypewriterSearchInput from '../../components/TypewriterSearchInput'
import CustomDropdown from '../../components/ui/CustomDropdown'
import PaginationControls from '../../components/ui/PaginationControls'

const doctorSearchPlaceholders = [
  'Search by doctor name...',
  'Search by speciality...',
  'Search by email address...',
]

const standardSpecialities = [
  'Clinical Psychologist',
  'Counseling Psychologist',
  'Child & Adolescent Therapist',
  'Marriage & Family Therapist',
  'Trauma Therapist',
  'Addiction Counselor',
  'Cognitive Behavioral Therapist (CBT)',
  'Art & Music Therapist',
]

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors, updateDoctorCredentials } = useContext(AdminContext)

  const defaultDocImg = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop"

  // Search & Filter State (Matching BookList design)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [availabilityFilter, setAvailabilityFilter] = useState('All')
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false)
  const [isAvailabilityDropdownOpen, setIsAvailabilityDropdownOpen] = useState(false)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, availabilityFilter, itemsPerPage])

  // Edit Credentials (Email & Password) Modal State
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleOpenEditModal = (doc) => {
    setEditingDoctor(doc)
    setEmailInput(doc.email || '')
    setPasswordInput('')
    setShowPassword(false)
    setErrorMessage('')
  }

  const handleCloseModal = () => {
    setEditingDoctor(null)
    setEmailInput('')
    setPasswordInput('')
    setShowPassword(false)
    setErrorMessage('')
    setIsUpdating(false)
  }

  const handleSaveCredentials = async (e) => {
    e.preventDefault()
    if (!emailInput.trim()) {
      setErrorMessage('Please enter an email address')
      return
    }

    if (passwordInput && passwordInput.trim().length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      return
    }

    setIsUpdating(true)
    setErrorMessage('')

    const res = await updateDoctorCredentials(editingDoctor._id, {
      email: emailInput.trim(),
      password: passwordInput.trim()
    })
    setIsUpdating(false)

    if (res.success) {
      handleCloseModal()
    } else {
      setErrorMessage(res.message || res.error || 'Failed to update credentials')
    }
  }

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
      const interval = setInterval(() => {
        getAllDoctors()
      }, 3000)

      const handleFocus = () => getAllDoctors()
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          getAllDoctors()
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

  // Combine standard specialities + any additional specialities in DB
  const allCategories = [
    'All',
    ...Array.from(
      new Set([
        ...standardSpecialities,
        ...(doctors || []).map((d) => d.speciality).filter(Boolean)
      ])
    )
  ]

  // Filtered Doctors Calculation
  const filteredDoctors = (doctors || []).filter((item) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !query ||
      item.name?.toLowerCase().includes(query) ||
      item.speciality?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory === 'All' ||
      item.speciality?.toLowerCase() === selectedCategory.toLowerCase() ||
      (item.speciality?.toLowerCase().includes('cbt') && selectedCategory.toLowerCase().includes('cbt'))

    const matchesAvailability =
      availabilityFilter === 'All' ||
      (availabilityFilter === 'Available' && item.available) ||
      (availabilityFilter === 'Unavailable' && !item.available)

    return matchesSearch && matchesCategory && matchesAvailability
  })

  // Pagination Calculations
  const totalItems = filteredDoctors.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedDoctors = filteredDoctors.slice(startIndex, endIndex)

  return (
    <div className='space-y-6 w-full max-w-7xl mx-auto relative'>
      {/* Top Header Row with Total Doctors Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
        <div>
          <h1 className='text-xl sm:text-2xl font-black text-gray-800 tracking-tight'>All Doctors</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage doctor availability status, emails, passwords, and practice profiles across the platform</p>
        </div>
        <span className="self-start sm:self-auto text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-3.5 py-1.5 rounded-full">
          Total Doctors: {filteredDoctors.length} / {(doctors || []).length}
        </span>
      </div>

      {/* Search & Category Filter Controls Header (Matching BookList exactly) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar Input with Typewriter Animation */}
          <div className="flex-1 min-w-[260px]">
            <TypewriterSearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholders={doctorSearchPlaceholders}
            />
          </div>

          {/* Filters Group: Category Dropdown + Availability Status Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Category Dropdown */}
            <CustomDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              labelPrefix="Category:"
              options={allCategories.map((cat) => ({
                value: cat,
                label: cat === 'All' ? 'All Categories' : cat,
                count:
                  cat === 'All'
                    ? (doctors || []).length
                    : (doctors || []).filter(
                        (d) =>
                          d.speciality?.toLowerCase() === cat.toLowerCase() ||
                          (d.speciality?.toLowerCase().includes('cbt') && cat.toLowerCase().includes('cbt'))
                      ).length,
              }))}
              minWidth="min-w-[170px]"
            />

            {/* Availability Status Dropdown */}
            <CustomDropdown
              value={availabilityFilter}
              onChange={setAvailabilityFilter}
              labelPrefix="Status:"
              options={[
                { value: 'All', label: 'All Status', count: (doctors || []).length },
                { value: 'Available', label: 'Available Only', count: (doctors || []).filter((d) => d.available).length },
                { value: 'Unavailable', label: 'Unavailable Only', count: (doctors || []).filter((d) => !d.available).length },
              ]}
              minWidth="min-w-[150px]"
            />

            {/* Clear Filters button if any filter or search query is active */}
            {(searchQuery || selectedCategory !== 'All' || availabilityFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                  setAvailabilityFilter('All')
                }}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid or Empty State */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-gray-800">No doctors found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No therapists or specialists matched your current search or category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
              setAvailabilityFilter('All')
            }}
            className="mt-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Clear Filters</span>
          </button>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full'>
            {displayedDoctors.map((item, index) => (
              <div 
                className='border border-slate-200/80 rounded-2xl overflow-hidden group flex flex-col bg-white shadow-sm hover:shadow-md transition-all duration-300' 
                key={item._id || index}
              >
                <div className='w-full h-64 bg-purple-50/50 overflow-hidden group-hover:bg-purple-100/60 transition-colors duration-300 shrink-0 relative'>
                  <img 
                    className='w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500' 
                    src={item.image || defaultDocImg} 
                    alt={item.name} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = defaultDocImg;
                    }}
                  />
                </div>

                <div className='p-4 flex-1 flex flex-col justify-between space-y-3'>
                  <div>
                    <p className='text-gray-900 text-sm font-extrabold line-clamp-1 group-hover:text-purple-700 transition-colors'>
                      {item.name}
                    </p>
                    <p className='text-gray-500 text-xs font-semibold line-clamp-1 mt-0.5'>
                      {item.speciality}
                    </p>

                    {/* Doctor Email Display & Edit Button */}
                    <div className='mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-1.5'>
                      <div className='flex items-center gap-1.5 min-w-0 flex-1' title={item.email}>
                        <Mail className='w-3.5 h-3.5 text-purple-600 shrink-0' />
                        <span className='text-[11px] text-gray-700 font-medium truncate'>
                          {item.email || 'No email set'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className='text-[10px] font-bold text-purple-700 bg-purple-100/70 hover:bg-purple-200 px-2 py-0.5 rounded-md transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs'
                        title="Change doctor email or password"
                      >
                        <Edit2 className='w-2.5 h-2.5' />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 text-xs pt-1'>
                    <input 
                      onChange={() => changeAvailability(item._id)} 
                      type="checkbox" 
                      checked={item.available} 
                      className='cursor-pointer w-4 h-4 accent-purple-600 rounded shrink-0'
                    />
                    <p className={`font-bold text-xs ${item.available ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls with custom Rows dropdown */}
          <PaginationControls
            currentPage={validCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
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
            itemLabel="doctors"
            className="rounded-2xl border shadow-xs mt-8"
          />
        </>
      )}

      {/* Edit Doctor Credentials Modal (Portaled to document.body for full-screen backdrop coverage) */}
      {editingDoctor && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div className='fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto'>
          <div className='bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 relative my-auto'>
            {/* Modal Header */}
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <img 
                  src={editingDoctor.image || defaultDocImg} 
                  className='w-12 h-12 rounded-2xl object-cover border border-purple-200 shadow-xs' 
                  alt="" 
                />
                <div>
                  <h3 className='text-sm font-black text-gray-900'>{editingDoctor.name}</h3>
                  <p className='text-[11px] text-purple-600 font-semibold'>{editingDoctor.speciality || 'Specialist'}</p>
                  <p className='text-[10px] text-gray-400 font-medium'>Edit Login Credentials</p>
                </div>
              </div>
              <button 
                type='button'
                onClick={handleCloseModal}
                className='p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Current Email Info Badge */}
            <div className='p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs'>
              <span className='text-[11px] text-gray-500 font-semibold'>Current Email:</span>
              <span className='text-[11px] font-bold text-purple-900 truncate max-w-[240px]'>
                {editingDoctor.email || 'None set'}
              </span>
            </div>

            <form onSubmit={handleSaveCredentials} className='space-y-4 pt-1'>
              {/* Email Address Field */}
              <div>
                <label className='block text-xs font-bold text-gray-700 mb-1.5'>
                  Doctor Email Address
                </label>
                <div className='relative flex items-center'>
                  <Mail className='w-4 h-4 text-purple-600 absolute left-3.5 pointer-events-none' />
                  <input 
                    type='email' 
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder='e.g. doctor@gmail.com'
                    className='w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-gray-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition'
                    autoFocus
                  />
                  {emailInput && (
                    <button
                      type='button'
                      onClick={() => setEmailInput('')}
                      className='absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer'
                      title='Clear'
                    >
                      <X className='w-3.5 h-3.5' />
                    </button>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className='flex items-center justify-between mb-1.5'>
                  <label className='block text-xs font-bold text-gray-700'>
                    Change Password
                  </label>
                  <span className='text-[10px] font-medium text-slate-400'>Optional</span>
                </div>
                <div className='relative flex items-center'>
                  <Lock className='w-4 h-4 text-purple-600 absolute left-3.5 pointer-events-none' />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder='Leave blank to keep unchanged (min. 8 chars)'
                    className='w-full pl-10 pr-10 py-2.5 text-xs font-semibold bg-gray-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition'
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-2.5 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer'
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className='w-3.5 h-3.5' /> : <Eye className='w-3.5 h-3.5' />}
                  </button>
                </div>
                <p className='text-[11px] text-gray-400 mt-1 leading-relaxed'>
                  Type a new password (min. 8 characters) to reset this doctor's login access.
                </p>
              </div>

              {errorMessage && (
                <div className='p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2'>
                  <AlertCircle className='w-4 h-4 shrink-0 text-rose-500' />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className='flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={handleCloseModal}
                  disabled={isUpdating}
                  className='px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isUpdating}
                  className='px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm hover:shadow transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95'
                >
                  {isUpdating ? (
                    <>
                      <div className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className='w-3.5 h-3.5' />
                      <span>Save Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default DoctorsList