import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { useCallSignaling } from '../../hooks/useCallSignaling'

// Clean, high-fidelity SVG icons
const I = {
  Mic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  ),
  MicOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="2" y1="2" x2="22" y2="22"/>
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/>
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  ),
  Cam: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14"/>
      <rect x="2" y="8" width="13" height="8" rx="2"/>
    </svg>
  ),
  CamOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="2" y1="2" x2="22" y2="22"/>
      <path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L21 9v6"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10z"/>
    </svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Hangup: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 9c-3.1 0-6.1 1.1-8.4 3.1-.6.5-.7 1.4-.2 2l1.6 1.6c.5.5 1.4.6 2 .1 1.4-.9 3.1-1.5 4.9-1.5s3.6.6 4.9 1.5c.6.4 1.5.4 2-.1l1.6-1.6c.5-.5.4-1.4-.2-2C18.1 10.1 15.1 9 12 9z"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Minimize: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3.5 h-3.5">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Maximize: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    </svg>
  )
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const clean = name.replace(/^dr\.?\s+/i, '')
  const parts = clean.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function SoundBars() {
  return (
    <div className="flex items-center gap-[2px]" style={{ height: 14 }}>
      {[1, 2, 3, 4].map(n => (
        <div key={n} className={`bar-${n} w-[3px] rounded-full`}
          style={{ height: '100%', background: '#14b8a6', transformOrigin: 'bottom' }} />
      ))}
    </div>
  )
}

function Avatar({ name, image, size = 64, speaking }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(name)

  return (
    <div className={speaking ? 'speaking-ring' : ''} style={{ borderRadius: '50%', padding: speaking ? 2 : 0, display: 'inline-flex' }}>
      {image && !imgError ? (
        <img
          src={image}
          alt={name || 'Profile'}
          onError={() => setImgError(true)}
          className="rounded-full object-cover select-none flex-shrink-0"
          style={{
            width: size,
            height: size,
            border: '2px solid rgba(255,255,255,0.22)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
          }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full text-white font-bold select-none flex-shrink-0 shadow-xl"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.36,
            background: 'linear-gradient(135deg, #0d5c54 0%, #0e7490 100%)',
            border: '2px solid rgba(255,255,255,0.18)',
          }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}

function Wifi({ level = 3 }) {
  const h = [5, 9, 13, 17]
  return (
    <svg viewBox="0 0 20 18" className="w-4 h-4 flex-shrink-0">
      {h.map((ht, i) => (
        <rect key={i} x={i * 5} y={18 - ht} width={3.5} height={ht} rx={1.5}
          fill={i < level ? '#14b8a6' : 'rgba(255,255,255,0.18)'} />
      ))}
    </svg>
  )
}

function CtrlBtn({
  tip, active = true, danger = false, onClick, disabled = false, badge,
  children,
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick && onClick(e)
      }}
      disabled={disabled}
      title={tip}
      className="relative flex flex-col items-center justify-center transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-teal-400 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className={[
        'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-xl',
        danger
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_6px_24px_rgba(239,68,68,0.5)] hover:shadow-[0_8px_32px_rgba(239,68,68,0.7)] hover:scale-105 active:scale-95'
          : active
          ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 hover:scale-105 active:scale-95'
          : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:scale-105 active:scale-95',
      ].join(' ')}>
        {children}
      </div>
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full text-[11px] font-bold text-black flex items-center justify-center shadow"
          style={{ background: '#14b8a6' }}>
          {badge}
        </span>
      )}
    </button>
  )
}

function Toast({ msg }) {
  return (
    <div className="anim-slide-up flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-teal-300 bg-teal-500/10 border border-teal-500/30 backdrop-blur-md shadow-lg">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-teal-400 blink" />
      {msg}
    </div>
  )
}

function NameLabel({ name, role, mic, cam, speaking }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl max-w-[260px] sm:max-w-none truncate shadow-2xl"
      style={{ background: 'rgba(6,10,14,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {speaking ? <SoundBars /> : <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#14b8a6' }} />}
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">{name}</p>
        <p className="text-[10px]" style={{ color: '#8892b0' }}>{role}</p>
      </div>
      <div className="flex gap-1.5 ml-1.5 flex-shrink-0 items-center">
        <span className={mic ? 'text-teal-400' : 'text-red-400'}>{mic ? <I.Mic /> : <I.MicOff />}</span>
        <span className={cam ? 'text-teal-400' : 'text-red-400'}>{cam ? <I.Cam /> : <I.CamOff />}</span>
      </div>
    </div>
  )
}

function EndDialog({ onCancel, onEnd, doctorName }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}>
      <div className="anim-fade-scale w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl"
        style={{ background: '#111820', border: '1px solid rgba(255,255,255,0.09)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-400" style={{ background: 'rgba(239,68,68,0.14)' }}>
          <I.Hangup />
        </div>
        <h2 className="text-xl font-semibold text-white text-center mb-2">End consultation?</h2>
        <p className="text-sm leading-relaxed text-center mb-7" style={{ color: '#8892b0' }}>
          Are you sure you want to leave this video consultation with {doctorName || 'the doctor'}?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:bg-white/[0.1] cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#a0aab4' }}>
            Cancel
          </button>
          <button onClick={onEnd} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:bg-red-500 cursor-pointer text-white"
            style={{ background: '#ef4444', boxShadow: '0 4px 24px rgba(239,68,68,0.35)' }}>
            End
          </button>
        </div>
      </div>
    </div>
  )
}

// 4-Safe Corner Snap Calculation with Generous Laptop Margins
function getSafeCorners(isMinimized, chatOpen) {
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1000
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800
  const isMobile = winW < 640

  const w = isMinimized ? (isMobile ? 64 : 68) : (isMobile ? 144 : 208)
  const h = isMinimized ? (isMobile ? 64 : 68) : (isMobile ? 100 : 138)

  if (isMobile) {
    const pad = 16
    return {
      'top-right': {
        x: Math.max(pad, winW - w - pad),
        y: 56
      },
      'top-left': {
        x: pad,
        y: 56
      },
      'bottom-left': {
        x: pad,
        y: Math.max(pad, winH - h - 148)
      },
      'bottom-right': {
        x: Math.max(pad, winW - w - pad),
        y: Math.max(pad, winH - h - 96)
      }
    }
  }

  // Laptop / Desktop View (Generous margins away from edges, bottom dock, and chat drawer)
  const deskPadX = 32
  const deskPadTop = 64
  const deskPadBottom = 108
  const rightPad = chatOpen ? (320 + deskPadX) : deskPadX

  return {
    'top-right': {
      x: Math.max(deskPadX, winW - w - rightPad),
      y: deskPadTop
    },
    'top-left': {
      x: deskPadX,
      y: deskPadTop
    },
    'bottom-left': {
      x: deskPadX,
      // Generously floating above the participant info badge
      y: Math.max(deskPadTop, winH - h - 164)
    },
    'bottom-right': {
      x: Math.max(deskPadX, winW - w - rightPad),
      // Generously floating above the bottom controls dock
      y: Math.max(deskPadTop, winH - h - deskPadBottom)
    }
  }
}

function getNearestSafeCorner(currentX, currentY, isMinimized, chatOpen) {
  const corners = getSafeCorners(isMinimized, chatOpen)
  let best = 'top-right'
  let minDistance = Infinity

  Object.entries(corners).forEach(([name, coords]) => {
    const d = Math.hypot(coords.x - currentX, coords.y - currentY)
    if (d < minDistance) {
      minDistance = d
      best = name
    }
  })

  return best
}

const VideoCallPage = () => {
  const { appointmentId } = useParams()
  const [searchParams] = useSearchParams()
  const ticket = searchParams.get('ticket')
  const navigate = useNavigate()
  const { backendUrl, token, userData } = useContext(AppContext)

  const [chatOpen, setChatOpen] = useState(false)
  const [chatBadge, setChatBadge] = useState(0)
  const [showEnd, setShowEnd] = useState(false)
  const [callSeconds, setCallSeconds] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const controlsTimerRef = useRef(null)

  // Toast message
  const [toastMessage, setToastMessage] = useState(null)
  const toastTimerRef = useRef(null)

  // 4-Corner PiP state (snaps strictly between the 4 corners)
  const [activeCorner, setActiveCorner] = useState('top-right')
  const [dragPos, setDragPos] = useState(null) // null = docked at activeCorner, {x,y} = active drag
  const [pipMinimized, setPipMinimized] = useState(false)
  const pipRef = useRef(null)
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false })

  // Real-time dynamic messages list
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const chatBottomRef = useRef(null)

  const remoteVideoRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const localVideoRef = useRef(null)
  const isLeavingRef = useRef(false)

  const authOptions = ticket
    ? { callTicket: ticket }
    : { token: token || undefined }

  const {
    socket,
    callState,
    remoteUserInfo,
    joinRoom,
    leaveRoom,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    isRemoteAudioMuted,
    isRemoteVideoMuted,
    mediaError,
    toggleAudio,
    toggleVideo
  } = useCallSignaling(backendUrl, authOptions)

  // Dynamic names & profile images (Ensures Doctor's title is always displayed as "Dr. <Name>")
  const patientName = userData?.name || 'Patient'
  const patientImage = userData?.image || null

  const rawDoctorName = remoteUserInfo?.name || (callState === 'connected' ? 'Doctor' : 'Connecting Doctor...')
  const doctorName = rawDoctorName.toLowerCase().startsWith('dr.') || rawDoctorName.toLowerCase().startsWith('dr ')
    ? rawDoctorName
    : `Dr. ${rawDoctorName}`
  const doctorImage = remoteUserInfo?.image || null

  // Trigger temporary toast
  useEffect(() => {
    if (callState === 'connected') {
      setToastMessage(`${doctorName} joined the consultation`)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000)
    } else if (callState === 'connecting') {
      setToastMessage('Connecting to secure consultation...')
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000)
    }
  }, [callState, doctorName])

  // Stable refs
  const joinRoomRef = useRef(joinRoom)
  joinRoomRef.current = joinRoom
  const leaveRoomRef = useRef(leaveRoom)
  leaveRoomRef.current = leaveRoom

  // Auto-join room on mount
  useEffect(() => {
    if (isLeavingRef.current) return
    console.log('[PATIENT PAGE] joining room for appointmentId:', appointmentId)
    if (appointmentId && joinRoomRef.current) {
      joinRoomRef.current(appointmentId)
    }
  }, [appointmentId, socket])

  // Real-time Chat Socket Listener
  useEffect(() => {
    if (!socket) return

    const handleChatMessage = (msg) => {
      console.log('[PATIENT CHAT] Received message:', msg)
      setMessages((prev) => [...prev, msg])
      if (!chatOpen) {
        setChatBadge((prev) => prev + 1)
      }
    }

    socket.on('chat:message', handleChatMessage)
    return () => {
      socket.off('chat:message', handleChatMessage)
    }
  }, [socket, chatOpen])

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, chatOpen])

  // Continuous remote audio playback sink
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      if (remoteAudioRef.current.srcObject !== remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream
      }
      remoteAudioRef.current.play().catch((e) => {
        console.log('[PATIENT AUDIO] Autoplay waiting for user gesture:', e)
      })
    }
  }, [remoteStream])

  // Continuous remote video stream binding
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      if (!isRemoteVideoMuted) {
        remoteVideoRef.current.play().catch((e) => console.warn('[PATIENT] remote play error:', e))
      }
    }
  }, [remoteStream, isRemoteVideoMuted])

  // Continuous local video stream binding (guaranteed persistence across PiP minimize/maximize)
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream
      }
      if (!isVideoMuted && !pipMinimized) {
        localVideoRef.current.play().catch((e) => console.warn('[PATIENT] local play error:', e))
      }
    }
  }, [localStream, isVideoMuted, pipMinimized])

  // Timer
  useEffect(() => {
    let interval = null
    if (callState === 'connected') {
      interval = setInterval(() => setCallSeconds((s) => s + 1), 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [callState])

  // Lock body & prevent mobile bounce / overscroll white background
  useEffect(() => {
    const origBodyStyle = {
      overflow: document.body.style.overflow,
      backgroundColor: document.body.style.backgroundColor,
      overscrollBehavior: document.body.style.overscrollBehavior
    }
    const origHtmlStyle = {
      overflow: document.documentElement.style.overflow,
      backgroundColor: document.documentElement.style.backgroundColor,
      overscrollBehavior: document.documentElement.style.overscrollBehavior
    }

    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#080c10'
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.backgroundColor = '#080c10'
    document.documentElement.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.overflow = origBodyStyle.overflow
      document.body.style.backgroundColor = origBodyStyle.backgroundColor
      document.body.style.overscrollBehavior = origBodyStyle.overscrollBehavior
      document.documentElement.style.overflow = origHtmlStyle.overflow
      document.documentElement.style.backgroundColor = origHtmlStyle.backgroundColor
      document.documentElement.style.overscrollBehavior = origHtmlStyle.overscrollBehavior
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (leaveRoomRef.current) leaveRoomRef.current()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (leaveRoomRef.current) leaveRoomRef.current()
    }
  }, [])

  // Send real-time chat message
  const handleSendMessage = () => {
    if (!chatInput.trim() || !socket) return
    const text = chatInput.trim()
    console.log('[PATIENT CHAT] Sending message:', text)
    socket.emit('chat:message', {
      room: appointmentId,
      text,
      senderName: patientName,
      senderRole: 'patient'
    })
    setChatInput('')
  }

  const handleEndCall = () => {
    isLeavingRef.current = true
    leaveRoom()
    navigate('/my-appointments')
  }

  const formatTimer = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  // Pointer drag that snaps ONLY to the 4 corners on release
  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return
    const pipEl = pipRef.current || e.currentTarget
    const rect = pipEl.getBoundingClientRect()

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
      moved: false
    }

    try {
      pipEl.setPointerCapture(e.pointerId)
    } catch (err) {}
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragRef.current.moved = true
    }

    const winW = window.innerWidth
    const winH = window.innerHeight
    const isMobile = winW < 640
    const w = pipMinimized ? (isMobile ? 64 : 68) : (isMobile ? 144 : 208)
    const h = pipMinimized ? (isMobile ? 64 : 68) : (isMobile ? 100 : 138)

    const rawX = dragRef.current.origX + dx
    const rawY = dragRef.current.origY + dy

    // Clamping strictly within viewport during drag
    const pad = isMobile ? 16 : 32
    const rightLimit = (chatOpen && !isMobile) ? (winW - 320 - w - pad) : (winW - w - pad)
    const clampedX = Math.max(pad, Math.min(rightLimit, rawX))
    const clampedY = Math.max(pad, Math.min(winH - h - pad, rawY))

    setDragPos({ x: clampedX, y: clampedY })
  }

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return
    dragRef.current.isDragging = false

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (err) {}

    // Tap on minimized pill -> maximize immediately in same corner
    if (!dragRef.current.moved && pipMinimized) {
      setPipMinimized(false)
      setDragPos(null)
      return
    }

    // Snap cleanly to nearest safe corner
    if (dragPos) {
      const nearest = getNearestSafeCorner(dragPos.x, dragPos.y, pipMinimized, chatOpen)
      setActiveCorner(nearest)
      setDragPos(null) // snaps to safe corner coordinates with smooth CSS transition
    }
  }

  // Active Corner Coordinates
  const safeCorners = getSafeCorners(pipMinimized, chatOpen)
  const currentCoords = dragPos || safeCorners[activeCorner] || safeCorners['top-right']

  // Controls auto-hide timer (4.5s of inactivity) & tap-to-toggle
  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    if (!chatOpen && !showEnd) {
      controlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 4500)
    }
  }, [chatOpen, showEnd])

  // Fast mobile single-tap & desktop click detection
  const touchDataRef = useRef({ startX: 0, startY: 0, startTime: 0 })
  const lastTapTimeRef = useRef(0)

  const handleTouchStart = (e) => {
    handleUserInteraction()
    if (e.touches && e.touches.length === 1) {
      touchDataRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startTime: Date.now()
      }
    }
  }

  const handleTouchEnd = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || dragRef.current?.isDragging || dragRef.current?.moved) return

    if (e.changedTouches && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0]
      const dx = Math.abs(touch.clientX - touchDataRef.current.startX)
      const dy = Math.abs(touch.clientY - touchDataRef.current.startY)
      const dt = Date.now() - touchDataRef.current.startTime

      // Single tap under 400ms and minimal movement (< 15px)
      if (dx < 15 && dy < 15 && dt < 400) {
        lastTapTimeRef.current = Date.now()
        setControlsVisible(prev => {
          const next = !prev
          if (next) resetControlsTimer()
          else if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
          return next
        })
      }
    }
  }

  const handleClick = (e) => {
    handleUserInteraction()
    // Suppress synthetic ghost clicks right after onTouchEnd
    if (Date.now() - lastTapTimeRef.current < 500) return
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || dragRef.current?.isDragging || dragRef.current?.moved) return

    setControlsVisible(prev => {
      const next = !prev
      if (next) resetControlsTimer()
      else if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
      return next
    })
  }

  useEffect(() => {
    resetControlsTimer()
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [resetControlsTimer, chatOpen, showEnd])

  // Touch / Click Audio Autoplay Enabler
  const handleUserInteraction = () => {
    if (remoteAudioRef.current && remoteAudioRef.current.paused && remoteStream) {
      remoteAudioRef.current.play().catch(() => {})
    }
  }

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={resetControlsTimer}
      className="fixed inset-0 w-full w-screen h-full h-[100dvh] min-h-screen max-h-[100dvh] overflow-hidden bg-[#080c10] overscroll-none touch-manipulation select-none font-sans text-white cursor-pointer"
    >
      {/* 0. DEDICATED CONTINUOUS REMOTE AUDIO SINK */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
      />

      {/* 1. PRIMARY REMOTE DOCTOR VIDEO (FULLSCREEN FIT - NOT ZOOMED) */}
      <div className="absolute inset-0 z-0 bg-[#080c10] flex items-center justify-center overflow-hidden pointer-events-none">
        <video
          ref={(el) => {
            remoteVideoRef.current = el
            if (el && remoteStream && el.srcObject !== remoteStream) {
              el.srcObject = remoteStream
              el.play().catch(() => {})
            }
          }}
          autoPlay
          playsInline
          className={`w-full h-full object-contain pointer-events-none ${(!remoteStream || isRemoteVideoMuted) ? 'opacity-0 absolute' : 'opacity-100'}`}
        />
        {(!remoteStream || isRemoteVideoMuted) && (
          <div className="w-full h-full bg-[#080c10] flex flex-col items-center justify-center gap-4">
            <Avatar name={doctorName} image={doctorImage} size={110} speaking={callState === 'connected' && !isRemoteAudioMuted} />
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              {callState === 'connected' ? `${doctorName} (Camera Off)` : 'Waiting for doctor to join...'}
            </p>
          </div>
        )}

        {/* Video Vignette Gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(6,10,14,0.6) 0%, transparent 15%, transparent 70%, rgba(6,10,14,0.75) 100%)'
          }}
        />

        {/* Speaking Border Indicator */}
        {callState === 'connected' && !isRemoteAudioMuted && (
          <div className="absolute inset-0 pointer-events-none speaking-ring" style={{ borderRadius: 0 }} />
        )}
      </div>

      {/* 2. TOP HEADER HUD (CLEAN CENTER PILL ONLY) */}
      <header className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-center px-4 pt-3 sm:pt-4 pointer-events-none transition-all duration-300 ${
        controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass shadow-md">
            <span className="w-1.5 h-1.5 rounded-full blink flex-shrink-0" style={{ background: '#ef4444' }} />
            <span className="font-mono text-xs sm:text-[13px] font-semibold text-white tracking-wide">{formatTimer(callSeconds)}</span>
          </div>

          {/* Connection Quality */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass shadow-md">
            <Wifi level={3} />
            <span className="text-[11px] font-medium" style={{ color: '#14b8a6' }}>Excellent</span>
          </div>

          {/* Encrypted Badge */}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-full glass shadow-md">
            <I.Shield />
            <span className="text-[11px]" style={{ color: '#8892b0' }}>Encrypted</span>
          </div>
        </div>
      </header>

      {/* 3. TEMPORARY TOAST BANNER (AUTO-DISAPPEARS AFTER 4s) */}
      {toastMessage && (
        <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
          <Toast msg={toastMessage} />
        </div>
      )}

      {/* 4. PATIENT PiP (MAGNETICALLY SNAPS STRICTLY BETWEEN 4 SAFE CORNERS) */}
      <div
        ref={pipRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          left: `${currentCoords.x}px`,
          top: `${currentCoords.y}px`,
          transition: dragPos ? 'none' : 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="fixed z-30 touch-none select-none cursor-grab active:cursor-grabbing"
      >
        {/* Minimized Pill View */}
        <div
          onClick={(e) => { e.stopPropagation(); setPipMinimized(false) }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl glass items-center justify-center cursor-pointer shadow-[0_12px_36px_rgba(0,0,0,0.85)] hover:scale-105 active:scale-95 transition-all border border-teal-500/50 relative group bg-[#0e1520]/95 backdrop-blur-xl ${
            pipMinimized ? 'flex' : 'hidden'
          }`}
          title="Tap to maximize self view"
        >
          <Avatar name={patientName} image={patientImage} size={42} speaking={!isAudioMuted} />
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg border border-white/40 group-hover:scale-110 transition-transform pointer-events-none">
            <I.Maximize />
          </div>
        </div>

        {/* Expanded Video Card View (Keeps video element permanently in DOM) */}
        <div
          className={`relative w-36 h-[100px] sm:w-48 sm:h-[130px] md:w-52 md:h-[140px] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.85)] transition-all bg-[#0e1520] ${
            pipMinimized ? 'hidden' : 'block'
          }`}
          style={{
            border: `2px solid ${!isAudioMuted ? 'rgba(20,184,166,0.6)' : 'rgba(255,255,255,0.14)'}`
          }}
        >
          <video
            ref={(el) => {
              localVideoRef.current = el
              if (el && localStream && el.srcObject !== localStream) {
                el.srcObject = localStream
                if (!isVideoMuted) el.play().catch(() => {})
              }
            }}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover -scale-x-100 ${(!localStream || isVideoMuted) ? 'opacity-0 absolute pointer-events-none' : 'opacity-100'}`}
          />
          {(!localStream || isVideoMuted) && (
            <div className="w-full h-full bg-[#0e1520] flex items-center justify-center">
              <Avatar name={patientName} image={patientImage} size={48} speaking={!isAudioMuted} />
            </div>
          )}

          {!isAudioMuted && <div className="absolute inset-0 pointer-events-none speaking-ring rounded-2xl" />}

          {/* Minimize Overlay Button */}
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); setPipMinimized(true) }}
              title="Minimize self view"
              className="w-7 h-7 rounded-xl bg-black/75 hover:bg-black/95 text-gray-200 hover:text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-md border border-white/10"
            >
              <I.Minimize />
            </button>
          </div>

          {/* PiP Bottom Label */}
          <div
            className="absolute bottom-0 left-0 right-0 px-2.5 py-1"
            style={{ background: 'linear-gradient(to top, rgba(6,10,14,0.95), transparent)' }}
          >
            <div className="flex items-center gap-1">
              {!isAudioMuted && <div className="scale-75 origin-left"><SoundBars /></div>}
              <p className="text-[10px] font-semibold text-white truncate leading-tight">{patientName}</p>
              <span className="ml-auto text-[8px] shrink-0 font-medium" style={{ color: '#14b8a6' }}>You</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. DOCTOR NAME LABEL (BOTTOM-LEFT OVERLAY) */}
      <div
        className={`fixed left-3 sm:left-6 z-20 pointer-events-auto transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          bottom: 'max(88px, calc(env(safe-area-inset-bottom, 20px) + 72px))'
        }}
      >
        <NameLabel
          name={doctorName}
          role="Doctor · Specialist"
          mic={!isRemoteAudioMuted}
          cam={!isRemoteVideoMuted && !!remoteStream}
          speaking={callState === 'connected' && !isRemoteAudioMuted}
        />
      </div>

      {/* 6. BOTTOM FLOATING CONTROL DOCK (BEAUTIFULLY POLISHED RED HANGUP BUTTON) */}
      <div
        className={`fixed left-0 right-0 z-20 flex justify-center px-4 pointer-events-none transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
        style={{
          bottom: 'max(20px, env(safe-area-inset-bottom, 20px))'
        }}
      >
        <div
          className="flex items-center gap-2.5 sm:gap-3.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-[30px] pointer-events-auto shadow-2xl"
          style={{
            background: 'rgba(8,12,18,0.92)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 10px 48px rgba(0,0,0,0.7)'
          }}
        >
          {/* Mic Button */}
          <CtrlBtn tip={!isAudioMuted ? 'Mute microphone' : 'Unmute microphone'} active={!isAudioMuted} onClick={toggleAudio}>
            {!isAudioMuted ? <I.Mic /> : <I.MicOff />}
          </CtrlBtn>

          {/* Camera Button */}
          <CtrlBtn tip={!isVideoMuted ? 'Turn off camera' : 'Turn on camera'} active={!isVideoMuted} onClick={toggleVideo}>
            {!isVideoMuted ? <I.Cam /> : <I.CamOff />}
          </CtrlBtn>

          {/* Chat Toggle Button */}
          <CtrlBtn tip="Chat" active={chatOpen} onClick={() => { setChatOpen(!chatOpen); setChatBadge(0) }} badge={chatBadge}>
            <I.Chat />
          </CtrlBtn>

          <div className="w-px h-8 mx-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} />

          {/* End Consultation Button (Polished Hangup Receiver) */}
          <CtrlBtn tip="End Consultation" danger onClick={() => setShowEnd(true)}>
            <I.Hangup />
          </CtrlBtn>
        </div>
      </div>

      {/* 7. RIGHT SIDE REAL-TIME CHAT PANEL */}
      {chatOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[340px] max-w-full h-full h-[100dvh] max-h-[100dvh] shadow-2xl bg-[#0a0f17] border-l border-white/10 flex flex-col anim-slide-right overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0">
            <div>
              <p className="text-sm font-semibold text-white">Consultation Chat</p>
              <div className="flex items-center gap-1 mt-0.5">
                <I.Shield />
                <p className="text-[10px]" style={{ color: '#8892b0' }}>End-to-end encrypted</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <I.Close />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-teal-400 mb-2">
                  <I.Chat />
                </div>
                <p className="text-xs font-semibold text-slate-300">No messages yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Send a message to start real-time consultation chat</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderRole === 'patient'
                return (
                  <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${isMe ? 'bg-gradient-to-tr from-teal-700 to-cyan-600' : 'bg-teal-600'}`}>
                      {getInitials(m.senderName)}
                    </div>
                    <div className={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'items-end' : ''}`}>
                      <div
                        className={`px-3 py-2 rounded-2xl text-xs leading-relaxed text-white ${isMe ? 'bg-teal-500/25' : 'bg-white/10'}`}
                        style={{ borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}
                      >
                        {m.text}
                      </div>
                      <p className="text-[10px] px-1 text-slate-500">{m.time}</p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          <div
            className="px-3.5 pt-2 shrink-0 bg-[#0a0f17]/95 backdrop-blur-md border-t border-white/5"
            style={{
              paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))'
            }}
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 focus-within:border-teal-500/50 transition-colors">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type a message…"
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none min-w-0"
              />
              <button
                onClick={handleSendMessage}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-teal-500 hover:bg-teal-400 text-black font-bold cursor-pointer transition-colors active:scale-95"
              >
                <I.Send />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 8. END CONSULTATION DIALOG */}
      {showEnd && (
        <EndDialog
          doctorName={doctorName}
          onCancel={() => setShowEnd(false)}
          onEnd={handleEndCall}
        />
      )}
    </div>
  )
}

export default VideoCallPage
