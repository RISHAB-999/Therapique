import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { FaFacebookF, FaInstagram } from 'react-icons/fa6'
import { Mail, ArrowRight, Check } from 'lucide-react'
import linkedinIcon from '../assets/linkedin-svgrepo-com.svg'
import { toast } from 'react-toastify'

// Highly optimized typewriter text reveal (GPU accelerated, word or char level)
const TypewriterText = ({ text, className = '', delay = 0, speed = 0.025, mode = 'char', as: Component = 'span' }) => {
  const items = useMemo(() => (mode === 'char' ? Array.from(text) : text.split(' ')), [text, mode])
  
  const container = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: mode === 'char' ? speed : speed * 2.2,
        delayChildren: delay,
      },
    },
  }), [delay, speed, mode])

  const child = {
    hidden: { opacity: 0, y: 3 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.15, ease: 'easeOut' },
    },
  }

  return (
    <Component className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="inline"
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <motion.span variants={child} className="inline-block transform-gpu will-change-transform">
              {item === ' ' ? '\u00A0' : item}
            </motion.span>
            {mode !== 'char' && index < items.length - 1 && ' '}
          </React.Fragment>
        ))}
      </motion.span>
    </Component>
  )
}

const NewsLetter = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    toast.success('Thank you for subscribing to our newsletter!')
    setTimeout(() => {
      setEmail('')
      setSubscribed(false)
    }, 3000)
  }

  return (
    <section className='mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 my-4'>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className='bg-[#FAF5EE] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(70,56,48,0.04)] flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 will-change-transform'
      >
        {/* 1. Left: Newsletter Titles with Typewriter Effect */}
        <div className='text-center lg:text-left max-w-md'>
          <h4 className='font-therapique text-xl sm:text-2xl font-bold uppercase tracking-wider text-gray-900 leading-tight'>
            <TypewriterText text="Subscribe Newsletter" delay={0.2} speed={0.03} mode="char" />
          </h4>
          <p className='text-xs sm:text-sm text-gray-600 font-medium mt-1.5 leading-relaxed'>
            <TypewriterText text="Get latest information on Events, Sales & Offers." delay={0.6} speed={0.035} mode="word" />
          </p>
        </div>

        {/* 2. Center: Sleek Form with Email Input + Submit Button */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className='w-full max-w-md flex items-center bg-white border border-[#EADBCE] rounded-full p-1.5 pl-4 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition-all will-change-transform'
        >
          <Mail className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email address...'
            className='bg-transparent w-full outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 font-medium'
            required
          />
          <button
            type='submit'
            className='bg-black hover:bg-gray-800 active:scale-95 text-white px-5 sm:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs'
          >
            {subscribed ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </>
            ) : (
              <>
                <span>Submit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </motion.form>

        {/* 3. Right: Facebook, Instagram & LinkedIn (using linkedin-svgrepo-com.svg) */}
        <div className='flex items-center gap-3 shrink-0'>
          {/* Facebook */}
          <motion.a
            href='https://facebook.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Facebook'
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.7 }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className='w-10 h-10 rounded-full bg-white hover:bg-black hover:text-white text-gray-700 border border-[#EADBCE] flex items-center justify-center transition-all duration-300 shadow-2xs cursor-pointer will-change-transform'
          >
            <FaFacebookF size={15} />
          </motion.a>

          {/* Instagram */}
          <motion.a
            href='https://instagram.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Instagram'
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.82 }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className='w-10 h-10 rounded-full bg-white hover:bg-black hover:text-white text-gray-700 border border-[#EADBCE] flex items-center justify-center transition-all duration-300 shadow-2xs cursor-pointer will-change-transform'
          >
            <FaInstagram size={16} />
          </motion.a>

          {/* LinkedIn (using linkedin-svgrepo-com.svg) */}
          <motion.a
            href='https://linkedin.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='LinkedIn'
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.94 }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className='w-10 h-10 rounded-full bg-white hover:bg-black text-gray-700 hover:text-white border border-[#EADBCE] flex items-center justify-center transition-all duration-300 shadow-2xs cursor-pointer group will-change-transform'
          >
            <img 
              src={linkedinIcon} 
              alt="LinkedIn" 
              loading="lazy"
              decoding="async"
              className="w-4 h-4 object-contain group-hover:brightness-0 group-hover:invert transition-all" 
            />
          </motion.a>
        </div>

      </motion.div>
    </section>
  )
}

export default React.memo(NewsLetter)