import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import { specialityData } from '../assets/assets'
import SpecialityCard from './SpecialityCard'
import { SplitTextReveal, TypewriterParagraph } from './ScrollReveal'

const SpecialityMenu = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const animState = isInView ? 'visible' : 'hidden'

  return (
    <div
      ref={sectionRef}
      className='flex flex-col items-center gap-4 py-6 sm:py-10 text-gray-800'
      id='speciality'
    >
      {/* 1. Title with Word-by-Word Reveal (Matching Pic 2 / Header) */}
      <div className="text-center">
        <SplitTextReveal 
          text="Find by Speciality" 
          as="h2" 
          wordDelay={0.06}
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-therapique text-gray-900 inline-block" 
          animate={animState}
        />
      </div>

      {/* 2. Subtitle / Description with TypewriterParagraph (Matching Pic 2 / Header) */}
      <div className="text-center max-w-xl px-4">
        <TypewriterParagraph
          delay={0.2}
          wordDelay={0.048}
          text="Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free."
          className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium"
          animate={animState}
        />
      </div>

      {/* 3. Desktop Grid Layout (sm and up) - Cards & Photos animate into their places */}
      <div className='hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 max-w-6xl px-2 sm:px-4 mt-4 w-full'>
        {specialityData.map((item, index) => (
          <SpecialityCard
            key={index}
            item={item}
            index={index}
            isInView={isInView}
          />
        ))}
      </div>

      {/* 4. Mobile Stack Layout: Cards & Photos animate into place */}
      <div className='flex sm:hidden flex-col w-full px-4 mt-4 pb-12' style={{ gap: '2rem' }}>
        {specialityData.map((item, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={{
              hidden: { opacity: 0, y: 45, scale: 0.9 },
              visible: (i) => ({
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.6,
                  delay: 0.3 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                },
              }),
            }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className='sticky w-full max-w-[340px] mx-auto'
            style={{
              top: `${90 + index * 6}px`,
              zIndex: index + 10,
            }}
          >
            <Link 
              onClick={() => scrollTo(0, 0)} 
              to={`/doctors/${item.speciality}`}
              className="block bg-white rounded-3xl overflow-hidden shadow-xl shadow-stone-900/15 border border-[#EADBCE] group active:scale-[0.98] transition-transform duration-200"
            >
              <div className="relative overflow-hidden w-full h-52 bg-[#FAF5EE]">
                <motion.img
                  src={item.image}
                  alt={item.speciality}
                  loading="lazy"
                  custom={index}
                  variants={{
                    hidden: { scale: 1.2, opacity: 0.65 },
                    visible: (i) => ({
                      scale: 1,
                      opacity: 1,
                      transition: {
                        duration: 0.75,
                        delay: 0.35 + i * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }),
                  }}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-semibold text-white tracking-wide">
                  {index + 1} / {specialityData.length}
                </div>
              </div>
              <div className="p-4 bg-white text-center flex flex-col items-center justify-between min-h-[80px]">
                <h3 className="text-base font-serif font-bold text-gray-900 leading-snug">
                  {item.speciality}
                </h3>
                <span className="text-xs text-orange-600 font-semibold mt-1.5 inline-flex items-center gap-1">
                  View Specialists →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu

