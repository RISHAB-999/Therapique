import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

const Banner = () => {
  const navigate = useNavigate()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className='flex rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 bg-gradient-to-b from-secondary relative transform-gpu'
    >
      {/* -------- left Side -------- */}
      <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
        <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-text'>
          <motion.p
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Book Appointment
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className='mt-4'
          >
            With 100+ Trusted Doctors
          </motion.p>
        </div>
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { navigate('/login'); window.scrollTo(0, 0) }} 
          className='bg-black text-white px-8 py-3 rounded-full shadow-md hover:bg-gray-800 transition mt-6 cursor-pointer'
        >
          Create account
        </motion.button>
      </div>

      {/* -------- Right Side (Lady Doctor Uncropped) -------- */}
      <div className='hidden md:block md:w-1/2 lg:w-[370px] relative'>
        <motion.img 
          initial={{ opacity: 0, y: 70, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className='w-full absolute bottom-0 right-0 max-w-md pointer-events-none' 
          src={assets.appointment_img} 
          alt="Doctor pointing"
          loading="lazy"
        />
      </div>
    </motion.div>
  )
}

export default Banner