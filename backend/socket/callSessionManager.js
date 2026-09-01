// In-memory call sessions manager
// Map<callId, CallSession>
const sessions = new Map()

// Map<userId, Set<socketId>> for tracking active online sockets per user/doctor
const userSockets = new Map()

export const registerUserSocket = (userId, socketId) => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set())
  }
  userSockets.get(userId).add(socketId)
}

export const unregisterUserSocket = (userId, socketId) => {
  if (userSockets.has(userId)) {
    userSockets.get(userId).delete(socketId)
    if (userSockets.get(userId).size === 0) {
      userSockets.delete(userId)
    }
  }
}

export const getUserSocketIds = (userId) => {
  return Array.from(userSockets.get(userId) || [])
}

export const createCallSession = (data) => {
  const { callId, appointmentId, callerId, callerSocketId, callerRole, callerName, callerImage, receiverId } = data
  const session = {
    callId,
    appointmentId,
    callerId,
    callerSocketId,
    callerRole,
    callerName,
    callerImage,
    receiverId,
    receiverSocketId: null,
    status: 'ringing', // ringing -> active -> ended
    createdAt: Date.now()
  }
  sessions.set(callId, session)
  return session
}

export const getCallSession = (callId) => {
  return sessions.get(callId)
}

export const setCallReceiverSocket = (callId, receiverSocketId) => {
  const session = sessions.get(callId)
  if (session) {
    session.receiverSocketId = receiverSocketId
    session.status = 'active'
    session.connectedAt = Date.now()
  }
  return session
}

export const endCallSession = (callId) => {
  const session = sessions.get(callId)
  if (session) {
    session.status = 'ended'
    sessions.delete(callId)
  }
  return session
}

export const findActiveSessionBySocketId = (socketId) => {
  for (const session of sessions.values()) {
    if (session.callerSocketId === socketId || session.receiverSocketId === socketId) {
      return session
    }
  }
  return null
}
