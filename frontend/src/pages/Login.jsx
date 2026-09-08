import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import doctorIcon from '../assets/doctor-svgrepo-com.svg'
import bookIcon from '../assets/book-svgrepo-com.svg'
import cartIcon from '../assets/cart-svgrepo-com.svg'
import orderIcon from '../assets/order-svgrepo-com.svg'
import coinIcon from '../assets/coin-svgrepo-com.svg'
import profileIcon from '../assets/profile-svgrepo-com.svg'

const Login = () => {
  const [state, setState] = useState('Sign Up')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const redirectTitle = location.state?.title
  const redirectMessage = location.state?.message
  const redirectContext = location.state?.context
  const { backendUrl, token, setToken } = useContext(AppContext)

  const getContextConfig = () => {
    const ctx = (redirectContext || '').toLowerCase()
    const msg = (redirectMessage || '').toLowerCase()
    const ttl = (redirectTitle || '').toLowerCase()

    if (ctx === 'doctor' || msg.includes('doctor') || msg.includes('appointment')) {
      return {
        icon: doctorIcon,
        title: redirectTitle || 'Doctor Consultation',
        alt: 'Doctor'
      }
    }
    if (ctx === 'consultations' || msg.includes('consultation')) {
      return {
        icon: doctorIcon,
        title: redirectTitle || 'My Consultations',
        alt: 'Consultations'
      }
    }
    if (ctx === 'cart' || msg.includes('cart') || ttl.includes('cart')) {
      return {
        icon: cartIcon,
        title: redirectTitle || 'Shopping Cart',
        alt: 'Cart'
      }
    }
    if (ctx === 'orders' || msg.includes('order') || msg.includes('track') || ttl.includes('order')) {
      return {
        icon: orderIcon,
        title: redirectTitle || 'Order Tracking',
        alt: 'Orders'
      }
    }
    if (ctx === 'coins' || msg.includes('coin') || msg.includes('token') || msg.includes('wallet') || ttl.includes('token')) {
      return {
        icon: coinIcon,
        title: redirectTitle || 'Token Wallet & Shop',
        alt: 'Token Wallet'
      }
    }
    if (ctx === 'profile' || msg.includes('profile') || ttl.includes('profile')) {
      return {
        icon: profileIcon,
        title: redirectTitle || 'User Profile',
        alt: 'Profile'
      }
    }
    if (ctx === 'videocall' || msg.includes('video') || ttl.includes('video')) {
      return {
        icon: doctorIcon,
        title: redirectTitle || 'Video Consultation',
        alt: 'Video Consultation'
      }
    }
    if (ctx === 'checkout' || msg.includes('delivery') || msg.includes('address')) {
      return {
        icon: cartIcon,
        title: redirectTitle || 'Delivery & Checkout',
        alt: 'Checkout'
      }
    }
    return {
      icon: bookIcon,
      title: redirectTitle || 'Therapique Bookstore',
      alt: 'Bookstore'
    }
  }

  const contextConfig = getContextConfig()

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    if (state === 'Sign Up') {
      const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })

      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
      } else {
        toast.error(data.message)
      }
    } else {
      const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
      } else {
        toast.error(data.message)
      }
    }
  }

  useEffect(() => {
    if (token) {
      const fromPath = location.state?.from?.pathname || '/'
      navigate(fromPath)
    }
  }, [token])

  return (
    <>
      <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-8">
        <form
          onSubmit={onSubmitHandler}
          autoComplete="off"
          className="bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] rounded-3xl p-8 w-full max-w-md flex flex-col gap-5 border border-[#EADBCE]/60"
        >
          {/* Contextual Notice Banner */}
          {redirectMessage && (
            <div className="bg-[#FAF5EE] border border-[#EADBCE] rounded-2xl p-3.5 flex items-center gap-3.5 text-left shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-[#EADBCE] shadow-2xs p-2">
                <img 
                  src={contextConfig.icon} 
                  alt={contextConfig.alt} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {contextConfig.title}
                </p>
                <p className="text-[11px] text-gray-600 font-medium mt-0.5 leading-snug">
                  {redirectMessage}
                </p>
              </div>
            </div>
          )}

          {/* Heading */}
          <div className="text-center">
            <h2 className="font-therapique text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
              {state === 'Sign Up'
                ? 'Please sign up to access your personal dashboard and resources'
                : 'Please login to continue'}
            </p>
          </div>

          {/* Inputs */}
          {state === 'Sign Up' && (
            <div className="w-full">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Full Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                required
                placeholder="Enter your full name"
                className="mt-1.5 w-full px-4 py-2.5 bg-[#FAF5EE]/40 border border-[#EADBCE] rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
          )}

          <div className="w-full">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              required
              placeholder="Enter your email"
              className="mt-1.5 w-full px-4 py-2.5 bg-[#FAF5EE]/40 border border-[#EADBCE] rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>

          <div className="w-full">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Password</label>
            <div className="relative flex items-center mt-1.5">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                className="w-full pl-4 pr-11 py-2.5 bg-[#FAF5EE]/40 border border-[#EADBCE] rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer rounded-lg hover:bg-gray-100/60 flex items-center justify-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-800" />
                ) : (
                  <EyeOff className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="bg-black text-white font-bold text-sm px-6 py-3 rounded-full shadow-sm hover:bg-gray-800 active:scale-98 transition-all cursor-pointer mt-1"
          >
            {state === 'Sign Up' ? 'Create Account' : 'Login'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-0.5">
            <div className="flex-grow h-px bg-[#EADBCE]"></div>
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">or</span>
            <div className="flex-grow h-px bg-[#EADBCE]"></div>
          </div>

          {/* Toggle */}
          <p className="text-center text-xs sm:text-sm text-gray-600 font-medium">
            {state === 'Sign Up' ? (
              <>
                Already have an account?{' '}
                <span
                  onClick={() => {
                    setState('Login')
                    setEmail('')
                    setPassword('')
                    setName('')
                    setShowPassword(false)
                  }}
                  className="text-gray-900 font-bold hover:underline cursor-pointer ml-1"
                >
                  Login
                </span>
              </>
            ) : (
              <>
                Don’t have an account?{' '}
                <span
                  onClick={() => {
                    setState('Sign Up')
                    setEmail('')
                    setPassword('')
                    setName('')
                    setShowPassword(false)
                  }}
                  className="text-gray-900 font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </span>
              </>
            )}
          </p>
        </form>

        <span className="flex items-center text-xs sm:text-sm text-gray-500 font-medium mt-8">
          <p>Copyright @Therapique 2026 | </p>
          <Link to="/privacy-terms" className="underline ml-1 text-gray-700 hover:text-black transition-colors">
            Privacy Policy
          </Link>
        </span>
      </div>
    </>
  )
}

export default Login
