import React, { useEffect, useState } from 'react'
import { Signal, Lock } from 'lucide-react'

const CallTimer = ({ isActive = true }) => {
  const [seconds, setSeconds] = useState(71)

  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive])

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const remSecs = secs % 60
    return `${mins < 10 ? '0' : ''}${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`
  }

  return (
    <div className="bg-[#121722]/90 backdrop-blur-md border border-slate-700/60 px-4 py-1.5 rounded-full flex items-center gap-3 text-xs shadow-lg select-none">
      {/* Elapsed Time with Red Dot */}
      <div className="flex items-center gap-1.5 font-mono font-bold text-white">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span>{formatTime(seconds)}</span>
      </div>

      {/* Divider */}
      <span className="h-3 w-px bg-slate-700" />

      {/* Connection Quality */}
      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
        <Signal className="w-3.5 h-3.5" />
        <span>Excellent</span>
      </div>

      {/* Divider */}
      <span className="h-3 w-px bg-slate-700 hidden sm:block" />

      {/* Encryption Badge */}
      <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
        <Lock className="w-3 h-3 text-slate-400" />
        <span>Encrypted</span>
      </div>
    </div>
  )
}

export default CallTimer

