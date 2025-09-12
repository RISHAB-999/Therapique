import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [state, setState] = useState('Sign Up')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

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
      navigate('/')
    }
  }, [token])

  return (
    <>
      <div className="min-h-[90vh] flex flex-col items-center justify-center px-4">
        <form
          onSubmit={onSubmitHandler}
          className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col gap-5"
        >
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {state === 'Sign Up'
                ? 'Please sign up to book appointments'
                : 'Please login to continue'}
            </p>
          </div>

          {/* Inputs */}
          {state === 'Sign Up' && (
            <div className="w-full">
              <label className="text-sm font-medium">Full Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                required
                placeholder="Enter your full name"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-text outline-none"
              />
            </div>
          )}
          <div className="w-full">
            <label className="text-sm font-medium">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              required
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-text outline-none"
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-medium">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              required
              placeholder="Enter your password"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-text outline-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition"
          >
            {state === 'Sign Up' ? 'Create Account' : 'Login'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-600">
            {state === 'Sign Up' ? (
              <>
                Already have an account?{' '}
                <span
                  onClick={() => setState('Login')}
                  className="text-text font-medium hover:underline cursor-pointer"
                >
                  Login
                </span>
              </>
            ) : (
              <>
                Don’t have an account?{' '}
                <span
                  onClick={() => setState('Sign Up')}
                  className="text-text font-medium hover:underline cursor-pointer"
                >
                  Sign Up
                </span>
              </>
            )}
          </p>
        </form>
        <span className="flex mt-10">
          <p>Copyright @Therapique 2025 | </p>
          <Link to="/" className="underline ml-1">Privacy Policy</Link>
        </span>
      </div>
    </>
  )
}

export default Login
