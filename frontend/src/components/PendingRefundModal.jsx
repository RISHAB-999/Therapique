import React, { useContext, useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { AlertCircle, X, Sparkles, Building2, Wallet } from 'lucide-react'
import { formatSlotDate as fmtDate } from '../utils/dateFormatter'

const PendingRefundModal = () => {
  const { backendUrl, token, loadUserProfileData, setUserData } = useContext(AppContext)
  const [pendingAppointment, setPendingAppointment] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dismissedIds, setDismissedIds] = useState(() => new Set())

  // Check for any cancelled appointment with refundStatus === 'pending_choice'
  const checkPendingRefunds = useCallback(async () => {
    if (!token) return
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success && Array.isArray(data.appointments)) {
        const found = data.appointments.find(
          app => app.cancelled && app.payment && !app.paidWithCoins && app.refundStatus === 'pending_choice' && !dismissedIds.has(app._id)
        )
        if (found) {
          setPendingAppointment(found)
          setIsOpen(true)
        } else {
          setIsOpen(false)
        }
      }
    } catch (err) {
      // Silent error in background check
      console.log('Pending refund check error:', err.message)
    }
  }, [backendUrl, token, dismissedIds])

  useEffect(() => {
    if (token) {
      checkPendingRefunds()
      const interval = setInterval(checkPendingRefunds, 15000)
      return () => clearInterval(interval)
    }
  }, [token, checkPendingRefunds])

  const handleClaim = async (refundChoice) => {
    if (!pendingAppointment || isProcessing) return
    setIsProcessing(true)
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/claim-refund',
        { appointmentId: pendingAppointment._id, refundChoice },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message, { autoClose: 6000 })
        if (data.therapiqueCoins !== undefined) {
          setUserData(prev => prev ? { ...prev, therapiqueCoins: data.therapiqueCoins } : prev)
        }
        await loadUserProfileData()
        setIsOpen(false)
        setPendingAppointment(null)
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDismiss = () => {
    if (pendingAppointment) {
      setDismissedIds(prev => new Set(prev).add(pendingAppointment._id))
    }
    setIsOpen(false)
  }

  if (!isOpen || !pendingAppointment || typeof document === 'undefined') return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-900/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-100 space-y-5 relative transform transition-all duration-300 my-auto">
        {/* Close / Dismiss Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          title="Decide later"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner border border-purple-100">
            💳
          </div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            How would you like your refund?
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Your appointment with <strong className="text-purple-700 font-bold">Dr. {pendingAppointment.docData?.name}</strong> on {fmtDate(pendingAppointment.slotDate)} at {pendingAppointment.slotTime} was cancelled.
          </p>
          <div className="inline-block bg-purple-50 border border-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-black">
            Refund Amount: ₹{pendingAppointment.amount}
          </div>
        </div>

        {/* Informative description */}
        <div className="text-center">
          <p className="text-[11px] text-gray-600">
            Because you paid online via Razorpay, please choose where you want your money:
          </p>
        </div>

        {/* Refund Options */}
        <div className="space-y-3 pt-1">
          {/* Option 1: Instant Therapique Tokens */}
          <div
            onClick={() => !isProcessing && handleClaim('tokens')}
            className={`p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 cursor-pointer transition-all duration-200 group flex items-start gap-3.5 shadow-2xs hover:shadow-md ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
              <Wallet className="w-5 h-5 text-amber-950" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-xs sm:text-sm text-gray-900 group-hover:text-amber-950 transition-colors">
                  Convert to Therapique Tokens
                </h4>
                <span className="text-[9px] font-black bg-amber-300 text-amber-950 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Instant
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Credit <strong>{pendingAppointment.amount} Tokens</strong> immediately into your wallet for zero-delay booking or book purchases.
              </p>
            </div>
          </div>

          {/* Option 2: Direct Cash / Bank Refund via Razorpay */}
          <div
            onClick={() => !isProcessing && handleClaim('bank')}
            className={`p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 cursor-pointer transition-all duration-200 group flex items-start gap-3.5 shadow-2xs hover:shadow-md ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-xs sm:text-sm text-gray-900 group-hover:text-purple-700 transition-colors">
                  Direct Bank / UPI Refund
                </h4>
                <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full shrink-0">
                  Razorpay
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Refund ₹{pendingAppointment.amount} back to your original payment method (Bank / UPI / Card) in 3-5 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Decide Later Button */}
        <div className="pt-2 text-center space-y-2">
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-700 py-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Processing refund...</span>
            </div>
          ) : (
            <button
              onClick={handleDismiss}
              type="button"
              className="text-[11px] font-bold text-gray-400 hover:text-gray-700 transition cursor-pointer"
            >
              I'll choose later (accessible in My Appointments)
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default PendingRefundModal
