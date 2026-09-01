import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import { validateAndConsumeTicket } from './callTicketManager.js'

/**
 * Socket.io authentication middleware.
 * Authenticates users using either:
 * 1. User JWT token (`auth.token`)
 * 2. Doctor JWT token (`auth.dtoken`)
 * 3. One-time call ticket (`auth.callTicket`)
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const { token, dtoken, callTicket } = socket.handshake.auth || {}

    // Option A: Doctor authenticated via short-lived call ticket
    if (callTicket) {
      const ticketData = validateAndConsumeTicket(callTicket)
      if (ticketData) {
        socket.data = {
          userId: ticketData.docId,
          role: 'doctor',
          name: ticketData.docName,
          appointmentId: ticketData.appointmentId
        }
        return next()
      } else {
        return next(new Error('Invalid or expired call ticket'))
      }
    }

    // Option B: Patient authenticated via User JWT Token
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id).select('-password')
        if (user) {
          socket.data = {
            userId: user._id.toString(),
            role: 'user',
            name: user.name,
            image: user.image
          }
          return next()
        }
      } catch (err) {
        console.log('[Socket Auth] User token invalid:', err.message)
      }
    }

    // Option C: Doctor authenticated via Doctor JWT Token
    if (dtoken) {
      try {
        const decoded = jwt.verify(dtoken, process.env.JWT_SECRET)
        const doctor = await doctorModel.findById(decoded.id).select('-password')
        if (doctor) {
          socket.data = {
            userId: doctor._id.toString(),
            role: 'doctor',
            name: doctor.name,
            image: doctor.image
          }
          return next()
        }
      } catch (err) {
        console.log('[Socket Auth] Doctor token invalid:', err.message)
      }
    }

    return next(new Error('Authentication token or ticket required'))
  } catch (error) {
    console.error('Socket Authentication Error:', error.message)
    return next(new Error('Authentication failed: ' + error.message))
  }
}
