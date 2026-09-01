import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from './useSocket'
import { useWebRTC } from './useWebRTC'
import { toast } from 'react-toastify'

export const useCallSignaling = (backendUrl, authOptions = {}) => {
  const socket = useSocket(backendUrl, authOptions)
  const webRTC = useWebRTC()

  const webRTCRef = useRef(webRTC)
  webRTCRef.current = webRTC

  const [callState, setCallState] = useState('idle') // idle | connecting | connected | ended
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [remoteUserInfo, setRemoteUserInfo] = useState(null)
  const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState(false)
  const [isRemoteVideoMuted, setIsRemoteVideoMuted] = useState(false)

  const activeRoomIdRef = useRef(null)
  activeRoomIdRef.current = activeRoomId

  // Listen to WebRTC Room signaling events (bound ONCE per socket)
  useEffect(() => {
    if (!socket) return

    // Mute status from peer
    const handleMuteStatus = ({ isAudioMuted, isVideoMuted }) => {
      console.log('[PATIENT SIGNALING] Peer mute status changed:', { isAudioMuted, isVideoMuted })
      if (typeof isAudioMuted === 'boolean') {
        setIsRemoteAudioMuted(isAudioMuted)
      }
      if (typeof isVideoMuted === 'boolean') {
        setIsRemoteVideoMuted(isVideoMuted)
      }
    }

    // 1. Peer Joined Room (existing participant initiates WebRTC Offer)
    const handleUserJoined = async ({ name, image, role }) => {
      console.log('[PATIENT SIGNALING] Peer joined room:', name, role)
      setRemoteUserInfo({ name, image, role })
      toast.info(`${name || 'Participant'} joined room! Connecting video...`)

      const room = activeRoomIdRef.current || activeRoomId
      if (!room) {
        console.warn('[PATIENT SIGNALING] No active room ID found for user:joined!')
        return
      }

      // Try to get local media, but proceed even if it fails (e.g. camera locked on single laptop)
      try {
        await webRTCRef.current.initLocalStream()
      } catch (err) {
        console.warn('[PATIENT SIGNALING] initLocalStream failed, proceeding without local video:', err.name)
      }

      try {
        webRTCRef.current.createPeerConnection(
          (candidate) => {
            socket.emit('webrtc:ice-candidate', { room, candidate })
          },
          (stream) => {
            console.log('[PATIENT SIGNALING] Remote stream track received!')
          },
          () => {
            console.log('[PATIENT SIGNALING] Connection state set to connected!')
            setCallState('connected')
          }
        )

        const offer = await webRTCRef.current.createOffer()
        console.log('[PATIENT SIGNALING] Sending WebRTC offer...')
        socket.emit('webrtc:offer', { room, offer })
      } catch (error) {
        console.error('[PATIENT SIGNALING] Error creating offer on peer join:', error)
      }
    }

    // 2. Room Joined Event Callback
    const handleRoomJoined = async ({ peerInfo }) => {
      console.log('[PATIENT SIGNALING] Room joined successfully:', peerInfo)
      if (peerInfo) {
        setRemoteUserInfo(peerInfo)

        // Fail-safe: if peer is already in room and no offer was received within 1 sec, initiate offer
        setTimeout(async () => {
          const room = activeRoomIdRef.current || activeRoomId
          if (!room) return
          console.log('[PATIENT SIGNALING] Initiating fail-safe offer for existing peer in room...')
          try {
            await webRTCRef.current.initLocalStream()
          } catch (e) {}
          try {
            webRTCRef.current.createPeerConnection(
              (candidate) => socket.emit('webrtc:ice-candidate', { room, candidate }),
              null,
              () => setCallState('connected')
            )
            const offer = await webRTCRef.current.createOffer()
            socket.emit('webrtc:offer', { room, offer })
          } catch (err) {
            console.error('[PATIENT SIGNALING] Fail-safe offer error:', err)
          }
        }, 1000)
      }
    }

    // 3. WebRTC Offer Received (Receiver side)
    const handleWebRTCOffer = async ({ offer }) => {
      console.log('[PATIENT SIGNALING] WebRTC Offer received')
      const room = activeRoomIdRef.current || activeRoomId
      if (!room) {
        console.warn('[PATIENT SIGNALING] No active room ID found for offer!')
        return
      }

      // Try to get local media, but proceed even if it fails
      try {
        await webRTCRef.current.initLocalStream()
      } catch (err) {
        console.warn('[PATIENT SIGNALING] initLocalStream failed, proceeding without local video:', err.name)
      }

      try {
        webRTCRef.current.createPeerConnection(
          (candidate) => {
            socket.emit('webrtc:ice-candidate', { room, candidate })
          },
          (stream) => {
            console.log('[PATIENT SIGNALING] Remote stream track received!')
          },
          () => {
            console.log('[PATIENT SIGNALING] Connection state set to connected!')
            setCallState('connected')
          }
        )

        const answer = await webRTCRef.current.handleOfferAndCreateAnswer(offer)
        if (answer) {
          console.log('[PATIENT SIGNALING] Sending WebRTC answer...')
          socket.emit('webrtc:answer', { room, answer })
          setCallState('connected')
        }
      } catch (error) {
        console.error('[PATIENT SIGNALING] Error handling WebRTC offer:', error)
      }
    }

    // 4. WebRTC Answer Received (Offerer side)
    const handleWebRTCAnswer = async ({ answer }) => {
      console.log('[PATIENT SIGNALING] WebRTC Answer received')
      await webRTCRef.current.handleAnswer(answer)
      setCallState('connected')
    }

    // 5. ICE Candidate Received
    const handleIceCandidate = async ({ candidate }) => {
      await webRTCRef.current.addIceCandidate(candidate)
    }

    // 6. Peer Left Room
    const handlePeerLeft = ({ name }) => {
      console.log('[PATIENT SIGNALING] Peer left room:', name)
      toast.info(`${name || 'Participant'} left the session.`)
      setCallState('idle')
      setRemoteUserInfo(null)
      setIsRemoteAudioMuted(false)
      setIsRemoteVideoMuted(false)
    }

    socket.on('webrtc:mute-status', handleMuteStatus)
    socket.on('user:joined', handleUserJoined)
    socket.on('room:joined', handleRoomJoined)
    socket.on('webrtc:offer', handleWebRTCOffer)
    socket.on('webrtc:answer', handleWebRTCAnswer)
    socket.on('webrtc:ice-candidate', handleIceCandidate)
    socket.on('peer:left', handlePeerLeft)

    return () => {
      socket.off('webrtc:mute-status', handleMuteStatus)
      socket.off('user:joined', handleUserJoined)
      socket.off('room:joined', handleRoomJoined)
      socket.off('webrtc:offer', handleWebRTCOffer)
      socket.off('webrtc:answer', handleWebRTCAnswer)
      socket.off('webrtc:ice-candidate', handleIceCandidate)
      socket.off('peer:left', handlePeerLeft)
    }
  }, [socket])

  // Direct Join Room (Always initializes local media immediately!)
  const joinRoom = useCallback(async (appointmentId) => {
    console.log('[PATIENT] calling joinRoom for appointment:', appointmentId)
    activeRoomIdRef.current = appointmentId
    setActiveRoomId(appointmentId)
    setCallState('connecting')

    // ALWAYS initialize local media immediately regardless of socket state!
    try {
      console.log('[PATIENT] calling initLocalStream from joinRoom')
      await webRTCRef.current.initLocalStream()
    } catch (err) {
      console.error('[PATIENT] initLocalStream failed inside joinRoom:', err)
    }

    if (!socket) {
      console.warn('[PATIENT] socket not initialized yet when joinRoom was called')
      return
    }

    const doJoin = () => {
      console.log('[PATIENT] socket room:join emitted for room:', appointmentId, 'socket.id:', socket.id)
      socket.emit('room:join', { appointmentId }, (response) => {
        if (!response || !response.success) {
          toast.error(response?.message || 'Failed to join video room')
          setCallState('idle')
        } else {
          console.log('[PATIENT SIGNALING] Joined room successfully:', appointmentId)
        }
      })
    }

    if (socket.connected) {
      doJoin()
    } else {
      console.log('[PATIENT] socket not connected yet, registering connect listener for doJoin...')
      socket.once('connect', doJoin)
    }
  }, [socket])

  // Leave Room
  const leaveRoom = useCallback(() => {
    console.log('[PATIENT] leaveRoom called')
    const room = activeRoomIdRef.current
    if (socket && room) {
      socket.emit('room:leave')
    }
    setCallState('idle')
    setActiveRoomId(null)
    setRemoteUserInfo(null)
    setIsRemoteAudioMuted(false)
    setIsRemoteVideoMuted(false)
    webRTCRef.current.cleanupWebRTC()
  }, [socket])

  const toggleAudio = useCallback(() => {
    const isEnabled = webRTCRef.current.toggleAudio()
    const room = activeRoomIdRef.current
    if (socket && room) {
      socket.emit('webrtc:mute-status', { room, isAudioMuted: !isEnabled })
    }
    return isEnabled
  }, [socket])

  const toggleVideo = useCallback(() => {
    const isEnabled = webRTCRef.current.toggleVideo()
    const room = activeRoomIdRef.current
    if (socket && room) {
      socket.emit('webrtc:mute-status', { room, isVideoMuted: !isEnabled })
    }
    return isEnabled
  }, [socket])

  return {
    socket,
    callState,
    activeRoomId,
    remoteUserInfo,
    isRemoteAudioMuted,
    isRemoteVideoMuted,
    joinRoom,
    leaveRoom,
    localStream: webRTC.localStream,
    remoteStream: webRTC.remoteStream,
    isAudioMuted: webRTC.isAudioMuted,
    isVideoMuted: webRTC.isVideoMuted,
    mediaError: webRTC.mediaError,
    toggleAudio,
    toggleVideo
  }
}
