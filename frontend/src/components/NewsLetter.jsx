import React, { useState, useMemo, useEffect, useRef, useContext } from 'react'
import { motion } from 'motion/react'
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

// Highly optimized typewriter text reveal (GPU accelerated, word or char level)
// Word wrappers with whitespace-nowrap guarantee that words like "NEWSLETTER" never break across lines
const TypewriterText = ({ text, className = '', delay = 0, speed = 0.025, mode = 'char', as: Component = 'span' }) => {
  const words = useMemo(() => text.split(' '), [text])
  
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
        viewport={{ once: true, amount: 0.05, margin: "100px 0px" }}
        variants={container}
        className="inline"
      >
        {words.map((word, wIdx) => (
          <React.Fragment key={wIdx}>
            <span className="inline-block whitespace-nowrap">
              {mode === 'char' ? (
                Array.from(word).map((char, cIdx) => (
                  <motion.span key={cIdx} variants={child} className="inline-block transform-gpu will-change-transform">
                    {char}
                  </motion.span>
                ))
              ) : (
                <motion.span variants={child} className="inline-block transform-gpu will-change-transform">
                  {word}
                </motion.span>
              )}
            </span>
            {wIdx < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </motion.span>
    </Component>
  )
}

const NewsLetter = () => {
  const { backendUrl } = useContext(AppContext) || { backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000' }
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.trim() || loading) return

    setLoading(true)
    try {
      const url = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const { data } = await axios.post(`${url}/api/user/newsletter-subscribe`, { email: email.trim() })

      if (data.success) {
        setSubscribed(true)
        toast.success(data.message || 'Thank you for subscribing to our newsletter!')
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          setEmail('')
          setSubscribed(false)
        }, 3500)
      } else {
        toast.error(data.message || 'Failed to subscribe. Please try again.')
      }
    } catch (err) {
      console.error('Newsletter error:', err)
      toast.error(err.response?.data?.message || 'Unable to subscribe. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 my-4'>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05, margin: "100px 0px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className='bg-[#FAF5EE] border border-[#EADBCE] rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(70,56,48,0.04)] flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 will-change-transform'
      >
        {/* 1. Left: Newsletter Titles with Typewriter Effect */}
        <div className='text-center lg:text-left max-w-md w-full'>
          <h4 className='font-therapique text-lg sm:text-2xl font-bold uppercase tracking-wide text-gray-900 leading-tight'>
            <TypewriterText text="Subscribe Newsletter" delay={0.2} speed={0.03} mode="char" />
          </h4>
          <p className='text-xs sm:text-sm text-gray-600 font-medium mt-1.5 leading-relaxed'>
            <TypewriterText text="Get latest information on Events, Sales & Offers." delay={0.6} speed={0.035} mode="word" />
          </p>
        </div>

        {/* 2. Center/Right: Sleek Form with Email Input + Submit Button */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.05, margin: "100px 0px" }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className='w-full max-w-md flex items-center bg-white border border-[#EADBCE] rounded-full p-1 sm:p-1.5 pl-3 sm:pl-4 shadow-xs focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition-all will-change-transform'
        >
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0 mr-1.5 sm:mr-2" />
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email...'
            className='bg-transparent w-full outline-none text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 font-medium min-w-0'
            required
          />
          <button
            type='submit'
            disabled={loading}
            className='bg-black hover:bg-gray-800 active:scale-95 text-white px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1 sm:gap-1.5 shadow-xs ml-1 disabled:opacity-60'
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting</span>
              </>
            ) : subscribed ? (
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
      </motion.div>
    </section>
  )
}

export default React.memo(NewsLetter)