import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import RefundModal from '../components/RefundModal'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorData, loadUserProfileData } = useContext(AppContext)
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [cancellingItem, setCancellingItem] = useState(null)
  const [cancellingLoading, setCancellingLoading] = useState(false)

  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  // Getting User Appointments Data Using API
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
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
        getUserAppointments()
        getDoctorData()
        loadUserProfileData() // Refresh coins data after cancellation
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

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div className='py-6 max-padd-container'>
      <p className='pb-3 mt-6 text-lg font-bold text-gray-800 border-b border-gray-200'>My Appointments</p>
      
      <div>
        {appointments.length === 0 && (
          <div className='h-[50vh] flex flex-col items-center justify-center gap-3 text-center'>
            <div className='w-16 h-16 bg-purple-50 text-purple-600 rounded-full flexCenter text-2xl shadow-inner'>
              📅
            </div>
            <p className='text-gray-600 font-semibold text-sm'>No Appointments booked yet!</p>
            <button onClick={() => navigate('/doctors')} className='bg-purple-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-purple-700 transition cursor-pointer shadow-md mt-2'>
              Book Consultation Now
            </button>
          </div>
        )}

        {appointments.map((item, index) => (
          <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-5 border-b border-gray-100 items-center justify-between'>
            <div className='flex items-center gap-4 sm:gap-6 flex-1'>
              <div className='w-24 sm:w-32 h-28 sm:h-32 bg-slate-50 rounded-2xl overflow-hidden p-1 border border-slate-200 shrink-0 flexCenter'>
                <img className='w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300' src={item.docData.image} alt={item.docData.name} />
              </div>
              <div className='text-sm text-gray-600 space-y-1'>
                <p className='text-gray-900 text-base font-extrabold'>{item.docData.name}</p>
                <p className='text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-md inline-block'>{item.docData.speciality}</p>
                <p className='text-xs text-gray-500 font-medium pt-1'>
                  <span className='font-bold text-gray-700'>Address:</span> {item.docData.address.line1}, {item.docData.address.line2}
                </p>
                <p className='text-xs text-gray-700 font-bold pt-0.5'>
                  <span className='text-gray-500 font-normal'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>
            </div>

            <div className='flex flex-col gap-2.5 justify-center sm:min-w-48 text-sm text-center'>
              {/* Show paid status badge */}
              {!item.cancelled && item.payment && !item.isCompleted && (
                <div className={`py-2 px-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs ${
                  item.paidWithCoins 
                    ? 'text-amber-800 bg-amber-50 border-amber-200' 
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}>
                  {item.paidWithCoins ? (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                        <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000">T</text>
                      </svg>
                      <span>Paid with Tokens</span>
                    </>
                  ) : (
                    <span>✓ Paid Online</span>
                  )}
                </div>
              )}

              {!item.cancelled && !item.payment && !item.isCompleted && (
                <span className='py-2 px-3 border border-amber-300 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold'>Payment Pending</span>
              )}

              {item.isCompleted && (
                <span className='py-2 px-3 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold'>Completed</span>
              )}

              {!item.cancelled && !item.isCompleted && (
                <button 
                  onClick={() => handleCancelClick(item)} 
                  className='text-gray-600 border border-slate-200 rounded-xl py-2 px-4 text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 cursor-pointer shadow-2xs'
                >
                  Cancel appointment
                </button>
              )}

              {item.cancelled && !item.isCompleted && (
                <span className='py-2 px-3 border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs font-bold'>Appointment Cancelled</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Clean Modular Refund Choice Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false)
          setCancellingItem(null)
        }}
        onConfirm={(choice) => executeCancel(cancellingItem._id, choice)}
        item={cancellingItem}
        loading={cancellingLoading}
      />
    </div>
  )
}

export default MyAppointments