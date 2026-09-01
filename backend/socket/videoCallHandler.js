import appointmentModel from '../models/appointmentModel.js'

export const registerVideoCallHandlers = (io, socket) => {
  const { userId, role, name, image } = socket.data || {}

  console.log(`[Socket] Connected: ${name || 'User'} (${role || 'guest'}) | Socket ID: ${socket.id}`)

  // 1. DIRECT ROOM JOIN
  socket.on('room:join', async ({ appointmentId }, callback) => {
    try {
      if (!appointmentId) {
        if (callback) callback({ success: false, message: 'Appointment ID required' })
        return
      }

      // Authorization boundary verification
      const appointment = await appointmentModel.findById(appointmentId)
      if (!appointment) {
        if (callback) callback({ success: false, message: 'Appointment not found' })
        return
      }

      if (appointment.cancelled) {
        if (callback) callback({ success: false, message: 'This appointment has been cancelled' })
        return
      }

      // Verify user is authorized participant (either patient or doctor)
      if (role === 'user' && String(appointment.userId) !== String(userId)) {
        console.warn(`[Room Authorization Failed] User ${userId} not authorized for appointment ${appointmentId}`)
        if (callback) callback({ success: false, message: 'Unauthorized appointment access' })
        return
      }
      if (role === 'doctor' && String(appointment.docId) !== String(userId)) {
        console.warn(`[Room Authorization Failed] Doctor ${userId} not authorized for appointment ${appointmentId}`)
        if (callback) callback({ success: false, message: 'Unauthorized doctor appointment access' })
        return
      }

      socket.join(appointmentId)
      socket.currentRoom = appointmentId

      const room = io.sockets.adapter.rooms.get(appointmentId)
      const participantCount = room ? room.size : 1

      console.log(`[Room] ${name} (${role}) joined room ${appointmentId}. Total participants: ${participantCount}`)

      // Find other participant socket ID in the room
      let otherSocketId = null
      if (room) {
        for (const id of room) {
          if (id !== socket.id) {
            otherSocketId = id
            break
          }
        }
      }

      if (otherSocketId) {
        const otherSocket = io.sockets.sockets.get(otherSocketId)
        const peerInfo = otherSocket ? { name: otherSocket.data.name, image: otherSocket.data.image, role: otherSocket.data.role } : null

        // Notify existing participant that a peer joined
        socket.to(appointmentId).emit('user:joined', {
          socketId: socket.id,
          name,
          image,
          role
        })

        // Notify joining socket about existing peer
        socket.emit('room:joined', {
          success: true,
          participantCount,
          peerInfo
        })
      } else {
        socket.emit('room:joined', {
          success: true,
          participantCount,
          peerInfo: null
        })
      }

      if (callback) callback({ success: true, participantCount })
    } catch (error) {
      console.error('Error joining room:', error)
      if (callback) callback({ success: false, message: error.message })
    }
  })

  // 2. WEBRTC OFFER RELAY
  socket.on('webrtc:offer', ({ room, offer }) => {
    if (room && offer) {
      console.log(`[WebRTC Relay] Relaying Offer in room ${room} from ${socket.id}`)
      socket.to(room).emit('webrtc:offer', { offer, senderSocketId: socket.id })
    }
  })

  // 3. WEBRTC ANSWER RELAY
  socket.on('webrtc:answer', ({ room, answer }) => {
    if (room && answer) {
      console.log(`[WebRTC Relay] Relaying Answer in room ${room} from ${socket.id}`)
      socket.to(room).emit('webrtc:answer', { answer, senderSocketId: socket.id })
    }
  })

  // 4. WEBRTC ICE CANDIDATE RELAY
  socket.on('webrtc:ice-candidate', ({ room, candidate }) => {
    if (room && candidate) {
      socket.to(room).emit('webrtc:ice-candidate', { candidate, senderSocketId: socket.id })
    }
  })

  // 4b. MUTE STATUS RELAY
  socket.on('webrtc:mute-status', ({ room, isAudioMuted, isVideoMuted }) => {
    if (room) {
      socket.to(room).emit('webrtc:mute-status', { isAudioMuted, isVideoMuted, senderSocketId: socket.id })
    }
  })

  // 5. REAL-TIME CHAT MESSAGE RELAY
  socket.on('chat:message', ({ room, text, senderName, senderRole }) => {
    if (room && text) {
      const messageData = {
        id: Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        text,
        senderName: senderName || name || 'Participant',
        senderRole: senderRole || role || 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderSocketId: socket.id
      }
      console.log(`[Chat] Room ${room} - ${messageData.senderName} (${messageData.senderRole}): ${text}`)
      io.to(room).emit('chat:message', messageData)
    }
  })

  // 6. LEAVE ROOM / DISCONNECT
  const handleLeave = () => {
    const room = socket.currentRoom
    if (room) {
      console.log(`[Room] ${name} left room ${room}`)
      socket.to(room).emit('peer:left', { socketId: socket.id, name })
      socket.leave(room)
      socket.currentRoom = null
    }
  }

  socket.on('room:leave', handleLeave)

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${name || 'User'} (${role || 'guest'}) | Socket ID: ${socket.id}`)
    handleLeave()
  })
}

