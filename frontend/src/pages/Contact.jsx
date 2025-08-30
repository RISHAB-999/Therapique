import React, { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom"
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Contact = () => {
  const navigate = useNavigate()
  const { backendUrl, token } = useContext(AppContext)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user is logged in
    if (!token) {
      toast.error('Please login to submit the contact form')
      navigate('/login')
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await axios.post(backendUrl + '/api/user/contact', formData, {
        headers: { token }
      })
      
      if (data.success) {
        toast.success(data.message)
        // Reset form after successful submission
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>Us</span></p>
      </div>
      <div className='my-10 flex flex-col justify-center lg:flex-row gap-10 mb-28 text-sm'>
        <img className=' rounded-3xl shadow-xl w-full max-w-md md:max-w-lg' src={assets.contact_image} alt="" />

        <div className='flex flex-col justify-center item-center gap-6 '>
          <p className='font-semibold text-lg text-gray-600'>Our OFFICE</p>
          <p className='text-gray-500'>Hauz Khaz Main Market<br /> New Delhi-110016</p>
          <p className='text-gray-500'>Tel: (+91 ) 8920-800-490 <br /> Email: therapiue@gmail.com</p>
          <p className='font-semibold text-lg text-gray-600'>Careers at Therapique</p>
          <p className='text-gray-500'>Learn more about our teams and job openings.</p>
          <button onClick={() => { navigate('/about') }} className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Get to know us</button>
        </div>
      </div>
      <div className="flex justify-center items-center py-10 px-6 bg-[#fdfaf7]">
        <div className="w-full max-w-6xl rounded-3xl bg-gradient-to-b from-[#bce6f9] to-[#ffffff] p-10 flex flex-col lg:flex-row gap-10">

          {/* Left Section */}
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-gray-900 leading-snug">
              Need some more information? <br /> We’d love to hear from you!
            </h2>
            <p className="text-gray-600 mt-4">
              We’re ready to help. Just provide your details in the form, and we’ll get back
              to you as soon as possible with the answers that you need.
            </p>

            {/* Call Us Box */}
            <div className="mt-8 flex items-center gap-4 rounded-2xl border-2 border-gray-800 bg-white shadow-md px-6 py-4 w-fit">
              {/* Phone Icon */}
              <div className="flex items-center justify-center bg-gradient-to-tr from-[#dfeaff] to-[#ffffff] p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="black"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25
                  2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 
                  1.125 0 00-1.173.417l-.97 1.293a.75.75 
                  0 01-1.21-.09 12.035 12.035 
                  0 01-2.37-4.548.75.75 
                  0 01.45-.937l1.482-.555a1.125 
                  1.125 0 00.72-1.062V4.5A2.25 
                  2.25 0 0012.75 2.25H11.25C6.142 
                  2.25 2.25 6.142 2.25 11.25v-.75z"
                  />
                </svg>
              </div>

              {/* Text */}
              <div>
                <p className="font-semibold text-lg">Call us</p>
                <p className="text-gray-600">+91 8920800490</p>
              </div>
            </div>
          </div>

          {/* Right Section (Form) */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex flex-col lg:flex-row gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="123–456–7890"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <textarea
                name="message"
                placeholder="Details you would like to share"
                rows="4"
                value={formData.message}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              ></textarea>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact