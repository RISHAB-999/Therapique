import React, { useEffect, useRef } from 'react'
import { User, Mic, MicOff } from 'lucide-react'

const RemoteVideo = ({
  stream,
  remoteUserName,
  remoteUserImage,
  callStatus,
  isRemoteAudioMuted
}) => {
  const videoRef = useRef(null)

  useEffect(() => {
    console.log('[REMOTE VIDEO TEST Admin]', {
      remoteUserName,
      streamId: stream?.id,
      videoTracks: stream?.getVideoTracks()?.map(t => ({
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState
      })),
      audioTracks: stream?.getAudioTracks()?.map(t => ({
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState
      }))
    })

    const videoEl = videoRef.current

    const routeAudioOutput = async () => {
      if (!videoEl || !('setSinkId' in videoEl) || !navigator.mediaDevices?.enumerateDevices) return
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput')
        console.log('[REMOTE VIDEO Admin] Available audio outputs:', audioOutputs.map(d => ({ label: d.label, id: d.deviceId })))
        
        // Find headphones / earbuds / bluetooth devices
        const headphoneDevice = audioOutputs.find(d => {
          const l = d.label.toLowerCase()
          return (
            l.includes('bluetooth') ||
            l.includes('headset') ||
            l.includes('earbud') ||
            l.includes('headphone') ||
            l.includes('wireless') ||
            l.includes('earphone') ||
            l.includes('buds') ||
            l.includes('airpod') ||
            l.includes('hands-free')
          )
        })

        if (headphoneDevice && headphoneDevice.deviceId) {
          console.log('[REMOTE VIDEO Admin] Routing audio to headphones/earbuds:', headphoneDevice.label)
          await videoEl.setSinkId(headphoneDevice.deviceId)
        }
      } catch (err) {
        console.log('[REMOTE VIDEO Admin] Audio output routing error:', err)
      }
    }

    if (stream && videoEl) {
      videoEl.srcObject = stream
      videoEl.play().catch(err => {
        console.warn('[REMOTE VIDEO ELEMENT Admin] Play error:', err)
      })

      routeAudioOutput()

      if (navigator.mediaDevices?.addEventListener) {
        navigator.mediaDevices.addEventListener('devicechange', routeAudioOutput)
      }
    } else if (videoEl && !stream) {
      try { videoEl.pause() } catch (e) {}
      videoEl.srcObject = null
    }

    return () => {
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', routeAudioOutput)
      }
      if (videoEl) {
        try { videoEl.pause() } catch (e) {}
        videoEl.srcObject = null
      }
    }
  }, [stream, remoteUserName, callStatus])

  const isConnected = callStatus === 'Connected 🟢'
  const hasVideoTrack = stream && stream.getVideoTracks() && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled

  return (
    <div className="relative w-full h-full min-h-0 bg-[#0F141C] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-center transition-all duration-300">
      {/* Video display — object-cover fills the stage card seamlessly */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover object-center bg-slate-950 transition-opacity duration-300 ${
          stream && hasVideoTrack ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
        }`}
      />

      {/* Modern Avatar Card when video is off / connecting */}
      {!(stream && hasVideoTrack) && (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
          <div className="relative">
            {remoteUserImage ? (
              <img
                src={remoteUserImage}
                alt={remoteUserName || 'Patient'}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-teal-500/40 shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-teal-950/80 via-slate-900 to-slate-950 border-2 border-teal-500/40 flex items-center justify-center text-teal-300 shadow-2xl">
                <User className="w-12 h-12 sm:w-16 sm:h-16" />
              </div>
            )}

            {!isConnected && (
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900 animate-ping" />
            )}
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {remoteUserName || 'Patient'}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {callStatus}
            </p>
          </div>
        </div>
      )}

      {/* Exact Figma Bottom-Left Participant Badge */}
      <div className="absolute bottom-3.5 left-3.5 bg-[#121722]/85 backdrop-blur-md border border-slate-700/60 px-3.5 py-1.5 rounded-full flex items-center gap-2.5 shadow-xl z-20 select-none">
        {/* Animated Audio Equalizer Bars */}
        <div className="flex items-center gap-0.5 h-3.5">
          <span className={`w-0.5 rounded-full ${isRemoteAudioMuted ? 'bg-slate-600 h-2' : 'bg-teal-400 h-3 animate-pulse'}`} />
          <span className={`w-0.5 rounded-full ${isRemoteAudioMuted ? 'bg-slate-600 h-3' : 'bg-teal-400 h-3.5 animate-pulse delay-75'}`} />
          <span className={`w-0.5 rounded-full ${isRemoteAudioMuted ? 'bg-slate-600 h-1.5' : 'bg-teal-400 h-2 animate-pulse delay-150'}`} />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px] sm:max-w-[180px]">
            {remoteUserName || 'Patient'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium leading-none">
            Patient · Online
          </span>
        </div>

        <div className="flex items-center gap-1 pl-1 text-teal-400">
          {isRemoteAudioMuted ? (
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
      {isRemoteAudioMuted && (
        <div className="absolute top-3.5 left-3.5 z-30 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
          <MicOff className="w-3.5 h-3.5" />
          <span>{remoteUserName || 'Patient'} is muted</span>
        </div>
      )}
    </div>
  )
}

export default RemoteVideo
