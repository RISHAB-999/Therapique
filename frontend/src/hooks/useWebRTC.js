import { useState, useRef, useCallback, useEffect } from 'react'

console.log('[WEBRTC DEBUG BUILD] Patient WebRTC version: PRO-REALTIME-AUDIO-DEVICE-008')

const getIceServers = () => {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]

  const turnUrl = import.meta.env.VITE_TURN_URL
  const turnUsername = import.meta.env.VITE_TURN_USERNAME
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL

  if (turnUrl && turnUsername && turnCredential) {
    iceServers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnCredential
    })
  }

  return { iceServers }
}

// Low-latency Opus audio SDP optimization
function optimizeSdpForLowLatency(sdp) {
  if (!sdp) return sdp
  return sdp.replace(/a=fmtp:(\d+) (.*)/g, (match, pt, fmtp) => {
    if (sdp.includes(`a=rtpmap:${pt} opus/48000`)) {
      let params = fmtp
      if (!params.includes('minptime=')) params += ';minptime=10'
      if (!params.includes('ptime=')) params += ';ptime=10'
      if (!params.includes('maxaveragebitrate=')) params += ';maxaveragebitrate=64000'
      if (!params.includes('useinbandfec=')) params += ';useinbandfec=1'
      if (!params.includes('usedtx=')) params += ';usedtx=0'
      return `a=fmtp:${pt} ${params}`
    }
    return match
  })
}

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [mediaError, setMediaError] = useState(null)

  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const iceCandidatesQueueRef = useRef([])
  const initPromiseRef = useRef(null)
  const isAudioMutedRef = useRef(isAudioMuted)
  isAudioMutedRef.current = isAudioMuted

  // 1. Get UserMedia (video + audio, with audio-only fallback)
  const initLocalStream = useCallback(async () => {
    console.count('[PATIENT] initLocalStream called')
    if (localStreamRef.current && localStreamRef.current.active) {
      console.log('[PATIENT MEDIA TEST] Reusing existing local stream:', localStreamRef.current.id)
      return localStreamRef.current
    }

    if (initPromiseRef.current) {
      console.log('[PATIENT MEDIA TEST] Reusing in-flight initLocalStream promise')
      return initPromiseRef.current
    }

    initPromiseRef.current = (async () => {
      try {
        setMediaError(null)
        console.log('[PATIENT MEDIA TEST] requesting camera + microphone')
        
        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: { ideal: 1280, max: 1920 }, 
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 60 },
              facingMode: 'user'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1
            }
          })
        } catch (highResErr) {
          console.warn('[PATIENT MEDIA TEST] High-res constraints failed, falling back to basic video+audio:', highResErr)
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          })
        }
        
        // Ensure all audio tracks are enabled
        stream.getAudioTracks().forEach(track => {
          track.enabled = true
        })

        localStreamRef.current = stream
        window.__therapique_active_stream_patient = stream

        if (!window.__therapique_all_streams_patient) window.__therapique_all_streams_patient = []
        window.__therapique_all_streams_patient.push(stream)

        setLocalStream(stream)
        setIsVideoMuted(false)
        setIsAudioMuted(false)
        console.log('[PATIENT MEDIA TEST] SUCCESS (video+audio)', stream)
        return stream
      } catch (error) {
        console.error('[PATIENT MEDIA TEST] Video+Audio FAILED, trying audio-only fallback...', error)

        // Fallback: audio-only when camera is locked/unavailable
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1
            }
          })
          
          audioStream.getAudioTracks().forEach(track => {
            track.enabled = true
          })

          localStreamRef.current = audioStream
          window.__therapique_active_stream_patient = audioStream

          if (!window.__therapique_all_streams_patient) window.__therapique_all_streams_patient = []
          window.__therapique_all_streams_patient.push(audioStream)

          setLocalStream(audioStream)
          setIsVideoMuted(true)
          setIsAudioMuted(false)

          let errorMessage = 'Camera unavailable — joined with audio only.'
          if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage = 'Camera hardware is locked. Joined with audio only — you can still speak.'
          }
          setMediaError(errorMessage)
          console.log('[PATIENT MEDIA TEST] AUDIO-ONLY FALLBACK SUCCESS', audioStream)
          return audioStream
        } catch (audioError) {
          console.error('[PATIENT MEDIA TEST] Audio-only ALSO FAILED', audioError)
          let errorMessage = 'Failed to access camera or microphone.'
          if (audioError.name === 'NotAllowedError' || audioError.name === 'PermissionDeniedError') {
            errorMessage = 'Camera & microphone access was denied. Please allow permissions in browser settings.'
          }
          setMediaError(errorMessage)
          throw audioError
        }
      } finally {
        initPromiseRef.current = null
      }
    })()

    return initPromiseRef.current
  }, [])

  // Seamless Bluetooth / Audio device connection and disconnection handler
  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) return

    let isSwitching = false

    const handleDeviceChange = async () => {
      if (isSwitching || !localStreamRef.current) return
      console.log('[PATIENT WEBRTC] Audio devicechange event detected! Checking audio devices...')
      isSwitching = true

      try {
        // Grab new active audio input device
        const newMedia = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1
          }
        })

        const newAudioTrack = newMedia.getAudioTracks()[0]
        if (!newAudioTrack) {
          isSwitching = false
          return
        }

        console.log('[PATIENT WEBRTC] Hot-swapped audio track:', newAudioTrack.label, newAudioTrack.id)

        // Maintain current mute status
        newAudioTrack.enabled = !isAudioMutedRef.current

        // Update localStreamRef
        if (localStreamRef.current) {
          const oldAudioTracks = localStreamRef.current.getAudioTracks()
          oldAudioTracks.forEach(t => {
            localStreamRef.current.removeTrack(t)
            try { t.stop() } catch (e) {}
          })
          localStreamRef.current.addTrack(newAudioTrack)
        }

        // Hot-swap on RTCPeerConnection sender without tearing down the connection
        const pc = peerConnectionRef.current
        if (pc && pc.connectionState !== 'closed') {
          const audioSender = pc.getSenders().find(s => s.track && s.track.kind === 'audio')
          if (audioSender) {
            console.log('[PATIENT WEBRTC] Hot-swapping audio sender track seamlessly...')
            await audioSender.replaceTrack(newAudioTrack)
            console.log('[PATIENT WEBRTC] Audio sender track replaced successfully!')
          }
        }
      } catch (err) {
        console.warn('[PATIENT WEBRTC] Audio hot-swap error on devicechange:', err)
      } finally {
        isSwitching = false
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [])

  // Process queued ICE candidates after setRemoteDescription
  const processIceCandidatesQueue = useCallback(async () => {
    const pc = peerConnectionRef.current
    if (pc && pc.remoteDescription && pc.remoteDescription.type && iceCandidatesQueueRef.current.length > 0) {
      console.log('[WEBRTC DEBUG Patient] Flushing queued ICE candidates count:', iceCandidatesQueueRef.current.length)
      for (const cand of iceCandidatesQueueRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand))
        } catch (err) {
          console.error('[WEBRTC DEBUG Patient] Error adding queued ICE candidate:', err)
        }
      }
      iceCandidatesQueueRef.current = []
    }
  }, [])

  // 2. Create RTCPeerConnection and attach tracks BEFORE offer/answer
  const createPeerConnection = useCallback((onIceCandidate, onRemoteStream, onConnected) => {
    console.count('[PATIENT] peer connection created')
    if (peerConnectionRef.current) {
      console.log('[WEBRTC DEBUG Patient] Existing PeerConnection state:', peerConnectionRef.current.connectionState)
      if (peerConnectionRef.current.connectionState !== 'closed' && peerConnectionRef.current.connectionState !== 'failed') {
        return peerConnectionRef.current
      }
      try { peerConnectionRef.current.close() } catch (e) {}
    }

    console.log('[WEBRTC DEBUG Patient] Creating new RTCPeerConnection...')
    const pc = new RTCPeerConnection(getIceServers())
    peerConnectionRef.current = pc
    iceCandidatesQueueRef.current = []

    // Attach local tracks BEFORE offer/answer
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('[WEBRTC DEBUG Patient] Adding local track to PC:', track.kind, track.id)
        pc.addTrack(track, localStreamRef.current)
      })
    } else {
      console.warn('[WEBRTC DEBUG Patient] No local stream available when creating PeerConnection!')
    }

    // 4. Handle remote stream tracks with zero-latency playout hints
    pc.ontrack = (event) => {
      console.log('[REMOTE TRACK RECEIVED]', {
        role: 'patient',
        kind: event.track.kind,
        trackId: event.track.id,
        streams: event.streams?.map(s => s.id)
      })

      // Zero-latency playout hint
      if (event.receiver) {
        if ('playoutDelayHint' in event.receiver) {
          event.receiver.playoutDelayHint = 0
        }
        if ('jitterBufferTarget' in event.receiver) {
          event.receiver.jitterBufferTarget = 0
        }
      }

      const incomingTracks = (event.streams && event.streams[0])
        ? event.streams[0].getTracks()
        : [event.track]

      setRemoteStream(prev => {
        const existingTracks = prev ? prev.getTracks() : []
        const combined = [...existingTracks, ...incomingTracks]
        const unique = Array.from(new Map(combined.map(t => [t.id, t])).values())
        const freshStream = new MediaStream(unique)

        console.log('[PATIENT REMOTE STREAM]', {
          streamId: freshStream.id,
          tracks: freshStream.getTracks().map(t => ({ id: t.id, kind: t.kind, enabled: t.enabled }))
        })

        if (onRemoteStream) onRemoteStream(freshStream)
        return freshStream
      })
    }

    // 12. Local ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WEBRTC DEBUG Patient] Generated ICE candidate:', event.candidate.candidate.substring(0, 40))
        if (onIceCandidate) onIceCandidate(event.candidate)
      }
    }

    // 9. Connection State Monitoring
    pc.onconnectionstatechange = () => {
      console.log('[CALL STATE]', {
        role: 'patient',
        socketConnected: true,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState
      })

      if (pc.connectionState === 'connected' || pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('[WEBRTC DEBUG Patient] WebRTC connection established successfully!')
        if (onConnected) onConnected()
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('[WEBRTC ICE STATE]', {
        role: 'patient',
        iceConnectionState: pc.iceConnectionState
      })
    }

    return pc
  }, [])

  // 11. Create Offer with low-latency SDP
  const createOffer = useCallback(async () => {
    const pc = peerConnectionRef.current
    if (!pc) throw new Error('PeerConnection not initialized for createOffer')
    console.log('[WEBRTC DEBUG Patient] Creating offer...')
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    })
    const optimizedSdp = optimizeSdpForLowLatency(offer.sdp)
    const optimizedOffer = { type: offer.type, sdp: optimizedSdp }
    console.log('[WEBRTC DEBUG Patient] Setting local description (Offer)...')
    await pc.setLocalDescription(optimizedOffer)
    return optimizedOffer
  }, [])

  // 11. Handle Offer and Create Answer with low-latency SDP
  const handleOfferAndCreateAnswer = useCallback(async (offer) => {
    const pc = peerConnectionRef.current
    if (!pc) throw new Error('PeerConnection not initialized for handleOfferAndCreateAnswer')
    console.log('[WEBRTC DEBUG Patient] Setting remote description (Offer)...')
    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    await processIceCandidatesQueue()

    console.log('[WEBRTC DEBUG Patient] Creating answer...')
    const answer = await pc.createAnswer()
    const optimizedSdp = optimizeSdpForLowLatency(answer.sdp)
    const optimizedAnswer = { type: answer.type, sdp: optimizedSdp }
    console.log('[WEBRTC DEBUG Patient] Setting local description (Answer)...')
    await pc.setLocalDescription(optimizedAnswer)
    return optimizedAnswer
  }, [processIceCandidatesQueue])

  // 11. Handle Answer
  const handleAnswer = useCallback(async (answer) => {
    const pc = peerConnectionRef.current
    if (!pc) return
    console.log('[WEBRTC DEBUG Patient] Setting remote description (Answer)... SignalingState:', pc.signalingState)
    if (pc.signalingState === 'have-local-offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
      await processIceCandidatesQueue()
    }
  }, [processIceCandidatesQueue])

  // 12. Add ICE Candidate (Queue if remoteDescription is not yet set)
  const addIceCandidate = useCallback(async (candidate) => {
    const pc = peerConnectionRef.current
    if (!pc || !candidate) return

    if (pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
        console.log('[WEBRTC DEBUG Patient] Added ICE candidate successfully')
      } catch (err) {
        console.error('[WEBRTC DEBUG Patient] Error adding ICE candidate:', err)
      }
    } else {
      console.log('[WEBRTC DEBUG Patient] Queueing ICE candidate until remote description is set')
      iceCandidatesQueueRef.current.push(candidate)
    }
  }, [])

  // Toggle Audio Mute
  const toggleAudio = useCallback(() => {
    console.log('[PATIENT] MICROPHONE BUTTON CLICKED')
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        console.log('[PATIENT] BEFORE AUDIO TOGGLE:', { id: audioTrack.id, enabled: audioTrack.enabled, readyState: audioTrack.readyState })
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioMuted(!audioTrack.enabled)
        console.log('[PATIENT] AFTER AUDIO TOGGLE:', { id: audioTrack.id, enabled: audioTrack.enabled, readyState: audioTrack.readyState })
        return audioTrack.enabled
      }
    }
    return false
  }, [])

  // Toggle Video Camera
  const toggleVideo = useCallback(() => {
    console.log('[PATIENT] CAMERA BUTTON CLICKED')
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        console.log('[PATIENT] BEFORE CAMERA TOGGLE:', { id: videoTrack.id, enabled: videoTrack.enabled, readyState: videoTrack.readyState })
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoMuted(!videoTrack.enabled)
        console.log('[PATIENT] AFTER CAMERA TOGGLE:', { id: videoTrack.id, enabled: videoTrack.enabled, readyState: videoTrack.readyState })
        return videoTrack.enabled
      }
    }
    return false
  }, [])

  // Central Comprehensive Idempotent Hardware Release Cleanup
  const cleanupWebRTC = useCallback(() => {
    console.log('[WEBRTC HARDWARE CLEANUP Patient] START')

    // 1. Remove tracks from RTCPeerConnection senders to release Chromium C++ media pipeline handles
    const pc = peerConnectionRef.current
    if (pc) {
      console.log('[WEBRTC HARDWARE CLEANUP Patient] Removing senders and closing PeerConnection')
      try {
        const senders = pc.getSenders()
        senders.forEach(sender => {
          if (sender.track) {
            console.log('[WEBRTC HARDWARE CLEANUP Patient] Stopping sender track:', sender.track.kind, sender.track.id)
            try { sender.track.stop() } catch (e) {}
          }
          try { pc.removeTrack(sender) } catch (e) {}
        })
      } catch (e) {
        console.warn('[WEBRTC HARDWARE CLEANUP Patient] Error removing senders:', e)
      }

      pc.ontrack = null
      pc.onicecandidate = null
      pc.onconnectionstatechange = null
      pc.oniceconnectionstatechange = null
      pc.onsignalingstatechange = null

      if (pc.signalingState !== 'closed') {
        try { pc.close() } catch (e) {}
      }
      peerConnectionRef.current = null
    }

    // 0. Reset in-flight promise ref
    initPromiseRef.current = null

    // 1. Stop all streams in global window.__therapique_all_streams_patient registry
    if (window.__therapique_all_streams_patient) {
      console.log('[WEBRTC HARDWARE CLEANUP Patient] Stopping all window.__therapique_all_streams_patient count:', window.__therapique_all_streams_patient.length)
      window.__therapique_all_streams_patient.forEach(s => {
        try {
          s.getTracks().forEach(track => {
            console.log('[WEBRTC HARDWARE CLEANUP Patient] Stopping tracked stream track:', track.kind, track.id)
            track.enabled = false
            try { track.stop() } catch (e) {}
          })
        } catch (e) {}
      })
      window.__therapique_all_streams_patient = []
    }

    // 2. Stop all tracks on window global reference
    if (window.__therapique_active_stream_patient) {
      console.log('[WEBRTC HARDWARE CLEANUP Patient] Stopping window.__therapique_active_stream_patient tracks...')
      try {
        window.__therapique_active_stream_patient.getTracks().forEach(track => {
          console.log('[WEBRTC HARDWARE CLEANUP Patient] Stopping global track:', track.kind, track.id)
          track.enabled = false
          try { track.stop() } catch (e) {}
        })
      } catch (e) {}
      window.__therapique_active_stream_patient = null
    }

    // 3. Stop all local MediaStreamTracks (localStreamRef)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('[WEBRTC HARDWARE CLEANUP Patient] STOPPING LOCAL TRACK', {
          kind: track.kind,
          id: track.id,
          readyState: track.readyState
        })
        track.enabled = false
        try { track.stop() } catch (e) {}
      })
      localStreamRef.current = null
    }

    // 4. Stop tracks on localStream state object if different
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('[WEBRTC HARDWARE CLEANUP Patient] STOPPING STATE TRACK', {
          kind: track.kind,
          id: track.id,
          readyState: track.readyState
        })
        track.enabled = false
        try { track.stop() } catch (e) {}
      })
    }

    // 5. Force HTML5 Video Elements in DOM to pause, clear srcObject, and call load() to release hardware sinks
    try {
      document.querySelectorAll('video').forEach(videoEl => {
        console.log('[WEBRTC HARDWARE CLEANUP Patient] Clearing DOM video element sink')
        try { videoEl.pause() } catch (e) {}
        videoEl.srcObject = null
        try { videoEl.load() } catch (e) {}
      })
    } catch (e) {}

    iceCandidatesQueueRef.current = []

    // 6. Reset React state
    setLocalStream(null)
    setRemoteStream(null)
    setIsAudioMuted(false)
    setIsVideoMuted(false)
    setMediaError(null)

    console.log('[WEBRTC HARDWARE CLEANUP Patient] COMPLETE')
  }, [localStream])

  return {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    mediaError,
    initLocalStream,
    createPeerConnection,
    createOffer,
    handleOfferAndCreateAnswer,
    handleAnswer,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    cleanupWebRTC
  }
}
