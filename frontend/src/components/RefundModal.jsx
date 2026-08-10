import React from 'react'
import ReactDOM from 'react-dom'

const RefundModal = ({ isOpen, onClose, onConfirm, item, loading }) => {
  if (!isOpen || !item) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-900/50 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-100 space-y-6 relative transform transition-all duration-300 my-auto">
        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flexCenter mx-auto text-2xl shadow-inner border border-purple-100">
            💳
          </div>
          <h3 className="text-xl font-extrabold text-gray-800">
            How would you like your refund?
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Choose how to receive your <strong className="text-gray-800">₹{item.amount}</strong> refund for cancelling your consultation with <strong className="text-purple-700">Dr. {item.docData?.name}</strong>:
          </p>
        </div>

        {/* Refund Options */}
        <div className="space-y-3">
          {/* Option 1: Instant Therapique Tokens Credit */}
          <div
            onClick={() => onConfirm('tokens')}
            className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/40 hover:bg-amber-100/60 cursor-pointer transition-all duration-200 group flex items-start gap-3.5 shadow-2xs hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flexCenter font-black text-xs shrink-0 shadow-sm mt-0.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                <text x="12" y="16" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#8B8000">T</text>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-amber-900 transition-colors">
                  Convert to Therapique Tokens
                </h4>
                <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  ⚡ Instant
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Credit <strong>{item.amount} Tokens</strong> into your wallet immediately for zero-delay booking.
              </p>
            </div>
          </div>

          {/* Option 2: Direct Cash / Bank Refund */}
          <div
            onClick={() => onConfirm('bank')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/40 cursor-pointer transition-all duration-200 group flex items-start gap-3.5 shadow-2xs hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flexCenter font-black text-sm shrink-0 shadow-sm mt-0.5">
              🏦
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-purple-700 transition-colors">
                Direct Cash / Bank Refund
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Refund ₹{item.amount} back to your original UPI / Credit Card / Bank Account via Razorpay (3-5 business days).
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition cursor-pointer"
        >
          {loading ? 'Processing Cancellation...' : 'Keep Appointment & Close'}
        </button>
      </div>
    </div>,
    document.body
  )
}

export default RefundModal
