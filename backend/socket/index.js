import { Server } from 'socket.io'
import { socketAuthMiddleware } from './socketAuth.js'
import { registerVideoCallHandlers } from './videoCallHandler.js'

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  // Authenticate every socket connection
  io.use(socketAuthMiddleware)

  // Register WebRTC Video Call Signaling Handlers
  io.on('connection', (socket) => {
    registerVideoCallHandlers(io, socket)
  })

  console.log('[Socket] WebRTC Socket.io signaling server initialized')
  return io
}
