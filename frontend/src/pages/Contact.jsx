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
      <section
        className="py-20 px-6 rounded-t-[40%] mt-20
  bg-[linear-gradient(to_bottom,theme(colors.violet.400),theme(colors.violet.200),theme(colors.violet.50),theme(colors.background))] 
  text-text"
      >

        <div className="max-w-5xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-4xl mt-10 md:text-5xl font-heading font-bold text-gray-900 mb-6">
            How we work
          </h2>

          {/* Sub-heading */}
          <p className="text-gray-700 font-body text-lg md:text-xl leading-relaxed max-w-4xl mx-auto mb-10">
            We follow a structured yet flexible approach designed to make collaboration smooth and results-driven.
            From understanding your vision to delivering the final outcome, our goal is to keep the process
            clear, transparent, and aligned with your expectations.
          </p>

          {/* Paragraphs */}
          <div className="space-y-6 text-base md:text-lg font-body text-gray-600 leading-relaxed max-w-4xl mx-auto mb-14">
            <p>
              Every project begins with an in-depth discovery session where we listen carefully to your
              ideas, challenges, and goals. By identifying your priorities from the start, we can
              create a plan that feels tailor-made — not just a generic solution. This ensures
              that the foundation we build together is solid and focused on what truly matters.
            </p>
            <p>
              Once we move forward, our team works in well-defined stages with consistent check-ins
              and progress updates. This way, you always have visibility into what’s happening,
              and you can confidently share feedback along the way. Our structured process
              balances efficiency with creativity, so the end result not only meets your needs
              but also exceeds your expectations.
            </p>
          </div>

          {/* Image */}
          <div className="flex justify-center w-screen relative left-1/2 right-1/2 -mx-[50vw] ">
            <img
              src="https://images.unsplash.com/photo-1573496267526-08a69e46a409?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Team discussion"
              className="rounded-2xl w-full max-w-6xl h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Contact Us Box */}
      <div className="flex justify-center items-center py-10 px-6">
        <div className="w-full max-w-6xl rounded-3xl bg-gradient-to-b from-[#bce6f9] to-background p-10 flex flex-col lg:flex-row gap-10">

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