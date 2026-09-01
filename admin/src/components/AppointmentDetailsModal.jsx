import React, { useState, useRef } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CreditCard, 
  Phone, 
  Mail, 
  Printer, 
  Copy, 
  Check, 
  Ban, 
  FileText, 
  ShieldCheck,
  Coins
} from 'lucide-react'
import { toast } from 'react-toastify'

const AppointmentDetailsModal = ({
  appointment,
  isOpen,
  onClose,
  onCancel,
  currency = '₹',
  slotDateFormat = (d) => d,
  calculateAge = () => 'N/A'
}) => {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'receipt'
  const [copied, setCopied] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const receiptRef = useRef(null)

  if (!isOpen || !appointment) return null

  const defaultUserImg = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop"
  const defaultDocImg = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop"

  const handleCopyId = () => {
    if (appointment._id) {
      navigator.clipboard.writeText(appointment._id)
      setCopied(true)
      toast.success('Appointment ID copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCancelClick = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      setCancelling(true)
      try {
        await onCancel(appointment._id)
        onClose()
      } finally {
        setCancelling(false)
      }
    }
  }

  const isCompleted = appointment.isCompleted && !appointment.cancelled
  const isCancelled = appointment.cancelled
  const isUpcoming = !appointment.cancelled && !appointment.isCompleted

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Modal Dialog Container */}
      <div 
        className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900 tracking-tight">Appointment Details</h3>
                {/* Status Badge */}
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Cancelled
                  </span>
                ) : isCompleted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                    Upcoming
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                <span>ID: {appointment._id}</span>
                <button
                  onClick={handleCopyId}
                  className="hover:text-purple-600 p-0.5 rounded transition-colors"
                  title="Copy Appointment ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Overview & Clinical
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'receipt'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Official Receipt
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'overview' ? (
            <>
              {/* Schedule Summary Banner */}
              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Scheduled Session</p>
                    <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                      {slotDateFormat(appointment.slotDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-bold text-gray-800">{appointment.slotTime}</span>
                </div>
              </div>

              {/* Patient & Doctor Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient Card */}
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Patient Details</span>
                    <div className="flex items-center gap-3 mt-2.5">
                      <img
                        src={appointment.userData?.image || defaultUserImg}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = defaultUserImg
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-gray-900 text-sm truncate">
                          {appointment.userData?.name || 'Patient'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-medium">
                          {appointment.userData?.dob && (
                            <span>{calculateAge(appointment.userData.dob)} Yrs</span>
                          )}
                          {appointment.userData?.gender && (
                            <>
                              <span>•</span>
                              <span>{appointment.userData.gender}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs text-gray-600">
                    {appointment.userData?.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{appointment.userData.email}</span>
                      </div>
                    )}
                    {appointment.userData?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{appointment.userData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Card */}
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Assigned Doctor</span>
                    <div className="flex items-center gap-3 mt-2.5">
                      <img
                        src={appointment.docData?.image || defaultDocImg}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = defaultDocImg
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-gray-900 text-sm truncate">
                          {appointment.docData?.name || 'Doctor'}
                        </h4>
                        <p className="text-xs text-purple-700 font-semibold truncate mt-0.5">
                          {appointment.docData?.speciality || 'General Specialist'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Experience</span>
                    <span className="font-bold text-gray-800">
                      {appointment.docData?.experience || '5+ Years'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Billing Breakdown */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Billing & Consultation Fees
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {appointment.paidWithCoins ? (
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                        <Coins className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-xs text-gray-800">
                        {appointment.paidWithCoins ? 'Therapique Wallet Coins' : 'Online / Card Payment'}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {appointment.payment ? 'Payment Confirmed' : 'Cash / Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-base text-gray-900 font-mono">
                      {currency}{appointment.amount}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Paid
                    </span>
                  </div>
                </div>

                {appointment.refundStatus && appointment.refundStatus !== 'none' && (
                  <div className="pt-2.5 border-t border-slate-100 text-xs flex items-center justify-between text-rose-600 font-medium">
                    <span>Refund Status</span>
                    <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      {appointment.refundStatus.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Printable Thermal Receipt Tab */
            <div ref={receiptRef} className="space-y-4">
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 font-mono text-xs space-y-4 shadow-inner">
                {/* Receipt Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-300">
                  <h2 className="font-black text-base tracking-tight text-gray-900 uppercase">Therapique Healthcare</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5">Official Clinical Consultation Receipt</p>
                  <p className="text-[9px] text-gray-400 mt-1 font-sans">100% Verified Telehealth & Consultation System</p>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase">Receipt No.</span>
                    <span className="font-bold text-gray-900">REC-{appointment._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block text-[9px] uppercase">Date</span>
                    <span className="font-bold text-gray-900">
                      {new Date(appointment.date || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Patient & Doctor Lines */}
                <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Patient:</span>
                    <span className="font-bold text-gray-800">{appointment.userData?.name || 'Patient'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doctor:</span>
                    <span className="font-bold text-gray-800">Dr. {appointment.docData?.name || 'Doctor'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slot:</span>
                    <span className="font-bold text-gray-800">
                      {slotDateFormat(appointment.slotDate)} at {appointment.slotTime}
                    </span>
                  </div>
                </div>

                {/* Items & Fees */}
                <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5">
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>1x Doctor Consultation Fee</span>
                    <span>{currency}{appointment.amount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Platform & Telehealth Fee</span>
                    <span>{currency}0</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold text-sm pt-2 border-t border-slate-300">
                    <span>Total Amount Paid</span>
                    <span>{currency}{appointment.amount}</span>
                  </div>
                </div>

                {/* Barcode representation */}
                <div className="pt-3 border-t border-dashed border-slate-300 text-center flex flex-col items-center">
                  <div className="h-8 w-44 bg-repeating-linear-gradient flex items-center justify-center opacity-80">
                    <div className="flex gap-1 items-center justify-center h-full w-full">
                      {[1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4].map((w, i) => (
                        <span key={i} className="bg-black h-6 inline-block" style={{ width: `${w * 1.5}px` }} />
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] tracking-widest text-gray-400 mt-1 uppercase">
                    *{appointment._id.slice(-12).toUpperCase()}*
                  </span>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Print Physical Receipt
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          {isUpcoming ? (
            <button
              onClick={handleCancelClick}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Appointment</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-200/70 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetailsModal
