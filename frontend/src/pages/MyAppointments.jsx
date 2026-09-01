import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import RefundModal from '../components/RefundModal'
import { Calendar, Clock, MapPin, Video, XCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import ReceiptModal from '../components/ReceiptModal'
import PaginationControls from '../components/PaginationControls'

const TokenCoinSVG = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
    <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000" fontFamily="Arial">T</text>
    <circle cx="12" cy="12" r="7" stroke="#FFF8DC" strokeWidth="1" />
  </svg>
)

const MyAppointments = () => {
  const { backendUrl, token, getDoctorData, loadUserProfileData, setUserData } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [cancellingItem, setCancellingItem] = useState(null)
  const [cancellingLoading, setCancellingLoading] = useState(false)
  const [selectedReceiptAppointment, setSelectedReceiptAppointment] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [pendingClaimItem, setPendingClaimItem] = useState(null)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  const totalPages = Math.max(1, Math.ceil(appointments.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedAppointments = appointments.slice(startIndex, startIndex + itemsPerPage)

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Format date (e.g. 20_01_2026 => 20 Jan 2026)
  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const dateArray = slotDate.split('_')
    if (dateArray.length < 3) return slotDate
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`
  }

  // Getting User Appointments Data Using API (with silent background update support)
  const getUserAppointments = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      if (!isSilent) {
        console.log(error)
        toast.error(error.message)
      }
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  // Trigger Cancellation with choice
  const handleCancelClick = (item) => {
    if (item.payment && !item.paidWithCoins) {
      setCancellingItem(item)
      setShowRefundModal(true)
    } else {
      executeCancel(item._id, 'tokens')
    }
  }

  // Function to execute cancel appointment API call
  const executeCancel = async (appointmentId, refundChoice = 'tokens') => {
    try {
      setCancellingLoading(true)
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId, refundChoice },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        setShowRefundModal(false)
        setCancellingItem(null)

        // Real-time instantaneous coin bar update
        if (data.therapiqueCoins !== undefined) {
          setUserData(prev => prev ? { ...prev, therapiqueCoins: data.therapiqueCoins } : prev)
        }

        // Refresh profile & appointments in parallel
        loadUserProfileData()
        getUserAppointments()
        getDoctorData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setCancellingLoading(false)
    }
  }

  // Claim pending refund chosen by patient for cancelled Razorpay session
  const handleClaimPendingRefund = async (appointmentId, refundChoice) => {
    try {
      setCancellingLoading(true)
      const { data } = await axios.post(
        backendUrl + '/api/user/claim-refund',
        { appointmentId, refundChoice },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        setPendingClaimItem(null)
        if (data.therapiqueCoins !== undefined) {
          setUserData(prev => prev ? { ...prev, therapiqueCoins: data.therapiqueCoins } : prev)
        }
        loadUserProfileData()
        getUserAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCancellingLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
      const interval = setInterval(() => {
        getUserAppointments(true)
      }, 3000)

      const handleFocus = () => getUserAppointments(true)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          getUserAppointments(true)
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
  }, [token])

  return (
    <div className='py-4 sm:py-8 max-w-5xl mx-auto px-4 sm:px-6'>
      {/* Header with Signature Brand Serif Typography */}
      <div className='flex items-center justify-between pb-4 mb-6 border-b border-[#EADBCE] gap-3'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2.5 flex-wrap sm:flex-nowrap'>
            <h1 className='font-therapique text-2xl sm:text-3xl text-gray-900 tracking-tight leading-tight'>
              <span className='font-bold'>My</span>{' '}
              <span className='font-normal underline decoration-gray-400 underline-offset-4'>Appointments</span>
            </h1>
            {!loading && appointments.length > 0 && (
              <span className='inline-flex items-center bg-[#F3E8DE] text-[#6b4c3b] border border-[#EADBCE] text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-2xs whitespace-nowrap shrink-0'>
                {appointments.length} {appointments.length === 1 ? 'Booking' : 'Bookings'}
              </span>
            )}
          </div>
          <p className='text-xs sm:text-sm text-gray-600 mt-1 font-medium'>Manage your booked therapy sessions and join video calls</p>
        </div>
      </div>

      <div>
        {loading ? (
          <div className='h-[40vh] flex flex-col items-center justify-center gap-3 text-center'>
            <div className='w-10 h-10 border-4 border-[#81C784] border-t-transparent rounded-full animate-spin' />
            <p className='text-gray-600 font-semibold text-xs'>Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className='min-h-[45vh] flex flex-col items-center justify-center gap-3 text-center p-8 bg-[#FAF5EE] rounded-3xl border border-[#EADBCE]'>
            <div className='w-16 h-16 bg-[#F3E8DE] text-gray-700 rounded-2xl flex items-center justify-center text-3xl shadow-sm'>
              📅
            </div>
            <h2 className='font-therapique text-gray-900 font-bold text-lg mt-2'>No Appointments Booked Yet</h2>
            <p className='text-gray-600 text-xs sm:text-sm max-w-xs font-medium'>Ready to begin? Connect with certified doctors and therapists today.</p>
            <button
              onClick={() => navigate('/doctors')}
              className='bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm transition-all cursor-pointer shadow-md active:scale-95 mt-2'
            >
              Book Consultation Now
            </button>
          </div>
        ) : (
          <div className='space-y-5'>
            {displayedAppointments.map((item, index) => (
              <div
                key={index}
                className='bg-[#FAF5EE] border border-[#EADBCE] rounded-3xl p-5 sm:p-6 md:p-6 lg:p-7 shadow-[0_4px_24px_rgba(70,56,48,0.04)] hover:shadow-[0_8px_32px_rgba(70,56,48,0.07)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6'
              >
                {/* ================= LEFT SECTION — Appointment Information ================= */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 md:gap-6 flex-1 min-w-0'>
                  {/* Therapist Profile Image */}
                  <div className='w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-[#F3E8DE] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EADBCE] shrink-0 flex items-center justify-center shadow-xs mx-auto sm:mx-0 relative'>
                    <img
                      className='w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105'
                      src={item.docData.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop"}
                      alt={item.docData.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop";
                      }}
                    />
                  </div>

                  {/* Therapist Details */}
                  <div className='space-y-2.5 flex-1 min-w-0 text-center sm:text-left'>
                    {/* Name & Specialty Badge */}
                    <div className='flex flex-wrap items-center justify-center sm:justify-start gap-2.5'>
                      <h2 className='font-therapique text-gray-900 text-xl sm:text-2xl font-bold capitalize truncate leading-tight'>
                        {item.docData.name}
                      </h2>
                      <span className='text-xs font-semibold text-[#7C3AED] bg-[#F5F3FF] border border-[#DDD6FE] px-3 py-0.5 rounded-full shrink-0'>
                        {item.docData.speciality}
                      </span>
                    </div>

                    {/* Date & Time Pill Container (Theme Harmonized) */}
                    <div className='inline-flex items-center gap-2.5 text-xs sm:text-sm text-gray-800 font-medium bg-[#FDF7F3] border border-[#EADBCE] px-4 py-1.5 rounded-full shadow-2xs mx-auto sm:mx-0'>
                      <span className='flex items-center gap-1.5 text-gray-700'>
                        <Calendar className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 shrink-0' />
                        <span className='font-semibold'>{slotDateFormat(item.slotDate)}</span>
                      </span>
                      <span className='text-gray-300'>|</span>
                      <span className='flex items-center gap-1.5 text-[#7C3AED] font-bold'>
                        <Clock className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7C3AED] shrink-0' />
                        <span>{item.slotTime}</span>
                      </span>
                    </div>

                    {/* Address with Location Pin */}
                    <div className='flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-600 font-normal pt-0.5'>
                      <MapPin className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                      <span className='truncate max-w-md'>
                        {item.docData.address.line1}, {item.docData.address.line2}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ================= RIGHT SECTION — Dedicated Action Area ================= */}
                <div className='w-full md:w-[280px] lg:w-[310px] shrink-0 flex flex-col items-center justify-center gap-2.5 border-t md:border-t-0 border-[#EADBCE] pt-4 md:pt-0'>
                  {/* 1. Status Badge at Top (Centered) */}
                  {item.paidWithCoins && !item.isCompleted && !item.cancelled && (
                    <div className='w-fit flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 bg-[#FDF0D5] border border-[#F3D59B] px-4 py-1 rounded-full text-center shadow-2xs'>
                      <TokenCoinSVG className="w-4 h-4 shrink-0" />
                      <span>Paid with Tokens</span>
                    </div>
                  )}

                  {item.payment && !item.isCompleted && !item.cancelled && !item.paidWithCoins && (
                    <div className='w-fit flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-1 rounded-full text-center shadow-2xs'>
                      <CheckCircle2 className='w-3.5 h-3.5 text-emerald-600' />
                      <span>Paid Online</span>
                    </div>
                  )}

                  {/* 2. Large Primary "Join Video Call" Button */}
                  {!item.cancelled && !item.isCompleted && (
                    <>
                      <button
                        onClick={() => navigate(`/video-call/${item._id}`)}
                        className='w-full bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] text-white font-bold py-2.5 sm:py-3 px-6 rounded-full text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer'
                      >
                        <Video className='w-4 h-4' />
                        <span>Join Video Call</span>
                      </button>

                      {/* Pay Online button if unpaid */}
                      {!item.payment && !item.paidWithCoins && (
                        <button
                          onClick={() => toast.info('Online payment gateway checkout')}
                          className='w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-2.5 px-6 rounded-full text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer'
                        >
                          <span>Pay Online</span>
                        </button>
                      )}

                      {/* 3. Subtle Horizontal Divider */}
                      <div className='w-full h-px bg-[#EADBCE]/80 my-0.5' />

                      {/* 4. Secondary Actions Row (Receipt & Cancel Buttons - Theme Harmonized) */}
                      <div className='flex items-center gap-2.5 w-full'>
                        {/* Receipt Button */}
                        {(item.payment || item.paidWithCoins) ? (
                          <button
                            onClick={() => {
                              setSelectedReceiptAppointment(item)
                              setShowReceiptModal(true)
                            }}
                            className='flex-1 bg-[#FDF7F3] hover:bg-[#F3E8DE] border border-[#EADBCE] text-gray-800 font-bold py-2 px-3 rounded-full text-xs transition-all flex items-center justify-center cursor-pointer shadow-2xs active:scale-95'
                          >
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <div className='flex-1' />
                        )}

                        {/* Cancel Appointment Button */}
                        <button
                          onClick={() => handleCancelClick(item)}
                          disabled={cancellingLoading}
                          className='flex-1 bg-[#FDF7F3] hover:bg-rose-50 border border-[#EADBCE] hover:border-rose-200 text-rose-600 font-bold py-2 px-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95'
                        >
                          <XCircle className='w-3.5 h-3.5 text-rose-500 shrink-0' />
                          <span className='truncate'>Cancel appointment</span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Completed State Display */}
                  {item.isCompleted && (
                    <div className='flex flex-col items-center gap-2.5 w-full'>
                      <div className='w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold py-2.5 px-6 rounded-full text-xs sm:text-sm text-center shadow-xs flex items-center justify-center gap-1.5'>
                        <CheckCircle2 className='w-4 h-4 text-emerald-600' />
                        <span>Completed</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReceiptAppointment(item)
                          setShowReceiptModal(true)
                        }}
                        className='w-full bg-[#FDF7F3] hover:bg-[#F3E8DE] border border-[#EADBCE] text-gray-800 font-bold py-2 px-6 rounded-full text-xs sm:text-sm transition-all cursor-pointer shadow-2xs flex items-center justify-center active:scale-95'
                      >
                        <span>Receipt</span>
                      </button>
                    </div>
                  )}

                  {/* Cancelled State Display */}
                  {item.cancelled && !item.isCompleted && (
                    <div className='flex flex-col items-center gap-2.5 w-full'>
                      <div className='w-full bg-rose-50 border border-rose-200 text-rose-700 font-bold py-2 px-6 rounded-full text-xs sm:text-sm text-center shadow-xs flex items-center justify-center gap-1.5'>
                        <AlertCircle className='w-4 h-4 text-rose-500' />
                        <span>Appointment Cancelled</span>
                      </div>

                      {/* Action Required: Pending Refund Choice for Online Razorpay Payment */}
                      {item.payment && !item.paidWithCoins && item.refundStatus === 'pending_choice' && (
                        <button
                          onClick={() => setPendingClaimItem(item)}
                          className='w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black py-2.5 px-4 rounded-full text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer animate-pulse active:scale-95'
                        >
                          <span className='text-white font-black tracking-wide'>Choose Refund Method (₹{item.amount})</span>
                        </button>
                      )}

                      {/* Refunded as Tokens Badge */}
                      {item.refundStatus === 'refunded_tokens' && (
                        <div className='w-full text-[11px] text-amber-900 font-extrabold bg-amber-50 py-1.5 px-3 rounded-full border border-amber-200 text-center flex items-center justify-center gap-1.5'>
                          <TokenCoinSVG className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.amount} Tokens Refunded to Wallet</span>
                        </div>
                      )}

                      {/* Refunded to Bank Badge */}
                      {item.refundStatus === 'refunded_bank' && (
                        <div className='w-full text-[11px] text-emerald-900 font-extrabold bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200 text-center flex items-center justify-center gap-1'>
                          <span>₹{item.amount} Refunded to Bank (Razorpay)</span>
                        </div>
                      )}

                      {item.refundedCoins > 0 && item.refundStatus !== 'refunded_tokens' && (
                        <div className='w-full text-[11px] text-amber-900 font-bold bg-[#FDF0D5] py-1 px-3 rounded-full border border-[#F3D59B] text-center flex items-center justify-center gap-1.5'>
                          <TokenCoinSVG className="w-3.5 h-3.5 shrink-0" />
                          <span>+{item.refundedCoins} Tokens Refunded</span>
                        </div>
                      )}
                      {(item.payment || item.paidWithCoins || item.cancelled) && (
                        <button
                          onClick={() => {
                            setSelectedReceiptAppointment(item)
                            setShowReceiptModal(true)
                          }}
                          className='w-full bg-[#FDF7F3] hover:bg-[#F3E8DE] border border-[#EADBCE] text-gray-800 font-bold py-2 px-6 rounded-full text-xs sm:text-sm transition-all cursor-pointer shadow-2xs flex items-center justify-center active:scale-95'
                        >
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={appointments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(pg) => {
                setCurrentPage(pg)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val)
                setCurrentPage(1)
              }}
              rowsOptions={[4, 6, 10, 20]}
              itemLabel="appointments"
              className="mt-6"
            />
          </div>
        )}
      </div>

      {/* Cancellation & Refund Choice Modal */}
      {showRefundModal && cancellingItem && (
        <RefundModal
          isOpen={showRefundModal}
          item={cancellingItem}
          onClose={() => {
            setShowRefundModal(false)
            setCancellingItem(null)
          }}
          onConfirm={(choice) => executeCancel(cancellingItem._id, choice)}
          loading={cancellingLoading}
          amount={cancellingItem.amount}
          coinsRefund={cancellingItem.amount}
        />
      )}

      {/* Pending Refund Choice Claim Modal */}
      {pendingClaimItem && (
        <RefundModal
          isOpen={Boolean(pendingClaimItem)}
          item={pendingClaimItem}
          onClose={() => setPendingClaimItem(null)}
          onConfirm={(choice) => handleClaimPendingRefund(pendingClaimItem._id, choice)}
          loading={cancellingLoading}
          amount={pendingClaimItem.amount}
          coinsRefund={pendingClaimItem.amount}
        />
      )}

      {/* Receipt Printer Modal Popup */}
      {showReceiptModal && selectedReceiptAppointment && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false)
            setSelectedReceiptAppointment(null)
          }}
          data={selectedReceiptAppointment}
          type="appointment"
        />
      )}
    </div>
  )
}

export default MyAppointments