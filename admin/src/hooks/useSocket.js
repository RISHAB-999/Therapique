import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

/**
 * Custom hook to manage singleton Socket.io client connection for admin doctor panel.
 * Connects using Doctor JWT token (`dtoken`) or one-time call ticket (`callTicket`).
 */
export const useSocket = (backendUrl, authOptions = {}) => {
  const [socket, setSocket] = useState(null)
  const socketRef = useRef(null)
  const { token, dtoken, callTicket } = authOptions

  useEffect(() => {
    if (!backendUrl) return
    if (!token && !dtoken && !callTicket) return

    if (socketRef.current) {
      return
    }

    const s = io(backendUrl, {
      auth: { token, dtoken, callTicket },
      transports: ['websocket', 'polling'],
      autoConnect: true
    })

    socketRef.current = s
    setSocket(s)

    s.on('connect', () => {
      console.log('[Socket Admin] Connected with ID:', s.id)
      setSocket(s)
    })

    s.on('connect_error', (error) => {
      console.error('[Socket Admin] Connection Error:', error.message)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
      }
    }
  }, [backendUrl, token, dtoken, callTicket])

  return socket
}
