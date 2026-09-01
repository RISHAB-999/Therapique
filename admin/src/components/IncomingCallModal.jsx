import React, { useEffect } from 'react'
import { Phone, PhoneOff, Video, User } from 'lucide-react'

const IncomingCallModal = ({
  incomingCall,
  onAccept,
  onReject
}) => {
  useEffect(() => {
    if (!incomingCall) return

    const timeout = setTimeout(() => {
      onReject(incomingCall.callId, 'Unanswered timeout')
    }, 30000)

    return () => clearTimeout(timeout)
  }, [incomingCall, onReject])

  if (!incomingCall) return null

  const { callerName, callerImage, callId } = incomingCall

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-6 flex flex-col items-center text-white">
        
        {/* Ringing Avatar */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-purple-500/20 animate-ping" />
          <div className="absolute -inset-6 rounded-full bg-purple-500/10 animate-pulse" />
          
          {callerImage ? (
            <img
              src={callerImage}
              alt={callerName}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-purple-500/50 shadow-xl"
            />
          ) : (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-purple-900/50 border-2 border-purple-500/40 flex items-center justify-center text-purple-200 shadow-xl">
              <User className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Title & Info */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-bold mb-1">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>Incoming Patient Call</span>
          </div>
          <h3 className="text-xl font-black text-slate-100 tracking-tight">{callerName || 'Patient'}</h3>
          <p className="text-xs text-slate-400 font-semibold">Appointment Session Call</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 w-full pt-2">
          {/* Decline Button */}
          <button
            onClick={() => onReject(callId, 'Doctor declined')}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            title="Decline Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Accept Button */}
          <button
            onClick={() => onAccept(incomingCall)}
            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-transform duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95 ring-4 ring-emerald-500/30"
            title="Accept Call"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  )
}

export default IncomingCallModal
