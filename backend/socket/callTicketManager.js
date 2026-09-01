import crypto from 'crypto'

// In-memory store for one-time call tickets
// Map<ticketId, { appointmentId, docId, docName, createdAt }>
const tickets = new Map()

// Ticket TTL: 2 minutes
const TICKET_TTL_MS = 2 * 60 * 1000

// Cleanup expired tickets every 60 seconds
setInterval(() => {
  const now = Date.now()
  for (const [id, ticket] of tickets) {
    if (now - ticket.createdAt > TICKET_TTL_MS) {
      tickets.delete(id)
    }
  }
}, 60 * 1000)

/**
 * Create a short-lived, one-time call ticket for a doctor.
 * The doctor gets this ticket via REST API (authenticated with dToken),
 * then uses it to open the frontend video call page.
 */
export const createCallTicket = (appointmentId, docId, docName) => {
  const ticketId = crypto.randomUUID()
  tickets.set(ticketId, {
    appointmentId,
    docId,
    docName,
    createdAt: Date.now()
  })
  return ticketId
}

/**
 * Validate a call ticket. Returns the ticket data if valid,
 * or null if invalid/expired. The ticket remains valid for its TTL window.
 */
export const validateAndConsumeTicket = (ticketId) => {
  const ticket = tickets.get(ticketId)
  if (!ticket) return null

  // Check expiry
  if (Date.now() - ticket.createdAt > TICKET_TTL_MS) {
    tickets.delete(ticketId)
    return null
  }

  return ticket
}
