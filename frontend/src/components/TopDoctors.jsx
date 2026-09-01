import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { motion } from "motion/react"
import { toast } from 'react-toastify'
import { SplitTextReveal, TypewriterParagraph, FadeUp, StaggerContainer, StaggerItem, ButtonPop } from './ScrollReveal'

const TopDoctors = () => {
  const [index, setIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    setIsMobile(mql.matches)
    const handler = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  const token = localStorage.getItem('token')
  const availableDocs = doctors ? doctors.filter(d => d.available) : []
  const displayedDoctors = availableDocs.length > 0 ? availableDocs.slice(0, 10) : (doctors ? doctors.slice(0, 10) : [])

  useEffect(() => {
    if (displayedDoctors.length === 0) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayedDoctors.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [displayedDoctors.length])

  return (
    <section className="py-12 text-center min-h-[70vh] mt-8 sm:mt-12 px-4 sm:px-6 overflow-hidden">
      {/* Title */}
      <SplitTextReveal 
        text="Choose Help. Not Suffering." 
        as="h2" 
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-text font-display inline-block" 
      />
      <FadeUp delay={0.1}>
        <div className="w-16 h-1 bg-peach mx-auto my-4 rounded"></div>
      </FadeUp>

      <div className="flex flex-col md:flex-row items-center justify-center mt-8 gap-12 md:gap-20 max-w-6xl mx-auto">
        {/* Image Slider with Entrance Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[500px] h-[280px] sm:h-[350px] flex items-center justify-center overflow-visible transform-gpu"
        >
          {displayedDoctors.map((c, i) => {
            const total = displayedDoctors.length
            const position = (i - index + total) % total

            let x = 0
            let scale = 0.8
            let opacity = 0
            let zIndex = 0

            const offset = isMobile ? 120 : 180
            const hiddenOffset = isMobile ? -250 : -400

            if (position === 0) {
              x = 0
              scale = 1.1
              opacity = 1
              zIndex = 10
            } else if (position === 1 && total > 1) {
              x = offset
              scale = 0.9
              opacity = isMobile ? 0 : 0.8
              zIndex = 5
            } else if (position === total - 1 && total > 2) {
              x = -offset
              scale = 0.9
              opacity = isMobile ? 0 : 0.8
              zIndex = 5
            } else {
              x = hiddenOffset
              opacity = 0
            }

            return (
              <motion.div
                key={c._id || i}
                className="absolute flex flex-col items-center cursor-pointer transform-gpu"
                animate={{ x, scale, opacity, zIndex }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ backfaceVisibility: 'hidden' }}
                onClick={() => {
                  if (position === 0) {
                    if (!token) {
                      toast.info('Please log in or create an account to book an appointment with a doctor')
                      navigate('/login', { state: { message: 'Please log in or create an account to book an appointment with a doctor', context: 'doctor' } })
                    } else {
                      navigate(`/appointment/${c._id}`)
                      window.scrollTo(0, 0)
                    }
                  }
                }}
              >
                <img
                  src={c.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop"}
                  alt={c.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop";
                  }}
                  className={`object-cover rounded-2xl shadow-md ${
                    position === 0 ? "w-44 h-56" : "w-32 h-44"
                  }`}
                />
                {position === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 text-center"
                  >
                    <h3 className="font-semibold text-lg text-text">
                      {c.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{c.speciality || c.degree}</p>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Right Content */}
        <div className="max-w-xl w-full text-center md:text-left overflow-hidden">
          <SplitTextReveal 
            text="Counselling Therapy Sessions With Licensed & Verified Experts" 
            as="h3" 
            className="text-2xl sm:text-3xl font-bold text-text mb-5 block" 
          />
          <div className="mb-6">
            <TypewriterParagraph
              delay={0.15}
              wordDelay={0.048}
              text="Highly qualified team of some of the best names in psychology who deliver improved well-being to you. Carefully vetted through a rigorous selection process. Trained and experienced in all psychotherapy techniques."
              className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed"
            />
          </div>

          {/* Features with Stagger Animation */}
          <StaggerContainer 
            staggerDelay={0.1} 
            delayChildren={0.2}
            className="flex items-center justify-center md:justify-start gap-6 sm:gap-10 mb-6 text-orange-500"
          >
            <StaggerItem y={20} className="text-center text-3xl sm:text-4xl">
              🎥
              <p className="text-sm sm:text-lg font-medium text-gray-700">Video Session</p>
            </StaggerItem>
            <StaggerItem y={20} className="text-center text-3xl sm:text-4xl">
              🎤
              <p className="text-sm sm:text-lg font-medium text-gray-700">Audio Session</p>
            </StaggerItem>
            <StaggerItem y={20} className="text-center text-3xl sm:text-4xl">
              💬
              <p className="text-sm sm:text-lg font-medium text-gray-700">Chat Session</p>
            </StaggerItem>
          </StaggerContainer>

          {/* More Info List with Stagger Animation */}
          <StaggerContainer 
            staggerDelay={0.08} 
            delayChildren={0.25}
            as="ul"
            className="space-y-2 text-text font-semibold text-sm sm:text-base md:text-lg text-left inline-block md:block"
          >
            <StaggerItem y={15} as="li" className="flex items-center gap-2">
              <span className="text-green-600 text-sm">✓</span>
              <span>English And All Regional Indian Languages</span>
            </StaggerItem>
            <StaggerItem y={15} as="li" className="flex items-center gap-2">
              <span className="text-green-600 text-sm">✓</span>
              <span>100% Private & Secure Platform</span>
            </StaggerItem>
            <StaggerItem y={15} as="li" className="flex items-center gap-2">
              <span className="text-green-600 text-sm">✓</span>
              <span>24/7 Support</span>
            </StaggerItem>
          </StaggerContainer>

          {/* Button with Pop Animation */}
          <FadeUp delay={0.35} className="mt-6">
            <ButtonPop
              onClick={() => { navigate('/doctors'); window.scrollTo(0, 0) }} 
              className="bg-black text-white px-7 py-3.5 rounded-full shadow-md hover:bg-gray-800 transition font-medium text-sm sm:text-base cursor-pointer"
            >
              View All Counselors →
            </ButtonPop>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

export default React.memo(TopDoctors)
