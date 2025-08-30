import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom"
const About = () => {
  const navigate = useNavigate()
  return (
    <div>
      <div className='text-center font-heading text-4xl md:text-5xl  pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-700 font-medium'>Therapique</span></p>
      </div>

      <div className='my-10 flex text-center flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px] rounded-3xl shadow-xl w-full max-w-md md:max-w-lg' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg mb-6 leading-relaxed">
            At <span className="font-semibold text-gray-900">Therapique</span>, we
            are committed to helping individuals overcome the weight of depression
            and mental health struggles by making therapy accessible and personal.
          </p>
          <b className='font-heading text-2xl md:text-3xl  text-gray-800'>Our Vision</b>
          <p> Our mission is to connect people with compassionate, licensed
            professionals who can guide them toward healing, resilience, and
            lasting well-being.</p>
          {/* CTA Button */}
          <div className="flex justify-center">
            <button onClick={() => { navigate('/contact') }} className="group inline-flex items-center justify-between px-4 py-2 bg-background text-text rounded-full border border-text transition hover:bg-black hover:text-white max-w-fit">
              <span className="text-sm md:text-base font-medium whitespace-nowrap">
                Learn more about our team
              </span>
              <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-black text-white transition group-hover:bg-white group-hover:text-black ml-3">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
      <section className="bg-[#fdf7f3] py-20 px-6 text-center">
        <blockquote className="max-w-3xl mx-auto relative">
          <p className="text-2xl md:text-3xl italic text-gray-800 leading-relaxed">
            <span className="absolute -left-6 top-0 text-4xl text-gray-400">“</span>
            Our mission at <span className="font-semibold text-gray-900">Therapique </span>
            is to empower individuals to rise above depression, anxiety, and
            emotional challenges by making therapy accessible, personal,
            and stigma-free. We believe that healing begins when connection
            becomes easy.
            <span className="absolute -right-6 bottom-0 text-4xl text-gray-400">”</span>
          </p>
        </blockquote>
      </section>
      <section className="bg-[#fdf7f3] px-6 my-12 font-body">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-center text-gray-900 mb-8 tracking-tight">
            Who we are
          </h2>

          <p className="text-gray-700 text-lg text-center max-w-3xl mx-auto mb-16 leading-relaxed">
            At <span className="font-semibold text-gray-900 font-heading">Therapique</span>,
            we are more than just a therapy platform — we are a community dedicated
            to improving mental well-being. We connect individuals with trusted,
            compassionate therapists who understand their struggles and guide
            them toward healing and growth.
          </p>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-7 text-lg leading-relaxed text-gray-800">
              <p>
                Mental health should never feel out of reach. That’s why we’ve
                built Therapique to make therapy sessions easier to access, whether
                you’re facing depression, stress, or simply looking for emotional
                support. Our platform bridges the gap between individuals and
                licensed professionals, giving you a safe space to open up and
                find support.
              </p>
              <p>
                With a growing network of expert therapists, we’re creating a future
                where mental health care is not a privilege, but a right. At
                <span className="font-heading font-medium"> Therapique</span>,
                your journey toward peace of mind and resilience starts here.
              </p>
            </div>

            {/* Right Image */}
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Therapist supporting client"
                className="rounded-3xl shadow-xl w-full max-w-md md:max-w-lg"
              />
            </div>
          </div>
        </div>
      </section>
      <div className='text-center font-heading text-4xl md:text-5xl my-10'>
        <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
      </div>
      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Efficiency:</b>
          <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Convenience:</b>
          <p>Access to a network of trusted healthcare professionals in your area.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Personalization:</b>
          <p>Tailored recommendations and reminders to help you stay on top of your health.</p>
        </div>
      </div>
    </div>
  )
}

export default About
