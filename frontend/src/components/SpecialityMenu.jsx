import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'
import SpecialityCard from './SpecialityCard'
import { FadeUp, StaggerContainer, StaggerItem, SplitTextReveal } from './ScrollReveal'

const SpecialityMenu = () => {
  return (
    <div className='flex flex-col items-center gap-4 py-6 sm:py-10 text-gray-800' id='speciality'>
      <div className="text-center">
        <SplitTextReveal 
          text="Find by Speciality" 
          as="h2" 
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-therapique text-gray-900 inline-block" 
        />
      </div>

      <FadeUp delay={0.15} className="text-center max-w-xl px-4">
        <p className='text-gray-600 text-sm sm:text-base leading-relaxed'>
          Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
        </p>
      </FadeUp>

      {/* Desktop Grid Layout (sm and up) */}
      <StaggerContainer 
        staggerDelay={0.07} 
        delayChildren={0.1} 
        className='hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5 max-w-6xl px-2 sm:px-4 mt-4 w-full'
      >
        {specialityData.map((item, index) => (
          <StaggerItem key={index} y={24}>
            <SpecialityCard item={item} index={index} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Mobile Stack Layout: 1 card at a time, each card stacks over the previous one on scroll */}
      <div className='flex sm:hidden flex-col w-full px-4 mt-4 pb-12' style={{ gap: '2rem' }}>
        {specialityData.map((item, index) => (
          <div
            key={index}
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
                <img
                  src={item.image}
                  alt={item.speciality}
                  loading="lazy"
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu
