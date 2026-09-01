import React, { useEffect, useRef } from 'react'
import { User, Mic, MicOff } from 'lucide-react'

const LocalVideo = ({ stream, isVideoMuted, isAudioMuted, userName }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    console.log('[DOCTOR LOCAL VIDEO] received stream:', stream)
    console.log('[DOCTOR LOCAL VIDEO] stream ID:', stream?.id)
    console.log('[DOCTOR LOCAL VIDEO] video tracks:', stream?.getVideoTracks())

    const videoEl = videoRef.current

    if (videoEl && stream && !isVideoMuted) {
      console.log('[DOCTOR LOCAL VIDEO] assigning srcObject')
      videoEl.srcObject = stream
      console.log('[DOCTOR LOCAL VIDEO] actual srcObject:', videoEl.srcObject)
      videoEl.play().catch(e => console.warn('[DOCTOR LOCAL VIDEO] Play warning:', e))
    } else if (videoEl && (!stream || isVideoMuted)) {
      console.log('[DOCTOR LOCAL VIDEO] clearing srcObject and pausing')
      try { videoEl.pause() } catch (e) {}
      videoEl.srcObject = null
      try { videoEl.load() } catch (e) {}
    }

    return () => {
      if (videoEl) {
        console.log('[DOCTOR LOCAL VIDEO CLEANUP] Pausing video element and clearing srcObject')
        try { videoEl.pause() } catch (e) {}
        videoEl.srcObject = null
        try { videoEl.load() } catch (e) {}
      }
    }
  }, [stream, isVideoMuted])

  return (
    <div className="relative w-full h-full min-h-0 bg-[#0F141C] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-center transition-all duration-300">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover object-center scale-x-[-1] bg-slate-950 transition-opacity duration-300 ${
          stream && !isVideoMuted ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
        }`}
      />
      {(!stream || isVideoMuted) && (
        <div className="w-full h-full bg-gradient-to-br from-teal-950/40 via-slate-950 to-slate-900 flex flex-col items-center justify-center gap-3 p-6 text-center select-none">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-teal-900/40 border-2 border-teal-500/30 flex items-center justify-center text-teal-300 shadow-2xl">
            <User className="w-10 h-10 sm:w-14 sm:h-14" />
          </div>
          <span className="text-sm sm:text-base text-slate-300 font-semibold">
            {userName || 'Doctor (You)'} (Camera Off)
          </span>
        </div>
      )}

      {/* Exact Figma Bottom-Left Self Participant Badge */}
      <div className="absolute bottom-3.5 left-3.5 bg-[#121722]/85 backdrop-blur-md border border-slate-700/60 px-3.5 py-1.5 rounded-full flex items-center gap-2.5 shadow-xl z-20 select-none">
        {/* Animated Equalizer */}
        <div className="flex items-center gap-0.5 h-3.5">
          <span className={`w-0.5 rounded-full ${isAudioMuted ? 'bg-slate-600 h-2' : 'bg-teal-400 h-3 animate-pulse'}`} />
          <span className={`w-0.5 rounded-full ${isAudioMuted ? 'bg-slate-600 h-3' : 'bg-teal-400 h-3.5 animate-pulse delay-75'}`} />
          <span className={`w-0.5 rounded-full ${isAudioMuted ? 'bg-slate-600 h-1.5' : 'bg-teal-400 h-2 animate-pulse delay-150'}`} />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-white leading-tight">
            {userName || 'Doctor (You)'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium leading-none">
            {isVideoMuted ? 'Camera Off' : 'Self View'}
          </span>
        </div>

        <div className="flex items-center gap-1 pl-1">
          {isAudioMuted ? (
            <span className="p-0.5 bg-red-600 text-white rounded-full">
              <MicOff className="w-2.5 h-2.5" />
            </span>
          ) : (
            <span className="p-0.5 bg-teal-500/20 rounded-full text-teal-400">
              <Mic className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Floating Red Mute Alert Badge */}
      {isAudioMuted && (
        <div className="absolute top-3.5 right-3.5 z-30 bg-red-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <MicOff className="w-3.5 h-3.5" />
          <span>Muted</span>
        </div>
      )}
    </div>
  )
}

export default LocalVideo
