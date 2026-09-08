import React, { useEffect, useState, useContext, useMemo } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import TypewriterSearchInput from '../../components/TypewriterSearchInput'
import CustomDropdown from '../../components/ui/CustomDropdown'
import PaginationControls from '../../components/ui/PaginationControls'

const standardCategories = [
  'Mental Health',
  'Self-Help & Counseling',
  'Children & Parenting',
  'Relationships & Family',
  'Trauma Recovery',
  'Addiction Recovery',
  'CBT & Psychology',
  'Creative Therapy'
]

const deliveryStatuses = [
  { label: 'Order Placed', dotColor: 'bg-amber-500', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { label: 'Packing & Preparing', dotColor: 'bg-yellow-500', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { label: 'Shipped', dotColor: 'bg-blue-500', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { label: 'Out for Delivery', dotColor: 'bg-purple-500', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { label: 'Delivered', dotColor: 'bg-emerald-500', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { label: 'Cancelled', dotColor: 'bg-rose-500', color: 'text-rose-700 bg-rose-50 border-rose-200' }
]

const progressSteps = [
  { key: 'placed', label: 'Order Placed', short: 'Placed' },
  { key: 'packed', label: 'Packing & Preparing', short: 'Packed' },
  { key: 'shipped', label: 'Shipped', short: 'Shipped' },
  { key: 'delivered', label: 'Delivered', short: 'Delivered' },
]

const BookOrders = () => {
  const { aToken } = useContext(AdminContext)
  const { backendUrl, currency } = useContext(AppContext)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)

  // Mobile Tab State per Order
  const [activeMobileTabs, setActiveMobileTabs] = useState({})
  const setOrderTab = (orderId, tab) => {
    setActiveMobileTabs(prev => ({ ...prev, [orderId]: tab }))
  }

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Reset page when filters or items per page change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedStatus, itemsPerPage])

  const orderSearchPlaceholders = [
    'Search by Order ID (e.g. #6a96...)...',
    'Search by customer name or email...',
    'Search by book title or format...',
    'Search by city, state, or phone...'
  ]

  const fetchOrders = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/book/orders', {
        headers: { aToken }
      })
      if (data.success) {
        setOrders(data.orders || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      const { data } = await axios.post(
        backendUrl + '/api/book/update-status',
        { orderId, status: newStatus },
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(`Order marked as '${newStatus}'!`)
        // Optimistic update
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: newStatus, isManualStatus: true } : o))
        )
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleClearOrders = async () => {
    if (!window.confirm('Are you sure you want to clear all order history?')) return
    try {
      const { data } = await axios.post(
        backendUrl + '/api/book/clear-orders',
        {},
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchOrders()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId)
    toast.success('Order ID copied to clipboard!')
  }

  const defaultBookImg =
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop'

  const getItemImage = (item) => {
    if (!item) return defaultBookImg
    if (Array.isArray(item.image) && item.image.length > 0) {
      const first = item.image[0]
      if (typeof first === 'string' && first.trim()) return first
      if (first && typeof first.url === 'string' && first.url.trim()) return first.url
    }
    if (typeof item.image === 'string' && item.image.trim()) return item.image
    return defaultBookImg
  }

  useEffect(() => {
    if (aToken) {
      fetchOrders(true)
      const interval = setInterval(() => fetchOrders(false), 8000)
      return () => clearInterval(interval)
    }
  }, [aToken])

  // Extract all categories dynamically from orders
  const allCategories = useMemo(() => {
    const fromOrders = orders.flatMap(order =>
      (order.items || []).map(it => it.category).filter(Boolean)
    )
    return ['All', ...Array.from(new Set([...standardCategories, ...fromOrders]))]
  }, [orders])

  // Filtered Orders Calculation
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const query = searchQuery.trim().toLowerCase().replace(/^#/, '')

      // 1. Search Query
      const matchesSearch =
        !query ||
        order._id?.toLowerCase().includes(query) ||
        order.userData?.name?.toLowerCase().includes(query) ||
        (order.userData?.email && order.userData.email.toLowerCase().includes(query)) ||
        order.address?.firstName?.toLowerCase().includes(query) ||
        order.address?.lastName?.toLowerCase().includes(query) ||
        order.address?.name?.toLowerCase().includes(query) ||
        (order.address?.email && order.address.email.toLowerCase().includes(query)) ||
        (order.address?.phone && String(order.address.phone).includes(query)) ||
        (order.address?.city && order.address.city.toLowerCase().includes(query)) ||
        (order.address?.state && order.address.state.toLowerCase().includes(query)) ||
        (order.items &&
          order.items.some(
            it =>
              (it.title && it.title.toLowerCase().includes(query)) ||
              (it.name && it.name.toLowerCase().includes(query)) ||
              (it.category && it.category.toLowerCase().includes(query))
          ))

      // 2. Category Filter
      const matchesCategory =
        selectedCategory === 'All' ||
        (order.items &&
          order.items.some(it => {
            const cat = it.category || ''
            return (
              cat.toLowerCase() === selectedCategory.toLowerCase() ||
              cat.toLowerCase().includes(selectedCategory.toLowerCase()) ||
              selectedCategory.toLowerCase().includes(cat.toLowerCase())
            )
          }))

      // 3. Status Filter
      const matchesStatus =
        selectedStatus === 'All' ||
        order.status?.toLowerCase() === selectedStatus.toLowerCase()

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [orders, searchQuery, selectedCategory, selectedStatus])

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedCategory !== 'All' || selectedStatus !== 'All'

  // Pagination Calculations
  const totalItems = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedOrders = filteredOrders.slice(startIndex, endIndex)

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedStatus('All')
  }

  const getStatusBadge = (status) => {
    const found = deliveryStatuses.find(s => s.label.toLowerCase() === (status || '').toLowerCase())
    if (found) {
      return (
        <span className={`text-xs font-black px-3 py-1 rounded-full border ${found.color} flex items-center gap-1.5 shadow-2xs`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${found.dotColor}`} />
          <span>{found.label}</span>
        </span>
      )
    }
    return (
      <span className='text-xs font-black px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200'>
        {status || 'Order Placed'}
      </span>
    )
  }

  const getStepIndex = (status) => {
    if (status === 'Packing & Preparing') return 1
    if (status === 'Shipped') return 2
    if (status === 'Out for Delivery') return 2.5
    if (status === 'Delivered') return 3
    if (status === 'Cancelled') return -1
    return 0
  }

  return (
    <div className='space-y-6 w-full max-w-[1600px] mx-auto'>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-3">
        <div>
          <h1 className='text-2xl sm:text-3xl font-black text-gray-900 tracking-tight'>Book & Library Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Manage customer book orders, dispatch lifecycle, format quantities, and delivery progress
          </p>
        </div>
        <div className='flex items-center gap-3 self-start sm:self-auto'>
          {orders.length > 0 && (
            <button
              onClick={handleClearOrders}
              className='text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-full transition-colors cursor-pointer flex items-center gap-1.5'
            >
              <img className='w-4 h-4 object-contain' src={assets.delete_icon} alt="" />
              <span>Clear All Orders</span>
            </button>
          )}
          <span className="text-xs sm:text-sm font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-full shadow-2xs">
            Total Orders: {filteredOrders.length} / {orders.length}
          </span>
        </div>
      </div>

      {/* Search & Category Filter Controls Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 relative z-30">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar with Typewriter Animation */}
          <div className="flex-1 min-w-[280px]">
            <TypewriterSearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholders={orderSearchPlaceholders}
            />
          </div>

          {/* Filter Popovers Group */}
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
                    ? orders.length
                    : orders.filter((o) =>
                        (o.items || []).some((it) =>
                          (it.category || '').toLowerCase().includes(cat.toLowerCase())
                        )
                      ).length,
              }))}
              minWidth="min-w-[170px]"
            />

            {/* Status Dropdown */}
            <CustomDropdown
              value={selectedStatus}
              onChange={setSelectedStatus}
              labelPrefix="Status:"
              options={['All', ...deliveryStatuses.map((s) => s.label)].map((st) => ({
                value: st,
                label: st === 'All' ? 'All Status' : st,
                count:
                  st === 'All'
                    ? orders.length
                    : orders.filter((o) => (o.status || '').toLowerCase() === st.toLowerCase()).length,
              }))}
              minWidth="min-w-[150px]"
            />

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span>✕</span>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-gray-400 font-bold">Active Filters:</span>
            {searchQuery && (
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-extrabold flex items-center gap-1.5">
                <span>Query: "{searchQuery}"</span>
                <span onClick={() => setSearchQuery('')} className="cursor-pointer hover:text-purple-900 font-black">✕</span>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-extrabold flex items-center gap-1.5">
                <span>Category: {selectedCategory}</span>
                <span onClick={() => setSelectedCategory('All')} className="cursor-pointer hover:text-purple-900 font-black">✕</span>
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-extrabold flex items-center gap-1.5">
                <span>Status: {selectedStatus}</span>
                <span onClick={() => setSelectedStatus('All')} className="cursor-pointer hover:text-purple-900 font-black">✕</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Orders Content */}
      {loading ? (
        <div className='min-h-[40vh] flex flex-col items-center justify-center gap-3 p-8'>
          <div className='w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin' />
          <p className='text-xs sm:text-sm text-gray-500 font-semibold'>Loading library orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className='bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-xs'>
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flexCenter mx-auto text-3xl">
            📦
          </div>
          <h3 className="text-xl font-bold text-gray-800">No Orders Received Yet</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            Customer book orders placed via the frontend store will appear here for processing.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className='bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-xs'>
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flexCenter mx-auto text-3xl">
            🔍
          </div>
          <h3 className="text-xl font-bold text-gray-800">No Matching Orders Found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            No orders match your search query or selected category/status filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2 px-5 rounded-full shadow-sm transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className='space-y-6 pb-6'>
          {displayedOrders.map((order, index) => {
            const stepIdx = getStepIndex(order.status)
            const isCancelled = order.status === 'Cancelled'
            const activeTab = activeMobileTabs[order._id] || 'books'

            return (
              <div
                key={order._id || index}
                className='relative w-full bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 sm:space-y-6'
              >
                {/* 1. Improved Top Order Header Area */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Clean Order ID Pill with Click to Copy */}
                    <button
                      type="button"
                      onClick={() => copyOrderId(order._id)}
                      title="Click to copy Order ID"
                      className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all group shadow-2xs"
                    >
                      <span className="text-xs font-black text-purple-700">#</span>
                      <span className="text-xs font-mono font-black text-gray-900 tracking-tight">
                        {order._id}
                      </span>
                      <svg
                        className="w-3.5 h-3.5 text-black shrink-0 transition-transform group-hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>

                    {/* Order Date & Time Stamp */}
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <span>📅</span>
                      <span>
                        {new Date(order.date || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>
                        {new Date(order.date || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Modern Compact Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(order.status)}
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border ${
                        order.payment
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {order.payment ? '✓ Paid' : '⏳ Payment Pending'}
                    </span>
                  </div>
                </div>

                {/* 2. Cleaner 2-Column Layout (Desktop & Tablet: >= sm) */}
                <div className='hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
                  
                  {/* LEFT SIDE (Approx 67% Width: Books List + Shipping Address) */}
                  <div className='lg:col-span-8 space-y-5'>
                    
                    {/* Section 1: Purchased Books List */}
                    <div className='bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs'>
                      <div className='flex items-center justify-between border-b border-slate-200/60 pb-3'>
                        <div className='flex items-center gap-2'>
                          <span className="text-base">📚</span>
                          <h4 className='text-xs sm:text-sm font-black uppercase tracking-wider text-purple-900'>
                            Purchased Books ({order.items?.length || 0})
                          </h4>
                        </div>
                        <span className='text-xs font-extrabold text-purple-700 bg-purple-100/70 border border-purple-200 px-3 py-1 rounded-xl shadow-2xs'>
                          {order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0)} Total Copies
                        </span>
                      </div>

                      {/* Structured Book Items */}
                      <div className='space-y-3'>
                        {order.items &&
                          order.items.map((item, idx) => {
                            const imgUrl = getItemImage(item)
                            const unitPrice = item.price || 0
                            const qty = item.quantity || 1
                            const itemTotal = unitPrice * qty

                            return (
                              <div
                                key={idx}
                                className='bg-white border border-slate-200/80 hover:border-purple-200 rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4 shadow-2xs hover:shadow-xs'
                              >
                                {/* Larger, Properly Sized Book Cover Thumbnail */}
                                <div className='w-20 h-28 sm:w-22 sm:h-30 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs bg-slate-100'>
                                  <img
                                    src={imgUrl}
                                    alt={item.title || item.name || 'Book'}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null
                                      e.currentTarget.src = defaultBookImg
                                    }}
                                    className='w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300'
                                  />
                                </div>

                                {/* Book Details */}
                                <div className='flex-1 min-w-0 space-y-2'>
                                  <h5 className='font-black text-gray-900 text-sm sm:text-base leading-snug break-words'>
                                    {item.title || item.name || 'Therapy Book'}
                                  </h5>

                                  {/* Format & Category Badges */}
                                  <div className='flex flex-wrap items-center gap-2'>
                                    {item.category && (
                                      <span className='text-[10px] sm:text-xs font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md'>
                                        {item.category}
                                      </span>
                                    )}
                                    <span className='text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md'>
                                      {item.size || item.format || 'Standard Paperback'}
                                    </span>
                                  </div>

                                  {/* Unit Price Breakdown */}
                                  <p className='text-xs font-semibold text-gray-500'>
                                    Price: <span className='text-gray-900 font-bold'>{currency} {unitPrice}</span> each
                                  </p>
                                </div>

                                {/* Quantity & Total Item Amount */}
                                <div className='flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-2 shrink-0'>
                                  <span className='font-black text-purple-800 bg-purple-100/90 px-3 py-1.5 rounded-xl text-xs sm:text-sm border border-purple-200 shadow-2xs'>
                                    x{qty}
                                  </span>
                                  <span className='text-sm sm:text-base font-black text-gray-900'>
                                    {currency} {itemTotal}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>

                    {/* Section 2: Clean Balanced Shipping Address Card */}
                    <div className='bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-3.5 shadow-2xs'>
                      <div className='flex items-center gap-2 border-b border-slate-200/60 pb-3'>
                        <span className="text-base">📍</span>
                        <h4 className='text-xs sm:text-sm font-black uppercase tracking-wider text-purple-900'>
                          Shipping Destination & Customer Contact
                        </h4>
                      </div>

                      <div className='bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3'>
                        {/* Customer Name & Profile Pic */}
                        {(() => {
                          const customerName =
                            order.userData?.name ||
                            (order.address?.firstName
                              ? `${order.address.firstName} ${order.address.lastName || ''}`.trim()
                              : '') ||
                            order.address?.name ||
                            'Customer'
                          
                          const customerEmail =
                            order.userData?.email ||
                            order.address?.email ||
                            (typeof order.userId === 'object' ? order.userId?.email : '') ||
                            'rishabn090@gmail.com'

                          const customerPhone =
                            order.userData?.phone ||
                            order.address?.phone ||
                            order.phone ||
                            (typeof order.userId === 'object' ? order.userId?.phone : '') ||
                            '8130758753'

                          const userProfileImg = order.userData?.image
                          const initialChar = (customerName || 'C')[0].toUpperCase()

                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {/* Customer Profile Picture (Live from userModel) */}
                                  {userProfileImg ? (
                                    <img
                                      src={userProfileImg}
                                      alt={customerName}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        const fallback = e.currentTarget.nextElementSibling
                                        if (fallback) fallback.style.display = 'flex'
                                      }}
                                      className="w-11 h-11 rounded-full object-cover border-2 border-purple-200 shadow-2xs shrink-0"
                                    />
                                  ) : null}
                                  <div
                                    style={{ display: userProfileImg ? 'none' : 'flex' }}
                                    className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-black text-sm items-center justify-center border-2 border-purple-200 shrink-0 shadow-2xs"
                                  >
                                    {initialChar}
                                  </div>

                                  <div>
                                    <p className='font-black text-gray-900 text-sm sm:text-base leading-tight'>
                                      Customer ({customerName})
                                    </p>
                                    <span className="text-[10px] font-bold text-gray-400">Verified Recipient</span>
                                  </div>
                                </div>
                              </div>

                              {/* Full Address */}
                              <div className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed pl-1">
                                <p className="font-semibold text-gray-900">
                                  {order.address?.line1 || order.address?.street || ''} {order.address?.line2 || ''}
                                </p>
                                <p className="text-gray-600">
                                  {order.address?.city || ''}, {order.address?.state || ''}{' '}
                                  {order.address?.zipcode || order.address?.pincode
                                    ? `- ${order.address?.zipcode || order.address?.pincode}`
                                    : ''}
                                </p>
                              </div>

                              {/* Contact Strip */}
                              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs font-bold'>
                                <div className='text-purple-700 bg-purple-50/70 border border-purple-100 p-2 rounded-lg flex items-center gap-2 truncate'>
                                  <span>✉️</span>
                                  <span className="truncate">
                                    {customerEmail}
                                  </span>
                                </div>
                                <div className='text-purple-700 bg-purple-50/70 border border-purple-100 p-2 rounded-lg flex items-center gap-2'>
                                  <span>📞</span>
                                  <span>
                                    {customerPhone}
                                  </span>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                  </div>

                  {/* RIGHT SIDE (Approx 33% Width: Clean Sticky Order Summary & Progress Panel) */}
                  <div className='lg:col-span-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-5 shadow-2xs lg:sticky lg:top-4'>
                    
                    {/* 1. Order Summary Sub-Panel */}
                    <div className='space-y-3.5'>
                      <div className='flex items-center justify-between border-b border-slate-200/60 pb-3'>
                        <div className='flex items-center gap-2'>
                          <span className="text-base">🧾</span>
                          <h4 className='text-xs font-black uppercase tracking-wider text-purple-900'>
                            Order Summary
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-gray-400">
                          #{order._id.slice(-6)}
                        </span>
                      </div>

                      <div className='bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3'>
                        <div>
                          <span className='text-[10px] font-black text-gray-400 uppercase tracking-wider block'>
                            Total Amount
                          </span>
                          <span className='text-2xl sm:text-3xl font-black text-gray-900 tracking-tight'>
                            {currency} {order.amount}
                          </span>
                        </div>

                        <div className='space-y-2 pt-2 border-t border-slate-100 text-xs'>
                          <div className='flex items-center justify-between'>
                            <span className='text-gray-500 font-semibold'>Payment Method:</span>
                            <span className='font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200 uppercase text-[11px]'>
                              {order.paymentMethod || 'Online'}
                            </span>
                          </div>

                          <div className='flex items-center justify-between'>
                            <span className='text-gray-500 font-semibold'>Payment Status:</span>
                            <span
                              className={`font-black text-[11px] px-2.5 py-0.5 rounded-lg border ${
                                order.payment
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {order.payment ? '✓ Paid' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Visually Attractive Horizontal Order Progress Tracker */}
                    <div className='space-y-3 pt-2 border-t border-slate-200/60'>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5'>
                          <span className='animate-pulse text-amber-500'>⚡</span> Delivery Lifecycle
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {order.status === 'Delivered' ? '● Completed' : isCancelled ? '● Cancelled' : '● Live'}
                        </span>
                      </div>

                      <div className='bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3.5'>
                        {/* Horizontal Stepper */}
                        {!isCancelled ? (
                          <div className="relative pt-1 pb-1">
                            <div className="flex items-center justify-between relative z-10">
                              {progressSteps.map((step, idx) => {
                                const isDone = stepIdx > idx
                                const isCurrent = stepIdx === idx || (stepIdx === 2.5 && idx === 2)
                                return (
                                  <div key={step.key} className="flex flex-col items-center gap-1.5">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-2xs ${
                                        isDone
                                          ? 'bg-emerald-500 text-white'
                                          : isCurrent
                                          ? 'bg-purple-600 text-white ring-4 ring-purple-100 animate-pulse'
                                          : 'bg-slate-100 text-gray-400 border border-slate-200'
                                      }`}
                                    >
                                      {isDone ? '✓' : idx + 1}
                                    </div>
                                    <span
                                      className={`text-[10px] tracking-tight font-extrabold ${
                                        isDone
                                          ? 'text-emerald-700'
                                          : isCurrent
                                          ? 'text-purple-700 font-black'
                                          : 'text-gray-400'
                                      }`}
                                    >
                                      {step.short}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Connecting Line Track */}
                            <div className="absolute top-4.5 left-4 right-4 h-0.5 bg-slate-200 -z-0">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{
                                  width:
                                    stepIdx === 3
                                      ? '100%'
                                      : stepIdx === 2.5
                                      ? '75%'
                                      : stepIdx === 2
                                      ? '66%'
                                      : stepIdx === 1
                                      ? '33%'
                                      : '5%'
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                            <p className="text-xs font-bold text-rose-700">Order cancelled by customer or admin</p>
                          </div>
                        )}

                        {/* Current Status Highlight Banner */}
                        <div className='bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs'>
                          <span className='font-black text-gray-800 flex items-center gap-1.5'>
                            <span>{getStatusBadge(order.status)}</span>
                          </span>
                          <span className='text-[10px] font-semibold text-gray-400'>
                            {order.status === 'Order Placed' && 'Awaiting packaging'}
                            {order.status === 'Packing & Preparing' && 'Packing at warehouse'}
                            {order.status === 'Shipped' && 'In transit with courier'}
                            {order.status === 'Out for Delivery' && 'Out for delivery today'}
                            {order.status === 'Delivered' && 'Delivered successfully'}
                            {order.status === 'Cancelled' && 'Order cancelled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Useful Order Actions (Context-Aware Admin Controls) */}
                    <div className='space-y-2 pt-2 border-t border-slate-200/60'>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs font-black text-purple-900 uppercase tracking-wider'>
                          Admin Actions
                        </span>
                        <span className='text-[10px] font-bold text-gray-400'>Lifecycle Management</span>
                      </div>

                      {order.status !== 'Delivered' && !isCancelled ? (
                        <div className='space-y-2'>
                          {/* When Order Placed */}
                          {order.status === 'Order Placed' && (
                            <>
                              <button
                                type='button'
                                disabled={updatingOrderId === order._id}
                                onClick={() => handleUpdateStatus(order._id, 'Packing & Preparing')}
                                className='w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center cursor-pointer'
                              >
                                <span>{updatingOrderId === order._id ? 'Updating...' : 'Mark as Packed'}</span>
                              </button>
                              <button
                                type='button'
                                disabled={updatingOrderId === order._id}
                                onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                                className='w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-black py-2 px-3 rounded-xl transition-all flex items-center justify-center cursor-pointer'
                              >
                                <span>Mark as Shipped</span>
                              </button>
                            </>
                          )}

                          {/* When Packing & Preparing */}
                          {order.status === 'Packing & Preparing' && (
                            <button
                              type='button'
                              disabled={updatingOrderId === order._id}
                              onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                              className='w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center cursor-pointer'
                            >
                              <span>{updatingOrderId === order._id ? 'Updating...' : 'Mark as Shipped'}</span>
                            </button>
                          )}

                          {/* When Shipped */}
                          {order.status === 'Shipped' && (
                            <>
                              <button
                                type='button'
                                disabled={updatingOrderId === order._id}
                                onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                                className='w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center cursor-pointer'
                              >
                                <span>{updatingOrderId === order._id ? 'Updating...' : 'Mark Out for Delivery'}</span>
                              </button>
                              <button
                                type='button'
                                disabled={updatingOrderId === order._id}
                                onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                className='w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-black py-2 px-3 rounded-xl transition-all flex items-center justify-center cursor-pointer'
                              >
                                <span>Mark as Delivered</span>
                              </button>
                            </>
                          )}

                          {/* When Out for Delivery */}
                          {order.status === 'Out for Delivery' && (
                            <button
                              type='button'
                              disabled={updatingOrderId === order._id}
                              onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                              className='w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-center cursor-pointer'
                            >
                              <span>{updatingOrderId === order._id ? 'Updating...' : 'Mark as Delivered'}</span>
                            </button>
                          )}
                        </div>
                      ) : order.status === 'Delivered' ? (
                        <div className='p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-black text-emerald-700 flex items-center justify-center'>
                          <span>Order Completed & Fulfilled</span>
                        </div>
                      ) : (
                        <div className='p-3 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs font-black text-rose-700 flex items-center justify-center'>
                          <span>Order Cancelled</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

                {/* 3. Mobile Tabbed Order Layout (sm:hidden) */}
                <div className='sm:hidden space-y-3 pt-1'>
                  {/* Quick Summary Bar */}
                  <div className='flex items-center justify-between bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs'>
                    <div className='flex items-center gap-1.5 font-bold text-gray-600'>
                      <span className='text-[10px] uppercase tracking-wider font-extrabold text-purple-900'>Total:</span>
                      <span className='text-sm font-black text-gray-900 tracking-tight'>{currency} {order.amount}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-[10px] font-black text-purple-700 bg-purple-100/80 border border-purple-200 px-2 py-0.5 rounded-lg uppercase'>
                        {order.paymentMethod || 'Online'}
                      </span>
                      <span className='text-[11px] font-black text-gray-500'>
                        {order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0)} {order.items?.length === 1 ? 'copy' : 'copies'}
                      </span>
                    </div>
                  </div>

                  {/* Segmented Sub-Tab Switcher */}
                  <div className='flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1 shadow-2xs'>
                    <button
                      type='button'
                      onClick={() => setOrderTab(order._id, 'books')}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'books'
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <span>📚</span>
                      <span>Books ({order.items?.length || 0})</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => setOrderTab(order._id, 'shipping')}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'shipping'
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <span>📍</span>
                      <span>Shipping</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => setOrderTab(order._id, 'actions')}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'actions'
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <span>⚡</span>
                      <span>Actions</span>
                    </button>
                  </div>

                  {/* Sub-Tab 1: Purchased Books */}
                  {activeTab === 'books' && (
                    <div className='space-y-2.5 max-h-[260px] overflow-y-auto pr-0.5'>
                      {order.items &&
                        order.items.map((item, idx) => {
                          const imgUrl = getItemImage(item)
                          const unitPrice = item.price || 0
                          const qty = item.quantity || 1
                          const itemTotal = unitPrice * qty

                          return (
                            <div
                              key={idx}
                              className='bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 shadow-2xs'
                            >
                              <div className='w-14 h-18 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100'>
                                <img
                                  src={imgUrl}
                                  alt={item.title || item.name || 'Book'}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = defaultBookImg
                                  }}
                                  className='w-full h-full object-cover object-center'
                                />
                              </div>
                              <div className='flex-1 min-w-0 space-y-1'>
                                <h5 className='font-black text-gray-900 text-xs leading-snug line-clamp-2'>
                                  {item.title || item.name || 'Therapy Book'}
                                </h5>
                                <div className='flex flex-wrap items-center gap-1.5'>
                                  {item.category && (
                                    <span className='text-[9px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded'>
                                      {item.category}
                                    </span>
                                  )}
                                  <span className='text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded'>
                                    {item.size || item.format || 'Paperback'}
                                  </span>
                                </div>
                                <p className='text-[11px] font-semibold text-gray-500'>
                                  Price: <span className='font-bold text-gray-800'>{currency} {unitPrice}</span> each
                                </p>
                              </div>
                              <div className='flex flex-col items-end shrink-0 gap-1'>
                                <span className='font-black text-purple-800 bg-purple-100/90 px-2 py-0.5 rounded-md text-[11px] border border-purple-200'>
                                  x{qty}
                                </span>
                                <span className='text-xs font-black text-gray-900'>
                                  {currency} {itemTotal}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}

                  {/* Sub-Tab 2: Shipping Destination & Customer Contact */}
                  {activeTab === 'shipping' && (() => {
                    const customerName =
                      order.userData?.name ||
                      (order.address?.firstName
                        ? `${order.address.firstName} ${order.address.lastName || ''}`.trim()
                        : '') ||
                      order.address?.name ||
                      'Customer'

                    const customerEmail =
                      order.userData?.email ||
                      order.address?.email ||
                      (typeof order.userId === 'object' ? order.userId?.email : '') ||
                      'rishabn090@gmail.com'

                    const customerPhone =
                      order.userData?.phone ||
                      order.address?.phone ||
                      order.phone ||
                      (typeof order.userId === 'object' ? order.userId?.phone : '') ||
                      '8130758753'

                    const userProfileImg = order.userData?.image
                    const initialChar = (customerName || 'C')[0].toUpperCase()

                    return (
                      <div className='bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-3 shadow-2xs max-h-[260px] overflow-y-auto'>
                        {/* Customer Header */}
                        <div className='flex items-center gap-3'>
                          {userProfileImg ? (
                            <img
                              src={userProfileImg}
                              alt={customerName}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.nextElementSibling
                                if (fallback) fallback.style.display = 'flex'
                              }}
                              className='w-10 h-10 rounded-full object-cover border-2 border-purple-200 shrink-0'
                            />
                          ) : null}
                          <div
                            style={{ display: userProfileImg ? 'none' : 'flex' }}
                            className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-black text-xs items-center justify-center border-2 border-purple-200 shrink-0'
                          >
                            {initialChar}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-black text-gray-900 text-xs sm:text-sm truncate'>
                              {customerName}
                            </p>
                            <span className='text-[10px] font-semibold text-purple-700 block truncate'>
                              {customerEmail}
                            </span>
                          </div>
                        </div>

                        {/* Full Delivery Address */}
                        <div className='bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs space-y-1'>
                          <span className='text-[10px] font-black uppercase text-purple-800 tracking-wider block'>
                            📍 Delivery Address:
                          </span>
                          <p className='font-bold text-gray-800 leading-snug'>
                            {order.address?.line1 || order.address?.street || ''} {order.address?.line2 || ''}
                          </p>
                          <p className='text-gray-600 font-medium'>
                            {order.address?.city || ''}, {order.address?.state || ''}{' '}
                            {order.address?.zipcode || order.address?.pincode
                              ? `- ${order.address?.zipcode || order.address?.pincode}`
                              : ''}
                          </p>
                        </div>

                        {/* Call Customer Button */}
                        <a
                          href={`tel:${customerPhone}`}
                          className='inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-black transition w-full justify-center'
                        >
                          <span>📞 Call Customer:</span>
                          <span>{customerPhone}</span>
                        </a>
                      </div>
                    )
                  })()}

                  {/* Sub-Tab 3: Actions & Lifecycle */}
                  {activeTab === 'actions' && (
                    <div className='bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-3 shadow-2xs max-h-[260px] overflow-y-auto'>
                      {/* Lifecycle Tracker */}
                      {!isCancelled ? (
                        <div className='bg-white p-3 rounded-lg border border-slate-200/80 space-y-2'>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1'>
                              <span className='animate-pulse text-amber-500'>⚡</span> Lifecycle
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {order.status === 'Delivered' ? '● Fulfilled' : '● Live'}
                            </span>
                          </div>

                          <div className='relative pt-1 pb-1'>
                            <div className='flex items-center justify-between relative z-10'>
                              {progressSteps.map((step, idx) => {
                                const isDone = stepIdx > idx
                                const isCurrent = stepIdx === idx || (stepIdx === 2.5 && idx === 2)
                                return (
                                  <div key={step.key} className='flex flex-col items-center gap-0.5'>
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-2xs ${
                                        isDone
                                          ? 'bg-emerald-500 text-white'
                                          : isCurrent
                                          ? 'bg-purple-600 text-white ring-2 ring-purple-100 animate-pulse'
                                          : 'bg-slate-100 text-gray-400 border border-slate-200'
                                      }`}
                                    >
                                      {isDone ? '✓' : idx + 1}
                                    </div>
                                    <span
                                      className={`text-[8px] font-extrabold ${
                                        isDone
                                          ? 'text-emerald-700'
                                          : isCurrent
                                          ? 'text-purple-700 font-black'
                                          : 'text-gray-400'
                                      }`}
                                    >
                                      {step.short}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                            <div className='absolute top-3 left-2 right-2 h-0.5 bg-slate-200 -z-0'>
                              <div
                                className='h-full bg-emerald-500 transition-all duration-500'
                                style={{
                                  width:
                                    stepIdx === 3
                                      ? '100%'
                                      : stepIdx === 2.5
                                      ? '75%'
                                      : stepIdx === 2
                                      ? '66%'
                                      : stepIdx === 1
                                      ? '33%'
                                      : '5%'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-center'>
                          <p className='text-xs font-bold text-rose-700'>Order cancelled</p>
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className='space-y-1.5'>
                        {order.status !== 'Delivered' && !isCancelled ? (
                          <>
                            {order.status === 'Order Placed' && (
                              <>
                                <button
                                  type='button'
                                  disabled={updatingOrderId === order._id}
                                  onClick={() => handleUpdateStatus(order._id, 'Packing & Preparing')}
                                  className='w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2 px-3 rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer'
                                >
                                  <span>{updatingOrderId === order._id ? 'Updating...' : 'Mark as Packed'}</span>
                                </button>
                                <button
                                  type='button'
                                  disabled={updatingOrderId === order._id}
                                  onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                                  className='w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-black py-1.5 px-3 rounded-xl transition flex items-center justify-center cursor-pointer'
                                >
                                  <span>Mark as Shipped</span>
                                </button>
                              </>
                            )}

                            {order.status === 'Packing & Preparing' && (
                              <button
                                type='button'
                                disabled={updatingOrderId === order._id}
                                onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                                className='w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2 px-3 rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer'
                              >
                                <span>{updatingOrderId === order._id ? 'Updating...' : 'Mark as Shipped'}</span>
                              </button>
                            )}

                            {order.status === 'Shipped' && (
                              <>
                                <button
                                  type='button'
                                  disabled={updatingOrderId === order._id}
                                  onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                                  className='w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2 px-3 rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer'
                                >
                                  <span>{updatingOrderId === order._id ? 'Updating...' : 'Mark Out for Delivery'}</span>
                                </button>
                                <button
                                  type='button'
                                  disabled={updatingOrderId === order._id}
                                  onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                  className='w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-black py-1.5 px-3 rounded-xl transition flex items-center justify-center cursor-pointer'
                                >
                                  <span>Mark as Delivered</span>
                                </button>
                              </>
                            )}

                            {order.status === 'Out for Delivery' && (
                              <button
                                type='button'
                                disabled={updatingOrderId === order._id}
                                onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                className='w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 px-3 rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer'
                              >
                                <span>{updatingOrderId === order._id ? 'Updating...' : 'Mark as Delivered'}</span>
                              </button>
                            )}
                          </>
                        ) : order.status === 'Delivered' ? (
                          <div className='p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-black text-emerald-700 flex items-center justify-center'>
                            <span>✓ Order Completed & Fulfilled</span>
                          </div>
                        ) : (
                          <div className='p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs font-black text-rose-700 flex items-center justify-center'>
                            <span>Order Cancelled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Pagination Controls */}
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
            rowsOptions={[5, 10, 20, 50]}
            itemLabel="orders"
            className="rounded-2xl border shadow-xs"
          />
        </div>
      )}
    </div>
  )
}

export default BookOrders
