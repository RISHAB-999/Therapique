import React, { useContext, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import CustomDropdown from '../../components/ui/CustomDropdown'
import TypewriterSearchInput from '../../components/TypewriterSearchInput'
import DateInput from '../../components/ui/DateInput'
import PaginationControls from '../../components/ui/PaginationControls'

const doctorAppointmentPlaceholders = [
  'Search by patient name, email, ID...',
  'Search by patient name...',
  'Search by patient email...',
  'Search by appointment ID...',
]
import { 
  CalendarDays, 
  Clock, 
  RotateCcw, 
  Video, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  Coins
} from 'lucide-react'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const navigate = useNavigate()

  const defaultUserImg = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop"

  // Controls State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (dToken) {
      getAppointments()
      const interval = setInterval(() => {
        getAppointments()
      }, 3000)

      const handleFocus = () => getAppointments()
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          getAppointments()
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
  }, [dToken])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, itemsPerPage])

  const handleStartCall = (appointmentId) => {
    navigate(`/doctor-video-call/${appointmentId}`)
  }

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter((item) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const patientName = item.userData?.name?.toLowerCase() || ''
        const patientEmail = item.userData?.email?.toLowerCase() || ''
        const appId = item._id?.toLowerCase() || ''
        if (!patientName.includes(query) && !patientEmail.includes(query) && !appId.includes(query)) {
          return false
        }
      }

      if (statusFilter === 'upcoming') {
        if (item.cancelled || item.isCompleted) return false
      } else if (statusFilter === 'completed') {
        if (!item.isCompleted || item.cancelled) return false
      } else if (statusFilter === 'cancelled') {
        if (!item.cancelled) return false
      }

      if (paymentFilter === 'online') {
        if (!item.payment || item.isCoinsPayment) return false
      } else if (paymentFilter === 'coins') {
        if (!item.isCoinsPayment) return false
      } else if (paymentFilter === 'cash') {
        if (item.payment || item.isCoinsPayment) return false
      }

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
  }, [appointments, searchTerm, statusFilter, paymentFilter, dateFilter])

  // Live Options with Counts
  const statusOptions = useMemo(() => {
    const total = (appointments || []).length
    const upcoming = (appointments || []).filter(a => !a.cancelled && !a.isCompleted).length
    const completed = (appointments || []).filter(a => a.isCompleted && !a.cancelled).length
    const cancelled = (appointments || []).filter(a => a.cancelled).length

    return [
      { value: 'all', label: 'All Statuses', count: total },
      { value: 'upcoming', label: 'Upcoming', count: upcoming },
      { value: 'completed', label: 'Completed', count: completed },
      { value: 'cancelled', label: 'Cancelled', count: cancelled },
    ]
  }, [appointments])

  const paymentOptions = useMemo(() => {
    const total = (appointments || []).length
    const online = (appointments || []).filter(a => a.payment && !a.isCoinsPayment).length
    const coins = (appointments || []).filter(a => a.isCoinsPayment).length
    const cash = (appointments || []).filter(a => !a.payment && !a.isCoinsPayment).length

    return [
      { value: 'all', label: 'All Payments', count: total },
      { value: 'online', label: 'Online Payment', count: online },
      { value: 'coins', label: 'Therapique Coins', count: coins },
      { value: 'cash', label: 'Cash / Clinic', count: cash },
    ]
  }, [appointments])

  // Pagination Calculations
  const totalItems = filteredAppointments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const validCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

  const isFiltered = searchTerm !== '' || statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter !== ''

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setDateFilter('')
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Doctor Consultations</h1>
              <span className="sm:hidden inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Schedule
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5 leading-relaxed">
              Review assigned patient bookings, launch live video sessions, and manage statuses
            </p>
          </div>
        </div>

        {/* Live Schedule Indicator (Desktop / Tablet) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200/60 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Schedule
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-3 relative z-30">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="flex-1 w-full min-w-0">
            <TypewriterSearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholders={doctorAppointmentPlaceholders}
            />
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Status Dropdown */}
            <div className="w-full sm:w-auto">
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                labelPrefix="Status:"
                options={statusOptions}
                className="w-full sm:w-auto"
                minWidth="min-w-full sm:min-w-[170px]"
              />
            </div>

            {/* Payment Type Dropdown */}
            <div className="w-full sm:w-auto">
              <CustomDropdown
                value={paymentFilter}
                onChange={setPaymentFilter}
                labelPrefix="Payment:"
                options={paymentOptions}
                className="w-full sm:w-auto"
                minWidth="min-w-full sm:min-w-[175px]"
              />
            </div>

            {/* Date Input */}
            <div className="w-full sm:w-auto">
              <DateInput
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                onClear={() => setDateFilter('')}
                className="w-full sm:w-auto"
              />
            </div>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 px-3.5 bg-rose-50 text-rose-600 border border-rose-200/60 rounded-xl text-xs font-bold hover:bg-rose-100/80 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer w-full sm:w-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Sub-bar */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-400 font-medium pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-gray-700 font-bold">{totalItems}</strong> of{' '}
            <strong className="text-gray-700 font-bold">{(appointments || []).length}</strong> consultations
          </span>
          {isFiltered && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              Filtered View
            </span>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between relative z-10">
        {/* DESKTOP TABLE VIEW (Visible md and up) */}
        <div className="hidden md:block overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 select-none">
                <th className="py-3.5 px-5 w-14 text-center">#</th>
                <th className="py-3.5 px-5">Patient</th>
                <th className="py-3.5 px-5">Date & Time</th>
                <th className="py-3.5 px-5">Fees & Method</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right w-44">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {currentAppointments.length > 0 ? (
                currentAppointments.map((item, index) => {
                  const sequentialIndex = startIndex + index + 1
                  const isCompleted = item.isCompleted && !item.cancelled
                  const isCancelled = item.cancelled
                  const isUpcoming = !item.cancelled && !item.isCompleted

                  return (
                    <tr
                      key={item._id || index}
                      className="hover:bg-slate-50/70 transition-colors duration-150 group"
                    >
                      {/* 1: Index */}
                      <td className="py-4 px-5 text-center font-bold text-gray-400 group-hover:text-gray-700">
                        {sequentialIndex}
                      </td>

                      {/* 2: Patient */}
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
                              {item.userData?.email || `Age: ${calculateAge(item.userData?.dob)}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 3: Date & Time */}
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

                      {/* 4: Fees & Payment */}
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
                              {item.payment ? 'Online' : 'CASH'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5: Status */}
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

                      {/* 6: Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isUpcoming && (
                            <button
                              onClick={() => handleStartCall(item._id)}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 rounded-xl shadow-2xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
                              title="Join Video Session"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Join
                            </button>
                          )}

                          {isUpcoming && (
                            <>
                              <button
                                onClick={() => cancelAppointment(item._id)}
                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Cancel Appointment"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => completeAppointment(item._id)}
                                className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Complete Appointment"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-inner">
                        <CalendarDays className="w-7 h-7" />
                      </div>
                      <h4 className="font-extrabold text-base text-gray-800">
                        {isFiltered ? 'No Matching Consultations Found' : 'No Consultations Scheduled'}
                      </h4>
                      <p className="text-xs text-gray-400 max-w-sm">
                        {isFiltered
                          ? 'No appointments matched your search or status filter. Try broadening your criteria.'
                          : 'Patient consultation bookings will appear here in real-time.'}
                      </p>
                      {isFiltered && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW (Visible on mobile screens < md) */}
        <div className="md:hidden divide-y divide-slate-100 min-h-[300px]">
          {currentAppointments.length > 0 ? (
            currentAppointments.map((item, index) => {
              const sequentialIndex = startIndex + index + 1
              const isCompleted = item.isCompleted && !item.cancelled
              const isCancelled = item.cancelled
              const isUpcoming = !item.cancelled && !item.isCompleted

              return (
                <div key={item._id || index} className="p-4 bg-white hover:bg-purple-50/20 transition-colors space-y-3">
                  {/* Top Line: Index, Avatar & Patient Info, Status Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">
                        #{sequentialIndex}
                      </span>
                      <img
                        src={item.userData?.image || defaultUserImg}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = defaultUserImg
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {item.userData?.name || 'Patient'}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {item.userData?.email || `Age: ${calculateAge(item.userData?.dob)}`}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Cancelled
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/70 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mid Section: Date & Time + Payment Info */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date & Time</span>
                      <p className="font-bold text-gray-800 mt-0.5 text-xs">{slotDateFormat(item.slotDate)}</p>
                      <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {item.slotTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Fees & Payment</span>
                      <p className="font-black text-gray-900 font-mono text-sm mt-0.5">{currency}{item.amount}</p>
                      <div className="mt-0.5">
                        {item.paidWithCoins ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Coins className="w-3 h-3 text-amber-500" />
                            Coins
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            {item.payment ? 'Online' : 'CASH'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Line: Action Buttons */}
                  {isUpcoming && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleStartCall(item._id)}
                        className="flex-1 h-10 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Join Video Session"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Consultation
                      </button>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="w-10 h-10 rounded-xl border border-rose-200/70 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 active:scale-90 transition-all flex items-center justify-center shadow-2xs cursor-pointer shrink-0"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => completeAppointment(item._id)}
                        className="w-10 h-10 rounded-xl border border-emerald-200/70 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 active:scale-90 transition-all flex items-center justify-center shadow-2xs cursor-pointer shrink-0"
                        title="Complete Appointment"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3 p-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-inner">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-gray-800">
                {isFiltered ? 'No Matching Consultations' : 'No Consultations Scheduled'}
              </h4>
              <p className="text-xs text-gray-400 max-w-xs">
                {isFiltered
                  ? 'No appointments matched your filters.'
                  : 'Patient bookings will appear here in real-time.'}
              </p>
              {isFiltered && (
                <button
                  onClick={handleResetFilters}
                  className="mt-1 py-1.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <PaginationControls
          currentPage={validCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="consultations"
          rowsOptions={[10, 25, 50]}
        />
      </div>
    </div>
  )
}

export default DoctorAppointments
