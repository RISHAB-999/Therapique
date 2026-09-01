import React, { useEffect, useContext, useState, useMemo, useRef } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import AppointmentDetailsModal from '../../components/AppointmentDetailsModal'
import CustomDropdown from '../../components/ui/CustomDropdown'
import SearchInput from '../../components/ui/SearchInput'
import DateInput from '../../components/ui/DateInput'
import PaginationControls from '../../components/ui/PaginationControls'
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  MoreVertical, 
  Eye, 
  Printer, 
  Copy, 
  ChevronLeft, 
  ChevronRight,
  Coins,
  CreditCard,
  Ban,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  X
} from 'lucide-react'
import { toast } from 'react-toastify'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  // Default avatars
  const defaultUserImg = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop"
  const defaultDocImg = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop"

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Action Menu State
  const [openActionId, setOpenActionId] = useState(null)
  const actionMenuRef = useRef(null)

  // Modal State
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Real-time synchronization & focus listener
  useEffect(() => {
    if (aToken) {
      getAllAppointments()
      const interval = setInterval(() => {
        getAllAppointments()
      }, 3000)

      const handleFocus = () => getAllAppointments()
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          getAllAppointments()
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

  // Close action dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, doctorFilter, statusFilter, dateFilter, itemsPerPage])

  // 1. Dynamic Summary Statistics Calculations
  const stats = useMemo(() => {
    const total = appointments.length
    const completed = appointments.filter(a => a.isCompleted && !a.cancelled).length
    const cancelled = appointments.filter(a => a.cancelled).length
    const upcoming = appointments.filter(a => !a.cancelled && !a.isCompleted).length

    return {
      total,
      upcoming,
      completed,
      cancelled,
      completedRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancelledRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
    }
  }, [appointments])

  // 2. Doctor Options List (dynamically extracted from real appointment data)
  const doctorOptions = useMemo(() => {
    const list = [...new Set(appointments.map(a => a.docData?.name).filter(Boolean))]
    return list.sort()
  }, [appointments])

  // 3. Dynamic Filter Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      // Search query filter (matches patient name, doctor name, email, phone, or appointment ID)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const patientName = item.userData?.name?.toLowerCase() || ''
        const doctorName = item.docData?.name?.toLowerCase() || ''
        const patientEmail = item.userData?.email?.toLowerCase() || ''
        const patientPhone = item.userData?.phone?.toLowerCase() || ''
        const appId = item._id?.toLowerCase() || ''

        const matchesSearch = 
          patientName.includes(query) || 
          doctorName.includes(query) || 
          patientEmail.includes(query) || 
          patientPhone.includes(query) ||
          appId.includes(query)

        if (!matchesSearch) return false
      }

      // Doctor filter
      if (doctorFilter !== 'all') {
        if (item.docData?.name !== doctorFilter) return false
      }

      // Status filter
      if (statusFilter === 'upcoming') {
        if (item.cancelled || item.isCompleted) return false
      } else if (statusFilter === 'completed') {
        if (!item.isCompleted || item.cancelled) return false
      } else if (statusFilter === 'cancelled') {
        if (!item.cancelled) return false
      }

      // Date filter (matches selected YYYY-MM-DD to slotDate or date)
      if (dateFilter) {
        const [year, month, day] = dateFilter.split('-')
        const key1 = `${parseInt(day)}_${parseInt(month)}_${year}`
        const key2 = `${parseInt(day)}_${parseInt(month) - 1}_${year}`
        const matchesSlot = item.slotDate === key1 || item.slotDate === key2
        
        let matchesTimestamp = false
        if (item.date) {
          const itemIso = new Date(item.date).toISOString().split('T')[0]
          matchesTimestamp = itemIso === dateFilter
        }

        if (!matchesSlot && !matchesTimestamp) return false
      }

      return true
    })
  }, [appointments, searchTerm, doctorFilter, statusFilter, dateFilter])

  // 4. Pagination Calculations
  const totalItems = filteredAppointments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

  // Check if any filter is active
  const isFiltered = searchTerm !== '' || doctorFilter !== 'all' || statusFilter !== 'all' || dateFilter !== ''

  const handleResetFilters = () => {
    setSearchTerm('')
    setDoctorFilter('all')
    setStatusFilter('all')
    setDateFilter('')
  }

  // Action handlers
  const handleOpenDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
    setOpenActionId(null)
  }

  const handleCancel = async (appointmentId) => {
    setOpenActionId(null)
    await cancelAppointment(appointmentId)
  }

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id)
    toast.success('Appointment ID copied!')
    setOpenActionId(null)
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">All Appointments</h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Manage patient consultations, doctor assignments, fees, and appointment statuses
              </p>
            </div>
          </div>
        </div>

        {/* Live System Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200/60 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System Active
          </span>
        </div>
      </div>

      {/* ================================================== */}
      {/* 1. DYNAMIC APPOINTMENT SUMMARY CARDS */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Appointments */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer ${
            statusFilter === 'all' ? 'border-purple-300 ring-2 ring-purple-100' : 'border-slate-200/80'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
              {stats.total}
            </p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1 truncate">
              Total Appointments
            </p>
          </div>
        </div>

        {/* Card 2: Upcoming / Confirmed Appointments */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'upcoming' ? 'all' : 'upcoming')}
          className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer ${
            statusFilter === 'upcoming' ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200/80'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
                {stats.upcoming}
              </p>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                Active
              </span>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1 truncate">
              Upcoming / Confirmed
            </p>
          </div>
        </div>

        {/* Card 3: Completed Appointments */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer ${
            statusFilter === 'completed' ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200/80'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
                {stats.completed}
              </p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                {stats.completedRate}%
              </span>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1 truncate">
              Completed Sessions
            </p>
          </div>
        </div>

        {/* Card 4: Cancelled Appointments */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')}
          className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-all cursor-pointer ${
            statusFilter === 'cancelled' ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/80'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
                {stats.cancelled}
              </p>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                {stats.cancelledRate}%
              </span>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1 truncate">
              Cancelled Bookings
            </p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. SEARCH AND FILTERS CONTROL BAR */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[260px]">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Search by patient name, doctor, email, ID..."
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Doctor Filter Dropdown */}
            <CustomDropdown
              value={doctorFilter}
              onChange={setDoctorFilter}
              labelPrefix="Doctor:"
              options={[
                { value: 'all', label: 'All Doctors' },
                ...doctorOptions.map((doc) => ({ value: doc, label: `Dr. ${doc}` }))
              ]}
              minWidth="min-w-[160px]"
            />

            {/* Status Filter Dropdown */}
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              labelPrefix="Status:"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'upcoming', label: 'Upcoming / Confirmed', count: stats.upcoming },
                { value: 'completed', label: 'Completed', count: stats.completed },
                { value: 'cancelled', label: 'Cancelled', count: stats.cancelled }
              ]}
              minWidth="min-w-[170px]"
            />

            {/* Date Filter Input */}
            <DateInput
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              onClear={() => setDateFilter('')}
            />

            {/* Reset / Clear All Filters */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-3.5 bg-rose-50 text-rose-600 border border-rose-200/60 rounded-xl text-xs font-bold hover:bg-rose-100/80 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Feedback Sub-bar */}
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-gray-700 font-bold">{totalItems}</strong> of{' '}
            <strong className="text-gray-700 font-bold">{appointments.length}</strong> total bookings
          </span>
          {isFiltered && (
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              Filtered View Active
            </span>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. REDESIGNED MODERN APPOINTMENT TABLE */}
      {/* ================================================== */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 select-none">
                <th className="py-3.5 px-5 w-14 text-center">#</th>
                <th className="py-3.5 px-5">Patient</th>
                <th className="py-3.5 px-5">Date & Time</th>
                <th className="py-3.5 px-5">Doctor</th>
                <th className="py-3.5 px-5">Fees & Method</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right w-24">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {currentAppointments.length > 0 ? (
                currentAppointments.map((item, index) => {
                  const sequentialIndex = startIndex + index + 1
                  const isActionOpen = openActionId === item._id

                  const isCompleted = item.isCompleted && !item.cancelled
                  const isCancelled = item.cancelled
                  const isUpcoming = !item.cancelled && !item.isCompleted

                  return (
                    <tr
                      key={item._id || index}
                      className="hover:bg-slate-50/70 transition-colors duration-150 group"
                    >
                      {/* Column 1: Sequential Index */}
                      <td className="py-4 px-5 text-center font-bold text-gray-400 group-hover:text-gray-700">
                        {sequentialIndex}
                      </td>

                      {/* Column 2: Patient */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.userData?.image || defaultUserImg}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = defaultUserImg
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {item.userData?.name || 'Patient'}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              {item.userData?.email || item.userData?.phone || `Age: ${calculateAge(item.userData?.dob)}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Date & Time */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-bold text-gray-800 text-xs">
                            {slotDateFormat(item.slotDate)}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {item.slotTime}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Doctor */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.docData?.image || defaultDocImg}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0 bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = defaultDocImg
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-xs truncate">
                              Dr. {item.docData?.name || 'Doctor'}
                            </p>
                            <p className="text-[11px] text-purple-600 font-semibold truncate">
                              {item.docData?.speciality || 'Therapist'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 5: Fees & Payment Method */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-black text-gray-900 font-mono text-sm">
                            {currency}{item.amount}
                          </span>
                          {item.paidWithCoins ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Coins className="w-3 h-3 text-amber-500" />
                              Coins
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              <CreditCard className="w-3 h-3 text-slate-500" />
                              Online
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 6: Status Badge */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/70 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Cancelled
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/70 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                            Upcoming
                          </span>
                        )}
                      </td>

                      {/* Column 7: Actions Menu */}
                      <td className="py-4 px-5 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Eye button to view details */}
                          <button
                            onClick={() => handleOpenDetails(item)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Three-dots menu toggle button */}
                          <button
                            onClick={() => setOpenActionId(isActionOpen ? null : item._id)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Floating Action Dropdown Menu */}
                        {isActionOpen && (
                          <div
                            ref={actionMenuRef}
                            className="absolute right-6 top-12 z-30 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 text-left text-xs animate-fadeIn font-semibold"
                          >
                            {/* Option 1: View Details */}
                            <button
                              onClick={() => handleOpenDetails(item)}
                              className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-gray-700 hover:text-purple-700 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-purple-600" />
                              View Details
                            </button>

                            {/* Option 2: View Receipt */}
                            <button
                              onClick={() => {
                                setSelectedAppointment(item)
                                setIsModalOpen(true)
                                setOpenActionId(null)
                              }}
                              className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-gray-700 hover:text-purple-700 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-600" />
                              View Receipt
                            </button>

                            {/* Option 3: Copy ID */}
                            <button
                              onClick={() => handleCopyId(item._id)}
                              className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-gray-700 hover:text-gray-900 transition-colors border-t border-slate-100"
                            >
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                              Copy Booking ID
                            </button>

                            {/* Option 4: Cancel Appointment (only if upcoming) */}
                            {isUpcoming && (
                              <button
                                onClick={() => {
                                  if (window.confirm('Cancel this appointment? This action cannot be undone.')) {
                                    handleCancel(item._id)
                                  }
                                }}
                                className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-bold transition-colors border-t border-slate-100"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Cancel Appointment
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                /* Empty state when no appointments match */
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-inner">
                        <Calendar className="w-7 h-7" />
                      </div>
                      <h4 className="font-extrabold text-base text-gray-800">
                        {isFiltered ? 'No Matching Appointments Found' : 'No Appointments Booked Yet'}
                      </h4>
                      <p className="text-xs text-gray-400 max-w-sm">
                        {isFiltered
                          ? 'No appointments matched your search or filter criteria. Try broadening your filters.'
                          : 'Patient consultation bookings will automatically appear here in real-time.'}
                      </p>
                      {isFiltered && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================================================== */}
        {/* 6. PAGINATION CONTROLS */}
        {/* ================================================== */}
        <PaginationControls
          currentPage={validCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="appointments"
          rowsOptions={[10, 25, 50]}
        />
      </div>

      {/* ================================================== */}
      {/* 5. APPOINTMENT DETAILS & RECEIPT MODAL */}
      {/* ================================================== */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAppointment(null)
        }}
        onCancel={handleCancel}
        currency={currency}
        slotDateFormat={slotDateFormat}
        calculateAge={calculateAge}
      />
    </div>
  )
}

export default AllAppointments
