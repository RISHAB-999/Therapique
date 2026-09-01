import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const ProtectedRoute = ({ 
  children, 
  message = 'Please log in or create an account to continue', 
  context = 'general',
  title = ''
}) => {
  const { token } = useContext(AppContext)
  const location = useLocation()

  if (!token) {
    toast.info(message, { toastId: 'auth-required' })
    return <Navigate to="/login" state={{ from: location, message, context, title }} replace />
  }

  return children
}

export default ProtectedRoute
